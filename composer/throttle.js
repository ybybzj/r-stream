var r$ = require('../index');
var curry = require('@zj/fnkit/curry');

function throttle(wait, s) {
  var leading, trailing;
  if (typeof wait === 'object') {
    leading = wait.leading == null ? true : !!wait.leading;
    trailing = wait.trailing == null ? true : !!wait.trailing;
    wait = wait.wait;
  }
  if (typeof wait !== 'number') {
    throw new TypeError('[r$ throttle]Invalid options, option "wait" must be a number!');
  }
  var lastVal = [],
    timeoutId, isFirst = true;
  return r$([s], function(self) {
    lastVal.push(s());
    if (isFirst) {
      isFirst = false;
      if (immediate) {
        self(lastVal.pop());
      }
      timeoutId = setTimeout(function checkLastVal() {
        self(lastVal.pop());
        lastVal.length = 0;
        if (!s.end()) {
          timeoutId = setTimeout(checkLastVal, wait);
        } else if (!trailing) {
          clearTimeout(timeoutId);
        }
      }, wait);
    }
  });
}
module.exports = curry(2, throttle);