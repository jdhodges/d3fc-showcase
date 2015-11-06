(function(d3, fc, sc) {
    'use strict';

    sc.app = function() {

        var app = {};

        var container = d3.select('#app-container');
        var primaryChartContainer = container.select('#primary-container');
        var secondaryChartsContainer = container.selectAll('.secondary-container');
        var xAxisContainer = container.select('#x-axis-container');
        var navbarContainer = container.select('#navbar-container');
        var legendContainer = container.select('#legend');

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
        var xAxisModel = sc.model.xAxis(day1);
        var navModel = sc.model.nav();
        var headMenuModel = sc.model.headMenu([generated, bitcoin], generated, day1);
        var legendModel = sc.model.legend(generated, day1);

        var primaryChart;
        var secondaryCharts = [];
        var xAxis = sc.chart.xAxis();
        var nav;
        var headMenu;
        var sideMenu;
        var legend = sc.chart.legend();

        function renderInternal() {
            primaryChartContainer.datum(primaryChartModel)
                .call(primaryChart);

            legendContainer.datum(legendModel)
                .call(legend);

            secondaryChartsContainer.datum(secondaryChartModel)
                // TODO: Add component: group of secondary charts.
                .filter(function(d, i) { return i < secondaryCharts.length; })
                .each(function(d, i) {
                    d3.select(this)
                        .attr('class', 'secondary-container ' + secondaryCharts[i].valueString)
                        .call(secondaryCharts[i].option);
                });

            xAxisContainer.datum(xAxisModel)
                .call(xAxis);

            navbarContainer.datum(navModel)
                .call(nav);

            container.select('.head-menu')
                .datum(headMenuModel)
                .call(headMenu);

            container.select('.sidebar-menu')
              .datum(sideMenuModel)
              .call(sideMenu);
        }

        var render = fc.util.render(renderInternal);

        function updateLayout() {
            sc.util.layout(container, secondaryCharts);
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
            var dataDomain = fc.util.extent(data, 'date');
            var navTimeDomain = sc.util.domain.moveToLatest(dataDomain, data, 0.2);
            onViewChange(navTimeDomain);
        }

        function updateModelData(data) {
            primaryChartModel.data = data;
            secondaryChartModel.data = data;
            navModel.data = data;
        }

        function initialiseLegendData(data) {
            legendModel.data = null;
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
                .on(sc.event.viewChange, onViewChange);
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
                        initialiseLegendData(data);
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
                .on(sc.event.resetToLatest, resetToLatest)
                .on(sc.event.toggleSlideout, function() {
                    container.selectAll('.row-offcanvas-right').classed('active',
                        !container.selectAll('.row-offcanvas-right').classed('active'));
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
                    secondaryCharts = sideMenuModel.secondaryChartOptions.filter(function(option) {
                        return option.isSelected;
                    });
                    // TODO: This doesn't seem to be a concern of menu.
                    secondaryCharts.forEach(function(chartOption) {
                        chartOption.option.on(sc.event.viewChange, onViewChange);
                    });
                    // TODO: Remove .remove! (could a secondary chart group component manage this?).
                    secondaryChartsContainer.selectAll('*').remove();
                    updateLayout();
                    render();
                });
        }

        app.run = function() {
            updateLayout();

            primaryChart = initialisePrimaryChart();
            nav = initialiseNav();

            var dataInterface = initialiseDataInterface();
            headMenu = initialiseHeadMenu(dataInterface);
            sideMenu = initialiseSideMenu();

            initialiseResize();

            dataInterface.generateDailyData();
        };

        return app;
    };
})(d3, fc, sc);
