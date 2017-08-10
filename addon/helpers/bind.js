import Ember from 'ember';

const { run } = Ember;

export function bind([f, ...params], { target }) {
  if (!f || typeof f !== 'function') { throw 'bind needs to receive at least one argument, a function'; }

  return run.bind(target, f, ...params);
}

export default Ember.Helper.helper(bind);
