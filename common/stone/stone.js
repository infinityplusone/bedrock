/*
 * Name: stone.js
 * Description: Please provide a description for your component.
 * Dependencies: bedrock
 * 
 * Author(s): infinityplusone
 * Version:    0.1.0
 * Date:       2016-03-02
 *
 * Notes: 
 *
 *
 */
define([
  'text!./stone.hbs',
  'bedrock'
], function(tmpl) {

  function StoneError(message, stone) {
    this.name = 'StoneError';
    this.message = message || '';
    this.stone = stone;
  }
  StoneError.prototype = Error.prototype;

  bedrock.handlebars.addTemplates(tmpl);

  var $body = $('body');

  var defaultSettings = {
    _ix: {},
    options: {
      inheritClasses: true
    }
  }; // defaultSettings

  var Stone = bedrock.utils.bindable.create({
    cls: ['stone'],
    meta: {
      author: 'infinityplusone',
      description: 'Please add a description for this stone.',
      displayType: 'Stone'
    },
    templates: {},
    wrapper: 'stone-base',
    type: 'base',
    /**
     * Add custom interactions to all instances of a stone type
     * Interactions should be bound to `this.$elem`
     * @overridable
     */
    _addInteractions: function() {
      // override this method to create your own stone-level interactions
    }, // addInteractions

    /**
     * Add default interactions based on a stone's options
     * Interactions are bound to `this.$elem`
     * Also looks at stone's markup for cross-stone references and attempts to bind those interactions as well
     */
    _addDefaultInteractions: function() {
      var stone = this;

      // Ignoring namespacing for now, but might want to add some namespacing for the data attribute, like data-bedrock-click
      // Also, this currently assumes targets will be stones. This should also be (easily) generalizable.
      stone.$elem.on('click', '[data-click][data-target]', function(e) {
        var $targetStone = $(this.getAttribute('data-target')),
            target = !!$targetStone.data('stone') ? $targetStone.data('stone') : $targetStone.data('bucket'),
            method = this.getAttribute('data-click'),
            args = $(this).data();
        if(!!target && !!target[method]) {
          return target[method].call(target, e, args);
        }
        return false;
      });
    }, // _addDefaultInteractions

    /**
     * Sets the stone's `cls` property based on inheritance
     * Question: What happens if inheritClasses is on for a child of one for which it is off?
     */
    _applyClasses: function() {
      var stone = this,
          cls = stone._getCssClasses();

      if(this.options.inheritClasses) {
        while(!!stone.type) {
          cls = cls.concat(stone._getCssClasses());
          stone = Object.getPrototypeOf(stone);
        }
      }
      this.cls = $.unique(cls);
    }, // _applyClasses

    /**
     * Wrap a stone's content in a wrapper
     * @param wrapper {String} [optional]
     */
    _applyWrapper: function(wrapper) {
      this._applyClasses();
      wrapper = wrapper ? wrapper : this.wrapper;
      if(typeof bedrock.templates[wrapper]==='undefined') {
        throw new StoneError('Unrecognized wrapper `' + wrapper + '` for ' + this.toString(), this);
      }
      this.$elem =$(bedrock.templates[wrapper](this));
    }, // _applyWrapper

    /**
     * Binds a stone to to its DOM element
     */
    _bindStoneToElement: function() {
      this.$elem.data('stone', this);
    }, // _bindStoneToElement

    /**
     * Make modifications to a stone after the markup has been generated but before interactions have been bound to it.
     * @overridable
     */
    _enhanceStone: function() {}, // _enhanceStone

    /**
     * Generates a stone's markup
     * This method *must* create a jQuery-wrapped HTML element and assign it to the stone's $elem property
     * @overridable
     */
    _generateMarkup: function() {
      // don't allow any stone's columns to be greater than its bucket's
      this.content = bedrock.templates[this.templates.content](this.data);
      this._applyWrapper();
    }, // _generateMarkup

    /**
     * @return {Array} The stone's default auto-generated class STONETYPE-stone
     */
    _getCssClasses: function() {
      var cls = [];
      for(var i in this._ix) {
        if(this.options[i]) {
          cls.push('is-' + i);
        }
      }
      // if the stone isn't the `base` stone type, add its classes to this stone's classes
      if(this.type!=='base') {
        if(!!this.options.cls) { // if the stone has any classes defined in its options, add them here.
          cls = cls.concat(this.options.cls.split(' '));
        }
        return cls.concat('stone', this.type + '-stone', this.cls);
      }
      return cls.concat(this.cls);
    }, // getCssClasses

    /**
     * First thing called by the stone's `generate` method
     * Meant for any data prep/massaging
     * @overridable
     */
    _prepStone: function() {  }, // prepStone



    /**
     * These methods are accessible to the outside world
     * These are meant to be used by a stone's manager
     * Each of these methods triggers a custom event of type: `stone:METHOD`
     */


    /**
     * Deselect a stone
     */
    deselect: function() {
      if(this.selected) {
        this.selected = false;
        this.$elem
          .removeClass('selected');
        this.trigger('stone:deselect');
      }
      return this;
    }, // deselect

    /**
     * Destroy a stone
     * @params opts {Objects} Options for how the stone's element gets removed (not currently used)
     * Note: Doesn't handle removal from bucket (stones should be removed *by* the bucket). Shitty.
     */
    destroy: function(destroy) {
      var stone = this;
      stone.on('stone:ready', function() {
        stone.$elem.remove();
        if(stone.$ref && destroy) {
          stone.$ref.remove();
        }
        stone.$elem.unbind();
        stone.trigger('stone:destroy');
        stone.unbind();
        if(typeof destroy==='function') {
          destroy();
        }
      });
      if(!stone.state.busy) {
        stone.ready(false);
      }
    }, // destroy

    /**
     * Display a stone
     * @param {Boolean} If true, adds a `recently-added` class to the element
     *                  then removes it after 500ms
     */
    display: function(highlight) {
      this.ready(true);
      this.trigger('stone:display');
      return this;
    }, // display

    /**
     * Generate a stone
     * Calls the following (overridable) methods in this order:
     *  1. this._prepStone
     *  2. this._generateMarkup
     *  3. this._bindStoneToElement
     *  4. this._enhanceStone
     *  5. this._addDefaultInteractions
     *  6. this._addInteractions
     */
    generate: function() {
      $.extend(this.data, {id: this.id});
      this.options = $.extend({}, Stone.options, this.options);
      if(this.options.commentable || this.options.dismissable || this.options.flaggable || this.options.pinnable || this.options.shareable) {
        this.options.utilityBar = true;
      }

      this.state = {
        ready: false,
        selected: false
      };
      this._prepStone();
      this._generateMarkup();
      if(typeof this.$elem!=='object') {
        throw new StoneError('_generateMarkup failed to create a DOM element for ' + this.toString(), this);
      }
      this._bindStoneToElement();
      this._enhanceStone();
      this._addDefaultInteractions();
      this._addInteractions();
      this.trigger('stone:generate');
    }, // generate

    /**
     * Hide a stone
     * @param effect {String} Choose an animation for the element
    */
    hide: function(effect) {
      var stone = this;
      stone.state.busy = true;

      switch(effect) {
        case 'fade':
          stone.$elem.animate({opacity: 0}, function() {
            stone.ready(false);
            stone.$elem.css({opacity: ''});
          });
          break;
        case 'blind':
          stone.$elem.css({overflow: 'hidden', maxHeight: stone.$elem.height(), height: stone.$elem.height()}).animate({maxHeight: 0, minHeight: 0}, function() {
            stone.$elem.animate({opacity: 0}, 100, function() {
              stone.ready(false);
              stone.$elem.css({opacity: '', overflow: '', height: '', maxHeight: '', minHeight: ''});
            });
          });
          break;
        case 'slideleft':
          stone.$elem.animate({left: '-100%'}, function() {
            stone.$elem.animate({opacity: 0}, 100, function() {
              stone.ready(false);
              stone.$elem.css({opacity: '', left: ''});
            });
          });
          break;
        case 'slideright':
          stone.$elem.animate({left: '100%'}, function() {
            stone.$elem.animate({opacity: 0}, 100, function() {
              stone.ready(false);
              stone.$elem.css({opacity: '', left: ''});
            });
          });
          break;
        default:
          stone.ready(false);
          break;
      }
      return stone;
    }, // hide

    /**
     *
     */
    init: function() {
      for(var k in defaultSettings) {
        if(defaultSettings.hasOwnProperty(k)) {
          this[k] = $.extend({}, defaultSettings[k], this.getParent()[k], this[k]);
        }
      }
      return this;
    }, // init

    /**
     *  @param mixins {String|Array} One or more stone mixin objects. These must have an `applyMixin` method as well as a name property
     */
    mixin: function(mixins) {
      this._ix = $.extend({}, this._ix);
      mixins = [].concat(mixins);
      for(var i=0, mLen=mixins.length, mxn, _ix; i<mLen; i++) {
        mxn = mixins[i];
        if(!mxn.name || !mxn.applyMixin) {
          throw new StoneError('Invalid mixin `' + mxn.name + '` for ' + this.toString(), this);
        }
        else {
          if(typeof this._ix[mxn.name]==='undefined') {
            this._ix[mxn.name] = mxn.applyMixin;
          }
          if(mxn.cls) {
            this.cls = this.cls.concat(mxn.cls);
          }
          this.hasMixins = true; // this is a hack and should be removed
        }
      }
      return this;
    }, // mixin

    /**
     * Set a stone's ready-state
     * @param state {Boolean} [optional] [default]
    */
    ready: function(state) {
      switch(typeof state) {
        case 'undefined':
          this.state.ready = true;
          break;
        default:
          this.state.ready = !!state;
          break;
      }
      this.state.busy = false;
      if(this.state.ready) {
        this.$elem.addClass('ready');
      }
      else {
        this.$elem.removeClass('ready');
      }
      this.trigger('stone:ready', this.state.ready);
      return this.state.ready;
    }, // ready

    /**
     * @return {String} The stone's type
     */
    toString: function() {
      return '[object ' + this.meta.displayType.replace(' ', '') + 'Stone]';
    } // toString

  }); // Stone

  bedrock._.Stone = Stone;

  return Stone;
}); // define
