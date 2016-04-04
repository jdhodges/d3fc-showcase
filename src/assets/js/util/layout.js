import fc from 'd3fc';

var renderedOnce = false;

export default function(containers, charts) {
    var primaryContainerFlex = 5;
    var secondaryChartsShown = charts.secondaries().charts().length;

    var secondariesHeight = Math.ceil((fc.util.innerDimensions(containers.charts.node()).height -
        fc.util.innerDimensions(containers.xAxis.node()).height -
        fc.util.innerDimensions(containers.navbar.node()).height) / (primaryContainerFlex + secondaryChartsShown));

    var flexString = '0 0 ' + secondariesHeight * secondaryChartsShown + 'px';

    containers.secondaries.style('flex', flexString);
    containers.overlaySecondaries.style('flex', flexString);

    var headRowHeight = parseInt(containers.app.select('.head-row').style('height'), 10);
    if (!renderedOnce) {
        headRowHeight +=
          parseInt(containers.app.select('.head-row').style('padding-top'), 10) +
          parseInt(containers.app.select('.head-row').style('padding-bottom'), 10) +
          parseInt(containers.app.select('.head-row').style('margin-bottom'), 10);
        renderedOnce = true;
    }

    var useableHeight = fc.util.innerDimensions(containers.app.node()).height - headRowHeight;

    containers.chartsAndOverlay.style('height', useableHeight + 'px');

    charts.xAxis().dimensionChanged(containers.xAxis);
    charts.nav().dimensionChanged(containers.navbar);
    charts.primary().dimensionChanged(containers.primary);
    charts.secondaries().charts().forEach(function(chart) {
        chart.option.dimensionChanged(containers.secondaries);
    });
}
