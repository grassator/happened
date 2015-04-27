import happened from 'happened';
import bond from 'bondjs';

describe('Instance API', function () {
    let instance;

    beforeEach(function () {
        happened.setDispatcher(happened.SYNC);
        instance = happened.create();
    });

    it('should require a name and a callback for subscription', function () {
        assert.throws(() => instance.on());
        assert.throws(() => instance.on('foo'));
        assert.doesNotThrow(() => instance.on('foo', function () {}));
    });

    it('should require a name for triggering', function () {
        assert.throws(() => instance.trigger());
        assert.doesNotThrow(() => instance.trigger('foo'));
    });

    it('should call a subscribed callbacks', function () {
        let spy1 = bond();
        let spy2 = bond();
        instance.on('foo', spy1);
        instance.on('foo', spy2);
        instance.trigger('foo');
        assert.equal(spy1.called, 1);
        assert.equal(spy2.called, 1);
    });

    it('should call subscribed callback with provided params', function () {
        let spy = bond();
        instance.on('foo', spy);
        instance.trigger('foo', 1, 'bar', undefined);
        assert(spy.calledWith(1, 'bar', undefined));
    });

    it('should call subscribed callback with provided thisArg if one provided', function () {
        let ctx = {};
        instance.on('foo', function () {
            assert.equal(this, ctx);
        }, ctx);
        instance.trigger('foo');
    });

    it('should not call callbacks, that have subscribed in another callback', function () {
        let spy = bond();
        instance.on('foo', function () {
            instance.on('foo', spy);
        });
        instance.trigger('foo');
        assert.equal(spy.called, 0);
    });

    it('should allow to unsubscribe from a single callback', function () {
        let spy = bond();
        instance.on('foo', spy);
        instance.trigger('foo');
        instance.off('foo', spy);
        instance.trigger('foo');
        assert.equal(spy.called, 1);
    });

    it('should allow to unsubscribe from all callbacks for a certain event', function () {
        let spyFoo = bond();
        let spyBar = bond();
        instance.on('foo', spyFoo);
        instance.on('bar', spyBar);
        instance.off('foo');
        instance.trigger('foo');
        instance.trigger('bar');
        assert.equal(spyFoo.called, 0);
        assert.equal(spyBar.called, 1);
    });

    it('should allow to unsubscribe from all callbacks', function () {
        let spyFoo = bond();
        let spyBar = bond();
        instance.on('foo', spyFoo);
        instance.on('bar', spyBar);
        instance.off();
        instance.trigger('foo');
        instance.trigger('bar');
        assert.equal(spyFoo.called, 0);
        assert.equal(spyBar.called, 0);
    });

    it('should allow to specify one-off callbacks', function () {
        let spy = bond();
        instance.once('foo', spy);
        instance.trigger('foo');
        instance.trigger('foo');
        assert.equal(spy.called, 1);
    });

    it('should allow to unsubscribe from one-off callbacks', function () {
        let spy = bond();
        instance.once('foo', spy);
        instance.off('foo', spy);
        instance.trigger('foo');
        assert.equal(spy.called, 0);
    });

    it('should allow to subscribe to all events', function () {
        let spy = bond();
        instance.on(happened.ALL_EVENTS, spy);
        instance.trigger('foo');
        instance.trigger('bar');
        assert.equal(spy.called, 2);
    });

    it('should allow to unsubscribe from all-events callback', function () {
        let spy = bond();
        instance.on(happened.ALL_EVENTS, spy);
        instance.off(happened.ALL_EVENTS, spy);
        instance.trigger('foo');
        assert.equal(spy.called, 0);
    });

});

