# happened

[![NPM version](https://badge.fury.io/js/happened.svg)](https://npmjs.org/package/happened)
[![GitHub version][git-tag-image]][project-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-url]][daviddm-image]

`happened` is a tiny PubSub library (~700 bytes minified and gzipped). It's designed to be an easy replacement for any other PubSub library (e.g. Backbone.Events), but also because of it's tiny size, it's a good choice for any other client-side that wants to provide events without external dependencies. 

## Examples

`happened` tries to cover all common use cases for PubSub:

### Global Event Bus

Sometimes you just want a zero-hassle global event bus. `happened` provides pre-initialized global to support this use case:

```js
var happened = require('happened');
happened.global.on('disco', function () {
    console.log('dance');
});
happened.global.trigger('disco'); // "dance"
```

### Public Channels

`happened` supports public channel setup by calling `happened.channel` method: 

```js
var happened = require('happened');
var radioOne = happened.channel('radio1');
radio1.on('morning-broadcast', function () {
    console.log('wake up');
});

// in another place
happened.channel('radio1').trigger('morning-broadcast', 'impossible'); // "wake up"

```

### Private Channels

Calling `happened` without any parameters will always construct a new instance, that can be used as an event

```js
var happened = require('happened');
var topSecretMessages = happened.create();
topSecretMessages.on('mission', function () {
    console.log('completed');
});
topSecretMessages.trigger('mission', 'impossible'); // "completed"
```

### Mixin for Objects

It's a very common need to have PubSub methods directly exposed on some object, or all objects of a given class. This is usually solved by providing a mixin (e.g. Backbone.Events), which has a downside of a need to define a property on an object, that can conflict with your own properties, or even cause compiler deoptimization if it's injected dynamically by `on` method.

All the methods on `happened` can be called in any context, so that means that they can be simply copied to a newly constructed instance in the constructor:

```js
var happened = require('happened');

function Artist() {
    var events = happened.create();
    // you can choose which methods to copy from happened
    this.on = events.on;
    this.once = events.once;
    this.off = events.off;
    this.trigger = events.trigger;
    
    // additionally if you want to provide support to subscribe
    // to all events it's a good idea to copy corresponding constant
    this.ALL_EVENTS = events.ALL_EVENTS;
}

var superMetalBand = new Artist();
superMetalBand.on('concert', function () {
    console.log('scream');
});
superMetalBand.trigger('concert'); // "scream"
```

Since this is quite verbose `happened` provides a helper method for this common case:

```js
function Artist() {
    happened.addTo(this);
}
```

## More Good Stuff

* Zero dependencies
* Minimal interface (`on`, `once`, `off`, `trigger`), with utility methods exposed only on a global object. 
* UMD package
* Support for custom dispatchers.
* Support for legacy browsers (IE6) (see [requirements](#requirements) for details)
* Node.js support
* all `happened` instances are [frozen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) (immutable) if supported by environment



## Requirements

For synchronous usage `happened` supports any ECMAScript 5 compliant environment. This require a [shim](https://github.com/zloirock/core-js#ecmascript-5) for IE6-8 and some older Android versions.

Async (setTimeout) mode is supported for all mainstream browsers and Node.js, but may not is some esoteric environments, like [Qt QML](http://doc.qt.io/qt-5/qtqml-javascript-hostenvironment.html).

`happened` by default uses asynchronous event dispatching. If you want events to be dispatched faster, you can use global `setDispatcher` to inject other dispatchers, such as [setImmediate](https://github.com/YuzuJS/setImmediate) for macro-task behavior or `process.nextTick` for micro-tasks.

## API

This section contains reference for all public methods and properties of `happened`, to see example usage please refer to [examples section](#usage-patterns) instead.

Type signatures for methods are presented using [flow](http://flowtype.org/docs/functions.html) syntax.

### Top-Level Library Methods and Properties

Main use case for this is to [provide events for instances of other classes](#mixin-for-objects).

`happened` object exported by a library has an interface, that is a mixture of a factory and singleton patterns;

#### `happened.global`

This a preconstructed [instance](#instance-methods) of `happened` that can be used as a global event bus.

#### `happened.create()`

Constructs a new [instance](#instance-methods) of `happened`.

#### `happened.channel(name : string)`

Given the same name will always return the same singleton [instance](#instance-methods) of `happened`, creating it if necessary. Allows for [channel-style](#public-channels) usage.

#### `happened.addTo(target : Object)`

This is convenience method to create a new instance of `happened` and copy it's methods `on`, `once`, `off`, `trigger` and a constant `ALL_EVENTS` to a given `target`:

```js
happened.addTo(target : Object) => HappenedInstance
```

### Instance Methods

#### `on`

This method is used to subscribe for a certain event:

```js
happened.global.on(
    name     : string,
    callback : (...params) => void,
    thisArg  : Object?
) => void
```

The `callback` will receive all the parameters except for the name of the event from `trigger` as it's arguments. `thisArg` is optional context for callback.

Special case here is subscribing to all events, happening on the instance. To do this you need to provide `ALL_EVENTS` constant property available on all instances.

```js
happened.global.on(
    happened.ALL_EVENTS,
    callback : (name : string, params : Array<any>) => void,
    thisArg  : Object?
) => void
```

> NOTE: `callback` for all events has a different signature to a regular one, due to a need to pass event name.

#### `once`

Same as [`on`](#on), but causes the `callback` to only fire once before being `off`ed.

```js
happened.global.once(
    name     : string,
    callback : (...params) => void,
    thisArg  : Object?
) => void
```

#### `off`

Removes a specific `callback` for an event with a given `name`.

```js
happened.global.off(
    name     : string?,
    callback : Function?
) => void
```

If called without `callback`, removes all callbacks for given `name`.

If called without any arguments, remove all callbacks for all events.

#### `trigger`

Triggers callbacks for the given event `name`, additional `...params` to `trigger` will be passed along to the event callbacks.

```js
happened.global.trigger(
    name      : string,
    ...params : any
) => void
```

## Contributing

### Setting Up Development Environment

To start do a fork of this repo, clone it locally and type in your terminal:

```bash
npm install
gulp tdd
```

This will continuously run tests for nice dev experience. To run tests just once or in CI environment you can use:

```bash
gulp test
```

To build for production run:

```bash
gulp build
```

## License

© 2015 Dmitriy Kubyshkin. Licensed under the MIT style license.

[project-url]: https://github.com/grassator/happened
[git-tag-image]: http://img.shields.io/github/tag/grassator/happened.svg
[travis-url]: https://travis-ci.org/grassator/happened
[travis-image]: https://travis-ci.org/grassator/happened.svg?branch=master
[daviddm-url]: https://david-dm.org/grassator/happened.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/grassator/happened
