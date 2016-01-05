import d3 from 'd3';

export default function() {
    var formatPrice;
    var formatVolume;
    var formatTime;

    var legendItems = [
        'T',
        function(d) { return formatTime(d.date); },
        'O',
        function(d) { return formatPrice(d.open); },
        'H',
        function(d) { return formatPrice(d.high); },
        'L',
        function(d) { return formatPrice(d.low); },
        'C',
        function(d) { return formatPrice(d.close); },
        'V',
        function(d) { return formatVolume(d.volume); }
    ];

    function legend(selection) {
        selection.each(function(model) {
            var container = d3.select(this);

            formatPrice = model.product.priceFormat;
            formatVolume = model.product.volumeFormat;
            formatTime = model.period.timeFormat;

            container.classed('hidden', !model.data);

            if (model.data) {
                var span = container.selectAll('span')
                    .data(legendItems);

                span.enter()
                    .append('span')
                    .attr('class', function(d, i) { return i % 2 === 0 ? 'legendLabel' : 'legendValue'; });

                span.text(function(d) { return d3.functor(d)(model.data); });
            }
        });
    }

    return legend;
}
