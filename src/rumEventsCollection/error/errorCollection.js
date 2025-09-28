import { startAutomaticErrorCollection } from '../../core/errorCollection';
import { RumEventType } from '../../helper/enums';
import { LifeCycleEventType } from '../../core/lifeCycle';
import { urlParse, replaceNumberCharByPath, getStatusGroup } from '../../helper/utils';
export function startErrorCollection(lifeCycle, configuration) {
  // return doStartErrorCollection(
  // 	lifeCycle,
  // 	configuration,
  // 	startAutomaticErrorCollection(configuration),
  // )
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
    addError: function addError(customError, savedCommonContext) {// var rawError = computeRawError(
      //   customError.error,
      //   customError.startTime,
      //   customError.source
      // )
      // lifeCycle.notify(LifeCycleEventType.RAW_ERROR_COLLECTED, {
      //   customerContext: customError.context,
      //   savedCommonContext: savedCommonContext,
      //   error: rawError
      // })
    }
  };
} // function computeRawError(error, handlingStack, startClocks) {
//   const stackTrace = error instanceof Error ? computeStackTrace(error) : undefined
//   return extend({
//     startClocks,
//     source: ErrorSource.CUSTOM,
//     originalError: error,
//     handling: ErrorHandling.HANDLED
//   }, formatUnknownError(stackTrace, error, 'Provided', handlingStack) )
// }

function processError(error) {
  var resource = error.resource;

  if (resource) {
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

  var rawRumEvent = {
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
  };
  return {
    rawRumEvent: rawRumEvent,
    startTime: error.startTime
  };
}