const happened = {};

// This weird magic is manual optimization for file size
const channelMap = Object.create(null);

function dispatcherSync(callback) { callback(); }
let dispatcherAsync = (this && this.setTimeout) || dispatcherSync;
let currentDispatcher = dispatcherAsync;

happened.SYNC = dispatcherSync;

happened.ALL_EVENTS = '357dada3-e2a8-4966-8bd1-ea5c52752f63';

/**
 * This callback is displayed as part of the Requester class.
 * @callback happened~dispatcher
 * @param {Function} callback
 */

/**
 * Changes current dispatcher to a provided one.
 * `dispatcher` is simply a function that accepts a callback that is
 * guaranteed to be executed at some point in the future, and also
 * guarantees that callbacks will be executed in the same order as
 * they were submitted to dispatcher.
 * @param {happened~dispatcher} dispatcher
 */
happened.setDispatcher = function (dispatcher) {
    if (HAPPENED_LIB_ENV !== 'production' &&
        typeof dispatcher !== 'function'
    ) {
        throw new Error('Dispatcher must be a function');
    }
    currentDispatcher = dispatcher;
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
    let callbackMap = Object.create(null);

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
            callbackMap = Object.create(null);
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

    return Object.freeze({
        off,

        on: function (name, callback, thisArg) {
            baseOn(name, callback, thisArg);
        },

        once: function (name, callback, thisArg) {
            function customCallback() {
                off(name, customCallback);
                callback.apply(this, arguments);
            }
            baseOn(name, customCallback, thisArg, callback);
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
            let allEventsCallbackList = callbackMap[happened.ALL_EVENTS];

            if (!eventCallbackList && !allEventsCallbackList) {
                return;
            }

            currentDispatcher(function () {
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
        }
    });
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

export default Object.freeze(happened);
