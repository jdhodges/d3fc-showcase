import d3 from 'd3';
import event from '../event';
import head from './head';
import overlay from './overlay';
import navReset from './navigationReset';
import selectors from './selectors';

export default function() {
    var dispatch = d3.dispatch(
        event.primaryChartIndicatorChange,
        event.secondaryChartChange,
        event.dataProductChange,
        event.dataPeriodChange,
        event.clearAllPrimaryChartIndicatorsAndSecondaryCharts,
        event.resetToLatest,
        event.primaryChartSeriesChange);

    var _head = head()
        .on(event.dataProductChange, dispatch[event.dataProductChange])
        .on(event.dataPeriodChange, dispatch[event.dataPeriodChange])
        .on(event.clearAllPrimaryChartIndicatorsAndSecondaryCharts,
            dispatch[event.clearAllPrimaryChartIndicatorsAndSecondaryCharts]);

    var _overlay = overlay()
        .on(event.dataProductChange, dispatch[event.dataProductChange])
        .on(event.primaryChartIndicatorChange, dispatch[event.primaryChartIndicatorChange])
        .on(event.secondaryChartChange, dispatch[event.secondaryChartChange]);

    var _navReset = navReset()
        .on(event.resetToLatest, dispatch[event.resetToLatest]);

    var _selectors = selectors()
        .on(event.primaryChartSeriesChange, dispatch[event.primaryChartSeriesChange])
        .on(event.primaryChartIndicatorChange, dispatch[event.primaryChartIndicatorChange])
        .on(event.secondaryChartChange, dispatch[event.secondaryChartChange]);

    var menu = function(selection) {
        selection.each(function(model) {
            var container = d3.select(this);

            container.select('.head-menu')
                .datum(model.head)
                .call(_head);

            container.select('#overlay')
                .datum(model.overlay)
                .call(_overlay);

            container.select('#navbar-reset')
                .datum(model.navReset)
                .call(_navReset);

            container.selectAll('.selectors')
                .datum(model.selectors)
                .call(_selectors);
        });
    };

    d3.rebind(menu, dispatch, 'on');

    return menu;
}
