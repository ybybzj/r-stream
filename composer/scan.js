var r$ = require('../index');
var curry = require('fnkit/curry');

function scan(f, acc, s) {
  var ns = r$([s], function() {
    return (acc = f(acc, s()));
  });
  if (!ns.hasVal) ns(acc);
  return ns;
}
module.exports = curry(3, scan);