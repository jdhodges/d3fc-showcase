(function(d3, fc, sc) {
    'use strict';

    sc.model.menu.indicatorSelector = function() {
        return {
            config: {
                title: 'Add Indicator',
                careted: false,
                listIcons: true,
                icon: false
            },
            indicatorOptions: sc.model.menu.indicatorOptions(),
            secondaryChartOptions: sc.model.menu.secondaryChartOptions()
        };
    };

})(d3, fc, sc);
