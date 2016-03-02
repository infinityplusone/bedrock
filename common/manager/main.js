/*
 * Name: manager.js
 * Description: Stone manager
 * Dependencies: bedrock, gravel, bucket
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
  'bucket',
  'gravel',
  'bedrock'
], function(Bucket, Gravel) {

  function StoneManagerError(message) {
    this.name = 'StoneManagerError';
    this.message = message || '';
  }
  StoneManagerError.prototype = Error.prototype;

  var $body = $('body');

  var Manager = bedrock.utils.bindable.create({
    name: 'Bedrock Manager',
    prototypes: Gravel.prototypes,
    templates: Gravel.templates,
    options: bedrock.utils.base.create({
      contentSelector: '', // must be defined
      defaultBucket: false,
      stoneTypes: Gravel.stoneTypes
    }), // options
    state: {
      currentBucket: false,
      nextID: 0,
      ready: false
    }, // state

    /*
     * Create a new stone instance and return it
     * @param opts {Object} Options for the stone
     *    - type {String} [required]
     *    - bucket {Object} []
     */
    createStone: function(opts) {
      var prototype = this.prototypes[opts.type],
          stone;

      try {
        if(!prototype) {
          throw new StoneManagerError('Invalid stone type `' + opts.type + '`!');
        }
      }
      catch(err) {
        bedrock.log(err.name + ': ' + err.message, 'warn');
        if(StoneLibrary.pile!=='manager') {
          bedrock.log('Did you remember to add `' + opts.type + '` to your local `stone-list.json`?', 'warn');
        }
        return false;
      }

      Manager.state.nextID++;
      opts = $.extend(opts, {
        id: Manager.state.nextID,
        options: $.extend(true, {}, prototype.options, opts.options)
      });
      
      stone = prototype.create(opts);

      stone.on('*', function(e, data) {
        this.bucket.trigger(e.originalEvent.type, [this, data]);
      });

      return stone;
    }, // createStone

    /*
     * Creates the buckets for the Manager by searching the DOM (under its contentSelector) for 
     *        DIVs with: `[data-space="bucket"][data-bucket-name]`, and then replaces them with 
     *        `bucket-wrapper` DIVs.
     * If not DIVs are found, it will create a default one.
     */
    // this method is used to define the "physical space" (like in the browser) 
    // this should usually be defined in either the overriding stone-manager or the application that is creating one.
    createSpaces: function() {
      var mgr = this;
      $(mgr.options.contentSelector).find('.bucket-wrapper').remove();
      $(mgr.options.contentSelector + ' [data-bucket-name]:not(.ready)').each(function(i, v) {
        var $ul = $(v);
        var $bucket = $ul.bucket({
          manager: mgr
        });

        var bucket = $bucket.data('bucket');
        if(bucket.options.feed) {
          bucket.options.allow = $(bucket.options.allow).filter(function(i, stoneType) {
            if(!mgr.prototypes[stoneType]) {
              throw new StoneManagerError('Invalid stone type! Unable to find `' + stoneType + '` in `' + bedrock.utils.getRequireConfig('paths', 'stone-library') + '`.');
            }
            return mgr.prototypes[stoneType].options.feedable;
          });
        }
        mgr.buckets[bucket.name] = bucket;
        // if(mgr.options.autoStart) {
          if(bucket.options.visible) {
            bucket.loadQueue(mgr.options.delay);
          }
          else {
            bucket.hide();
          }
        // }
        if(bucket.options.feed) {
          // JSK: Do I need to do anything here?
        }
        bedrock.log(mgr.name + ' Bucket `' + bucket.name + '` Ready', 'info');
      });
      mgr.trigger('manager:spaces-ready');
    }, // createSpaces

    /*
     * Initialize a Manager instance with various options
     * @param args {Object} An object containing override options for the manager
     */
    init: function(settings) {
      var mgr = this;
      mgr.off('*').off();
      settings = settings ? settings : { };

      mgr.options.config(settings.options);

      mgr
        .on('manager:spaces-ready', mgr.onManagerReady) // manager:spaces-ready
        .on('manager:stone-added', mgr.onStoneAdded);

      mgr.on('manager:ready', mgr.createSpaces);

      mgr.state.currentBucket = mgr.options.defaultBucket;
      mgr.buckets = {};
      bedrock.stoneManager = mgr;
      mgr.trigger('manager:ready');
    }, // init

    /*
     * Fires when a stone has been added anywhere. This can't be good
     * @param e {Object} Event object
     * @param stone {Object} The stone from which the event was fired
     */
    onStoneAdded: function(e, stone) {}, // onStoneAdded

    onManagerReady: function() {
      this.state.ready = true;
      bedrock.log(this.name + ' Ready', 'info');
    }, // onManagerReady

    /*
     * This needs to be rethought, moved, or something
     */
    reset: function() {
      $.each(this.buckets, function(i, v) {
        v.clear();
      });
      $('.bucket-wrapper').remove();
      this.init();
    }, // reset


    /**
     * @return {String} Returns `Manager`
     */
    toString: function() {
      return '[object Manager]';
    } // toString

  }); // Manager

  bedrock._.Manager = Manager;

  return Manager;

}); // define