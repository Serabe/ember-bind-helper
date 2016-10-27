# Ember Bind Helper

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
<button onclick={{action (bind myObject.myMethod myObject)}}>
  My Button
</button>
```
