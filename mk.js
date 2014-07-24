'use strict';

function mixin(tgt, src) {
        Object.getOwnPropertyNames(src).forEach(function (k) {
                tgt[k] = src[k];
        });
        return tgt;
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
