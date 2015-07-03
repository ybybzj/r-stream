var r$ = require('../index');
var curry = require('fnkit/curry');
var map = require('./map');
function flatmap(f, s){
  return r$([s], function(self){
    map(self, f(s()));
  });
}

module.exports = curry(2, flatmap);