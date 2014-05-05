'use strict';

var kind
  , copy_regex
  , cp
  , is_array
  , mk_iterator
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

function is_kind(x, s) {
        return kind(x) === s;
}

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

function deep_eq(x, y) {
        if (x && typeof x === 'object') {
                if (is_array(x) && is_array(y)) {
                        return eq_array(x, y);
                }
                return eq_object(x, y);
        } else {
                return x === y;
        }
}

function has_a_match(xs, ys) {
        var n = xs.length
          , i = n - 1
          ;
        while (i) {
                if (deep_eq(xs[i--], ys)) {
                        return true;
                }
        }
        return false;
}

function eq_object(x, y) {
        var r = true;
        for_each(y, function (v, k) {
                if (!deep_eq(x[k], v)) {
                        r = false;
                        return false;
                }
        });
        return r;
}

function eq_array(xs, ys) {
        var i = 0;
        while (i++ < ys.length) {
                if (!has_a_match(xs, ys[i])) {
                        return false;
                }
        }
        return true;
}

mk_iterator = (function () {
        var delegate = {
                'object': iter_object
              , 'string': iter_string_number
              , 'number': iter_string_number
              , 'function': iter_function
        };

        return function mk_iterator(x, ctx) {
                var t = typeof x
                  , f = delegate[t]
                  ;
                if (typeof f !== 'function') {
                        return x;
                }
                return f;
        };

        /* WHERE */
        function iter_object(x, ctx) {
                if (x !== null && x !== undefined) {
                        return function (v, k, dst) {
                                return deep_eq(v, dst);
                        };
                }
                return x;
        }
        function iter_string_number(x, ctx) {
                return v(x);
        }
        function iter_function(x, ctx) {
                if (typeof ctx === 'undefined') {
                        return x;
                }
                return function (v, i, xs) {
                        return x.call(ctx, v, i, xs);
                };
        }
}());

is_array = (function () {
        return Array.isArray || function is_array(xs) {
                return is_kind(xs, 'Array');
        };
}());

function map(xs, f, ctx) {
        var f_
          , xs_
          , n
          , i
          ;
        if (xs === null || xs === undefined) {
                return xs;
        }
        f_ = mk_iterator(f, ctx);
        xs_ = [];
        n = xs.length;
        i = n;
        while (i) {
                xs_[i] = f_(xs[i], i--, xs);
        }
        return xs_;
}

function functions(x) {
        var fs = []
          , args = [].slice.call(arguments)
          ;
        if (typeof x === 'function') {
                return map(x, function (f) {
                        if (typeof f === 'function') {
                                return f;
                        }
                });
        }
        if (typeof x === 'object') {
                args.forEach(function (x) {
                        for_each(x, function (f) {
                                fs.push(f);
                        });
                });
                return fs;
        }
        if (is_array(x)) {
                x.forEach(function (f) {
                        fs.push(f);
                });
                return fs;
        }
        return fs;
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

// function mker = function mker(diff, cat, close) {
//         var _description = {
//                 diff: diff || {}
//               , cat: cat
//               , close: functions(close)
//         }
//         ;
// 
//         /* WHERE */
//         _mker = function _mker(ks) {
