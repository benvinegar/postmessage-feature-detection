var domain = 'http://' + window.location.hostname;
var handlers = [];

/**
 * Creates an onMessage handler
 */
function listen(handler) {
  window.addEventListener('message', handler, false);
  handlers.push(handler);
}

/**
 * Clears event handlers between test runs
 */
function setup() {
  for (var i = 0; i < handlers; i++) {
    window.removeEventListener('message', handlers[i], false);
  }
  handlers = [];
}

/**
 * Overrides QUnit's test method to automatically call setup()
 * before executing the test body
 */
window.test = function() {
  var _test = test;
  return function(name, callback) {
    setup();
    _test(name, callback);
  };
}();

/**
 * Utility method for capturing iframe responses and timeouts
 */
function begin(execute, onResponse, onTimeout) {
  execute();

  var timeoutLength = 100; // ms
  stop(timeoutLength, typeof onTimeout === 'function' ?
      function() { start(); onTimeout(); } :
      undefined
  );

  listen(function() {
    start();
    onResponse();
  });
}

test("window.postMessage", function() {
  if (!!window.postMessage) {
    ok(true, "exists");
  } else {
    ok(false, "doesn't exist");
  }
});

test("targetOrigin: *", function() {
  begin(
    function() {
      frames[0].postMessage('test.targetOrigin.*', '*');
    },
    function() {
      ok(true, "heard back");
    }
  );
});

test("targetOrigin: " + domain, function() {
  begin(
    function() {
      frames[0].postMessage('test.targetOrigin.domain', domain);
    },
    function() {
      ok(true, "heard back");
    }
  );
});

test("targetOrigin: " + domain + ', bad port', function() {
  begin(
    function() {
      frames[0].postMessage('test.targetOrigin.badPort', domain + ':8888');
    },
    function() {
      ok(false, "response (shouldn't happen)");
    },
    function() {
      ok(true, "no response (expected)");
    }
  );
});

test("targetOrigin: unknown domain", function() {
  begin(
    function() {
      frames[0].postMessage('test.targetOrigin.unknown', 'http://ignore.me');
    },
    function() {
      ok(false, "response (shouldn't happen)");
    },
    function() {
      ok(true, "no response (expected)");
    }
  );
});

test("targetOrigin: malformed uris", function() {
  var invalid = ["test", "http::", ":", "", "."];

  for (var i = 0; i < invalid.length; i++) {
    var uri = invalid[i];
    try {
      frames[0].postMessage("test.malformedUris", uri);
      ok(false, "no exception for " + uri);
    } catch(e) {
      if (e.code != e.SYNTAX_ERR) {
        ok(false, "wrong exception for " + uri);
      } else {
        ok(true, "exception for " + uri + " (expected)");
      }
    }
  }
});

test('missing param throws exception', function() {
  try {
    frames[0].postMessage("missing param")
    ok(false, "no exception thrown");
  } catch(e) {
    ok(true, "exception thrown");
  }
});