define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/map/year_dropdown.html',
], function ($, _, Backbone, YearDropdownTemplate) {
    var YearDropdown = Backbone.View.extend({
        $container: $('#year-select-container'),
        className: 'year-dropdown',

        initialize: function (options) {
            this.state = options.state;
            this.listenTo(this.state, 'change:city', this.onCityChange);
        },

        onCityChange: function () {
            this.listenTo(this.state.get('city'), 'sync', this.onCitySync);
        },

        onCitySync: function () {
            this.render();
        },

        render: function () {
            var city = this.state.get('city');

            this.$el.appendTo(this.$container);

            var template = _.template(YearDropdownTemplate);
            this.$el.html(template({
                years: _.keys(city.get('years')),
                current_year: this.state.get('year'),
            }));

            return this;
        },
    });

    return YearDropdown;
});
