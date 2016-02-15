export default function(chart, endOfDomain, isMobileWidth) {
    chart.yOrient(isMobileWidth ? 'left' : 'right')
        .yBaseline(endOfDomain);
}
