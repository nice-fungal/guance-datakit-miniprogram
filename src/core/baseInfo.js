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
      var deviceInfo = sdk.getSystemInfoSync();
      var osInfo = deviceInfo.system.split(' ');
      var osVersion = osInfo.length > 1 && osInfo[1];
      var osVersionMajor = osVersion && osVersion.split('.').length && osVersion.split('.')[0];
      var deviceUUid = '';

      if (deviceInfo.host) {
        deviceUUid = deviceInfo.host.appId;
      }

      this.deviceInfo = {
        screenSize: "".concat(deviceInfo.screenWidth, "*").concat(deviceInfo.screenHeight, " "),
        platform: deviceInfo.platform,
        platformVersion: deviceInfo.version,
        osVersion: osVersion,
        osVersionMajor: osVersionMajor,
        os: osInfo.length > 0 && osInfo[0],
        brand: deviceInfo.brand,
        model: deviceInfo.model,
        frameworkVersion: deviceInfo.SDKVersion,
        pixelRatio: deviceInfo.pixelRatio,
        deviceUuid: deviceUUid
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