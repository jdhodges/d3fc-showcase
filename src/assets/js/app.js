(function(d3, fc, sc) {
    'use strict';

    sc.app = function() {

        var app = {};

        var appContainer = d3.select('#app-container');
        var chartsContainer = appContainer.select('#charts-container');
        var containers = {
            app: appContainer,
            charts: chartsContainer,
            primary: chartsContainer.select('#primary-container'),
            secondaries: chartsContainer.selectAll('.secondary-container'),
            xAxis: chartsContainer.select('#x-axis-container'),
            navbar: chartsContainer.select('#navbar-row'),
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

        var day1 = sc.model.period({
            display: 'Daily',
            seconds: 86400,
            d3TimeInterval: {unit: d3.time.day, value: 1},
            timeFormat: '%b %d'});
        var hour1 = sc.model.period({
            display: '1 Hr',
            seconds: 3600,
            d3TimeInterval: {unit: d3.time.hour, value: 1},
            timeFormat: '%b %d %Hh'});
        var minute5 = sc.model.period({
            display: '5 Min',
            seconds: 300,
            d3TimeInterval: {unit: d3.time.minute, value: 5},
            timeFormat: '%H:%M'});
        var minute1 = sc.model.period({
            display: '1 Min',
            seconds: 60,
            d3TimeInterval: {unit: d3.time.minute, value: 1},
            timeFormat: '%H:%M'});

        var generated = sc.model.product({
            display: 'Data Generator',
            volumeFormat: '.3s',
            periods: [day1]
        });
        var bitcoin = sc.model.product({
            display: 'Bitcoin',
            volumeFormat: '.2f',
            periods: [minute1, minute5, hour1]
        });

        var primaryChartModel = sc.model.primaryChart(generated);
        var secondaryChartModel = sc.model.secondaryChart(generated);
        var sideMenuModel = sc.model.menu.side();
        var componentsMenuModel = sc.model.menu.components();
        var xAxisModel = sc.model.xAxis(day1);
        var navModel = sc.model.nav();
        var headMenuModel = sc.model.headMenu([generated, bitcoin], generated, day1);
        var legendModel = sc.model.legend(generated, day1);

        var charts = {
            primary: undefined,
            secondaries: [],
            xAxis: sc.chart.xAxis(),
            navbar: undefined,
            legend: sc.chart.legend()
        };

        var headMenu;
        var sideMenu;
        var componentsMenu;

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

            containers.app.select('.head-menu')
                .datum(headMenuModel)
                .call(headMenu);
            //
            containers.app.select('#components')
                .datum(componentsMenuModel)
                .call(componentsMenu);

            containers.app.select('.sidebar-menu')
              .datum(sideMenuModel)
              .call(sideMenu);

            if (layoutRedrawnInNextRender) {
                containers.suspendLayout(true);
                layoutRedrawnInNextRender = false;
            }
        }

        var render = fc.util.render(renderInternal);

        var layoutRedrawnInNextRender = true;

        function updateLayout() {
            layoutRedrawnInNextRender = true;
            sc.util.layout(containers, charts);
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

            var trackingLatest = sc.util.domain.trackingLatestData(
                primaryChartModel.viewDomain,
                primaryChartModel.data);
            primaryChartModel.trackingLatest = trackingLatest;
            secondaryChartModel.trackingLatest = trackingLatest;
            navModel.trackingLatest = trackingLatest;
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
            var navTimeDomain = sc.util.domain.moveToLatest(dataDomain, data, 0.2);
            onViewChange(navTimeDomain);
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
            return sc.chart.primary()
                .on(sc.event.crosshairChange, onCrosshairChange)
                .on(sc.event.viewChange, onViewChange);
        }

        function initialiseNav() {
            return sc.chart.nav()
                .on(sc.event.viewChange, onViewChange)
                .on(sc.event.resetToLatest, resetToLatest);
        }

        function initialiseDataInterface() {
            return sc.data.dataInterface()
                .on(sc.event.messageReceived, function(socketEvent, data) {
                    if (socketEvent.type === 'error' ||
                        (socketEvent.type === 'close' && socketEvent.code !== 1000)) {
                        console.log('Error loading data from coinbase websocket: ' +
                        socketEvent.type + ' ' + socketEvent.code);
                    } else if (socketEvent.type === 'message') {
                        updateModelData(data);
                        if (primaryChartModel.trackingLatest) {
                            var newDomain = sc.util.domain.moveToLatest(
                                primaryChartModel.viewDomain,
                                primaryChartModel.data);
                            onViewChange(newDomain);
                        }
                    }
                })
                .on(sc.event.dataLoaded, function(err, data) {
                    if (err) {
                        console.log('Error getting historic data: ' + err);
                    } else {
                        updateModelData(data);
                        legendModel.data = null;
                        resetToLatest();
                    }
                });
        }

        function initialiseHeadMenu(dataInterface) {
            return sc.menu.head()
                .on(sc.event.dataProductChange, function(product) {
                    updateModelSelectedProduct(product.option);
                    updateModelSelectedPeriod(product.option.periods[0]);
                    if (product.option === bitcoin) {
                        dataInterface(product.option.periods[0].seconds);
                    } else if (product.option === generated) {
                        dataInterface.generateDailyData();
                    }
                    render();
                })
                .on(sc.event.dataPeriodChange, function(period) {
                    updateModelSelectedPeriod(period.option);
                    dataInterface(period.option.seconds);
                    render();
                })
                .on(sc.event.toggleSlideout, function() {
                    containers.app.selectAll('.row-offcanvas-right').classed('active',
                        !containers.app.selectAll('.row-offcanvas-right').classed('active'));
                });
        }

        function selectOption(option, options) {
            options.forEach(function(option) {
                option.isSelected = false;
            });
            option.isSelected = true;
        }

        function initialiseSideMenu() {
            return sc.menu.side()
                .on(sc.event.primaryChartSeriesChange, function(series) {
                    primaryChartModel.series = series;
                    selectOption(series, sideMenuModel.seriesOptions);
                    render();
                })
                .on(sc.event.primaryChartYValueAccessorChange, function(yValueAccessor) {
                    primaryChartModel.yValueAccessor = yValueAccessor;
                    selectOption(yValueAccessor, sideMenuModel.yValueAccessorOptions);
                    render();
                })
                .on(sc.event.primaryChartIndicatorChange, function(indicator) {
                    indicator.isSelected = !indicator.isSelected;
                    primaryChartModel.indicators = sideMenuModel.indicatorOptions.filter(function(option) {
                        return option.isSelected;
                    });
                    render();
                })
                .on(sc.event.secondaryChartChange, function(chart) {
                    chart.isSelected = !chart.isSelected;
                    charts.secondaries = sideMenuModel.secondaryChartOptions.filter(function(option) {
                        return option.isSelected;
                    });
                    // TODO: This doesn't seem to be a concern of menu.
                    charts.secondaries.forEach(function(chartOption) {
                        chartOption.option.on(sc.event.viewChange, onViewChange);
                    });
                    // TODO: Remove .remove! (could a secondary chart group component manage this?).
                    containers.secondaries.selectAll('*').remove();
                    updateLayout();
                    render();
                });
        }

        function initialiseComponentsMenu() {
            return sc.menu.components()
                .on(sc.event.primaryChartSeriesChange, function(series) {
                    primaryChartModel.series = series;
                    selectOption(series, componentsMenuModel.seriesOptions);
                    render();
                })
                .on(sc.event.primaryChartIndicatorChange, function(indicator) {
                    indicator.isSelected = !indicator.isSelected;
                    primaryChartModel.indicators = componentsMenuModel.indicatorOptions.filter(function(option) {
                        return option.isSelected;
                    });
                    render();
                })
                .on(sc.event.secondaryChartChange, function(chart) {
                    chart.isSelected = !chart.isSelected;
                    charts.secondaries = componentsMenuModel.secondaryChartOptions.filter(function(option) {
                        return option.isSelected;
                    });
                    // TODO: This doesn't seem to be a concern of menu.
                    charts.secondaries.forEach(function(chartOption) {
                        chartOption.option.on(sc.event.viewChange, onViewChange);
                    });
                    // TODO: Remove .remove! (could a secondary chart group component manage this?).
                    containers.secondaries.selectAll('*').remove();
                    updateLayout();
                    render();
                });
        }

        app.run = function() {
            charts.primary = initialisePrimaryChart();
            charts.navbar = initialiseNav();

            var dataInterface = initialiseDataInterface();
            headMenu = initialiseHeadMenu(dataInterface);
            sideMenu = initialiseSideMenu();
            componentsMenu = initialiseComponentsMenu();

            updateLayout();
            initialiseResize();

            dataInterface.generateDailyData();
        };

        return app;
    };
})(d3, fc, sc);
