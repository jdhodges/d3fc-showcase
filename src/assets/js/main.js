(function(d3, fc, sc) {
    'use strict';

    // Set SVGs & column padding
    var container = d3.select('#chart-example');

    var svgMain = container.select('svg.primary');
    var svgRSI = container.select('svg.rsi');
    var svgNav = container.select('svg.nav');

    var candlestick = fc.series.candlestick();
    var ohlc = fc.series.ohlc();
    var point = fc.series.point();
    var line = fc.series.line();
    line.isLine = true;
    var area = fc.series.area();

    var data = fc.data.random.financial()(250);

    data.viewDomain = [];

    sc.util.calculateDimensions(container);

    var primaryChart = sc.chart.primaryChart();
    var rsiChart = sc.chart.rsiChart();
    var navChart = sc.chart.navChart();

    function onViewChanged(domain) {
        data.viewDomain = [domain[0], domain[1]];
        render();
    }

    primaryChart.on('viewChange', onViewChanged);
    rsiChart.on('viewChange', onViewChanged);
    navChart.on('viewChange', onViewChanged);

    function changeSeries(seriesTypeString) {
        var currentSeries;
        switch (seriesTypeString) {
            case 'ohlc':
                currentSeries = ohlc;
                break;
            case 'candlestick':
                currentSeries = candlestick;
                break;
            case 'line':
                currentSeries = line;
                break;
            case 'point':
                currentSeries = point;
                break;
            case 'area':
                currentSeries = area;
                break;
            default:
                currentSeries = candlestick;
                break;
        }
        primaryChart.changeSeries(currentSeries);
    }

    changeSeries('candlestick');

    d3.select('#series-buttons')
        .selectAll('.btn')
        .on('click', function() {
            var seriesTypeString = d3.select(this)
                .select('input')
                .node()
                .value;
            changeSeries(seriesTypeString);
            render();
        });

    // Set Reset button event
    function resetToLive() {
        // Using golden ratio to make initial display area rectangle into the golden rectangle
        var goldenRatio = 1.618;
        var navAspect = parseInt(svgNav.style('height'), 10) / svgNav.attr('width');
        var standardDateDisplay = [data[Math.floor((1 - navAspect * goldenRatio) * data.length)].date,
            data[data.length - 1].date];
        onViewChanged(standardDateDisplay);
        render();
    }

    container.select('#reset-button').on('click', resetToLive);

    function render() {
        svgMain.datum(data)
            .call(primaryChart);

        svgRSI.datum(data)
            .call(rsiChart);

        svgNav.datum(data)
            .call(navChart);
    }

    function resize() {
        sc.util.calculateDimensions(container);
        render();
    }

    d3.select(window).on('resize', resize);

    resetToLive();
    resize();

})(d3, fc, sc);
