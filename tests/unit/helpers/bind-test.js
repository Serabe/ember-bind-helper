import { bind } from 'ember-bind-helper/helpers/bind';
import { module, test } from 'qunit';

module('Unit | Helper | bind');

// Replace this with your real tests.
test('it works', function(assert) {
  let context = {
    prop: 'before'
  };

  function fn(value) {
    this.prop = value;
  }

  let result = bind([fn, context]);
  result('after');
  assert.equal(context.prop, 'after');
});

test('it throws error if no argument is passed', function(assert) {
  assert.throws(
    function() {
      bind([]);
    },
    /one argument/);
});

test('if first argument is not a function, throw an error', function(assert) {
  assert.throws(
    function() {
      bind(['not a function']);
    },
    /function/);
});

test('if no second argument, it is bound to null', function(assert) {
  assert.expect(1);

  function fun() {
    assert.ok(this === null);
  }

  bind([fun])();
});

