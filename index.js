'use strict';

function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}
// stream mixins
var streamMixins = {
  on: bindFn(on),
  log: bindFn(log)
};
function bindFn(fn){
  return function bound(){
    var stream = this, args = [].slice.call(arguments);
    return fn.apply(null, args.concat(stream));
  }
}
// Globals
var toUpdate = [];
var inStream;

var order = [];
var orderNextIdx = -1;

var flushing = false;


function on(f, s) {
  stream([s], function() { f(s.val); });
}
function log(msg, s) {
  if(arguments.length === 1){
    s = msg;
    msg = null;
  }
  stream([s], function(){
    console.log((msg?msg+' - ' : '') + s.toString());
  });
  stream([s.end], function(){
    console.log((msg?msg+' - ' : '') + 'stream<End>');
  });
}
function _initialDepsNotMet(stream) {
  stream.depsMet = stream.deps.every(function(s) {
    return s.hasVal;
  });
  return !stream.depsMet;
}

function updateStream(s) {
  if ((s.depsMet !== true && _initialDepsNotMet(s)) ||
      (s.end !== undefined && s.end.val === true)) return;
  if (inStream !== undefined) {
    toUpdate.push(s);
    return;
  }
  inStream = s;
  var returnVal = s.fn(s, s.depsChanged);
  if (returnVal !== undefined) {
    s(returnVal);
  }
  inStream = undefined;
  
  if (s.depsChanged !== undefined) s.depsChanged = [];
  s.shouldUpdate = false;
  if (flushing === false) flushUpdate();
}



function _findDeps(s) {
  var i, listeners = s.listeners;
  if (s.queued === false) {
    s.queued = true;
    for (i = 0; i < listeners.length; ++i) {
      _findDeps(listeners[i]);
    }
    order[++orderNextIdx] = s;
  }
}

function updateDeps(s) {
  var i, o, list, listeners = s.listeners;
  for (i = 0; i < listeners.length; ++i) {
    list = listeners[i];
    if (list.end === s) {
      endStream(list);
    } else {
      if (list.depsChanged !== undefined) list.depsChanged.push(s);
      list.shouldUpdate = true;
      _findDeps(list);
    }
  }
  for (; orderNextIdx >= 0; --orderNextIdx) {
    o = order[orderNextIdx];
    if (o.shouldUpdate === true) updateStream(o);
    o.queued = false;
  }
}



function flushUpdate() {
  flushing = true;
  while (toUpdate.length > 0) updateDeps(toUpdate.shift());
  flushing = false;
}

function isStream(stream) {
  return isFunction(stream) && stream.type === 'r$';
}

function streamToString() {
  return 'stream(' + this.val + ')';
}

function updateStreamValue(s, n) {
  if (n !== undefined && n !== null && isFunction(n.then)) {
    n.then(s)['catch'](s);
    return;
  }
  s.val = n;
  s.hasVal = true;
  if (inStream === undefined) {
    flushing = true;
    updateDeps(s);
    if (toUpdate.length > 0) flushUpdate(); else flushing = false;
  } else if (inStream === s) {
    markListeners(s, s.listeners);
  } else {
    toUpdate.push(s);
  }
}

function markListeners(s, lists) {
  var i, list;
  for (i = 0; i < lists.length; ++i) {
    list = lists[i];
    if (list.end !== s) {
      if (list.depsChanged !== undefined) {
        list.depsChanged.push(s);
      }
      list.shouldUpdate = true;
    } else {
      endStream(list);
    }
  }
}

function createStream() {
  var mixinKeys = Object.keys(streamMixins);
  function s(n) {
    var i, list;
    if (arguments.length === 0) {
      return s.val;
    } else {
      updateStreamValue(s, n);
      return s;
    }
  }
  s.hasVal = false;
  s.val = undefined;
  s.listeners = [];
  s.queued = false;
  s.end = undefined;
  s.type = "r$";
  // s.map = boundMap;
  // s.ap = ap;
  // s.of = stream;
  if(mixinKeys.length){
    mixinKeys.forEach(function(name){
      s[name] = streamMixins[name];
    });
  }
  s.toString = streamToString;

  return s;
}

function addListeners(deps, s) {
  for (var i = 0; i < deps.length; ++i) {
    deps[i].listeners.push(s);
  }
}

function createDependentStream(deps, fn) {
  var i, s = createStream();
  s.fn = fn;
  s.deps = deps;
  s.depsMet = false;
  s.depsChanged = fn.length > 1 ? [] : undefined;
  s.shouldUpdate = false;
  addListeners(deps, s);
  return s;
}

function immediate(s) {
  if (s.depsMet === false) {
    s.depsMet = true;
    updateStream(s);
  }
  return s;
}

function removeListener(s, listeners) {
  var idx = listeners.indexOf(s);
  listeners[idx] = listeners[listeners.length - 1];
  listeners.length--;
}

function detachDeps(s) {
  for (var i = 0; i < s.deps.length; ++i) {
    removeListener(s, s.deps[i].listeners);
  }
  s.deps.length = 0;
}

function endStream(s) {
  if (s.deps !== undefined) detachDeps(s);
  if (s.end !== undefined) detachDeps(s.end);
}

function endsOn(endS, s) {
  detachDeps(s.end);
  endS.listeners.push(s.end);
  s.end.deps.push(endS);
  return s;
}

function trueFn() { return true; }

function stream(arg, fn) {
  var i, s, deps, depEndStreams;
  var endStream = createDependentStream([], trueFn);
  if (arguments.length > 1) {
    deps = []; depEndStreams = [];
    for (i = 0; i < arg.length; ++i) {
      if (arg[i] !== undefined) {
        deps.push(arg[i]);
        if (arg[i].end !== undefined) depEndStreams.push(arg[i].end);
      }
    }
    s = createDependentStream(deps, fn);
    s.end = endStream;
    endStream.listeners.push(s);
    addListeners(depEndStreams, endStream);
    endStream.deps = depEndStreams;
    updateStream(s);
  } else {
    s = createStream();
    s.end = endStream;
    endStream.listeners.push(s);
    if (arguments.length === 1) s(arg);
  }
  return s;
}

stream.isStream = isStream;
stream.endsOn = endsOn;
stream.on = on;
stream.immediate = immediate;
stream.mixin = function(name, fn){
  if(typeof name === 'object'){
    Object.keys(name).forEach(function(k){
      stream.mixin(k, name[k]);
    });
    return;
  }
  streamMixins[name] = bindFn(fn);
}

module.exports = stream;