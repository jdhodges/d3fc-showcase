/*global window */
import d3 from 'd3';
import fc from 'd3fc';
import chart from './chart/chart';
import model from './model/model';
import menu from './menu/menu';
import util from './util/util';
import event from './event';
import dataInterface from './data/dataInterface';

export default function() {

    var app = {};

    var appContainer = d3.select('#app-container');
    var chartsContainer = appContainer.select('#charts-container');
    var overlay = appContainer.select('#overlay');
    var containers = {
        app: appContainer,
        charts: chartsContainer,
        primary: chartsContainer.select('#primary-container'),
        secondaries: chartsContainer.selectAll('.secondary-container'),
        xAxis: chartsContainer.select('#x-axis-container'),
        navbar: chartsContainer.select('#navbar-container'),
        overlay: overlay,
        overlaySecondaries: overlay. selectAll('.overlay-secondary-container'),
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

    var day1 = model.data.period({
        display: 'Daily',
        seconds: 86400,
        d3TimeInterval: {unit: d3.time.day, value: 1},
        timeFormat: '%b %d'});
    var hour1 = model.data.period({
        display: '1 Hr',
        seconds: 3600,
        d3TimeInterval: {unit: d3.time.hour, value: 1},
        timeFormat: '%b %d %Hh'});
    var minute5 = model.data.period({
        display: '5 Min',
        seconds: 300,
        d3TimeInterval: {unit: d3.time.minute, value: 5},
        timeFormat: '%H:%M'});
    var minute1 = model.data.period({
        display: '1 Min',
        seconds: 60,
        d3TimeInterval: {unit: d3.time.minute, value: 1},
        timeFormat: '%H:%M'});

    var generated = model.data.product({
        display: 'Data Generator',
        volumeFormat: '.3s',
        periods: [day1]
    });
    var bitcoin = model.data.product({
        display: 'Bitcoin',
        volumeFormat: '.2f',
        periods: [minute1, minute5, hour1]
    });

    var primaryChartModel = model.chart.primary(generated);
    var secondaryChartModel = model.chart.secondary(generated);
    var selectorsModel = model.menu.selectors();
    var xAxisModel = model.chart.xAxis(day1);
    var navModel = model.chart.nav();
    var navResetModel = model.chart.navigationReset();
    var headMenuModel = model.menu.head([generated, bitcoin], generated, day1);
    var legendModel = model.chart.legend(generated, day1);
    var overlayModel = model.menu.overlay();

    var charts = {
        primary: undefined,
        secondaries: [],
        xAxis: chart.xAxis(),
        navbar: undefined,
        legend: chart.legend()
    };

    var headMenu;
    var navReset;
    var selectors;

    function renderInternal() {
        if (layoutRedrawnInNextRender) {
            containers.suspendLayout(false);
        }

        containers.primary.datum(primaryChartModel)
          .call(charts.primary);

        containers.legend.datum(legendModel)
          .call(charts.legend);

        containers.secondaries.datum(secondaryChartModel)
            // TODO: Add component: group of secondary charts.
            // Then also move method layout.getSecondaryContainer into the group.
            .filter(function(d, i) { return i < charts.secondaries.length; })
            .each(function(d, i) {
                d3.select(this)
                    .attr('class', 'secondary-container ' + charts.secondaries[i].valueString)
                    .call(charts.secondaries[i].option);
            });

        containers.xAxis.datum(xAxisModel)
            .call(charts.xAxis);

        containers.navbar.datum(navModel)
            .call(charts.navbar);

        containers.app.select('#navbar-reset')
            .datum(navResetModel)
            .call(navReset);

        containers.app.select('.head-menu')
            .datum(headMenuModel)
            .call(headMenu);

        containers.app.select('#selectors')
            .datum(selectorsModel)
            .call(selectors);

        containers.overlay
            .datum(overlayModel)
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

    function onViewChange(domain) {
        var viewDomain = [domain[0], domain[1]];
        primaryChartModel.viewDomain = viewDomain;
        secondaryChartModel.viewDomain = viewDomain;
        xAxisModel.viewDomain = viewDomain;
        navModel.viewDomain = viewDomain;

        var trackingLatest = util.domain.trackingLatestData(
          primaryChartModel.viewDomain,
          primaryChartModel.data);
        primaryChartModel.trackingLatest = trackingLatest;
        secondaryChartModel.trackingLatest = trackingLatest;
        navModel.trackingLatest = trackingLatest;
        navResetModel.trackingLatest = trackingLatest;
        render();
    }

    function onPrimaryIndicatorChange(indicator) {
        indicator.isSelected = !indicator.isSelected;
        primaryChartModel.indicators =
            selectorsModel.indicatorSelector.indicatorOptions.filter(function(option) {
                return option.isSelected;
            });
        overlayModel.primaryIndicators = primaryChartModel.indicators;
        render();
    }

    function onSecondaryChartChange(_chart) {
        _chart.isSelected = !_chart.isSelected;
        charts.secondaries =
            selectorsModel.indicatorSelector.secondaryChartOptions.filter(function(option) {
                return option.isSelected;
            });
        // TODO: This doesn't seem to be a concern of menu.
        charts.secondaries.forEach(function(chartOption) {
            chartOption.option.on(event.viewChange, onViewChange);
        });
        overlayModel.secondaryIndicators = charts.secondaries;

        // TODO: Remove .remove! (could a secondary chart group component manage this?).
        containers.secondaries.selectAll('*').remove();
        updateLayout();
        render();
    }

    function onCrosshairChange(dataPoint) {
        legendModel.data = dataPoint;
        render();
    }

    function resetToLatest() {
        var data = primaryChartModel.data;
        var dataDomain = fc.util.extent()
          .fields('date')(data);
        var navTimeDomain = util.domain.moveToLatest(dataDomain, data, 0.2);
        onViewChange(navTimeDomain);
    }

    function loading(isLoading) {
        appContainer.select('#loading-message')
            .classed('hidden', !isLoading);
        appContainer.select('#charts')
            .classed('hidden', isLoading);
    }

    function updateModelData(data) {
        primaryChartModel.data = data;
        secondaryChartModel.data = data;
        navModel.data = data;
    }

    function updateModelSelectedProduct(product) {
        headMenuModel.selectedProduct = product;
        primaryChartModel.product = product;
        secondaryChartModel.product = product;
        legendModel.product = product;
    }

    function updateModelSelectedPeriod(period) {
        headMenuModel.selectedPeriod = period;
        xAxisModel.period = period;
        legendModel.period = period;
    }

    function initialisePrimaryChart() {
        return chart.primary()
            .on(event.crosshairChange, onCrosshairChange)
            .on(event.viewChange, onViewChange);
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
            .on(event.newTrade, function(data) {
                updateModelData(data);
                if (primaryChartModel.trackingLatest) {
                    var newDomain = util.domain.moveToLatest(
                      primaryChartModel.viewDomain,
                      primaryChartModel.data);
                    onViewChange(newDomain);
                }
            })
            .on(event.dataLoaded, function(data) {
                loading(false);
                updateModelData(data);
                legendModel.data = null;
                resetToLatest();
                updateLayout();
            })
            .on(event.dataLoadError, function(err) {
                console.log('Error getting historic data: ' + err); // TODO: something more useful for the user!
            })
            .on(event.webSocketError, function(err) {
                console.log('Error loading data from websocket: ' + err);
            });
    }

    function initialiseHeadMenu(_dataInterface) {
        return menu.head()
            .on(event.dataProductChange, function(product) {
                loading(true);
                updateModelSelectedProduct(product.option);
                updateModelSelectedPeriod(product.option.periods[0]);
                if (product.option === bitcoin) {
                    _dataInterface(product.option.periods[0].seconds);
                } else if (product.option === generated) {
                    _dataInterface.generateDailyData();
                }
                render();
            })
            .on(event.dataPeriodChange, function(period) {
                loading(true);
                updateModelSelectedPeriod(period.option);
                _dataInterface(period.option.seconds);
                render();
            });
    }
    function selectOption(option, options) {
        options.forEach(function(_option) {
            _option.isSelected = false;
        });
        option.isSelected = true;
    }

    function initialiseSelectors() {
        return menu.selectors()
            .on(event.primaryChartSeriesChange, function(series) {
                primaryChartModel.series = series;
                selectOption(series, selectorsModel.seriesSelector.options);
                render();
            })
            .on(event.primaryChartIndicatorChange, onPrimaryIndicatorChange)
            .on(event.secondaryChartChange, onSecondaryChartChange);
    }

    function initialiseOverlay() {
        return menu.overlay()
            .on(event.primaryChartIndicatorChange, onPrimaryIndicatorChange)
            .on(event.secondaryChartChange, onSecondaryChartChange);
    }

    app.run = function() {
        charts.primary = initialisePrimaryChart();
        charts.navbar = initialiseNav();


        var _dataInterface = initialiseDataInterface();
        headMenu = initialiseHeadMenu(_dataInterface);
        navReset = initialiseNavReset();
        selectors = initialiseSelectors();
        overlay = initialiseOverlay();

        updateLayout();
        initialiseResize();

        _dataInterface.generateDailyData();
    };

    return app;
}
