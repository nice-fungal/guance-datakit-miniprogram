import { buildEnv } from './buildEnv';
import { LifeCycle } from '../core/lifeCycle';
import { commonInit } from '../core/configuration';
import { startErrorCollection } from '../rumEventsCollection/error/errorCollection';
import { startRumAssembly } from '../rumEventsCollection/assembly';
import { startParentContexts } from '../rumEventsCollection/parentContexts';
import { startRumBatch } from '../rumEventsCollection/transport/batch';
import { startViewCollection } from '../rumEventsCollection/page/viewCollection';
import { startRequestCollection } from '../rumEventsCollection/requestCollection';
import { startResourceCollection } from '../rumEventsCollection/resource/resourceCollection';
import { startAppCollection } from '../rumEventsCollection/app/appCollection';
import { startPagePerformanceObservable } from '../rumEventsCollection/performanceCollection';
import { startSetDataColloction } from '../rumEventsCollection/setDataCollection';
import { startActionCollection } from '../rumEventsCollection/action/actionCollection';
import { startInternalContext } from '../rumEventsCollection/internalContext';
import { sessionManagement } from '../core/sessionManagement';
export var startRum = function startRum(userConfiguration, getCommonContext) {
  var configuration = commonInit(userConfiguration, buildEnv);
  var lifeCycle = new LifeCycle();
  var parentContexts = startParentContexts(lifeCycle);
  var batch = startRumBatch(configuration, lifeCycle);
  var session = new sessionManagement(configuration);
  startRumAssembly(userConfiguration.applicationId, configuration, session, lifeCycle, parentContexts, getCommonContext);
  startAppCollection(lifeCycle, configuration);
  startResourceCollection(lifeCycle, configuration);
  startViewCollection(lifeCycle, configuration);

  var _startErrorCollection = startErrorCollection(lifeCycle, configuration);

  startRequestCollection(lifeCycle, configuration);
  startPagePerformanceObservable(lifeCycle, configuration);
  startSetDataColloction(lifeCycle);

  var _startActionCollection = startActionCollection(lifeCycle, configuration);

  var internalContext = startInternalContext(userConfiguration.applicationId, session, parentContexts);
  return {
    addAction: _startActionCollection.addAction,
    addError: _startErrorCollection.addError,
    getInternalContext: internalContext.get
  };
};