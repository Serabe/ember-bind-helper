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

/* eslint-disable-next-line no-console */
const error = console.error.bind(console, '[BIND]');

// Only show farewell once.
const showLongMessage = (() => {
  let shown = false;

  return () => {
    if (!shown) {
      shown = true;
      error('Hi, I\'m your ember-bind-helper addon.');
      error('This is not meant to mess with you, I enjoyed our time together.');
      error('Sadly, I am going away, but do not fear, a better version of me will');
      error('be added to Ember itself.');
      error('');
      error('Sadly magic is dying with me, so target needs to be explicit now.');
      error('Do not forget to add it as the context argument, or use a decorator to');
      error('to bind the method in the class itself.');
      error('');
      error('Please, refer to the following errors on how to move forward.');
      error('You will find the location and what you need to replace.');
      error('Forgive me, but I cannot help you with a specific location in tests.');
      error('');
      error('Thank you for our time together,');
      error('');
      error('ember-bind-helper');
      error('');
    }
  }
})();

const NODE_TO_STR = {
  PathExpression(node) {
    let content = node.parts.join('.');
    if (node.data) {
      return `@${content}`;
    }

    if (node.this) {
      if (node.parts.length === 0) {
        return 'this';
      }

      return `this.${content}`;
    }

    return content;
  },
  MustacheExpression(node) {
    let result = `${nodeToStr(node.path)} ${nodeToStr(node.params.join(' '))} ${node.hash.pairs.map(nodeToStr).join(' ')}`;

    if (node.escaped) {
      return `{{${result}}}`
    }

    return `{{{${result}}}}`;
  },
  HashPair(node) {
    return `${node.key}=${nodeToStr(node.value)}`;
  },
  StringLiteral(node) {
    return `"${node.value}"`;
  },
  NumberLiteral(node) {
    return `${node.value}`;
  },
  BooleanLiteral(node) {
    return node.value ? 'true' : 'false';
  },
  NullLiteral() {
    return 'null';
  },
  UndefinedLiteral() {
    return 'undefined';
  }
};

const nodeToStr = (node) => NODE_TO_STR[node.type](node);

const location = ({ loc: { start: { line, column }}}, source) => {
  if (source === 'TEST') {
    return source;
  }

  return `${source}:${line}:${column}`;
};

const singleSpace = (str) => str.replace(/\s+/g, ' ');

const invocation = (node, newContext) => {
  let result = `bind ${nodeToStr(node.params[0])} ${node.params.slice(1).map(nodeToStr).join(' ')} context=${nodeToStr(newContext)}`;

  if (node.type === 'MustacheStatement') {
    return singleSpace(`{{${result}}}`);
  }

  return singleSpace(`(${result})`);
}

const errorMessageForMagicNode = (node, defaultContent, file) => {
  let locationStr = location(node, file);
  let newInvocation = invocation(node, defaultContent);

  return `${locationStr}: Use implicit context: ${newInvocation}`;
};

const errorMessageForNodeWithTarget = (node, targetPair, file) => {
  let locationStr = location(node, file);
  let newInvocation = invocation(node, targetPair.value);

  return `${locationStr}: Rename target to context: ${newInvocation}`;
};

const filename = (arg) => {
  if (arg.meta.moduleName) {
    return arg.meta.moduleName;
  }

  return 'TEST';
};

module.exports = class BindTransform {
  constructor(arg) {
    this.moduleName = filename(arg);
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
      let hasContext = node.hash.pairs.some(p => p.key === "context");

      if (hasTarget) {
        showLongMessage();
        let targetPair = node.hash.pairs.find(p => p.key === 'target');
        targetPair.key = 'context';

        error(errorMessageForNodeWithTarget(node, targetPair, this.moduleName));
      } else if(!hasContext) {
        showLongMessage();
        let target = this.getDefaultTarget(node.params[0]);

        node.hash.pairs.push(this.builders.pair("context", target));

        error(errorMessageForMagicNode(node, target, this.moduleName));
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
