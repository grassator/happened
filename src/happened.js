const happened = {};
const ALL_EVENTS = happened.ALL_EVENTS = '357dada3-e2a8-4966-8bd1-ea5c52752f63';

function syncScheduler(callback) {
    callback();
}

function createMap() {
    return Object.create ? Object.create(null) : {};
}

function freezeIfPossible(obj) {
    return Object.freeze ? Object.freeze(obj) : obj;
}

let defaultScheduler = typeof setTimeout === 'function' ? function (callback) {
    setTimeout(callback);
} : syncScheduler;

/**
 * @callback happened~scheduler
 * @param {Function} callback
 */

/** @type {happened~scheduler} */
happened.SYNC = syncScheduler;

/**
 * @typedef {Object} HappenedOptions
 * @property {happened~scheduler} scheduler
 */

/**
 * @typedef {Object} HappenedInstance
 * @property {Function} on
 * @property {Function} once
 * @property {Function} off
 * @property {Function} trigger
 */

/**
 * Creates and returns a new instance of `happened`.
 * @param {HappenedOptions} options
 * @returns {HappenedInstance}
 */
happened.create = function (options) {

    if (HAPPENED_LIB_ENV !== 'production' &&
        !(
            typeof options === 'undefined' ||
            (typeof options === 'object' && options !== null)
        )
    ) {
        throw new Error('You need to provide a an object as `options`');
    }

    let callbackMap = createMap();
    let scheduler = (options && options.scheduler) || defaultScheduler;

    if (HAPPENED_LIB_ENV !== 'production' &&
        typeof scheduler !== 'function'
    ) {
        throw new Error('`scheduler` provided in `options` must be a function');
    }

    function baseOn(name, callback, thisArg, original) {
        if (HAPPENED_LIB_ENV !== 'production' &&
            typeof name !== 'string'
        ) {
            throw new Error('You need to provide a name for subscribing');
        }

        if (HAPPENED_LIB_ENV !== 'production' &&
            typeof callback !== 'function'
        ) {
            throw new Error('You need to provide a callback for subscribing');
        }

        if (!callbackMap[name]) {
            callbackMap[name] = [];
        }
        callbackMap[name].push({ thisArg, original, callback });
    }

    function off(name, callback) {
        if (!name && !callback) {
            callbackMap = createMap();
            return;
        }

        if (HAPPENED_LIB_ENV !== 'production' &&
            typeof name !== 'string'
        ) {
            throw new Error('You need to provide a name of an event');
        }

        let callbackList = callbackMap[name];
        if (!callbackList) {
            return;
        }

        if (!callback) {
            callbackMap[name] = [];
            return;
        }

        if (HAPPENED_LIB_ENV !== 'production' &&
            typeof callback !== 'function'
        ) {
            throw new Error('If you provide a callback it needs to be a function');
        }

        for (let i = 0; i < callbackList.length; ++i) {
            if (callbackList[i].callback === callback ||
                callbackList[i].original === callback
            ) {
                callbackList.splice(i--, 1);
            }
        }
    }

    return freezeIfPossible({
        ALL_EVENTS,
        off,

        trigger: function (name) {
            if (HAPPENED_LIB_ENV !== 'production' &&
                typeof name !== 'string'
            ) {
                throw new Error('You need to provide a name to trigger an event');
            }

            let params = [];
            for (let i = 1; i < arguments.length; ++i) {
                params.push(arguments[i]);
            }

            let eventCallbackList = callbackMap[name];
            let allEventsCallbackList = callbackMap[ALL_EVENTS];

            if (!eventCallbackList && !allEventsCallbackList) {
                return;
            }

            scheduler(function () {
                if (eventCallbackList) {
                    eventCallbackList = eventCallbackList.slice();
                    for (let i = 0; i < eventCallbackList.length; ++i) {
                        eventCallbackList[i].callback.apply(eventCallbackList[i].thisArg, params);
                    }
                }

                if (allEventsCallbackList) {
                    allEventsCallbackList = allEventsCallbackList.slice();
                    for (let i = 0; i < allEventsCallbackList.length; ++i) {
                        allEventsCallbackList[i].callback.call(
                            allEventsCallbackList[i].thisArg, name, params
                        );
                    }
                }
            });
        },

        on: function (name, callback, thisArg) {
            baseOn(name, callback, thisArg);
        },

        once: function (name, callback, thisArg) {
            function customCallback() {
                off(name, customCallback);
                callback.apply(this, arguments);
            }
            baseOn(name, customCallback, thisArg, callback);
        }
    });
};

/**
 * A helper for mixin happened instances into other objects.
 * @param {object} object
 */
happened.addTo = function (object, instance) {
    if (HAPPENED_LIB_ENV !== 'production' &&
        typeof object !== 'object'
    ) {
        throw new Error('`happened` can only be mixed into an object');
    }

    if (HAPPENED_LIB_ENV !== 'production' &&
        !(
        typeof instance === 'undefined' ||
        (typeof instance === 'object' && instance !== null)
        )
    ) {
        throw new Error('You need to provide a valid object as an instance of `happened`');
    }

    instance = instance || happened.create();
    object.on = instance.on;
    object.once = instance.once;
    object.off = instance.off;
    object.trigger = instance.trigger;
    object.ALL_EVENTS = instance.ALL_EVENTS;
    return instance;
};

export default freezeIfPossible(happened);
