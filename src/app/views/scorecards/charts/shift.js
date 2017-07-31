define([
  'jquery',
  'underscore',
  'backbone',
  'd3',
  'text!templates/scorecards/charts/shift.html'
], function($, _, Backbone, d3, ShiftTemplate){

  var ShiftView = Backbone.View.extend({
    className: 'shift-chart',

    initialize: function(options){
      this.template = _.template(ShiftTemplate);
      this.formatters = options.formatters;
      this.data = options.data;
    },

    calculateChange: function() {
      const years = [];

      const change_key = 'emissions';
      this.data.filter(o => {
        return o.key === change_key;
      }).forEach(o => {
        years.push({
          yr: o.year,
          val: o.value
        });
      });

      years.sort((a,b) => {
        return a.yr - b.yr;
      });

      var last = years.length - 1;
      return ((years[last].val - years[last - 1].val) / years[last].val) * 100;
    },

    extractChangeData: function() {
      this.data.sort((a,b) => {
        return a.year - b.year;
      });

      const years = d3.extent(this.data, d => d.year);

      const change = this.calculateChange();

      const direction = (change < 0) ? 'decreased' : 'increased';

      return {
        chart: this.data,
        template: {
          pct: this.formatters.fixedOne(Math.abs(change)) + '%',
          direction,
          years
        }
      };
    },

    renderChangeChart: function(data, selector) {
      const container = d3.select(selector);

      var rootElm = container.select('#change-chart-vis');
      var yearsElm = container.select('#change-chart-years');

      var diameter = 10;
      var yearExtent = d3.extent(data, function(d){ return d.year;});
      var valueExtent = d3.extent(data, function(d) { return d.value; });

      var yearWidth = yearsElm.select('p').node().offsetWidth;
      var baseWidth = yearsElm.node().offsetWidth - (yearWidth * 2);

      baseWidth += diameter;

      rootElm.style('margin-left', (yearWidth - diameter/2) + 'px');

      var margin = {top: 0, right: 0, bottom: 0, left: 0},
          width = baseWidth - margin.left - margin.right,
          height = rootElm.node().offsetHeight - margin.top - margin.bottom;

      var svg = rootElm.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var x = d3.scale.ordinal()
          .range([0, width])
          .domain(yearExtent);

      var y = d3.scale.linear()
          .domain(valueExtent)
          .range([height, 0]);

      var line = d3.svg.line()
          .x(function(d) { return x(d.year); })
          .y(function(d) { return y(d.value); });

      var connections = d3.nest()
        .key(d => d.label)
        .entries(data);

      svg.selectAll('.line')
        .data(connections)
      .enter().append('path')
        .attr('class', 'line')
        .attr('d', d => line(d.values));

      var bar = svg.selectAll('.dot')
          .data(data)
        .enter().append('g')
          .attr('class', 'dot')
          .classed('avg', d => d.isAvg)
          .attr('transform', d => { return 'translate(' + x(d.year) + ',' + y(d.value) + ')'; });

      bar.append('circle')
        .attr('r', 5);

      var firstyear = x.domain()[0];
      var lastyear = x.domain()[1];

      var label = rootElm.selectAll('.label')
        .data(data)
      .enter().append('div')
        .attr('class', 'label')
        .classed('avg', d => d.isAvg)
        .style('left', d => {
          if (d.year === firstyear) return x(d.year) + 'px';
          return x(d.year) + 10 +'px';
        })
        .style('top',  d => { return y(d.value) + 'px'; });

      label.append('p')
        .text(d => this.formatters.fixedOne(d.value));
      label.append('p')
        .attr('class','metric small')
        .text('kbtu/sf');

      label.each(function(d) {
        var el = d3.select(this);
        var w = el.node().offsetWidth;

        if (d.year === firstyear) {
          el.style('margin-left', -(w + 10) + 'px');
        }
      });

      label.filter(d => d.year === lastyear)
        .append('span')
          .attr('class', 'building')
          .classed('avg', d => d.isAvg)
          .text(d => d.label);
    },

    query: function() {
      return 'SELECT year,SUM(total_ghg_emissions) as emissions,SUM(total_kbtu) as consumption FROM (SELECT year, COALESCE(total_ghg_emissions, 0) as total_ghg_emissions, COALESCE(total_kbtu, 0) as total_kbtu FROM table_2015_stamen_phase_ii_v2_w_year)q GROUP BY year';
    },

    loadData: function(cb) {
      d3.json(`https://cityenergy-seattle.carto.com/api/v2/sql?q=${this.query()}`, (d) => {
        return cb(d);
      });
    },

    chartData: function(cb) {
      if (!this.data) {
        this.loadData((data) => {
          if (!data) {
            console.error('Problem loading citywide change data!');
            return;
          }

          this.data = [];
          data.rows.forEach(obj => {
            this.data.push({
              label: 'Citywide GHG emissions',
              key: 'emissions',
              value: +(obj.emissions.toFixed(1)),
              year: obj.year,
              isAvg: false
            });

            this.data.push({
              label: 'Citywide Total Energy Consumption',
              key: 'consumption',
              value: +(obj.consumption.toFixed(1)),
              year: obj.year,
              isAvg: false
            });
          });

          cb(this.extractChangeData());
        });
      } else {
        cb(this.extractChangeData());
      }
    },

    render: function(cb, viewSelector){
      this.chartData((d) => {
        cb(this.template(d.template));
        this.renderChangeChart(d.chart, viewSelector);
      });
    }
  });

  return ShiftView;
});
