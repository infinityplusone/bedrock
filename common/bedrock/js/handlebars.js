/*
 * Name: handlebars.js
 * Description: Bedrock-flavored handlebars
 * Dependencies: handlebars, bedrock
 * 
 * Author(s): infinityplusone
 * Version:    0.1.0
 * Date:       2016-03-02
 *
 * Notes: helpful handlebars stuff
 *
 *
 */
define([
  'handlebars',
  'bedrock'
], function(Handlebars) {

  Handlebars.registerHelper('stringify', function(obj) {
    return JSON.stringify(obj);
  });

  Handlebars.registerHelper('render', function(tmpl, data) {
    return new Handlebars.SafeString(Handlebars.compile(tmpl)(data));
  }); // render

  // getDay
  Handlebars.registerHelper('getDay', function(date) {
    return date.split('-').slice(-1);
  }); // getDay

  // getStep
  Handlebars.registerHelper('getStep', function(steps) {
    var step;
    for(var s in steps) {
      if(typeof steps[s].complete==='undefined') {
        step = s;
        break;
      }
    }
    return step;
  }); // getStep

  // commafy
  Handlebars.registerHelper('commafy', function(num) {
    return bedrock.utils.commafy(num);
  }); // commafy

  // count
  Handlebars.registerHelper('count', function(obj) {
    return Object.keys(obj).length;
  }); // count

  // dollarize
  Handlebars.registerHelper('dollarize', function(num, round) {
    round = typeof round==='number' ? round : 2;
    return '$' + bedrock.utils.commafy(num.toFixed(round).replace('-', ''));
  }); // dollarize

  Handlebars.registerHelper('transactify', function(num, round) {
    round = typeof round==='number' ? round : 2;
    return bedrock.utils.commafy(num.toFixed(round).replace('-', ''));
  }); // transactify


  // hyphenize
  Handlebars.registerHelper('hyphenize', function(str) {
    if(typeof str==='string') {
      return str
        .replace(/ +/g, '-').toLowerCase() // removes the spaces & makes it lowercase
        .replace(/([0-9])/gim, function(n) { // converts numbers to letters based on charcode
          return String.fromCharCode(+n+96);
        })
        .replace(/[^a-z\-]/gim, ''); // removes all non-letter characters
    }
    return '';
  }); // hyphenize

  // for
  Handlebars.registerHelper('for', function(from, to, incr, block) {
    var accum = '';
    for(var i = from; i < to; i += incr)
        accum += block.fn(i);
    return accum;
  }); // helper: for

  // getDiff
  Handlebars.registerHelper('getDiff', function(val, diff) {
    return Math.abs(val-diff).toFixed(2);
  }); // helper: getDiff

  // getBalance
  Handlebars.registerHelper('getBalance', function(balance, date, cashFlow) {
    return bedrock.getBalance(balance, date, cashFlow);
  }); // helper: getBalance 

  // htmlSafe
  Handlebars.registerHelper("htmlSafe", function(markup) {
    return new Handlebars.SafeString(markup);
  }); // helper: htmlSafe

  //Lowercase
  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });
  
  //Capitalize
  Handlebars.registerHelper('capitalize', function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  // percent
  Handlebars.registerHelper('percent', function(n, d, round) {
    round = round ? round : 2;
    if(typeof n!=='number') {
      n = bedrock.utils.sum(n);
    }
    return Math.abs((n/d * 100).toFixed(round));
  });

  // reduce
  Handlebars.registerHelper('reduce', function(n, divisor) {
    return (n/divisor).toFixed(2);
  });

  // posNeg
  Handlebars.registerHelper('posNeg', function(val, pos, neg) {
    if(val>0) {
      return 'up';
    }
    if(val<0) {
      return 'down';
    }
    return '';
  }); // posNeg

  // ifCond
  // To use: {{#ifCond this.foo "==" "bar"}}..{{/ifCond}} if within context of object
  Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    if(/[<>]/gim.test(operator)) {
      v1 = typeof v1==='number' ? v1 : +v1.replace(/,/gim, '');
      v2 = typeof v2==='number' ? v2 : +v2.replace(/,/gim, '');
    }
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '!==':
        return (v1 !== v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  }); // helper: ifCond

  // in
  Handlebars.registerHelper('in', function(haystack, needle, options) {
    if(typeof haystack!=='object') {
      return options.inverse(this);
    }
    if(Array.isArray(haystack)) {
      return haystack.indexOf(needle)>=0 ? options.fn(this) : options.inverse(this);
    }
    else {
      return Object.keys(haystack).indexOf(needle)>=0 ? options.fn(this) : options.inverse(this);
    }
  }); // helper: in

  // is
  Handlebars.registerHelper('is', function(obj, objType, options) {
    switch(objType) {
      case 'array':
        return Array.isArray(obj) ? options.fn(this) : options.inverse(this);
        // break;
      case 'range':
        return (Array.isArray(obj) && obj.length===2 && Number.isFinite(obj[0]) && Number.isFinite(obj[1])) ? options.fn(this) : options.inverse(this);
        // break;
      default:
        return (typeof obj===objType || obj===objType) ? options.fn(this) : options.inverse(this);
        // break;
    }
  }); // helper: is

  // join
  Handlebars.registerHelper("join", function(arr, sep) {
    sep = typeof sep==='string' ? sep : ' ';
    return arr.join(sep);
  }); // helper: join

  // randomInt
  Handlebars.registerHelper("randomInt", function(min, max) {
    return Math.floor(Math.random() * (max-min+1)) + min;
  }); // helper: randomInt

  // times
  Handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 0; i < n; ++i)
        accum += block.fn(i);
    return accum;
  }); // helper: times

  // tweak
  Handlebars.registerHelper('tweak', function(num) {
    return +(num + Math.random() - Math.random()).toFixed(3);
  }); // helper: tweak
  // tweak

  Handlebars.registerHelper('newMonth', function(context) {
    var messages = context.data.root.messages,
        idx = context.data.index;
    return this.timestamp.format('MMMM') !== messages[Object.keys(messages)[idx-1]].timestamp.format('MMMM');
  }); // helper: newMonth

  // dateFormat
  Handlebars.registerHelper('dateFormat', function(args) {
    var d = bedrock.moment(localStorage.TODAY || new Date()),
        f = bedrock.FORMATS.DATETIME;

    if(args.hash) {
      if(args.hash.datetime) {
        d = bedrock.moment(args.hash.datetime);
      }
      if(args.hash.format) {
        f = (args.hash.format == "FROMNOW") ? "FROMNOW" :
          (typeof(bedrock.FORMATS[args.hash.format]) !== 'undefined') ? bedrock.FORMATS[args.hash.format] : args.hash.format;
      }
    }

    if(bedrock.moment) {
      if (f == "FROMNOW") {
        return bedrock.moment(d).fromNow();
      }
      else {
        return bedrock.moment(d).format(f);
      }
    }
    else {
      return d; // moment plugin not available. return data as is.
    }
  }); // helper: dateFormat



  // Helper to pull in templates
  // addTemplates
  Handlebars.addTemplates = function(source, destination) {
    var $root;
    var results = {
      partials: 0,
      templates: 0
    };

    destination = destination ? destination : bedrock;

    switch(typeof source) {
      case 'string':
        if(/x-handlebars-template/gim.test(source)) { // raw code
          $root = $('<div />').append(source);
        }
        else { // probably (hopefully) a selector
          $root = $(source);
        }
        break;
      case 'object':
        $root = $(source);
        break;
      default:
        $root = $('body');
        break;
    }

    // grab any partials we find
    $root.find('[data-partial-id]:not(.processed)').each(function(i, partial) {
      var $partial = $(partial),
          partialId = partial.getAttribute('data-partial-id');

      if(typeof Handlebars.partials[partialId]!=='undefined') {
        console.warn('Duplicate partial `' + partialId + '` found! Overwriting.');
      }

      Handlebars.registerPartial(partialId, $partial.html());
      $partial.addClass('processed');

      if(bedrock.DEBUG) {
        console.info('Partial compiled: `' + partialId + '`');
      }
    });

    // grab any templates we find
    $root.find('[data-template-id]:not(.processed)').each(function(i, template) {
      var $template = $(template),
          templateId = template.getAttribute('data-template-id');

      if(typeof destination.templates[templateId]!=='undefined') {
        console.warn('Duplicate template `' + templateId + '` found! Overwriting.');
      }
      destination.templates[templateId] = Handlebars.compile($template.html());
      $template.addClass('processed');

      if(bedrock.DEBUG) {
        console.info('Template compiled: `' + templateId + '`');
      }
    });

    return results;

  }; // addTemplates



  return Handlebars;
});
