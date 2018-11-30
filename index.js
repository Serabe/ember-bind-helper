'use strict';

module.exports = {
  name: 'ember-bind-helper',

  setupPreprocessorRegistry(type, registry) {
    registry.add("htmlbars-ast-plugin", {
      name: "bind",
      plugin: require("./lib/bind-transform"),
      baseDir() {
        return __dirname;
      }
    });
  }
};
