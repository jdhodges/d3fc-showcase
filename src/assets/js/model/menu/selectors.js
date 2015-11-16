(function(d3, fc, sc) {
    'use strict';

    sc.model.menu.selectors = function() {

        // TODO: Instantiate series/indicator components outside of menu model?
        return {
            seriesSelector: sc.model.menu.seriesSelector(),
            indicatorSelector: sc.model.menu.indicatorSelector()
        };
    };

})(d3, fc, sc);
