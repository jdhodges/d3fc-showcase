(function(d3, fc, sc) {
    'use strict';

    sc.model.menu.secondaryChartOptions = function() {
        return [
            sc.menu.option('Relative Strength Index', 'secondary-rsi', sc.chart.rsi(),'assets/icons/rsi-indicator.svg'),
            sc.menu.option('MACD', 'secondary-macd', sc.chart.macd(),'assets/icons/macd-indicator.svg')
        ];
    };

})(d3, fc, sc);
