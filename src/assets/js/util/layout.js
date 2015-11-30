/*global window */
var renderedOnce = false;

export default function(containers, charts) {

    function getSecondaryContainer(chartIndex) {
        return containers.secondaries.filter(function(d, index) { return index === chartIndex; });
    }

    var secondaryChartsShown = 0;
    for (var j = 0; j < charts.secondaries.length; j++) {
        if (charts.secondaries[j]) {
            secondaryChartsShown++;
        }
    }
    containers.secondaries
        .filter(function(d, index) { return index < secondaryChartsShown; })
        .style('flex', '1');
    containers.secondaries
        .filter(function(d, index) { return index >= secondaryChartsShown; })
        .style('flex', '0');
    containers.overlaySecondaries
        .filter(function(d, index) { return index < secondaryChartsShown; })
        .style('flex', '1');
    containers.overlaySecondaries
        .filter(function(d, index) { return index >= secondaryChartsShown; })
        .style('flex', '0');

    var headRowHeight = parseInt(containers.app.select('.head-row').style('height'), 10);
    if (!renderedOnce) {
        headRowHeight +=
          parseInt(containers.app.select('.head-row').style('padding-top'), 10) +
          parseInt(containers.app.select('.head-row').style('padding-bottom'), 10) +
          parseInt(containers.app.select('.head-row').style('margin-bottom'), 10);
        renderedOnce = true;
    }

    var useableScreenHeight = window.innerHeight - headRowHeight;

    containers.charts
      .style('height', useableScreenHeight + 'px');

    charts.xAxis.dimensionChanged(containers.xAxis);
    charts.navbar.dimensionChanged(containers.navbar);
    charts.primary.dimensionChanged(containers.primary);
    for (var i = 0; i < charts.secondaries.length; i++) {
        charts.secondaries[i].option.dimensionChanged(getSecondaryContainer(i));
    }
}
