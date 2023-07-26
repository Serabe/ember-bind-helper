'use strict';

module.exports = {
  name: require('./package').name,

  setupPreprocessorRegistry(type, registry) {
    registry.add("htmlbars-ast-plugin", {
      name: "bind",
      plugin: "ember-bind-helper/lib/bind-transform",
    });
  }
};
