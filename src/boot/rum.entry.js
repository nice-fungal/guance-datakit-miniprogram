import { isPercentage, extend2Lev, defineGlobal, getGlobalObject, now, deepClone } from '../helper/utils';
import { startRum } from './rum';
import { ActionType } from '../helper/enums';
import { buildCommonContext } from '../helper/commonContext';
import { BoundedBuffer } from '../core/boundedBuffer';
import { createContextManager } from '../core/contextManager';
import { CustomerDataType } from '../core/heavyCustomerDataWarning';
import { checkUser, sanitizeUser } from '../core/user';
import { sdk } from '../core/sdk';
export var makeRum = function makeRum(startRumImpl) {
  var isAlreadyInitialized = false;
  var globalContextManager = createContextManager(CustomerDataType.GlobalContext);
  var userContextManager = createContextManager(CustomerDataType.User);
  //   var user = {}
  var getInternalContextStrategy = function getInternalContextStrategy() {
    return undefined;
  };
  var bufferApiCalls = new BoundedBuffer();
  var _addActionStrategy = function addActionStrategy(action, commonContext) {
    if (typeof commonContext == 'undefined') {
      commonContext = buildCommonContext(globalContextManager, userContextManager);
    }
    bufferApiCalls.add(function () {
      return _addActionStrategy(action, commonContext);
    });
  };
  var _addErrorStrategy = function addErrorStrategy(providedError, commonContext) {
    if (typeof commonContext == 'undefined') {
      commonContext = buildCommonContext(globalContextManager, userContextManager);
    }
    bufferApiCalls.add(function () {
      return _addErrorStrategy(providedError, commonContext);
    });
  };
  var rumGlobal = {
    init: function init(userConfiguration) {
      if (typeof userConfiguration === 'undefined') {
        userConfiguration = {};
      }
      if (!canInitRum(userConfiguration)) {
        return;
      }
      var _startRumImpl = startRumImpl(userConfiguration, function () {
        return buildCommonContext(globalContextManager, userContextManager);
      });
      getInternalContextStrategy = _startRumImpl.getInternalContext;
      _addActionStrategy = _startRumImpl.addAction;
      _addErrorStrategy = _startRumImpl.addError;
      bufferApiCalls.drain();
      isAlreadyInitialized = true;
    },
    getInternalContext: function getInternalContext(startTime) {
      return getInternalContextStrategy(startTime);
    },
    addRumGlobalContext: globalContextManager.setContextProperty,
    removeRumGlobalContext: globalContextManager.removeContextProperty,
    getRumGlobalContext: globalContextManager.getContext,
    setRumGlobalContext: globalContextManager.setContext,
    clearRumGlobalContext: globalContextManager.clearContext,
    addAction: function addAction(name, context) {
      _addActionStrategy({
        name: name,
        context: deepClone(context),
        startClocks: now(),
        type: ActionType.custom
      });
    },
    addError: function addError(error, context) {
      _addErrorStrategy({
        error: error,
        context: extend2Lev({}, context),
        startTime: now()
      });
    },
    setUserProperty: function setUserProperty(key, property) {
      var newUser = {};
      newUser[key] = property;
      var sanitizedProperty = sanitizeUser(newUser)[key];
      userContextManager.setContextProperty(key, sanitizedProperty);
    },
    removeUserProperty: userContextManager.removeContextProperty,
    setUser: function setUser(newUser) {
      if (checkUser(newUser)) {
        userContextManager.setContext(sanitizeUser(newUser));
      }
    },
    getUser: userContextManager.getContext,
    removeUser: userContextManager.clearContext
  };
  return rumGlobal;
  function canInitRum(userConfiguration) {
    if (!sdk) {
      console.error('DATAFLUX_RUM unsupport platform, Fail to start.');
      return false;
    }
    if (isAlreadyInitialized) {
      console.error('DATAFLUX_RUM is already initialized.');
      return false;
    }
    if (!userConfiguration.applicationId) {
      console.error('Application ID is not configured, no RUM data will be collected.');
      return false;
    }
    // if (!userConfiguration.datakitOrigin) {
    //   console.error('datakitOrigin is not configured, no RUM data will be collected.')
    //   return false
    // }
    if (!userConfiguration.site && !userConfiguration.datakitOrigin && !userConfiguration.datakitUrl) {
      console.error('datakitOrigin or site is not configured, no RUM data will be collected.');
      return false;
    }
    if (userConfiguration.site && !userConfiguration.clientToken) {
      console.error('clientToken is not configured, no RUM data will be collected.');
      return false;
    }
    if (userConfiguration.sampleRate !== undefined && !isPercentage(userConfiguration.sampleRate)) {
      console.error('Sample Rate should be a number between 0 and 100');
      return false;
    }
    return true;
  }
};
export var datafluxRum = makeRum(startRum);
defineGlobal(getGlobalObject(), 'DATAFLUX_RUM_MIN', datafluxRum);