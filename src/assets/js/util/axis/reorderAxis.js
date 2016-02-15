export default function(s) {
    s.enter().select('.plot-area-container').append(function() {
        return s.select('.axes-container').node();
    });
}
