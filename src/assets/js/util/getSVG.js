(function(d3, fc, sc) {
    'use strict';

    sc.util.getSVG = function(path, callback) {
        d3.xml(path, 'image/svg+xml', function(xml) {
            callback(xml.documentElement);
        });
    };
})(d3, fc, sc);