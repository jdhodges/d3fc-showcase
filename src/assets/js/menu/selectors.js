(function(d3, fc, sc) {
    'use strict';

    sc.menu.selectors = function() {
        var dispatch = d3.dispatch(
            sc.event.primaryChartSeriesChange,
            sc.event.primaryChartIndicatorChange,
            sc.event.secondaryChartChange);

        var primaryChartSeriesButtons = sc.menu.generator.dropdownGroup()
            .on('optionChange', dispatch[sc.event.primaryChartSeriesChange]);

        var indicatorToggle = sc.menu.generator.dropdownGroup()
            .on('optionChange', function(indicator) {
                if (indicator.valueString.indexOf('secondary') === 0) {
                    dispatch[sc.event.secondaryChartChange](indicator);
                } else {
                    dispatch[sc.event.primaryChartIndicatorChange](indicator);
                }
            });

        var selectors = function(selection) {
            selection.each(function(model) {
                var selection = d3.select(this);

                var selectedSeriesIndex = model.seriesSelector.options.map(function(option) {
                    return option.isSelected;
                }).indexOf(true);

                selection.select('#series-dropdown')
                    .datum({config: model.seriesSelector.config,
                            options: model.seriesSelector.options,
                            selectedIndex: selectedSeriesIndex})
                    .call(primaryChartSeriesButtons);

                var indicators = model.indicatorSelector.indicatorOptions
                    .concat(model.indicatorSelector.secondaryChartOptions);

                var selectedIndicatorIndexes = indicators
                    .map(function(option, index) {
                        return option.isSelected ? index : null;
                    })
                    .filter(function(option) {
                        return option;
                    });

                selection.select('#indicator-dropdown')
                    .datum({config: model.indicatorSelector.config,
                            options: indicators,
                            selected: selectedIndicatorIndexes})
                    .call(indicatorToggle);

            });
        };

        return d3.rebind(selectors, dispatch, 'on');
    };
})(d3, fc, sc);
