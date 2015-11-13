(function(d3, fc, sc) {
    'use strict';

    sc.model.menu.selectors = function() {

        // TODO: Instantiate series/indicator components outside of menu model?
        return {
            seriesOptions: sc.model.menu.seriesOptions(),
            yValueAccessorOptions: sc.model.menu.yValueAccessorOptions(), // TODO: remove? #263.
            indicatorOptions: sc.model.menu.indicatorOptions(),
            secondaryChartOptions: sc.model.menu.secondaryChartOptions()
        };
    };

})(d3, fc, sc);
