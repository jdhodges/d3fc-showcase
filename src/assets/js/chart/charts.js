import d3 from 'd3';
import fc from 'd3fc';
import event from '../event';
import legend from './legend';
import nav from './nav';
import primary from './primary';
import multiChart from './multiChart';
import xAxis from './xAxis';

export default function() {
    var dispatch = d3.dispatch(event.viewChange, event.crosshairChange);
    var _legend = legend();

    var _nav = nav()
        .on(event.viewChange, dispatch[event.viewChange]);

    var _primary = primary()
        .on(event.viewChange, dispatch[event.viewChange])
        .on(event.crosshairChange, dispatch[event.crosshairChange]);

    var _secondaries = multiChart()
        .on(event.viewChange, dispatch[event.viewChange]);

    var _xAxis = xAxis();

    function charts(selection) {
        selection.each(function(model) {
            selection.select('#legend')
                .datum(model.legend)
                .call(_legend);

            selection.select('#navbar-container')
                .datum(model.nav)
                .call(_nav);

            selection.select('#primary-container')
                .datum(model.primary)
                .call(_primary);

            selection.select('#secondaries-container')
                .datum(model.secondary)
                .call(_secondaries);

            selection.select('#x-axis-container')
                .datum(model.xAxis)
                .call(_xAxis);
        });
    }

    charts.legend = function() {
        return _legend;
    };

    charts.nav = function() {
        return _nav;
    };

    charts.primary = function() {
        return _primary;
    };

    charts.secondaries = function() {
        return _secondaries;
    };

    charts.xAxis = function() {
        return _xAxis;
    };

    d3.rebind(charts, dispatch, 'on');

    return charts;
}
