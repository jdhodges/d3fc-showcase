(function(d3, fc, sc) {
    'use strict';

    sc.util.getSVG = function(element, path, callback) {
        d3.xml(path, 'image/svg+xml', function(xml) {
            callback(element, xml.documentElement);
        });
    };
})(d3, fc, sc);