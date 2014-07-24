'use strict';

var exports = {};

function mixin(tgt) {
        var i = 0
          , n = arguments.length
          , o
          ;
        while (++i < n) {
                o = arguments[i];
                if (o != null) {
                        Object.getOwnPropertyNames(o).forEach(function (k) {
                                tgt[k] = o[k];
                        });
                }
        }
        return tgt;
}

function Delegate(o) {
        var o_ = o;
        o_.prototype = o;
        return mixin(ctor, {
                mk: ctor
              , add_methods: methods
        });

        /* WHERE */

        function ctor(props) {
                return mixin(Object.create(o_.prototype), props);
        }

        function methods() {
                var o__ = o_
                  , new_args = [].slice.call(arguments, o_)
                  , args = [o__].concat(new_args)
                  ;
                o_ = mixin.apply(this, args);
                return this;
        }
}

var Monoid = Delegate({
        identity: function () {
                throw {type: 'unimplemented', name: 'identity'};
        }
      , combine: function () {
                throw {type: 'unimplemented', name: 'combine'};
        }
});

exports.Delegate = Delegate;
exports.Monoid = Monoid;
