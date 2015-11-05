(function(d3, fc, sc) {
    'use strict';

    sc.chart.legend = function() {
        var formatPrice;
        var formatVolume;
        var formatTime;
        var lastDataPointDisplayed;
        var lastTimeFormatLength;

        var legendItems =  [
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

                if (model.data !== lastDataPointDisplayed) {
                    lastDataPointDisplayed = model.data;

                    var span = container.selectAll('span')
                        .data(legendItems);

                    span.enter()
                        .append('span')
                        .attr('class', function(d, i) { return i % 2 === 0 ? 'legendLabel' : 'legendValue'; });

                    span.text(function(d, i) { return i % 2 === 0 ? d : model.data ? d(model.data) : ''; });

                    if (model.data && formatTime(model.data.date).length !== lastTimeFormatLength) {
                        lastTimeFormatLength = formatTime(model.data.date).length;

                        span.style('min-width', function(d, i) {
                            return i === 1 ? formatTime(model.data.date).length * 7 + 'px' : null;
                        });
                    }
                }
            });
        }

        return legend;
    };
})(d3, fc, sc);
