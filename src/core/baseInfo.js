import { sdk, getStorageSync, setStorageSync } from '../core/sdk';
import { UUID } from '../helper/utils';
import { CLIENT_ID_TOKEN } from '../helper/enums';
class BaseInfo {
  constructor() {
    this.getDeviceInfo();
    this.getNetWork();
  }
  getDeviceInfo() {
    try {
      var deviceInfo = {};
      if (sdk.getDeviceInfo) {
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
      var osData = deviceInfo.system.split(' ');
      var osVersion = osData.length > 1 && osData[1];
      var osVersionMajor = osVersion && osVersion.split('.').length && osVersion.split('.')[0];
      var osInfo = {
        os: osData.length > 0 && osData[0],
        osVersion,
        osVersionMajor
      };
      var deviceUUid = '';
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
        this.deviceInfo.networkType = e.networkType ? e.networkType : 'unknown';
      }
    });
    sdk.onNetworkStatusChange(e => {
      this.deviceInfo.networkType = e.networkType ? e.networkType : 'unknown';
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
export default new BaseInfo();