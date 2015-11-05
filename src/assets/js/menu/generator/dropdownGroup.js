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

            ul.attr('class', 'dropdown-menu');

            var li = ul.selectAll('li')
                .data(fc.util.fn.identity);

            li.enter()
                .append('li')
                .on('click', dispatch.optionChange)
                .append('a')
                .attr('href', '#');

            li.select('a')
                .text(function(d) { return d.displayString; });

            selection.select('#product-dropdown-button').html(function(d) {
                return model.options[selectedIndex].displayString + '<span class="caret"></span>';
            });
        }

        d3.rebind(dropdownGroup, dispatch, 'on');

        return dropdownGroup;
    };

})(d3, fc, sc);