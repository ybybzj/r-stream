var r$ = require('../index');
var curry = require('@zj/fnkit/curry');
var merge = require('./merge');
function switchlatest(s){
  var inner;
  return r$([s], function(self){
    inner = s();
    r$.endsOn(merge(s, inner.end), r$([inner], function(){
      self(inner());
    }));
  });
}

module.exports = switchlatest;