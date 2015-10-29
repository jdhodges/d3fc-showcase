(function(d3, fc, sc) {
    'use strict';

    sc.chart.legend = function() {
        var formatPrice;
        var formatVolume;
        var formatTime;
        var lastDataPointDisplayed;

        function legend(selection) {
            selection.each(function(model) {
                var container = d3.select(this);

                formatPrice = model.product.priceFormat;
                formatVolume = model.product.volumeFormat;
                formatTime = model.period.timeFormat;

                if (model.data !== lastDataPointDisplayed) {
                    lastDataPointDisplayed = model.data;
                    container.datum(model.data);
                }

                var d = container.datum();

                var legendComponents =  [
                    'T',
                    formatTime(d.date),
                    'O',
                    formatPrice(d.open),
                    'H',
                    formatPrice(d.high),
                    'L',
                    formatPrice(d.low),
                    'C',
                    formatPrice(d.close),
                    'V',
                    formatVolume(d.volume)
                ];

                var span = container.select('p')
                    .selectAll('span')
                    .data(legendComponents);

                span.text(function(d) {
                    return d;
                });

                span.enter()
                    .append('span')
                    .text(function(d) {
                        return d;
                    });

                span.each(function(d, i) {
                    if ((i + 1) % 2 === 0) {
                        this.setAttribute('class', 'legendValue');
                    } else {
                        this.setAttribute('class', 'legendLabel');
                    }
                });
            });
        }

        return legend;
    };
})(d3, fc, sc);
