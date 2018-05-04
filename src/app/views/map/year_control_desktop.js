define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/map/year_control_desktop.html',
], function($, _, Backbone, YearControlDesktopTemplate) {
  var YearControlDesktopView = Backbone.View.extend({
    $container: $('#year-select-container'),
    className: 'year-control',

    initialize: function(options) {
      this.state = options.state;
      this.listenTo(this.state, 'change:city', this.onCityChange);
    },

    onCityChange: function() {
      this.listenTo(this.state.get('city'), 'sync', this.onCitySync);
    },

    onCitySync: function() {
      this.render();
    },

    render: function() {
      var city = this.state.get('city');

      this.$el.appendTo(this.$container);

      var template = _.template(YearControlDesktopTemplate);
      this.$el.html(template({
        years: _.keys(city.get('years')),
        current_year: this.state.get('year'),
      }));

      return this;
    },

    events: {
      'change input': 'selectYear',
    },

    selectYear: function(event) {
      var year = $(event.target).val();
      this.state.set({year: year});
    },
  });

  return YearControlDesktopView;
});
