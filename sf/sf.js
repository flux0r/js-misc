'use strict';

Object.prototype.extend = function () {
        var has = Object.hasOwnProperty
          , o = Object.create(this)
          , n = arguments.length
          , i = n
          , ext
          , k
          ;
        while (i) {
                ext = arguments[n - (i--)];
                for (k in ext) {
                        if (k !== 'clones'
                                        && has.call(ext, k)
                                        || o[k] === 'undefined') {
                                o[k] = ext[k];
                        }
                }
                if (has.call(ext, 'clones')) {
                        ext.clones.unshift(o);
                } else {
                        ext.clones = [o];
                }
        }
        return o;
};

function Pair(x, y) {
        return this.extend({
                fst: function () { return x; }
              , snd: function () { return y; }
        });
}

function Triple(x, y, z) {
        return this.extend({
                fst: function () { return x; }
              , snd: function () { return y; }
              , thd: function () { return z; }
        });
}

/** SignalFunction :: ((Sample -> (Sample, SignalFunction))
 *                     -> SignalFunction)
 *                 -> ((Number
 *                        -> Delta
 *                        -> (Delta, [Occurrence], SignalFunction))
 *                     -> (Occurrence -> ([Occurrence], SignalFunction))
 *                     -> SignalFunction)
 *                 -> SignalFunction
 */
function SignalFunction(f) {
        return this.extend({
                run_signal_function: f
        });
}

function id_init() {
        function startup(dt, delta) {
                return Triple(delta, [], id_init);
        }
        function occurrence_handler(occurence) {
                return Pair([occurence], id_init);
        }
        return SignalFunction(function (step, initializer) {
                return function () {
                        return initializer(startup, occurrence_handler);
                };
        });
}

/** Delta sv :: (a -> Delta (Signal a))
 *           -> Delta sv
 *           -> (Delta svl -> Delta svr -> Delta (Append svl svr))
 *           -> Delta sv
 */
function Delta(f) {
        return this.extend({
                run_delta: f
        });
}

function delta_nothing() {
        return Delta(function (signal, nothing, both) {
                return function (svl, svr) {
                        return nothing(svl, svr);
                };
        });
}

function Event(x) {
        return this.extend({
                run_event: function () { return x; }
        });
}

function Occurrence(f) {
        return this.extend({
                run_occurrence: f
        });
}

function occurrence(x) {
        return Occurrence(function (occurrence_handler, left, right) {
                return occurrence_handler(Event(x));
        });
}


function SampleEvent(x) {
        return this.extend({
                run_sample_event: function () { return x; }
        });
}

function Sample(f) {
        return this.extend({
                run_sample: f
        });
}

function sample(x) {
        return Sample(function (sampler, evt, empty, both) {
                return sampler(x);
        });
}

function sample_evt() {
        return Sample(function (sampler, evt, empty, both) {
                return evt;
        });
}

function id() {
        return SignalFunction(function (sf, initializer) {
                return sf(function (initial_sample) {
                        return Pair(initial_sample, id_init);
                });
        });
}

function constant_init() {
        function startup(dt, delta) {
                return Triple(delta_nothing, [], constant_init);
        }
        function occurrence_handler(occurrence) {
                return Pair([], constant_init);
        }
        return SignalFunction(function (sf, initializer) {
                return initializer(startup, occurrence_handler);
        });
}

function constant(x) {
        return SignalFunction(function (sf, initializer) {
                return function () {
                        return Pair(sample(x), constant_init);
                };
        });
}

function never_init() {
        return SignalFunction(function (sf, initializer) {
                return initializer(function () {
                        return Triple(delta_nothing, [], never_init);
                }, function () {
                        return Pair([], never_init);
                });
        });
}

function asap_init(x) {
        return SignalFunction(function (sf, initializer) {
                return initializer(function () {
                        return Triple(delta_nothing, [occurrence(x)], 
                                never_init);
                }, function () {
                        return Pair([], asap_init(x));
                });
        });
}

function asap(x) {
        return SignalFunction(function (sf, initializer) {
                return function () {
                        return Pair(sample_evt, asap_init(x));
                };
        });
}
