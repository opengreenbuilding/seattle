define([
  'jquery',
  'underscore',
  'backbone',
  './scorecard',
  './charts/fuel',
  './charts/shift',
  './charts/building_type_table',
  'text!templates/layout/scorecards/city_scorecard.html'
], function($, _, Backbone, ScoreCardBaseView, FuelUseView, ShiftView, BuildingTypeTableView, ScorecardTemplate){
  var CityScorecard = ScoreCardBaseView.extend({

    initialize: function(options){
      CityScorecard.__super__.initialize.apply(this, [options]);

      this.listenTo(this.state, 'change:city_report_active', this.onReportActive);
      this.template = _.template(ScorecardTemplate);

      // this.render();
      return this;
    },

    close: function() {
      this.state.set({city_report_active: false});
    },

    isActive: function() {
      return this.state.get('city_report_active');
    },

    renderScorecard: function() {
      console.log('City renderScorecard');
      this.show();
    },

    buildingStats: function(buildings) {
      return {
        reporting: this.formatters.fixedZero(buildings.length),
        required: '???',
        pct: '??'
      };
    },

    compliance: function(buildings) {
      return {
        consumption: this.formatters.fixedZero(d3.sum(buildings.pluck('total_kbtu'))),
        ghg: this.formatters.fixedZero(d3.sum(buildings.pluck('total_ghg_emissions'))),
        gfa: this.formatters.fixedZero(d3.sum(buildings.pluck('reported_gross_floor_area')))
      }
    },

    show: function() {
      var scorecardState = this.state.get('scorecard');
      var buildings = this.state.get('allbuildings');
      var year = this.state.get('year');
      var view = scorecardState.get('view');
      var scorecardConfig = this.state.get('city').get('scorecard');

      var compareField = view === 'eui' ? 'site_eui' : 'energy_star_score';

      this.$el.html(this.template({
        stats: this.buildingStats(buildings),
        compliance: this.compliance(buildings),
        year: year,
        view: view,
        value: this.formatters.fixedOne(d3.median(buildings.pluck(compareField)))
      }));

      if (!this.chart_fueluse) {
        this.chart_fueluse = new FuelUseView({
          formatters: this.formatters,
          data: buildings
        });
      }

      this.$el.find('#fuel-use-chart').html(this.chart_fueluse.render());


      if (!this.chart_shift) {
        this.chart_shift = new ShiftView({
          formatters: this.formatters,
          data: null
        });
      }

      this.chart_shift.render(t => {
        this.$el.find('#compare-shift-chart').html(t);
      });

      if (!this.building_table) {
        this.building_table = new BuildingTypeTableView({
          formatters: this.formatters,
          data: buildings,
          year,
          schema: scorecardConfig.thresholds.eui_schema,
          thresholds: scorecardConfig.thresholds.eui
        });
      }

      this.$el.find('#building-type-table').html(this.building_table.render())

      return this;
    },
  });

  return CityScorecard;
});