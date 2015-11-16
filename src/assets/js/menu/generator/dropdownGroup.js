(function(d3, fc, sc) {
    'use strict';

    sc.menu.generator.dropdownGroup = function() {
        var dispatch = d3.dispatch('optionChange');

        var dataJoin = fc.util.dataJoin()
            .selector('ul')
            .element('ul');

        function dropdownGroup(selection) {
            var selectedIndex = selection.datum().selectedIndex || 0;
            var model = selection.datum();

            var config = model.config;

            var ul = dataJoin(selection, [model.options]);
            ul.attr('class', 'dropdown-menu');

            var li = ul.selectAll('li')
                .data(fc.util.fn.identity);

            li.enter()
                .append('li')
                .on('click', dispatch.optionChange)
                .append('a')
                .attr('href', '#')
                .each(function(d) {
                    var currentSelection = d3.select(this);

                    if (config.listIcons) {
                        sc.util.getSVG(d.icon, function(svg) {
                            currentSelection.html(function() {
                                return svg.outerHTML + d.displayString;
                            });
                        });
                        return;
                    }

                    currentSelection.text(function() {
                        return d.displayString;
                    });
                });

            selection.select('.dropdown-toggle')
                .each(function() {
                    var currentSelection = d3.select(this);

                    if (config.icon) {
                        sc.util.getSVG(model.options[selectedIndex].icon, function(svg) {
                            currentSelection.html(function() {
                                return svg.outerHTML;
                            });
                        });
                    } else {
                        currentSelection.text(function() {
                            return config.title || model.options[selectedIndex].displayString;
                        });
                    }

                    if (config.careted) {
                        currentSelection
                            .append('span')
                            .attr('class', 'caret');
                    }
                });
        }

        d3.rebind(dropdownGroup, dispatch, 'on');

        return dropdownGroup;
    };

})(d3, fc, sc);