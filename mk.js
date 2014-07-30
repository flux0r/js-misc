'use strict';

function clone(x) {
        var anc = []
          , des = []
          ;
        function iter(y) {
                if (y === null) {
                        return null;
                }
                if (typeof y !== 'object') {
                        return y;
                }

        /* WHERE */
        function mk(x) {
                var lku = {
                        'Array': function () {
                                return [];
                        }
                      , 'RegExp': function (x) {
                                return new RegExp(x.source, flags(x));
                        }
                      , 'Date': function (x) {
                                return new Date(x.getTime());

                        }
                      , 'Object': function (x) {
                                return Object.create(Object.getPrototypeOf(x));
                        }
                }
                  , kind
                  ;
                if (Array.isArray(x)) {
                        kind = 'Array';
                } else if (is_date(x)) {
                        kind = 'Date';
                } else if (is_regexp(x)) {
                        kind = 'RegExp';
                } else {
                        kind = 'Object';
                }
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
