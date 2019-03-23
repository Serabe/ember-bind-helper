import { helper } from "@ember/component/helper";

export function bind([f, ...params], { context=null }) {
  if (!f || typeof f !== "function") {
    throw "bind needs to receive at least one argument, a function";
  }

  return f.bind(context, ...params);
}

export default helper(bind);
