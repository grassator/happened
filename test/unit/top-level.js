import happened from 'happened';

function assertDuckType(obj) {
    assert.isFunction(obj.on);
    assert.isFunction(obj.once);
    assert.isFunction(obj.off);
    assert.isFunction(obj.trigger);
    assert.isString(obj.ALL_EVENTS);
}

describe('Top Level API', function () {

    describe('general', function () {

        it('should be a frozen object', function () {
            assert(Object.isFrozen(happened));
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

    describe('addTo', function () {

        it('should require an object', function () {
            assert.throws(function () {
                happened.addTo(5);
            }, Error);
        });

        it('should return an instance', function () {
            assertDuckType(happened.addTo({}));
        });

        it('should mix in all events in passed object', function () {
            let obj = {};
            happened.addTo(obj);
            assertDuckType(obj);
        });

        it('should accept a happened instance', function () {
            let obj = {};
            let instance = happened.create();
            assert.equal(happened.addTo(obj, instance), instance);
            assert.equal(instance.on, obj.on);
        });

    });
});

