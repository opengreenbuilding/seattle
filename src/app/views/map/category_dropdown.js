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
        this.$el.html("<div class='toolbar-control-button'><i class='far fa-align-justify'></i></div>");

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
