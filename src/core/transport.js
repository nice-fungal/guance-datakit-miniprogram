import { findByPath, escapeRowData, isNumber, each, isString, values, extend, isObject, isEmptyObject, isArray, escapeRowField, escapeJsonValue, toServerDuration } from '../helper/utils';
import { computeBytesCount } from '../helper/byteUtils';
import { sdk } from '../core/sdk';
import { LifeCycleEventType } from '../core/lifeCycle';
import { commonTags, dataMap, commonFields } from './dataMap'; // https://en.wikipedia.org/wiki/UTF-8

var HAS_MULTI_BYTES_CHARACTERS = /[^\u0000-\u007F]/;
var CUSTOM_KEYS = 'custom_keys';

function addBatchPrecision(url) {
  if (!url) return url;
  return url + (url.indexOf('?') === -1 ? '?' : '&') + 'precision=ms';
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
      method: 'POST',
      header: {
        'content-type': 'text/plain;charset=UTF-8'
      },
      headers: {
        'content-type': 'text/plain;charset=UTF-8' // 兼容其他

      },
      url,
      data
    });
  }
};
export var HttpRequest = httpRequest;
export var processedMessageByDataMap = function processedMessageByDataMap(message) {
  if (!message || !message.type) return {
    rowStr: '',
    rowData: undefined
  };
  var rowData = {
    tags: {},
    fields: {}
  };
  var hasFileds = false;
  var rowStr = '';
  each(dataMap, function (value, key) {
    if (value.type === message.type) {
      if (value.alias_key) {
        rowStr += value.alias_key + ',';
      } else {
        rowStr += key + ',';
      }

      rowData.measurement = key;
      var tagsStr = [];
      var tags = extend({}, commonTags, value.tags);
      var filterFileds = ['date', 'type', CUSTOM_KEYS]; // 已经在datamap中定义过的fields和tags

      each(tags, function (value_path, _key) {
        var _value = findByPath(message, value_path);

        filterFileds.push(_key);

        if (_value || isNumber(_value)) {
          rowData.tags[_key] = escapeJsonValue(_value);
          tagsStr.push(escapeRowData(_key) + '=' + escapeRowData(_value));
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

            fieldsStr.push(escapeRowData(_key) + '=' + escapeRowField(_valueData));
          }
        } else if (isString(_value)) {
          var _valueData = findByPath(message, _value);

          filterFileds.push(_key);

          if (_valueData || isNumber(_valueData)) {
            rowData.fields[_key] = _valueData; // 这里不需要转译

            fieldsStr.push(escapeRowData(_key) + '=' + escapeRowField(_valueData));
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

            fieldsStr.push(escapeRowData(_key) + '=' + escapeRowField(_value));
          }
        });

        if (_tagKeys.length) {
          rowData.fields[CUSTOM_KEYS] = escapeRowField(_tagKeys);
          fieldsStr.push(escapeRowData(CUSTOM_KEYS) + '=' + escapeRowField(_tagKeys));
        }
      }

      if (tagsStr.length) {
        rowStr += tagsStr.join(',');
      }

      if (fieldsStr.length) {
        rowStr += ' ';
        rowStr += fieldsStr.join(',');
        hasFileds = true;
      }

      rowStr = rowStr + ' ' + message.date;
      rowData.time = toServerDuration(message.date); // 这里不需要转译
    }
  });
  return {
    rowStr: hasFileds ? rowStr : '',
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
      this.request.send(messages.join('\n'), this.bufferBytesSize);
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
    if (!process.processedMessage || process.processedMessage === '') return;

    if (process.messageBytesSize >= this.maxMessageSize) {
      console.warn('Discarded a message whose size was bigger than the maximum allowed size' + this.maxMessageSize + 'KB.');
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
export var Batch = batch;