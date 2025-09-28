import { base64Encode, urlParse, getActivePage } from '../../helper/utils';
// start SkyWalking
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    /* tslint:disable */
    var r = Math.random() * 16 | 0;
    /* tslint:disable */
    var v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

/**
 * 
 * @param {*} configuration  配置信息
 * @param {*} requestUrl 请求的url
 */
export function SkyWalkingTracer(configuration, requestUrl) {
  this._spanId = uuid();
  this._traceId = uuid();
  this._applicationId = configuration.applicationId;
  this._env = configuration.env;
  this._version = configuration.version;
  this._urlParse = urlParse(requestUrl).getParse();
}
SkyWalkingTracer.prototype = {
  isTracingSupported: function isTracingSupported() {
    if (this._env && this._version && this._urlParse) return true;
    return false;
  },
  getSpanId: function getSpanId() {
    return this._spanId;
  },
  getTraceId: function getTraceId() {
    return this._traceId;
  },
  getSkyWalkingSw8: function getSkyWalkingSw8() {
    try {
      var traceIdStr = String(base64Encode(this._traceId));
      var segmentId = String(base64Encode(this._spanId));
      var service = String(base64Encode(this._applicationId + '_rum_' + this.env));
      var instance = String(base64Encode(this._version));
      var activePage = getActivePage();
      var endpointPage = '';
      if (activePage && activePage.route) {
        endpointPage = activePage.route;
      }
      var endpoint = String(base64Encode(endpointPage));
      var peer = String(base64Encode(this._urlParse.Host));
      var index = '0';
      // var values = `${1}-${traceIdStr}-${segmentId}-${index}-${service}-${instance}-${endpoint}-${peer}`;
      return '1-' + traceIdStr + '-' + segmentId + '-' + index + '-' + service + '-' + instance + '-' + endpoint + '-' + peer;
    } catch (err) {
      return '';
    }
  },
  makeTracingHeaders: function makeTracingHeaders() {
    return {
      'sw8': this.getSkyWalkingSw8()
    };
  }
};