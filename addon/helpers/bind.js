import Ember from 'ember';

export function bind([f, context=null]=[]/*, hash*/) {
  if (!f || typeof f !== 'function') { throw 'bind needs to receive at least one argument, a function'; }

  return f.bind(context);
}

export default Ember.Helper.helper(bind);
