var r$ = require('../index');
var curry = require('fnkit/curry');
var filter = function(fn, s) {
  return r$([s], function(self) {
    if (fn(s())) self(s.val);
  });
};

module.exports = curry(2, filter);