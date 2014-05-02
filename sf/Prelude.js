'use strict';

function has_own(o, k) {
        return Object.prototype.hasOwnProperty.call(o, k);
}

function kind(x) {
        var to_string = Object.prototype.toString
          , regex_object = /^\[object (.*)\]$/
          , UNDEFINED
          ;
        if (x === null) {
                return 'Null';
        }
        if (x === UNDEFINED) {
                return 'Undefined';
        }
        return regex_object.exec(to_string.call(x))[1];
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

function copy_property(v, k) {
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

function copy_object(x, instance) {
        var r;
        if (mked_by_object_mker(x)) {
                r = {};
                for_each(x, function (v, k) {


function extend(dst, srcs) {
        var n = arguments.length
          , i = n
          , o
          ;
        while (i) {
                o = arguments[n - (i--) + 1];
                if (o !== null && o !== undefined) {
                        for_each(o, copy_property, dst);
                }
        }
        return dst;
}
