import d3 from 'd3';
import fc from 'd3fc';
import event from '../event';
import dropdown from './generator/dropdown';

export default function() {
    var dispatch = d3.dispatch(
        event.primaryChartSeriesChange,
        event.primaryChartIndicatorChange,
        event.secondaryChartChange);

    var primaryChartSeriesButtons = dropdown()
        .on('optionChange', dispatch[event.primaryChartSeriesChange]);

    var indicatorToggle = dropdown()
        .on('optionChange', function(indicator) {
            if (indicator.isPrimary) {
                dispatch[event.primaryChartIndicatorChange](indicator);
            } else {
                dispatch[event.secondaryChartChange](indicator);
            }
        });

    var selectors = function(selection) {
        selection.each(function(model) {
            var container = d3.select(this);

            var selectedSeriesIndex = model.seriesSelector.options.map(function(option) {
                return option.isSelected;
            }).indexOf(true);

            container.select('#series-dropdown')
                .datum({
                    config: model.seriesSelector.config,
                    options: model.seriesSelector.options,
                    selectedIndex: selectedSeriesIndex
                })
                .call(primaryChartSeriesButtons);

            var options = model.indicatorSelector.options;

            var unselectedOptions = options.filter(function(option) {
                return !option.isSelected;
            });

            var selectedIndicatorIndexes = options
                .map(function(option, index) {
                    return option.isSelected ? index : null;
                })
                .filter(function(option) {
                    return option;
                });

            container.select('#indicator-dropdown')
                .datum({
                    config: model.indicatorSelector.config,
                    options: unselectedOptions,
                    selected: selectedIndicatorIndexes
                })
                .call(indicatorToggle);

        });
    };

    d3.rebind(selectors, dispatch, 'on');

    return selectors;
}
