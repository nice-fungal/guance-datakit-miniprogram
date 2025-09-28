import { extend2Lev, withSnakeCaseKeys, isEmptyObject } from '../helper/utils';
import { LifeCycleEventType } from '../core/lifeCycle';
import { RumEventType } from '../helper/enums';
import baseInfo from '../core/baseInfo';
import { SessionType } from '../core/sessionManagement';
import { createErrorFilter } from '../core/errorFilter';
export function startRumAssembly(applicationId, configuration, session, lifeCycle, parentContexts, getCommonContext) {
  var errorFilter = createErrorFilter(configuration, function (error) {
    lifeCycle.notify(LifeCycleEventType.RAW_ERROR_COLLECTED, {
      error: error
    });
  });
  lifeCycle.subscribe(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, function (data) {
    var startTime = data.startTime;
    var rawRumEvent = data.rawRumEvent;
    var viewContext = parentContexts.findView(startTime);
    var savedCommonContext = data.savedCommonContext;
    var customerContext = data.customerContext;
    var deviceContext = {
      device: baseInfo.deviceInfo
    };
    var appContext = {
      app: {
        launch: baseInfo.getLaunchOptions()
      }
    };

    if (session.isTracked() && (viewContext || rawRumEvent.type === RumEventType.APP)) {
      var actionContext = parentContexts.findAction(startTime);
      var commonContext = savedCommonContext || getCommonContext();
      var rumContext = {
        _dd: {
          sdkName: configuration.sdkName,
          sdkVersion: configuration.sdkVersion,
          env: configuration.env,
          version: configuration.version,
          service: configuration.service
        },
        tags: configuration.tags,
        application: {
          id: applicationId
        },
        device: {},
        date: new Date().getTime(),
        session: {
          id: session.getSessionId(),
          type: SessionType.USER
        },
        user: {
          id: configuration.user_id || baseInfo.getClientID(),
          is_signin: configuration.user_id ? 'T' : 'F'
        }
      };
      var rumEvent = extend2Lev(rumContext, deviceContext, appContext, viewContext, actionContext, rawRumEvent);
      var serverRumEvent = withSnakeCaseKeys(rumEvent);
      var context = extend2Lev({}, commonContext.context, customerContext);

      if (!isEmptyObject(context)) {
        serverRumEvent.tags = context;
      }

      if (!isEmptyObject(commonContext.user)) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        serverRumEvent.user = extend2Lev({
          id: baseInfo.getClientID(),
          is_signin: 'T'
        }, commonContext.user);
      }

      if (shouldSend(serverRumEvent, errorFilter)) {
        lifeCycle.notify(LifeCycleEventType.RUM_EVENT_COLLECTED, serverRumEvent);
      }
    }
  });
}

function shouldSend(event, errorFilter) {
  if (event.type === RumEventType.ERROR) {
    return !errorFilter.isLimitReached();
  }

  return true;
}