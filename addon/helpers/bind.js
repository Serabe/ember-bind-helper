import { helper } from '@ember/component/helper';
import { run } from '@ember/runloop';

export function bind([f, ...params], { target }) {
  if (!f || typeof f !== 'function') { throw 'bind needs to receive at least one argument, a function'; }

  return run.bind(target, f, ...params);
}

export default helper(bind);
