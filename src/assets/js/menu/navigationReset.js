import d3 from 'd3';
import event from '../event';

export default function() {

    var dispatch = d3.dispatch(event.resetToLatest);

    function navReset(selection) {
        var model = selection.datum();

        var resetButton = selection.selectAll('g')
            .data([model]);

        var g = resetButton.enter()
            .append('g')
            .attr('class', 'reset-button')
            .on('click', function() { dispatch[event.resetToLatest](); });

        g.append('path')
            .attr('d', 'M1.5 1.5h13.438L23 20.218 14.937 38H1.5l9.406-17.782L1.5 1.5z');

        g.append('rect')
            .attr({
                width: 4,
                height: 28,
                stroke: '#FFF',
                x: 26,
                y: 6
            });
        resetButton.classed('hidden', model.trackingLatest);
    }

    d3.rebind(navReset, dispatch, 'on');

    return navReset;
}
