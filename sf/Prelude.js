'use strict';

var has_own = Object.prototype.hasOwnProperty.call;

function flip(f) {
        return function (x, y) {
                return f(y, x);
        };
}

function partial(f, x) {
        return function (y) {
                return f(x, y);
        };
}

function copy_property(tgt, src) {
        return function (k) {
                return tgt[k] = src[k];
        };
}

function for_own(x, f) {
        var k;
        for (k in x) {
                if (has_own(x, k)) {
                        f(x[k]);
                }
        }
}

function mix(x) {
/* jshint ignore:start */
        var i = 0
          , n = arguments.length
          , copy_property_ = partial(copy_property, x)
          , o
          ;
        while (++i < n) {
                o = arguments[i];
                if (null != o) {
                        for_own(o, copy_property_(o));
                }
        }
        return x;
/* jshint ignore:end */
}

function mk_delegate(methods) {
        var fixed = {methods: methods};

        function mk(properties) {
                return mix(Object.create(fixed.methods), properties);
        }

        return mix(mk, {
                mk: mk
              , fixed: fixed
              , delegate: function delegate() {
                        var o = fixed.methods
                          , args = [o].concat([].slice.call(arguments))
                          ;
                        fixed.methods = mix.apply(this, args);
                        return this;
                }
        });
}

function mk_catenate(state) {
        var fixed = {state: state};

        function mk(properties) {
                return mix(state, properties);
        }

        return mix(mk, {
                mk: mk
              , fixed: fixed
              , catenate: function catenate() {
                        var o = fixed.state
                          , args = [o].concat([].slice.call(arguments))
                          ;
                        fixed.state = mix.apply(this, args);
                        return this;
                }
        });
}

function functions(x) {
        var args = [].slice.call(arguments)
          , arr
          ;
        if (typeof x === 'function') {
                return args.reduce(function (xs, x_) {
                        return typeof x_ === 'function'
                                ? xs.concat([x_])
                                : xs;
                }, []);
        }
        if (typeof x === 'object') {
                args.forEach(function (x_) {
                        for_own(x_, function (x__) {
                                arr.push(x__);
                        });
                });
        } else if (Array.isArray(x)) {
                x.forEach(function (x_) {
                        arr.push(x_);
                });
        }
        return arr;
}

function mk_immure(enclose) {
        var fixed = {enclose: functions(enclose)};

        function mk(properties) {
                var o = mix({}, properties)
                  , closures = fixed.enclose
                  , args = [].slice.call(arguments, 1)
                  ;
                closures.forEach(function (f) {
                        if (typeof f === 'function') {
                                o = f.apply(o, args) || o;
                        }
                });
                return o;
        }

        return mix(mk, {
                mk: mk
              , fixed: fixed
              , immure: function immure() {
                        fixed.enclose = fixed.enclose
                                .concat(functions.apply(null, arguments));
                        return this;
                }
        });
}

