/* eslint-env node */
"use strict";

/*
  ```hbs
  {{bind submit x y z}}
  {{bind this.submit x y z}}
  {{bind some.service.submit x y z}}
  {{bind submit x y z target=existing.target}}
  {{bind (action 'submit') x y z}}
  ```

  becomes

  ```hbs
  {{bind submit x y z target=this}}
  {{bind this.submit x y z target=this}}
  {{bind some.service.submit x y z target=some.service}}
  {{bind submit x y z target=existing.target}}
  {{bind (action 'submit') x y z target=null}}
  ```
*/

function BindTransform() {
  this.syntax = null;
}

BindTransform.prototype.transform = function(ast) {
  var b = this.syntax.builders;

  this.syntax.traverse(ast, {
    SubExpression(node) {
      transform(node);
    },
    MustacheStatement(node) {
      transform(node);
    }
  });

  function transform(call) {
    if (call.path.original === "bind" && call.params.length > 0) {
      let hasTarget = call.hash.pairs.some(p => p.key === "target");

      if (!hasTarget) {
        let target = getDefaultTarget(call.params[0]);

        call.hash.pairs.push(b.pair("target", target));
      }
    }

    function getDefaultTarget(fn) {
      if (fn.type === "PathExpression") {
        if (fn.parts.length === 0) {
          return b.null();
        } else if (fn.parts.length === 1) {
          return b.path("this");
        } else {
          let parts = fn.parts.slice(0);
          parts.pop(); // Remove function part

          let lastPart = parts[parts.length - 1];

          if (lastPart !== "actions") {
            return b.path(parts.join("."));
          }

          parts.pop(); // Remove actions part

          if (parts.length === 0) {
            return b.path("this");
          }

          return b.path(parts.join("."));
        }
      } else {
        return b.null();
      }
    }
  }

  return ast;
};

module.exports = BindTransform;
