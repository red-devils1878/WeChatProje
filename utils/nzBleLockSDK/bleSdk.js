//10000	not init	未初始化蓝牙适配器
//10001	not available	当前蓝牙适配器不可用
//10002	no device	没有找到指定设备
//10003	connection fail	连接失败
//10004	no service	没有找到指定服务
//10005	no characteristic	没有找到指定特征值
//10006	no connection	当前连接已断开
//10007	property not support	当前特征值不支持此操作
//10008	system error	其余所有系统上报的异常
//10009	system not support	Android 系统特有，系统版本低于 4.3 不支持 BLE
//10010	already connect	已连接
//10011	need pin	配对设备需要配对码
//10012	operate time out	连接超时
//10013	invalid_data	连接 deviceId 为空或者是格式不正确

// 1000; // 连接成功
// 1001; // 已连接,发送指令
// 1002; // 搜索完成
// 1003; // 搜索到设备

// 1100; // 未搜索到设备
// 1101; // 连接超时
// 1102; // 保持连接超时断开
// 1103; // 鉴权失败
// 1104; // 无法获取服务
// 1105; // 设备主动断开连接

// -1;   // 指令返回失败  
// 0;    // 成功返回

let jsSimpleName = "<bleSdk.js> "

const bleSDKUtils = require("./bleSDKUtils.js");

var vm = null;
export function init(_vm){
	vm = _vm;
}

// 配置项
export const options = {
	isSetMTU: false, // 是否需要设置MTU ios不支持此设置
	mtuLen: 20, 	 // mtu长度
	services: [], // 指定UUID过滤设备	
	connectCount: 3, // 连接次数，默认3次
	connectTime: 20, // 连接超时
	isKeepConnect: false, // 是否保持连接
	keepConnectTime: 40, // 保持连接超时时间
	searchName: '', // 指定名称搜索设备
	searchSn:'',   // 指定序列号搜索
	searchMac:'',   // 指定mac地址搜索设备
	isSearchDeviceList: false, // 是否获取搜索设备列表,搜索结束会赋值false
	searchTime: 20, // 搜索设备时长
	getServiceCount:2,// 设置发现服务次数
}

var bleObj = {
	deviceId: '',
	characteristics: [],
	keepConnectTimer: null,
	currentKeepConnectTime: 0, // 当前保持连接超时时间
	searchTimer: null,
	currentSearchTime: 0, // 当前搜索超时时间
	connectTimer: null,
	currentConnectTime: 0, // 当前连接超时时间
	currentConnectCount: 0, // 当前发起连接次数
	currentGetServiceCount:0,// 当前发现服务次数
}

var bleStatus = {
	isStart: false, // 是否启动蓝牙
	isConnect: false, // 是否已连接
	isSearch:false,// 是否搜索到设备
}

module.export = {
	bleCommand: bleCommand,
}

// obj=deviceId 连接id,
//     mac 		设备mac地址,
export async function bleCommand(obj) {
	console.log(jsSimpleName + "options = ", JSON.stringify(options))
	await awaitTimeOut(100);
	bleCommand.obj = obj;
	bleCommand.successCallback = obj.success;
	bleCommand.failCallback = obj.fail;
	await startBleConnect();
}

export async function startBleConnect() {
	await getSystemInfo();
	if (bleStatus.isConnect) { // 是否已连接
		if (options.isKeepConnect) {// 是否保持连接状态
			bleObj.currentKeepConnectTime = options.keepConnectTime; // 每请求一次重置保持连接时长
		}
		if(options.isSearchDeviceList){// 当蓝牙处于连接状态，要进入搜索设备，则关闭连接，并进入搜索
			bleObj.characteristics = [];
			bleStatus.isConnect = false;
			closeBLEConnection();// 关闭设备连接
			getBluetoothAdapterState();
			return
		}
		// 返回已连接状态
		bleCommand.successCallback(callBack(1001));
	} else {
		if (bleStatus.isStart) { // 是否已开启蓝牙适配器，防止多次点击开启适配器
			if (options.isSearchDeviceList) { // 当前执行搜索设备列表时
				bleObj.deviceId = bleCommand.obj.deviceId;
				console.log(jsSimpleName + "isSearchDeviceList" + options.isSearchDeviceList)
				console.log(jsSimpleName + "deviceId" + bleObj.deviceId)
				if (bleObj.deviceId) { // 搜索过程中点击某一设备执行连接 
					clearSearchTimeOut(); // 关闭搜索超时
					options.isSearchDeviceList = false; // 停止搜索设备
					bleObj.currentConnectCount = 0; // 重置连接次数
					bleObj.currentGetServiceCount = 0;
					stopBluetoothDevicesDiscovery();// 停止搜索
					createBLEConnection();// 发起连接
				}else{// 正在搜索过程中，再次发起重新搜索
					getBluetoothAdapterState();
				}
			}
		} else {
			bleStatus.isStart = true;// 标记适配器已打开
			bleObj.currentConnectCount = 0; // 重置连接次数
			bleObj.currentGetServiceCount = 0;// 重置获取服务次数
			openBluetoothAdapter();
		}
	}
}

function getSystemInfo(){
	return new Promise((resolve, reject) => {
		wx.getSystemInfo({
			success: function(res) {
				console.log(jsSimpleName + 'system', (res.platform));
				bleObj.sysType = res.platform;
				resolve(res);
			}
		})
	
	});
}

export function openBluetoothAdapter() {
	console.log(jsSimpleName + '---bleApi---openBluetoothAdapter', "start")
	wx.openBluetoothAdapter({
		success: (res) => {
			console.log(jsSimpleName + '---bleApi---openBluetoothAdapter', "success==>" + JSON.stringify(res))
			if (options.isSearchDeviceList) { // 是否获取搜索列表
				getBluetoothAdapterState();
				return;
			}

			bleObj.deviceId = bleCommand.obj.deviceId;
			if (bleObj.deviceId) {
				createBLEConnection();
			} else {
				getBluetoothAdapterState();
			}
		},
		fail: (res) => {
			console.log(jsSimpleName + '---bleApi---openBluetoothAdapter', "fail==>" + JSON.stringify(res))
			closeBle();
			bleCommand.failCallback(callBack(res.errCode));
			// switch (wx.getSystemInfoSync().platform) {
			// 	case 'android':// app授权打开蓝牙
			// 		// #ifdef APP-PLUS
			// 		var bluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
			// 		var bAdapter = bluetoothAdapter.getDefaultAdapter();
			// 		if (!bAdapter.isEnabled()) {
			// 			bAdapter.enable()
			// 		}
			// 		// #endif
			// 		break;
			// 	case 'ios':
			// 		break;
			// }
		}
	})
}

export function getBluetoothAdapterState() {//69400 1294310 18.64 55500  1100546 19.83 13900 193764 13.94 
	console.log(jsSimpleName + '---bleApi---getBluetoothAdapterState', "start")
	wx.getBluetoothAdapterState({
		success: (res) => {
			console.log(jsSimpleName + '---bleApi---getBluetoothAdapterState', "success==>" + JSON.stringify(res))
			if (res.discovering) {
				wx.stopBluetoothDevicesDiscovery({
					complete:async (res) => {
						await awaitTimeOut(1000);
						startBluetoothDevicesDiscovery();
					},
				})
			} else if (res.available) {
				startBluetoothDevicesDiscovery(); //搜索蓝牙设备
			}
		},
		fail: (res) => {
			console.log(jsSimpleName + "---bleApi---startBluetoothDevicesDiscovery", "fail");
			closeBle();
			bleCommand.failCallback(callBack(res.errCode));
		}
	})
}

export function startBluetoothDevicesDiscovery() {
	console.log(jsSimpleName + '---bleApi---startBluetoothDevicesDiscovery', "start")
	startSearchTimeOut(); // 开启搜索超时
	wx.startBluetoothDevicesDiscovery({
		allowDuplicatesKey: false,
		services: options.services, // 指定UUID服务搜索设备
		interval:0,
		powerLevel:"high",
		success: (res) => {
			console.log(jsSimpleName + '---bleApi---startBluetoothDevicesDiscovery', "success==>" + JSON.stringify(res))
			switch (wx.getSystemInfoSync().platform) {
				case 'android':
					// #ifdef APP-PLUS
					// var context = plus.android.importClass("android.content.Context");
					// var locationManager = plus.android.importClass("android.location.LocationManager");
					// var main = plus.android.runtimeMainActivity();
					// var mainSvr = main.getSystemService(context.LOCATION_SERVICE);
					// if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
					// 	wx.showModal({
					// 	  title: '提示',
					// 	  content: '请打开定位服务功能',
					// 	  showCancel: false, // 不显示取消按钮
					// 	  success() {
					// 	    if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
					// 			closeBle();
					// 			var Intent = plus.android.importClass('android.content.Intent');
					// 			var Settings = plus.android.importClass('android.provider.Settings');
					// 			var intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS); 
					// 			main.startActivity(intent); // 打开系统设置GPS服务页面					   
					// 	    } else {
					// 			console.log('GPS功能已开启');
					// 			onBluetoothDeviceFound();			   
					// 	    }
					// 	  }
					// 	});			 
					// }else{
					// 	console.log('GPS功能已开启');	
					// 	onBluetoothDeviceFound();		 
					// }
					// #endif
					// #ifndef H5 
						onBluetoothDeviceFound();	
					// #endif
					
					break;
				case 'ios':
					// 	var UIApplication = plus.ios.import("UIApplication");
					//  var application2 = UIApplication.sharedApplication();
					//  var NSURL2 = plus.ios.import("NSURL");
					//  var setting2 = NSURL2.URLWithString("App-Prefs:root=Privacy&path=LOCATION");
					//  application2.openURL(setting2);
					//  plus.ios.deleteObject(setting2);
					//  plus.ios.deleteObject(NSURL2);
					//  plus.ios.deleteObject(application2);
					 onBluetoothDeviceFound();
				    break;
			}
		},
		fail: (res) => {
			console.log(jsSimpleName + "---bleApi---startBluetoothDevicesDiscovery", "fail");
			closeBle();
			bleCommand.failCallback(callBack(res.errCode));
		}
	})
}

export function onBluetoothDeviceFound() {
	console.log(jsSimpleName + "---bleApi---onBluetoothDeviceFounds", "start");
	wx.onBluetoothDeviceFound(function(res) {

		res.devices.forEach(device => {

			// console.log(jsSimpleName + "onBluetoothDeviceFound", '广播数据==>' + ab2hex(device.advertisData)) //5600f86aab19c5de,5600fdb12c1aa0ae4d4d3130303130303031303030313436
			console.log(jsSimpleName + "test", 'device.name==>' + device.name)
			console.log(jsSimpleName + "test", 'device.localName==>' + device.localName)
			if (!device.advertisData || device.advertisData.length <= 0) {
				return;
			}
			
			device.companyID = bleSDKUtils.hex2HexStr(device.advertisData.slice(0, 2));
			// console.log(jsSimpleName + "onBluetoothDeviceFound", 'companyID==>' + device.companyID)
			if (device.companyID != 7777 && device.companyID != 5600) {
				return;
			}
			
			device.broadcastData = ab2hex(device.advertisData)
			
			let mac = bleSDKUtils.hex2HexStr(device.advertisData.slice(2, 8));
			let regex = new RegExp("[0-9a-fA-F]{12}");
			if (!regex.test(mac)) {
				console.log(jsSimpleName + "mac format is error");
			}

			let sb = '';
			for (let i = 0; i < 12; i++) {
				let c = mac.charAt(i);
				sb = sb + c;
				if ((i & 1) == 1 && i <= 9) {
					sb = sb + ':';
				}
			}

			let flag = 0;
			if(device.name == "NS_QR"){// 打卡器
				// if (options.isSearchDeviceList) {
				// 	return;
				// }
				flag = 1;
				if(bleObj.sysType == "android"){
					// #ifdef APP-PLUS
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						2, 18))));
					// #endif
					// #ifndef H5 
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						8, 24))));
					// #endif
				}else{
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(8, 24))));
				}
				console.log(jsSimpleName + "device.sn",device.sn);
			}else if (device.name.indexOf('1HB')>-1 || device.name.indexOf('1SB')>-1) {// 水表
				flag = 2;
				let deviceName = device.name
				if(deviceName.indexOf('-')>-1){
					let strs = deviceName.split("-")
					device.localName = strs[0];
					device.name = strs[0];
					let factoryTestState = strs[1];
					device.factoryTestState = factoryTestState;
				}
				
			}else if(device.name.indexOf('H1A')>-1){// 蓝牙锁
				flag = 3;
				if(bleObj.sysType == "android"){
					// #ifdef APP-PLUS
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						2, 18))));
					device.state = bleSDKUtils.hex2HexStr(device.advertisData.slice(18, 19));
					// #endif
					// #ifndef H5 
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						8, 24))));
					device.state = bleSDKUtils.hex2HexStr(device.advertisData.slice(24, 25));	
					// #endif
				}else{
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						8, 24))));
					device.state = bleSDKUtils.hex2HexStr(device.advertisData.slice(24, 25));	
					
				}
				console.log(jsSimpleName + "device.sn",device.sn);
				console.log(jsSimpleName + "device.state",device.state);
			}else if(device.name.indexOf('NS')>-1){// 1.0锁
				flag = 4;
				if(bleObj.sysType == "android"){
					// #ifdef APP-PLUS
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						2, 18))));
					// #endif
					// #ifndef H5 
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						8, 24))));
					// #endif
				}else{
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						8, 24))));
				}
				
				console.log(jsSimpleName + "device.sn",device.sn);
			}else{
				flag = 5;
				if(bleObj.sysType == "android"){
					// #ifdef APP-PLUS
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						2, 18))));
					device.state = bleSDKUtils.hex2HexStr(device.advertisData.slice(18, 19));
					device.protocolVersion = bleSDKUtils.hex2HexStr(device.advertisData.slice(19, 20));	
					// #endif
					// #ifndef H5 
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						8, 24))));
					device.state = bleSDKUtils.hex2HexStr(device.advertisData.slice(24, 25));	
					device.protocolVersion = bleSDKUtils.hex2HexStr(device.advertisData.slice(25, 26));	
					// #endif
				}else{
					device.sn = bleSDKUtils.byteArray2Str(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(device.advertisData.slice(
						8, 24))));
					device.state = bleSDKUtils.hex2HexStr(device.advertisData.slice(24, 25));	
					device.protocolVersion = bleSDKUtils.hex2HexStr(device.advertisData.slice(25, 26));	
				}
				console.log(jsSimpleName + "device.sn",device.sn);
				console.log(jsSimpleName + "device.state",device.state);
			}

			device.mac = sb;
			device.flag = flag;

			console.log(jsSimpleName + "onBluetoothDeviceFound", '广播数据==>' + ab2hex(device.advertisData)) //5600f86aab19c5de,5600fdb12c1aa0ae4d4d3130303130303031303030313436
			
			console.log(jsSimpleName + "onBluetoothDeviceFound", 'device.name==>' + device.name)
			console.log(jsSimpleName + "onBluetoothDeviceFound", 'device.mac==>' + device.mac)
			console.log(jsSimpleName + "onBluetoothDeviceFound", "device.sn==>" + device.sn);
			console.log(jsSimpleName + "onBluetoothDeviceFound", "device.flag==>" + device.flag);
			console.log(jsSimpleName + "onBluetoothDeviceFound", "options.searchMac==>" + options.searchMac);
			console.log(jsSimpleName + "onBluetoothDeviceFound", "options.searchSn==>" + options.searchSn);
			
			if (options.isSearchDeviceList) { // 搜索到设备返回设备列表
				let searchName = options.searchName;
				let searchMac = options.searchMac;
				let searchSn = options.searchSn;
				if (searchName || searchMac || searchSn) { // 当搜索指定设备时
					if((device.name&&searchName === device.name) || (device.mac&&searchMac === device.mac) || (device.sn&&searchSn === device.sn)){
						clearSearchTimeOut(); // 关闭搜索超时
						stopBluetoothDevicesDiscovery(); // 关闭蓝牙
						bleCommand.successCallback(callBack(0, "搜索到设备", device));// 返回搜索的指定设备
					}
					return;// 继续搜索指定设备,直到搜索超时
				}
				
				bleStatus.isSearch = true;// 未指定设备，但搜索到某一类的设备时，标记搜索到设备，否者超时后按未搜索到任何设备处理
				bleCommand.successCallback(callBack(0, "搜索到设备", device)); // 返回搜索到设备
			} else {// 搜索到指定设备直接发起连接
				
				let searchName = options.searchName;
				let searchMac = options.searchMac;
				let searchSn = options.searchSn;
				
				if (searchName || searchMac || searchSn) {
					if ((device.name&&searchName === device.name) || (device.mac&&searchMac === device.mac) || (device.sn&&searchSn === device.sn)) {
						clearSearchTimeOut();
						bleObj.deviceId = device.deviceId;
						if (bleObj.deviceId) {
							stopBluetoothDevicesDiscovery();
							wx.setStorageSync("deviceId_"+searchSn,bleObj.deviceId)
							createBLEConnection();
						}
					}
				}
			}

		})
	})
}

function ab2hex(buffer) {
	const hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function(bit) {
			return ('00' + bit.toString(16)).slice(-2)
		}
	)
	return hexArr.join('')
}

export function createBLEConnection() {
	console.log(jsSimpleName + "---bleApi---createBLEConnection", "start");
	console.log(jsSimpleName + "createBLEConnection", ',设备deviceId==>' + bleObj.deviceId);
	let deviceId = bleObj.deviceId
	
	if(!bleObj.deviceId){
		return;
	}
	
	startConnectTimeOut();
	wx.createBLEConnection({
		deviceId,
		success:async (res) => {
			console.log(jsSimpleName + "---bleApi---createBLEConnection", "success==>" + JSON.stringify(res))
			clearConnectTimeOut(); // 结束连接超时
			startKeepConnectTimeOut(); // 开启保持连接超时
			onBLEConnectionStateChange();
			getBLEDeviceServices();
		},
		fail: (res) => {
			if (bleObj.currentConnectCount < options.connectCount) {
				bleObj.currentConnectCount++;
				clearConnectTimeOut();
				createBLEConnection();
			} else {
				closeBle();
				bleCommand.failCallback(callBack(res.errCode));
			}
		}
	})
}

export function onBLEConnectionStateChange(){
	wx.onBLEConnectionStateChange(function(res){
		if(bleStatus.isConnect){
			if(!res.connected){
				closeBle();
				bleCommand.failCallback(callBack(1105))
			}
		}
		
		console.log(jsSimpleName + '---bleApi---onBLEConnectionStateChange',`device ${res.deviceId} state has changed, connected: ${res.connected} isConnect: ${bleStatus.isConnect}` )
	})
}

export async function getBLEDeviceServices() {
	
	console.log(jsSimpleName + '---bleApi---getBLEDeviceServices', 'start,deviceId==>' + bleObj.deviceId)
	
	let deviceId = bleObj.deviceId
	
	if(!bleObj.deviceId){
		return;
	}
	
	let awaitTime = await awaitTimeOut(500);
	console.log(jsSimpleName + '---bleApi---getBLEDeviceServices', awaitTime)
	
	wx.getBLEDeviceServices({ 
		deviceId,
		success: (res) => {
			if(res.services.length>0){
				for (let i = 0; i < res.services.length; i++) {
					let uuid = res.services[i].uuid;
					if (uuid.indexOf("0000FEE7") >= 0 || uuid.indexOf("6E400001") >= 0) {
						if(options.isSetMTU){
							wx.setStorageSync('bleMtu',options.mtuLen);
							if(bleObj.sysType == "android"){
								wx.setBLEMTU({
									deviceId:deviceId,
									mtu:512,
									success:async (res)=>{
										console.log(jsSimpleName + "---bleApi---setBLEMTU", "success==>" + JSON.stringify(res))
										let awaitTime = await awaitTimeOut(450);
										console.log(jsSimpleName + '---bleApi---setBLEMTU', awaitTime)
										getBLEDeviceCharacteristics(deviceId, uuid)
										
									},
									fail:(res)=>{
										console.log(jsSimpleName + "---bleApi---setBLEMTU", "fail==>" + JSON.stringify(res))
										closeBle();
										bleCommand.failCallback(callBack(res.errCode));
									},
								});
							}else{
								getBLEDeviceCharacteristics(deviceId, uuid)
							}
						}else{
							wx.setStorageSync('bleMtu',18);
							getBLEDeviceCharacteristics(deviceId, uuid)
						}
						return
					}
				}
			}else{
				getBLEDeviceServices()
			}
		},
		fail: (err) => {
			if(err.errCode == 10004){
				if(!bleObj.deviceId){
					return;
				}
				wx.closeBLEConnection({
					deviceId: bleObj.deviceId,
					success(res) {
						if (bleObj.currentGetServiceCount < options.getServiceCount) {
							bleObj.currentGetServiceCount++;
							clearConnectTimeOut();
							clearKeepConnectTimeOut();
							createBLEConnection();
						} else {
							closeBle();
							// wx.setStorageSync("deviceId_"+options.searchSn,"")
							bleCommand.failCallback(callBack(1104))
						}
					},
					fail(err) {
						closeBle();
						bleCommand.failCallback(callBack(err.errCode)); 
					}
				})
			}else{
				closeBle();
				bleCommand.failCallback(callBack(err.errCode)); 
			}
			
		},
	}) 
}
 
export function getBLEDeviceCharacteristics(deviceId, serviceId) {
	console.log(jsSimpleName + '---bleApi---getBLEDeviceCharacteristics', "start")
	
	if(!deviceId){
		return;
	}
	
	bleStatus.isConnect = true;
	wx.getBLEDeviceCharacteristics({
		deviceId,
		serviceId,
		success: (res) => {

			console.log(jsSimpleName + '---bleApi---getBLEDeviceCharacteristics', "success=>" + JSON.stringify(res))

			let chs = res.characteristics;
			for (let i = 0; i < chs.length; i++) {
				let item = chs[i]
				if (item.properties.read) {
					console.log(jsSimpleName + "---bleApi---readBLECharacteristicValue", "start");
					wx.readBLECharacteristicValue({
						deviceId,
						serviceId,
						characteristicId: item.uuid,
					})
				}

				if ((item.properties.notify && !item.properties.write) || item.properties.indicate) {
					console.log(jsSimpleName + "---bleApi---notifyBLECharacteristicValueChange", "start");
					wx.notifyBLECharacteristicValueChange({
						deviceId,
						serviceId,
						characteristicId: item.uuid,
						state: true,
						success: function(res) {
							console.log(jsSimpleName + "---bleApi---notifyBLECharacteristicValueChange", "success");
							bleCommand.successCallback(callBack(1000, "",bleObj.deviceId));
						},
						fail: function(res) {
							bleCommand.failCallback(callBack(res.errCode, "没有找到指定特征值"));
							console.log(jsSimpleName + "---bleApi---notifyBLECharacteristicValueChange", "fail");
						}
					})
				}
				
				if (item.properties.write && !item.properties.notify) {
					console.log(jsSimpleName + "---bleApi---writeBLECharacteristicValue", "订阅");
					bleObj._deviceId = deviceId
					bleObj._serviceId = serviceId
					bleObj._characteristicId = item.uuid
				}

			}
		},
		fail(res) {
			closeBle();
			bleCommand.failCallback(callBack(res.errCode));
		}
	})

	wx.onBLECharacteristicValueChange((characteristic) => {
		
		if(!bleStatus.isConnect){
			return;
		}
		
		const idx = bleSDKUtils.inArray(bleObj.characteristics, 'uuid', characteristic.characteristicId)
		const data = {}
		if (idx === -1) {
			data[`chs[${bleObj.characteristics.length}]`] = {
				uuid: characteristic.characteristicId,
				value: bleSDKUtils.ab2hex(characteristic.value)
			}
		} else {
			data[`chs[${idx}]`] = {
				uuid: characteristic.characteristicId,
				value: bleSDKUtils.ab2hex(characteristic.value)
			}
		}
		console.log(jsSimpleName + "---bleApi---onBLECharacteristicValueChange", bleSDKUtils.ab2hex(characteristic.value));
		console.log("----------接收每包数据-----------------"+new Date().getTime())
		bleCommand.successCallback(callBack(0, "成功", characteristic.value));
	})
}

export function MsgFrameSender(msgFrame) {
	let buffer = new ArrayBuffer(msgFrame.length)
	var x = new Uint8Array(buffer);
	for (let i = 0; i < msgFrame.length; i++) {
		x[i] = msgFrame[i];
	}
	console.log(jsSimpleName + "MsgFrameSender-buffer.length", x.length);
	console.log(jsSimpleName + "MsgFrameSender-buffer-hexstr", bleSDKUtils.ab2hex(buffer));
	console.log(jsSimpleName + "bleObj._characteristicId", bleObj._characteristicId);

	console.log(jsSimpleName + "---bleApi---writeBLECharacteristicValue", "start");
	
	return new Promise((resolve, reject) => {  
		console.log("----------开始发送每包数据-----------------"+new Date().getTime())
		wx.writeBLECharacteristicValue({
			deviceId: bleObj._deviceId,
			serviceId: bleObj._serviceId,
			characteristicId: bleObj._characteristicId,
			value: buffer,
			success: function(res) {
				console.log(jsSimpleName + "---bleApi---writeBLECharacteristicValue", "success"+ JSON.stringify(res)+ " "+bleSDKUtils.ab2hex(buffer));
				console.log("----------完成每包数据发送-----------------"+new Date().getTime())
				resolve(res)
			},
			fail: function(res) {
				console.log(jsSimpleName + "---bleApi---writeBLECharacteristicValue ", "fail=>" + JSON.stringify(res));
				reject(res)
				// closeBle();
				// bleCommand.failCallback(callBack(res.errCode, "数据写入失败"));
			},
		})
		
		if(bleObj.sysType == "ios"){
			resolve(true)
		}

	});
	
	
}

export function stopBluetoothDevicesDiscovery() {
	wx.getBluetoothAdapterState({ // 获取蓝牙适配器状态
		success: (res) => {
			console.log(jsSimpleName + '---bleApi---getBluetoothAdapterState', JSON.stringify(res))
			if (res.discovering) { // 蓝牙是正在搜索设备
				wx.stopBluetoothDevicesDiscovery({
					success(res) {
						console.log(jsSimpleName + "---bleApi---stopBluetoothDevicesDiscovery", "success" + JSON.stringify(res));
					},
					fail(res) {
						console.log(jsSimpleName + "---bleApi---stopBluetoothDevicesDiscovery", "fail" + JSON.stringify(res));
					}
				})
			}
		}
	})
}

export function closeBleInit() {
	wx.getBluetoothAdapterState({ // 获取蓝牙适配器状态
		success: (res) => {
			console.log(jsSimpleName + '---bleApi---getBluetoothAdapterState', JSON.stringify(res))
			if (res.discovering) { // 蓝牙是正在搜索设备
				wx.stopBluetoothDevicesDiscovery({
					success(res) {
						console.log(jsSimpleName + "---bleApi---stopBluetoothDevicesDiscovery", "success" + JSON.stringify(res));
					},
					fail(res) {
						console.log(jsSimpleName + "---bleApi---stopBluetoothDevicesDiscovery", "fail" + JSON.stringify(res));
					},
					complete(res) {
						closeBluetoothAdapter();
					}
				})
			}else{
				closeBluetoothAdapter();
			}
		}
	})
}

export function closeBLEConnection() {
	if (bleObj.deviceId) {
		wx.closeBLEConnection({
			deviceId: bleObj.deviceId,
			success(res) {
				console.log(jsSimpleName + "---bleApi---closeBLEConnection", "success" + JSON.stringify(res));
			},
			fail(res) {
				console.log(jsSimpleName + "---bleApi---closeBLEConnection", "fail" + JSON.stringify(res));
			}
		})
	}
}

export function closeBluetoothAdapter() {
	wx.closeBluetoothAdapter({
		success(res) {
			bleObj.deviceId = '';
			console.log(jsSimpleName + "---bleApi---closeBluetoothAdapter", "success" + JSON.stringify(res));
		},
		fail(res) {
			console.log(jsSimpleName + "---bleApi---closeBluetoothAdapter", "fail" + JSON.stringify(res));
		}
	})
}

export function close() {
	if (!options.isKeepConnect) {
		closeBle();
	}
}

export async function closeBle() {
	
	console.log(jsSimpleName + "closeBle()","关闭蓝牙,"+bleStatus.isStart);
	options.isSearchDeviceList = false;

	if (bleStatus.isConnect) { // 关闭设备连接
		bleObj.characteristics = [];
		bleStatus.isConnect = false;
		closeBLEConnection();
	}else if(bleObj.deviceId){
		bleObj.deviceId = '';
	}
	
	

	if (bleStatus.isStart) { // 关闭蓝牙适配器
		bleStatus.isStart = false;
		closeBleInit();
	}

	clearSearchTimeOut();
	clearConnectTimeOut();
	clearKeepConnectTimeOut();
}

export function startSearchTimeOut() {
	bleObj.currentSearchTime = options.searchTime;
	if(!bleObj.searchTimer){
		bleObj.searchTimer = setInterval(function() {
			bleObj.currentSearchTime--;
			if (0 == bleObj.currentSearchTime) { // 搜索超时
				closeBle();
				if (options.isSearchDeviceList) { // 获取搜索列表时,返回搜索结束
					options.isSearchDeviceList = false;
					if (!options.searchName || !options.searchMac || !options.searchSn) { // 如果是搜索指定设备超时，则不走该返回
						bleCommand.successCallback(callBack(1002)) // 搜索完成
						return;
					}
				}
				if(bleStatus.isSearch){
					bleStatus.isSearch = false;
					bleCommand.successCallback(callBack(1002))
				}else{
					bleCommand.failCallback(callBack(1100));
				}
				
			}
		}, 1000)
	}
}

export function startConnectTimeOut() {
	bleObj.currentConnectTime = options.connectTime;
	if(!bleObj.connectTimer){
		bleObj.connectTimer = setInterval(function() {
			bleObj.currentConnectTime--;
			if (0 == bleObj.currentConnectTime) {
				closeBle();
				bleCommand.failCallback(callBack(1101));
			}
		}, 1000)
	}
}


export function startKeepConnectTimeOut() {
	if (options.isKeepConnect) {
		bleObj.currentKeepConnectTime = options.keepConnectTime;
		if(bleObj.keepConnectTimer){
			bleObj.keepConnectTimer = setInterval(function() {
				bleObj.currentKeepConnectTime--;
				if (bleObj.currentKeepConnectTime == 0) {
					closeBle();
					bleCommand.failCallback(callBack(1102));// 保持连接超时自动断开
				}
			}, 1000)
		}
	}
}

export function clearSearchTimeOut() {
	if (bleObj.searchTimer) { // 关闭搜索超时
		clearInterval(bleObj.searchTimer);
		bleObj.searchTimer = null;
	}
}

export function clearConnectTimeOut() {
	if (bleObj.connectTimer) { // 关闭连接超时
		clearInterval(bleObj.connectTimer);
		bleObj.connectTimer = null;
	}
}

export function clearKeepConnectTimeOut() {
	if (bleObj.keepConnectTimer) { // 关闭保持连接超时
		clearInterval(bleObj.keepConnectTimer);
		bleObj.keepConnectTimer = null;
	}
}

export function callBack(code, msg, data) {
	let errMsg = "";
	if (msg) {
		errMsg = msg
	} else {
		switch (code) {
			case 2:
				errMsg = "未开启定位权限"
				break;
			case 1000:
				errMsg = "连接成功";
				break;
			case 1001:
				errMsg = "已鉴权或无需鉴权设备,发送指令";
				break;
			case 1002:
				errMsg = "搜索完成";
				break;
			case 1003:
				errMsg = "搜索到设备";
				break;
			case 1100:
				errMsg = "未搜索到设备";
				break;
			case 1101:
				errMsg = "连接超时";
				break;
			case 1102:
				errMsg = "保持连接超时断开";
				break;
			case 1103:
				errMsg = "鉴权失败";
				break;
			case 1104:
				errMsg = "无法获取服务";
				break;
			case 1105:
				errMsg = "设备主动断开连接";
				break;
			case 10000:
				errMsg = "未初始化蓝牙适配器";
				break;
			case 10001:
				errMsg = "当前蓝牙适配器不可用"; // 当前蓝牙适配器不可用
				break;
			case 10002:
				errMsg = "没有找到指定设备";
				// wx.setStorageSync("deviceId_"+options.searchSn,"")
				break;
			case 10003:
				errMsg = "连接失败";
				break;
			case 10004:
				errMsg = "没有找到指定服务";
				break;
			case 10005:
				errMsg = "没有找到指定特征值";
				break;
			case 10006:
				errMsg = "当前连接已断开";
				break;
			case 10007:
				errMsg = "当前特征值不支持此操作";
				break;
			case 10008:
				errMsg = "其余所有系统上报的异常";
				break;
			case 10009:
				errMsg = "Android 系统特有，系统版本低于 4.3 不支持 BLE";
				break;
			case 10010:
				errMsg = "已连接";
				break;
			case 10011:
				errMsg = "配对设备需要配对码";
				break;
			case 10012:
				errMsg = "连接超时";
				break;
			case 10013:
				errMsg = "连接 deviceId 为空或者是格式不正确";
				break;
			default:
				code = -1
				errMsg = "指令返回失败";
				break;
		}
	}

	let callBack = {
		code: code,
		msg: errMsg,
	};
	if (data) {
		callBack.data = data;
	}

	return callBack;
}

export async function sendCmd(msgFrames) { // 检查数据是否存在
	
	for (let i = 0; i < msgFrames.length; i++) {
		await sendCmdMsgFrame(msgFrames[i]);
	}
}
async function sendCmdMsgFrame(msgFrame){
	try{
		let result = await MsgFrameSender(msgFrame);
		console.log(JSON.stringify(result));
	}catch(e){
		console.log(JSON.stringify(e));
		await awaitTimeOut(500);
		if(bleStatus.isConnect){
			await sendCmdMsgFrame(msgFrame)
		}
	}
}

function awaitTimeOut(m){
	return new Promise((resolve, reject) => {  
		setTimeout(()=>{
			resolve("延迟"+m+"毫秒")
		},m)
	});
}
