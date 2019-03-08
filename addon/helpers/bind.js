import { helper } from "@ember/component/helper";

export function bind([f, ...params], { target }) {
  if (!f || typeof f !== "function") {
    throw "bind needs to receive at least one argument, a function";
  }

  return f.bind(target, ...params);
}

export default helper(bind);
