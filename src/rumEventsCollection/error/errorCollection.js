import { startAutomaticErrorCollection } from '../../core/errorCollection';
import { RumEventType } from '../../helper/enums';
import { LifeCycleEventType } from '../../core/lifeCycle';
import { ErrorSource, formatUnknownError } from '../../core/errorTools';
import { urlParse, replaceNumberCharByPath, getStatusGroup, extend2Lev, extend, now } from '../../helper/utils';
import { computeStackTrace } from '../../helper/tracekit';
export function startErrorCollection(lifeCycle, configuration) {
  startAutomaticErrorCollection(configuration).subscribe(function (error) {
    lifeCycle.notify(LifeCycleEventType.RAW_ERROR_COLLECTED, {
      error: error
    });
  });
  return doStartErrorCollection(lifeCycle);
}
export function doStartErrorCollection(lifeCycle) {
  lifeCycle.subscribe(LifeCycleEventType.RAW_ERROR_COLLECTED, function (error) {
    lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processError(error.error));
  });
  return {
    addError: function addError(customError, savedCommonContext) {
      var rawError = computeRawError(customError.error, customError.startTime, customError.context);
      lifeCycle.notify(LifeCycleEventType.RAW_ERROR_COLLECTED, {
        savedCommonContext: savedCommonContext,
        error: rawError
      });
    }
  };
}

function computeRawError(error, startTime, context) {
  var stackTrace = error instanceof Error ? computeStackTrace(error) : undefined;
  return extend({
    startTime,
    source: ErrorSource.CUSTOM,
    context
  }, formatUnknownError(stackTrace, error, 'Provided'));
}

function processError(error) {
  var resource = error.resource;
  var tracingInfo;

  if (resource) {
    tracingInfo = computeRequestTracingInfo(resource);
    var urlObj = urlParse(error.resource.url).getParse();
    resource = {
      method: error.resource.method,
      status: error.resource.statusCode,
      statusGroup: getStatusGroup(error.resource.statusCode),
      url: error.resource.url,
      urlHost: urlObj.Host,
      urlPath: urlObj.Path,
      urlPathGroup: replaceNumberCharByPath(urlObj.Path)
    };
  }

  var rawRumEvent = extend2Lev({
    date: error.startTime,
    error: {
      message: error.message,
      resource: resource,
      source: error.source,
      stack: error.stack,
      type: error.type,
      starttime: error.startTime
    },
    type: RumEventType.ERROR
  }, tracingInfo);
  return {
    customerContext: error.context,
    rawRumEvent: rawRumEvent,
    startTime: error.startTime
  };
}

function computeRequestTracingInfo(request) {
  var hasBeenTraced = request.traceId && request.spanId;

  if (!hasBeenTraced) {
    return undefined;
  }

  return {
    _dd: {
      spanId: request.spanId,
      traceId: request.traceId
    }
  };
}