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
export var sdk = instance.sdk;
export var tracker = instance.tracker;
export var getStorageSync = key => {
  if (tracker === 'my') {
    var res = sdk.getStorageSync({
      key
    });
    return res && res.data;
  } else {
    return sdk.getStorageSync(key);
  }
};
export var setStorageSync = (key, data) => {
  if (tracker === 'my') {
    sdk.setStorageSync({
      key,
      data
    });
  } else {
    sdk.setStorageSync(key, data);
  }
};