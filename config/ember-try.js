/* eslint-env node */
const getChannelURL = require("ember-source-channel-url");

module.exports = function() {
  return Promise.all([
    getChannelURL("release"),
    getChannelURL("beta"),
    getChannelURL("canary")
  ]).then(urls => {
    return {
      command: "ember test --reporter xunit",
      npmOptions: ["--loglevel=silent", "--no-shrinkwrap=true"],
      scenarios: [
        {
          name: "ember-lts-2.18",
          command: 'ember test --filter "Helper | bind"',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              "jquery-integration": true
            })
          },
          npm: {
            devDependencies: {
              "@ember/jquery": "^0.5.1",
              "ember-source": "~2.18.0",
              "ember-angle-bracket-invocation-polyfill": "1.2.3",
              "ember-named-arguments-polyfill": "1.0.0"
            }
          }
        },
        {
          name: "ember-lts-3.4",
          npm: {
            devDependencies: {
              "ember-source": "~3.4.0"
            }
          }
        },
        {
          name: "ember-lts-3.8",
          npm: {
            devDependencies: {
              "ember-source": "~3.8.0"
            }
          }
        },
        {
          name: "ember-release",
          npm: {
            devDependencies: {
              "ember-source": urls[0]
            }
          }
        },
        {
          name: "ember-beta",
          npm: {
            devDependencies: {
              "ember-source": urls[1]
            }
          }
        },
        {
          name: "ember-canary",
          npm: {
            devDependencies: {
              "ember-source": urls[2]
            }
          }
        },
        {
          name: "ember-default",
          command: 'ember test --filter "Helper | bind"',
          npm: {
            devDependencies: {
              "ember-angle-bracket-invocation-polyfill": "1.2.3",
              "ember-named-arguments-polyfill": "1.0.0"
            }
          }
        },
        {
          name: "ember-default-with-jquery",
          command: 'ember test --filter "Helper | bind"',
          env: {
            EMBER_OPTIONAL_FEATURES: JSON.stringify({
              "jquery-integration": true
            })
          },
          npm: {
            devDependencies: {
              "@ember/jquery": "^0.5.1",
              "ember-angle-bracket-invocation-polyfill": "1.2.3",
              "ember-named-arguments-polyfill": "1.0.0"
            }
          }
        }
      ]
    };
  });
};
