// Canary script: run in a forked child process to verify index.js loads
// without crashing. Exit 0 = safe, non-zero = broken.
//
// This is the last safety net before solidify commits an evolution.
// If a patch broke index.js (syntax error, missing require, etc.),
// the canary catches it BEFORE the daemon restarts with broken code.

// Timeout kill-switch: if require() hangs (e.g. infinite loop at module level),
// force-exit after 10 seconds instead of blocking the solidify pipeline.
var CANARY_TIMEOUT_MS = 10000;
var timer = setTimeout(function () {
  process.stderr.write('canary timeout: index.js did not finish loading within ' + CANARY_TIMEOUT_MS + 'ms');
  process.exit(2);
}, CANARY_TIMEOUT_MS);
timer.unref();

try {
  require('../index.js');
  clearTimeout(timer);
  process.exit(0);
} catch (e) {
  clearTimeout(timer);
  var msg = e && e.stack ? String(e.stack) : String(e.message || e);
  process.stderr.write(msg.slice(0, 500));
  process.exit(1);
}
