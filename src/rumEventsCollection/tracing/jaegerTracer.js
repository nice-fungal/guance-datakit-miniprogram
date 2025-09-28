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
export function JaegerTracer(configuration) {
  var rootSpanId = randomTraceId();
  // this._traceId = randomTraceId() + rootSpanId // 默认用128bit,兼容其他配置
  if (configuration.traceId128Bit) {
    // 128bit生成traceid
    this._traceId = randomTraceId() + rootSpanId;
  } else {
    this._traceId = rootSpanId;
  }
  this._spanId = rootSpanId;
  if (configuration.generateTraceId && typeof configuration.generateTraceId === 'function') {
    var customTraceId = configuration.generateTraceId();
    if (typeof customTraceId === 'string') {
      this.customTraceId = customTraceId;
    }
  }
}
JaegerTracer.prototype = {
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
  getUberTraceId: function getUberTraceId() {
    //{trace-id}:{span-id}:{parent-span-id}:{flags}
    return this.getTraceId() + ':' + this.getSpanId() + ':' + '0' + ':' + '1';
  },
  makeTracingHeaders: function makeTracingHeaders() {
    return {
      'uber-trace-id': this.getUberTraceId()
    };
  }
};