import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

const { run } = Ember;

moduleForComponent('helper:bind', 'Integration | Helper | bind', {
  integration: true,

  beforeEach() {
    this.set('model', Ember.Object.create({
      prop: 'object',
      methodName: 'method',

      method(value) {
        Ember.set(this, 'prop', value);
      },

      actions: {
        prop: 'actions',
        method(value) {
          Ember.set(this, 'prop', value);
        }
      }
    }));

    this.assertNewValueWasSetInModel = function(assert, newValue) {
      let model = this.get('model');
      assert.equal(model.get('prop'), newValue, 'newValue was set in model');
      assert.equal(model.get('actions.prop'), 'actions', 'newValue was not set in actions hash');
    };
    this.assertNewValueWasSetInActions = function(assert, newValue) {
      let model = this.get('model');
      assert.equal(model.get('prop'), 'object', 'newValue was not set in model');
      assert.equal(model.get('actions.prop'), newValue, 'newValue was set in actions hash');
    };
  }
});

test('it changes the context of a function, function: model.method, context model', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind model.method model) value="target.value")}}`);

  run(() => {
    this.$('input').val('hola').trigger('input');
  });

  this.assertNewValueWasSetInModel(assert, 'hola');
});

test('it changes the context of a function, function: model.method, context model.actions.', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind model.method model.actions) value="target.value")}}`);

  run(() => {
    this.$('input').val('hola').trigger('input');
  });

  this.assertNewValueWasSetInActions(assert, 'hola');
});

test('it works if passed a mut as first argument', function(assert) {
  this.render(hbs`{{input value="hello" input=(action (bind (action (mut model.prop)) model.actions) value="target.value")}}`);

  run(() => {
    this.$('input').val('hola').trigger('input');
  });

  this.assertNewValueWasSetInModel(assert, 'hola');
});
