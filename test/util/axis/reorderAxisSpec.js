import d3 from 'd3';
import fc from 'd3fc';
import reorderAxis from '../../../src/assets/js/util/axis/reorderAxis';

describe('util/axis/reorderAxis', function() {
    var cartesianChartDataJoin = fc.util.dataJoin()
        .selector('.cartesian-chart')
        .element('svg')
        .attr('class', 'cartesian-chart');

    var cartesianChart;
    var plotAreaContainer;
    var children;

    beforeEach(function() {
        cartesianChart = cartesianChartDataJoin(d3.select('body'), [0]);
        plotAreaContainer = cartesianChart.append('g').attr('class', 'plot-area-container');
    });

    afterEach(function() {
        d3.selectAll('svg').remove();
    });

    it('should reinsert axes-container as last child (when there are 2 children)', function() {
        plotAreaContainer.append('g').attr('class', 'axes-container');
        plotAreaContainer.append('svg').attr('class', 'plot-area');

        children = plotAreaContainer.node().childNodes;

        expect(children.length).toEqual(2);

        expect(children[0].getAttribute('class')).toEqual('axes-container');
        expect(children[1].getAttribute('class')).toEqual('plot-area');

        reorderAxis(cartesianChart);

        expect(children.length).toEqual(2);

        expect(children[0].getAttribute('class')).toEqual('plot-area');
        expect(children[1].getAttribute('class')).toEqual('axes-container');
    });

    it('should reinsert axes-container as last child (when there are 3 children)', function() {
        plotAreaContainer.append('rect').attr('class', 'background');
        plotAreaContainer.append('g').attr('class', 'axes-container');
        plotAreaContainer.append('svg').attr('class', 'plot-area');

        children = plotAreaContainer.node().childNodes;

        expect(children.length).toEqual(3);

        expect(children[0].getAttribute('class')).toEqual('background');
        expect(children[1].getAttribute('class')).toEqual('axes-container');
        expect(children[2].getAttribute('class')).toEqual('plot-area');

        reorderAxis(cartesianChart);

        expect(children.length).toEqual(3);

        expect(children[0].getAttribute('class')).toEqual('background');
        expect(children[1].getAttribute('class')).toEqual('plot-area');
        expect(children[2].getAttribute('class')).toEqual('axes-container');
    });

    it('should keep axes-container as last child when already last child', function() {
        plotAreaContainer.append('rect').attr('class', 'background');
        plotAreaContainer.append('svg').attr('class', 'plot-area');
        plotAreaContainer.append('g').attr('class', 'axes-container');

        children = plotAreaContainer.node().childNodes;

        expect(children.length).toEqual(3);

        expect(children[0].getAttribute('class')).toEqual('background');
        expect(children[1].getAttribute('class')).toEqual('plot-area');
        expect(children[2].getAttribute('class')).toEqual('axes-container');

        reorderAxis(cartesianChart);

        expect(children.length).toEqual(3);

        expect(children[0].getAttribute('class')).toEqual('background');
        expect(children[1].getAttribute('class')).toEqual('plot-area');
        expect(children[2].getAttribute('class')).toEqual('axes-container');
    });
});
