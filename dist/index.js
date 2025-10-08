var utils_MpHook, ONE_SECOND = 1e3, ONE_MINUTE = 60 * ONE_SECOND, ONE_HOUR = 60 * ONE_MINUTE, ONE_KILO_BYTE = 1024, CLIENT_ID_TOKEN = "datafluxRum:client:id", RumEventType = {
    ACTION: "action",
    ERROR: "error",
    LONG_TASK: "long_task",
    VIEW: "view",
    RESOURCE: "resource",
    APP: "app",
    ACTION: "action",
    LOGGER: "logger"
}, RequestType = {
    XHR: "network",
    DOWNLOAD: "resource"
}, ActionType = {
    tap: "tap",
    longpress: "longpress",
    longtap: "longtap",
    custom: "custom"
}, MpHook = null, TraceType = {
    DDTRACE: "ddtrace",
    ZIPKIN_MULTI_HEADER: "zipkin",
    ZIPKIN_SINGLE_HEADER: "zipkin_single_header",
    W3C_TRACEPARENT: "w3c_traceparent",
    SKYWALKING_V3: "skywalking_v3",
    JAEGER: "jaeger"
}, ErrorHandling = null;

function jsonStringify(value, replacer, space) {
    if ("object" != typeof value || null === value) return JSON.stringify(value);
    var restoreObjectPrototypeToJson = detachToJsonMethod(Object.prototype), restoreArrayPrototypeToJson = detachToJsonMethod(Array.prototype), restoreValuePrototypeToJson = detachToJsonMethod(Object.getPrototypeOf(value)), restoreValueToJson = detachToJsonMethod(value);
    try {
        return JSON.stringify(value, replacer, space);
    } catch (error) {
        return "<error: unable to serialize object>";
    } finally {
        restoreObjectPrototypeToJson(), restoreArrayPrototypeToJson(), restoreValuePrototypeToJson(), 
        restoreValueToJson();
    }
}

function detachToJsonMethod(value) {
    var object = value, objectToJson = object.toJSON;
    return objectToJson ? (delete object.toJSON, () => {
        object.toJSON = objectToJson;
    }) : noop;
}

var ArrayProto = Array.prototype, ObjProto = Object.prototype, utils_hasOwnProperty = (ObjProto = Object.prototype).hasOwnProperty, slice = ArrayProto.slice, utils_toString = ObjProto.toString, nativeForEach = ArrayProto.forEach, nativeIsArray = Array.isArray, breaker = !1, isArguments = function(obj) {
    return !(!obj || !utils_hasOwnProperty.call(obj, "callee"));
}, each = function(obj, iterator, context) {
    if (null === obj) return !1;
    if (nativeForEach && obj.forEach === nativeForEach) obj.forEach(iterator, context); else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return !1;
    } else for (var key in obj) if (utils_hasOwnProperty.call(obj, key) && iterator.call(context, obj[key], key, obj) === breaker) return !1;
}, values = function(obj) {
    var results = [];
    return null === obj || each(obj, (function(value) {
        results[results.length] = value;
    })), results;
}, keys = function(obj) {
    var results = [];
    return null === obj || each(obj, (function(value, key) {
        results[results.length] = key;
    })), results;
}, indexOf = function(arr, target) {
    var indexOf = arr.indexOf;
    if (indexOf) return indexOf.call(arr, target);
    for (var i = 0; i < arr.length; i++) if (target === arr[i]) return i;
    return -1;
};

function round(num, decimals) {
    return +num.toFixed(decimals);
}

function toServerDuration(duration) {
    return isNumber(duration) ? round(1e6 * duration, 0) : duration;
}

function msToNs(duration) {
    return "number" != typeof duration ? duration : round(1e6 * duration, 0);
}

var isUndefined = function(obj) {
    return void 0 === obj;
}, isString = function(obj) {
    return "[object String]" === utils_toString.call(obj);
}, isDate = function(obj) {
    return "[object Date]" === utils_toString.call(obj);
}, isBoolean = function(obj) {
    return "[object Boolean]" === utils_toString.call(obj);
}, isNumber = function(obj) {
    return "[object Number]" === utils_toString.call(obj) && /[\d\.]+/.test(String(obj));
}, isFunction = function(f) {
    if (!f) return !1;
    try {
        return /^\s*\bfunction\b/.test(f);
    } catch (err) {
        return !1;
    }
}, isArray = nativeIsArray || function(obj) {
    return "[object Array]" === utils_toString.call(obj);
}, toArray = function(iterable) {
    return iterable ? iterable.toArray ? iterable.toArray() : Array.isArray(iterable) || isArguments(iterable) ? slice.call(iterable) : values(iterable) : [];
}, areInOrder = function() {
    for (var numbers = toArray(arguments), i = 1; i < numbers.length; i += 1) if (numbers[i - 1] > numbers[i]) return !1;
    return !0;
};

function UUID(placeholder) {
    return placeholder ? (parseInt(placeholder, 10) ^ 16 * Math.random() >> parseInt(placeholder, 10) / 4).toString(16) : "".concat(1e7, "-", 1e3, "-", 4e3, "-", 8e3, "-", 1e11).replace(/[018]/g, UUID);
}

var utf8Encode = function(string) {
    var start, end, stringl, n, utftext = "";
    for (start = end = 0, stringl = (string = (string + "").replace(/\r\n/g, "\n").replace(/\r/g, "\n")).length, 
    n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n), enc = null;
        c1 < 128 ? end++ : enc = c1 > 127 && c1 < 2048 ? String.fromCharCode(c1 >> 6 | 192, 63 & c1 | 128) : String.fromCharCode(c1 >> 12 | 224, c1 >> 6 & 63 | 128, 63 & c1 | 128), 
        null !== enc && (end > start && (utftext += string.substring(start, end)), utftext += enc, 
        start = end = n + 1);
    }
    return end > start && (utftext += string.substring(start, string.length)), utftext;
}, base64Encode = function(data) {
    var h1, h2, h3, h4, bits, b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", i = 0, ac = 0, enc = "", tmp_arr = [];
    if (!(data = String(data))) return data;
    data = utf8Encode(data);
    do {
        h1 = (bits = data.charCodeAt(i++) << 16 | data.charCodeAt(i++) << 8 | data.charCodeAt(i++)) >> 18 & 63, 
        h2 = bits >> 12 & 63, h3 = bits >> 6 & 63, h4 = 63 & bits, tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);
    switch (enc = tmp_arr.join(""), data.length % 3) {
      case 1:
        enc = enc.slice(0, -2) + "==";
        break;

      case 2:
        enc = enc.slice(0, -1) + "=";
    }
    return enc;
};

function hasToJSON(value) {
    return "object" == typeof value && null !== value && value.hasOwnProperty("toJSON");
}

function elapsed(start, end) {
    return end - start;
}

function getMethods(obj) {
    var isExcludeMpHook = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1], funcs = [];
    for (var key in obj) "function" != typeof obj[key] || isExcludeMpHook && utils_MpHook[key] || funcs.push(key);
    return funcs;
}

function replaceNumberCharByPath(path) {
    return path ? path.replace(/\/([^\/]*)\d([^\/]*)/g, "/?") : "";
}

function getStatusGroup(status) {
    return status ? String(status).substr(0, 1) + String(status).substr(1).replace(/\d*/g, "x") : status;
}

var getQueryParamsFromUrl = function(url) {
    var result = {}, queryString = url.split("?")[1] || "";
    return queryString && (result = getURLSearchParams("?" + queryString)), result;
}, getURLSearchParams = function(queryString) {
    for (var decodeParam = function(str) {
        return decodeURIComponent(str);
    }, args = {}, pairs = (queryString = queryString || "").substring(1).split("&"), i = 0; i < pairs.length; i++) {
        var pos = pairs[i].indexOf("=");
        if (-1 !== pos) {
            var name = pairs[i].substring(0, pos), value = pairs[i].substring(pos + 1);
            name = decodeParam(name), value = decodeParam(value), args[name] = value;
        }
    }
    return args;
};

function isPercentage(value) {
    return isNumber(value) && value >= 0 && value <= 100;
}

var extend = function(obj) {
    return slice.call(arguments, 1).forEach((function(source) {
        for (var prop in source) void 0 !== source[prop] && (obj[prop] = source[prop]);
    })), obj;
}, extend2Lev = function(obj) {
    return slice.call(arguments, 1).forEach((function(source) {
        for (var prop in source) void 0 !== source[prop] && (isObject(source[prop]) && isObject(obj[prop]) ? extend(obj[prop], source[prop]) : obj[prop] = source[prop]);
    })), obj;
}, trim = function(str) {
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}, isObject = function(obj) {
    return null !== obj && "[object Object]" === utils_toString.call(obj);
}, isEmptyObject = function(obj) {
    if (isObject(obj)) {
        for (var key in obj) if (utils_hasOwnProperty.call(obj, key)) return !1;
        return !0;
    }
    return !1;
}, now = function() {
    return (new Date).getTime();
}, throttle = function(fn, wait, options) {
    var pendingExecutionWithParameters, pendingTimeoutId, needLeadingExecution = !options || void 0 === options.leading || options.leading, needTrailingExecution = !options || void 0 === options.trailing || options.trailing, inWaitPeriod = !1, context = this;
    return {
        throttled: function() {
            inWaitPeriod ? pendingExecutionWithParameters = arguments : (needLeadingExecution ? fn.apply(context, arguments) : pendingExecutionWithParameters = arguments, 
            inWaitPeriod = !0, pendingTimeoutId = setTimeout((function() {
                needTrailingExecution && pendingExecutionWithParameters && fn.apply(context, pendingExecutionWithParameters), 
                inWaitPeriod = !1, pendingExecutionWithParameters = void 0;
            }), wait));
        },
        cancel: function() {
            clearTimeout(pendingTimeoutId), inWaitPeriod = !1, pendingExecutionWithParameters = void 0;
        }
    };
};

function noop() {}

function performDraw(threshold) {
    return 0 !== threshold && 100 * Math.random() <= threshold;
}

function findByPath(source, path) {
    for (var pathArr = path.split("."); pathArr.length; ) {
        var key = pathArr.shift();
        if (!(source && key in source && utils_hasOwnProperty.call(source, key))) return;
        source = source[key];
    }
    return source;
}

function withSnakeCaseKeys(candidate) {
    var result = {};
    return Object.keys(candidate).forEach((key => {
        result[toSnakeCase(key)] = deepSnakeCase(candidate[key]);
    })), result;
}

function deepSnakeCase(candidate) {
    return Array.isArray(candidate) ? candidate.map((value => deepSnakeCase(value))) : "object" == typeof candidate && null !== candidate ? withSnakeCaseKeys(candidate) : candidate;
}

function toSnakeCase(word) {
    return word.replace(/[A-Z]/g, (function(uppercaseLetter, index) {
        return (0 !== index ? "_" : "") + uppercaseLetter.toLowerCase();
    })).replace(/-/g, "_");
}

function escapeRowData(str) {
    if ("object" == typeof str && str) str = jsonStringify(str); else if (!isString(str)) return str;
    return String(str).replace(/[\s=,"]/g, (function(word) {
        return "\\" + word;
    }));
}

function escapeJsonValue(value) {
    return isString(value) ? value : jsonStringify(value);
}

function escapeFieldValueStr(str) {
    return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}

function escapeRowField(value) {
    return "object" == typeof value && value ? escapeFieldValueStr(jsonStringify(value)) : isString(value) ? escapeFieldValueStr(value) : value;
}

var urlParse = function(para) {
    var URLParser = function(a) {
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
        }, this._values = {}, this._regex = null, this._regex = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/, 
        void 0 !== a && this._parse(a);
    };
    return URLParser.prototype.setUrl = function(a) {
        this._parse(a);
    }, URLParser.prototype._initValues = function() {
        for (var a in this._fields) this._values[a] = "";
    }, URLParser.prototype.addQueryString = function(queryObj) {
        if ("object" != typeof queryObj) return !1;
        var query = this._values.QueryString || "";
        for (var i in queryObj) query = new RegExp(i + "[^&]+").test(query) ? query.replace(new RegExp(i + "[^&]+"), i + "=" + queryObj[i]) : "&" === query.slice(-1) ? query + i + "=" + queryObj[i] : "" === query ? i + "=" + queryObj[i] : query + "&" + i + "=" + queryObj[i];
        this._values.QueryString = query;
    }, URLParser.prototype.getParse = function() {
        return this._values;
    }, URLParser.prototype.getUrl = function() {
        var url = "";
        return url += this._values.Origin, url += this._values.Path, url += this._values.QueryString ? "?" + this._values.QueryString : "";
    }, URLParser.prototype._parse = function(a) {
        this._initValues();
        var b = this._regex.exec(a);
        if (!b) throw "DPURLParser::_parse -> Invalid URL";
        for (var c in this._fields) void 0 !== b[this._fields[c]] && (this._values[c] = b[this._fields[c]]);
        this._values.Path = this._values.Path || "/", this._values.Hostname = this._values.Host.replace(/:\d+$/, ""), 
        this._values.Origin = this._values.Protocol + "://" + this._values.Hostname + (this._values.Port ? ":" + this._values.Port : "");
    }, new URLParser(para);
};

function getActivePage() {
    var curPages = "function" == typeof getCurrentPages ? getCurrentPages() : [];
    return curPages.length ? curPages[curPages.length - 1] : {};
}

function findCommaSeparatedValue(rawString, name) {
    var matches = rawString.match("(?:^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
    return matches ? matches[1] : void 0;
}

function createCircularReferenceChecker() {
    if ("undefined" != typeof WeakSet) {
        var set = new WeakSet;
        return {
            hasAlreadyBeenSeen: function(value) {
                var has = set.has(value);
                return has || set.add(value), has;
            }
        };
    }
    var array = [];
    return {
        hasAlreadyBeenSeen: function(value) {
            var has = array.indexOf(value) >= 0;
            return has || array.push(value), has;
        }
    };
}

function getType(value) {
    return null === value ? "null" : Array.isArray(value) ? "array" : typeof value;
}

function mergeInto(destination, source, circularReferenceChecker) {
    if (void 0 === circularReferenceChecker && (circularReferenceChecker = createCircularReferenceChecker()), 
    void 0 === source) return destination;
    if ("object" != typeof source || null === source) return source;
    if (source instanceof Date) return new Date(source.getTime());
    if (source instanceof RegExp) {
        var flags = source.flags || [ source.global ? "g" : "", source.ignoreCase ? "i" : "", source.multiline ? "m" : "", source.sticky ? "y" : "", source.unicode ? "u" : "" ].join("");
        return new RegExp(source.source, flags);
    }
    if (!circularReferenceChecker.hasAlreadyBeenSeen(source)) {
        if (Array.isArray(source)) {
            for (var merged = Array.isArray(destination) ? destination : [], i = 0; i < source.length; ++i) merged[i] = mergeInto(merged[i], source[i], circularReferenceChecker);
            return merged;
        }
        merged = "object" === getType(destination) ? destination : {};
        for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (merged[key] = mergeInto(merged[key], source[key], circularReferenceChecker));
        return merged;
    }
}

function deepClone(value) {
    return mergeInto(void 0, value);
}

var utils_ONE_SECOND = 1e3, utils_ONE_MINUTE = 60 * utils_ONE_SECOND, utils_ONE_HOUR = 60 * utils_ONE_MINUTE;

function defineGlobal(global, name, api) {
    global[name] = api;
}

function getGlobalObject() {
    if ("object" == typeof globalThis) return globalThis;
    Object.defineProperty(Object.prototype, "_dd_temp_", {
        get: function() {
            return this;
        },
        configurable: !0
    });
    var globalObject = _dd_temp_;
    return delete Object.prototype._dd_temp_, "object" != typeof globalObject && (globalObject = "object" == typeof self ? self : "object" == typeof window ? window : {}), 
    globalObject;
}

var buildEnv = {
    sdkVersion: "2.2.10",
    sdkName: "df_miniapp_rum_sdk"
};

class LifeCycle {
    constructor() {
        this.callbacks = {};
    }
    notify(eventType, data) {
        var eventCallbacks = this.callbacks[eventType];
        eventCallbacks && eventCallbacks.forEach((callback => callback(data)));
    }
    subscribe(eventType, callback) {
        return this.callbacks[eventType] || (this.callbacks[eventType] = []), this.callbacks[eventType].push(callback), 
        {
            unsubscribe: () => {
                this.callbacks[eventType] = this.callbacks[eventType].filter((other => callback !== other));
            }
        };
    }
}

var LifeCycleEventType = {
    PERFORMANCE_ENTRY_COLLECTED: "PERFORMANCE_ENTRY_COLLECTED",
    AUTO_ACTION_CREATED: "AUTO_ACTION_CREATED",
    AUTO_ACTION_COMPLETED: "AUTO_ACTION_COMPLETED",
    AUTO_ACTION_DISCARDED: "AUTO_ACTION_DISCARDED",
    APP_HIDE: "APP_HIDE",
    APP_UPDATE: "APP_UPDATE",
    PAGE_SET_DATA_UPDATE: "PAGE_SET_DATA_UPDATE",
    PAGE_ALIAS_ACTION: "PAGE_ALIAS_ACTION",
    VIEW_CREATED: "VIEW_CREATED",
    VIEW_UPDATED: "VIEW_UPDATED",
    VIEW_ENDED: "VIEW_ENDED",
    REQUEST_STARTED: "REQUEST_STARTED",
    REQUEST_COMPLETED: "REQUEST_COMPLETED",
    RAW_RUM_EVENT_COLLECTED: "RAW_RUM_EVENT_COLLECTED",
    RAW_ERROR_COLLECTED: "RAW_ERROR_COLLECTED",
    RUM_EVENT_COLLECTED: "RUM_EVENT_COLLECTED"
};

function catchUserErrors(fn, errorMsg) {
    return function() {
        var args = [].slice.call(arguments);
        try {
            return fn.apply(this, args);
        } catch (err) {
            console.error(errorMsg, err);
        }
    };
}

var TRIM_REGIX = /^\s+|\s+$/g, DEFAULT_CONFIGURATION = {
    sampleRate: 100,
    flushTimeout: 30 * ONE_SECOND,
    maxErrorsByMinute: 3e3,
    maxBatchSize: 50,
    maxMessageSize: 256 * ONE_KILO_BYTE,
    batchBytesLimit: 16 * ONE_KILO_BYTE,
    datakitUrl: "",
    requestErrorResponseLengthLimit: 32 * ONE_KILO_BYTE,
    trackInteractions: !1,
    traceType: TraceType.DDTRACE,
    traceId128Bit: !1,
    allowedTracingOrigins: [],
    isIntakeUrl: function(url) {
        return !1;
    }
};

function configuration_trim(str) {
    return str.replace(TRIM_REGIX, "");
}

function getDatakitEndPoint(configuration) {
    var url = configuration.datakitOrigin || configuration.datakitUrl || configuration.site, endpoint = url;
    return endpoint = url && url.lastIndexOf("/") === url.length - 1 ? configuration_trim(url) + "v1/write/rum" : configuration_trim(url) + "/v1/write/rum", 
    configuration.site && configuration.clientToken && (endpoint = endpoint + "?token=" + configuration.clientToken + "&to_headless=true"), 
    endpoint;
}

function commonInit(userConfiguration, buildEnv) {
    var transportConfiguration = {
        applicationId: userConfiguration.applicationId,
        env: userConfiguration.env || "",
        version: userConfiguration.version || "",
        sdkVersion: buildEnv.sdkVersion,
        sdkName: buildEnv.sdkName,
        service: userConfiguration.service || "miniapp",
        datakitUrl: getDatakitEndPoint(userConfiguration),
        tags: userConfiguration.tags || [],
        injectTraceHeader: userConfiguration.injectTraceHeader && catchUserErrors(userConfiguration.injectTraceHeader, "injectTraceHeader threw an error:"),
        generateTraceId: userConfiguration.generateTraceId && catchUserErrors(userConfiguration.generateTraceId, "generateTraceId threw an error:")
    };
    return "trackInteractions" in userConfiguration && (transportConfiguration.trackInteractions = !!userConfiguration.trackInteractions), 
    "allowedTracingOrigins" in userConfiguration && (transportConfiguration.allowedTracingOrigins = userConfiguration.allowedTracingOrigins), 
    "traceId128Bit" in userConfiguration && (transportConfiguration.traceId128Bit = !!userConfiguration.traceId128Bit), 
    "traceType" in userConfiguration && hasTraceType(userConfiguration.traceType) && (transportConfiguration.traceType = userConfiguration.traceType), 
    "sampleRate" in userConfiguration && (transportConfiguration.sampleRate = userConfiguration.sampleRate), 
    "isIntakeUrl" in userConfiguration && isFunction(userConfiguration.isIntakeUrl) && isBoolean(userConfiguration.isIntakeUrl()) && (transportConfiguration.isIntakeUrl = userConfiguration.isIntakeUrl), 
    extend2Lev(DEFAULT_CONFIGURATION, transportConfiguration);
}

function hasTraceType(traceType) {
    return !!(traceType && values(TraceType).indexOf(traceType) > -1);
}

function isIntakeRequest(url, configuration) {
    return 0 === url.indexOf(configuration.datakitUrl) || configuration.isIntakeUrl(url);
}

var ErrorSource = {
    AGENT: "agent",
    CONSOLE: "console",
    NETWORK: "network",
    SOURCE: "source",
    LOGGER: "logger",
    CUSTOM: "custom"
};

function formatUnknownError(stackTrace, errorObject, nonErrorPrefix) {
    return stackTrace && (void 0 !== stackTrace.message || errorObject instanceof Error) ? {
        message: stackTrace.message || "Empty message",
        stack: toStackTraceString(stackTrace),
        type: stackTrace.name
    } : {
        message: nonErrorPrefix + "" + JSON.stringify(errorObject),
        stack: "No stack, consider using an instance of Error",
        type: stackTrace && stackTrace.name
    };
}

function toStackTraceString(stack) {
    var result = stack.name || "Error: " + stack.message;
    return isArray(stack.stack) && stack.stack.forEach((function(frame) {
        var func = "?" === frame.func ? "<anonymous>" : frame.func, args = frame.args && frame.args.length > 0 ? "(" + frame.args.join(", ") + ")" : "", line = frame.line ? ":" + frame.line : "", column = frame.line && frame.column ? ":" + frame.column : "";
        result += "\n  at " + func + args + " @ " + frame.url + line + column;
    })), result;
}

function getSDK() {
    var sdk = null, tracker = "";
    try {
        if ("object" == typeof wx && "function" == typeof wx.request) sdk = wx, tracker = "wx"; else if ("object" == typeof my && "function" == typeof my.request) sdk = my, 
        tracker = "my"; else if ("object" == typeof tt && "function" == typeof tt.request) sdk = tt, 
        tracker = "tt"; else if ("object" == typeof dd && "function" == typeof dd.httpRequest) sdk = dd, 
        tracker = "dd"; else if ("object" == typeof qq && "function" == typeof qq.request) sdk = qq, 
        tracker = "qq"; else {
            if ("object" != typeof swan || "function" != typeof swan.request) throw new Error("guance miniapp 暂不支持此平台");
            sdk = swan, tracker = "swan";
        }
    } catch (err) {
        console.warn("unsupport platform, Fail to start");
    }
    return {
        sdk: sdk,
        tracker: tracker
    };
}

var instance = getSDK(), sdk = instance.sdk, tracker = instance.tracker, getStorageSync = key => {
    if ("my" === tracker) {
        var res = sdk.getStorageSync({
            key: key
        });
        return res && res.data;
    }
    return sdk.getStorageSync(key);
}, setStorageSync = (key, data) => {
    "my" === tracker ? sdk.setStorageSync({
        key: key,
        data: data
    }) : sdk.setStorageSync(key, data);
}, UNKNOWN_FUNCTION = "?";

function has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

function tracekit_isUndefined(what) {
    return void 0 === what;
}

var xhrProxySingleton, report = function() {
    var onErrorHandlerInstalled, onUnhandledRejectionHandlerInstalled, onPageNotFoundHandlerInstalled, onMemoryWarningHandlerInstalled, onLazyLoadErrorHandlerInstalled, handlers = [];
    function notifyHandlers(stack, isWindowError, error) {
        var exception;
        for (var i in handlers) if (has(handlers, i)) try {
            handlers[i](stack, isWindowError, error);
        } catch (inner) {
            exception = inner;
        }
        if (exception) throw exception;
    }
    function traceKitWindowOnError(err) {
        var stack, error = "string" == typeof err ? new Error(err) : err, name = "", msg = "";
        if (stack = computeStackTrace(error), error && error.message && "[object String]" === {}.toString.call(error.message)) {
            var messages = error.message.split("\n");
            if (messages.length >= 3) {
                var groups = (msg = messages[2]).match(ERROR_TYPES_RE);
                groups && (name = groups[1], msg = groups[2]);
            }
        }
        msg && (stack.message = msg), name && (stack.name = name), notifyHandlers(stack, !0, error);
    }
    function traceKitWindowOnUnhandledRejection(_ref) {
        var stack, {reason: reason, promise: promise} = _ref, error = "string" == typeof reason ? new Error(reason) : reason, name = "", msg = "";
        if (stack = computeStackTrace(error), error && error.message && "[object String]" === {}.toString.call(error.message)) {
            var messages = error.message.split("\n");
            if (messages.length >= 3) {
                var groups = (msg = messages[2]).match(ERROR_TYPES_RE);
                groups && (name = groups[1], msg = groups[2]);
            }
        }
        msg && (stack.message = msg), name && (stack.name = name), notifyHandlers(stack, !0, error);
    }
    function doReport(ex) {}
    return doReport.subscribe = function(handler) {
        !function() {
            if (onErrorHandlerInstalled || !sdk.onError) return;
            sdk.onError(traceKitWindowOnError), onErrorHandlerInstalled = !0;
        }(), function() {
            if (onUnhandledRejectionHandlerInstalled || !sdk.onUnhandledRejection) return;
            sdk.onUnhandledRejection && sdk.onUnhandledRejection(traceKitWindowOnUnhandledRejection), 
            onUnhandledRejectionHandlerInstalled = !0;
        }(), function() {
            if (onPageNotFoundHandlerInstalled || !sdk.onPageNotFound) return;
            sdk.onPageNotFound((res => {
                var url = res.path.split("?")[0];
                notifyHandlers({
                    message: JSON.stringify(res),
                    type: "pagenotfound",
                    name: url + "页面无法找到"
                }, !0, {});
            })), onPageNotFoundHandlerInstalled = !0;
        }(), function() {
            if (onMemoryWarningHandlerInstalled || !sdk.onMemoryWarning) return;
            sdk.onMemoryWarning((_ref2 => {
                var {level: level = -1} = _ref2, levelMessage = "没有获取到告警级别信息";
                switch (level) {
                  case 5:
                    levelMessage = "TRIM_MEMORY_RUNNING_MODERATE";
                    break;

                  case 10:
                    levelMessage = "TRIM_MEMORY_RUNNING_LOW";
                    break;

                  case 15:
                    levelMessage = "TRIM_MEMORY_RUNNING_CRITICAL";
                    break;

                  default:
                    return;
                }
                notifyHandlers({
                    message: levelMessage,
                    type: "memorywarning",
                    name: "内存不足告警"
                }, !0, {});
            })), onMemoryWarningHandlerInstalled = !0;
        }(), function() {
            if (onLazyLoadErrorHandlerInstalled || !sdk.onLazyLoadError) return;
            sdk.onLazyLoadError((res => {
                var subpackage = res.subpackage || [];
                notifyHandlers({
                    message: res.errMsg || "",
                    type: "lazyloaderror",
                    name: subpackage.join(",") + "load error"
                }, !0, {});
            })), onLazyLoadErrorHandlerInstalled = !0;
        }(), handlers.push(handler);
    }, doReport.unsubscribe = function(handler) {
        for (var i = handlers.length - 1; i >= 0; i -= 1) handlers[i] === handler && handlers.splice(i, 1);
    }, doReport.traceKitWindowOnError = traceKitWindowOnError, doReport;
}(), computeStackTrace = function() {
    function computeStackTraceFromStackProp(ex) {
        if (ex.stack) {
            for (var isEval, submatch, parts, element, chrome = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i, winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i, geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/, lines = ex.stack.split("\n"), stack = [], i = 0, j = lines.length; i < j; i += 1) {
                if (chrome.exec(lines[i])) {
                    var isNative = (parts = chrome.exec(lines[i]))[2] && 0 === parts[2].indexOf("native");
                    isEval = parts[2] && 0 === parts[2].indexOf("eval"), submatch = chromeEval.exec(parts[2]), 
                    isEval && submatch && (parts[2] = submatch[1], parts[3] = submatch[2], parts[4] = submatch[3]), 
                    element = {
                        args: isNative ? [ parts[2] ] : [],
                        column: parts[4] ? +parts[4] : void 0,
                        func: parts[1] || UNKNOWN_FUNCTION,
                        line: parts[3] ? +parts[3] : void 0,
                        url: isNative ? void 0 : parts[2]
                    };
                } else if (winjs.exec(lines[i])) element = {
                    args: [],
                    column: (parts = winjs.exec(lines[i]))[4] ? +parts[4] : void 0,
                    func: parts[1] || UNKNOWN_FUNCTION,
                    line: +parts[3],
                    url: parts[2]
                }; else {
                    if (!gecko.exec(lines[i])) continue;
                    isEval = (parts = gecko.exec(lines[i]))[3] && parts[3].indexOf(" > eval") > -1, 
                    submatch = geckoEval.exec(parts[3]), isEval && submatch ? (parts[3] = submatch[1], 
                    parts[4] = submatch[2], parts[5] = void 0) : 0 !== i || parts[5] || tracekit_isUndefined(ex.columnNumber) || (stack[0].column = ex.columnNumber + 1), 
                    element = {
                        args: parts[2] ? parts[2].split(",") : [],
                        column: parts[5] ? +parts[5] : void 0,
                        func: parts[1] || UNKNOWN_FUNCTION,
                        line: parts[4] ? +parts[4] : void 0,
                        url: parts[3]
                    };
                }
                !element.func && element.line && (element.func = UNKNOWN_FUNCTION), stack.push(element);
            }
            if (stack.length) return {
                stack: stack,
                message: extractMessage(ex),
                name: ex.name
            };
        }
    }
    function augmentStackTraceWithInitialElement(stackInfo, url, lineNo, message) {
        var initial = {
            url: url,
            line: lineNo ? +lineNo : void 0
        };
        if (initial.url && initial.line) {
            stackInfo.incompvare = !1;
            var stack = stackInfo.stack;
            if (stack.length > 0 && stack[0].url === initial.url) {
                if (stack[0].line === initial.line) return !1;
                if (!stack[0].line && stack[0].func === initial.func) return stack[0].line = initial.line, 
                stack[0].context = initial.context, !1;
            }
            return stack.unshift(initial), stackInfo.partial = !0, !0;
        }
        return stackInfo.incompvare = !0, !1;
    }
    function computeStackTraceByWalkingCallerChain(ex, depth) {
        for (var parts, item, functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i, stack = [], funcs = {}, recursion = !1, curr = computeStackTraceByWalkingCallerChain.caller; curr && !recursion; curr = curr.caller) curr !== computeStackTrace && curr !== report && (item = {
            args: [],
            column: void 0,
            func: UNKNOWN_FUNCTION,
            line: void 0,
            url: void 0
        }, parts = functionName.exec(curr.toString()), curr.name ? item.func = curr.name : parts && (item.func = parts[1]), 
        void 0 === item.func && (item.func = parts ? parts.input.substring(0, parts.input.indexOf("{")) : void 0), 
        funcs[curr + ""] ? recursion = !0 : funcs[curr + ""] = !0, stack.push(item));
        depth && stack.splice(0, depth);
        var result = {
            stack: stack,
            message: ex.message,
            name: ex.name
        };
        return augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description), 
        result;
    }
    function doComputeStackTrace(ex, depth) {
        var stack, normalizedDepth = void 0 === depth ? 0 : +depth;
        try {
            if (stack = function(ex) {
                var stacktrace = ex.stacktrace;
                if (stacktrace) {
                    for (var parts, opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i, opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\))? in (.*):\s*$/i, lines = stacktrace.split("\n"), stack = [], line = 0; line < lines.length; line += 2) {
                        var element;
                        opera10Regex.exec(lines[line]) ? element = {
                            args: [],
                            column: void 0,
                            func: (parts = opera10Regex.exec(lines[line]))[3],
                            line: +parts[1],
                            url: parts[2]
                        } : opera11Regex.exec(lines[line]) && (element = {
                            args: (parts = opera11Regex.exec(lines[line]))[5] ? parts[5].split(",") : [],
                            column: +parts[2],
                            func: parts[3] || parts[4],
                            line: +parts[1],
                            url: parts[6]
                        }), element && (!element.func && element.line && (element.func = UNKNOWN_FUNCTION), 
                        element.context = [ lines[line + 1] ], stack.push(element));
                    }
                    if (stack.length) return {
                        stack: stack,
                        message: extractMessage(ex),
                        name: ex.name
                    };
                }
            }(ex)) return stack;
        } catch (e) {
            false;
        }
        try {
            if (stack = computeStackTraceFromStackProp(ex)) return stack;
        } catch (e) {
            false;
        }
        try {
            if (stack = function(ex) {
                var lines = ex.message.split("\n");
                if (!(lines.length < 4)) {
                    var parts, lineRE1 = /^\s*Line (\d+) of linked script ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i, lineRE2 = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i, lineRE3 = /^\s*Line (\d+) of function script\s*$/i, stack = [], scripts = window && window.document && window.document.getElementsByTagName("script"), inlineScriptBlocks = [];
                    for (var s in scripts) has(scripts, s) && !scripts[s].src && inlineScriptBlocks.push(scripts[s]);
                    for (var line = 2; line < lines.length; line += 2) {
                        var item;
                        lineRE1.exec(lines[line]) ? item = {
                            args: [],
                            column: void 0,
                            func: (parts = lineRE1.exec(lines[line]))[3],
                            line: +parts[1],
                            url: parts[2]
                        } : lineRE2.exec(lines[line]) ? item = {
                            args: [],
                            column: void 0,
                            func: (parts = lineRE2.exec(lines[line]))[4],
                            line: +parts[1],
                            url: parts[3]
                        } : lineRE3.exec(lines[line]) && (parts = lineRE3.exec(lines[line]), item = {
                            url: window.location.href.replace(/#.*$/, ""),
                            args: [],
                            column: void 0,
                            func: "",
                            line: +parts[1]
                        }), item && (item.func || (item.func = UNKNOWN_FUNCTION), item.context = [ lines[line + 1] ], 
                        stack.push(item));
                    }
                    if (stack.length) return {
                        stack: stack,
                        message: lines[0],
                        name: ex.name
                    };
                }
            }(ex)) return stack;
        } catch (e) {
            false;
        }
        try {
            if (stack = computeStackTraceByWalkingCallerChain(ex, normalizedDepth + 1)) return stack;
        } catch (e) {
            false;
        }
        return {
            message: extractMessage(ex),
            name: ex.name,
            stack: []
        };
    }
    return doComputeStackTrace.augmentStackTraceWithInitialElement = augmentStackTraceWithInitialElement, 
    doComputeStackTrace.computeStackTraceFromStackProp = computeStackTraceFromStackProp, 
    doComputeStackTrace.ofCaller = function(depth) {
        var currentDepth = 1 + (void 0 === depth ? 0 : +depth);
        try {
            throw new Error;
        } catch (ex) {
            return computeStackTrace(ex, currentDepth + 1);
        }
    }, doComputeStackTrace;
}(), ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;

function extractMessage(ex) {
    var message = ex && ex.message;
    return message ? message.error && "string" == typeof message.error.message ? message.error.message : message : "No error message";
}

class Observable {
    constructor() {
        this.observers = [];
    }
    subscribe(f) {
        this.observers.push(f);
    }
    notify(data) {
        this.observers.forEach((function(observer) {
            observer(data);
        }));
    }
}

var originalXhrRequest, originalXhrHttpRequest, downloadProxySingleton, beforeSendCallbacks = [], onRequestCompleteCallbacks = [];

function startXhrProxy() {
    return xhrProxySingleton || (proxyXhr(), proxyHttpXhr(), xhrProxySingleton = {
        beforeSend: function(callback) {
            beforeSendCallbacks.push(callback);
        },
        onRequestComplete: function(callback) {
            onRequestCompleteCallbacks.push(callback);
        }
    }), xhrProxySingleton;
}

function resetXhrProxy() {
    xhrProxySingleton && (xhrProxySingleton = void 0, beforeSendCallbacks.splice(0, beforeSendCallbacks.length), 
    onRequestCompleteCallbacks.splice(0, onRequestCompleteCallbacks.length), "function" == typeof sdk.request ? Object.defineProperties(sdk, {
        request: {
            value: originalXhrRequest
        }
    }) : "function" == typeof sdk.httpRequest && Object.defineProperties(sdk, {
        httpRequest: {
            value: originalXhrHttpRequest
        }
    }));
}

function proxyHttpXhr() {
    if ("function" == typeof sdk.httpRequest) {
        originalXhrHttpRequest = sdk.httpRequest;
        Object.defineProperties(sdk, {
            httpRequest: {
                value: function() {
                    var _this = this, dataflux_xhr = {
                        method: arguments[0].method || "GET",
                        startTime: 0,
                        url: arguments[0].url,
                        type: RequestType.XHR,
                        responseType: arguments[0].responseType || "text",
                        option: arguments[0]
                    };
                    dataflux_xhr.startTime = now();
                    var originalSuccess = arguments[0].success;
                    arguments[0].success = function() {
                        reportXhr(arguments[0]), originalSuccess && originalSuccess.apply(_this, arguments);
                    };
                    var originalFail = arguments[0].fail;
                    arguments[0].fail = function() {
                        reportXhr(arguments[0]), originalFail && originalFail.apply(_this, arguments);
                    };
                    var hasBeenReported = !1, reportXhr = function(res) {
                        hasBeenReported || (hasBeenReported = !0, dataflux_xhr.duration = now() - dataflux_xhr.startTime, 
                        dataflux_xhr.response = JSON.stringify(res.data), dataflux_xhr.header = res.header || {}, 
                        dataflux_xhr.headers = res.headers || {}, dataflux_xhr.profile = res.profile, dataflux_xhr.status = res.statusCode || res.status || 0, 
                        onRequestCompleteCallbacks.forEach((function(callback) {
                            callback(dataflux_xhr);
                        })));
                    };
                    return beforeSendCallbacks.forEach((function(callback) {
                        callback(dataflux_xhr);
                    })), originalXhrHttpRequest.call(this, dataflux_xhr.option);
                }
            }
        });
    }
}

function proxyXhr() {
    if ("function" == typeof sdk.request) {
        originalXhrRequest = sdk.request;
        Object.defineProperties(sdk, {
            request: {
                value: function() {
                    var _this = this, dataflux_xhr = {
                        method: arguments[0].method || "GET",
                        startTime: 0,
                        url: arguments[0].url,
                        type: RequestType.XHR,
                        responseType: arguments[0].responseType || "text",
                        option: arguments[0]
                    };
                    dataflux_xhr.startTime = now();
                    var originalSuccess = arguments[0].success;
                    arguments[0].success = function() {
                        reportXhr(arguments[0]), originalSuccess && originalSuccess.apply(_this, arguments);
                    };
                    var originalFail = arguments[0].fail;
                    arguments[0].fail = function() {
                        reportXhr(arguments[0]), originalFail && originalFail.apply(_this, arguments);
                    };
                    var hasBeenReported = !1, reportXhr = function(res) {
                        hasBeenReported || (hasBeenReported = !0, dataflux_xhr.duration = now() - dataflux_xhr.startTime, 
                        dataflux_xhr.response = JSON.stringify(res.data), dataflux_xhr.header = res.header || {}, 
                        dataflux_xhr.headers = res.headers || {}, dataflux_xhr.profile = res.profile, dataflux_xhr.status = res.statusCode || res.status || 0, 
                        onRequestCompleteCallbacks.forEach((function(callback) {
                            callback(dataflux_xhr);
                        })));
                    };
                    return beforeSendCallbacks.forEach((function(callback) {
                        callback(dataflux_xhr);
                    })), originalXhrRequest.call(this, dataflux_xhr.option);
                }
            }
        });
    }
}

var originalDownloadRequest, errorCollection_now, errorCollection_ONE_MINUTE, errorCollection_ErrorSource, errorCollection_report, errorCollection_Observable, originalConsoleError, traceKitReportHandler, errorObservable, downloadProxy_beforeSendCallbacks = [], downloadProxy_onRequestCompleteCallbacks = [];

function startDownloadProxy() {
    return downloadProxySingleton || (proxyDownload(), downloadProxySingleton = {
        beforeSend: function(callback) {
            downloadProxy_beforeSendCallbacks.push(callback);
        },
        onRequestComplete: function(callback) {
            downloadProxy_onRequestCompleteCallbacks.push(callback);
        }
    }), downloadProxySingleton;
}

function resetDownloadProxy() {
    downloadProxySingleton && (downloadProxySingleton = void 0, downloadProxy_beforeSendCallbacks.splice(0, downloadProxy_beforeSendCallbacks.length), 
    downloadProxy_onRequestCompleteCallbacks.splice(0, downloadProxy_onRequestCompleteCallbacks.length), 
    Object.defineProperties(sdk, {
        downloadFile: {
            value: originalDownloadRequest
        }
    }));
}

function proxyDownload() {
    originalDownloadRequest = sdk.downloadFile;
    "function" == typeof sdk.downloadFile && Object.defineProperties(sdk, {
        downloadFile: {
            value: function() {
                var _this = this, dataflux_xhr = {
                    method: "GET",
                    startTime: 0,
                    url: arguments[0].url,
                    type: RequestType.DOWNLOAD,
                    responseType: "file"
                };
                dataflux_xhr.startTime = now();
                var originalSuccess = arguments[0].success;
                arguments[0].success = function() {
                    reportXhr(arguments[0]), originalSuccess && originalSuccess.apply(_this, arguments);
                };
                var originalFail = arguments[0].fail;
                arguments[0].fail = function() {
                    reportXhr(arguments[0]), originalFail && originalFail.apply(_this, arguments);
                };
                var hasBeenReported = !1, reportXhr = function(res) {
                    hasBeenReported || (hasBeenReported = !0, dataflux_xhr.duration = now() - dataflux_xhr.startTime, 
                    dataflux_xhr.response = JSON.stringify({
                        filePath: res.filePath,
                        tempFilePath: res.tempFilePath
                    }), dataflux_xhr.header = res.header || {}, dataflux_xhr.headers = res.headers || {}, 
                    dataflux_xhr.profile = res.profile, dataflux_xhr.status = res.statusCode || res.status || 0, 
                    downloadProxy_onRequestCompleteCallbacks.forEach((function(callback) {
                        callback(dataflux_xhr);
                    })));
                };
                return downloadProxy_beforeSendCallbacks.forEach((function(callback) {
                    callback(dataflux_xhr);
                })), originalDownloadRequest.apply(this, arguments);
            }
        }
    });
}

function startConsoleTracking(errorObservable) {
    originalConsoleError = console.error, console.error = function() {
        originalConsoleError.apply(console, arguments);
        var args = toArray(arguments), message = [];
        args.concat([ "console error:" ]).forEach((function(para) {
            message.push(formatConsoleParameters(para));
        })), errorObservable.notify({
            message: message.join(" "),
            source: ErrorSource.CONSOLE,
            startTime: now()
        });
    };
}

function stopConsoleTracking() {
    console.error = originalConsoleError;
}

function formatConsoleParameters(param) {
    return "string" == typeof param ? param : param instanceof Error ? toStackTraceString(computeStackTrace(param)) : JSON.stringify(param, void 0, 2);
}

function filterErrors(configuration, errorObservable) {
    var errorCount = 0, filteredErrorObservable = new errorCollection_Observable;
    return errorObservable.subscribe((function(error) {
        errorCount < configuration.maxErrorsByMinute ? (errorCount += 1, filteredErrorObservable.notify(error)) : errorCount === configuration.maxErrorsByMinute && (errorCount += 1, 
        filteredErrorObservable.notify({
            message: "Reached max number of errors by minute: " + configuration.maxErrorsByMinute,
            source: errorCollection_ErrorSource.AGENT,
            startTime: errorCollection_now()
        }));
    })), setInterval((function() {
        errorCount = 0;
    }), errorCollection_ONE_MINUTE), filteredErrorObservable;
}

function startRuntimeErrorTracking(errorObservable) {
    traceKitReportHandler = function(stackTrace, _, errorObject) {
        var error = formatUnknownError(stackTrace, errorObject, "Uncaught");
        errorObservable.notify({
            message: error.message,
            stack: error.stack,
            type: error.type,
            source: ErrorSource.SOURCE,
            startTime: now()
        });
    }, report.subscribe(traceKitReportHandler);
}

function stopRuntimeErrorTracking() {
    errorCollection_report.unsubscribe(traceKitReportHandler);
}

function startAutomaticErrorCollection(configuration) {
    return errorObservable || (trackNetworkError(configuration, errorObservable = new Observable), 
    startConsoleTracking(errorObservable), startRuntimeErrorTracking(errorObservable)), 
    errorObservable;
}

function trackNetworkError(configuration, errorObservable) {
    function handleCompleteRequest(type, request) {
        isIntakeRequest(request.url, configuration) || !isRejected(request) && !isServerError(request) || errorObservable.notify({
            message: format(type) + "error" + request.method + " " + request.url,
            resource: {
                method: request.method,
                statusCode: request.status,
                url: request.url,
                traceId: request.traceId,
                spanId: request.spanId
            },
            type: ErrorSource.NETWORK,
            source: ErrorSource.NETWORK,
            stack: truncateResponse(request.response, configuration) || "Failed to load",
            startTime: request.startTime
        });
    }
    return startXhrProxy().onRequestComplete((function(context) {
        return handleCompleteRequest(context.type, context);
    })), startDownloadProxy().onRequestComplete((function(context) {
        return handleCompleteRequest(context.type, context);
    })), {
        stop: function() {
            resetXhrProxy(), resetDownloadProxy();
        }
    };
}

function isRejected(request) {
    return 0 === request.status && "opaque" !== request.responseType;
}

function isServerError(request) {
    return request.status >= 500;
}

function truncateResponse(response, configuration) {
    return response && response.length > configuration.requestErrorResponseLengthLimit ? response.substring(0, configuration.requestErrorResponseLengthLimit) + "..." : response;
}

function format(type) {
    return RequestType.XHR === type ? "XHR" : RequestType.DOWNLOAD;
}

function startErrorCollection(lifeCycle, configuration) {
    return startAutomaticErrorCollection(configuration).subscribe((function(error) {
        lifeCycle.notify(LifeCycleEventType.RAW_ERROR_COLLECTED, {
            error: error
        });
    })), doStartErrorCollection(lifeCycle);
}

function doStartErrorCollection(lifeCycle) {
    return lifeCycle.subscribe(LifeCycleEventType.RAW_ERROR_COLLECTED, (function(error) {
        lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processError(error.error));
    })), {
        addError: function(customError, savedCommonContext) {
            var rawError = computeRawError(customError.error, customError.startTime, customError.context);
            lifeCycle.notify(LifeCycleEventType.RAW_ERROR_COLLECTED, {
                savedCommonContext: savedCommonContext,
                error: rawError
            });
        }
    };
}

function computeRawError(error, startTime, context) {
    var stackTrace = error instanceof Error ? computeStackTrace(error) : void 0;
    return extend({
        startTime: startTime,
        source: ErrorSource.CUSTOM,
        context: context
    }, formatUnknownError(stackTrace, error, "Provided"));
}

function processError(error) {
    var tracingInfo, resource = error.resource;
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
    if (request.traceId && request.spanId) return {
        _dd: {
            spanId: request.spanId,
            traceId: request.traceId
        }
    };
}

class BaseInfo {
    constructor() {
        this.getDeviceInfo(), this.getNetWork();
    }
    getDeviceInfo() {
        try {
            var deviceInfo = {};
            if (!sdk.getDeviceInfo || sdk.getDeviceInfo() instanceof Promise) {
                var {brand: brand, system: system, model: model, platform: platform, cpuType: cpuType, memorySize: memorySize} = sdk.getSystemInfoSync();
                deviceInfo = {
                    brand: brand,
                    system: system,
                    model: model,
                    platform: platform,
                    cpuType: cpuType,
                    memorySize: memorySize
                };
            } else deviceInfo = sdk.getDeviceInfo();
            var appBaseInfo = {};
            if (sdk.getAppBaseInfo) appBaseInfo = sdk.getAppBaseInfo(); else {
                var {SDKVersion: SDKVersion, language: language, version: version, host: host} = sdk.getSystemInfoSync();
                appBaseInfo = {
                    SDKVersion: SDKVersion,
                    language: language,
                    version: version,
                    host: host
                };
            }
            var windowInfo = {};
            if (sdk.getWindowInfo) windowInfo = sdk.getWindowInfo(); else {
                var {pixelRatio: pixelRatio, screenWidth: screenWidth, screenHeight: screenHeight, windowWidth: windowWidth, windowHeight: windowHeight, statusBarHeight: statusBarHeight, screenTop: screenTop} = sdk.getSystemInfoSync();
                windowInfo = {
                    pixelRatio: pixelRatio,
                    screenHeight: screenHeight,
                    screenWidth: screenWidth,
                    windowWidth: windowWidth,
                    windowHeight: windowHeight,
                    statusBarHeight: statusBarHeight,
                    screenTop: screenTop
                };
            }
            var osData = deviceInfo.system && deviceInfo.system.split(" ") || [], osVersion = osData.length > 1 && osData[1], osVersionMajor = osVersion && osVersion.split(".").length && osVersion.split(".")[0], osInfo = {
                os: osData.length > 0 && osData[0],
                osVersion: osVersion,
                osVersionMajor: osVersionMajor
            }, deviceUUid = "";
            appBaseInfo.host && (deviceUUid = appBaseInfo.host.appId), this.deviceInfo = {
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
            console.error(e), this.deviceInfo = {};
        }
    }
    getClientID() {
        var clienetId = getStorageSync(CLIENT_ID_TOKEN);
        return clienetId || (clienetId = UUID(), setStorageSync(CLIENT_ID_TOKEN, clienetId)), 
        clienetId;
    }
    getNetWork() {
        sdk.getNetworkType({
            success: e => {
                this.deviceInfo.networkType = e.networkType ? e.networkType : "unknown";
            }
        }), sdk.onNetworkStatusChange((e => {
            this.deviceInfo.networkType = e.networkType ? e.networkType : "unknown";
        }));
    }
    getLaunchOptions() {
        if (sdk.getLaunchOptionsSync) {
            var res = sdk.getLaunchOptionsSync();
            return {
                query: res && res.query || {},
                referrerInfo: res && res.referrerInfo || {}
            };
        }
        return {};
    }
}

const baseInfo = new BaseInfo;

var SessionType = {
    SYNTHETICS: "synthetics",
    USER: "user"
};

class sessionManagement {
    constructor(configuration) {
        this.sessionId = UUID(), this.isTrack = performDraw(configuration.sampleRate);
    }
    getSessionId() {
        return this.sessionId;
    }
    isTracked() {
        return this.isTrack;
    }
}

function createErrorFilter(configuration, onLimitReached) {
    var errorCount = 0, allowNextError = !1;
    return {
        isLimitReached: function() {
            if (0 === errorCount && setTimeout((function() {
                errorCount = 0;
            }), utils_ONE_MINUTE), (errorCount += 1) <= configuration.maxErrorsByMinute || allowNextError) return allowNextError = !1, 
            !1;
            if (errorCount === configuration.maxErrorsByMinute + 1) {
                allowNextError = !0;
                try {
                    onLimitReached({
                        message: "Reached max number of errors by minute: ".concat(configuration.maxErrorsByMinute),
                        source: ErrorSource.AGENT,
                        startTime: now()
                    });
                } finally {
                    allowNextError = !1;
                }
            }
            return !0;
        }
    };
}

function startRumAssembly(applicationId, configuration, session, lifeCycle, parentContexts, getCommonContext) {
    var errorFilter = createErrorFilter(configuration, (function(error) {
        lifeCycle.notify(LifeCycleEventType.RAW_ERROR_COLLECTED, {
            error: error
        });
    }));
    lifeCycle.subscribe(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, (function(data) {
        var startTime = data.startTime, rawRumEvent = data.rawRumEvent, viewContext = parentContexts.findView(startTime), savedCommonContext = data.savedCommonContext, customerContext = data.customerContext, deviceContext = {
            device: baseInfo.deviceInfo
        }, appContext = {
            app: {
                launch: baseInfo.getLaunchOptions()
            }
        };
        if (session.isTracked() && (viewContext || rawRumEvent.type === RumEventType.APP)) {
            var actionContext = parentContexts.findAction(startTime), commonContext = savedCommonContext || getCommonContext(), rumContext = {
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
                date: (new Date).getTime(),
                session: {
                    id: session.getSessionId(),
                    type: SessionType.USER
                },
                user: {
                    id: configuration.user_id || baseInfo.getClientID(),
                    is_signin: configuration.user_id ? "T" : "F"
                }
            }, serverRumEvent = withSnakeCaseKeys(extend2Lev(rumContext, deviceContext, appContext, viewContext, actionContext, rawRumEvent)), context = extend2Lev({}, commonContext.context, customerContext);
            isEmptyObject(context) || (serverRumEvent.tags = context), isEmptyObject(commonContext.user) || (serverRumEvent.user = extend2Lev({
                id: baseInfo.getClientID(),
                is_signin: "T"
            }, commonContext.user)), shouldSend(serverRumEvent, errorFilter) && lifeCycle.notify(LifeCycleEventType.RUM_EVENT_COLLECTED, serverRumEvent);
        }
    }));
}

function shouldSend(event, errorFilter) {
    return event.type !== RumEventType.ERROR || !errorFilter.isLimitReached();
}

var VIEW_CONTEXT_TIME_OUT_DELAY = 4 * ONE_HOUR, CLEAR_OLD_CONTEXTS_INTERVAL = ONE_MINUTE;

function startParentContexts(lifeCycle) {
    var currentView, currentAction, previousViews = [], previousActions = [];
    lifeCycle.subscribe(LifeCycleEventType.VIEW_CREATED, (function(currentContext) {
        currentView = currentContext;
    })), lifeCycle.subscribe(LifeCycleEventType.VIEW_UPDATED, (function(currentContext) {
        currentView && currentView.id === currentContext.id && (currentView = currentContext);
    })), lifeCycle.subscribe(LifeCycleEventType.VIEW_ENDED, (function(data) {
        currentView && (previousViews.unshift({
            endTime: data.endClocks,
            context: buildCurrentViewContext(),
            startTime: currentView.startTime
        }), currentView = void 0);
    })), lifeCycle.subscribe(LifeCycleEventType.AUTO_ACTION_CREATED, (function(currentContext) {
        currentAction = currentContext;
    })), lifeCycle.subscribe(LifeCycleEventType.AUTO_ACTION_COMPLETED, (function(action) {
        currentAction && previousActions.unshift({
            context: buildCurrentActionContext(),
            endTime: currentAction.startClocks + action.duration,
            startTime: currentAction.startClocks
        }), currentAction = void 0;
    })), lifeCycle.subscribe(LifeCycleEventType.AUTO_ACTION_DISCARDED, (function() {
        currentAction = void 0;
    })), lifeCycle.subscribe(LifeCycleEventType.SESSION_RENEWED, (function() {
        previousViews = [], previousActions = [], currentView = void 0, currentAction = void 0;
    }));
    var clearOldContextsInterval = setInterval((function() {
        !function(previousContexts, timeOutDelay) {
            var oldTimeThreshold = now() - timeOutDelay;
            for (;previousContexts.length > 0 && previousContexts[previousContexts.length - 1].startTime < oldTimeThreshold; ) previousContexts.pop();
        }(previousViews, VIEW_CONTEXT_TIME_OUT_DELAY);
    }), CLEAR_OLD_CONTEXTS_INTERVAL);
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
                referer: previousViews.length && previousViews[previousViews.length - 1].context.page.route || void 0,
                route: currentView.route
            }
        };
    }
    function findContext(buildContext, previousContexts, currentContext, startTime) {
        if (void 0 === startTime) return currentContext ? buildContext() : void 0;
        if (currentContext && startTime >= currentContext.startTime) return buildContext();
        var flag = void 0;
        return each(previousContexts, (function(previousContext) {
            return !(startTime > previousContext.endTime) && (startTime >= previousContext.startTime ? (flag = previousContext.context, 
            !1) : void 0);
        })), flag;
    }
    return {
        findView: function(startTime) {
            return findContext(buildCurrentViewContext, previousViews, currentView, startTime);
        },
        findAction: function(startTime) {
            return findContext(buildCurrentActionContext, previousActions, currentAction, startTime);
        },
        stop: function() {
            clearInterval(clearOldContextsInterval);
        }
    };
}

var ONE_KIBI_BYTE = 1024, ONE_MEBI_BYTE = 1024 * ONE_KIBI_BYTE, HAS_MULTI_BYTES_CHARACTERS = /[^\u0000-\u007F]/;

function computeBytesCount(candidate) {
    if (!HAS_MULTI_BYTES_CHARACTERS.test(candidate)) return candidate.length;
    for (var charCode, total = 0, i = 0, len = candidate.length; i < len; i++) total += (charCode = candidate.charCodeAt(i)) <= 127 ? 1 : charCode <= 2047 ? 2 : charCode <= 65535 ? 3 : 4;
    return total;
}

var commonTags = {
    sdk_name: "_dd.sdk_name",
    sdk_version: "_dd.sdk_version",
    app_id: "application.id",
    env: "_dd.env",
    service: "_dd.service",
    version: "_dd.version",
    userid: "user.id",
    user_email: "user.email",
    user_name: "user.name",
    session_id: "session.id",
    session_type: "session.type",
    is_signin: "user.is_signin",
    platform: "device.platform",
    device: "device.brand",
    brand: "device.brand",
    model: "device.model",
    cpu_type: "device.cpu_type",
    memory_size: "device.memory_size",
    device_uuid: "device.device_uuid",
    os_version: "device.os_version",
    os_version_major: "device.os_version_major",
    os: "device.os",
    platform_version: "device.platform_version",
    app_framework_version: "device.framework_version",
    platform_language: "device.platform_language",
    screen_size: "device.screen_size",
    pixel_ratio: "device.pixel_ratio",
    window_height: "device.window_height",
    window_width: "device.window_width",
    status_bar_height: "device.status_bar_height",
    screen_top: "device.screen_top",
    network_type: "device.network_type",
    view_id: "page.id",
    view_name: "page.route",
    view_referer: "page.referer"
}, commonFields = {
    app_launch_query: "app.launch.query",
    app_launch_referrer_info: "app.launch.referrer_info"
}, dataMap = {
    view: {
        type: RumEventType.VIEW,
        tags: {
            view_apdex_level: "page.apdex_level",
            is_active: "page.is_active"
        },
        fields: {
            page_fmp: "page.fmp",
            first_paint_time: "page.fpt",
            loading_time: "page.loading_time",
            onload_to_onshow: "page.onload2onshow",
            onshow_to_onready: "page.onshow2onready",
            time_spent: "page.time_spent",
            view_error_count: "page.error.count",
            view_resource_count: "page.resource.count",
            view_long_task_count: "page.long_task.count",
            view_action_count: "page.action.count",
            view_setdata_count: "page.setdata.count"
        }
    },
    resource: {
        type: RumEventType.RESOURCE,
        tags: {
            trace_id: "_dd.trace_id",
            span_id: "_dd.span_id",
            resource_type: "resource.type",
            resource_status: "resource.status",
            resource_status_group: "resource.status_group",
            resource_method: "resource.method",
            resource_url: "resource.url",
            resource_url_host: "resource.url_host",
            resource_url_path: "resource.url_path",
            resource_url_path_group: "resource.url_path_group",
            resource_url_query: "resource.url_query"
        },
        fields: {
            resource_size: "resource.size",
            resource_load: "resource.load",
            resource_dns: "resource.dns",
            resource_tcp: "resource.tcp",
            resource_ssl: "resource.ssl",
            resource_ttfb: "resource.ttfb",
            resource_trans: "resource.trans",
            resource_first_byte: "resource.firstbyte",
            duration: "resource.duration"
        }
    },
    error: {
        type: RumEventType.ERROR,
        tags: {
            trace_id: "_dd.trace_id",
            span_id: "_dd.span_id",
            error_source: "error.source",
            error_type: "error.type",
            resource_url: "error.resource.url",
            resource_url_host: "error.resource.url_host",
            resource_url_path: "error.resource.url_path",
            resource_url_path_group: "error.resource.url_path_group",
            resource_status: "error.resource.status",
            resource_status_group: "error.resource.status_group",
            resource_method: "error.resource.method"
        },
        fields: {
            error_message: [ "string", "error.message" ],
            error_stack: [ "string", "error.stack" ]
        }
    },
    long_task: {
        type: RumEventType.LONG_TASK,
        tags: {},
        fields: {
            duration: "long_task.duration"
        }
    },
    action: {
        type: RumEventType.ACTION,
        tags: {
            action_id: "action.id",
            action_name: "action.target.name",
            action_type: "action.type"
        },
        fields: {
            duration: "action.loading_time",
            action_error_count: "action.error.count",
            action_resource_count: "action.resource.count",
            action_long_task_count: "action.long_task.count"
        }
    },
    app: {
        alias_key: "action",
        type: RumEventType.APP,
        tags: {
            action_id: "app.id",
            action_name: "app.name",
            action_type: "app.type"
        },
        fields: {
            duration: "app.duration"
        }
    }
}, transport_HAS_MULTI_BYTES_CHARACTERS = /[^\u0000-\u007F]/, CUSTOM_KEYS = "custom_keys";

function addBatchPrecision(url) {
    return url ? url + (-1 === url.indexOf("?") ? "?" : "&") + "precision=ms" : url;
}

var httpRequest = function(endpointUrl, bytesLimit) {
    this.endpointUrl = endpointUrl, this.bytesLimit = bytesLimit;
};

httpRequest.prototype = {
    send: function(data) {
        var url = addBatchPrecision(this.endpointUrl);
        (sdk.request || sdk.httpRequest)({
            method: "POST",
            header: {
                "content-type": "text/plain;charset=UTF-8",
                "x-client-timestamp": (new Date).getTime().toString()
            },
            headers: {
                "content-type": "text/plain;charset=UTF-8",
                "x-client-timestamp": (new Date).getTime().toString()
            },
            url: url,
            data: data
        });
    }
};

var HttpRequest = httpRequest, processedMessageByDataMap = function(message) {
    if (!message || !message.type) return {
        rowStr: "",
        rowData: void 0
    };
    var rowData = {
        tags: {},
        fields: {}
    }, hasFileds = !1, rowStr = "";
    return each(dataMap, (function(value, key) {
        if (value.type === message.type) {
            value.alias_key ? rowStr += value.alias_key + "," : rowStr += key + ",", rowData.measurement = key;
            var tagsStr = [], tags = extend({}, commonTags, value.tags), filterFileds = [ "date", "type", CUSTOM_KEYS ];
            each(tags, (function(value_path, _key) {
                var _value = findByPath(message, value_path);
                filterFileds.push(_key), (_value || isNumber(_value)) && (rowData.tags[_key] = escapeJsonValue(_value), 
                tagsStr.push(escapeRowData(_key) + "=" + escapeRowData(_value)));
            }));
            var fields = extend({}, commonFields, value.fields), fieldsStr = [];
            if (each(fields, (function(_value, _key) {
                if (isArray(_value) && 2 === _value.length) {
                    _value[0];
                    var value_path = _value[1], _valueData = findByPath(message, value_path);
                    filterFileds.push(_key), (_valueData || isNumber(_valueData)) && (rowData.fields[_key] = _valueData, 
                    fieldsStr.push(escapeRowData(_key) + "=" + escapeRowField(_valueData)));
                } else if (isString(_value)) {
                    _valueData = findByPath(message, _value);
                    filterFileds.push(_key), (_valueData || isNumber(_valueData)) && (rowData.fields[_key] = _valueData, 
                    fieldsStr.push(escapeRowData(_key) + "=" + escapeRowField(_valueData)));
                }
            })), message.tags && isObject(message.tags) && !isEmptyObject(message.tags)) {
                var _tagKeys = [];
                each(message.tags, (function(_value, _key) {
                    filterFileds.indexOf(_key) > -1 || (filterFileds.push(_key), (_value || isNumber(_value)) && (_tagKeys.push(_key), 
                    rowData.fields[_key] = _value, fieldsStr.push(escapeRowData(_key) + "=" + escapeRowField(_value))));
                })), _tagKeys.length && (rowData.fields[CUSTOM_KEYS] = escapeRowField(_tagKeys), 
                fieldsStr.push(escapeRowData(CUSTOM_KEYS) + "=" + escapeRowField(_tagKeys)));
            }
            tagsStr.length && (rowStr += tagsStr.join(",")), fieldsStr.length && (rowStr += " ", 
            rowStr += fieldsStr.join(","), hasFileds = !0), rowStr = rowStr + " " + message.date, 
            rowData.time = toServerDuration(message.date);
        }
    })), {
        rowStr: hasFileds ? rowStr : "",
        rowData: hasFileds ? rowData : void 0
    };
};

function batch(request, maxSize, bytesLimit, maxMessageSize, flushTimeout, lifeCycle) {
    this.request = request, this.maxSize = maxSize, this.bytesLimit = bytesLimit, this.maxMessageSize = maxMessageSize, 
    this.flushTimeout = flushTimeout, this.lifeCycle = lifeCycle, this.pushOnlyBuffer = [], 
    this.upsertBuffer = {}, this.bufferBytesSize = 0, this.bufferMessageCount = 0, this.flushOnVisibilityHidden(), 
    this.flushPeriodically();
}

batch.prototype = {
    add: function(message) {
        this.addOrUpdate(message);
    },
    upsert: function(message, key) {
        this.addOrUpdate(message, key);
    },
    flush: function() {
        if (0 !== this.bufferMessageCount) {
            var messages = this.pushOnlyBuffer.concat(values(this.upsertBuffer));
            this.request.send(messages.join("\n"), this.bufferBytesSize), this.pushOnlyBuffer = [], 
            this.upsertBuffer = {}, this.bufferBytesSize = 0, this.bufferMessageCount = 0;
        }
    },
    processSendData: function(message) {
        return processedMessageByDataMap(message).rowStr;
    },
    addOrUpdate: function(message, key) {
        var process = this.process(message);
        process.processedMessage && "" !== process.processedMessage && (process.messageBytesSize >= this.maxMessageSize ? console.warn("Discarded a message whose size was bigger than the maximum allowed size" + this.maxMessageSize + "KB.") : (this.hasMessageFor(key) && this.remove(key), 
        this.willReachedBytesLimitWith(process.messageBytesSize) && this.flush(), this.push(process.processedMessage, process.messageBytesSize, key), 
        this.isFull() && this.flush()));
    },
    process: function(message) {
        var processedMessage = this.processSendData(message);
        return {
            processedMessage: processedMessage,
            messageBytesSize: computeBytesCount(processedMessage)
        };
    },
    push: function(processedMessage, messageBytesSize, key) {
        this.bufferMessageCount > 0 && (this.bufferBytesSize += 1), void 0 !== key ? this.upsertBuffer[key] = processedMessage : this.pushOnlyBuffer.push(processedMessage), 
        this.bufferBytesSize += messageBytesSize, this.bufferMessageCount += 1;
    },
    remove: function(key) {
        var removedMessage = this.upsertBuffer[key];
        delete this.upsertBuffer[key];
        var messageBytesSize = computeBytesCount(removedMessage);
        this.bufferBytesSize -= messageBytesSize, this.bufferMessageCount -= 1, this.bufferMessageCount > 0 && (this.bufferBytesSize -= 1);
    },
    hasMessageFor: function(key) {
        return void 0 !== key && void 0 !== this.upsertBuffer[key];
    },
    willReachedBytesLimitWith: function(messageBytesSize) {
        return this.bufferBytesSize + messageBytesSize + 1 >= this.bytesLimit;
    },
    isFull: function() {
        return this.bufferMessageCount === this.maxSize || this.bufferBytesSize >= this.bytesLimit;
    },
    flushPeriodically: function() {
        var _this = this;
        setTimeout((function() {
            _this.flush(), _this.flushPeriodically();
        }), _this.flushTimeout);
    },
    flushOnVisibilityHidden: function() {
        var _this = this;
        this.lifeCycle.subscribe(LifeCycleEventType.APP_HIDE, (function() {
            _this.flush();
        }));
    }
};

var Batch = batch;

function startRumBatch(configuration, lifeCycle) {
    var batch = makeRumBatch(configuration, lifeCycle);
    return lifeCycle.subscribe(LifeCycleEventType.RUM_EVENT_COLLECTED, (function(serverRumEvent) {
        serverRumEvent.type === RumEventType.VIEW ? batch.upsert(serverRumEvent, serverRumEvent.page.id) : batch.add(serverRumEvent);
    })), {
        stop: function() {
            batch.stop();
        }
    };
}

function makeRumBatch(configuration, lifeCycle) {
    var primaryBatch = function(endpointUrl, lifeCycle) {
        return new Batch(new HttpRequest(endpointUrl, configuration.batchBytesLimit), configuration.maxBatchSize, configuration.batchBytesLimit, configuration.maxMessageSize, configuration.flushTimeout, lifeCycle);
    }(configuration.datakitUrl, lifeCycle);
    var stopped = !1;
    return {
        add: function(message) {
            stopped || primaryBatch.add(message);
        },
        stop: function() {
            stopped = !0;
        },
        upsert: function(message, key) {
            stopped || primaryBatch.upsert(message, key);
        }
    };
}

function trackEventCounts(lifeCycle, callback) {
    void 0 === callback && (callback = noop);
    var eventCounts = {
        errorCount: 0,
        resourceCount: 0,
        longTaskCount: 0,
        userActionCount: 0
    }, subscription = lifeCycle.subscribe(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, (function(data) {
        switch (data.rawRumEvent.type) {
          case RumEventType.ERROR:
            eventCounts.errorCount += 1, callback(eventCounts);
            break;

          case RumEventType.RESOURCE:
            eventCounts.resourceCount += 1, callback(eventCounts);
            break;

          case RumEventType.ACTION:
            eventCounts.userActionCount += 1, callback(eventCounts);
        }
    }));
    return {
        stop: function() {
            subscription.unsubscribe();
        },
        eventCounts: eventCounts
    };
}

var THROTTLE_VIEW_UPDATE_PERIOD = 3e3;

function rewritePage(configuration, lifeCycle) {
    var originPage = Page, originComponent = Component, hookPage = function(pageInstance) {
        var currentView, startTime = now();
        [ "onReady", "onShow", "onLoad", "onUnload", "onHide" ].forEach((methodName => {
            var userDefinedMethod = pageInstance[methodName];
            pageInstance[methodName] = function() {
                if (("onShow" === methodName || "onLoad" === methodName) && void 0 === currentView) {
                    var activePage = getActivePage();
                    currentView = newView(lifeCycle, activePage && activePage.route, startTime);
                }
                return currentView && currentView.setLoadEventEnd(methodName), "onUnload" !== methodName && "onHide" !== methodName && "onShow" !== methodName || !currentView || (currentView.triggerUpdate(), 
                "onUnload" !== methodName && "onHide" !== methodName || (currentView.end(), currentView = void 0)), 
                userDefinedMethod && userDefinedMethod.apply(this, arguments);
            };
        }));
    };
    Component = function(component) {
        try {
            hookPage(component.methods);
        } catch (error) {}
        return originComponent(component);
    }, Page = function(page) {
        try {
            hookPage(page);
        } catch (error) {}
        return originPage(page);
    };
}

function newView(lifeCycle, route, startTime) {
    void 0 === startTime && (startTime = now());
    var loadingTime, showTime, onload2onshowTime, onshow2onready, stayTime, fpt, fmp, id = UUID(), isActive = !0, eventCounts = {
        errorCount: 0,
        resourceCount: 0,
        userActionCount: 0
    }, setdataCount = 0, documentVersion = 0, setdataDuration = 0, loadingDuration = 0;
    lifeCycle.notify(LifeCycleEventType.VIEW_CREATED, {
        id: id,
        startTime: startTime,
        route: route
    });
    var scheduleViewThrottled = throttle(triggerViewUpdate, THROTTLE_VIEW_UPDATE_PERIOD, {
        leading: !1
    }), scheduleViewUpdate = scheduleViewThrottled.throttled, cancelScheduleViewUpdate = scheduleViewThrottled.cancel, stopEventCountsTracking = trackEventCounts(lifeCycle, (function(newEventCounts) {
        eventCounts = newEventCounts, scheduleViewUpdate();
    })).stop, stopFptTracking = trackFptTime(lifeCycle, (function(duration) {
        fpt = duration, scheduleViewUpdate();
    })).stop, stopSetDataTracking = trackSetDataTime(lifeCycle, (function(duration) {
        isNumber(duration) && (setdataDuration += duration, setdataCount++, scheduleViewUpdate());
    })).stop, stopLoadingTimeTracking = trackLoadingTime(lifeCycle, (function(duration) {
        isNumber(duration) && (loadingDuration = duration, scheduleViewUpdate());
    })).stop;
    function triggerViewUpdate() {
        documentVersion += 1, lifeCycle.notify(LifeCycleEventType.VIEW_UPDATED, {
            documentVersion: documentVersion,
            eventCounts: eventCounts,
            id: id,
            loadingTime: loadingDuration,
            stayTime: stayTime,
            onload2onshowTime: onload2onshowTime,
            onshow2onready: onshow2onready,
            setdataDuration: setdataDuration,
            setdataCount: setdataCount,
            fmp: fmp,
            fpt: fpt,
            startTime: startTime,
            route: route,
            duration: now() - startTime,
            isActive: isActive
        });
    }
    return {
        scheduleUpdate: scheduleViewUpdate,
        setLoadEventEnd: function(type) {
            "onLoad" === type ? loadingTime = now() : "onShow" === type ? (showTime = now(), 
            void 0 === onload2onshowTime && void 0 !== loadingTime && (onload2onshowTime = showTime - loadingTime)) : "onReady" === type ? (void 0 === onshow2onready && void 0 !== showTime && (onshow2onready = now() - showTime), 
            void 0 === fmp && (fmp = now() - startTime)) : "onHide" !== type && "onUnload" !== type || (void 0 !== showTime && (stayTime = now() - showTime), 
            isActive = !1), triggerViewUpdate();
        },
        triggerUpdate: function() {
            cancelScheduleViewUpdate(), triggerViewUpdate();
        },
        end: function() {
            stopEventCountsTracking(), stopFptTracking(), cancelScheduleViewUpdate(), stopSetDataTracking(), 
            stopLoadingTimeTracking(), lifeCycle.notify(LifeCycleEventType.VIEW_ENDED, {
                endClocks: now()
            });
        }
    };
}

function trackFptTime(lifeCycle, callback) {
    return {
        stop: lifeCycle.subscribe(LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, (function(entitys) {
            var firstRenderEntity = entitys.find((entity => "render" === entity.entryType && "firstRender" === entity.name));
            void 0 !== firstRenderEntity && callback(firstRenderEntity.duration);
        })).unsubscribe
    };
}

function trackLoadingTime(lifeCycle, callback) {
    return {
        stop: lifeCycle.subscribe(LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, (function(entitys) {
            var navigationEnity = entitys.find((entity => "navigation" === entity.entryType));
            void 0 !== navigationEnity && callback(navigationEnity.duration);
        })).unsubscribe
    };
}

function trackSetDataTime(lifeCycle, callback) {
    return {
        stop: lifeCycle.subscribe(LifeCycleEventType.PAGE_SET_DATA_UPDATE, (function(data) {
            data && callback(data.updateEndTimestamp - data.pendingStartTimestamp);
        })).unsubscribe
    };
}

function startViewCollection(lifeCycle, configuration) {
    return lifeCycle.subscribe(LifeCycleEventType.VIEW_UPDATED, (function(view) {
        lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processViewUpdate(view));
    })), rewritePage(configuration, lifeCycle);
}

function processViewUpdate(view) {
    var apdexLevel;
    return view.fmp && (apdexLevel = (apdexLevel = parseInt(Number(view.fmp) / 1e3)) > 9 ? 9 : apdexLevel), 
    {
        rawRumEvent: {
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
                apdexLevel: apdexLevel,
                resource: {
                    count: view.eventCounts.resourceCount
                },
                timeSpent: msToNs(view.duration)
            }
        },
        startTime: view.startTime
    };
}

function resourceUtils_areInOrder() {
    for (var numbers = toArray(arguments), i = 1; i < numbers.length; i += 1) if (numbers[i - 1] > numbers[i]) return !1;
    return !0;
}

function computePerformanceResourceDuration(entry) {
    if (entry.startTime < entry.responseEnd) return msToNs(entry.responseEnd - entry.startTime);
}

function computePerformanceResourceDetails(entry) {
    var validEntry = toValidEntry(entry);
    if (validEntry) {
        var startTime = validEntry.startTime, fetchStart = validEntry.fetchStart, redirectStart = validEntry.redirectStart, redirectEnd = validEntry.redirectEnd, domainLookupStart = validEntry.domainLookupStart || validEntry.domainLookUpStart, domainLookupEnd = validEntry.domainLookupEnd || validEntry.domainLookUpEnd, connectStart = validEntry.connectStart, SSLconnectionStart = validEntry.SSLconnectionStart, SSLconnectionEnd = validEntry.SSLconnectionEnd, connectEnd = validEntry.connectEnd, requestStart = validEntry.requestStart, responseStart = validEntry.responseStart, responseEnd = validEntry.responseEnd, details = {
            firstbyte: formatTiming(startTime, domainLookupStart, responseStart),
            trans: formatTiming(startTime, responseStart, responseEnd),
            ttfb: formatTiming(startTime, requestStart, responseStart)
        };
        return connectEnd !== fetchStart && (details.tcp = formatTiming(startTime, connectStart, connectEnd), 
        resourceUtils_areInOrder(connectStart, SSLconnectionStart, SSLconnectionEnd) && (details.ssl = formatTiming(startTime, SSLconnectionStart, SSLconnectionEnd))), 
        domainLookupEnd !== fetchStart && (details.dns = formatTiming(startTime, domainLookupStart, domainLookupEnd)), 
        hasRedirection(entry) && (details.redirect = formatTiming(startTime, redirectStart, redirectEnd)), 
        details;
    }
}

function toValidEntry(entry) {
    if (resourceUtils_areInOrder(entry.startTime, entry.fetchStart, entry.domainLookupStart, entry.domainLookupEnd, entry.connectStart, entry.connectEnd, entry.requestStart, entry.responseStart, entry.responseEnd)) {
        if (!hasRedirection(entry)) return entry;
        var redirectStart = entry.redirectStart, redirectEnd = entry.redirectEnd;
        if (redirectStart < entry.startTime && (redirectStart = entry.startTime), redirectEnd < entry.startTime && (redirectEnd = entry.fetchStart), 
        resourceUtils_areInOrder(entry.startTime, redirectStart, redirectEnd, entry.fetchStart)) return extend({}, entry, {
            redirectEnd: redirectEnd,
            redirectStart: redirectStart
        });
    }
}

function hasRedirection(entry) {
    return entry.fetchStart !== entry.startTime;
}

function formatTiming(origin, start, end) {
    return msToNs(end - start);
}

function computeSize(entry) {
    if (entry.startTime < entry.responseStart) return entry.receivedBytedCount;
}

function startResourceCollection(lifeCycle, configuration) {
    lifeCycle.subscribe(LifeCycleEventType.REQUEST_COMPLETED, (function(request) {
        lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processRequest(request));
    }));
}

function processRequest(request) {
    var type = request.type, timing = request.performance, correspondingTimingOverrides = timing ? computePerformanceEntryMetrics(timing) : void 0, tracingInfo = resourceCollection_computeRequestTracingInfo(request), urlObj = urlParse(request.url).getParse(), startTime = request.startTime;
    return {
        startTime: startTime,
        rawRumEvent: extend2Lev({
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
        }, tracingInfo, correspondingTimingOverrides)
    };
}

function resourceCollection_computeRequestTracingInfo(request) {
    if (request.traceId && request.spanId) return {
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

var app_THROTTLE_VIEW_UPDATE_PERIOD = 3e3, startupTypes = {
    COLD: "cold",
    HOT: "hot"
};

function rewriteApp(configuration, lifeCycle) {
    var originApp = App, appInfo = {
        isStartUp: !1
    };
    App = function(app) {
        return now(), [ "onLaunch", "onShow", "onHide" ].forEach((methodName => {
            var userDefinedMethod = app[methodName];
            app[methodName] = function(options) {
                return "onLaunch" === methodName ? (appInfo.isStartUp = !0, appInfo.isHide = !1, 
                appInfo.startupType = startupTypes.COLD) : "onShow" === methodName ? appInfo.isStartUp && appInfo.isHide && (appInfo.startupType = startupTypes.HOT) : "onHide" === methodName && (lifeCycle.notify(LifeCycleEventType.APP_HIDE), 
                appInfo.isHide = !0), userDefinedMethod && userDefinedMethod.call(this, options);
            };
        })), originApp(app);
    }, startPerformanceObservable(lifeCycle);
}

function startPerformanceObservable(lifeCycle) {
    return {
        stop: lifeCycle.subscribe(LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, (function(entitys) {
            var codeDownloadDuration, launchEntity = entitys.find((entity => "navigation" === entity.entryType && "appLaunch" === entity.navigationType));
            void 0 !== launchEntity && lifeCycle.notify(LifeCycleEventType.APP_UPDATE, {
                startTime: now(),
                name: "启动",
                type: "launch",
                id: UUID(),
                duration: launchEntity.duration
            });
            var scriptentity = entitys.find((entity => "script" === entity.entryType && "evaluateScript" === entity.name));
            void 0 !== scriptentity && lifeCycle.notify(LifeCycleEventType.APP_UPDATE, {
                startTime: now(),
                name: "脚本注入",
                type: "script_insert",
                id: UUID(),
                duration: scriptentity.duration
            });
            var firstEntity = entitys.find((entity => "render" === entity.entryType && "firstRender" === entity.name));
            if (firstEntity && scriptentity && launchEntity) {
                if (!areInOrder(firstEntity.duration, launchEntity.duration) || !areInOrder(scriptentity.duration, launchEntity.duration)) return;
                codeDownloadDuration = launchEntity.duration - firstEntity.duration - scriptentity.duration, 
                lifeCycle.notify(LifeCycleEventType.APP_UPDATE, {
                    startTime: now(),
                    name: "小程序包下载",
                    type: "package_download",
                    id: UUID(),
                    duration: codeDownloadDuration
                });
            }
        })).unsubscribe
    };
}

function startAppCollection(lifeCycle, configuration) {
    return lifeCycle.subscribe(LifeCycleEventType.APP_UPDATE, (function(appinfo) {
        lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processAppUpdate(appinfo));
    })), rewriteApp(configuration, lifeCycle);
}

function processAppUpdate(appinfo) {
    return {
        rawRumEvent: {
            date: appinfo.startTime,
            type: RumEventType.APP,
            app: {
                type: appinfo.type,
                name: appinfo.name,
                id: appinfo.id,
                duration: msToNs(appinfo.duration)
            }
        },
        startTime: appinfo.startTime
    };
}

function startPagePerformanceObservable(lifeCycle, configuration) {
    sdk.getPerformance && sdk.getPerformance().createObserver((entryList => {
        lifeCycle.notify(LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, entryList.getEntries());
    })).observe({
        entryTypes: [ "render", "script", "navigation" ]
    });
}

function startSetDataColloction(lifeCycle) {
    var originPage = Page, originComponent = Component;
    Page = function(page) {
        var originPageOnLoad = page.onLoad;
        return page.onLoad = function() {
            return this.setUpdatePerformanceListener && this.setUpdatePerformanceListener({
                withDataPaths: !0
            }, (res => {
                lifeCycle.notify(LifeCycleEventType.PAGE_SET_DATA_UPDATE, res);
            })), originPageOnLoad && originPageOnLoad.apply(this, arguments);
        }, originPage(page);
    }, Component = function(component) {
        var originComponentAttached;
        function handlerOrigin() {
            return this.setUpdatePerformanceListener && this.setUpdatePerformanceListener({
                withDataPaths: !0
            }, (res => {
                lifeCycle.notify(LifeCycleEventType.PAGE_SET_DATA_UPDATE, res);
            })), originComponentAttached && originComponentAttached.apply(this, arguments);
        }
        return component.lifetimes && component.lifetimes.attached ? (originComponentAttached = component.lifetimes.attached, 
        component.lifetimes.attached = handlerOrigin) : component.attached && (originComponentAttached = component.attached, 
        component.attached = handlerOrigin), component.onLoad && (originComponentAttached = component.onLoad, 
        component.onLoad = handlerOrigin), originComponent(component);
    };
}

var PAGE_ACTIVITY_VALIDATION_DELAY = 100, PAGE_ACTIVITY_END_DELAY = 100, PAGE_ACTIVITY_MAX_DURATION = 1e4;

function waitIdlePageActivity(lifeCycle, completionCallback) {
    var _trackPageActivities = trackPageActivities(lifeCycle), pageActivitiesObservable = _trackPageActivities.observable, stopPageActivitiesTracking = _trackPageActivities.stop, stopWaitPageActivitiesCompletion = waitPageActivitiesCompletion(pageActivitiesObservable, stopPageActivitiesTracking, completionCallback).stop;
    return {
        stop: function() {
            stopWaitPageActivitiesCompletion(), stopPageActivitiesTracking();
        }
    };
}

function trackPageActivities(lifeCycle) {
    var firstRequestIndex, observable = new Observable, subscriptions = [], pendingRequestsCount = 0;
    function notifyPageActivity() {
        observable.notify({
            isBusy: pendingRequestsCount > 0
        });
    }
    return subscriptions.push(lifeCycle.subscribe(LifeCycleEventType.PAGE_SET_DATA_UPDATE, (function() {
        notifyPageActivity();
    })), lifeCycle.subscribe(LifeCycleEventType.PAGE_ALIAS_ACTION, (function() {
        notifyPageActivity();
    }))), subscriptions.push(lifeCycle.subscribe(LifeCycleEventType.REQUEST_STARTED, (function(startEvent) {
        void 0 === firstRequestIndex && (firstRequestIndex = startEvent.requestIndex), pendingRequestsCount += 1, 
        notifyPageActivity();
    }))), subscriptions.push(lifeCycle.subscribe(LifeCycleEventType.REQUEST_COMPLETED, (function(request) {
        void 0 === firstRequestIndex || request.requestIndex < firstRequestIndex || (pendingRequestsCount -= 1, 
        notifyPageActivity());
    }))), {
        observable: observable,
        stop: function() {
            each(subscriptions, (function(sub) {
                sub.unsubscribe();
            }));
        }
    };
}

function waitPageActivitiesCompletion(pageActivitiesObservable, stopPageActivitiesTracking, completionCallback) {
    var hasCompleted = !1, validationTimeoutId = setTimeout((function() {
        complete({
            hadActivity: !1
        });
    }), PAGE_ACTIVITY_VALIDATION_DELAY), maxDurationTimeoutId = setTimeout((function() {
        complete({
            hadActivity: !0,
            endTime: now()
        });
    }), PAGE_ACTIVITY_MAX_DURATION);
    function stop() {
        hasCompleted = !0, clearTimeout(validationTimeoutId), clearTimeout(maxDurationTimeoutId), 
        stopPageActivitiesTracking();
    }
    function complete(params) {
        hasCompleted || (stop(), completionCallback(params));
    }
    return pageActivitiesObservable.subscribe((function(data) {
        var isBusy = data.isBusy;
        clearTimeout(validationTimeoutId);
        var lastChangeTime = now();
        isBusy || complete({
            hadActivity: !0,
            endTime: lastChangeTime
        });
    })), {
        stop: stop
    };
}

function trackActions(lifeCycle) {
    var action = startActionManagement(lifeCycle);
    return lifeCycle.subscribe(LifeCycleEventType.VIEW_CREATED, (function() {
        action.discardCurrent();
    })), {
        stop: function() {
            action.discardCurrent();
        }
    };
}

function startActionManagement(lifeCycle) {
    var currentAction, currentIdlePageActivitySubscription;
    return {
        create: function(type, name) {
            if (!currentAction) {
                var pendingAutoAction = new PendingAutoAction(lifeCycle, type, name);
                currentAction = pendingAutoAction, currentIdlePageActivitySubscription = waitIdlePageActivity(lifeCycle, (function(params) {
                    params.hadActivity ? pendingAutoAction.complete(params.endTime) : pendingAutoAction.discard(), 
                    currentAction = void 0;
                }));
            }
        },
        discardCurrent: function() {
            currentAction && (currentIdlePageActivitySubscription.stop(), currentAction.discard(), 
            currentAction = void 0);
        }
    };
}

var PendingAutoAction = function(lifeCycle, type, name) {
    this.id = UUID(), this.startClocks = now(), this.name = name, this.type = type, 
    this.lifeCycle = lifeCycle, this.eventCountsSubscription = trackEventCounts(lifeCycle), 
    this.lifeCycle.notify(LifeCycleEventType.AUTO_ACTION_CREATED, {
        id: this.id,
        startClocks: this.startClocks
    });
};

function startActionCollection(lifeCycle, configuration) {
    return lifeCycle.subscribe(LifeCycleEventType.AUTO_ACTION_COMPLETED, (function(action) {
        lifeCycle.notify(LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processAction(action));
    })), configuration.trackInteractions && trackActions(lifeCycle), {
        addAction: function(action, savedCommonContext) {
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
    return {
        customerContext: isAutoAction(action) ? void 0 : action.context,
        rawRumEvent: extend2Lev({
            action: {
                target: {
                    name: action.name
                },
                type: action.type
            },
            date: action.startClocks,
            type: RumEventType.ACTION
        }, autoActionProperties),
        startTime: action.startClocks
    };
}

function isAutoAction(action) {
    return action.type !== ActionType.custom;
}

function startInternalContext(applicationId, session, parentContexts) {
    return {
        get: function(startTime) {
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
                    } : void 0,
                    page: viewContext.page
                };
            }
        }
    };
}

PendingAutoAction.prototype = {
    complete: function(endTime) {
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
        }), this.eventCountsSubscription.stop();
    },
    discard: function() {
        this.lifeCycle.notify(LifeCycleEventType.AUTO_ACTION_DISCARDED), this.eventCountsSubscription.stop();
    }
};

var startRum = function(userConfiguration, getCommonContext) {
    var configuration = commonInit(userConfiguration, buildEnv), lifeCycle = new LifeCycle, parentContexts = startParentContexts(lifeCycle), session = (startRumBatch(configuration, lifeCycle), 
    new sessionManagement(configuration));
    startRumAssembly(userConfiguration.applicationId, configuration, session, lifeCycle, parentContexts, getCommonContext), 
    startAppCollection(lifeCycle, configuration), startResourceCollection(lifeCycle, configuration), 
    startViewCollection(lifeCycle, configuration);
    var _startErrorCollection = startErrorCollection(lifeCycle, configuration);
    startPagePerformanceObservable(lifeCycle, configuration), startSetDataColloction(lifeCycle);
    var _startActionCollection = startActionCollection(lifeCycle, configuration), internalContext = startInternalContext(userConfiguration.applicationId, session, parentContexts);
    return {
        addAction: _startActionCollection.addAction,
        addError: _startErrorCollection.addError,
        getInternalContext: internalContext.get
    };
};

function buildCommonContext(globalContextManager, userContextManager) {
    return {
        context: globalContextManager.getContext(),
        user: userContextManager.getContext()
    };
}

var BUFFER_LIMIT = 500, _BoundedBuffer = function() {
    this.buffer = [];
};

_BoundedBuffer.prototype = {
    add: function(callback) {
        this.buffer.push(callback) > BUFFER_LIMIT && this.buffer.splice(0, 1);
    },
    drain: function() {
        each(this.buffer, (function(callback) {
            callback();
        })), this.buffer.length = 0;
    }
};

var BoundedBuffer = _BoundedBuffer, CUSTOMER_DATA_BYTES_LIMIT = 3 * ONE_KIBI_BYTE, CustomerDataType = {
    FeatureFlag: "feature flag evaluation",
    User: "user",
    GlobalContext: "global context",
    LoggerContext: "logger context"
};

function warnIfCustomerDataLimitReached(bytesCount, customerDataType) {
    return bytesCount > CUSTOMER_DATA_BYTES_LIMIT && (console.warn("The " + customerDataType + "data is over " + CUSTOMER_DATA_BYTES_LIMIT / ONE_KIBI_BYTE + " KiB. On low connectivity, the SDK has the potential to exhaust the user's upload bandwidth."), 
    !0);
}

var BYTES_COMPUTATION_THROTTLING_DELAY = 200;

function createContextManager(customerDataType, computeBytesCountImpl) {
    void 0 === computeBytesCountImpl && (computeBytesCountImpl = computeBytesCount);
    var bytesCountCache, context = {}, alreadyWarned = !1, computeBytesCountThrottled = throttle((function(context) {
        bytesCountCache = computeBytesCountImpl(jsonStringify(context)), alreadyWarned || (alreadyWarned = warnIfCustomerDataLimitReached(bytesCountCache, customerDataType));
    }), BYTES_COMPUTATION_THROTTLING_DELAY).throttled;
    return {
        getBytesCount: function() {
            return bytesCountCache;
        },
        get: function() {
            return context;
        },
        add: function(key, value) {
            context[key] = value, computeBytesCountThrottled(context);
        },
        remove: function(key) {
            delete context[key], computeBytesCountThrottled(context);
        },
        set: function(newContext) {
            computeBytesCountThrottled(context = newContext);
        },
        getContext: function() {
            return deepClone(context);
        },
        setContext: function(newContext) {
            context = deepClone(newContext), computeBytesCountThrottled(context);
        },
        setContextProperty: function(key, property) {
            context[key] = deepClone(property), computeBytesCountThrottled(context);
        },
        removeContextProperty: function(key) {
            delete context[key], computeBytesCountThrottled(context);
        },
        clearContext: function() {
            context = {}, bytesCountCache = 0;
        }
    };
}

function sanitizeUser(newUser) {
    var user = extend({}, newUser);
    return each([ "id", "name", "email" ], (function(key) {
        key in user && (user[key] = String(user[key]));
    })), user;
}

function checkUser(newUser) {
    var isValid = "object" === getType(newUser);
    return isValid || console.error("Unsupported user:", newUser), isValid;
}

var makeRum = function(startRumImpl) {
    var isAlreadyInitialized = !1, globalContextManager = createContextManager(CustomerDataType.GlobalContext), userContextManager = createContextManager(CustomerDataType.User), getInternalContextStrategy = function() {}, bufferApiCalls = new BoundedBuffer, _addActionStrategy = function(action, commonContext) {
        void 0 === commonContext && (commonContext = buildCommonContext(globalContextManager, userContextManager)), 
        bufferApiCalls.add((function() {
            return _addActionStrategy(action, commonContext);
        }));
    }, _addErrorStrategy = function(providedError, commonContext) {
        void 0 === commonContext && (commonContext = buildCommonContext(globalContextManager, userContextManager)), 
        bufferApiCalls.add((function() {
            return _addErrorStrategy(providedError, commonContext);
        }));
    };
    return {
        init: function(userConfiguration) {
            if (void 0 === userConfiguration && (userConfiguration = {}), function(userConfiguration) {
                if (!sdk) return console.error("DATAFLUX_RUM unsupport platform, Fail to start."), 
                !1;
                if (isAlreadyInitialized) return console.error("DATAFLUX_RUM is already initialized."), 
                !1;
                if (!userConfiguration.applicationId) return console.error("Application ID is not configured, no RUM data will be collected."), 
                !1;
                if (!userConfiguration.site && !userConfiguration.datakitOrigin && !userConfiguration.datakitUrl) return console.error("datakitOrigin or site is not configured, no RUM data will be collected."), 
                !1;
                if (userConfiguration.site && !userConfiguration.clientToken) return console.error("clientToken is not configured, no RUM data will be collected."), 
                !1;
                if (void 0 !== userConfiguration.sampleRate && !isPercentage(userConfiguration.sampleRate)) return console.error("Sample Rate should be a number between 0 and 100"), 
                !1;
                return !0;
            }(userConfiguration)) {
                var _startRumImpl = startRumImpl(userConfiguration, (function() {
                    return buildCommonContext(globalContextManager, userContextManager);
                }));
                getInternalContextStrategy = _startRumImpl.getInternalContext, _addActionStrategy = _startRumImpl.addAction, 
                _addErrorStrategy = _startRumImpl.addError, bufferApiCalls.drain(), isAlreadyInitialized = !0;
            }
        },
        getInternalContext: function(startTime) {
            return getInternalContextStrategy(startTime);
        },
        addRumGlobalContext: globalContextManager.setContextProperty,
        removeRumGlobalContext: globalContextManager.removeContextProperty,
        getRumGlobalContext: globalContextManager.getContext,
        setRumGlobalContext: globalContextManager.setContext,
        clearRumGlobalContext: globalContextManager.clearContext,
        addAction: function(name, context) {
            _addActionStrategy({
                name: name,
                context: deepClone(context),
                startClocks: now(),
                type: ActionType.custom
            });
        },
        addError: function(error, context) {
            _addErrorStrategy({
                error: error,
                context: extend2Lev({}, context),
                startTime: now()
            });
        },
        setUserProperty: function(key, property) {
            var newUser = {};
            newUser[key] = property;
            var sanitizedProperty = sanitizeUser(newUser)[key];
            userContextManager.setContextProperty(key, sanitizedProperty);
        },
        removeUserProperty: userContextManager.removeContextProperty,
        setUser: function(newUser) {
            checkUser(newUser) && userContextManager.setContext(sanitizeUser(newUser));
        },
        getUser: userContextManager.getContext,
        removeUser: userContextManager.clearContext
    };
}, datafluxRum = makeRum(startRum);

defineGlobal(getGlobalObject(), "DATAFLUX_RUM_MIN", datafluxRum);

export { datafluxRum };