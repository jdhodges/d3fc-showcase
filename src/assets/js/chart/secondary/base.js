import d3 from 'd3';
import fc from 'd3fc';
import event from '../../event';
import zoomBehavior from '../../behavior/zoom';

export default function() {
    var dispatch = d3.dispatch(event.viewChange);
    var xScale = fc.scale.dateTime();
    var yScale = d3.scale.linear();
    var trackingLatest = true;
    var yAxisWidth = 60;

    var multi = fc.series.multi();
    var chart = fc.chart.cartesian(xScale, yScale)
        .plotArea(multi)
        .xTicks(0)
        .yOrient('right')
        .margin({
            top: 0,
            left: 0,
            bottom: 0,
            right: yAxisWidth
        });
    var zoomWidth;

    function secondary(selection) {
        selection.each(function(data) {
            var container = d3.select(this)
                .call(chart);

            var zoom = zoomBehavior(zoomWidth)
                .scale(xScale)
                .trackingLatest(trackingLatest)
                .on('zoom', function(domain) {
                    dispatch[event.viewChange](domain);
                });

            container.select('.plot-area-container')
                .datum({data: selection.datum()})
                .call(zoom);
        });
    }

    secondary.trackingLatest = function(x) {
        if (!arguments.length) {
            return trackingLatest;
        }
        trackingLatest = x;
        return secondary;
    };

    d3.rebind(secondary, dispatch, 'on');
    d3.rebind(secondary, multi, 'series', 'mapping', 'decorate');
    d3.rebind(secondary, chart, 'yTickValues', 'yTickFormat', 'yTicks', 'xDomain', 'yDomain');

    secondary.dimensionChanged = function(container) {
        zoomWidth = parseInt(container.style('width'), 10) - yAxisWidth;
    };

    return secondary;
}
