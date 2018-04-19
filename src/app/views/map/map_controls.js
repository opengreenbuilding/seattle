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
      options = options || {};
      this.isOpen = options.isOpen || true;
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
      var $toggle = this.$("#map-controls--toggle");
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
