define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/map/year_control_mobile.html',
], function ($, _, Backbone, YearControlMobileTemplate) {
    var YearControlMobileView = Backbone.View.extend({
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

            var template = _.template(YearControlMobileTemplate);
            this.$el.html(template({
                years: _.keys(city.get('years')),
                current_year: this.state.get('year'),
            }));

            return this;
        },

        events: {
            'click': 'selectYear',
        },

        selectYear: function (event) {
            event.preventDefault();
            var year = event.target.innerHTML;
            this.state.set({ year: year });
        },
    });

    return YearControlMobileView;
});
