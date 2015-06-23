var r$ = require('../index');
var curry = require('@zj/fnkit/curry');
var slice = require('@zj/fnkit/slice');
function lift(f /*streams...*/){
  var streams =  slice(arguments, 1);
  var vals = [];
  return r$(streams, function(self){
    for(var i = 0, l = streams.length; i < l; i++){
      vals[i] = streams[i]();
    }
    return f.apply(null, vals);
  });
}