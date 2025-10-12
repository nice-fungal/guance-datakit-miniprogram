import { MpHook } from "./enums";
import { jsonStringify } from "../helper/jsonStringify";
var ArrayProto = Array.prototype;
var ObjProto = Object.prototype;
var ObjProto = Object.prototype;
var hasOwnProperty = ObjProto.hasOwnProperty;
var slice = ArrayProto.slice;
var toString = ObjProto.toString;
var nativeForEach = ArrayProto.forEach;
var nativeIsArray = Array.isArray;
var breaker = false;
export var isArguments = function isArguments(obj) {
  return !!(obj && hasOwnProperty.call(obj, "callee"));
};
export var each = function each(obj, iterator, context) {
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
      if (hasOwnProperty.call(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) {
          return false;
        }
      }
    }
  }
};
export var values = function values(obj) {
  var results = [];
  if (obj === null) {
    return results;
  }
  each(obj, function (value) {
    results[results.length] = value;
  });
  return results;
};
export var keys = function keys(obj) {
  var results = [];
  if (obj === null) {
    return results;
  }
  each(obj, function (value, key) {
    results[results.length] = key;
  });
  return results;
};
export var indexOf = function indexOf(arr, target) {
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
export function round(num, decimals) {
  return +num.toFixed(decimals);
}
export function toServerDuration(duration) {
  if (!isNumber(duration)) {
    return duration;
  }
  return round(duration * 1e6, 0);
}
export function msToNs(duration) {
  if (typeof duration !== "number") {
    return duration;
  }
  return round(duration * 1e6, 0);
}
export var isUndefined = function isUndefined(obj) {
  return obj === void 0;
};
export var isString = function isString(obj) {
  return toString.call(obj) === "[object String]";
};
export var isDate = function isDate(obj) {
  return toString.call(obj) === "[object Date]";
};
export var isBoolean = function isBoolean(obj) {
  return toString.call(obj) === "[object Boolean]";
};
export var isNumber = function isNumber(obj) {
  return toString.call(obj) === "[object Number]" && /[\d\.]+/.test(String(obj));
};
export var isFunction = function isFunction(f) {
  if (!f) {
    return false;
  }
  try {
    return /^\s*\bfunction\b/.test(f);
  } catch (err) {
    return false;
  }
};
export var isArray = nativeIsArray || function (obj) {
  return toString.call(obj) === "[object Array]";
};
export var toArray = function toArray(iterable) {
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
export var areInOrder = function areInOrder() {
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
export function UUID(placeholder) {
  return placeholder ?
  // tslint:disable-next-line no-bitwise
  (parseInt(placeholder, 10) ^ Math.random() * 16 >> parseInt(placeholder, 10) / 4).toString(16) : "".concat(1e7, "-", 1e3, "-", 4e3, "-", 8e3, "-", 1e11).replace(/[018]/g, UUID);
}
export var utf8Encode = function utf8Encode(string) {
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
export var base64Encode = function base64Encode(data) {
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
export function elapsed(start, end) {
  return end - start;
}
export function getMethods(obj) {
  var isExcludeMpHook = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var funcs = [];
  for (var key in obj) {
    if (typeof obj[key] === "function" && (!isExcludeMpHook || !MpHook[key])) {
      funcs.push(key);
    }
  }
  return funcs;
}
// 替换url包含数字的路由
export function replaceNumberCharByPath(path) {
  if (path) {
    return path.replace(/\/([^\/]*)\d([^\/]*)/g, "/?");
  } else {
    return "";
  }
}
export function getStatusGroup(status) {
  if (!status) return status;
  return String(status).substr(0, 1) + String(status).substr(1).replace(/\d*/g, "x");
}
export var getQueryParamsFromUrl = function getQueryParamsFromUrl(url) {
  var result = {};
  var arr = url.split("?");
  var queryString = arr[1] || "";
  if (queryString) {
    result = getURLSearchParams("?" + queryString);
  }
  return result;
};
export var getURLSearchParams = function getURLSearchParams(queryString) {
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
export function isPercentage(value) {
  return isNumber(value) && value >= 0 && value <= 100;
}
export var extend = function extend(obj) {
  slice.call(arguments, 1).forEach(function (source) {
    for (var prop in source) {
      if (source[prop] !== void 0) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};
export var extend2Lev = function extend2Lev(obj) {
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
export var trim = function trim(str) {
  return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
};
export var isObject = function isObject(obj) {
  if (obj === null) return false;
  return toString.call(obj) === "[object Object]";
};
export var isEmptyObject = function isEmptyObject(obj) {
  if (isObject(obj)) {
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
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
export var now = function now() {
  return new Date().getTime();
};
export var throttle = function throttle(fn, wait, options) {
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
export function noop() {}
/**
 * Return true if the draw is successful
 * @param threshold between 0 and 100
 */
export function performDraw(threshold) {
  return threshold !== 0 && Math.random() * 100 <= threshold;
}
export function findByPath(source, path) {
  var pathArr = path.split(".");
  while (pathArr.length) {
    var key = pathArr.shift();
    if (source && key in source && hasOwnProperty.call(source, key)) {
      source = source[key];
    } else {
      return undefined;
    }
  }
  return source;
}
export function withSnakeCaseKeys(candidate) {
  var result = {};
  Object.keys(candidate).forEach(key => {
    result[toSnakeCase(key)] = deepSnakeCase(candidate[key]);
  });
  return result;
}
export function deepSnakeCase(candidate) {
  if (Array.isArray(candidate)) {
    return candidate.map(value => deepSnakeCase(value));
  }
  if (typeof candidate === "object" && candidate !== null) {
    return withSnakeCaseKeys(candidate);
  }
  return candidate;
}
export function toSnakeCase(word) {
  return word.replace(/[A-Z]/g, function (uppercaseLetter, index) {
    return (index !== 0 ? "_" : "") + uppercaseLetter.toLowerCase();
  }).replace(/-/g, "_");
}
export function escapeRowData(str) {
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
export function escapeJsonValue(value) {
  if (isString(value)) {
    return value;
  } else {
    return jsonStringify(value);
  }
}
export function escapeFieldValueStr(str) {
  return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}
export function escapeRowField(value) {
  if (typeof value === "object" && value) {
    return escapeFieldValueStr(jsonStringify(value));
  } else if (isString(value)) {
    return escapeFieldValueStr(value);
  } else {
    return value;
  }
}
export var urlParse = function urlParse(para) {
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
export function getActivePage() {
  var curPages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
  if (curPages.length) {
    return curPages[curPages.length - 1];
  }
  return {};
}
export function findCommaSeparatedValue(rawString, name) {
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
export function getType(value) {
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
export function mergeInto(destination, source, circularReferenceChecker) {
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
export function deepClone(value) {
  return mergeInto(undefined, value);
}
export var ONE_SECOND = 1000;
export var ONE_MINUTE = 60 * ONE_SECOND;
export var ONE_HOUR = 60 * ONE_MINUTE;
export function defineGlobal(global, name, api) {
  global[name] = api;
}
export function getGlobalObject() {
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