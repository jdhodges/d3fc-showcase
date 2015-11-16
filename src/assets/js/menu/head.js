(function(d3, fc, sc) {
    'use strict';

    sc.menu.head = function() {

        var dispatch = d3.dispatch(
            sc.event.toggleSlideout,
            sc.event.dataProductChange,
            sc.event.dataPeriodChange);

        var dataProductDropdown = sc.menu.generator.dropdownGroup()
            .on('optionChange', function(product) {
                dispatch[sc.event.dataProductChange](product);
            });

        var dataPeriodSelector = sc.menu.generator.tabGroup()
            .on('tabClick', function(period) {
                dispatch[sc.event.dataPeriodChange](period);
            });

        var head = function(selection) {
            selection.each(function(model) {
                var selection = d3.select(this);

                var products = model.products;
                selection.select('#product-dropdown')
                    .datum({
                        config: model.productConfig,
                        options: products.map(sc.menu.productAdaptor),
                        selectedIndex: products.indexOf(model.selectedProduct)
                    })
                    .call(dataProductDropdown);

                var periods = model.selectedProduct.periods;
                selection.select('#period-selector')
                    .classed('hidden', periods.length <= 1) // TODO: get from model instead?
                    .datum({
                        options: periods.map(sc.menu.periodAdaptor),
                        selectedIndex: periods.indexOf(model.selectedPeriod)
                    })
                    .call(dataPeriodSelector);

                selection.select('#toggle-button')
                    .on('click', function() {
                        dispatch[sc.event.toggleSlideout]();
                    });
            });
        };

        return d3.rebind(head, dispatch, 'on');
    };
})(d3, fc, sc);
