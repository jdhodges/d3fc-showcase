import d3 from 'd3';
import fc from 'd3fc';
import event from '../event';
import menu from '../menu/menu';
import editIndicatorGroup from './generator/editIndicatorGroup';

export default function() {
    var dispatch = d3.dispatch(
        event.primaryChartIndicatorChange,
        event.secondaryChartChange);

    var primaryChartIndicatorToggle = editIndicatorGroup()
        .on(event.indicatorChange, dispatch[event.primaryChartIndicatorChange]);

    var secondaryChartToggle = editIndicatorGroup()
        .on(event.indicatorChange, dispatch[event.secondaryChartChange]);

    var overlay = function(selection) {
        selection.each(function(model) {
            var sel = d3.select(this);

            sel.select('#overlay-primary-container').select('.edit-indicator-container')
                .datum({selectedIndicators: model.primaryIndicators})
                .call(primaryChartIndicatorToggle);

            sel.selectAll('.overlay-secondary-container')
                .each(function(d, i) {
                    var currentSelection = d3.select(this);

                    var selectedIndicators = model.secondaryIndicators[i] ? [model.secondaryIndicators[i]] : [];

                    currentSelection.select('.edit-indicator-container')
                        .datum({selectedIndicators: selectedIndicators})
                        .call(secondaryChartToggle);
                });

        });
    };

    return d3.rebind(overlay, dispatch, 'on');
}
