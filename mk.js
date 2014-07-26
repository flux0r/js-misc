'use strict';

function clone(x) {
        var anc = []
          , des = []
          ;
        function iter(y) {
                var delegate = {
                        'Array': []
                      , 'RegExp': new RegExp(y.source, flags(y))
                      , 'Date': new Date(parent.getTime())
                if (y === null) {
                        return null;
                }
                if (typeof y !== 'object') {
                        return y;
                }

        /* WHERE */
        function flags(re) {
                return [ ''
                       , re.global ? 'g' : ''
                       , re.ignoreCase ? 'i' : ''
                       , re.multiline ? 'm' : ''
                       ].join('');
        }

function transfer(tgt, src) {
        return function (k) {
                tgt[k] = src[k];
        };
}

function copy(tgt, src) {
        return function (k) {
                var v = src[k];
                if (isobj(v) && isobj(tgt[k])) {
                        tgt[k] = merge(tgt[k], v);
                } else {
                        tgt[k] = clone(v);
                }
        };
}

function mixin(tgt, src) {
        Object.getOwnPropertyNames(src).forEach(transfer(tgt, src));
        return tgt;
}

function isobj(x) {
        return Object.prototype.toString.call(x) === '[object Object]';
}

function merge(tgt, src) {
        var tgt_ = clone(tgt);
        Object.getOwnPropertyNames(src).forEach(copy(tgt_, src));
        return tgt_;
}

function diff_mker(o) {
        var diffs = o || {};
        function mker(o) {
                return mixin(Object.create(diffs), o || {});
        }
        mker.diff = function diff(o) {
                var o_ = diffs;
                diffs = mixin.apply(this, [o_, o]);
                return this;
        };
        return mker;
}

function cat_mker(o) {
        var cats = o || {};
        function mker(o) {
                return mixin(merge({}, cats), o);
        }
        mker.cat = function cat(o) {
                var o_ = cats;
                cats = mixin.apply(this, [o_, o]);
                return this;
        };
        return mker;
}
