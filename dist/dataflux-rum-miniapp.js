
;// ./src/helper/enums.js
var ONE_SECOND = 1000;
var ONE_MINUTE = 60 * ONE_SECOND;
var ONE_HOUR = 60 * ONE_MINUTE;
var ONE_KILO_BYTE = 1024;
var CLIENT_ID_TOKEN = 'datafluxRum:client:id';
var RumEventType = {
  ACTION: 'action',
  ERROR: 'error',
  LONG_TASK: 'long_task',
  VIEW: 'view',
  RESOURCE: 'resource',
  APP: 'app',
  ACTION: 'action',
  LOGGER: 'logger'
};
var RequestType = {
  XHR: 'network',
  DOWNLOAD: 'resource'
};
var ActionType = {
  tap: 'tap',
  longpress: 'longpress',
  longtap: 'longtap',
  custom: 'custom'
};
var MpHook = (/* unused pure expression or super */ null && ({
  data: 1,
  onLoad: 1,
  onShow: 1,
  onReady: 1,
  render: 1,
  onPullDownRefresh: 1,
  onReachBottom: 1,
  onPageScroll: 1,
  onResize: 1,
  onHide: 1,
  onUnload: 1,
  onRouteDone: 1
}));
var TraceType = {
  DDTRACE: 'ddtrace',
  ZIPKIN_MULTI_HEADER: 'zipkin',
  ZIPKIN_SINGLE_HEADER: 'zipkin_single_header',
  W3C_TRACEPARENT: 'w3c_traceparent',
  SKYWALKING_V3: 'skywalking_v3',
  JAEGER: 'jaeger'
};
var ErrorHandling = (/* unused pure expression or super */ null && ({
  HANDLED: 'handled',
  UNHANDLED: 'unhandled'
}));
;// ./src/helper/jsonStringify.js


/**
 * Custom implementation of JSON.stringify that ignores some toJSON methods. We need to do that
 * because some sites badly override toJSON on certain objects. Removing all toJSON methods from
 * nested values would be too costly, so we just detach them from the root value, and native classes
 * used to build JSON values (Array and Object).
 *
 * Note: this still assumes that JSON.stringify is correct.
 */
function jsonStringify(value, replacer, space) {
  if (typeof value !== 'object' || value === null) {
    return JSON.stringify(value);
  }

  // Note: The order matter here. We need to detach toJSON methods on parent classes before their
  // subclasses.
  var restoreObjectPrototypeToJson = detachToJsonMethod(Object.prototype);
  var restoreArrayPrototypeToJson = detachToJsonMethod(Array.prototype);
  var restoreValuePrototypeToJson = detachToJsonMethod(Object.getPrototypeOf(value));
  var restoreValueToJson = detachToJsonMethod(value);
  try {
    return JSON.stringify(value, replacer, space);
  } catch (error) {
    return '<error: unable to serialize object>';
  } finally {
    restoreObjectPrototypeToJson();
    restoreArrayPrototypeToJson();
    restoreValuePrototypeToJson();
    restoreValueToJson();
  }
}
function detachToJsonMethod(value) {
  var object = value;
  var objectToJson = object.toJSON;
  if (objectToJson) {
    delete object.toJSON;
    return () => {
      object.toJSON = objectToJson;
    };
  }
  return noop;
}
;// ./src/helper/utils.js
/* unused harmony import specifier */ var utils_MpHook;


var ArrayProto = Array.prototype;
var ObjProto = Object.prototype;
var ObjProto = Object.prototype;
var utils_hasOwnProperty = ObjProto.hasOwnProperty;
var slice = ArrayProto.slice;
var utils_toString = ObjProto.toString;
var nativeForEach = ArrayProto.forEach;
var nativeIsArray = Array.isArray;
var breaker = false;
var isArguments = function isArguments(obj) {
  return !!(obj && utils_hasOwnProperty.call(obj, "callee"));
};
var each = function each(obj, iterator, context) {
  if (obj === null) return false;
  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
        return false;
      }
    }
  } else {
    for (var key in obj) {
      if (utils_hasOwnProperty.call(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) {
          return false;
        }
      }
    }
  }
};
var values = function values(obj) {
  var results = [];
  if (obj === null) {
    return results;
  }
  each(obj, function (value) {
    results[results.length] = value;
  });
  return results;
};
var keys = function keys(obj) {
  var results = [];
  if (obj === null) {
    return results;
  }
  each(obj, function (value, key) {
    results[results.length] = key;
  });
  return results;
};
var indexOf = function indexOf(arr, target) {
  var indexOf = arr.indexOf;
  if (indexOf) {
    return indexOf.call(arr, target);
  } else {
    for (var i = 0; i < arr.length; i++) {
      if (target === arr[i]) {
        return i;
      }
    }
    return -1;
  }
};
function round(num, decimals) {
  return +num.toFixed(decimals);
}
function toServerDuration(duration) {
  if (!isNumber(duration)) {
    return duration;
  }
  return round(duration * 1e6, 0);
}
function msToNs(duration) {
  if (typeof duration !== "number") {
    return duration;
  }
  return round(duration * 1e6, 0);
}
var isUndefined = function isUndefined(obj) {
  return obj === void 0;
};
var isString = function isString(obj) {
  return utils_toString.call(obj) === "[object String]";
};
var isDate = function isDate(obj) {
  return utils_toString.call(obj) === "[object Date]";
};
var isBoolean = function isBoolean(obj) {
  return utils_toString.call(obj) === "[object Boolean]";
};
var isNumber = function isNumber(obj) {
  return utils_toString.call(obj) === "[object Number]" && /[\d\.]+/.test(String(obj));
};
var isFunction = function isFunction(f) {
  if (!f) {
    return false;
  }
  try {
    return /^\s*\bfunction\b/.test(f);
  } catch (err) {
    return false;
  }
};
var isArray = nativeIsArray || function (obj) {
  return utils_toString.call(obj) === "[object Array]";
};
var toArray = function toArray(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) {
    return iterable.toArray();
  }
  if (Array.isArray(iterable)) {
    return slice.call(iterable);
  }
  if (isArguments(iterable)) {
    return slice.call(iterable);
  }
  return values(iterable);
};
var areInOrder = function areInOrder() {
  var numbers = toArray(arguments);
  for (var i = 1; i < numbers.length; i += 1) {
    if (numbers[i - 1] > numbers[i]) {
      return false;
    }
  }
  return true;
};
/**
 * UUID v4
 * from https://gist.github.com/jed/982883
 */
function UUID(placeholder) {
  return placeholder ?
  // tslint:disable-next-line no-bitwise
  (parseInt(placeholder, 10) ^ Math.random() * 16 >> parseInt(placeholder, 10) / 4).toString(16) : "".concat(1e7, "-", 1e3, "-", 4e3, "-", 8e3, "-", 1e11).replace(/[018]/g, UUID);
}
var utf8Encode = function utf8Encode(string) {
  string = (string + "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  var utftext = "",
    start,
    end;
  var stringl = 0,
    n;
  start = end = 0;
  stringl = string.length;
  for (n = 0; n < stringl; n++) {
    var c1 = string.charCodeAt(n);
    var enc = null;
    if (c1 < 128) {
      end++;
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode(c1 >> 6 | 192, c1 & 63 | 128);
    } else {
      enc = String.fromCharCode(c1 >> 12 | 224, c1 >> 6 & 63 | 128, c1 & 63 | 128);
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.substring(start, end);
      }
      utftext += enc;
      start = end = n + 1;
    }
  }
  if (end > start) {
    utftext += string.substring(start, string.length);
  }
  return utftext;
};
var base64Encode = function base64Encode(data) {
  data = String(data);
  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var o1,
    o2,
    o3,
    h1,
    h2,
    h3,
    h4,
    bits,
    i = 0,
    ac = 0,
    enc = "",
    tmp_arr = [];
  if (!data) {
    return data;
  }
  data = utf8Encode(data);
  do {
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);
    bits = o1 << 16 | o2 << 8 | o3;
    h1 = bits >> 18 & 0x3f;
    h2 = bits >> 12 & 0x3f;
    h3 = bits >> 6 & 0x3f;
    h4 = bits & 0x3f;
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);
  enc = tmp_arr.join("");
  switch (data.length % 3) {
    case 1:
      enc = enc.slice(0, -2) + "==";
      break;
    case 2:
      enc = enc.slice(0, -1) + "=";
      break;
  }
  return enc;
};
function hasToJSON(value) {
  return typeof value === "object" && value !== null && value.hasOwnProperty("toJSON");
}
function elapsed(start, end) {
  return end - start;
}
function getMethods(obj) {
  var isExcludeMpHook = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var funcs = [];
  for (var key in obj) {
    if (typeof obj[key] === "function" && (!isExcludeMpHook || !utils_MpHook[key])) {
      funcs.push(key);
    }
  }
  return funcs;
}
// 替换url包含数字的路由
function replaceNumberCharByPath(path) {
  if (path) {
    return path.replace(/\/([^\/]*)\d([^\/]*)/g, "/?");
  } else {
    return "";
  }
}
function getStatusGroup(status) {
  if (!status) return status;
  return String(status).substr(0, 1) + String(status).substr(1).replace(/\d*/g, "x");
}
var getQueryParamsFromUrl = function getQueryParamsFromUrl(url) {
  var result = {};
  var arr = url.split("?");
  var queryString = arr[1] || "";
  if (queryString) {
    result = getURLSearchParams("?" + queryString);
  }
  return result;
};
var getURLSearchParams = function getURLSearchParams(queryString) {
  queryString = queryString || "";
  var decodeParam = function decodeParam(str) {
    return decodeURIComponent(str);
  };
  var args = {};
  var query = queryString.substring(1);
  var pairs = query.split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pos = pairs[i].indexOf("=");
    if (pos === -1) continue;
    var name = pairs[i].substring(0, pos);
    var value = pairs[i].substring(pos + 1);
    name = decodeParam(name);
    value = decodeParam(value);
    args[name] = value;
  }
  return args;
};
function isPercentage(value) {
  return isNumber(value) && value >= 0 && value <= 100;
}
var extend = function extend(obj) {
  slice.call(arguments, 1).forEach(function (source) {
    for (var prop in source) {
      if (source[prop] !== void 0) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};
var extend2Lev = function extend2Lev(obj) {
  slice.call(arguments, 1).forEach(function (source) {
    for (var prop in source) {
      if (source[prop] !== void 0) {
        if (isObject(source[prop]) && isObject(obj[prop])) {
          extend(obj[prop], source[prop]);
        } else {
          obj[prop] = source[prop];
        }
      }
    }
  });
  return obj;
};
var trim = function trim(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
};
var isObject = function isObject(obj) {
  if (obj === null) return false;
  return utils_toString.call(obj) === "[object Object]";
};
var isEmptyObject = function isEmptyObject(obj) {
  if (isObject(obj)) {
    for (var key in obj) {
      if (utils_hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};
// export var isJSONString = function isJSONString(str) {
//   try {
//     JSON.parse(str);
//   } catch (e) {
//     return false;
//   }
//   return true;
// };
// export var safeJSONParse = function safeJSONParse(str) {
//   var val = null;
//   try {
//     val = JSON.parse(str);
//   } catch (e) {
//     return false;
//   }
//   return val;
// };
var now = function now() {
  return new Date().getTime();
};
var throttle = function throttle(fn, wait, options) {
  var needLeadingExecution = options && options.leading !== undefined ? options.leading : true;
  var needTrailingExecution = options && options.trailing !== undefined ? options.trailing : true;
  var inWaitPeriod = false;
  var pendingExecutionWithParameters;
  var pendingTimeoutId;
  var context = this;
  return {
    throttled: function throttled() {
      if (inWaitPeriod) {
        pendingExecutionWithParameters = arguments;
        return;
      }
      if (needLeadingExecution) {
        fn.apply(context, arguments);
      } else {
        pendingExecutionWithParameters = arguments;
      }
      inWaitPeriod = true;
      pendingTimeoutId = setTimeout(function () {
        if (needTrailingExecution && pendingExecutionWithParameters) {
          fn.apply(context, pendingExecutionWithParameters);
        }
        inWaitPeriod = false;
        pendingExecutionWithParameters = undefined;
      }, wait);
    },
    cancel: function cancel() {
      clearTimeout(pendingTimeoutId);
      inWaitPeriod = false;
      pendingExecutionWithParameters = undefined;
    }
  };
};
function noop() {}
/**
 * Return true if the draw is successful
 * @param threshold between 0 and 100
 */
function performDraw(threshold) {
  return threshold !== 0 && Math.random() * 100 <= threshold;
}
function findByPath(source, path) {
  var pathArr = path.split(".");
  while (pathArr.length) {
    var key = pathArr.shift();
    if (source && key in source && utils_hasOwnProperty.call(source, key)) {
      source = source[key];
    } else {
      return undefined;
    }
  }
  return source;
}
function withSnakeCaseKeys(candidate) {
  var result = {};
  Object.keys(candidate).forEach(key => {
    result[toSnakeCase(key)] = deepSnakeCase(candidate[key]);
  });
  return result;
}
function deepSnakeCase(candidate) {
  if (Array.isArray(candidate)) {
    return candidate.map(value => deepSnakeCase(value));
  }
  if (typeof candidate === "object" && candidate !== null) {
    return withSnakeCaseKeys(candidate);
  }
  return candidate;
}
function toSnakeCase(word) {
  return word.replace(/[A-Z]/g, function (uppercaseLetter, index) {
    return (index !== 0 ? "_" : "") + uppercaseLetter.toLowerCase();
  }).replace(/-/g, "_");
}
function escapeRowData(str) {
  if (typeof str === "object" && str) {
    str = jsonStringify(str);
  } else if (!isString(str)) {
    return str;
  }
  var reg = /[\s=,"]/g;
  return String(str).replace(reg, function (word) {
    return "\\" + word;
  });
}
function escapeJsonValue(value) {
  if (isString(value)) {
    return value;
  } else {
    return jsonStringify(value);
  }
}
function escapeFieldValueStr(str) {
  return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}
function escapeRowField(value) {
  if (typeof value === "object" && value) {
    return escapeFieldValueStr(jsonStringify(value));
  } else if (isString(value)) {
    return escapeFieldValueStr(value);
  } else {
    return value;
  }
}
var urlParse = function urlParse(para) {
  var URLParser = function URLParser(a) {
    this._fields = {
      Username: 4,
      Password: 5,
      Port: 7,
      Protocol: 2,
      Host: 6,
      Path: 8,
      URL: 0,
      QueryString: 9,
      Fragment: 10
    };
    this._values = {};
    this._regex = null;
    this._regex = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/;
    if (typeof a != "undefined") {
      this._parse(a);
    }
  };
  URLParser.prototype.setUrl = function (a) {
    this._parse(a);
  };
  URLParser.prototype._initValues = function () {
    for (var a in this._fields) {
      this._values[a] = "";
    }
  };
  URLParser.prototype.addQueryString = function (queryObj) {
    if (typeof queryObj !== "object") {
      return false;
    }
    var query = this._values.QueryString || "";
    for (var i in queryObj) {
      if (new RegExp(i + "[^&]+").test(query)) {
        query = query.replace(new RegExp(i + "[^&]+"), i + "=" + queryObj[i]);
      } else {
        if (query.slice(-1) === "&") {
          query = query + i + "=" + queryObj[i];
        } else {
          if (query === "") {
            query = i + "=" + queryObj[i];
          } else {
            query = query + "&" + i + "=" + queryObj[i];
          }
        }
      }
    }
    this._values.QueryString = query;
  };
  URLParser.prototype.getParse = function () {
    return this._values;
  };
  URLParser.prototype.getUrl = function () {
    var url = "";
    url += this._values.Origin;
    // url += this._values.Port ? ':' + this._values.Port : ''
    url += this._values.Path;
    url += this._values.QueryString ? "?" + this._values.QueryString : "";
    return url;
  };
  URLParser.prototype._parse = function (a) {
    this._initValues();
    var b = this._regex.exec(a);
    if (!b) {
      throw "DPURLParser::_parse -> Invalid URL";
    }
    for (var c in this._fields) {
      if (typeof b[this._fields[c]] != "undefined") {
        this._values[c] = b[this._fields[c]];
      }
    }
    this._values["Path"] = this._values["Path"] || "/";
    this._values["Hostname"] = this._values["Host"].replace(/:\d+$/, "");
    this._values["Origin"] = this._values["Protocol"] + "://" + this._values["Hostname"] + (this._values.Port ? ":" + this._values.Port : "");
  };
  return new URLParser(para);
};
// export var getOwnObjectKeys = function getOwnObjectKeys(obj, isEnumerable) {
//   var keys = Object.keys(obj);
//   if (Object.getOwnPropertySymbols) {
//     var symbols = Object.getOwnPropertySymbols(obj);
//     if (isEnumerable) {
//       symbols = symbols.filter(function (t) {
//         return Object.getOwnPropertyDescriptor(obj, t).enumerable;
//       });
//     }
//     keys.push.apply(keys, symbols);
//   }
//   return keys;
// };
// export var defineObject = function defineObject(obj, key, value) {
//   if (key in obj) {
//     Object.defineProperty(obj, key, {
//       value,
//       enumerable: true,
//       configurable: true,
//       writable: true
//     });
//   } else {
//     obj[key] = value;
//   }
//   return obj;
// };
// export var deepMixObject = function deepMixObject(targetObj) {
//   for (var t = 1; t < arguments.length; t++) {
//     var target = arguments[t] != null ? arguments[t] : {};
//     if (t % 2) {
//       getOwnObjectKeys(Object(target), true).forEach(function (t) {
//         defineObject(targetObj, t, target[t]);
//       });
//     } else {
//       if (Object.getOwnPropertyDescriptors) {
//         Object.defineProperties(targetObj, Object.getOwnPropertyDescriptors(target));
//       } else {
//         getOwnObjectKeys(Object(target)).forEach(function (t) {
//           Object.defineProperty(targetObj, t, Object.getOwnPropertyDescriptor(target, t));
//         });
//       }
//     }
//   }
//   return targetObj;
// };
// export function getOrigin(url) {
//   return urlParse(url).getParse().Origin;
// }
function getActivePage() {
  var curPages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
  if (curPages.length) {
    return curPages[curPages.length - 1];
  }
  return {};
}
function findCommaSeparatedValue(rawString, name) {
  var matches = rawString.match("(?:^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return matches ? matches[1] : undefined;
}
function createCircularReferenceChecker() {
  if (typeof WeakSet !== "undefined") {
    var set = new WeakSet();
    return {
      hasAlreadyBeenSeen: function hasAlreadyBeenSeen(value) {
        var has = set.has(value);
        if (!has) {
          set.add(value);
        }
        return has;
      }
    };
  }
  var array = [];
  return {
    hasAlreadyBeenSeen: function hasAlreadyBeenSeen(value) {
      var has = array.indexOf(value) >= 0;
      if (!has) {
        array.push(value);
      }
      return has;
    }
  };
}
/**
 * Similar to `typeof`, but distinguish plain objects from `null` and arrays
 */
function getType(value) {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return typeof value;
}
/**
 * Iterate over source and affect its sub values into destination, recursively.
 * If the source and destination can't be merged, return source.
 */
function mergeInto(destination, source, circularReferenceChecker) {
  // ignore the source if it is undefined
  if (typeof circularReferenceChecker === "undefined") {
    circularReferenceChecker = createCircularReferenceChecker();
  }
  if (source === undefined) {
    return destination;
  }
  if (typeof source !== "object" || source === null) {
    // primitive values - just return source
    return source;
  } else if (source instanceof Date) {
    return new Date(source.getTime());
  } else if (source instanceof RegExp) {
    var flags = source.flags ||
    // old browsers compatibility
    [source.global ? "g" : "", source.ignoreCase ? "i" : "", source.multiline ? "m" : "", source.sticky ? "y" : "", source.unicode ? "u" : ""].join("");
    return new RegExp(source.source, flags);
  }
  if (circularReferenceChecker.hasAlreadyBeenSeen(source)) {
    // remove circular references
    return undefined;
  } else if (Array.isArray(source)) {
    var merged = Array.isArray(destination) ? destination : [];
    for (var i = 0; i < source.length; ++i) {
      merged[i] = mergeInto(merged[i], source[i], circularReferenceChecker);
    }
    return merged;
  }
  var merged = getType(destination) === "object" ? destination : {};
  for (var key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      merged[key] = mergeInto(merged[key], source[key], circularReferenceChecker);
    }
  }
  return merged;
}

/**
 * A simplistic implementation of a deep clone algorithm.
 * Caveats:
 * - It doesn't maintain prototype chains - don't use with instances of custom classes.
 * - It doesn't handle Map and Set
 */
function deepClone(value) {
  return mergeInto(undefined, value);
}
var utils_ONE_SECOND = 1000;
var utils_ONE_MINUTE = 60 * utils_ONE_SECOND;
var utils_ONE_HOUR = 60 * utils_ONE_MINUTE;
function defineGlobal(global, name, api) {
  global[name] = api;
}
function getGlobalObject() {
  if (typeof globalThis === "object") {
    return globalThis;
  }
  Object.defineProperty(Object.prototype, "_dd_temp_", {
    get: function get() {
      return this;
    },
    configurable: true
  });
  // @ts-ignore
  var globalObject = _dd_temp_;
  // @ts-ignore
  delete Object.prototype._dd_temp_;
  if (typeof globalObject !== "object") {
    // on safari _dd_temp_ is available on window but not globally
    // fallback on other browser globals check
    if (typeof self === "object") {
      globalObject = self;
    } else if (typeof window === "object") {
      globalObject = window;
    } else {
      globalObject = {};
    }
  }
  return globalObject;
}
// export function assign(target) {
//   each(slice.call(arguments, 1), function (source) {
//     for (var prop in source) {
//       if (Object.prototype.hasOwnProperty.call(source, prop)) {
//         target[prop] = source[prop];
//       }
//     }
//   });
//   return target;
// }
// export function shallowClone(object) {
//   return assign({}, object);
// }
;// ./src/boot/buildEnv.js
var buildEnv = {
  sdkVersion: '2.2.10',
  sdkName: 'df_miniapp_rum_sdk'
};
;// ./src/core/lifeCycle.js
class LifeCycle {
  constructor() {
    this.callbacks = {};
  }
  notify(eventType, data) {
    var eventCallbacks = this.callbacks[eventType];
    if (eventCallbacks) {
      eventCallbacks.forEach(callback => callback(data));
    }
  }
  subscribe(eventType, callback) {
    if (!this.callbacks[eventType]) {
      this.callbacks[eventType] = [];
    }
    this.callbacks[eventType].push(callback);
    return {
      unsubscribe: () => {
        this.callbacks[eventType] = this.callbacks[eventType].filter(other => callback !== other);
      }
    };
  }
}
var LifeCycleEventType = {
  PERFORMANCE_ENTRY_COLLECTED: 'PERFORMANCE_ENTRY_COLLECTED',
  AUTO_ACTION_CREATED: 'AUTO_ACTION_CREATED',
  AUTO_ACTION_COMPLETED: 'AUTO_ACTION_COMPLETED',
  AUTO_ACTION_DISCARDED: 'AUTO_ACTION_DISCARDED',
  APP_HIDE: 'APP_HIDE',
  APP_UPDATE: 'APP_UPDATE',
  PAGE_SET_DATA_UPDATE: 'PAGE_SET_DATA_UPDATE',
  PAGE_ALIAS_ACTION: 'PAGE_ALIAS_ACTION',
  VIEW_CREATED: 'VIEW_CREATED',
  VIEW_UPDATED: 'VIEW_UPDATED',
  VIEW_ENDED: 'VIEW_ENDED',
  REQUEST_STARTED: 'REQUEST_STARTED',
  REQUEST_COMPLETED: 'REQUEST_COMPLETED',
  RAW_RUM_EVENT_COLLECTED: 'RAW_RUM_EVENT_COLLECTED',
  RAW_ERROR_COLLECTED: 'RAW_ERROR_COLLECTED',
  RUM_EVENT_COLLECTED: 'RUM_EVENT_COLLECTED'
};
;// ./src/helper/caatchUserErrors.js
function catchUserErrors(fn, errorMsg) {
  return function () {
    var args = [].slice.call(arguments);
    try {
      return fn.apply(this, args);
    } catch (err) {
      console.error(errorMsg, err);
    }
  };
}
;// ./src/core/configuration.js



var TRIM_REGIX = /^\s+|\s+$/g;
var DEFAULT_CONFIGURATION = {
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
function configuration_trim(str) {
  return str.replace(TRIM_REGIX, '');
}
function getDatakitEndPoint(configuration) {
  var url = configuration.datakitOrigin || configuration.datakitUrl || configuration.site;
  var endpoint = url;
  if (url && url.lastIndexOf('/') === url.length - 1) {
    endpoint = configuration_trim(url) + 'v1/write/rum';
  } else {
    endpoint = configuration_trim(url) + '/v1/write/rum';
  }
  if (configuration.site && configuration.clientToken) {
    endpoint = endpoint + '?token=' + configuration.clientToken + '&to_headless=true';
  }
  return endpoint;
}
function commonInit(userConfiguration, buildEnv) {
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
// var haveSameOrigin = function haveSameOrigin(url1, url2) {
//   var parseUrl1 = urlParse(url1).getParse();
//   var parseUrl2 = urlParse(url2).getParse();
//   return parseUrl1.Origin === parseUrl2.Origin;
// };
function isIntakeRequest(url, configuration) {
  // return haveSameOrigin(url, configuration.datakitUrl)
  return url.indexOf(configuration.datakitUrl) === 0 || configuration.isIntakeUrl(url);
}
;// ./src/core/errorTools.js

var ErrorSource = {
  AGENT: 'agent',
  CONSOLE: 'console',
  NETWORK: 'network',
  SOURCE: 'source',
  LOGGER: 'logger',
  CUSTOM: 'custom'
};
function formatUnknownError(stackTrace, errorObject, nonErrorPrefix) {
  if (!stackTrace || stackTrace.message === undefined && !(errorObject instanceof Error)) {
    return {
      message: nonErrorPrefix + '' + JSON.stringify(errorObject),
      stack: 'No stack, consider using an instance of Error',
      type: stackTrace && stackTrace.name
    };
  }
  return {
    message: stackTrace.message || 'Empty message',
    stack: toStackTraceString(stackTrace),
    type: stackTrace.name
  };
}
function toStackTraceString(stack) {
  var result = stack.name || 'Error' + ': ' + stack.message;
  if (isArray(stack.stack)) {
    stack.stack.forEach(function (frame) {
      var func = frame.func === '?' ? '<anonymous>' : frame.func;
      var args = frame.args && frame.args.length > 0 ? '(' + frame.args.join(', ') + ')' : '';
      var line = frame.line ? ':' + frame.line : '';
      var column = frame.line && frame.column ? ':' + frame.column : '';
      result += '\n  at ' + func + args + ' @ ' + frame.url + line + column;
    });
  }
  return result;
}
;// ./src/core/sdk.js
// import { deepMixObject } from '../helper/utils';
function getSDK() {
  var sdk = null,
    tracker = '';
  try {
    if (typeof wx === 'object' && typeof wx.request === 'function') {
      sdk = wx;
      tracker = 'wx';
      //   wx = sdk
    } else if (typeof my === 'object' && typeof my.request === 'function') {
      // tslint:disable-next-line: no-unsafe-any
      sdk = my;
      tracker = 'my';
      //   my = sdk
    } else if (typeof tt === 'object' && typeof tt.request === 'function') {
      // tslint:disable-next-line: no-unsafe-any
      sdk = tt;
      tracker = 'tt';
      //   tt = sdk
    } else if (typeof dd === 'object' && typeof dd.httpRequest === 'function') {
      // tslint:disable-next-line: no-unsafe-any
      sdk = dd;
      tracker = 'dd';
      //   dd = sdk
    } else if (typeof qq === 'object' && typeof qq.request === 'function') {
      // tslint:disable-next-line: no-unsafe-any
      sdk = qq;
      tracker = 'qq';
      //   qq = sdk
    } else if (typeof swan === 'object' && typeof swan.request === 'function') {
      // tslint:disable-next-line: no-unsafe-any
      sdk = swan;
      tracker = 'swan';
      //   swan = sdk
    } else {
      throw new Error('guance miniapp 暂不支持此平台');
    }
  } catch (err) {
    console.warn('unsupport platform, Fail to start');
  }
  return {
    sdk,
    tracker
  };
}
var instance = getSDK();
var sdk = instance.sdk;
var tracker = instance.tracker;
var getStorageSync = key => {
  if (tracker === 'my') {
    var res = sdk.getStorageSync({
      key
    });
    return res && res.data;
  } else {
    return sdk.getStorageSync(key);
  }
};
var setStorageSync = (key, data) => {
  if (tracker === 'my') {
    sdk.setStorageSync({
      key,
      data
    });
  } else {
    sdk.setStorageSync(key, data);
  }
};
;// ./src/helper/tracekit.js

var UNKNOWN_FUNCTION = '?';
function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}
function tracekit_isUndefined(what) {
  return typeof what === 'undefined';
}
// export function wrap(func) {
//   var _this = this;
//   function wrapped() {
//     try {
//       return func.apply(_this, arguments);
//     } catch (e) {
//       report(e);
//       throw e;
//     }
//   }
//   return wrapped;
// }
/**
 * Cross-browser processing of unhandled exceptions
 *
 * Syntax:
 * ```js
 *   report.subscribe(function(stackInfo) { ... })
 *   report.unsubscribe(function(stackInfo) { ... })
 *   report(exception)
 *   try { ...code... } catch(ex) { report(ex); }
 * ```
 *
 * Supports:
 *   - Firefox: full stack trace with line numbers, plus column number
 *     on top frame; column number is not guaranteed
 *   - Opera: full stack trace with line and column numbers
 *   - Chrome: full stack trace with line and column numbers
 *   - Safari: line and column number for the top frame only; some frames
 *     may be missing, and column number is not guaranteed
 *   - IE: line and column number for the top frame only; some frames
 *     may be missing, and column number is not guaranteed
 *
 * In theory, TraceKit should work on all of the following versions:
 *   - IE5.5+ (only 8.0 tested)
 *   - Firefox 0.9+ (only 3.5+ tested)
 *   - Opera 7+ (only 10.50 tested; versions 9 and earlier may require
 *     Exceptions Have Stacktrace to be enabled in opera:config)
 *   - Safari 3+ (only 4+ tested)
 *   - Chrome 1+ (only 5+ tested)
 *   - Konqueror 3.5+ (untested)
 *
 * Requires computeStackTrace.
 *
 * Tries to catch all unhandled exceptions and report them to the
 * subscribed handlers. Please note that report will rethrow the
 * exception. This is REQUIRED in order to get a useful stack trace in IE.
 * If the exception does not reach the top of the browser, you will only
 * get a stack trace from the point where report was called.
 *
 * Handlers receive a StackTrace object as described in the
 * computeStackTrace docs.
 *
 * @memberof TraceKit
 * @namespace
 */
var report = function reportModuleWrapper() {
  var handlers = [];

  /**
   * Add a crash handler.
   * @param {Function} handler
   * @memberof report
   */
  function subscribe(handler) {
    installGlobalHandler();
    installGlobalUnhandledRejectionHandler();
    installGlobalOnPageNotFoundHandler();
    installGlobalOnMemoryWarningHandler();
    installGlobalOnLazyLoadErrorHandler();
    handlers.push(handler);
  }

  /**
   * Remove a crash handler.
   * @param {Function} handler
   * @memberof report
   */
  function unsubscribe(handler) {
    for (var i = handlers.length - 1; i >= 0; i -= 1) {
      if (handlers[i] === handler) {
        handlers.splice(i, 1);
      }
    }
  }

  /**
   * Dispatch stack information to all handlers.
   * @param {StackTrace} stack
   * @param {boolean} isWindowError Is this a top-level window error?
   * @param {Error=} error The error that's being handled (if available, null otherwise)
   * @memberof report
   * @throws An exception if an error occurs while calling an handler.
   */
  function notifyHandlers(stack, isWindowError, error) {
    var exception;
    for (var i in handlers) {
      if (has(handlers, i)) {
        try {
          handlers[i](stack, isWindowError, error);
        } catch (inner) {
          exception = inner;
        }
      }
    }
    if (exception) {
      throw exception;
    }
  }
  var onErrorHandlerInstalled;
  var onUnhandledRejectionHandlerInstalled;
  var onPageNotFoundHandlerInstalled;
  var onMemoryWarningHandlerInstalled;
  var onLazyLoadErrorHandlerInstalled;
  /**
   * Ensures all global unhandled exceptions are recorded.
   * Supported by Gecko and IE.
   * @param {Event|string} message Error message.
   * @param {string=} url URL of script that generated the exception.
   * @param {(number|string)=} lineNo The line number at which the error occurred.
   * @param {(number|string)=} columnNo The column number at which the error occurred.
   * @param {Error=} errorObj The actual Error object.
   * @memberof report
   */
  function traceKitWindowOnError(err) {
    var error = typeof err === 'string' ? new Error(err) : err;
    var stack;
    var name = '';
    var msg = '';
    stack = computeStackTrace(error);
    if (error && error.message && {}.toString.call(error.message) === '[object String]') {
      var messages = error.message.split('\n');
      if (messages.length >= 3) {
        msg = messages[2];
        var groups = msg.match(ERROR_TYPES_RE);
        if (groups) {
          name = groups[1];
          msg = groups[2];
        }
      }
    }
    if (msg) {
      stack.message = msg;
    }
    if (name) {
      stack.name = name;
    }
    notifyHandlers(stack, true, error);
  }

  /**
   * Ensures all unhandled rejections are recorded.
   * @param {PromiseRejectionEvent} e event.
   * @memberof report
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onunhandledrejection
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
   */
  function traceKitWindowOnUnhandledRejection(_ref) {
    var {
      reason,
      promise
    } = _ref;
    var error = typeof reason === 'string' ? new Error(reason) : reason;
    var stack;
    var name = '';
    var msg = '';
    stack = computeStackTrace(error);
    if (error && error.message && {}.toString.call(error.message) === '[object String]') {
      var messages = error.message.split('\n');
      if (messages.length >= 3) {
        msg = messages[2];
        var groups = msg.match(ERROR_TYPES_RE);
        if (groups) {
          name = groups[1];
          msg = groups[2];
        }
      }
    }
    if (msg) {
      stack.message = msg;
    }
    if (name) {
      stack.name = name;
    }
    notifyHandlers(stack, true, error);
  }

  /**
   * Install a global onerror handler
   * @memberof report
   */
  function installGlobalHandler() {
    if (onErrorHandlerInstalled || !sdk.onError) {
      return;
    }
    sdk.onError(traceKitWindowOnError);
    onErrorHandlerInstalled = true;
  }

  /**
   * Install a global onunhandledrejection handler
   * @memberof report
   */
  function installGlobalUnhandledRejectionHandler() {
    if (onUnhandledRejectionHandlerInstalled || !sdk.onUnhandledRejection) {
      return;
    }
    sdk.onUnhandledRejection && sdk.onUnhandledRejection(traceKitWindowOnUnhandledRejection);
    onUnhandledRejectionHandlerInstalled = true;
  }
  function installGlobalOnPageNotFoundHandler() {
    if (onPageNotFoundHandlerInstalled || !sdk.onPageNotFound) {
      return;
    }
    sdk.onPageNotFound(res => {
      var url = res.path.split('?')[0];
      notifyHandlers({
        message: JSON.stringify(res),
        type: 'pagenotfound',
        name: url + '页面无法找到'
      }, true, {});
    });
    onPageNotFoundHandlerInstalled = true;
  }
  function installGlobalOnMemoryWarningHandler() {
    if (onMemoryWarningHandlerInstalled || !sdk.onMemoryWarning) {
      return;
    }
    sdk.onMemoryWarning(_ref2 => {
      var {
        level = -1
      } = _ref2;
      var levelMessage = '没有获取到告警级别信息';
      switch (level) {
        case 5:
          levelMessage = 'TRIM_MEMORY_RUNNING_MODERATE';
          break;
        case 10:
          levelMessage = 'TRIM_MEMORY_RUNNING_LOW';
          break;
        case 15:
          levelMessage = 'TRIM_MEMORY_RUNNING_CRITICAL';
          break;
        default:
          return;
      }
      notifyHandlers({
        message: levelMessage,
        type: 'memorywarning',
        name: '内存不足告警'
      }, true, {});
    });
    onMemoryWarningHandlerInstalled = true;
  }
  function installGlobalOnLazyLoadErrorHandler() {
    if (onLazyLoadErrorHandlerInstalled || !sdk.onLazyLoadError) {
      return;
    }
    sdk.onLazyLoadError(res => {
      var subpackage = res.subpackage || [];
      notifyHandlers({
        message: res.errMsg || '',
        type: 'lazyloaderror',
        name: subpackage.join(',') + 'load error'
      }, true, {});
    });
    onLazyLoadErrorHandlerInstalled = true;
  }
  /**
   * Reports an unhandled Error.
   * @param {Error} ex
   * @memberof report
   * @throws An exception if an incompvare stack trace is detected (old IE browsers).
   */
  function doReport(ex) {}
  doReport.subscribe = subscribe;
  doReport.unsubscribe = unsubscribe;
  doReport.traceKitWindowOnError = traceKitWindowOnError;
  return doReport;
}();

/**
 * computeStackTrace: cross-browser stack traces in JavaScript
 *
 * Syntax:
 *   ```js
 *   s = computeStackTrace.ofCaller([depth])
 *   s = computeStackTrace(exception) // consider using report instead (see below)
 *   ```
 *
 * Supports:
 *   - Firefox:  full stack trace with line numbers and unreliable column
 *               number on top frame
 *   - Opera 10: full stack trace with line and column numbers
 *   - Opera 9-: full stack trace with line numbers
 *   - Chrome:   full stack trace with line and column numbers
 *   - Safari:   line and column number for the topmost stacktrace element
 *               only
 *   - IE:       no line numbers whatsoever
 *
 * Tries to guess names of anonymous functions by looking for assignments
 * in the source code. In IE and Safari, we have to guess source file names
 * by searching for function bodies inside all page scripts. This will not
 * work for scripts that are loaded cross-domain.
 * Here be dragons: some function names may be guessed incorrectly, and
 * duplicate functions may be mismatched.
 *
 * computeStackTrace should only be used for tracing purposes.
 * Logging of unhandled exceptions should be done with report,
 * which builds on top of computeStackTrace and provides better
 * IE support by utilizing the sdk.onError event to retrieve information
 * about the top of the stack.
 *
 * Note: In IE and Safari, no stack trace is recorded on the Error object,
 * so computeStackTrace instead walks its *own* chain of callers.
 * This means that:
 *  * in Safari, some methods may be missing from the stack trace;
 *  * in IE, the topmost function in the stack trace will always be the
 *    caller of computeStackTrace.
 *
 * This is okay for tracing (because you are likely to be calling
 * computeStackTrace from the function you want to be the topmost element
 * of the stack trace anyway), but not okay for logging unhandled
 * exceptions (because your catch block will likely be far away from the
 * inner function that actually caused the exception).
 *
 * Tracing example:
 *  ```js
 *     function trace(message) {
 *         var stackInfo = computeStackTrace.ofCaller();
 *         var data = message + "\n";
 *         for(var i in stackInfo.stack) {
 *             var item = stackInfo.stack[i];
 *             data += (item.func || '[anonymous]') + "() in " + item.url + ":" + (item.line || '0') + "\n";
 *         }
 *         if (window.console)
 *             console.info(data);
 *         else
 *             alert(data);
 *     }
 * ```
 * @memberof TraceKit
 * @namespace
 */
var computeStackTrace = function computeStackTraceWrapper() {
  var debug = false;

  // Contents of Exception in various browsers.
  //
  // SAFARI:
  // ex.message = Can't find variable: qq
  // ex.line = 59
  // ex.sourceId = 580238192
  // ex.sourceURL = http://...
  // ex.expressionBeginOffset = 96
  // ex.expressionCaretOffset = 98
  // ex.expressionEndOffset = 98
  // ex.name = ReferenceError
  //
  // FIREFOX:
  // ex.message = qq is not defined
  // ex.fileName = http://...
  // ex.lineNumber = 59
  // ex.columnNumber = 69
  // ex.stack = ...stack trace... (see the example below)
  // ex.name = ReferenceError
  //
  // CHROME:
  // ex.message = qq is not defined
  // ex.name = ReferenceError
  // ex.type = not_defined
  // ex.arguments = ['aa']
  // ex.stack = ...stack trace...
  //
  // INTERNET EXPLORER:
  // ex.message = ...
  // ex.name = ReferenceError
  //
  // OPERA:
  // ex.message = ...message... (see the example below)
  // ex.name = ReferenceError
  // ex.opera#sourceloc = 11  (pretty much useless, duplicates the info in ex.message)
  // ex.stacktrace = n/a; see 'opera:config#UserPrefs|Exceptions Have Stacktrace'

  /**
   * Computes stack trace information from the stack property.
   * Chrome and Gecko use this property.
   * @param {Error} ex
   * @return {?StackTrace} Stack trace information.
   * @memberof computeStackTrace
   */
  function computeStackTraceFromStackProp(ex) {
    if (!ex.stack) {
      return;
    }

    // tslint:disable-next-line max-line-length
    var chrome = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
    // tslint:disable-next-line max-line-length
    var gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
    // tslint:disable-next-line max-line-length
    var winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;

    // Used to additionally parse URL/line/column from eval frames
    var isEval;
    var geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
    var chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
    var lines = ex.stack.split('\n');
    var stack = [];
    var submatch;
    var parts;
    var element;
    for (var i = 0, j = lines.length; i < j; i += 1) {
      if (chrome.exec(lines[i])) {
        parts = chrome.exec(lines[i]);
        var isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
        isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
        submatch = chromeEval.exec(parts[2]);
        if (isEval && submatch) {
          // throw out eval line/column and use top-most line/column number
          parts[2] = submatch[1]; // url
          parts[3] = submatch[2]; // line
          parts[4] = submatch[3]; // column
        }
        element = {
          args: isNative ? [parts[2]] : [],
          column: parts[4] ? +parts[4] : undefined,
          func: parts[1] || UNKNOWN_FUNCTION,
          line: parts[3] ? +parts[3] : undefined,
          url: !isNative ? parts[2] : undefined
        };
      } else if (winjs.exec(lines[i])) {
        parts = winjs.exec(lines[i]);
        element = {
          args: [],
          column: parts[4] ? +parts[4] : undefined,
          func: parts[1] || UNKNOWN_FUNCTION,
          line: +parts[3],
          url: parts[2]
        };
      } else if (gecko.exec(lines[i])) {
        parts = gecko.exec(lines[i]);
        isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
        submatch = geckoEval.exec(parts[3]);
        if (isEval && submatch) {
          // throw out eval line/column and use top-most line number
          parts[3] = submatch[1];
          parts[4] = submatch[2];
          parts[5] = undefined; // no column when eval
        } else if (i === 0 && !parts[5] && !tracekit_isUndefined(ex.columnNumber)) {
          // FireFox uses this awesome columnNumber property for its top frame
          // Also note, Firefox's column number is 0-based and everything else expects 1-based,
          // so adding 1
          // NOTE: this hack doesn't work if top-most frame is eval
          stack[0].column = ex.columnNumber + 1;
        }
        element = {
          args: parts[2] ? parts[2].split(',') : [],
          column: parts[5] ? +parts[5] : undefined,
          func: parts[1] || UNKNOWN_FUNCTION,
          line: parts[4] ? +parts[4] : undefined,
          url: parts[3]
        };
      } else {
        continue;
      }
      if (!element.func && element.line) {
        element.func = UNKNOWN_FUNCTION;
      }
      stack.push(element);
    }
    if (!stack.length) {
      return;
    }
    return {
      stack,
      message: extractMessage(ex),
      name: ex.name
    };
  }

  /**
   * Computes stack trace information from the stacktrace property.
   * Opera 10+ uses this property.
   * @param {Error} ex
   * @return {?StackTrace} Stack trace information.
   * @memberof computeStackTrace
   */
  function computeStackTraceFromStacktraceProp(ex) {
    // Access and store the stacktrace property before doing ANYTHING
    // else to it because Opera is not very good at providing it
    // reliably in other circumstances.
    var stacktrace = ex.stacktrace;
    if (!stacktrace) {
      return;
    }
    var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;
    // tslint:disable-next-line max-line-length
    var opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\))? in (.*):\s*$/i;
    var lines = stacktrace.split('\n');
    var stack = [];
    var parts;
    for (var line = 0; line < lines.length; line += 2) {
      var element;
      if (opera10Regex.exec(lines[line])) {
        parts = opera10Regex.exec(lines[line]);
        element = {
          args: [],
          column: undefined,
          func: parts[3],
          line: +parts[1],
          url: parts[2]
        };
      } else if (opera11Regex.exec(lines[line])) {
        parts = opera11Regex.exec(lines[line]);
        element = {
          args: parts[5] ? parts[5].split(',') : [],
          column: +parts[2],
          func: parts[3] || parts[4],
          line: +parts[1],
          url: parts[6]
        };
      }
      if (element) {
        if (!element.func && element.line) {
          element.func = UNKNOWN_FUNCTION;
        }
        element.context = [lines[line + 1]];
        stack.push(element);
      }
    }
    if (!stack.length) {
      return;
    }
    return {
      stack,
      message: extractMessage(ex),
      name: ex.name
    };
  }

  /**
   * NOT TESTED.
   * Computes stack trace information from an error message that includes
   * the stack trace.
   * Opera 9 and earlier use this method if the option to show stack
   * traces is turned on in opera:config.
   * @param {Error} ex
   * @return {?StackTrace} Stack information.
   * @memberof computeStackTrace
   */
  function computeStackTraceFromOperaMultiLineMessage(ex) {
    // TODO: Clean this function up
    // Opera includes a stack trace into the exception message. An example is:
    //
    // Statement on line 3: Undefined variable: undefinedFunc
    // Backtrace:
    //   Line 3 of linked script file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.js:
    //   In function zzz
    //         undefinedFunc(a);
    //   Line 7 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html:
    //   In function yyy
    //           zzz(x, y, z);
    //   Line 3 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html:
    //   In function xxx
    //           yyy(a, a, a);
    //   Line 1 of function script
    //     try { xxx('hi'); return false; } catch(ex) { report(ex); }
    //   ...

    var lines = ex.message.split('\n');
    if (lines.length < 4) {
      return;
    }
    var lineRE1 = /^\s*Line (\d+) of linked script ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i;
    var lineRE2 = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i;
    var lineRE3 = /^\s*Line (\d+) of function script\s*$/i;
    var stack = [];
    var scripts = window && window.document && window.document.getElementsByTagName('script');
    var inlineScriptBlocks = [];
    var parts;
    for (var s in scripts) {
      if (has(scripts, s) && !scripts[s].src) {
        inlineScriptBlocks.push(scripts[s]);
      }
    }
    for (var line = 2; line < lines.length; line += 2) {
      var item;
      if (lineRE1.exec(lines[line])) {
        parts = lineRE1.exec(lines[line]);
        item = {
          args: [],
          column: undefined,
          func: parts[3],
          line: +parts[1],
          url: parts[2]
        };
      } else if (lineRE2.exec(lines[line])) {
        parts = lineRE2.exec(lines[line]);
        item = {
          args: [],
          column: undefined,
          // TODO: Check to see if inline#1 (+parts[2]) points to the script number or column number.
          func: parts[4],
          line: +parts[1],
          url: parts[3]
        };
      } else if (lineRE3.exec(lines[line])) {
        parts = lineRE3.exec(lines[line]);
        var url = window.location.href.replace(/#.*$/, '');
        item = {
          url,
          args: [],
          column: undefined,
          func: '',
          line: +parts[1]
        };
      }
      if (item) {
        if (!item.func) {
          item.func = UNKNOWN_FUNCTION;
        }
        item.context = [lines[line + 1]];
        stack.push(item);
      }
    }
    if (!stack.length) {
      return; // could not parse multiline exception message as Opera stack trace
    }
    return {
      stack,
      message: lines[0],
      name: ex.name
    };
  }

  /**
   * Adds information about the first frame to incompvare stack traces.
   * Safari and IE require this to get compvare data on the first frame.
   * @param {StackTrace} stackInfo Stack trace information from
   * one of the compute* methods.
   * @param {string=} url The URL of the script that caused an error.
   * @param {(number|string)=} lineNo The line number of the script that
   * caused an error.
   * @param {string=} message The error generated by the browser, which
   * hopefully contains the name of the object that caused the error.
   * @return {boolean} Whether or not the stack information was
   * augmented.
   * @memberof computeStackTrace
   */
  function augmentStackTraceWithInitialElement(stackInfo, url, lineNo, message) {
    var initial = {
      url,
      line: lineNo ? +lineNo : undefined
    };
    if (initial.url && initial.line) {
      stackInfo.incompvare = false;
      var stack = stackInfo.stack;
      if (stack.length > 0) {
        if (stack[0].url === initial.url) {
          if (stack[0].line === initial.line) {
            return false; // already in stack trace
          }
          if (!stack[0].line && stack[0].func === initial.func) {
            stack[0].line = initial.line;
            stack[0].context = initial.context;
            return false;
          }
        }
      }
      stack.unshift(initial);
      stackInfo.partial = true;
      return true;
    }
    stackInfo.incompvare = true;
    return false;
  }

  /**
   * Computes stack trace information by walking the arguments.caller
   * chain at the time the exception occurred. This will cause earlier
   * frames to be missed but is the only way to get any stack trace in
   * Safari and IE. The top frame is restored by
   * {@link augmentStackTraceWithInitialElement}.
   * @param {Error} ex
   * @param {number} depth
   * @return {StackTrace} Stack trace information.
   * @memberof computeStackTrace
   */
  function computeStackTraceByWalkingCallerChain(ex, depth) {
    var functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i;
    var stack = [];
    var funcs = {};
    var recursion = false;
    var parts;
    var item;
    for (var curr = computeStackTraceByWalkingCallerChain.caller; curr && !recursion; curr = curr.caller) {
      if (curr === computeStackTrace || curr === report) {
        continue;
      }
      item = {
        args: [],
        column: undefined,
        func: UNKNOWN_FUNCTION,
        line: undefined,
        url: undefined
      };
      parts = functionName.exec(curr.toString());
      if (curr.name) {
        item.func = curr.name;
      } else if (parts) {
        item.func = parts[1];
      }
      if (typeof item.func === 'undefined') {
        item.func = parts ? parts.input.substring(0, parts.input.indexOf('{')) : undefined;
      }
      if (funcs[curr + '']) {
        recursion = true;
      } else {
        funcs[curr + ''] = true;
      }
      stack.push(item);
    }
    if (depth) {
      stack.splice(0, depth);
    }
    var result = {
      stack,
      message: ex.message,
      name: ex.name
    };
    augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description);
    return result;
  }

  /**
   * Computes a stack trace for an exception.
   * @param {Error} ex
   * @param {(string|number)=} depth
   * @memberof computeStackTrace
   */
  function doComputeStackTrace(ex, depth) {
    var stack;
    var normalizedDepth = depth === undefined ? 0 : +depth;
    try {
      // This must be tried first because Opera 10 *destroys*
      // its stacktrace property if you try to access the stack
      // property first!!
      stack = computeStackTraceFromStacktraceProp(ex);
      if (stack) {
        return stack;
      }
    } catch (e) {
      if (debug) {
        throw e;
      }
    }
    try {
      stack = computeStackTraceFromStackProp(ex);
      if (stack) {
        return stack;
      }
    } catch (e) {
      if (debug) {
        throw e;
      }
    }
    try {
      stack = computeStackTraceFromOperaMultiLineMessage(ex);
      if (stack) {
        return stack;
      }
    } catch (e) {
      if (debug) {
        throw e;
      }
    }
    try {
      stack = computeStackTraceByWalkingCallerChain(ex, normalizedDepth + 1);
      if (stack) {
        return stack;
      }
    } catch (e) {
      if (debug) {
        throw e;
      }
    }
    return {
      message: extractMessage(ex),
      name: ex.name,
      stack: []
    };
  }

  /**
   * Logs a stacktrace starting from the previous call and working down.
   * @param {(number|string)=} depth How many frames deep to trace.
   * @return {StackTrace} Stack trace information.
   * @memberof computeStackTrace
   */
  function computeStackTraceOfCaller(depth) {
    var currentDepth = (depth === undefined ? 0 : +depth) + 1; // "+ 1" because "ofCaller" should drop one frame
    try {
      throw new Error();
    } catch (ex) {
      return computeStackTrace(ex, currentDepth + 1);
    }
  }
  doComputeStackTrace.augmentStackTraceWithInitialElement = augmentStackTraceWithInitialElement;
  doComputeStackTrace.computeStackTraceFromStackProp = computeStackTraceFromStackProp;
  doComputeStackTrace.ofCaller = computeStackTraceOfCaller;
  return doComputeStackTrace;
}();
var ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;
function extractMessage(ex) {
  var message = ex && ex.message;
  // console.log('message',message)
  if (!message) {
    return 'No error message';
  }
  if (message.error && typeof message.error.message === 'string') {
    return message.error.message;
  }
  return message;
}
;// ./src/core/observable.js
class Observable {
  constructor() {
    this.observers = [];
  }
  subscribe(f) {
    this.observers.push(f);
  }
  notify(data) {
    this.observers.forEach(function (observer) {
      observer(data);
    });
  }
}
;// ./src/core/xhrProxy.js



var xhrProxySingleton;
var beforeSendCallbacks = [];
var onRequestCompleteCallbacks = [];
var originalXhrRequest;
var originalXhrHttpRequest;
function startXhrProxy() {
  if (!xhrProxySingleton) {
    proxyXhr();
    proxyHttpXhr();
    xhrProxySingleton = {
      beforeSend: function beforeSend(callback) {
        beforeSendCallbacks.push(callback);
      },
      onRequestComplete: function onRequestComplete(callback) {
        onRequestCompleteCallbacks.push(callback);
      }
    };
  }
  return xhrProxySingleton;
}
function resetXhrProxy() {
  if (xhrProxySingleton) {
    xhrProxySingleton = undefined;
    beforeSendCallbacks.splice(0, beforeSendCallbacks.length);
    onRequestCompleteCallbacks.splice(0, onRequestCompleteCallbacks.length);
    if (typeof sdk.request === "function") {
      // 使用 requestProxy 覆盖微信原生 request、uploadFile、downloadFile 接口
      Object.defineProperties(sdk, {
        // request
        request: {
          value: originalXhrRequest
        }
      });
    } else if (typeof sdk.httpRequest === "function") {
      // sdk.httpRequest = request
      // 使用 requestProxy 覆盖微信原生 request、uploadFile、downloadFile 接口
      Object.defineProperties(sdk, {
        // request
        httpRequest: {
          value: originalXhrHttpRequest
        }
      });
    }
  }
}
function proxyHttpXhr() {
  if (typeof sdk.httpRequest === "function") {
    originalXhrHttpRequest = sdk.httpRequest;
    var request = function request() {
      var _this = this;
      var dataflux_xhr = {
        method: arguments[0].method || "GET",
        startTime: 0,
        url: arguments[0].url,
        type: RequestType.XHR,
        responseType: arguments[0].responseType || "text",
        option: arguments[0]
      };
      dataflux_xhr.startTime = now();
      var originalSuccess = arguments[0].success;
      arguments[0].success = function () {
        reportXhr(arguments[0]);
        if (originalSuccess) {
          originalSuccess.apply(_this, arguments);
        }
      };
      var originalFail = arguments[0].fail;
      arguments[0].fail = function () {
        reportXhr(arguments[0]);
        if (originalFail) {
          originalFail.apply(_this, arguments);
        }
      };
      var hasBeenReported = false;
      var reportXhr = function reportXhr(res) {
        if (hasBeenReported) {
          return;
        }
        hasBeenReported = true;
        dataflux_xhr.duration = now() - dataflux_xhr.startTime;
        dataflux_xhr.response = JSON.stringify(res.data);
        dataflux_xhr.header = res.header || {};
        dataflux_xhr.headers = res.headers || {};
        dataflux_xhr.profile = res.profile;
        dataflux_xhr.status = res.statusCode || res.status || 0;
        onRequestCompleteCallbacks.forEach(function (callback) {
          callback(dataflux_xhr);
        });
      };
      beforeSendCallbacks.forEach(function (callback) {
        callback(dataflux_xhr);
      });
      return originalXhrHttpRequest.call(this, dataflux_xhr.option);
    };
    // sdk.httpRequest = request
    // 使用 requestProxy 覆盖微信原生 request、uploadFile、downloadFile 接口
    Object.defineProperties(sdk, {
      // request
      httpRequest: {
        value: request
      }
    });
  }
}
function proxyXhr() {
  if (typeof sdk.request === "function") {
    // 使用 requestProxy 覆盖微信原生 request、uploadFile、downloadFile 接口
    originalXhrRequest = sdk.request;
    var request = function request() {
      var _this = this;
      var dataflux_xhr = {
        method: arguments[0].method || "GET",
        startTime: 0,
        url: arguments[0].url,
        type: RequestType.XHR,
        responseType: arguments[0].responseType || "text",
        option: arguments[0]
      };
      dataflux_xhr.startTime = now();
      var originalSuccess = arguments[0].success;
      arguments[0].success = function () {
        reportXhr(arguments[0]);
        if (originalSuccess) {
          originalSuccess.apply(_this, arguments);
        }
      };
      var originalFail = arguments[0].fail;
      arguments[0].fail = function () {
        reportXhr(arguments[0]);
        if (originalFail) {
          originalFail.apply(_this, arguments);
        }
      };
      var hasBeenReported = false;
      var reportXhr = function reportXhr(res) {
        if (hasBeenReported) {
          return;
        }
        hasBeenReported = true;
        dataflux_xhr.duration = now() - dataflux_xhr.startTime;
        dataflux_xhr.response = JSON.stringify(res.data);
        dataflux_xhr.header = res.header || {};
        dataflux_xhr.headers = res.headers || {};
        dataflux_xhr.profile = res.profile;
        dataflux_xhr.status = res.statusCode || res.status || 0;
        onRequestCompleteCallbacks.forEach(function (callback) {
          callback(dataflux_xhr);
        });
      };
      beforeSendCallbacks.forEach(function (callback) {
        callback(dataflux_xhr);
      });
      return originalXhrRequest.call(this, dataflux_xhr.option);
    };
    Object.defineProperties(sdk, {
      // request
      request: {
        value: request
      }
    });
  }
}
;// ./src/core/downloadProxy.js



var downloadProxySingleton;
var downloadProxy_beforeSendCallbacks = [];
var downloadProxy_onRequestCompleteCallbacks = [];
var originalDownloadRequest;
function startDownloadProxy() {
  if (!downloadProxySingleton) {
    proxyDownload();
    downloadProxySingleton = {
      beforeSend: function beforeSend(callback) {
        downloadProxy_beforeSendCallbacks.push(callback);
      },
      onRequestComplete: function onRequestComplete(callback) {
        downloadProxy_onRequestCompleteCallbacks.push(callback);
      }
    };
  }
  return downloadProxySingleton;
}
function resetDownloadProxy() {
  if (downloadProxySingleton) {
    downloadProxySingleton = undefined;
    downloadProxy_beforeSendCallbacks.splice(0, downloadProxy_beforeSendCallbacks.length);
    downloadProxy_onRequestCompleteCallbacks.splice(0, downloadProxy_onRequestCompleteCallbacks.length);
    Object.defineProperties(sdk, {
      // request
      downloadFile: {
        value: originalDownloadRequest
      }
    });
  }
}
function proxyDownload() {
  originalDownloadRequest = sdk.downloadFile;
  var downloadFile = function downloadFile() {
    var _this = this;
    var dataflux_xhr = {
      method: "GET",
      startTime: 0,
      url: arguments[0].url,
      type: RequestType.DOWNLOAD,
      responseType: "file"
    };
    dataflux_xhr.startTime = now();
    var originalSuccess = arguments[0].success;
    arguments[0].success = function () {
      reportXhr(arguments[0]);
      if (originalSuccess) {
        originalSuccess.apply(_this, arguments);
      }
    };
    var originalFail = arguments[0].fail;
    arguments[0].fail = function () {
      reportXhr(arguments[0]);
      if (originalFail) {
        originalFail.apply(_this, arguments);
      }
    };
    var hasBeenReported = false;
    var reportXhr = function reportXhr(res) {
      if (hasBeenReported) {
        return;
      }
      hasBeenReported = true;
      dataflux_xhr.duration = now() - dataflux_xhr.startTime;
      dataflux_xhr.response = JSON.stringify({
        filePath: res.filePath,
        tempFilePath: res.tempFilePath
      });
      dataflux_xhr.header = res.header || {};
      dataflux_xhr.headers = res.headers || {};
      dataflux_xhr.profile = res.profile;
      dataflux_xhr.status = res.statusCode || res.status || 0;
      downloadProxy_onRequestCompleteCallbacks.forEach(function (callback) {
        callback(dataflux_xhr);
      });
    };
    downloadProxy_beforeSendCallbacks.forEach(function (callback) {
      callback(dataflux_xhr);
    });
    return originalDownloadRequest.apply(this, arguments);
  };
  if (typeof sdk.downloadFile === "function") {
    Object.defineProperties(sdk, {
      // request
      downloadFile: {
        value: downloadFile
      }
    });
  }
}
;// ./src/core/errorCollection.js
/* unused harmony import specifier */ var errorCollection_now;
/* unused harmony import specifier */ var errorCollection_ONE_MINUTE;
/* unused harmony import specifier */ var errorCollection_ErrorSource;
/* unused harmony import specifier */ var errorCollection_report;
/* unused harmony import specifier */ var errorCollection_Observable;








var originalConsoleError;
function startConsoleTracking(errorObservable) {
  originalConsoleError = console.error;
  console.error = function () {
    originalConsoleError.apply(console, arguments);
    var args = toArray(arguments);
    var message = [];
    args.concat(['console error:']).forEach(function (para) {
      message.push(formatConsoleParameters(para));
    });
    errorObservable.notify({
      message: message.join(' '),
      source: ErrorSource.CONSOLE,
      startTime: now()
    });
  };
}
function stopConsoleTracking() {
  console.error = originalConsoleError;
}
function formatConsoleParameters(param) {
  if (typeof param === 'string') {
    return param;
  }
  if (param instanceof Error) {
    return toStackTraceString(computeStackTrace(param));
  }
  return JSON.stringify(param, undefined, 2);
}
function filterErrors(configuration, errorObservable) {
  var errorCount = 0;
  var filteredErrorObservable = new errorCollection_Observable();
  errorObservable.subscribe(function (error) {
    if (errorCount < configuration.maxErrorsByMinute) {
      errorCount += 1;
      filteredErrorObservable.notify(error);
    } else if (errorCount === configuration.maxErrorsByMinute) {
      errorCount += 1;
      filteredErrorObservable.notify({
        message: 'Reached max number of errors by minute: ' + configuration.maxErrorsByMinute,
        source: errorCollection_ErrorSource.AGENT,
        startTime: errorCollection_now()
      });
    }
  });
  setInterval(function () {
    errorCount = 0;
  }, errorCollection_ONE_MINUTE);
  return filteredErrorObservable;
}
var traceKitReportHandler;
function startRuntimeErrorTracking(errorObservable) {
  traceKitReportHandler = function traceKitReportHandler(stackTrace, _, errorObject) {
    var error = formatUnknownError(stackTrace, errorObject, 'Uncaught');
    errorObservable.notify({
      message: error.message,
      stack: error.stack,
      type: error.type,
      source: ErrorSource.SOURCE,
      startTime: now()
    });
  };
  report.subscribe(traceKitReportHandler);
}
function stopRuntimeErrorTracking() {
  errorCollection_report.unsubscribe(traceKitReportHandler);
}
var errorObservable;
function startAutomaticErrorCollection(configuration) {
  if (!errorObservable) {
    errorObservable = new Observable();
    trackNetworkError(configuration, errorObservable);
    startConsoleTracking(errorObservable);
    startRuntimeErrorTracking(errorObservable);
    // filteredErrorsObservable = filterErrors(configuration, errorObservable)
  }
  return errorObservable;
}
function trackNetworkError(configuration, errorObservable) {
  startXhrProxy().onRequestComplete(function (context) {
    return handleCompleteRequest(context.type, context);
  });
  startDownloadProxy().onRequestComplete(function (context) {
    return handleCompleteRequest(context.type, context);
  });
  function handleCompleteRequest(type, request) {
    if (!isIntakeRequest(request.url, configuration) && (isRejected(request) || isServerError(request))) {
      errorObservable.notify({
        message: format(type) + 'error' + request.method + ' ' + request.url,
        resource: {
          method: request.method,
          statusCode: request.status,
          url: request.url,
          traceId: request.traceId,
          spanId: request.spanId
        },
        type: ErrorSource.NETWORK,
        source: ErrorSource.NETWORK,
        stack: truncateResponse(request.response, configuration) || 'Failed to load',
        startTime: request.startTime
      });
    }
  }
  return {
    stop: function stop() {
      resetXhrProxy();
      resetDownloadProxy();
    }
  };
}
function isRejected(request) {
  return request.status === 0 && request.responseType !== 'opaque';
}
function isServerError(request) {
  return request.status >= 500;
}
function truncateResponse(response, configuration) {
  if (response && response.length > configuration.requestErrorResponseLengthLimit) {
    return response.substring(0, configuration.requestErrorResponseLengthLimit) + '...';
  }
  return response;
}
function format(type) {
  if (RequestType.XHR === type) {
    return 'XHR';
  }
  return RequestType.DOWNLOAD;
}
;// ./src/rumEventsCollection/error/errorCollection.js






function startErrorCollection(lifeCycle, configuration) {
  startAutomaticErrorCollection(configuration).subscribe(function (error) {
    lifeCycle.notify(LifeCycleEventType.RAW_ERROR_COLLECTED, {
      error: error
    });
  });
  return doStartErrorCollection(lifeCycle);
}
function doStartErrorCollection(lifeCycle) {
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
;// ./src/core/baseInfo.js



class BaseInfo {
  constructor() {
    this.getDeviceInfo();
    this.getNetWork();
  }
  getDeviceInfo() {
    try {
      var deviceInfo = {};
      if (sdk.getDeviceInfo && !(sdk.getDeviceInfo() instanceof Promise)) {
        deviceInfo = sdk.getDeviceInfo();
      } else {
        var {
          brand,
          system,
          model,
          platform,
          cpuType,
          memorySize
        } = sdk.getSystemInfoSync();
        deviceInfo = {
          brand,
          system,
          model,
          platform,
          cpuType,
          memorySize
        };
      }
      var appBaseInfo = {};
      if (sdk.getAppBaseInfo) {
        appBaseInfo = sdk.getAppBaseInfo();
      } else {
        var {
          SDKVersion,
          language,
          version,
          host
        } = sdk.getSystemInfoSync();
        appBaseInfo = {
          SDKVersion,
          language,
          version,
          host
        };
      }
      var windowInfo = {};
      if (sdk.getWindowInfo) {
        windowInfo = sdk.getWindowInfo();
      } else {
        var {
          pixelRatio,
          screenWidth,
          screenHeight,
          windowWidth,
          windowHeight,
          statusBarHeight,
          screenTop
        } = sdk.getSystemInfoSync();
        windowInfo = {
          pixelRatio,
          screenHeight,
          screenWidth,
          windowWidth,
          windowHeight,
          statusBarHeight,
          screenTop
        };
      }
      var osData = deviceInfo.system && deviceInfo.system.split(" ") || [];
      var osVersion = osData.length > 1 && osData[1];
      var osVersionMajor = osVersion && osVersion.split(".").length && osVersion.split(".")[0];
      var osInfo = {
        os: osData.length > 0 && osData[0],
        osVersion,
        osVersionMajor
      };
      var deviceUUid = "";
      if (appBaseInfo.host) {
        deviceUUid = appBaseInfo.host.appId;
      }
      this.deviceInfo = {
        platform: deviceInfo.platform,
        brand: deviceInfo.brand,
        model: deviceInfo.model,
        cpuType: deviceInfo.cpuType,
        memorySize: deviceInfo.memorySize,
        deviceUuid: deviceUUid,
        osVersion: osInfo.osVersion,
        osVersionMajor: osInfo.osVersionMajor,
        os: osInfo.os,
        platformVersion: appBaseInfo.version,
        frameworkVersion: appBaseInfo.SDKVersion,
        platformLanguage: appBaseInfo.language,
        screenSize: "".concat(windowInfo.screenWidth, "*").concat(windowInfo.screenHeight, " "),
        pixelRatio: windowInfo.pixelRatio,
        windowHeight: windowInfo.windowHeight,
        windowWidth: windowInfo.windowWidth,
        statusBarHeight: windowInfo.statusBarHeight,
        screenTop: windowInfo.screenTop
      };
    } catch (e) {
      console.error(e);
      this.deviceInfo = {};
    }
  }
  getClientID() {
    var clienetId = getStorageSync(CLIENT_ID_TOKEN);
    if (!clienetId) {
      clienetId = UUID();
      setStorageSync(CLIENT_ID_TOKEN, clienetId);
    }
    return clienetId;
  }
  getNetWork() {
    sdk.getNetworkType({
      success: e => {
        this.deviceInfo.networkType = e.networkType ? e.networkType : "unknown";
      }
    });
    sdk.onNetworkStatusChange(e => {
      this.deviceInfo.networkType = e.networkType ? e.networkType : "unknown";
    });
  }
  getLaunchOptions() {
    if (sdk.getLaunchOptionsSync) {
      var res = sdk.getLaunchOptionsSync();
      return {
        query: res && res.query || {},
        referrerInfo: res && res.referrerInfo || {}
      };
    } else {
      return {};
    }
  }
}
/* harmony default export */ const baseInfo = (new BaseInfo());
;// ./src/core/sessionManagement.js

var SessionType = {
  SYNTHETICS: 'synthetics',
  USER: 'user'
};
class sessionManagement {
  constructor(configuration) {
    this.sessionId = UUID();
    this.isTrack = performDraw(configuration.sampleRate);
  }
  getSessionId() {
    return this.sessionId;
  }
  isTracked() {
    return this.isTrack;
  }
}
;// ./src/core/errorFilter.js


function createErrorFilter(configuration, onLimitReached) {
  var errorCount = 0;
  var allowNextError = false;
  return {
    isLimitReached: function isLimitReached() {
      if (errorCount === 0) {
        setTimeout(function () {
          errorCount = 0;
        }, utils_ONE_MINUTE);
      }
      errorCount += 1;
      if (errorCount <= configuration.maxErrorsByMinute || allowNextError) {
        allowNextError = false;
        return false;
      }
      if (errorCount === configuration.maxErrorsByMinute + 1) {
        allowNextError = true;
        try {
          onLimitReached({
            message: "Reached max number of errors by minute: ".concat(configuration.maxErrorsByMinute),
            source: ErrorSource.AGENT,
            startTime: now()
          });
        } finally {
          allowNextError = false;
        }
      }
      return true;
    }
  };
}
;// ./src/rumEventsCollection/assembly.js






function startRumAssembly(applicationId, configuration, session, lifeCycle, parentContexts, getCommonContext) {
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
;// ./src/rumEventsCollection/parentContexts.js



var VIEW_CONTEXT_TIME_OUT_DELAY = 4 * ONE_HOUR;
var CLEAR_OLD_CONTEXTS_INTERVAL = ONE_MINUTE;
function startParentContexts(lifeCycle) {
  var currentView;
  var currentAction;
  var previousViews = [];
  var previousActions = [];
  lifeCycle.subscribe(LifeCycleEventType.VIEW_CREATED, function (currentContext) {
    currentView = currentContext;
  });
  lifeCycle.subscribe(LifeCycleEventType.VIEW_UPDATED, function (currentContext) {
    // A view can be updated after its end.  We have to ensure that the view being updated is the
    // most recently created.
    if (currentView && currentView.id === currentContext.id) {
      currentView = currentContext;
    }
  });
  lifeCycle.subscribe(LifeCycleEventType.VIEW_ENDED, function (data) {
    if (currentView) {
      previousViews.unshift({
        endTime: data.endClocks,
        context: buildCurrentViewContext(),
        startTime: currentView.startTime
      });
      currentView = undefined;
    }
  });
  lifeCycle.subscribe(LifeCycleEventType.AUTO_ACTION_CREATED, function (currentContext) {
    currentAction = currentContext;
  });
  lifeCycle.subscribe(LifeCycleEventType.AUTO_ACTION_COMPLETED, function (action) {
    if (currentAction) {
      previousActions.unshift({
        context: buildCurrentActionContext(),
        endTime: currentAction.startClocks + action.duration,
        startTime: currentAction.startClocks
      });
    }
    currentAction = undefined;
  });
  lifeCycle.subscribe(LifeCycleEventType.AUTO_ACTION_DISCARDED, function () {
    currentAction = undefined;
  });
  lifeCycle.subscribe(LifeCycleEventType.SESSION_RENEWED, function () {
    previousViews = [];
    previousActions = [];
    currentView = undefined;
    currentAction = undefined;
  });
  var clearOldContextsInterval = setInterval(function () {
    clearOldContexts(previousViews, VIEW_CONTEXT_TIME_OUT_DELAY);
  }, CLEAR_OLD_CONTEXTS_INTERVAL);
  function clearOldContexts(previousContexts, timeOutDelay) {
    var oldTimeThreshold = now() - timeOutDelay;
    while (previousContexts.length > 0 && previousContexts[previousContexts.length - 1].startTime < oldTimeThreshold) {
      previousContexts.pop();
    }
  }
  function buildCurrentActionContext() {
    return {
      userAction: {
        id: currentAction.id
      }
    };
  }
  function buildCurrentViewContext() {
    return {
      page: {
        id: currentView.id,
        referer: previousViews.length && previousViews[previousViews.length - 1].context.page.route || undefined,
        route: currentView.route
      }
    };
  }
  function findContext(buildContext, previousContexts, currentContext, startTime) {
    if (startTime === undefined) {
      return currentContext ? buildContext() : undefined;
    }
    if (currentContext && startTime >= currentContext.startTime) {
      return buildContext();
    }
    var flag = undefined;
    each(previousContexts, function (previousContext) {
      if (startTime > previousContext.endTime) {
        return false;
      }
      if (startTime >= previousContext.startTime) {
        flag = previousContext.context;
        return false;
      }
    });
    return flag;
  }
  var parentContexts = {
    findView: function findView(startTime) {
      return findContext(buildCurrentViewContext, previousViews, currentView, startTime);
    },
    findAction: function findAction(startTime) {
      return findContext(buildCurrentActionContext, previousActions, currentAction, startTime);
    },
    stop: function stop() {
      clearInterval(clearOldContextsInterval);
    }
  };
  return parentContexts;
}
;// ./src/helper/byteUtils.js
var ONE_KIBI_BYTE = 1024;
var ONE_MEBI_BYTE = 1024 * ONE_KIBI_BYTE;
// eslint-disable-next-line no-control-regex
var HAS_MULTI_BYTES_CHARACTERS = /[^\u0000-\u007F]/;
function computeBytesCount(candidate) {
  // Accurate byte size computations can degrade performances when there is a lot of events to process
  if (!HAS_MULTI_BYTES_CHARACTERS.test(candidate)) {
    return candidate.length;
  }
  var total = 0,
    charCode;
  // utf-8编码
  for (var i = 0, len = candidate.length; i < len; i++) {
    charCode = candidate.charCodeAt(i);
    if (charCode <= 0x007f) {
      total += 1;
    } else if (charCode <= 0x07ff) {
      total += 2;
    } else if (charCode <= 0xffff) {
      total += 3;
    } else {
      total += 4;
    }
  }
  return total;
}
;// ./src/core/dataMap.js

// 需要用双引号将字符串类型的field value括起来， 这里有数组标示[string, path]
var commonTags = {
  sdk_name: '_dd.sdk_name',
  sdk_version: '_dd.sdk_version',
  app_id: 'application.id',
  env: '_dd.env',
  service: '_dd.service',
  version: '_dd.version',
  userid: 'user.id',
  user_email: 'user.email',
  user_name: 'user.name',
  session_id: 'session.id',
  session_type: 'session.type',
  is_signin: 'user.is_signin',
  platform: 'device.platform',
  device: 'device.brand',
  brand: 'device.brand',
  model: 'device.model',
  cpu_type: 'device.cpu_type',
  memory_size: 'device.memory_size',
  device_uuid: 'device.device_uuid',
  os_version: 'device.os_version',
  os_version_major: 'device.os_version_major',
  os: 'device.os',
  platform_version: 'device.platform_version',
  app_framework_version: 'device.framework_version',
  platform_language: 'device.platform_language',
  screen_size: 'device.screen_size',
  pixel_ratio: 'device.pixel_ratio',
  window_height: 'device.window_height',
  window_width: 'device.window_width',
  status_bar_height: 'device.status_bar_height',
  screen_top: 'device.screen_top',
  network_type: 'device.network_type',
  view_id: 'page.id',
  view_name: 'page.route',
  view_referer: 'page.referer'
};
var commonFields = {
  app_launch_query: 'app.launch.query',
  app_launch_referrer_info: 'app.launch.referrer_info'
};
var dataMap = {
  view: {
    type: RumEventType.VIEW,
    tags: {
      view_apdex_level: 'page.apdex_level',
      is_active: 'page.is_active'
    },
    fields: {
      page_fmp: 'page.fmp',
      first_paint_time: 'page.fpt',
      loading_time: 'page.loading_time',
      onload_to_onshow: 'page.onload2onshow',
      onshow_to_onready: 'page.onshow2onready',
      time_spent: 'page.time_spent',
      view_error_count: 'page.error.count',
      view_resource_count: 'page.resource.count',
      view_long_task_count: 'page.long_task.count',
      view_action_count: 'page.action.count',
      view_setdata_count: 'page.setdata.count'
    }
  },
  resource: {
    type: RumEventType.RESOURCE,
    tags: {
      trace_id: '_dd.trace_id',
      span_id: '_dd.span_id',
      resource_type: 'resource.type',
      resource_status: 'resource.status',
      resource_status_group: 'resource.status_group',
      resource_method: 'resource.method',
      resource_url: 'resource.url',
      resource_url_host: 'resource.url_host',
      resource_url_path: 'resource.url_path',
      resource_url_path_group: 'resource.url_path_group',
      resource_url_query: 'resource.url_query'
    },
    fields: {
      resource_size: 'resource.size',
      resource_load: 'resource.load',
      resource_dns: 'resource.dns',
      resource_tcp: 'resource.tcp',
      resource_ssl: 'resource.ssl',
      resource_ttfb: 'resource.ttfb',
      resource_trans: 'resource.trans',
      resource_first_byte: 'resource.firstbyte',
      duration: 'resource.duration'
    }
  },
  error: {
    type: RumEventType.ERROR,
    tags: {
      trace_id: '_dd.trace_id',
      span_id: '_dd.span_id',
      error_source: 'error.source',
      error_type: 'error.type',
      resource_url: 'error.resource.url',
      resource_url_host: 'error.resource.url_host',
      resource_url_path: 'error.resource.url_path',
      resource_url_path_group: 'error.resource.url_path_group',
      resource_status: 'error.resource.status',
      resource_status_group: 'error.resource.status_group',
      resource_method: 'error.resource.method'
    },
    fields: {
      error_message: ['string', 'error.message'],
      error_stack: ['string', 'error.stack']
    }
  },
  long_task: {
    type: RumEventType.LONG_TASK,
    tags: {},
    fields: {
      duration: 'long_task.duration'
    }
  },
  action: {
    type: RumEventType.ACTION,
    tags: {
      action_id: 'action.id',
      action_name: 'action.target.name',
      action_type: 'action.type'
    },
    fields: {
      duration: 'action.loading_time',
      action_error_count: 'action.error.count',
      action_resource_count: 'action.resource.count',
      action_long_task_count: 'action.long_task.count'
    }
  },
  app: {
    alias_key: 'action',
    // metrc 别名,
    type: RumEventType.APP,
    tags: {
      action_id: 'app.id',
      action_name: 'app.name',
      action_type: 'app.type'
    },
    fields: {
      duration: 'app.duration'
    }
  }
};
;// ./src/core/transport.js






// https://en.wikipedia.org/wiki/UTF-8
var transport_HAS_MULTI_BYTES_CHARACTERS = /[^\u0000-\u007F]/;
var CUSTOM_KEYS = "custom_keys";
function addBatchPrecision(url) {
  if (!url) return url;
  return url + (url.indexOf("?") === -1 ? "?" : "&") + "precision=ms";
}
var httpRequest = function httpRequest(endpointUrl, bytesLimit) {
  this.endpointUrl = endpointUrl;
  this.bytesLimit = bytesLimit;
};
httpRequest.prototype = {
  send: function send(data) {
    var url = addBatchPrecision(this.endpointUrl);
    var request = sdk.request || sdk.httpRequest;
    request({
      method: "POST",
      header: {
        "content-type": "text/plain;charset=UTF-8",
        "x-client-timestamp": new Date().getTime().toString()
      },
      headers: {
        "content-type": "text/plain;charset=UTF-8",
        // 兼容其他
        "x-client-timestamp": new Date().getTime().toString()
      },
      url,
      data
    });
  }
};
var HttpRequest = httpRequest;
var processedMessageByDataMap = function processedMessageByDataMap(message) {
  if (!message || !message.type) return {
    rowStr: "",
    rowData: undefined
  };
  var rowData = {
    tags: {},
    fields: {}
  };
  var hasFileds = false;
  var rowStr = "";
  each(dataMap, function (value, key) {
    if (value.type === message.type) {
      if (value.alias_key) {
        rowStr += value.alias_key + ",";
      } else {
        rowStr += key + ",";
      }
      rowData.measurement = key;
      var tagsStr = [];
      var tags = extend({}, commonTags, value.tags);
      var filterFileds = ["date", "type", CUSTOM_KEYS]; // 已经在datamap中定义过的fields和tags
      each(tags, function (value_path, _key) {
        var _value = findByPath(message, value_path);
        filterFileds.push(_key);
        if (_value || isNumber(_value)) {
          rowData.tags[_key] = escapeJsonValue(_value);
          tagsStr.push(escapeRowData(_key) + "=" + escapeRowData(_value));
        }
      });
      var fields = extend({}, commonFields, value.fields);
      var fieldsStr = [];
      each(fields, function (_value, _key) {
        if (isArray(_value) && _value.length === 2) {
          var type = _value[0],
            value_path = _value[1];
          var _valueData = findByPath(message, value_path);
          filterFileds.push(_key);
          if (_valueData || isNumber(_valueData)) {
            rowData.fields[_key] = _valueData; // 这里不需要转译
            fieldsStr.push(escapeRowData(_key) + "=" + escapeRowField(_valueData));
          }
        } else if (isString(_value)) {
          var _valueData = findByPath(message, _value);
          filterFileds.push(_key);
          if (_valueData || isNumber(_valueData)) {
            rowData.fields[_key] = _valueData; // 这里不需要转译
            fieldsStr.push(escapeRowData(_key) + "=" + escapeRowField(_valueData));
          }
        }
      });
      if (message.tags && isObject(message.tags) && !isEmptyObject(message.tags)) {
        // 自定义tag， 存储成field
        var _tagKeys = [];
        each(message.tags, function (_value, _key) {
          // 如果和之前tag重名，则舍弃
          if (filterFileds.indexOf(_key) > -1) return;
          filterFileds.push(_key);
          if (_value || isNumber(_value)) {
            _tagKeys.push(_key);
            rowData.fields[_key] = _value; // 这里不需要转译
            fieldsStr.push(escapeRowData(_key) + "=" + escapeRowField(_value));
          }
        });
        if (_tagKeys.length) {
          rowData.fields[CUSTOM_KEYS] = escapeRowField(_tagKeys);
          fieldsStr.push(escapeRowData(CUSTOM_KEYS) + "=" + escapeRowField(_tagKeys));
        }
      }
      if (tagsStr.length) {
        rowStr += tagsStr.join(",");
      }
      if (fieldsStr.length) {
        rowStr += " ";
        rowStr += fieldsStr.join(",");
        hasFileds = true;
      }
      rowStr = rowStr + " " + message.date;
      rowData.time = toServerDuration(message.date); // 这里不需要转译
    }
  });
  return {
    rowStr: hasFileds ? rowStr : "",
    rowData: hasFileds ? rowData : undefined
  };
};
function batch(request, maxSize, bytesLimit, maxMessageSize, flushTimeout, lifeCycle) {
  this.request = request;
  this.maxSize = maxSize;
  this.bytesLimit = bytesLimit;
  this.maxMessageSize = maxMessageSize;
  this.flushTimeout = flushTimeout;
  this.lifeCycle = lifeCycle;
  this.pushOnlyBuffer = [];
  this.upsertBuffer = {};
  this.bufferBytesSize = 0;
  this.bufferMessageCount = 0;
  this.flushOnVisibilityHidden();
  this.flushPeriodically();
}
batch.prototype = {
  add: function add(message) {
    this.addOrUpdate(message);
  },
  upsert: function upsert(message, key) {
    this.addOrUpdate(message, key);
  },
  flush: function flush() {
    if (this.bufferMessageCount !== 0) {
      var messages = this.pushOnlyBuffer.concat(values(this.upsertBuffer));
      this.request.send(messages.join("\n"), this.bufferBytesSize);
      this.pushOnlyBuffer = [];
      this.upsertBuffer = {};
      this.bufferBytesSize = 0;
      this.bufferMessageCount = 0;
    }
  },
  processSendData: function processSendData(message) {
    return processedMessageByDataMap(message).rowStr;
  },
  addOrUpdate: function addOrUpdate(message, key) {
    var process = this.process(message);
    if (!process.processedMessage || process.processedMessage === "") return;
    if (process.messageBytesSize >= this.maxMessageSize) {
      console.warn("Discarded a message whose size was bigger than the maximum allowed size" + this.maxMessageSize + "KB.");
      return;
    }
    if (this.hasMessageFor(key)) {
      this.remove(key);
    }
    if (this.willReachedBytesLimitWith(process.messageBytesSize)) {
      this.flush();
    }
    this.push(process.processedMessage, process.messageBytesSize, key);
    if (this.isFull()) {
      this.flush();
    }
  },
  process: function process(message) {
    var processedMessage = this.processSendData(message);
    var messageBytesSize = computeBytesCount(processedMessage);
    return {
      processedMessage: processedMessage,
      messageBytesSize: messageBytesSize
    };
  },
  push: function push(processedMessage, messageBytesSize, key) {
    if (this.bufferMessageCount > 0) {
      // \n separator at serialization
      this.bufferBytesSize += 1;
    }
    if (key !== undefined) {
      this.upsertBuffer[key] = processedMessage;
    } else {
      this.pushOnlyBuffer.push(processedMessage);
    }
    this.bufferBytesSize += messageBytesSize;
    this.bufferMessageCount += 1;
  },
  remove: function remove(key) {
    var removedMessage = this.upsertBuffer[key];
    delete this.upsertBuffer[key];
    var messageBytesSize = computeBytesCount(removedMessage);
    this.bufferBytesSize -= messageBytesSize;
    this.bufferMessageCount -= 1;
    if (this.bufferMessageCount > 0) {
      this.bufferBytesSize -= 1;
    }
  },
  hasMessageFor: function hasMessageFor(key) {
    return key !== undefined && this.upsertBuffer[key] !== undefined;
  },
  willReachedBytesLimitWith: function willReachedBytesLimitWith(messageBytesSize) {
    // byte of the separator at the end of the message
    return this.bufferBytesSize + messageBytesSize + 1 >= this.bytesLimit;
  },
  isFull: function isFull() {
    return this.bufferMessageCount === this.maxSize || this.bufferBytesSize >= this.bytesLimit;
  },
  flushPeriodically: function flushPeriodically() {
    var _this = this;
    setTimeout(function () {
      _this.flush();
      _this.flushPeriodically();
    }, _this.flushTimeout);
  },
  flushOnVisibilityHidden: function flushOnVisibilityHidden() {
    var _this = this;
    /**
     * With sendBeacon, requests are guaranteed to be successfully sent during document unload
     */
    // @ts-ignore this function is not always defined
    this.lifeCycle.subscribe(LifeCycleEventType.APP_HIDE, function () {
      _this.flush();
    });
  }
};
var Batch = batch;
;// ./src/rumEventsCollection/transport/batch.js



function startRumBatch(configuration, lifeCycle) {
  var batch = makeRumBatch(configuration, lifeCycle);
  lifeCycle.subscribe(LifeCycleEventType.RUM_EVENT_COLLECTED, function (serverRumEvent) {
    if (serverRumEvent.type === RumEventType.VIEW) {
      batch.upsert(serverRumEvent, serverRumEvent.page.id);
    } else {
      batch.add(serverRumEvent);
    }
  });
  return {
    stop: function stop() {
      batch.stop();
    }
  };
}
function makeRumBatch(configuration, lifeCycle) {
  var primaryBatch = createRumBatch(configuration.datakitUrl, lifeCycle);
  function createRumBatch(endpointUrl, lifeCycle) {
    return new Batch(new HttpRequest(endpointUrl, configuration.batchBytesLimit), configuration.maxBatchSize, configuration.batchBytesLimit, configuration.maxMessageSize, configuration.flushTimeout, lifeCycle);
  }
  var stopped = false;
  return {
    add: function add(message) {
      if (stopped) {
        return;
      }
      primaryBatch.add(message);
    },
    stop: function stop() {
      stopped = true;
    },
    upsert: function upsert(message, key) {
      if (stopped) {
        return;
      }
      primaryBatch.upsert(message, key);
    }
  };
}
;// ./src/rumEventsCollection/trackEventCounts.js



function trackEventCounts(lifeCycle, callback) {
  if (typeof callback === 'undefined') {
    callback = noop;
  }
  var eventCounts = {
    errorCount: 0,
    resourceCount: 0,
    longTaskCount: 0,
    userActionCount: 0
  };
  var subscription = lifeCycle.subscribe(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, function (data) {
    var rawRumEvent = data.rawRumEvent;
    switch (rawRumEvent.type) {
      case RumEventType.ERROR:
        eventCounts.errorCount += 1;
        callback(eventCounts);
        break;
      case RumEventType.RESOURCE:
        eventCounts.resourceCount += 1;
        callback(eventCounts);
        break;
      case RumEventType.ACTION:
        eventCounts.userActionCount += 1;
        callback(eventCounts);
        break;
    }
  });
  return {
    stop: function stop() {
      subscription.unsubscribe();
    },
    eventCounts: eventCounts
  };
}
;// ./src/rumEventsCollection/page/index.js



// 劫持原小程序App方法
var THROTTLE_VIEW_UPDATE_PERIOD = 3000;
function rewritePage(configuration, lifeCycle) {
  var originPage = Page;
  var originComponent = Component;
  var hookPage = function hookPage(pageInstance) {
    var currentView,
      startTime = now();
    ['onReady', 'onShow', 'onLoad', 'onUnload', 'onHide'].forEach(methodName => {
      var userDefinedMethod = pageInstance[methodName];
      pageInstance[methodName] = function () {
        if (methodName === 'onShow' || methodName === 'onLoad') {
          if (typeof currentView === 'undefined') {
            var activePage = getActivePage();
            currentView = newView(lifeCycle, activePage && activePage.route, startTime);
          }
        }
        currentView && currentView.setLoadEventEnd(methodName);
        if ((methodName === 'onUnload' || methodName === 'onHide' || methodName === 'onShow') && currentView) {
          currentView.triggerUpdate();
          if (methodName === 'onUnload' || methodName === 'onHide') {
            currentView.end();
            currentView = undefined;
          }
        }
        return userDefinedMethod && userDefinedMethod.apply(this, arguments);
      };
    });
  };
  Component = function Component(component) {
    try {
      hookPage(component.methods);
    } catch (error) {}
    return originComponent(component);
  };
  Page = function Page(page) {
    // 合并方法，插入记录脚本
    try {
      hookPage(page);
    } catch (error) {}
    return originPage(page);
  };
}
function newView(lifeCycle, route, startTime) {
  if (typeof startTime === 'undefined') {
    startTime = now();
  }
  var id = UUID();
  var isActive = true;
  var eventCounts = {
    errorCount: 0,
    resourceCount: 0,
    userActionCount: 0
  };
  var setdataCount = 0;
  var documentVersion = 0;
  var setdataDuration = 0;
  var loadingDuration = 0;
  var loadingTime;
  var showTime;
  var onload2onshowTime;
  var onshow2onready;
  var stayTime;
  var fpt, fmp;
  lifeCycle.notify(LifeCycleEventType.VIEW_CREATED, {
    id,
    startTime,
    route
  });
  var scheduleViewThrottled = throttle(triggerViewUpdate, THROTTLE_VIEW_UPDATE_PERIOD, {
    leading: false
  });
  var scheduleViewUpdate = scheduleViewThrottled.throttled;
  var cancelScheduleViewUpdate = scheduleViewThrottled.cancel;
  var _trackEventCounts = trackEventCounts(lifeCycle, function (newEventCounts) {
    eventCounts = newEventCounts;
    scheduleViewUpdate();
  });
  var stopEventCountsTracking = _trackEventCounts.stop;
  var _trackFptTime = trackFptTime(lifeCycle, function (duration) {
    fpt = duration;
    scheduleViewUpdate();
  });
  var stopFptTracking = _trackFptTime.stop;
  var _trackSetDataTime = trackSetDataTime(lifeCycle, function (duration) {
    if (isNumber(duration)) {
      setdataDuration += duration;
      setdataCount++;
      scheduleViewUpdate();
    }
  });
  var stopSetDataTracking = _trackSetDataTime.stop;
  var _trackLoadingTime = trackLoadingTime(lifeCycle, function (duration) {
    if (isNumber(duration)) {
      loadingDuration = duration;
      scheduleViewUpdate();
    }
  });
  var stopLoadingTimeTracking = _trackLoadingTime.stop;
  var setLoadEventEnd = function setLoadEventEnd(type) {
    if (type === 'onLoad') {
      loadingTime = now();
    } else if (type === 'onShow') {
      showTime = now();
      if (typeof onload2onshowTime === 'undefined' && typeof loadingTime !== 'undefined') {
        onload2onshowTime = showTime - loadingTime;
      }
    } else if (type === 'onReady') {
      if (typeof onshow2onready === 'undefined' && typeof showTime !== 'undefined') {
        onshow2onready = now() - showTime;
      }
      if (typeof fmp === 'undefined') {
        fmp = now() - startTime; // 从开发者角度看，小程序首屏渲染完成的标志是首页 Page.onReady 事件触发。
      }
    } else if (type === 'onHide' || type === 'onUnload') {
      if (typeof showTime !== 'undefined') {
        stayTime = now() - showTime;
      }
      isActive = false;
    }
    triggerViewUpdate();
  };
  function triggerViewUpdate() {
    documentVersion += 1;
    lifeCycle.notify(LifeCycleEventType.VIEW_UPDATED, {
      documentVersion: documentVersion,
      eventCounts: eventCounts,
      id: id,
      loadingTime: loadingDuration,
      stayTime,
      onload2onshowTime,
      onshow2onready,
      setdataDuration,
      setdataCount,
      fmp,
      fpt,
      startTime: startTime,
      route: route,
      duration: now() - startTime,
      isActive: isActive
    });
  }
  return {
    scheduleUpdate: scheduleViewUpdate,
    setLoadEventEnd,
    triggerUpdate: function triggerUpdate() {
      cancelScheduleViewUpdate();
      triggerViewUpdate();
    },
    end: function end() {
      stopEventCountsTracking();
      stopFptTracking();
      cancelScheduleViewUpdate();
      stopSetDataTracking();
      stopLoadingTimeTracking();
      lifeCycle.notify(LifeCycleEventType.VIEW_ENDED, {
        endClocks: now()
      });
    }
  };
}
function trackFptTime(lifeCycle, callback) {
  var subscribe = lifeCycle.subscribe(LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, function (entitys) {
    var firstRenderEntity = entitys.find(entity => entity.entryType === 'render' && entity.name === 'firstRender');
    if (typeof firstRenderEntity !== 'undefined') {
      callback(firstRenderEntity.duration);
    }
  });
  return {
    stop: subscribe.unsubscribe
  };
}
function trackLoadingTime(lifeCycle, callback) {
  var subscribe = lifeCycle.subscribe(LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, function (entitys) {
    var navigationEnity = entitys.find(entity => entity.entryType === 'navigation');
    if (typeof navigationEnity !== 'undefined') {
      callback(navigationEnity.duration);
    }
  });
  return {
    stop: subscribe.unsubscribe
  };
}
function trackSetDataTime(lifeCycle, callback) {
  var subscribe = lifeCycle.subscribe(LifeCycleEventType.PAGE_SET_DATA_UPDATE, function (data) {
    if (!data) return;
    callback(data.updateEndTimestamp - data.pendingStartTimestamp);
  });
  return {
    stop: subscribe.unsubscribe
  };
}
// function getActivePage() {
// 	const curPages = getCurrentPages()
// 	if (curPages.length) {
// 		return curPages[curPages.length - 1]
// 	}
// 	return {}
// }
;// ./src/rumEventsCollection/page/viewCollection.js




function startViewCollection(lifeCycle, configuration) {
  lifeCycle.subscribe(LifeCycleEventType.VIEW_UPDATED, function (view) {
    lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processViewUpdate(view));
  });
  return rewritePage(configuration, lifeCycle);
}
function processViewUpdate(view) {
  var apdexLevel;
  if (view.fmp) {
    apdexLevel = parseInt(Number(view.fmp) / 1000);
    apdexLevel = apdexLevel > 9 ? 9 : apdexLevel;
  }
  var viewEvent = {
    _dd: {
      documentVersion: view.documentVersion
    },
    date: view.startTime,
    type: RumEventType.VIEW,
    page: {
      action: {
        count: view.eventCounts.userActionCount
      },
      error: {
        count: view.eventCounts.errorCount
      },
      setdata: {
        count: view.setdataCount
      },
      setdata_duration: msToNs(view.setdataDuration),
      loadingTime: msToNs(view.loadingTime),
      stayTime: msToNs(view.stayTime),
      onload2onshow: msToNs(view.onload2onshowTime),
      onshow2onready: msToNs(view.onshow2onready),
      fpt: msToNs(view.fpt),
      fmp: msToNs(view.fmp),
      isActive: view.isActive,
      apdexLevel,
      // longTask: {
      //   count: view.eventCounts.longTaskCount
      // },
      resource: {
        count: view.eventCounts.resourceCount
      },
      timeSpent: msToNs(view.duration)
    }
  };
  return {
    rawRumEvent: viewEvent,
    startTime: view.startTime
  };
}
;// ./src/rumEventsCollection/resource/resourceUtils.js


function resourceUtils_areInOrder() {
  var numbers = toArray(arguments);
  for (var i = 1; i < numbers.length; i += 1) {
    if (numbers[i - 1] > numbers[i]) {
      return false;
    }
  }
  return true;
}
function computePerformanceResourceDuration(entry) {
  // Safari duration is always 0 on timings blocked by cross origin policies.
  if (entry.startTime < entry.responseEnd) {
    return msToNs(entry.responseEnd - entry.startTime);
  }
}

//  interface PerformanceResourceDetails {
//   redirect?: PerformanceResourceDetailsElement
//   dns?: PerformanceResourceDetailsElement
//   connect?: PerformanceResourceDetailsElement
//   ssl?: PerformanceResourceDetailsElement
//   firstByte: PerformanceResourceDetailsElement
//   download: PerformanceResourceDetailsElement
//   fmp:
// }
// page_fmp	float		首屏时间(用于衡量用户什么时候看到页面的主要内容)，跟FCP的时长非常接近，这里我们就用FCP的时间作为首屏时间	firstPaintContentEnd - firstPaintContentStart
// page_fpt	float		首次渲染时间，即白屏时间(从请求开始到浏览器开始解析第一批HTML文档字节的时间差。)	responseEnd - fetchStart
// page_tti	float		首次可交互时间(浏览器完成所有HTML解析并且完成DOM构建，此时浏览器开始加载资源。)	domInteractive - fetchStart
// page_firstbyte	float		首包时间	responseStart - domainLookupStart
// page_dom_ready	float		DOM Ready时间(如果页面有同步执行的JS，则同步JS执行时间=ready-tti。)	domContentLoadEventEnd - fetchStart
// page_load	float		页面完全加载时间(load=首次渲染时间+DOM解析耗时+同步JS执行+资源加载耗时。)	loadEventStart - fetchStart
// page_dns	float		dns解析时间	domainLookupEnd - domainLookupStart
// page_tcp	float		tcp连接时间	connectEnd - connectStart
// page_ssl	float		ssl安全连接时间(仅适用于https)	connectEnd - secureConnectionStart
// page_ttfb	float		请求响应耗时	responseStart - requestStart
// page_trans	float		内容传输时间	responseEnd - responseStart
// page_dom	float		DOM解析耗时	domInteractive - responseEnd
// page_resource_load_time	float		资源加载时间	loadEventStart - domContentLoadedEventEnd

//  navigationStart：当前浏览器窗口的前一个网页关闭，发生unload事件时的Unix毫秒时间戳。如果没有前一个网页，则等于fetchStart属性。

// ·   unloadEventStart：如果前一个网页与当前网页属于同一个域名，则返回前一个网页的unload事件发生时的Unix毫秒时间戳。如果没有前一个网页，或者之前的网页跳转不是在同一个域名内，则返回值为0。

// ·   unloadEventEnd：如果前一个网页与当前网页属于同一个域名，则返回前一个网页unload事件的回调函数结束时的Unix毫秒时间戳。如果没有前一个网页，或者之前的网页跳转不是在同一个域名内，则返回值为0。

// ·   redirectStart：返回第一个HTTP跳转开始时的Unix毫秒时间戳。如果没有跳转，或者不是同一个域名内部的跳转，则返回值为0。

// ·   redirectEnd：返回最后一个HTTP跳转结束时（即跳转回应的最后一个字节接受完成时）的Unix毫秒时间戳。如果没有跳转，或者不是同一个域名内部的跳转，则返回值为0。

// ·   fetchStart：返回浏览器准备使用HTTP请求读取文档时的Unix毫秒时间戳。该事件在网页查询本地缓存之前发生。

// ·   domainLookupStart：返回域名查询开始时的Unix毫秒时间戳。如果使用持久连接，或者信息是从本地缓存获取的，则返回值等同于fetchStart属性的值。

// ·   domainLookupEnd：返回域名查询结束时的Unix毫秒时间戳。如果使用持久连接，或者信息是从本地缓存获取的，则返回值等同于fetchStart属性的值。

// ·   connectStart：返回HTTP请求开始向服务器发送时的Unix毫秒时间戳。如果使用持久连接（persistent connection），则返回值等同于fetchStart属性的值。

// ·   connectEnd：返回浏览器与服务器之间的连接建立时的Unix毫秒时间戳。如果建立的是持久连接，则返回值等同于fetchStart属性的值。连接建立指的是所有握手和认证过程全部结束。

// ·   secureConnectionStart：返回浏览器与服务器开始安全链接的握手时的Unix毫秒时间戳。如果当前网页不要求安全连接，则返回0。

// ·   requestStart：返回浏览器向服务器发出HTTP请求时（或开始读取本地缓存时）的Unix毫秒时间戳。

// ·   responseStart：返回浏览器从服务器收到（或从本地缓存读取）第一个字节时的Unix毫秒时间戳。

// ·   responseEnd：返回浏览器从服务器收到（或从本地缓存读取）最后一个字节时（如果在此之前HTTP连接已经关闭，则返回关闭时）的Unix毫秒时间戳。

// ·   domLoading：返回当前网页DOM结构开始解析时（即Document.readyState属性变为“loading”、相应的readystatechange事件触发时）的Unix毫秒时间戳。

// ·   domInteractive：返回当前网页DOM结构结束解析、开始加载内嵌资源时（即Document.readyState属性变为“interactive”、相应的readystatechange事件触发时）的Unix毫秒时间戳。

// ·   domContentLoadedEventStart：返回当前网页DOMContentLoaded事件发生时（即DOM结构解析完毕、所有脚本开始运行时）的Unix毫秒时间戳。

// ·   domContentLoadedEventEnd：返回当前网页所有需要执行的脚本执行完成时的Unix毫秒时间戳。

// ·   domComplete：返回当前网页DOM结构生成时（即Document.readyState属性变为“complete”，以及相应的readystatechange事件发生时）的Unix毫秒时间戳。

// ·   loadEventStart：返回当前网页load事件的回调函数开始时的Unix毫秒时间戳。如果该事件还没有发生，返回0。

// ·   loadEventEnd：返回当前网页load事件的回调函数运行结束时的Unix毫秒时间戳。如果该事件还没有发生，返回0
function computePerformanceResourceDetails(entry) {
  var validEntry = toValidEntry(entry);
  if (!validEntry) {
    return undefined;
  }
  var startTime = validEntry.startTime,
    fetchStart = validEntry.fetchStart,
    redirectStart = validEntry.redirectStart,
    redirectEnd = validEntry.redirectEnd,
    domainLookupStart = validEntry.domainLookupStart || validEntry.domainLookUpStart,
    domainLookupEnd = validEntry.domainLookupEnd || validEntry.domainLookUpEnd,
    connectStart = validEntry.connectStart,
    SSLconnectionStart = validEntry.SSLconnectionStart,
    SSLconnectionEnd = validEntry.SSLconnectionEnd,
    connectEnd = validEntry.connectEnd,
    requestStart = validEntry.requestStart,
    responseStart = validEntry.responseStart,
    responseEnd = validEntry.responseEnd;
  var details = {
    firstbyte: formatTiming(startTime, domainLookupStart, responseStart),
    trans: formatTiming(startTime, responseStart, responseEnd),
    ttfb: formatTiming(startTime, requestStart, responseStart)
  };
  // Make sure a connection occurred
  if (connectEnd !== fetchStart) {
    details.tcp = formatTiming(startTime, connectStart, connectEnd);

    // Make sure a secure connection occurred
    if (resourceUtils_areInOrder(connectStart, SSLconnectionStart, SSLconnectionEnd)) {
      details.ssl = formatTiming(startTime, SSLconnectionStart, SSLconnectionEnd);
    }
  }

  // Make sure a domain lookup occurred
  if (domainLookupEnd !== fetchStart) {
    details.dns = formatTiming(startTime, domainLookupStart, domainLookupEnd);
  }
  if (hasRedirection(entry)) {
    details.redirect = formatTiming(startTime, redirectStart, redirectEnd);
  }
  return details;
}
function toValidEntry(entry) {
  // Ensure timings are in the right order. On top of filtering out potential invalid
  // RumPerformanceResourceTiming, it will ignore entries from requests where timings cannot be
  // collected, for example cross origin requests without a "Timing-Allow-Origin" header allowing
  // it.
  // page_fmp	float		首屏时间(用于衡量用户什么时候看到页面的主要内容)，跟FCP的时长非常接近，这里我们就用FCP的时间作为首屏时间	firstPaintContentEnd - firstPaintContentStart
  // page_fpt	float		首次渲染时间，即白屏时间(从请求开始到浏览器开始解析第一批HTML文档字节的时间差。)	responseEnd - fetchStart
  // page_tti	float		首次可交互时间(浏览器完成所有HTML解析并且完成DOM构建，此时浏览器开始加载资源。)	domInteractive - fetchStart
  // page_firstbyte	float		首包时间	responseStart - domainLookupStart
  // page_dom_ready	float		DOM Ready时间(如果页面有同步执行的JS，则同步JS执行时间=ready-tti。)	domContentLoadEventEnd - fetchStart
  // page_load	float		页面完全加载时间(load=首次渲染时间+DOM解析耗时+同步JS执行+资源加载耗时。)	loadEventStart - fetchStart
  // page_dns	float		dns解析时间	domainLookupEnd - domainLookupStart
  // page_tcp	float		tcp连接时间	connectEnd - connectStart
  // page_ssl	float		ssl安全连接时间(仅适用于https)	connectEnd - secureConnectionStart
  // page_ttfb	float		请求响应耗时	responseStart - requestStart
  // page_trans	float		内容传输时间	responseEnd - responseStart
  // page_dom	float		DOM解析耗时	domInteractive - responseEnd
  // page_resource_load_time	float		资源加载时间	loadEventStart - domContentLoadedEventEnd
  if (!resourceUtils_areInOrder(entry.startTime, entry.fetchStart, entry.domainLookupStart, entry.domainLookupEnd, entry.connectStart, entry.connectEnd, entry.requestStart, entry.responseStart, entry.responseEnd)) {
    return undefined;
  }
  if (!hasRedirection(entry)) {
    return entry;
  }
  var redirectStart = entry.redirectStart;
  var redirectEnd = entry.redirectEnd;
  // Firefox doesn't provide redirect timings on cross origin requests.
  // Provide a default for those.
  if (redirectStart < entry.startTime) {
    redirectStart = entry.startTime;
  }
  if (redirectEnd < entry.startTime) {
    redirectEnd = entry.fetchStart;
  }

  // Make sure redirect timings are in order
  if (!resourceUtils_areInOrder(entry.startTime, redirectStart, redirectEnd, entry.fetchStart)) {
    return undefined;
  }
  return extend({}, entry, {
    redirectEnd: redirectEnd,
    redirectStart: redirectStart
  });
  // return {
  //   ...entry,
  //   redirectEnd,
  //   redirectStart
  // }
}
function hasRedirection(entry) {
  // The only time fetchStart is different than startTime is if a redirection occurred.
  return entry.fetchStart !== entry.startTime;
}
function formatTiming(origin, start, end) {
  return msToNs(end - start);
}
function computeSize(entry) {
  // Make sure a request actually occurred
  if (entry.startTime < entry.responseStart) {
    return entry.receivedBytedCount;
  }
  return undefined;
}
// export function isAllowedRequestUrl(configuration, url) {
//   return url && !isIntakeRequest(url, configuration);
// }
;// ./src/rumEventsCollection/resource/resourceCollection.js





function startResourceCollection(lifeCycle, configuration) {
  lifeCycle.subscribe(LifeCycleEventType.REQUEST_COMPLETED, function (request) {
    lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processRequest(request));
  });
}
function processRequest(request) {
  var type = request.type;
  var timing = request.performance;
  var correspondingTimingOverrides = timing ? computePerformanceEntryMetrics(timing) : undefined;
  var tracingInfo = resourceCollection_computeRequestTracingInfo(request);
  var urlObj = urlParse(request.url).getParse();
  var startTime = request.startTime;
  var resourceEvent = extend2Lev({
    date: startTime,
    resource: {
      type: type,
      duration: msToNs(request.duration),
      method: request.method,
      status: request.status,
      statusGroup: getStatusGroup(request.status),
      url: request.url,
      urlHost: urlObj.Host,
      urlPath: urlObj.Path,
      urlPathGroup: replaceNumberCharByPath(urlObj.Path),
      urlQuery: jsonStringify(getQueryParamsFromUrl(request.url))
    },
    type: RumEventType.RESOURCE
  }, tracingInfo, correspondingTimingOverrides);
  return {
    startTime: startTime,
    rawRumEvent: resourceEvent
  };
}
function resourceCollection_computeRequestTracingInfo(request) {
  var hasBeenTraced = request.traceId && request.spanId;
  if (!hasBeenTraced) {
    return undefined;
  }
  return {
    _dd: {
      spanId: request.spanId,
      traceId: request.traceId
    },
    resource: {
      id: UUID()
    }
  };
}
function computePerformanceEntryMetrics(timing) {
  return {
    resource: extend2Lev({}, {
      load: computePerformanceResourceDuration(timing),
      size: computeSize(timing)
    }, computePerformanceResourceDetails(timing))
  };
}
;// ./src/rumEventsCollection/app/index.js



// 劫持原小程序App方法
var app_THROTTLE_VIEW_UPDATE_PERIOD = 3000;
var startupTypes = {
  COLD: 'cold',
  HOT: 'hot'
};
function rewriteApp(configuration, lifeCycle) {
  var originApp = App;
  var appInfo = {
    isStartUp: false // 是否启动
  };
  var startTime;
  App = function App(app) {
    startTime = now()
    // 合并方法，插入记录脚本
    ;
    ['onLaunch', 'onShow', 'onHide'].forEach(methodName => {
      var userDefinedMethod = app[methodName]; // 暂存用户定义的方法
      app[methodName] = function (options) {
        if (methodName === 'onLaunch') {
          appInfo.isStartUp = true;
          appInfo.isHide = false;
          appInfo.startupType = startupTypes.COLD;
        } else if (methodName === 'onShow') {
          if (appInfo.isStartUp && appInfo.isHide) {
            // 判断是热启动
            appInfo.startupType = startupTypes.HOT;
            // appUpdate()
          }
        } else if (methodName === 'onHide') {
          lifeCycle.notify(LifeCycleEventType.APP_HIDE);
          appInfo.isHide = true;
        }
        return userDefinedMethod && userDefinedMethod.call(this, options);
      };
    });
    return originApp(app);
  };
  startPerformanceObservable(lifeCycle);
}
function startPerformanceObservable(lifeCycle) {
  var subscribe = lifeCycle.subscribe(LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, function (entitys) {
    // 过滤掉其他页面监听，只保留首次启动
    var codeDownloadDuration;
    var launchEntity = entitys.find(entity => entity.entryType === 'navigation' && entity.navigationType === 'appLaunch');
    if (typeof launchEntity !== 'undefined') {
      lifeCycle.notify(LifeCycleEventType.APP_UPDATE, {
        startTime: now(),
        name: '启动',
        type: 'launch',
        id: UUID(),
        duration: launchEntity.duration
      });
    }
    var scriptentity = entitys.find(entity => entity.entryType === 'script' && entity.name === 'evaluateScript');
    if (typeof scriptentity !== 'undefined') {
      lifeCycle.notify(LifeCycleEventType.APP_UPDATE, {
        startTime: now(),
        name: '脚本注入',
        type: 'script_insert',
        id: UUID(),
        duration: scriptentity.duration
      });
    }
    var firstEntity = entitys.find(entity => entity.entryType === 'render' && entity.name === 'firstRender');
    if (firstEntity && scriptentity && launchEntity) {
      if (!areInOrder(firstEntity.duration, launchEntity.duration) || !areInOrder(scriptentity.duration, launchEntity.duration)) {
        return;
      }
      codeDownloadDuration = launchEntity.duration - firstEntity.duration - scriptentity.duration;
      // 资源下载耗时
      lifeCycle.notify(LifeCycleEventType.APP_UPDATE, {
        startTime: now(),
        name: '小程序包下载',
        type: 'package_download',
        id: UUID(),
        duration: codeDownloadDuration
      });
      // 资源下载时间暂时定为：首次启动时间-脚本加载时间-初次渲染时间
    }
  });
  return {
    stop: subscribe.unsubscribe
  };
}
;// ./src/rumEventsCollection/app/appCollection.js




function startAppCollection(lifeCycle, configuration) {
  lifeCycle.subscribe(LifeCycleEventType.APP_UPDATE, function (appinfo) {
    lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processAppUpdate(appinfo));
  });
  return rewriteApp(configuration, lifeCycle);
}
function processAppUpdate(appinfo) {
  var appEvent = {
    date: appinfo.startTime,
    type: RumEventType.APP,
    app: {
      type: appinfo.type,
      name: appinfo.name,
      id: appinfo.id,
      duration: msToNs(appinfo.duration)
    }
  };
  return {
    rawRumEvent: appEvent,
    startTime: appinfo.startTime
  };
}
;// ./src/rumEventsCollection/performanceCollection.js


function startPagePerformanceObservable(lifeCycle, configuration) {
  if (!!sdk.getPerformance) {
    var performance = sdk.getPerformance();
    var observer = performance.createObserver(entryList => {
      lifeCycle.notify(LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, entryList.getEntries());
    });
    observer.observe({
      entryTypes: ['render', 'script', 'navigation']
    });
  }
}
;// ./src/rumEventsCollection/setDataCollection.js

function startSetDataColloction(lifeCycle) {
  var originPage = Page;
  var originComponent = Component;
  Page = function Page(page) {
    var originPageOnLoad = page['onLoad'];
    page['onLoad'] = function () {
      this.setUpdatePerformanceListener && this.setUpdatePerformanceListener({
        withDataPaths: true
      }, res => {
        lifeCycle.notify(LifeCycleEventType.PAGE_SET_DATA_UPDATE, res);
      });
      return originPageOnLoad && originPageOnLoad.apply(this, arguments);
    };
    return originPage(page);
  };
  Component = function Component(component) {
    var originComponentAttached;
    function handlerOrigin() {
      this.setUpdatePerformanceListener && this.setUpdatePerformanceListener({
        withDataPaths: true
      }, res => {
        lifeCycle.notify(LifeCycleEventType.PAGE_SET_DATA_UPDATE, res);
      });
      return originComponentAttached && originComponentAttached.apply(this, arguments);
    }
    if (component.lifetimes && component.lifetimes['attached']) {
      originComponentAttached = component.lifetimes['attached'];
      component.lifetimes['attached'] = handlerOrigin;
    } else if (component['attached']) {
      // 兼容老版本
      originComponentAttached = component['attached'];
      component['attached'] = handlerOrigin;
    }
    if (component.onLoad) {
      originComponentAttached = component.onLoad;
      component.onLoad = handlerOrigin;
    }
    return originComponent(component);
  };
}
;// ./src/rumEventsCollection/trackPageActiveites.js



// Delay to wait for a page activity to validate the tracking process
var PAGE_ACTIVITY_VALIDATION_DELAY = 100;
// Delay to wait after a page activity to end the tracking process
var PAGE_ACTIVITY_END_DELAY = 100;
// Maximum duration of the tracking process
var PAGE_ACTIVITY_MAX_DURATION = 10000;
function waitIdlePageActivity(lifeCycle, completionCallback) {
  var _trackPageActivities = trackPageActivities(lifeCycle);
  var pageActivitiesObservable = _trackPageActivities.observable;
  var stopPageActivitiesTracking = _trackPageActivities.stop;
  var _waitPageActivitiesCompletion = waitPageActivitiesCompletion(pageActivitiesObservable, stopPageActivitiesTracking, completionCallback);
  var stopWaitPageActivitiesCompletion = _waitPageActivitiesCompletion.stop;
  function stop() {
    stopWaitPageActivitiesCompletion();
    stopPageActivitiesTracking();
  }
  return {
    stop: stop
  };
}

// Automatic action collection lifecycle overview:
//                      (Start new trackPageActivities)
//              .-------------------'--------------------.
//              v                                        v
//     [Wait for a page activity ]          [Wait for a maximum duration]
//     [timeout: VALIDATION_DELAY]          [  timeout: MAX_DURATION    ]
//          /                  \                           |
//         v                    v                          |
//  [No page activity]   [Page activity]                   |
//         |                   |,----------------------.   |
//         v                   v                       |   |
//     (Discard)     [Wait for a page activity]        |   |
//                   [   timeout: END_DELAY   ]        |   |
//                       /                \            |   |
//                      v                  v           |   |
//             [No page activity]    [Page activity]   |   |
//                      |                 |            |   |
//                      |                 '------------'   |
//                      '-----------. ,--------------------'
//                                   v
//                                 (End)
//
// Note: because MAX_DURATION > VALIDATION_DELAY, we are sure that if the process is still alive
// after MAX_DURATION, it has been validated.
function trackPageActivities(lifeCycle) {
  var observable = new Observable();
  var subscriptions = [];
  var firstRequestIndex;
  var pendingRequestsCount = 0;
  subscriptions.push(lifeCycle.subscribe(LifeCycleEventType.PAGE_SET_DATA_UPDATE, function () {
    notifyPageActivity();
  }), lifeCycle.subscribe(LifeCycleEventType.PAGE_ALIAS_ACTION, function () {
    notifyPageActivity();
  }));
  subscriptions.push(lifeCycle.subscribe(LifeCycleEventType.REQUEST_STARTED, function (startEvent) {
    if (firstRequestIndex === undefined) {
      firstRequestIndex = startEvent.requestIndex;
    }
    pendingRequestsCount += 1;
    notifyPageActivity();
  }));
  subscriptions.push(lifeCycle.subscribe(LifeCycleEventType.REQUEST_COMPLETED, function (request) {
    // If the request started before the tracking start, ignore it
    if (firstRequestIndex === undefined || request.requestIndex < firstRequestIndex) {
      return;
    }
    pendingRequestsCount -= 1;
    notifyPageActivity();
  }));
  function notifyPageActivity() {
    observable.notify({
      isBusy: pendingRequestsCount > 0
    });
  }
  return {
    observable: observable,
    stop: function stop() {
      each(subscriptions, function (sub) {
        sub.unsubscribe();
      });
    }
  };
}
function waitPageActivitiesCompletion(pageActivitiesObservable, stopPageActivitiesTracking, completionCallback) {
  //   var idleTimeoutId
  var hasCompleted = false;
  var validationTimeoutId = setTimeout(function () {
    complete({
      hadActivity: false
    });
  }, PAGE_ACTIVITY_VALIDATION_DELAY);
  var maxDurationTimeoutId = setTimeout(function () {
    complete({
      hadActivity: true,
      endTime: now()
    });
  }, PAGE_ACTIVITY_MAX_DURATION);
  pageActivitiesObservable.subscribe(function (data) {
    var isBusy = data.isBusy;
    clearTimeout(validationTimeoutId);
    // clearTimeout(idleTimeoutId)
    var lastChangeTime = now();
    if (!isBusy) {
      //   idleTimeoutId = setTimeout(function () {
      //     complete({ hadActivity: true, endTime: lastChangeTime })
      //   }, PAGE_ACTIVITY_END_DELAY)
      complete({
        hadActivity: true,
        endTime: lastChangeTime
      });
    }
  });
  function stop() {
    hasCompleted = true;
    clearTimeout(validationTimeoutId);
    // clearTimeout(idleTimeoutId)
    clearTimeout(maxDurationTimeoutId);
    stopPageActivitiesTracking();
  }
  function complete(params) {
    if (hasCompleted) {
      return;
    }
    stop();
    completionCallback(params);
  }
  return {
    stop: stop
  };
}
;// ./src/rumEventsCollection/action/trackActions.js


// import { MinaTouch } from '../../core/miniaTouch';


// import { ActionType } from '../../helper/enums';
function trackActions(lifeCycle) {
  var action = startActionManagement(lifeCycle);

  // New views trigger the discard of the current pending Action
  lifeCycle.subscribe(LifeCycleEventType.VIEW_CREATED, function () {
    action.discardCurrent();
  });
  // var hookClick = function hookClick(instance) {
  //   var methods = getMethods(instance);
  //   methods.forEach(methodName => {
  //     clickProxy(instance, methodName, function (_action) {
  //       action.create(_action.type, _action.name);
  //     }, lifeCycle);
  //   });
  // };
  // var originPage = Page;
  // Page = function Page(page) {
  //   try {
  //     hookClick(page);
  //   } catch (error) {}
  //   return originPage(page);
  // };
  // var originComponent = Component;
  // Component = function Component(component) {
  //   try {
  //     hookClick(component.methods);
  //   } catch (error) {}
  //   return originComponent(component);
  // };
  return {
    stop: function stop() {
      action.discardCurrent();
      // stopListener()
    }
  };
}
// function clickProxy(page, methodName, callback, lifeCycle) {
//   var oirginMethod = page[methodName];
//   page[methodName] = function () {
//     for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
//       args[_key] = arguments[_key];
//     }
//     var result = oirginMethod.apply(this, arguments);
//     var action = {};
//     if (isObject(arguments[0])) {
//       var currentTarget = arguments[0].currentTarget || {};
//       var dataset = currentTarget.dataset || {};
//       var actionType = arguments[0].type;
//       if (actionType && ActionType[actionType]) {
//         action.type = actionType;
//         action.name = dataset.name || dataset.content || dataset.type;
//         callback(action);
//         lifeCycle.notify(LifeCycleEventType.PAGE_ALIAS_ACTION, true);
//       } else if (methodName === 'onAddToFavorites') {
//         action.type = 'click';
//         action.name = '收藏 ' + '标题: ' + (result && result.title) + (result.query ? ' query: ' + result.query : '');
//         callback(action);
//         lifeCycle.notify(LifeCycleEventType.PAGE_ALIAS_ACTION, true);
//       } else if (methodName === 'onShareAppMessage') {
//         action.type = 'click';
//         action.name = '转发 ' + '标题: ' + (result && result.title) + (result.path ? ' path: ' + result.path : '');
//         callback(action);
//         lifeCycle.notify(LifeCycleEventType.PAGE_ALIAS_ACTION, true);
//       } else if (methodName === 'onShareTimeline') {
//         action.type = 'click';
//         action.name = '分享到朋友圈 ' + '标题: ' + (result && result.title) + (result.query ? ' query: ' + result.query : '');
//         callback(action);
//         lifeCycle.notify(LifeCycleEventType.PAGE_ALIAS_ACTION, true);
//       } else if (methodName === 'onTabItemTap') {
//         var item = arguments.length && arguments[0];
//         action.type = 'click';
//         action.name = 'tab ' + '名称: ' + item.text + (item.pagePath ? ' 跳转到: ' + item.pagePath : '');
//         callback(action);
//         lifeCycle.notify(LifeCycleEventType.PAGE_ALIAS_ACTION, true);
//       }
//     }
//     return result;
//   };
// }
function startActionManagement(lifeCycle) {
  var currentAction;
  var currentIdlePageActivitySubscription;
  return {
    create: function create(type, name) {
      if (currentAction) {
        // Ignore any new action if another one is already occurring.
        return;
      }
      var pendingAutoAction = new PendingAutoAction(lifeCycle, type, name);
      currentAction = pendingAutoAction;
      currentIdlePageActivitySubscription = waitIdlePageActivity(lifeCycle, function (params) {
        if (params.hadActivity) {
          pendingAutoAction.complete(params.endTime);
        } else {
          pendingAutoAction.discard();
        }
        currentAction = undefined;
      });
    },
    discardCurrent: function discardCurrent() {
      if (currentAction) {
        currentIdlePageActivitySubscription.stop();
        currentAction.discard();
        currentAction = undefined;
      }
    }
  };
}
var PendingAutoAction = function PendingAutoAction(lifeCycle, type, name) {
  this.id = UUID();
  this.startClocks = now();
  this.name = name;
  this.type = type;
  this.lifeCycle = lifeCycle;
  this.eventCountsSubscription = trackEventCounts(lifeCycle);
  this.lifeCycle.notify(LifeCycleEventType.AUTO_ACTION_CREATED, {
    id: this.id,
    startClocks: this.startClocks
  });
};
PendingAutoAction.prototype = {
  complete: function complete(endTime) {
    var eventCounts = this.eventCountsSubscription.eventCounts;
    this.lifeCycle.notify(LifeCycleEventType.AUTO_ACTION_COMPLETED, {
      counts: {
        errorCount: eventCounts.errorCount,
        longTaskCount: eventCounts.longTaskCount,
        resourceCount: eventCounts.resourceCount
      },
      duration: elapsed(this.startClocks, endTime),
      id: this.id,
      name: this.name,
      startClocks: this.startClocks,
      type: this.type
    });
    this.eventCountsSubscription.stop();
  },
  discard: function discard() {
    this.lifeCycle.notify(LifeCycleEventType.AUTO_ACTION_DISCARDED);
    this.eventCountsSubscription.stop();
  }
};
;// ./src/rumEventsCollection/action/actionCollection.js




function startActionCollection(lifeCycle, configuration) {
  lifeCycle.subscribe(LifeCycleEventType.AUTO_ACTION_COMPLETED, function (action) {
    lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processAction(action));
  });
  if (configuration.trackInteractions) {
    trackActions(lifeCycle);
  }
  return {
    addAction: function addAction(action, savedCommonContext) {
      lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, extend2Lev({
        savedCommonContext: savedCommonContext
      }, processAction(action)));
    }
  };
}
function processAction(action) {
  var autoActionProperties = isAutoAction(action) ? {
    action: {
      error: {
        count: action.counts.errorCount
      },
      id: action.id,
      loadingTime: msToNs(action.duration),
      long_task: {
        count: action.counts.longTaskCount
      },
      resource: {
        count: action.counts.resourceCount
      }
    }
  } : {
    action: {
      loadingTime: 0
    }
  };
  var customerContext = !isAutoAction(action) ? action.context : undefined;
  var actionEvent = extend2Lev({
    action: {
      target: {
        name: action.name
      },
      type: action.type
    },
    date: action.startClocks,
    type: RumEventType.ACTION
  }, autoActionProperties);
  return {
    customerContext: customerContext,
    rawRumEvent: actionEvent,
    startTime: action.startClocks
  };
}
function isAutoAction(action) {
  return action.type !== ActionType.custom;
}
;// ./src/rumEventsCollection/internalContext.js
/**
 * Internal context keep returning v1 format
 * to not break compatibility with logs data format
 */
function startInternalContext(applicationId, session, parentContexts) {
  return {
    get: function get(startTime) {
      var viewContext = parentContexts.findView(startTime);
      if (session.isTracked() && viewContext) {
        var actionContext = parentContexts.findAction(startTime);
        return {
          application: {
            id: applicationId
          },
          session: {
            id: session.getSessionId()
          },
          userAction: actionContext ? {
            id: actionContext.userAction.id
          } : undefined,
          page: viewContext.page
        };
      }
    }
  };
}
;// ./src/boot/rum.js








// import { startRequestCollection } from '../rumEventsCollection/requestCollection';







var startRum = function startRum(userConfiguration, getCommonContext) {
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
  // startRequestCollection(lifeCycle, configuration);
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
;// ./src/helper/commonContext.js
function buildCommonContext(globalContextManager, userContextManager) {
  return {
    context: globalContextManager.getContext(),
    user: userContextManager.getContext()
    // hasReplay: recorderApi.isRecording() ? true : undefined,
  };
}
;// ./src/core/boundedBuffer.js

var BUFFER_LIMIT = 500;
var _BoundedBuffer = function _BoundedBuffer() {
  this.buffer = [];
};
_BoundedBuffer.prototype = {
  add: function add(callback) {
    var length = this.buffer.push(callback);
    if (length > BUFFER_LIMIT) {
      this.buffer.splice(0, 1);
    }
  },
  drain: function drain() {
    each(this.buffer, function (callback) {
      callback();
    });
    this.buffer.length = 0;
  }
};
var BoundedBuffer = _BoundedBuffer;
;// ./src/core/heavyCustomerDataWarning.js


// RUM and logs batch bytes limit is 16KB
// ensure that we leave room for other event attributes and maintain a decent amount of event per batch
// (3KB (customer data) + 1KB (other attributes)) * 4 (events per batch) = 16KB
var CUSTOMER_DATA_BYTES_LIMIT = 3 * ONE_KIBI_BYTE;
var CustomerDataType = {
  FeatureFlag: 'feature flag evaluation',
  User: 'user',
  GlobalContext: 'global context',
  LoggerContext: 'logger context'
};
function warnIfCustomerDataLimitReached(bytesCount, customerDataType) {
  if (bytesCount > CUSTOMER_DATA_BYTES_LIMIT) {
    console.warn('The ' + customerDataType + 'data is over ' + CUSTOMER_DATA_BYTES_LIMIT / ONE_KIBI_BYTE + " KiB. On low connectivity, the SDK has the potential to exhaust the user's upload bandwidth.");
    return true;
  }
  return false;
}
;// ./src/core/contextManager.js




var BYTES_COMPUTATION_THROTTLING_DELAY = 200;
function createContextManager(customerDataType, computeBytesCountImpl) {
  if (typeof computeBytesCountImpl === 'undefined') {
    computeBytesCountImpl = computeBytesCount;
  }
  var context = {};
  var bytesCountCache;
  var alreadyWarned = false;

  // Throttle the bytes computation to minimize the impact on performance.
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
;// ./src/core/user.js


/**
 * Clone input data and ensure known user properties (id, name, email)
 * are strings, as defined here:
 * https://docs.datadoghq.com/logs/log_configuration/attributes_naming_convention/#user-related-attributes
 */
function sanitizeUser(newUser) {
  // We shallow clone only to prevent mutation of user data.
  var user = extend({}, newUser);
  var keys = ['id', 'name', 'email'];
  each(keys, function (key) {
    if (key in user) {
      user[key] = String(user[key]);
    }
  });
  return user;
}

/**
 * Simple check to ensure user is valid
 */
function checkUser(newUser) {
  var isValid = getType(newUser) === 'object';
  if (!isValid) {
    console.error('Unsupported user:', newUser);
  }
  return isValid;
}
;// ./src/boot/rum.entry.js









var makeRum = function makeRum(startRumImpl) {
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
var datafluxRum = makeRum(startRum);
defineGlobal(getGlobalObject(), 'DATAFLUX_RUM_MIN', datafluxRum);
;// ./src/index.js

export { datafluxRum };

//# sourceMappingURL=dataflux-rum-miniapp.js.map