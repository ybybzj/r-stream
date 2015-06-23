var r$ = require('../index');
function fromPromise(promise){
  var s = r$();
  function onVal(val){
    s(val);
    s.end(true);
  }
  promise.then(onVal)["catch"](onVal);
  return s;
}