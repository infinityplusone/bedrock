/*
 * Name: bucket.js
 * Description: Buckets of stones
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
  'bedrock'
], function() {

  function StoneBucketError(message) {
    this.name = 'StoneBucketError';
    this.message = message || '';
  }

  StoneBucketError.prototype = Error.prototype;

  var $body = $('body');
  var templates = {
    defaultRoom: bedrock.handlebars.compile('<div class="bucket-wrapper {{name}}-wrapper {{options.cls}}" data-stone-bucket="{{name}}" style="opacity:0.0;"></div>'),
    room: bedrock.handlebars.compile('<div class="bucket-wrapper {{spaceName}}-room {{options.cls}}" id="{{bucketName}}-{{spaceName}}-room"></div>')
  };

  var Bucket = bedrock.utils.bindable.create({
    name: 'default',
    options: {
      allow: [],
      columns: 3,
      disallow: [],
      feed: false,
      limit: 30,
      visible: true
    }, // options
    queue: [],
    rooms: {},
    state: {
      ready: false,
      visible: false,
      watch: null
    }, // state
    $greenRoom: false,
    $space: false,


    /*
     * Checks the replacement div for options and returns them
     * @return {Object} A bucket options object
     */
    _eventHandler: function(e, obj, data) {
      var bucket = this,
          eType = e.originalEvent.type.split(':');
      switch(eType[0]) {
        case 'bucket':
          bucket.manager.trigger(e.originalEvent.type, bucket);
          switch(eType[1]) {
            case 'add':
              bucket.$stones = $($.map(this.stones, function(s) { return s.$elem.get(0); }));
              bucket.rearrange();
              break;
            case 'stone-moved':
              bucket.updateRooms();
              break;
            default:
              break;
          }
          break;
        case 'stone':
          switch(eType[1]) {
            case 'ready':
              if(obj.state.ready) {
                bucket.$space.prepend(obj.$elem);
              }
              break;
            case 'hide':
            case 'destroy':
            case 'display':
              bucket.refresh();
              break;
            case 'solve-height':
              bucket.refresh();
              break;
            default:
              break;
          }
          bucket.manager.trigger(e.originalEvent.type, obj);
          break;
        default:
          break;
      }
    }, // _eventHandler

    /*
     * Add a stone to the bucket
     * @param stone {Object} A stone object
     */
    add: function(stone) {
      this.stones.push(stone);
      stone.bucket = this; // redundant?
      stone.state.space = 'default';
      bedrock.log(stone.meta.displayType + ' stone added to `' + this.name + '` bucket.', 'info');
      this.trigger('bucket:add', stone);
      return stone;
    }, // add

    /*
     * Add a stone to the bucket's queue
     * @param opts {Object} Options for the stone
     */
    addToQueue: function(opts) {
      var bucket = this,
          stone = opts.stone;

      if(typeof stone==='undefined' && opts.type!==undefined) {
        opts.bucket = bucket;
        stone = bucket.manager.createStone(opts);
      }
      if(stone) {
        stone.generate();
        bucket.queue.push(stone);
      }
    }, // addToQueue

    /*
     * Remove all stones from the bucket
     */
    clear: function(destroy) {
      stones = [].concat(this.stones, $.map(this.rooms, function(k, v) { return k; }));
      this.remove(stones, destroy);
      this.trigger('bucket:clear');
    }, // clear

    /*
     * Add a stone to the bucket's wrapper and make it visible
     * @param stone {Object} A stone object
     */
    displayStone: function(stone) {
      var bucket = this;

      if(bucket.stones.indexOf(stone)<0) {
        bucket.add(stone);
      }
      bucket.prepStone(stone);
      stone.display();
    }, // displayStone

    /*
     * Hides the bucket
     */
    hide: function() {
      this.state.visible = false;
      this.$space.css({opacity: 0});
    }, // hide

    /*
     * Hides all stones in a bucket
     */
    hideStones: function(stones) {
      if(!stones) {
        stones = [].concat(this.stones, $.map(this.rooms, function(k, v) { return k; }));
      }
      stones.forEach(function(stone) {
        stone.hide();
      });
    }, // hideStones

    /*
     * Initialize the bucket, generate markup for the bucket wrapper, and bind the bucket to that wrapper
     * Also creates a "Green Room" for the bucket
     * @param settings {Object}
     */
    init: function(settings) {
      var bucket = this,
          $parent;
      bucket.queue = [];
      bucket.stones = [];
      bucket.resizeTimer = null;

      function switchRoom(e) {
        var room = this.getAttribute('data-room'),
            stones;

        e.preventDefault();
        if(room==='default') {
          stones = bucket.stones;
        }
        else {
          stones = bucket.rooms[room];
        }
        bucket.showStones(stones);
      } // switchRooms

      bucket.state.ready = false;

      this.manager = settings.manager;
      delete(settings.manager);

      bucket.off('*').on('*', bucket._eventHandler);

      this.options = $.extend({}, this.options, settings);

      if(!bucket.options.$original) {
        throw new StoneBucketError('Where are we putting these stones?');
      }
      // bucket.clear();

      if(bucket.$space) {
        bucket.$space.off().remove();
      }
      // set up the space (container)
      bucket.$space = bucket.make('default');
      // bucket.options.$original.hide().after(bucket.$space);

      if(!bucket.$greenRoom) {
        bucket.make('green', { greenRoom: true, cls: 'hidden-room' });
      }

      // $body.append(bucket.make('greenRoom', true));
      $(window).on('resize', function() {
        bucket.refresh();
      });

      bucket.state.ready = true;
      bucket.watch();
      if(bucket.options.visible) {
        bucket.show();
      }
      if(bucket.options.feed) {
        $parent = bucket.$space.parent();
        $parent.on('click', '[data-click="switchRoom"]', switchRoom);
      }

      bucket.trigger('bucket:ready', bucket);
    }, // init

    /*
     * Loads a queue of stones from a bucket and adds them to the bucket's space
     * @param bucket {Object} An initialized bucket
     */
    loadQueue: function(delay) {
      var bucket = this,
          stoneTimeout,
          queue,
          stoneOpts;

      var addStone = function(interval) {
        stoneTimeout = setTimeout(function() {
          clearTimeout(stoneTimeout);

          bucket.addToQueue({
            type: bedrock.utils.shuffleArray(bucket.options.allow)[0]
          });
          if(bucket.size()>bucket.options.limit) {
            bucket.stop();
            bedrock.log('Stopped adding stones after ' + bucket.size() + ' stones.', 'warn');
          }
          else {
            addStone(Math.round(Math.min(9*delay, Math.max(1*delay, Math.random()*10*delay))));
          }
        }, interval);
      }; // addStone

      queue = bucket.options.initialStones.slice(0).reverse();

      while(queue.length>0) {
        stoneOpts = queue.pop();
        stoneOpts.bucketName = bucket.name;
        bucket.addToQueue(stoneOpts);
      }
      if(bucket.options.feed) {
        addStone(1500);
      }
    }, // loadQueue

    /*
     * Create a space for the bucket to use
     * @param spaceName {String} The template to use for the space
     */
    make: function(spaceName, options) {
      var bucket = this,
          $space;

      options = $.extend({cls: ''}, options);

      switch(spaceName) {
        case 'default':
          $space = $(templates['defaultRoom'](bucket));
          bucket['$' + spaceName] = $space;
          bucket.options.$original.hide().after($space);
          break;
        default:
          if(!bucket['$' + spaceName + 'Room']) {
            $space = $(templates['room']({
              bucketName: bucket.name,
              spaceName: spaceName,
              options: options
            }));
            bucket['$' + spaceName + 'Room'] = $space;
            $space.css({width: bucket.$space.width() }); // JSK shouldn't need because of where it lives now
            $body.append($space);
          }
          else {
            return $('#' + [bucket.name, spaceName, 'room'].join('-'));
          }
          break;
      }
      $space.data('bucket', bucket);
      // bucket.options.$original.hide().after($space);

      bucket.trigger('bucket:space-created', spaceName);
      return $space;
    }, // make


    /*
     * Move a stone from one space to another
     * @param stone {Object} a stone object
     * @param $space {Object} a destination space for the stone
     * @return {Object} a stone ob ject
     */
    move: function(stone, space, effect) {
      var bucket = this,
          $space = space==='default' ? bucket.$space : bucket['$' + space + 'Room'];

      stone.one('stone:ready', function(e) {
        $space.append(stone.$elem);
        if(bucket.rooms[space].indexOf(stone)<0) {
          bucket.rooms[space].push(stone);
          stone.state.space = space;
          bedrock.utils.removeFromArray(bucket.stones, stone);
        }
        bucket.trigger('bucket:stone-moved', space);
      });
      stone.hide(effect);
    }, // move

    /*
     * Pop the last stone from the bucket and return it
     * @return {Object} a stone object
     */
    pop: function() {
      var stone = this.stones.pop();
      this.trigger('bucket:pop');
      return stone;
    }, // pop

    /*
     * Get a stone ready for being added to the DOM
     * @param stone {Object} A stone object
     */
    prepStone: function(stone) {
      if(this.options.shapeShift) {
        this.$greenRoom.append(stone.$elem);
        stone.solveHeight();
      }
    }, // prepStone

    /*
     * Trigger rearrange for a shapeShifted bucket
     */
    rearrange: function() {
      var bucket = this;

      if(bucket.$space && bucket.$space.hasClass('shape-shifted')) {
        clearTimeout(bucket.resizeTimer);
        bucket.$space.data('plugin_shapeshift').globals.animated = false;
        bucket.$stones.attr('style', '');
        bucket.$space.trigger('ss-rearrange');
        bucket.$space.data('plugin_shapeshift').globals.animated = true;
        bucket.trigger('bucket:rearrange');
      }
    }, // rearrange

    /*
     * Refresh positioning by checking for pinned stones and shapeshift
     */
    refresh: function() {
      var bucket = this;

      bucket.stones.forEach(function(c) {
        if(isFinite(c.options.pinned)) {
          bucket.$space.find('.stone:eq('+ Math.round(c.options.pinned) + ')').prev().before(c.$elem);
        }
      });
      if(bucket.options.visible && bucket.options.shapeShift && bucket.$space.find('.stone').length>0) {
        bucket.$space.addClass('shape-shifted').shapeshift(bucket.options.shapeShift);
        clearTimeout(bucket.resizeTimer);
        bucket.resizeTimer = setTimeout(function() {
          clearTimeout(bucket.resizeTimer);
          bucket.rearrange();
        }, 500);
      }
      bucket.trigger('bucket:refresh');
      return true;
    }, // refresh

    reinit: function(settings) {
      this.reset();
      this.options.$original.bucket({
        manager: this.manager
      });
      // settings = $.extend(this.options, {manager: this.manager}, settings);
      // this.init(settings);
    }, // reinit

    /*
     * Remove a single stone or multiple stones from the bucket
     * @param stones {Object||Array} A single stone object or an array of stone objects
     */
    remove: function(stones, destroy) {
      var bucket = this;

      destroy = destroy ? destroy : false;
      bucket.stones = $.makeArray(bucket.stones);
      stones = [].concat($.makeArray(stones));
      $.each(stones, function(i, stone) {
        // JSK: need alternate logic/option for when we're not destroying but *moving* instead
        stone.destroy(destroy);
        switch(stone.state.space) {
          case 'default':
            bedrock.utils.removeFromArray(bucket.stones, stone);
            break;
          default:
            bedrock.utils.removeFromArray(bucket.rooms[stone.state.space], stone);
            break;
        }
        bucket.trigger('bucket:remove');
      });
      // bucket.stones = bucket.stones;
      bucket.refresh();
      return stones;
    }, // remove

    /*
     * Remove all stones from a bucket
     */
    reset: function() {
      this.clear();
    }, // reset

    /*
     * Remove all stones from a bucket
     */
    resume: function() {
      this.state.ready = true;
      this.watch();
    }, // resume

    /*
     * Returns the number of stones in this bucket
     * @param option {String} An option name
     * @param value {String||Array|Object} The value for the option
     */
    set: function(option, value) {
      this.options[option] = value;
    }, // set

    /*
     * Shows the bucket
     */
    show: function() {
      var bucket = this;
      bucket.state.visible = true;
      $.each(bucket.stones, function(i, stone) {
        bucket.displayStone(stone);
      });
      bucket.$space.animate({opacity: 1.0}, function() {
        bucket.refresh();
      });
    }, // show

    /*
     * Shows all stones in a bucket
     */
    showStones: function(stones) {
      var bucket = this;
      bucket.hideStones();
      if(!stones) {
        stones = bucket.stones;
      }
      stones.forEach(function(stone) {
        stone.$elem.removeClass('last-visible');
        stone.display();
      });
    }, // showStones

    /*
     * Returns the number of stones in this bucket
     * @return {Integer}
     */
    size: function() {
      return [].concat(this.stones, $.map(this.rooms, function(k, v) { return k; })).length;
    }, // size

    /*
     * Stop the feed
     */
    stop: function() {
      clearInterval(this.state.watch);
      this.state.ready = false;
    }, // stop

    /*
     * Toggle feed (continuous load) functionality
     * @return {Boolean} Feed state
     */
    toggleFeed: function() {
      this.options.feed = !this.options.feed;
      this.trigger('bucket:feed-' + (this.options.feed ? 'on' : 'off'));
      return this.options.feed;
    }, // toggleFeed

    /*
     * Updates elements related to bucket rooms
     * @param obj {Boolean} Feed state
     */
    updateRooms: function(obj) {
      var bucket = this,
          room;
      for(var r in bucket.rooms) {
        room = bucket.rooms[r];
        if(!!room.$elem) {
          room.$elem.html('<span class="tag tag-active" data-click="switchRoom" data-room="' + r + '">' + room.length + ' ' + r + '</span>');
        }
      }

    }, // updateRooms

    /*
     * Starts watching the bucket's queue for new stones, and displays them
     */
    watch: function() {
      var bucket = this;
      bucket.state.watch = setInterval(function() {
        if(!bucket.state.ready) {
          clearInterval(bucket.state.watch);
          bucket.state.watch = null;
        }
        else {
          if(bucket.queue.length) {
            while(bucket.queue.length>0) {
              bucket.displayStone(bucket.add(bucket.queue.pop()));
            }
          }
        }
      }, 250);
    }, // watch

    /**
     * @return {String} Returns `Bucket`
     */
    toString: function() {
      return '[object Bucket]';
    } // toString

  }); // Bucket

  (function($) {

    var getShapeShiftOptions = function(options) {
      var ssOptions = {
        gutterX: 0,
        gutterY: 16,
        paddingX: 0,
        // animated: false,
        minColumns: options.columns,
        maxColumns: options.columns,
        placeholderClass: 'stone-placeholder',
        draggedClass: 'stone-dragged',
        enableDrag: !!options.drag ? options.drag : false,
        handle: '.drag__handle',
        enableCrossDrop: false,
        align: 'left'
      };

      if(isNaN(options.columns) || options.columns<2 || options.shapeshift===false) {
        return false;
      }
      return ssOptions;
    }; // getShapeShiftOptions

    $.fn.bucket = function(options) {

      var $bucket = this,
          allowedStones = [],
          initialStones = [],
          bucket = Bucket.create({
            name: bedrock.utils.hyphenize($bucket.attr('data-bucket-name'))
          });

      $bucket.data('bucket', bucket);

      $bucket.find('[data-stone-type]').each(function(i, li) {
        var $li = $(li),
            stoneType;

        if(li.hasAttribute('data-stone-type')) {
          stoneType = bedrock.utils.hyphenize($li.attr('data-stone-type'));
        }
        else {
          stoneType = bedrock.utils.hyphenize(li.innerHTML);
        }
        if($li.attr('data-feed')!=='exclude') {
          allowedStones.push(stoneType);
        }

        initialStones.push({
          type: stoneType,
          options: $li.data(),
          $ref: $li
        });
      });

      var settings = $.extend($bucket.data(), {
        $original: $bucket,
        cls: $bucket.attr('class'),
        initialStones: initialStones,
        allow: $.unique(allowedStones)
      }, options);

      bucket.init(settings);

      return bucket.$space;
    }; // jquery-bucket

  })($);

  bedrock._.Bucket = Bucket;

  return Bucket;
});
