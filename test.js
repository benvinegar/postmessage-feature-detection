var domain = 'http://' + window.location.hostname;

window.listen = function() {
  var lastHandler = null;
  return function(handler) {
    if (lastHandler) {
      window.removeEventListener('message', lastHandler, false);
    }
    window.addEventListener('message', handler, false);
    lastHandler = handler;
  }
}();

window.stop = function() {
  var _stop = stop;
  return function(callback) {
    _stop(100, callback);
  }
}();

test("typeof window.postMessage == 'function'", function() {
  equals('function', typeof window.postMessage);
});

test("targetOrigin: *", function() {
  frames[0].postMessage('test.targetOrigin.*', '*');
  stop();
  listen(function(e) {
    start();
    ok(true, "heard back");
  });
});

test("targetOrigin: " + domain, function() {
  frames[0].postMessage('test.targetOrigin.domain', domain);
  stop();
  listen(function(e) {
    start();
    ok(true, "heard back");
  });
});

test("targetOrigin: " + domain + ', bad port', function() {
  frames[0].postMessage('test.targetOrigin.badPort', domain + ':8888');

  stop(function() {
    start();
    ok(true, "no response (expected)");
  });

  listen(function(e) {
    start();
    ok(false, "response (shouldn't happen)");
  });
});

test("targetOrigin: unknown domain", function() {
  frames[0].postMessage('test.targetOrigin.unknown', 'http://ignore.me');

  stop(function() {
    start();
    ok(true, "no response (expected)");
  });

  listen(function(e) {
    start();
    ok(false, "response (shouldn't happen)");
  });
});