define(["jquery", "backbone"], function($, Backbone) {
  var closed = `<div>Filters</div>
    <svg fill='#000000' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
      <path d='M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z'/> <path d='M0-.25h24v24H0z' fill='none'/>
    </svg>`;

  var open = `<svg fill='#000000' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
    <path d='M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z'/>
    <path d='M0-.5h24v24H0z' fill='none'/>
  </svg>`;

  var MapControlsView = Backbone.View.extend({
    el: "#map-controls",
    initialize: function(options) {
      var self = this;
      this.state = options.state;
      this.isOpen = options.isOpen;
      this.listenTo(this.state, 'change:building_compare_active', this.render);

      $(window).on('resize', function () {
        var isCompareActive = options.state.get('building_compare_active')
        if (window.innerWidth < 900 && isCompareActive) {
          $('.main-container').removeClass('compare-mode');
          options.state.set({'building_compare_active': false})
        }
      });

      this.render();
    },

    events: {
      "click #map-controls--toggle": function(e) {
        e.stopPropagation();
        this.isOpen = !this.isOpen;
        this.render();
      }
    },

    render: function() {
      var isCompareModeActive = this.state.get("building_compare_active") || false;
      var $mapControlsCounts = $('#map-controls-counts')
      var $toggle = this.$("#map-controls--toggle");

      if (isCompareModeActive && !this.isOpen) {
        this.isOpen = true;
      } 
      if (isCompareModeActive) {
        $mapControlsCounts.css({ "background": "none", "padding-top": "20px" })
      }
      if (!isCompareModeActive) {
        $mapControlsCounts.css({ "background": "#f2f2f2", "padding-top": "0" })
      }
      if (this.isOpen) {
        $toggle.html(open);
        this.$el.removeClass("closed");
      } else {
        $toggle.html(closed);
        this.$el.addClass("closed");
      }
      return this;
    }
  });

  return MapControlsView;
});
