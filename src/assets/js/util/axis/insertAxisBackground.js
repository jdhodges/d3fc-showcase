export default function(s, isMobileWidth) {
    var axisBackgroundTranslateX = -60;
    var axisBackgroundTranslateY = 1;

    s.enter()
        .insert('rect', ':first-child')
        .attr({
            class: 'axis-background',
            transform: 'translate(' + axisBackgroundTranslateX + ', ' + axisBackgroundTranslateY + ')',
            height: '100%'
        });

    s.select('.axis-background').classed('hidden', function() { return !isMobileWidth; });
}
