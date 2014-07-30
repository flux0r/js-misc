'use strict';
/*global it, describe, expect, cat_mker, diff_mker */

describe('Differential inheritance.', function () {

        it('should set the new object\'s prototype so it shares references',
                function () {
                        var Foo = diff_mker({
                                foo: function () {
                                        return 'foo';
                                }
                        })
                          , o = Foo()
                          ;
                        expect(o.foo()).toBeDefined();
                        expect(o.foo()).not.toBeNull();
                        expect(o.hasOwnProperty('foo')).toBe(false);
                }
        );

        it('should set the new object\'s prototype so it shares references, ' +
                'let you add more references, and let you override a ' +
                'reference', function () {
                        var Foo = diff_mker()
                          , o
                          ;
                        Foo.diff({
                                foo: function () { return 'foo'; }
                              , override: function () { return 0; }
                        }).diff({
                                bar: function () { return 'bar'; }
                              , override: function () { return 1; }
                        });
                        o = Foo();
                        expect(o.foo()).toBeDefined();
                        expect(o.foo()).not.toBeNull();
                        expect(o.hasOwnProperty('foo')).toBe(false);
                        expect(o.bar()).toBeDefined();
                        expect(o.bar()).not.toBeNull();
                        expect(o.override()).toBe(1);
                }
        );
});

describe('Catenating inheritance.', function () {

        it('should set a default state', function () {
                var X = cat_mker({
                        foo: {bar: 'bar'}
                })
                  , x = X()
                  ;
                expect(x.foo.bar).toBe('bar');
        });

});
