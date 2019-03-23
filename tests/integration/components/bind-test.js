import { get, set } from '@ember/object';
import { click, render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

function setupBindTest(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    let testContext = this;
    function recordCall(...args) {
      set(testContext, 'boundContext', this);
      set(testContext, 'boundArguments', args);
    }

    let submodel = { method: recordCall };
    let actions = { method: recordCall };
    let model = { method: recordCall, submodel, actions };

    this.set('model', model);
    this.set('method', recordCall);
    this.set('actions', actions);

    this.callAction = async function() {
      return click('button');
    }

    this.assertContext = function(assert, expectedContext, msg) {
      let actualContext = get(testContext, 'boundContext');
      if (!msg) {
        msg = `Expected context ${expectedContext} but got ${actualContext}`;
      }
      assert.strictEqual(actualContext, expectedContext);
    };

    this.assertContextIsComponent = function(assert, msg='Expected the context to be a component') {
      assert.equal(this.boundContext.constructor.name, 'MyComponent', msg);
    }

    this.assertArguments = function(assert, expectedArguments, msg) {
      let actualArguments = get(testContext, 'boundArguments');
      if (!msg) {
        msg = `Expected arguments ${expectedArguments} but got ${actualArguments}`;
      }
      assert.deepEqual(actualArguments, expectedArguments);
    }
  });
}

module('Integration | Helper | bind', function(hooks) {
  setupBindTest(hooks);

  test('it changes the context of a function, function: method, context: implicit this', async function(assert) {
    await render(hbs`<button {{action (bind method)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, null);
    this.assertArguments(assert, []);
  });

  test('it changes the context of a function, function: method, context: this', async function(assert) {
    await render(hbs`<button {{action (bind method context=this)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, this);
    this.assertArguments(assert, []);
  });

  test('it changes the context of a function, function: method, context: model.submodel', async function(assert) {
    await render(hbs`<button {{action (bind method context=model.submodel)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, get(this, 'model.submodel'));
    this.assertArguments(assert, []);
  });

  test('it changes the context of a function, function: model.method, context: implicit model', async function(assert) {
    await render(hbs`<button {{action (bind model.method)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, null);
    this.assertArguments(assert, []);
  });

  test('it changes the context of a function, function: model.method, context: model', async function(assert) {
    await render(hbs`<button {{action (bind model.method context=model)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, get(this, 'model'));
    this.assertArguments(assert, []);
  });

  test('it changes the context of a function, function: model.method, context: model.submodel.', async function(assert) {
    await render(hbs`<button {{action (bind model.method context=model.submodel)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, get(this, 'model.submodel'));
    this.assertArguments(assert, []);
  });

  test('it changes the context of a function, function: model.submodel.method, context: implicit model.submodel.', async function(assert) {
    await render(hbs`<button {{action (bind model.submodel.method)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, null);
    this.assertArguments(assert, []);
  });

  test('it changes the context of a function, function: model.submodel.method, context: model.submodel.', async function(assert) {
    await render(hbs`<button {{action (bind model.submodel.method context=model.submodel)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, get(this, 'model.submodel'));
    this.assertArguments(assert, []);
  });

  test('helper explicitly removes `actions` if it is the last part in a PathExpression, function: model.actions.myMethod, context: implicit model', async function(assert) {
    await render(hbs`<button {{action (bind model.actions.method 1)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, null);
    this.assertArguments(assert, [1]);
  });

  test('helper explicitly removes `actions` if it is the last part in a PathExpression, function: actions.myMethod, context: implicit this', async function(assert) {
    await render(hbs`<button {{action (bind actions.method 1)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, null);
    this.assertArguments(assert, [1]);
  });

  test('it passes the extra argument to bind', async function(assert) {
    await render(hbs`<button {{action (bind model.submodel.method "adios")}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, null);
    this.assertArguments(assert, ['adios']);
  });

  test('it passes the extra argument to bind and keeps explicit context', async function(assert) {
    await render(hbs`<button {{action (bind model.submodel.method "adios" context=model)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, get(this, 'model'));
    this.assertArguments(assert, ['adios']);
  });

  test('it passes the extra arguments to bind', async function(assert) {
    await render(hbs`<button {{action (bind model.submodel.method "adios" 1 model)}}>Click</button>`);

    await this.callAction();

    this.assertContext(assert, null);
    this.assertArguments(assert, ['adios', 1, get(this, 'model')]);
  });
});

module("[GH#6] {{bind}} doesn't work with @arg objects", function (hooks) {
  setupBindTest(hooks);

  test('(bind @method)', async function (assert) {
    await render(hbs`<BindMethod @method={{this.method}} />`);

    await this.callAction();

    this.assertContext(assert, null);
    this.assertArguments(assert, []);
  });

  test('(bind @method context=this)', async function (assert) {
    await render(hbs`<BindMethodWithContextAsTarget @method={{this.method}} />`);

    await this.callAction();

    this.assertContextIsComponent(assert);
    this.assertArguments(assert, []);
  });

  test('(bind @model.actions.method)', async function (assert) {
    await render(hbs`<BindModelActions @model={{this.model}} />`);

    await this.callAction();

    this.assertContext(assert, null);
  });

  test('(bind @method context=@model.submodel)', async function (assert) {
    await render(hbs`<BindMethodWithTarget @method={{this.method}} @model={{this.model}} />`);

    await this.callAction();

    this.assertContext(assert, get(this, 'model.submodel'));
    this.assertArguments(assert, []);
  });

  test('(bind @model.method)', async function (assert) {
    await render(hbs`<BindModelMethod @model={{this.model}} />`);

    await this.callAction();

    this.assertContext(assert, null);
    this.assertArguments(assert, []);
  });

  test('(bind @model.submodel.method)', async function (assert) {
    await render(hbs`<BindSubmodelModelMethod @model={{this.model}} />`);

    await this.callAction();

    this.assertContext(assert, null);
    this.assertArguments(assert, []);
  });
});
