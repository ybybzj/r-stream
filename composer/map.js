var stream = require('../index');
var curry = require('fnkit/curry');
function map(f, s) {
  return stream([s], function(self) { self(f(s.val)); });
}
module.exports = curry(2, map);