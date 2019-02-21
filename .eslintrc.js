module.exports = {
  "extends": "airbnb-base",
  "env": {
    "node": true,
    "mocha": true
  },
  "rules": {
    "no-unused-vars": 1,
    "linebreak-style": ["off"],
    "no-console": ["off"],
    "no-plusplus": ["off"],
    "max-len": ["error", {
      "code": 130
    }],
    "no-unused-expressions": ["off"],
    "no-mixed-operators": ["off"],
    "no-shadow": ["off"],
    "class-methods-use-this": ["off"],
    "no-param-reassign": ["off"],
    "no-control-regex": ["off"],
    "prefer-rest-params": ["off"]
  }
};
