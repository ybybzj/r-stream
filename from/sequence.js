var r$ = require('../index');
var curry = require('@zj/fnkit/curry');

function sequence(interval, seq){
  var s = r$(), timeoutId;
  if(seq.length === 0){
    s.end(true);
  }
  setTimeout(function emit(){
    var val = seq.shift();
    s(val);
    if(seq.length === 0){
      s.end(true);
    }
    if(!s.end()){
      setTimeout(emit, interval);
    }
  }, interval);
  return s;
}
module.exports = curry(2, sequence);