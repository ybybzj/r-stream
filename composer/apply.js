var r$ = require('../index');
var curry = require('fnkit/curry');

function apply(s1, s2) {
  return r$([s1, s2], function() {
    return s2()(s1());
  });
}
module.exports = curry(2, apply);