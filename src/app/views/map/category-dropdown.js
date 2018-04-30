define(['jquery', 'underscore', 'backbone', 'text!templates/map_controls/category-dropdown.html',], 
  function($, _, Backbone, MapCategoryDropdownTemplate){
    var CategoryDropdownView = Backbone.View.extend({
      $container: $('#toolbar'),
      className: 'toolbar-control-container',  

      initialize: function(state) {
        this.state = state;
        this.render();
      },

      render: function() {
        this.$el.appendTo(this.$container);
        const template = _.template(MapCategoryDropdownTemplate);
        this.$el.html(template({
          content: "fas fa-bars"
        }));

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
