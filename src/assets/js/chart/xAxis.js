import d3 from 'd3';
import fc from 'd3fc';

export default function() {
    var xScale = fc.scale.dateTime();
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');

    function preventTicksMoreFrequentThanPeriod(period) {
        var scaleTickSeconds = (xScale.ticks()[1] - xScale.ticks()[0]) / 1000;
        if (scaleTickSeconds < period.seconds) {
            xAxis.ticks(period.d3TimeInterval.unit, period.d3TimeInterval.value);
        } else {
            xAxis.ticks(6);
        }
    }

    function xAxisChart(selection) {
        var model = selection.datum();
        xScale.domain(model.viewDomain);
        preventTicksMoreFrequentThanPeriod(model.period);
        selection.call(xAxis);
    }

    xAxisChart.dimensionChanged = function(container) {
        xScale.range([0, parseInt(container.style('width'), 10)]);
    };

    return xAxisChart;
}
