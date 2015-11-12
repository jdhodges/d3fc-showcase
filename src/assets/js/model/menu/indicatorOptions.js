(function(d3, fc, sc) {
    'use strict';

    sc.model.menu.indicatorOptions = function() {

        var movingAverage = fc.series.line()
            .decorate(function(select) {
                select.enter()
                    .classed('movingAverage', true);
            })
            .yValue(function(d) { return d.movingAverage; });

        return [
            sc.menu.option('Moving Average', 'movingAverage',
                movingAverage, 'assets/icons/moving-average-indicator.svg'),
            sc.menu.option('Bollinger Bands', 'bollinger',
                fc.indicator.renderer.bollingerBands(), 'assets/icons/bollinger-bands-indicator.svg')
        ];
    };

})(d3, fc, sc);
