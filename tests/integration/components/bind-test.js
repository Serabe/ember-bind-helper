import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { run, set } = Ember;

moduleForComponent('helper:bind', 'Integration | Helper | bind', {
  integration: true,

  beforeEach() {
    this.set('model', Ember.Object.create({
      prop: 'object',
      methodName: 'method',

      method(value) {
        set(this, 'prop', value);
      },

      actions: {
        prop: 'actions',
        method(value) {
          set(this, 'prop', value);
        }
      }
    }));

    this.set('prop', 'root');
    this.set('method', function(value) { set(this, 'prop', value)});

    this.callAction = function(value) {
      run(() => this.$('input').val(value).trigger('input'));
    }

    this.assertNewValueWasSetInRoot = function(assert, newValue) {
      let model = this.get('model');
      assert.equal(this.get('prop'), newValue, 'newValue was set in root');
      assert.equal(model.get('prop'), 'object', 'newValue was not set in model');
      assert.equal(model.get('actions.prop'), 'actions', 'newValue was not set in actions hash');
    }
    this.assertNewValueWasSetInModel = function(assert, newValue) {
      let model = this.get('model');
      assert.equal(this.get('prop'), 'root', 'newValue was not set in root');
      assert.equal(model.get('prop'), newValue, 'newValue was set in model');
      assert.equal(model.get('actions.prop'), 'actions', 'newValue was not set in actions hash');
    };
    this.assertNewValueWasSetInActions = function(assert, newValue) {
      let model = this.get('model');
      assert.equal(this.get('prop'), 'root', 'newValue was not set in root');
      assert.equal(model.get('prop'), 'object', 'newValue was not set in model');
      assert.equal(model.get('actions.prop'), newValue, 'newValue was set in actions hash');
    };
  }
});

test('it changes the context of a function, function: method, context: implicit this', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind method) value="target.value")}}`);

  this.callAction('hola');

  this.assertNewValueWasSetInRoot(assert, 'hola');
});

test('it changes the context of a function, function: method, context: this', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind method target=this) value="target.value")}}`);

  this.callAction('hola');

  this.assertNewValueWasSetInRoot(assert, 'hola');
});

test('it changes the context of a function, function: method, context: model.actions', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind method target=model.actions) value="target.value")}}`);

  this.callAction('hola');

  this.assertNewValueWasSetInActions(assert, 'hola');
});

test('it changes the context of a function, function: model.method, context: implicit model', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind model.method) value="target.value")}}`);

  this.callAction('hola');

  this.assertNewValueWasSetInModel(assert, 'hola');
});

test('it changes the context of a function, function: model.method, context: model', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind model.method target=model) value="target.value")}}`);

  this.callAction('hola');

  this.assertNewValueWasSetInModel(assert, 'hola');
});

test('it changes the context of a function, function: model.method, context: model.actions.', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind model.method target=model.actions) value="target.value")}}`);

  this.callAction('hola');

  this.assertNewValueWasSetInActions(assert, 'hola');
});

test('it changes the context of a function, function: model.actions.method, context: implicit model.actions.', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind model.actions.method) value="target.value")}}`);

  this.callAction('hola');

  this.assertNewValueWasSetInActions(assert, 'hola');
});

test('it changes the context of a function, function: model.actions.method, context: model.actions.', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind model.actions.method target=model.actions) value="target.value")}}`);

  this.callAction('hola');

  this.assertNewValueWasSetInActions(assert, 'hola');
});

test('it passes the extra argument to bind', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind model.actions.method "adios") value="target.value")}}`);

  this.callAction('hola');

  this.assertNewValueWasSetInActions(assert, 'adios');
})
