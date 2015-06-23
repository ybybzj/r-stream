var r$ = require('../index');
var curry = require('@zj/fnkit/curry');
var merge = function merge(s1, s2) {
  var s = r$.immediate(r$([s1, s2], function(n, changed) {
    return changed[0] ? changed[0]() : s1.hasVal ? s1() : s2();
  }));
  r$.endsOn(r$([s1.end, s2.end], function(self, changed) {
    return true;
  }), s);
  return s;
};
module.exports = curry(2, merge);