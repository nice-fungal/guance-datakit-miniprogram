// === Generate a random 64-bit number in fixed-length hex format
function randomTraceId() {
  var digits = '0123456789abcdef';
  var n = '';

  for (var i = 0; i < 19; i += 1) {
    var rand = Math.floor(Math.random() * 10);
    n += digits[rand];
  }

  return n;
}
/**
 * 
 * @param {*} configuration  配置信息
 */


export function DDtraceTracer(configuration) {
  this._spanId = randomTraceId();
  this._traceId = randomTraceId();
}
DDtraceTracer.prototype = {
  isTracingSupported: function isTracingSupported() {
    return true;
  },
  getSpanId: function getSpanId() {
    return this._spanId;
  },
  getTraceId: function getTraceId() {
    return this._traceId;
  },
  makeTracingHeaders: function makeTracingHeaders() {
    return {
      'x-datadog-origin': 'rum',
      // 'x-datadog-parent-id': spanId.toDecimalString(),
      'x-datadog-sampled': '1',
      'x-datadog-sampling-priority': '1',
      'x-datadog-trace-id': this.getTraceId()
    };
  }
};