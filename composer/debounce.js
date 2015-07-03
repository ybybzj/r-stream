var r$ = require('../index');
var curry = require('fnkit/curry');
function debounce(wait, s){
  var immediate;
  if(typeof wait === 'object'){
    immediate = !!wait.immediate;
    wait = wait.wait;
  }
  if(typeof wait !== 'number'){
    throw new TypeError('[r$ debounce]Invalid options, option "wait" must be a number!');
  }
  var lastVal, timeoutId, isTimeout = true;
  return r$([s], function(self){
    lastVal = s();
    if(isTimeout && immediate){
      isTimeout = false;
      self(lastVal);
    }else{
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function(){
        self(lastVal);
        isTimeout = true;
      }, wait);
    }
    
  });
}

module.exports = curry(2, debounce);