(function(factory) {
    if(typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
    else if(typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    }
    else {
        factory(jQuery);
    }
}
(function($) {
    var pluginName = "tinycarousel"
    ,   defaults   =
        {
            start: 0
        ,   axis: "x"
        ,   buttons: true
        ,   bullets: false
        ,   interval: false
        ,   intervalTime: 300
        ,   animation: true
        ,   animationTime:2000
        ,   infinite: false
        }
    ;

    function Plugin($container, options) {
        /**
         * The options of the carousel extend with the defaults.
         *
         * @property options
         * @type Object
         * @default defaults
         */
        this.options = $.extend({}, defaults, options);

        /**
         * @property _defaults
         * @type Object
         * @private
         * @default defaults
         */
        this._defaults = defaults;

        /**
         * @property _name
         * @type String
         * @private
         * @final
         * @default 'tinycarousel'
         */
        this._name = pluginName;

        var self = this
        ,   $viewport = $container.find(".viewport:first")
        ,   $overview = $container.find(".overview:first")
        ,   $slides = null
        ,   $next = $container.find(".next:first")
        ,   $prev = $container.find(".prev:first")
        ,   $bullets = $container.find(".bullet")

        ,   viewportSize = 0
        ,   contentStyle = {}
        ,   slidesVisible = 0
        ,   slideSize = 0
        ,   slideIndex = 0

        ,   isHorizontal = this.options.axis === 'x'
        ,   sizeLabel = isHorizontal ? "Width" : "Height"
        ,   posiLabel = isHorizontal ? "left" : "top"
        ,   intervalTimer = null
        ;

        /**
         * The index of the current slide.
         *
         * @property slideCurrent
         * @type Number
         * @default 0
         */
        this.slideCurrent = 0;

        /**
         * The number of slides the carousel is currently aware of.
         *
         * @property slidesTotal
         * @type Number
         * @default 0
         */
        this.slidesTotal = 0;

        /**
         * If the interval is running the value will be true.
         *
         * @property intervalActive
         * @type Boolean
         * @default false
         */
        this.intervalActive = false;

        /**
         * @method _initialize
         * @private
         */
        function _initialize() {
            self.update();
            self.move(self.slideCurrent);

            _setEvents();

            return self;
        }

        /**
         * You can use this method to add new slides on the fly. Or to let the carousel recalculate itself.
         *
         * @method update
         * @chainable
         */
        this.update = function() {
            $overview.find(".mirrored").remove();

            $slides = $overview.children();
            viewportSize = $viewport[0]["offset" + sizeLabel];
            slideSize = $slides.first()["outer" + sizeLabel](false);
            self.slidesTotal = $slides.length;
            self.slideCurrent = self.options.start || 0;
            slidesVisible = Math.ceil(viewportSize / slideSize);

            / * $overview.append($slides.slice(0, slidesVisible).clone().addClass("mirrored")); */
            $overview.css(sizeLabel.toLowerCase(), slideSize * (self.slidesTotal + slidesVisible));

            _setButtons();

            return self;
        };

        /**
         * @method _setEvents
         * @private
         */
        function _setEvents() {
            if(self.options.buttons) {
                $prev.click(function() {
                    self.move(--slideIndex);

                    return false;
                });


                $next.click(function() {
                    self.move(++slideIndex);

                    return false;
                });
            }

            $(window).resize(self.update);

            if(self.options.bullets) {
                $container.on("click", ".bullet", function() {
                    self.move(slideIndex = +$(this).attr("data-slide"));

                    return false;
                });
            }
        }


        /**
         * If the interval is stoped start it.
         *
         * @method start
         * @chainable
         */
        this.start = function() {
            if(self.options.interval) {
                clearTimeout(intervalTimer);

                self.intervalActive = true;

                intervalTimer = setTimeout(function() {
                    self.move(++slideIndex);

                }, self.options.intervalTime);
            }

            return self;
        };

        /**
         * If the interval is running stop it.
         *
         * @method start
         * @chainable
         */
        this.stop = function() {
            clearTimeout(intervalTimer);

            self.intervalActive = false;

            return self;
        };

        /**
         * Move to a specific slide.
         *
         * @method move
         * @chainable
         * @param {Number}  [index] The slide to move to.
         */
        this.move = function(index) {
            slideIndex = isNaN(index) ? self.slideCurrent : index;
            self.slideCurrent = slideIndex % self.slidesTotal;

            if(slideIndex < 0) {
                self.slideCurrent = slideIndex = self.slidesTotal - 1;
                $overview.css(posiLabel, -(self.slidesTotal) * slideSize);
            }

            if(slideIndex > self.slidesTotal) {
                self.slideCurrent = slideIndex = 1;
                $overview.css(posiLabel, 0);
            }
            contentStyle[posiLabel] = -slideIndex * slideSize;

            $overview.animate(
                contentStyle
            ,   {
                    queue : false
                ,   duration : self.options.animation ? self.options.animationTime : 0
                ,   always : function() {
                       /**
                        * The move event will trigger when the carousel slides to a new slide.
                        *
                        * @event move
                        */
                        $container.trigger("move", [$slides[self.slideCurrent], self.slideCurrent]);
                    }
                });

            _setButtons();
            self.start();

            return self;
        };

        /**
         * @method _setButtons
         * @private
         */
        function _setButtons() {
            if(self.options.buttons && !self.options.infinite) {
                $prev.toggleClass("disable", self.slideCurrent <= 0);
                $next.toggleClass("disable", self.slideCurrent >= self.slidesTotal - slidesVisible);
            }

            if(self.options.bullets) {
                $bullets.removeClass("active");
                $($bullets[self.slideCurrent]).addClass("active");
            }
        }

        return _initialize();
    }

    /**
    * @class tinycarousel
    * @constructor
    * @param {Object} options
        @param {Number}  [options.start=0] The slide to start with.
        @param {String}  [options.axis=x] Vertical or horizontal scroller? ( x || y ).
        @param {Boolean} [options.buttons=true] Show previous and next navigation buttons.
        @param {Boolean} [options.bullets=false] Is there a page number navigation present?
        @param {Boolean} [options.interval=false] Move to another block on intervals.
        @param {Number}  [options.intervalTime=3000] Interval time in milliseconds.
        @param {Boolean} [options.animate=true] False is instant, true is animate.

        @param {Number}  [options.animationTime=1000] How fast must the animation move in ms?
        @param {Boolean} [options.infinite=true] Infinite carousel.
    */
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if(!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin($(this), options));
            }
        });
    };
}));




/* menu start */

(function($) {

  $.fn.menumaker = function(options) {
      
      var cssmenu = $(this), settings = $.extend({
        title: " ",
        format: "dropdown",
        sticky: false
      }, options);

      return this.each(function() {
        cssmenu.prepend('<div id="menu-button">' + settings.title + '</div>');
        $(this).find("#menu-button").on('click', function(){
          $(this).toggleClass('menu-opened');
          var mainmenu = $(this).next('ul');
          if (mainmenu.hasClass('open')) { 
            mainmenu.hide().removeClass('open');
          }
          else {
            mainmenu.show().addClass('open');
            if (settings.format === "dropdown") {
              mainmenu.find('ul').show();
            }
          }
        });

        cssmenu.find('li ul').parent().addClass('has-sub');

        multiTg = function() {
          cssmenu.find(".has-sub").prepend('<span class="submenu-button"></span>');
          cssmenu.find('.submenu-button').on('click', function() {
            $(this).toggleClass('submenu-opened');
            if ($(this).siblings('ul').hasClass('open')) {
              $(this).siblings('ul').removeClass('open').hide();
            }
            else {
              $(this).siblings('ul').addClass('open').show();
            }
          });
        };

        if (settings.format === 'multitoggle') multiTg();
        else cssmenu.addClass('dropdown');

        if (settings.sticky === true) cssmenu.css('position', 'fixed');

        resizeFix = function() {
          if ($( window ).width() >=768) {
            cssmenu.find('ul').show();
			 
          }

          if ($(window).width() < 768) {
            cssmenu.find('ul').hide().removeClass('open');
			cssmenu.find('ul').hide().removeClass('overview');
          }
        };
        resizeFix();
        return $(window).on('resize', resizeFix);

      });
  };
})(jQuery);

(function($){
$(document).ready(function(){

$("#cssmenu").menumaker({
   title: " ",
   format: "multitoggle"
});

});
})(jQuery);



/* menu end */
