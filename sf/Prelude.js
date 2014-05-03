'use strict';

var kind
  , copy_regex
  , cp
  ;

function has_own(o, k) {
        return Object.prototype.hasOwnProperty.call(o, k);
}

kind = (function () {
        var re_extract = /^[object (.*)]$/
          , UNDEFINED
          ;
        return function kind(x) {
                if (x === null) {
                        return 'Null';
                }
                if (x === UNDEFINED) {
                        return 'Undefined';
                }
                return re_extract.exec(Object.prototype.toString.call(x))[1];
        };
}());

function mked_by_object_mker(x) {
        var r = !!x && typeof x === 'object' && x.constructor === Object;
        return r;
}

function v(k) {
        return function (o) {
                return o[k];
        };
}

function unsafe_copy_property(v, k) {
        /*jshint validthis:true */
        this[k] = v;
}

function call_with(f, o, k, ctx) {
        return f.call(ctx, o[k], k, o);
}

function for_in(o, f, ctx) {
        var k;
        for (k in o) {
                if (!call_with(f, o, k, ctx)) {
                        break;
                }
        }
}

function for_each(o, f, ctx) {
        for_in(o, function (v, k) {
                if (has_own(o, k)) {
                        return call_with(f, o, k, ctx);
                }
        });
}
              
function extend(dst, srcs) {
        var n = arguments.length
          , i = n
          , o
          ;
        while (i) {
                o = arguments[n - (i--) + 1];
                if (o !== null && o !== undefined) {
                        for_each(o, unsafe_copy_property, dst);
                }
        }
        return dst;
}

function copy_object(x) {
        if (mked_by_object_mker(x)) {
                return extend({}, x);
        }
        return x;
}

copy_regex = (function () {
        var regexp_supports_sticky;
        try {
                RegExp('', 'y');
                regexp_supports_sticky = true;
        } catch (e) {
                regexp_supports_sticky = false;
        }
        return function copy_regex(x) {
                var flags = x.global ? 'g' : ''
                        + x.ignoreCase ? 'i' : ''
                        + x.multiline ? 'm' : ''
                        + regexp_supports_sticky && x.sticky ? 'y' : '';
                return new RegExp(x.source, flags);
        };
}());

function copy_date(x) {
        return new Date(x.getTime());
}

function copy_array(xs) {
        return xs.slice();
}

cp = (function () {
        var delegate = {
                'Object': copy_object
              , 'Array': copy_array
              , 'Date': copy_date
              , 'RegExp': copy_regex
        };
        return function cp(x) {
                return delegate[kind(x)](x);
        };
}());
