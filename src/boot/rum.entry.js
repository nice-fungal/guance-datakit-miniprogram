import { isPercentage, extend2Lev, createContextManager, defineGlobal, getGlobalObject, now, isString, isObject } from '../helper/utils';
import { startRum } from './rum';
import { ActionType } from '../helper/enums';
export var makeRum = function makeRum(startRumImpl) {
  var isAlreadyInitialized = false;
  var globalContextManager = createContextManager();
  var user = {};

  var _getInternalContext = function getInternalContext() {};

  var addActionStrategy = function addActionStrategy() {};

  var rumGlobal = {
    init: function init(userConfiguration) {
      if (typeof userConfiguration === 'undefined') {
        userConfiguration = {};
      }

      if (!canInitRum(userConfiguration)) {
        return;
      }

      var _startRumImpl = startRumImpl(userConfiguration, function () {
        return {
          user: user,
          context: globalContextManager.get()
        };
      });

      _getInternalContext = _startRumImpl.getInternalContext;
      addActionStrategy = _startRumImpl.addAction;
      isAlreadyInitialized = true;
    },
    getInternalContext: function getInternalContext(startTime) {
      return _getInternalContext(startTime);
    },
    addRumGlobalContext: globalContextManager.add,
    removeRumGlobalContext: globalContextManager.remove,
    getRumGlobalContext: globalContextManager.get,
    setRumGlobalContext: globalContextManager.set,
    addAction: function addAction(name, context) {
      if (isObject(context) && isString(name)) {
        addActionStrategy({
          name: name,
          context: extend2Lev({}, context),
          startClocks: now(),
          type: ActionType.custom
        });
      }
    },
    setUser: function setUser(newUser) {
      var sanitizedUser = sanitizeUser(newUser);

      if (sanitizedUser) {
        user = sanitizedUser;
      } else {
        console.error('Unsupported user:', newUser);
      }
    },
    removeUser: function removeUser() {
      user = {};
    }
  };
  return rumGlobal;

  function canInitRum(userConfiguration) {
    if (isAlreadyInitialized) {
      console.error('DATAFLUX_RUM is already initialized.');
      return false;
    }

    if (!userConfiguration.applicationId) {
      console.error('Application ID is not configured, no RUM data will be collected.');
      return false;
    }

    if (!userConfiguration.datakitOrigin) {
      console.error('datakitOrigin is not configured, no RUM data will be collected.');
      return false;
    }

    if (userConfiguration.sampleRate !== undefined && !isPercentage(userConfiguration.sampleRate)) {
      console.error('Sample Rate should be a number between 0 and 100');
      return false;
    }

    return true;
  }

  function sanitizeUser(newUser) {
    if (typeof newUser !== 'object' || !newUser) {
      return;
    }

    var result = extend2Lev({}, newUser);

    if ('id' in result) {
      result.id = String(result.id);
    }

    if ('name' in result) {
      result.name = String(result.name);
    }

    if ('email' in result) {
      result.email = String(result.email);
    }

    return result;
  }
};
export var datafluxRum = makeRum(startRum);
defineGlobal(getGlobalObject(), 'DATAFLUX_RUM_MIN', datafluxRum);