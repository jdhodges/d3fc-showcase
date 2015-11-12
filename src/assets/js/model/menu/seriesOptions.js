(function(d3, fc, sc) {
    'use strict';

    sc.model.menu.seriesOptions = function() {

        // TODO: Could 'isLine' go on primary chart series model instead?
        var line = fc.series.line();
        line.isLine = true;

        var candlestickOption = sc.menu.option('Candlestick', 'candlestick', sc.series.candlestick(),
            'assets/icons/candlestick-series.svg');
        candlestickOption.isSelected = true;

        return [
            candlestickOption,
            sc.menu.option('OHLC', 'ohlc', fc.series.ohlc(), 'assets/icons/ohlc-series.svg'),
            sc.menu.option('Line', 'line', line, 'assets/icons/line-series.svg'),
            sc.menu.option('Point', 'point', fc.series.point(), 'assets/icons/point-series.svg'),
            sc.menu.option('Area', 'area', fc.series.area(), 'assets/icons/area-series.svg')
        ];
    };

})(d3, fc, sc);
