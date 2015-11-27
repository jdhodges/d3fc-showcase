import d3 from 'd3';
import fc from 'd3fc';

export default function() {
    var dispatch = d3.dispatch('click');

    function editIndicatorGroup(selection) {
        selection.each(function(model) {
            var sel = d3.select(this);

            var div = sel.selectAll('div')
                .data(model.selectedIndicators);

            div.enter()
                .append('div')
                .attr('class', 'edit-indicator')
                .each(function(d) {
                    var enter = d3.select(this);

                    enter.append('span')
                        .attr('class', 'icon sc-icon-delete');

                    enter.append('span')
                        .attr('class', 'indicator-label');
                });

            div.select('.indicator-label')
                .text(function(d) {
                    return d.displayString;
                });

            div.select('.icon').on('click', dispatch.click);

            div.exit().remove();
        });
    }

    d3.rebind(editIndicatorGroup, dispatch, 'on');

    return editIndicatorGroup;
}
