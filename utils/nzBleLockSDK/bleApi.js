import * as sdk from './bleSdk.js'
import * as bleSDKUtils from './bleSDKUtils.js'

let jsSimpleName = "<bleApi.js> "
let logUtils = bleSDKUtils.logUtils;

module.export = {
	searchDevices,
	closeBle,
}

export function searchDevices(obj) {
	if (obj.searchName) {
		wx.showLoading({
			title: "正在搜索"
		});
	}

	sdk.options.isSearchDeviceList = true;
	sdk.options.isKeepConnect = false;
	sdk.options.isSetMTU = false;
	sdk.options.searchTime = 10;
	sdk.options.searchMac = obj.mac;
	sdk.options.searchSn = obj.searchSn;
	sdk.options.searchName = obj.searchName ? obj.searchName : "";
	sdk.bleCommand({
		success: function(res) {
			logUtils(jsSimpleName + "success:" + JSON.stringify(res));
			obj.success(res);
			wx.hideLoading();
		},
		fail: function(res) {
			logUtils(jsSimpleName + "fail:" + JSON.stringify(res));
			wx.hideLoading();
			obj.fail(res)
		},
	})
}

export function closeBle() {
	sdk.closeBle();
}
