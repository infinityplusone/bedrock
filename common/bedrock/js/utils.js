/*
 * Name: utils.js
 * Description: Bedrock utilities and global methods
 * Dependencies: jquery, jquery-bindable
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
  'jquery',
  'jquery-bindable'
],function($) {
  var utils = {

    // base object for spitting things out.
    base: {

      augment: function(obj) {
        return $.extend(this, obj);
      }, // augment

      config: function(config) {
        return $.extend(true, this, config);
      }, // config

      create: function(config) {
        return $.extend(Object.create(this), config);
      }, // create

      doAfter: function(methodName, advice) {
        var method = this[methodName] || function() {};
        function wrap() {
          var that = method.apply(this, arguments);
          advice.apply(this, arguments);
          return that;
        }
        this[methodName] = wrap;
      }, // doAfter

      doBefore: function(methodName, advice) {
        var method = this[methodName] || function() {};
        function wrap() {
          advice.apply(this, arguments);
          var that = method.apply(this, arguments);
          return that;
        }
        this[methodName] = wrap;
      }, // doBefore

      getParent: function() {
        return Object.getPrototypeOf(this);
      }, // getParent

      isInstanceOf: function(prototype) {
        return prototype.isPrototypeOf(this);
      }, // isInstanceOf

      _super: function(methodName, args) {
        var parent = this;
        var originalMethod = this[methodName];
        var method;

        while (parent = parent.__proto__) {
          if (parent.hasOwnProperty(methodName)) {
            method = parent[methodName];
            if (method !== originalMethod && $.isFunction(method)) {
              return method.apply(this, args);
            }
          }
        }
        // Fail silently or optionally throw an error here.
      }
    }, // base

    log: function(msg, level) { // log
      if(this.debug && !!window.console) {
        if(typeof msg!=='string') {
          level = 'object';
        }
        var d = new Date();
        var ms = "." + d.getMilliseconds();
        while(ms.length<4) {
          ms += '0';
        }
        switch(level) {
          case 'info':
            if(+this.debug>0) {
              console.info('[' + (d.toLocaleTimeString()).replace(/( [AP]M)/gim, ms + "$1")+ '] %c' + msg.toString(), 'font-weight: bold; color: #3333ff;');
            }
            break;
          case 'object':
            console.info('[' + (d.toLocaleTimeString()).replace(/( [AP]M)/gim, ms + "$1") + '] ', msg);
            break;
          case 'error':
            console.log('[' + (d.toLocaleTimeString()).replace(/( [AP]M)/gim, ms + "$1")+ '] %c' + msg, 'font-weight: bold; color: #ff3333;');
            break;
          case 'warn':
            console.warn('[' + (d.toLocaleTimeString()).replace(/( [AP]M)/gim, ms + "$1")+ '] %c' + msg, 'font-weight: bold; color: #ff8833;');
            break;
          default:
            console.log("[" + (d.toLocaleTimeString()).replace(/( [AP]M)/gim, ms + "$1") + "] " + msg, (msg.indexOf('%c')>=0 ? 'font-weight: bold; color: #3333ff;' : ''));
            break;
        }
      }
    }, // log

    camelCase: function(str) { // an incredibly greedy camelCaser
      return str.toLowerCase().replace(/(-|_|\s)+(.)/g, function(match, g1, g2) {
          return g2.toUpperCase();
      }).replace(/(-|_|\s)+$/gim, '');
    }, // camelCase

    commafy: function(num) {
      if(typeof num==='undefined') {
        num = 0;
      }
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }, // commafy

    getObjectSize: function(obj) {
      var size = 0, key;
      for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
      }
      return size;
    }, // getObjectSize

    flatten: function() {
      return arguments.reduce(function(a, b) {
        a.concat(b);
      });
    }, // flatten

    getRequireConfig: function(x, y) {
      if(y) {
        return require.s.contexts._.config[x][y];
      }
      if(x) {
        return require.s.contexts._.config[x];
      }
      return require.s.contexts._.config;
    }, // getRequireConfig

    intersect: function() {
      var arrays = [].slice.call(arguments);
      var result = [].concat(arrays.shift()).reduce(function(res, v) {
        if (res.indexOf(v) === -1 && arrays.every(function(a) {
          return a.indexOf(v) !== -1;
        })) res.push(v);
        return res;
      }, []);
      return result;
    }, // intersect

    hyphenize: function(str) {
      return str.replace(/ +/g, '-').toLowerCase().replace(/[^a-z\-]/gim, '');
    }, // hyphenize

    loadCSS: function(url) {
      var link = document.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = url;
      document.getElementsByTagName('head')[0].appendChild(link);
    }, // loadCSS

    mixin: function(destination, sources) {
      if($.isArray(destination)) {
        sources = destination;
        destination = {};
      }
      sources = [].concat(sources);
      for(var i=0, len=sources.length, source; i<len; i++) {
        source = sources[i];
        for(var k in source) {
          if(source.hasOwnProperty(k)) {
            destination[k] = source[k];
          }
        }
      }
      return destination;
    }, // mixin

    pluralize: function(num, str) { // this is *not* a smart function
      if(num!==1) {
        if(str.slice(-1)==='y') {
          return num + ' ' + str.slice(0, -1) + 'ies';
        }
        else {
          return num + ' ' + str + 's';
        }
      }
      return num + ' ' + str;
    }, // pluralize

    randomInt: function(min, max) {
      return Math.floor(Math.random() * (max-min+1)) + min;
    }, // randomInt

    reloadCSS: function() {
      $('head link[rel="stylesheet"]').each(function(i, v) {
        var href = v.href.split('?')[0];
        v.href = href + '?v=' + new Date().getTime();
      });
    }, // reloadCSS
    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [v1.0]
    shuffleArray: function(array) {
      for(var j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
      return array;
    }, // shuffleArray

    removeFromArray: function(array, element) {
      var idx = array.indexOf(element);
      if (idx > -1) {
        array.splice(idx, 1);
        return true;
      }
      return false;
    }, // removeFromArray

    sum: function(obj) {
      var sum = 0;
      if(typeof obj.length!=='undefined') {
        obj = obj.splice(0);
        sum = obj.reduce(function(previousValue, currentValue, index, array) {
          return previousValue + currentValue;
        });
      }
      else {
        for(var el in obj) {
          if( obj.hasOwnProperty( el ) ) {
            sum += parseFloat( obj[el] );
          }
        }
      }
      return sum;
    } // sum
  }; // utils

  utils.bindable = utils.base.create($.bindable({}));
  return utils;
});
