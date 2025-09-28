// === Generate a random 64-bit number in fixed-length hex format
function randomTraceId() {
  var digits = '0123456789abcdef';
  var n = '';
  for (var i = 0; i < 16; i += 1) {
    var rand = Math.floor(Math.random() * 16);
    n += digits[rand];
  }
  return n;
}

/**
 *
 * @param {*} configuration  配置信息
 */
export function W3cTraceParentTracer(configuration) {
  var rootSpanId = randomTraceId();
  this._traceId = randomTraceId() + rootSpanId;
  this._spanId = rootSpanId;
  if (configuration.generateTraceId && typeof configuration.generateTraceId === 'function') {
    var customTraceId = configuration.generateTraceId();
    if (typeof customTraceId === 'string') {
      this.customTraceId = customTraceId;
    }
  }
}
W3cTraceParentTracer.prototype = {
  isTracingSupported: function isTracingSupported() {
    return true;
  },
  getSpanId: function getSpanId() {
    return this._spanId;
  },
  getTraceId: function getTraceId() {
    if (this.customTraceId) return this.customTraceId;
    return this._traceId;
  },
  getTraceParent: function getTraceParent() {
    // '{version}-{traceId}-{spanId}-{sampleDecision}'
    return '00-' + this.getTraceId() + '-' + this.getSpanId() + '-01';
  },
  makeTracingHeaders: function makeTracingHeaders() {
    return {
      traceparent: this.getTraceParent()
    };
  }
};