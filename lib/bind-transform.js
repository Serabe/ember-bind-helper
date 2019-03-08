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

module.exports = class BindTransform {
  constructor() {
    this.syntax = null;
  }

  get builders() {
    return this.syntax.builders;
  }

  transform(ast) {
    let transform = node => this.transformNode(node);
    this.syntax.traverse(ast, {
      SubExpression: transform,
      MustacheStatement: transform
    });

    return ast;
  }

  transformNode(node) {
    this.addTarget(node);
  }

  addTarget(node) {
    if (node.path.original === "bind" && node.params.length > 0) {
      let hasTarget = node.hash.pairs.some(p => p.key === "target");

      if (!hasTarget) {
        let target = this.getDefaultTarget(node.params[0]);

        node.hash.pairs.push(this.builders.pair("target", target));
      }
    }
  }

  getDefaultTarget(fn) {
    let { builders } = this;

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

        return this.pathFor(parts.join("."), fn.data);
      }
    }
  }

  pathFor(completePath, isData = false /* named argument */) {
    let path = this.builders.path(completePath);

    path.data = isData;

    return path;
  }
};
