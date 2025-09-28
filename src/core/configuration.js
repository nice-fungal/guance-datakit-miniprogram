import { extend2Lev, urlParse, values, isFunction, isBoolean } from '../helper/utils';
import { ONE_KILO_BYTE, ONE_SECOND, TraceType } from '../helper/enums';
import { catchUserErrors } from '../helper/caatchUserErrors';
var TRIM_REGIX = /^\s+|\s+$/g;
export var DEFAULT_CONFIGURATION = {
  sampleRate: 100,
  flushTimeout: 30 * ONE_SECOND,
  maxErrorsByMinute: 3000,
  /**
   * Logs intake limit
   */
  maxBatchSize: 50,
  maxMessageSize: 256 * ONE_KILO_BYTE,
  /**
   * beacon payload max queue size implementation is 64kb
   * ensure that we leave room for logs, rum and potential other users
   */
  batchBytesLimit: 16 * ONE_KILO_BYTE,
  datakitUrl: '',
  /**
   * arbitrary value, byte precision not needed
   */
  requestErrorResponseLengthLimit: 32 * ONE_KILO_BYTE,
  trackInteractions: false,
  traceType: TraceType.DDTRACE,
  traceId128Bit: false,
  allowedTracingOrigins: [],
  // 新增
  isIntakeUrl: function isIntakeUrl(url) {
    return false;
  } // 自定义方法根据请求资源 url 判断是否需要采集对应资源数据，默认都采集。 返回：false 表示要采集，true 表示不需要采集
};
function trim(str) {
  return str.replace(TRIM_REGIX, '');
}
function getDatakitEndPoint(configuration) {
  var url = configuration.datakitOrigin || configuration.datakitUrl || configuration.site;
  var endpoint = url;
  if (url && url.lastIndexOf('/') === url.length - 1) {
    endpoint = trim(url) + 'v1/write/rum';
  } else {
    endpoint = trim(url) + '/v1/write/rum';
  }
  if (configuration.site && configuration.clientToken) {
    endpoint = endpoint + '?token=' + configuration.clientToken + '&to_headless=true';
  }
  return endpoint;
}
export function commonInit(userConfiguration, buildEnv) {
  var transportConfiguration = {
    applicationId: userConfiguration.applicationId,
    env: userConfiguration.env || '',
    version: userConfiguration.version || '',
    sdkVersion: buildEnv.sdkVersion,
    sdkName: buildEnv.sdkName,
    service: userConfiguration.service || 'miniapp',
    datakitUrl: getDatakitEndPoint(userConfiguration),
    tags: userConfiguration.tags || [],
    injectTraceHeader: userConfiguration.injectTraceHeader && catchUserErrors(userConfiguration.injectTraceHeader, 'injectTraceHeader threw an error:'),
    generateTraceId: userConfiguration.generateTraceId && catchUserErrors(userConfiguration.generateTraceId, 'generateTraceId threw an error:')
  };
  if ('trackInteractions' in userConfiguration) {
    transportConfiguration.trackInteractions = !!userConfiguration.trackInteractions;
  }
  if ('allowedTracingOrigins' in userConfiguration) {
    transportConfiguration.allowedTracingOrigins = userConfiguration.allowedTracingOrigins;
  }
  if ('traceId128Bit' in userConfiguration) {
    transportConfiguration.traceId128Bit = !!userConfiguration.traceId128Bit;
  }
  if ('traceType' in userConfiguration && hasTraceType(userConfiguration.traceType)) {
    transportConfiguration.traceType = userConfiguration.traceType;
  }
  if ('sampleRate' in userConfiguration) {
    transportConfiguration.sampleRate = userConfiguration.sampleRate;
  }
  if ('isIntakeUrl' in userConfiguration && isFunction(userConfiguration.isIntakeUrl) && isBoolean(userConfiguration.isIntakeUrl())) {
    transportConfiguration.isIntakeUrl = userConfiguration.isIntakeUrl;
  }
  return extend2Lev(DEFAULT_CONFIGURATION, transportConfiguration);
}
function hasTraceType(traceType) {
  if (traceType && values(TraceType).indexOf(traceType) > -1) return true;
  return false;
}
var haveSameOrigin = function haveSameOrigin(url1, url2) {
  var parseUrl1 = urlParse(url1).getParse();
  var parseUrl2 = urlParse(url2).getParse();
  return parseUrl1.Origin === parseUrl2.Origin;
};
export function isIntakeRequest(url, configuration) {
  // return haveSameOrigin(url, configuration.datakitUrl)
  return url.indexOf(configuration.datakitUrl) === 0 || configuration.isIntakeUrl(url);
}