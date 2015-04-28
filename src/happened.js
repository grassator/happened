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

const channelMap = createMap();

let defaultScheduler = (this && this.setTimeout) || syncScheduler;

happened.SYNC = syncScheduler;


/**
 * @callback happened~scheduler
 * @param {Function} callback
 */

/**
 * Changes default scheduler to a provided one.
 * `scheduler` is simply a function that accepts a callback that is
 * guaranteed to be executed at some point in the future, and also
 * guarantees that callbacks will be executed in the same order as
 * they were submitted to scheduler.
 * @param {happened~scheduler} scheduler
 */
happened.setDefaultScheduler = function (scheduler) {
    if (HAPPENED_LIB_ENV !== 'production' &&
        typeof scheduler !== 'function'
    ) {
        throw new Error('Scheduler must be a function');
    }
    defaultScheduler = scheduler;
};

/**
 * @typedef {Object} HappenedInstance
 * @property {Function} on
 * @property {Function} once
 * @property {Function} off
 * @property {Function} trigger
 */

/**
 * Creates and returns a new instance of `happened`.
 * @returns {HappenedInstance}
 */
happened.create = function () {
    let callbackMap = createMap();
    let scheduler = defaultScheduler;

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

        setScheduler: function (newScheduler) {
            if (HAPPENED_LIB_ENV !== 'production' &&
                typeof scheduler !== 'function'
            ) {
                throw new Error('Scheduler must be a function');
            }
            defaultScheduler = newScheduler;
        },

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
happened.addTo = function (object) {
    if (HAPPENED_LIB_ENV !== 'production' &&
        typeof object !== 'object'
    ) {
        throw new Error('`happened` can only be mixed into an object');
    }
    const events = happened.create();
    object.on = events.on;
    object.once = events.once;
    object.off = events.off;
    object.trigger = events.trigger;
    object.ALL_EVENTS = events.ALL_EVENTS;
    return events;
};

/**
 * Returns a happened instance for a given name. If one is not available,
 * it is created and cached, guaranteeing that multiple calls with the same
 * name will return the same instance.
 * @param {string} name
 */
happened.channel = function (name) {
    if (HAPPENED_LIB_ENV !== 'production' &&
        typeof name !== 'string'
    ) {
        throw new Error('You need to provide a name for a channel');
    }
    if (!channelMap[name]) {
        channelMap[name] = happened.create();
    }
    return channelMap[name];
};

/**
 * Global instance, handy for global event bus.
 * @type {HappenedInstance}
 */
happened.global = happened.create();

export default freezeIfPossible(happened);
