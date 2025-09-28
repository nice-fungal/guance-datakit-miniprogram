import { computeBytesCount } from '../helper/byteUtils';
import { deepClone, throttle } from '../helper/utils';
import { jsonStringify } from '../helper/jsonStringify';
import { warnIfCustomerDataLimitReached } from './heavyCustomerDataWarning';
export var BYTES_COMPUTATION_THROTTLING_DELAY = 200;
export function createContextManager(customerDataType, computeBytesCountImpl) {
  if (typeof computeBytesCountImpl === 'undefined') {
    computeBytesCountImpl = computeBytesCount;
  }

  var context = {};
  var bytesCountCache;
  var alreadyWarned = false; // Throttle the bytes computation to minimize the impact on performance.
  // Especially useful if the user call context APIs synchronously multiple times in a row

  var computeBytesCountThrottled = throttle(function (context) {
    bytesCountCache = computeBytesCountImpl(jsonStringify(context));

    if (!alreadyWarned) {
      alreadyWarned = warnIfCustomerDataLimitReached(bytesCountCache, customerDataType);
    }
  }, BYTES_COMPUTATION_THROTTLING_DELAY).throttled;
  return {
    getBytesCount: function getBytesCount() {
      return bytesCountCache;
    },

    /** @deprecated use getContext instead */
    get: function get() {
      return context;
    },

    /** @deprecated use setContextProperty instead */
    add: function add(key, value) {
      context[key] = value;
      computeBytesCountThrottled(context);
    },

    /** @deprecated renamed to removeContextProperty */
    remove: function remove(key) {
      delete context[key];
      computeBytesCountThrottled(context);
    },

    /** @deprecated use setContext instead */
    set: function set(newContext) {
      context = newContext;
      computeBytesCountThrottled(context);
    },
    getContext: function getContext() {
      return deepClone(context);
    },
    setContext: function setContext(newContext) {
      context = deepClone(newContext);
      computeBytesCountThrottled(context);
    },
    setContextProperty: function setContextProperty(key, property) {
      context[key] = deepClone(property);
      computeBytesCountThrottled(context);
    },
    removeContextProperty: function removeContextProperty(key) {
      delete context[key];
      computeBytesCountThrottled(context);
    },
    clearContext: function clearContext() {
      context = {};
      bytesCountCache = 0;
    }
  };
}