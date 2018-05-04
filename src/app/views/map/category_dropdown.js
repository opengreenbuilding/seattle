const bars = '<svg xmlns="http://www.w3.org/2000/svg" fill="white" width="24" height="24" viewBox="0 0 448 512"><path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"/></svg>'

define([
  'jquery',
  'underscore',
  'backbone', 
], function($, _, Backbone){
    var CategoryDropdownView = Backbone.View.extend({
      $container: $('#toolbar'),
      className: 'toolbar-control-container',  

      initialize: function(state) {
        this.state = state;
        this.render();
      },

      render: function() {
        this.$el.appendTo(this.$container);
        this.$el.html(`<div class='toolbar-control-button'>${bars}</div>`);

        return this;
      },

      events: {
        'click' : 'toggleDisplay'
      },

      toggleDisplay: function(event) {
        const $dropdownWrapper = $('.dropdown-wrapper');
        if (this.state.isOpen == false) {
          $dropdownWrapper.css("display", "block")
          this.state.isOpen = !this.state.isOpen;
        } else if (this.state.isOpen == true) {
            $dropdownWrapper.css("display", "none")
            this.state.isOpen = !this.state.isOpen;
        }
      }
    })
  return CategoryDropdownView;
});
