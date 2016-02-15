import d3 from 'd3';
import fc from 'd3fc';
import insertAxisBackground from '../../../src/assets/js/util/axis/insertAxisBackground';

describe('util/axis/insertAxisBackground', function() {
    var testSvgDataJoin = fc.util.dataJoin()
        .selector('.test-svg')
        .element('svg')
        .attr('class', 'test-svg');

    var testSvg;

    beforeEach(function() {
        testSvg = testSvgDataJoin(d3.select('body'), [0]);
    });

    afterEach(function() {
        d3.selectAll('svg').remove();
    });

    it('should insert a rect as first child', function() {
        var isMobileWidth = true;

        testSvg.append('g').attr('class', 'one');
        testSvg.append('g').attr('class', 'two');

        var children = testSvg.node().childNodes;

        expect(children.length).toEqual(2);

        expect(children[0].getAttribute('class')).toEqual('one');
        expect(children[1].getAttribute('class')).toEqual('two');

        insertAxisBackground(testSvg, isMobileWidth);

        expect(children.length).toEqual(3);

        expect(children[0].getAttribute('class')).toEqual('axis-background');
        expect(children[1].getAttribute('class')).toEqual('one');
        expect(children[2].getAttribute('class')).toEqual('two');
    });

    it('should hide the rect when not at mobile width', function() {
        var isMobileWidth = false;

        insertAxisBackground(testSvg, isMobileWidth);

        expect(testSvg.node().firstChild.getAttribute('class')).toMatch('hidden');
    });

    it('should apply the correct translation to the rect', function() {
        var isMobileWidth = true;

        // Using regular expression as IE translate does not place a comma between the X and Y values
        var regExp = /translate\(-60(,|) 1\)/;

        insertAxisBackground(testSvg, isMobileWidth);

        expect(testSvg.node().firstChild.getAttribute('transform')).toMatch(regExp);
    });
});
