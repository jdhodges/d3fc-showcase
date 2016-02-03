/*global window */
import d3 from 'd3';
import fc from 'd3fc';
import chart from './chart/chart';
import menu from './menu/menu';
import util from './util/util';
import event from './event';
import dataInterface from './data/dataInterface';
import notification from './notification/notification';
import messageModel from './model/notification/message';
import dataModel from './model/data/data';
import coinbaseStreamingErrorResponseFormatter from './data/coinbase/streaming/errorResponseFormatter';
import initialiseModel from './initialiseModel';
import getCoinbaseProducts from './data/coinbase/getProducts';
import formatCoinbaseProducts from './data/coinbase/formatProducts';

export default function() {

    var appTemplate = '<div class="container-fluid"> \
        <div id="notifications"></div> \
        <div id="loading-status-message"></div> \
        <div class="row head-menu head-row"> \
            <div class="col-md-12 head-sub-row"> \
                <div id="product-dropdown" class="dropdown product-dropdown"></div> \
                <div class="selectors"> \
                    <div class="series-dropdown dropdown selector-dropdown"></div> \
                    <div class="indicator-dropdown dropdown selector-dropdown"></div> \
                    <div id="mobile-period-selector" class="dropdown"></div> \
                </div> \
                <div id="period-selector"></div> \
                <span id="clear-indicators" class="icon bf-icon-delete delete-button"></span> \
            </div> \
        </div> \
        <div class="row primary-row"> \
            <div id="charts" class="col-md-12"> \
                <div id="charts-container"> \
                    <svg id="primary-container"></svg> \
                    <div id="secondaries-container"></div> \
                    <div class="x-axis-row"> \
                        <svg id="x-axis-container"></svg> \
                    </div> \
                    <div id="navbar-row"> \
                        <svg id="navbar-container"></svg> \
                        <svg id="navbar-reset"></svg> \
                    </div> \
                </div> \
                <div id="overlay"> \
                    <div id="overlay-primary-container"> \
                        <div id="overlay-primary-head"> \
                            <div class="selectors"> \
                                <div id="mobile-product-dropdown" class="dropdown"></div> \
                                <div class="series-dropdown dropdown selector-dropdown"></div> \
                                <div class="indicator-dropdown dropdown selector-dropdown"></div> \
                            </div> \
                            <div id="legend"> \
                                <svg id="tooltip"></svg> \
                            </div> \
                        </div> \
                        <div id="overlay-primary-bottom"> \
                            <div class="edit-indicator-container"></div> \
                        </div> \
                    </div> \
                    <div id="overlay-secondaries-container"></div> \
                    <div class="x-axis-row"></div> \
                    <div id="overlay-navbar-row"></div> \
                </div> \
            </div> \
        </div> \
    </div>';

    var app = {};

    var containers;

    var model = initialiseModel();

    var _dataInterface = initialiseDataInterface();

    var externalHistoricFeedErrorCallback;

    var charts = {
        primary: undefined,
        secondaries: [],
        xAxis: chart.xAxis(),
        navbar: undefined,
        legend: chart.legend()
    };

    var overlay;
    var headMenu;
    var navReset;
    var selectors;
    var toastNotifications;

    var fetchCoinbaseProducts = false;

    var proportionOfDataToDisplayByDefault = 0.2;

    var firstRender = true;
    function renderInternal() {
        if (firstRender) {
            firstRender = false;
        }
        if (layoutRedrawnInNextRender) {
            containers.suspendLayout(false);
        }

        containers.primary.datum(model.primaryChart)
            .call(charts.primary);

        containers.legend.datum(model.legend)
            .call(charts.legend);

        containers.secondaries.datum(model.secondaryChart)
            .call(charts.secondaries);

        containers.xAxis.datum(model.xAxis)
            .call(charts.xAxis);

        containers.navbar.datum(model.nav)
            .call(charts.navbar);

        containers.app.select('#navbar-reset')
            .datum(model.navReset)
            .call(navReset);

        containers.app.select('.head-menu')
            .datum(model.headMenu)
            .call(headMenu);

        containers.app.selectAll('.selectors')
            .datum(model.selectors)
            .call(selectors);

        containers.app.select('#notifications')
            .datum(model.notificationMessages)
            .call(toastNotifications);

        containers.overlay.datum(model.overlay)
            .call(overlay);

        if (layoutRedrawnInNextRender) {
            containers.suspendLayout(true);
            layoutRedrawnInNextRender = false;
        }
    }

    var render = fc.util.render(renderInternal);

    var layoutRedrawnInNextRender = true;

    function updateLayout() {
        layoutRedrawnInNextRender = true;
        util.layout(containers, charts);
    }

    function initialiseResize() {
        d3.select(window).on('resize', function() {
            updateLayout();
            render();
        });
    }

    function addNotification(message) {
        model.notificationMessages.messages.unshift(messageModel(message));
    }

    function onViewChange(domain) {
        var viewDomain = [domain[0], domain[1]];
        model.primaryChart.viewDomain = viewDomain;
        model.secondaryChart.viewDomain = viewDomain;
        model.xAxis.viewDomain = viewDomain;
        model.nav.viewDomain = viewDomain;

        var visibleData = util.domain.filterDataInDateRange(viewDomain, model.data);
        model.primaryChart.visibleData = visibleData;
        model.secondaryChart.visibleData = visibleData;

        var trackingLatest = util.domain.trackingLatestData(
            model.primaryChart.viewDomain,
            model.primaryChart.data);
        model.primaryChart.trackingLatest = trackingLatest;
        model.secondaryChart.trackingLatest = trackingLatest;
        model.nav.trackingLatest = trackingLatest;
        model.navReset.trackingLatest = trackingLatest;
        render();
    }

    function onPrimaryIndicatorChange(indicator) {
        indicator.isSelected = !indicator.isSelected;
        updatePrimaryChartIndicators();
        render();
    }

    function onSecondaryChartChange(_chart) {
        _chart.isSelected = !_chart.isSelected;
        updateSecondaryCharts();
        render();
    }

    function onCrosshairChange(dataPoint) {
        model.legend.data = dataPoint;
        render();
    }

    function onStreamingFeedCloseOrError(streamingEvent, source) {
        var message;
        if (source.streamingNotificationFormatter) {
            message = source.streamingNotificationFormatter(streamingEvent);
        } else {
            // #515 (https://github.com/ScottLogic/BitFlux/issues/515)
            // (TODO) prevents errors when formatting streaming close/error messages when product changes.
            // As we only have a coinbase streaming source at the moment, this is a suitable fix for now
            message = coinbaseStreamingErrorResponseFormatter(streamingEvent);
        }
        if (message) {
            addNotification(message);
            render();
        }
    }

    function resetToLatest() {
        var data = model.primaryChart.data;
        var dataDomain = fc.util.extent()
            .fields('date')(data);
        var navTimeDomain = util.domain.moveToLatest(
            model.primaryChart.discontinuityProvider,
            dataDomain,
            data,
            proportionOfDataToDisplayByDefault);
        onViewChange(navTimeDomain);
    }

    function loading(isLoading, error) {
        var spinner = '<div class="spinner"></div>';
        var obscure = arguments.length > 1 || isLoading;

        var errorMessage = '';
        if (error && error.length) {
            errorMessage = '<div class="content alert alert-info">' + error + '</div>';
        }
        containers.app.select('#loading-status-message')
            .classed('hidden', !obscure)
            .html(error ? errorMessage : spinner);
    }

    function updateModelData(data) {
        model.data = data;
        model.primaryChart.data = data;
        model.secondaryChart.data = data;
        model.nav.data = data;
    }

    function updateDiscontinuityProvider(productSource) {
        var discontinuityProvider = productSource.discontinuityProvider;

        model.xAxis.discontinuityProvider = discontinuityProvider;
        model.nav.discontinuityProvider = discontinuityProvider;
        model.primaryChart.discontinuityProvider = discontinuityProvider;
        model.secondaryChart.discontinuityProvider = discontinuityProvider;
    }

    function updateModelSelectedProduct(product) {
        model.headMenu.selectedProduct = product;
        model.primaryChart.product = product;
        model.secondaryChart.product = product;
        model.legend.product = product;
        model.overlay.selectedProduct = product;

        updateDiscontinuityProvider(product.source);
    }

    function updateModelSelectedPeriod(period) {
        model.headMenu.selectedPeriod = period;
        model.xAxis.period = period;
        model.legend.period = period;
    }

    function changeProduct(product) {
        loading(true);
        updateModelSelectedProduct(product);
        updateModelSelectedPeriod(product.periods[0]);
        _dataInterface(product.periods[0].seconds, product);
    }

    function initialisePrimaryChart() {
        return chart.primary()
            .on(event.crosshairChange, onCrosshairChange)
            .on(event.viewChange, onViewChange);
    }

    function initialiseSecondaries() {
        return chart.multiChart()
            .on(event.viewChange, function(domain) {
                onViewChange(domain);
            });
    }

    function initialiseNav() {
        return chart.nav()
            .on(event.viewChange, onViewChange);
    }

    function initialiseNavReset() {
        return menu.navigationReset()
            .on(event.resetToLatest, resetToLatest);
    }

    function initialiseDataInterface() {
        return dataInterface()
            .on(event.newTrade, function(data, source) {
                updateModelData(data);
                if (model.primaryChart.trackingLatest) {
                    var newDomain = util.domain.moveToLatest(
                        model.primaryChart.discontinuityProvider,
                        model.primaryChart.viewDomain,
                        model.primaryChart.data);
                    onViewChange(newDomain);
                }
            })
            .on(event.historicDataLoaded, function(data, source) {
                loading(false);
                updateModelData(data);
                model.legend.data = null;
                resetToLatest();
                updateLayout();
            })
            .on(event.historicFeedError, function(err, source) {
                if (externalHistoricFeedErrorCallback) {
                    var error = externalHistoricFeedErrorCallback(err) || true;
                    loading(false, error);
                } else {
                    loading(false, 'Error loading data. Please make your selection again, or refresh the page.');
                    var responseText = '';
                    try {
                        var responseObject = JSON.parse(err.responseText);
                        var formattedMessage = source.historicNotificationFormatter(responseObject);
                        if (formattedMessage) {
                            responseText = '. ' + formattedMessage;
                        }
                    } catch (e) {
                        responseText = '';
                    }
                    var statusText = err.statusText || 'Unknown reason.';
                    var message = 'Error getting historic data: ' + statusText + responseText;

                    addNotification(message);
                }
                render();
            })
            .on(event.streamingFeedError, onStreamingFeedCloseOrError)
            .on(event.streamingFeedClose, onStreamingFeedCloseOrError);
    }

    function initialiseHeadMenu() {
        return menu.head()
            .on(event.dataProductChange, function(product) {
                changeProduct(product.option);
                render();
            })
            .on(event.dataPeriodChange, function(period) {
                loading(true);
                updateModelSelectedPeriod(period.option);
                _dataInterface(period.option.seconds);
                render();
            })
            .on(event.clearAllPrimaryChartIndicatorsAndSecondaryCharts, function() {
                model.primaryChart.indicators.forEach(deselectOption);
                model.secondaryChart.indicators.forEach(deselectOption);

                updatePrimaryChartIndicators();
                updateSecondaryCharts();
                render();
            });
    }

    function selectOption(option, options) {
        options.forEach(function(_option) {
            _option.isSelected = false;
        });
        option.isSelected = true;
    }

    function deselectOption(option) { option.isSelected = false; }

    function initialiseSelectors() {
        return menu.selectors()
            .on(event.primaryChartSeriesChange, function(series) {
                model.primaryChart.series = series;
                selectOption(series, model.selectors.seriesSelector.options);
                render();
            })
            .on(event.primaryChartIndicatorChange, onPrimaryIndicatorChange)
            .on(event.secondaryChartChange, onSecondaryChartChange);
    }

    function updatePrimaryChartIndicators() {
        model.primaryChart.indicators =
            model.selectors.indicatorSelector.options.filter(function(option) {
                return option.isSelected && option.isPrimary;
            });

        model.headMenu.primaryIndicators = model.primaryChart.indicators;
        model.overlay.primaryIndicators = model.primaryChart.indicators;
    }

    function updateSecondaryChartModels() {
        model.secondaryChart.indicators = model.selectors.indicatorSelector.options.filter(function(option) {
            return option.isSelected && !option.isPrimary;
        });

        charts.secondaries.charts(model.secondaryChart.indicators.map(function(indicator) {
            return indicator.option;
        }));

        model.headMenu.secondaryIndicators = model.secondaryChart.indicators;
        model.overlay.secondaryIndicators = model.secondaryChart.indicators;
    }

    function updateSecondaryCharts() {
        updateSecondaryChartModels();
        updateLayout();
    }

    function initialiseOverlay() {
        return menu.overlay()
            .on(event.primaryChartIndicatorChange, onPrimaryIndicatorChange)
            .on(event.secondaryChartChange, onSecondaryChartChange)
            .on(event.dataProductChange, function(product) {
                changeProduct(product.option);
                render();
            });
    }

    function onNotificationClose(id) {
        model.notificationMessages.messages = model.notificationMessages.messages.filter(function(message) { return message.id !== id; });
        render();
    }

    function initialiseNotifications() {
        return notification.toast()
            .on(event.notificationClose, onNotificationClose);
    }

    function addCoinbaseProducts(error, bitcoinProducts) {
        if (error) {
            var statusText = error.statusText || 'Unknown reason.';
            var message = 'Error retrieving Coinbase products: ' + statusText;
            model.notificationMessages.messages.unshift(messageModel(message));
        } else {
            var defaultPeriods = [model.periods.hour1, model.periods.day1];
            var productPeriodOverrides = d3.map();
            productPeriodOverrides.set('BTC-USD', [model.periods.minute1, model.periods.minute5, model.periods.hour1, model.periods.day1]);
            var formattedProducts = formatCoinbaseProducts(bitcoinProducts, model.sources.bitcoin, defaultPeriods, productPeriodOverrides);
            model.headMenu.products = model.headMenu.products.concat(formattedProducts);
            model.overlay.products = model.headMenu.products;
        }

        render();
    }

    app.fetchCoinbaseProducts = function(x) {
        if (!arguments.length) {
            return fetchCoinbaseProducts;
        }
        fetchCoinbaseProducts = x;
        return app;
    };

    app.changeQuandlProduct = function(productString) {
        var product = dataModel.product(productString, productString, [model.periods.day1], model.sources.quandl, '.3s');
        var existsInHeadMenuProducts = model.headMenu.products.some(function(p) { return p.id === product.id; });
        var existsInOverlayProducts = model.overlay.products.some(function(p) { return p.id === product.id; });

        if (!existsInHeadMenuProducts) {
            model.headMenu.products.push(product);
        }

        if (!existsInOverlayProducts) {
            model.overlay.products.push(product);
        }

        changeProduct(product);

        if (!firstRender) {
            render();
        }
    };

    app.proportionOfDataToDisplayByDefault = function(x) {
        if (!arguments.length) {
            return proportionOfDataToDisplayByDefault;
        }
        proportionOfDataToDisplayByDefault = x;
        return app;
    };

    app.historicFeedErrorCallback = function(x) {
        if (!arguments.length) {
            return externalHistoricFeedErrorCallback;
        }
        externalHistoricFeedErrorCallback = x;
        return app;
    };

    app.indicators = function(x) {
        if (!arguments.length) {
            var indicators = [];
            model.selectors.indicatorSelector.options.forEach(function(option) {
                if (option.isSelected) {
                    indicators.push(option.valueString);
                }
            });
            return indicators;
        }

        model.selectors.indicatorSelector.options.forEach(function(indicator) {
            indicator.isSelected = x.some(function(indicatorValueStringToShow) { return indicatorValueStringToShow === indicator.valueString; });
        });

        updatePrimaryChartIndicators();
        if (!firstRender) {
            updateSecondaryCharts();
            render();
        } else {
            updateSecondaryChartModels();
        }

        return app;
    };

    app.run = function(element) {
        if (!element) {
            throw new Error('An element must be specified when running the application.');
        }

        var appContainer = d3.select(element);
        appContainer.html(appTemplate);

        var chartsAndOverlayContainer = appContainer.select('#charts');
        var chartsContainer = appContainer.select('#charts-container');
        var overlayContainer = appContainer.select('#overlay');
        containers = {
            app: appContainer,
            charts: chartsContainer,
            chartsAndOverlay: chartsAndOverlayContainer,
            primary: chartsContainer.select('#primary-container'),
            secondaries: chartsContainer.select('#secondaries-container'),
            xAxis: chartsContainer.select('#x-axis-container'),
            navbar: chartsContainer.select('#navbar-container'),
            overlay: overlayContainer,
            overlaySecondaries: overlayContainer.selectAll('#overlay-secondaries-container'),
            legend: appContainer.select('#legend'),
            suspendLayout: function(value) {
                var self = this;
                Object.keys(self).forEach(function(key) {
                    if (typeof self[key] !== 'function') {
                        self[key].layoutSuspended(value);
                    }
                });
            }
        };

        charts.primary = initialisePrimaryChart();
        charts.secondaries = initialiseSecondaries();
        charts.navbar = initialiseNav();

        headMenu = initialiseHeadMenu();
        navReset = initialiseNavReset();
        selectors = initialiseSelectors();
        overlay = initialiseOverlay();
        toastNotifications = initialiseNotifications();

        updateLayout();
        initialiseResize();
        _dataInterface(model.headMenu.selectedPeriod.seconds, model.headMenu.selectedProduct);

        if (fetchCoinbaseProducts) {
            getCoinbaseProducts(addCoinbaseProducts);
        } else if (model.sources.bitcoin) {
            delete model.sources.bitcoin;
        }
    };

    fc.util.rebind(app, model.sources.quandl.historicFeed, {
        quandlApiKey: 'apiKey'
    });

    fc.util.rebind(app, _dataInterface, {
        periodsOfDataToFetch: 'candlesOfData'
    });

    return app;
}
