import happened from 'happened';

function assertDuckType(obj) {
    assert.isFunction(obj.on);
    assert.isFunction(obj.once);
    assert.isFunction(obj.off);
    assert.isFunction(obj.trigger);
}

describe('Top Level API', function () {

    describe('general', function () {

        it('should be a frozen object', function () {
            assert(Object.isFrozen(happened));
        });

        it('should have a global instance', function () {
            assertDuckType(happened.global);
        });

    });

    describe('create', function () {

        it('should return a frozen object', function () {
            assert(Object.isFrozen(happened.create()));
        });

        it('should create instance of happened', function () {
            var instance = happened.create();
            assertDuckType(instance);
        });

    });

    describe('channel', function () {

        it('should require a name', function () {
            assert.throws(function () {
                happened.channel();
            }, Error);
        });

        it('should return an instance', function () {
            assertDuckType(happened.channel('foo'));
        });

        it('should return the same instance for multiple calls with same name', function () {
            assert.equal(happened.channel('foo'), happened.channel('foo'));
        });

    });
});

