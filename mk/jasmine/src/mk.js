'use strict';

function kind_string(x) {
        return Object.prototype.toString.call(x);
}

function is_kind(kind, x) {
        return '[object ' + kind + ']' === kind_string(x);
}

function is_regexp(x) {
        return is_kind('RegExp', x);
}

function is_date(x) {
        return is_kind('Date', x);
}

function kind(x) {
        if (Array.isArray(x)) {
                return 'Array';
        }
        if (is_regexp(x)) {
                return 'RegExp';
        }
        if (is_date(x)) {
                return 'Date';
        }
        return 'Object';
}

function clone(x) {
        var anc = []
          , des = []
          ;
        function iter(y) {
                var i = anc.indexOf(y)
                  , y_
                  ;
                if (i >= 0) {
                        return des[i];
                }
                if (y === null) {
                        return null;
                }
                if (typeof y !== 'object') {
                        return y;
                }
                y_ = mk(y)(y);
                anc.push(y);
                des.push(y_);
                Object.getOwnPropertyNames(y).forEach(function (x) {
                        y_[x] = iter(y[x]);
                });
                return y_;
        }
        return iter(x);

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
                };
                return lku[kind(x)];
        }
        function flags(re) {
                return [ ''
                       , re.global ? 'g' : ''
                       , re.ignoreCase ? 'i' : ''
                       , re.multiline ? 'm' : ''
                       ].join('');
        }
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
                return mixin(merge({}, cats), o || {});
        }
        mker.cat = function cat(o) {
                var o_ = cats;
                cats = mixin.apply(this, [o_, o]);
                return this;
        };
        return mker;
}
