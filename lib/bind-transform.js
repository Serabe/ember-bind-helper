/* eslint-env node */
"use strict";

/*
  ```hbs
  {{bind submit x y z}}
  {{bind this.submit x y z}}
  {{bind some.service.submit x y z}}
  {{bind submit x y z target=existing.target}}
  {{bind (action 'submit') x y z}}
  {{bind service.actions.submit}}
  {{bind some.service.actions.submit}}
  ```

  becomes

  ```hbs
  {{bind submit x y z target=this}}
  {{bind this.submit x y z target=this}}
  {{bind some.service.submit x y z target=some.service}}
  {{bind submit x y z target=existing.target}}
  {{bind (action 'submit') x y z target=null}}
  {{bind service.actions.submit target=service}}
  {{bind some.service.actions.submit target=some.service}}
  ```
*/

function transformNode(node, builders) {
  return addTarget(node, builders);
}

function addTarget(node, builders) {
  if (node.path.original === "bind" && node.params.length > 0) {
    let hasTarget = node.hash.pairs.some(p => p.key === "target");

    if (!hasTarget) {
      let target = getDefaultTarget(node.params[0], builders);

      node.hash.pairs.push(builders.pair("target", target));
    }
  }
}

function getDefaultTarget(fn, builders) {

  if (fn.type !== "PathExpression") {
    return builders.null();
  }

  switch (fn.parts.length) {
    case 0:
      return builders.null();
    case 1:
      return builders.path("this");
    default: {
      let parts = fn.parts.slice(0, -1); // Remove function part

      let lastPart = parts[parts.length - 1];

      // Remove actions part
      if (lastPart === "actions") {
        parts.pop();
      }

      if (parts.length === 0) {
        return builders.path("this");
      }

      return pathFor(parts.join("."), fn.data, builders);
    }
  }
}

function pathFor(completePath, isData = false /* named argument */, builders) {
  let path = builders.path(completePath);

  path.data = isData;

  return path;
}

function bindHelperSyntaxPlugin(env) {
  let builders = env.syntax.builders;

  let transform = node => transformNode(node, builders);

  return {
    name: 'ember-bind-helper',
    visitor: {
      SubExpression: transform,
      MustacheStatement: transform
    }
  };
}

module.exports = bindHelperSyntaxPlugin;
