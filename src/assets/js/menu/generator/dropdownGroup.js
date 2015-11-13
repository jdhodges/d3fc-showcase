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
            var ul = dataJoin(selection, [model.options]);

            var config = {};

            selection.each(function() {
                config.title = this.getAttribute('component-title');
                config.careted = this.hasAttribute('careted');
                config.listIcons = this.hasAttribute('list-icons');
                config.icon = this.hasAttribute('icon');
            });

            ul.attr('class', 'dropdown-menu');

            var li = ul.selectAll('li')
                .data(fc.util.fn.identity);

            li.enter()
                .append('li')
                .on('click', dispatch.optionChange)
                .append('a')
                .attr('href', '#')
                .each(function(d) {
                    if (config.listIcons) {
                        sc.util.getSVG(this, d.icon, function(element, svg) {
                            element.appendChild(svg);
                            element.innerHTML += d.displayString;
                        });
                    } else {
                        this.textContent = d.displayString;
                    }
                });

            selection.select('.dropdown-toggle').each(function() {
                if (config.icon) {
                    sc.util.getSVG(this, model.options[selectedIndex].icon, function(element, svg) {
                        element.innerHTML = '';
                        element.appendChild(svg);
                    });
                } else {
                    this.textContent = config.title || model.options[selectedIndex].displayString;
                    if (config.careted) {
                        this.innerHTML += '<span class="caret"></span>';
                    }
                }
            });

        }

        d3.rebind(dropdownGroup, dispatch, 'on');

        return dropdownGroup;
    };

})(d3, fc, sc);