# Ember Bind Helper
[![Build Status](https://travis-ci.org/Serabe/ember-bind-helper.svg?branch=master)](https://travis-ci.org/Serabe/ember-bind-helper)
[![Ember Observer Score](https://emberobserver.com/badges/ember-bind-helper.svg)](https://emberobserver.com/addons/ember-bind-helper)
[![Code Climate](https://codeclimate.com/github/Serabe/ember-bind-helper/badges/gpa.svg)](https://codeclimate.com/github/Serabe/ember-bind-helper)
[![dependencies Status](https://david-dm.org/Serabe/ember-bind-helper/status.svg)](https://david-dm.org/Serabe/ember-bind-helper)

This addon provides a `bind` helper to bind a function to a context.

## Installation

`ember install ember-bind-helper`


## Using `bind`

Let's say we want to call a method of an object when we click a function. We
might think of doing the following:

```hbs
<button onclick={{action myObject.myMethod}}>
  My Button
</button>
```

Sadly, this might not work as expected, given that the context would be the
controller
([twiddle](https://ember-twiddle.com/cdbb3f82da6bd5f6ff02bb2b6783bb82?openFiles=templates.application.hbs%2C)).
To solve this, you can use the `bind` helper:

```hbs
<button onclick={{action (bind myObject.myMethod)}}>
  My Button
</button>
```

This automagically sets the context to `myObject`. If the method were `myObject.mySubobject.myMethod` it would
bind it to `myObject.mySubobject` and so on. The only exception to this rule is that if the last part of the chain
before the method name is `actions`, it gets removed too:

```hbs
<button onclick={{action (bind myObject.actions.myMethod)}}>
  My Button
</button>
```

This sets the context to `myObject`. Normally it would have been `myObject.actions` but, given the last part is `actions`,
ember-bind-helper removes that too leaving only `myObject`.

You can explicitly set the target by adding a named argument `target`:

```hbs
<button onclick={{action (bind myObject.mySubobject.myMethod target=myObject)}}>
  My Button
</button>
```

`bind` also passes any extra parameters to the binding function. Thus, when we click this button:

```hbs
<button onclick={{action (bind myMethod 1 2 3 "caramba")}}>
  My Button
</button>
```

`myMethod` will receive `1`, `2`, `3` and `"caramba"` as arguments.
