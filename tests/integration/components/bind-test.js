import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { get, run, set } = Ember;

moduleForComponent('helper:bind', 'Integration | Helper | bind', {
  integration: true,

  beforeEach() {
    let testContext = this;
    function recordCall(...args) {
      set(testContext, 'context', this);
      set(testContext, 'arguments', args);
    }

    let actions = { method: recordCall };
    let model = { method: recordCall, actions };

    this.set('model', model);
    this.set('method', recordCall);

    this.callAction = function() {
      run(() => this.$('button').click());
    }

    this.assertContext = function(assert, expectedContext, msg) {
      let actualContext = get(testContext, 'context');
      if (!msg) {
        msg = `Expected context ${expectedContext} but got ${actualContext}`;
      }
      assert.strictEqual(actualContext, expectedContext);
    };

    this.assertArguments = function(assert, expectedArguments, msg) {
      let actualArguments = get(testContext, 'arguments');
      if (!msg) {
        msg = `Expected arguments ${expectedArguments} but got ${actualArguments}`;
      }
      assert.deepEqual(actualArguments, expectedArguments);
    }
  }
});

test('it changes the context of a function, function: method, context: implicit this', function(assert) {
  this.render(hbs`<button {{action (bind method)}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, this);
  this.assertArguments(assert, []);
});

test('it changes the context of a function, function: method, context: this', function(assert) {
  this.render(hbs`<button {{action (bind method target=this) value="target.value"}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, this);
  this.assertArguments(assert, []);
});

test('it changes the context of a function, function: method, context: model.actions', function(assert) {
  this.render(hbs`<button {{action (bind method target=model.actions)}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, get(this, 'model.actions'));
  this.assertArguments(assert, []);
});

test('it changes the context of a function, function: model.method, context: implicit model', function(assert) {
  this.render(hbs`<button {{action (bind model.method)}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, get(this, 'model'));
  this.assertArguments(assert, []);
});

test('it changes the context of a function, function: model.method, context: model', function(assert) {
  this.render(hbs`<button {{action (bind model.method target=model)}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, get(this, 'model'));
  this.assertArguments(assert, []);
});

test('it changes the context of a function, function: model.method, context: model.actions.', function(assert) {
  this.render(hbs`<button {{action (bind model.method target=model.actions)}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, get(this, 'model.actions'));
  this.assertArguments(assert, []);
});

test('it changes the context of a function, function: model.actions.method, context: implicit model.actions.', function(assert) {
  this.render(hbs`<button {{action (bind model.actions.method)}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, get(this, 'model.actions'));
  this.assertArguments(assert, []);
});

test('it changes the context of a function, function: model.actions.method, context: model.actions.', function(assert) {
  this.render(hbs`<button {{action (bind model.actions.method target=model.actions)}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, get(this, 'model.actions'));
  this.assertArguments(assert, []);
});

test('it passes the extra argument to bind', function(assert) {
  this.render(hbs`<button {{action (bind model.actions.method "adios")}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, get(this, 'model.actions'));
  this.assertArguments(assert, ['adios']);
});

test('it passes the extra argument to bind and keeps explicit target', function(assert) {
  this.render(hbs`<button {{action (bind model.actions.method "adios" target=model)}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, get(this, 'model'));
  this.assertArguments(assert, ['adios']);
});

test('it passes the extra arguments to bind', function(assert) {
  this.render(hbs`<button {{action (bind model.actions.method "adios" 1 model)}}>Click</button>`);

  this.callAction();

  this.assertContext(assert, get(this, 'model.actions'));
  this.assertArguments(assert, ['adios', 1, get(this, 'model')]);
});
