const app = getApp()

var serviceUUID = [] //service uuid
var writeUUID = ""; //write UUIDf
var notifyUUID = ""; //notify UUID
var filterDeviceName = ""; //过滤设备名称 A4C138CADE19  501A102106013646

var macAddress = ""; //mac地址
var _discoveryStarted = false;
var deviceId = ''; //设备ID
var sn = ''; //设备SN号

var _enc = true;
var _preLen = 12;
var _preno = "";

var _deviceId = '';
var _serviceId = '';
var _characteristicId = '';
var _characteristicId_Read = '';
var _connectionState = false;
var _authState = false;
var status = false; //当前状态
var action_type = ''; //操作类型
var isnotExist = true //防止多次执行
var _oplog = "";

var connectCallBackEventListener = null; //连接回调事件监听
var returnValueCallBackEventListener = null; //执行结果回调事件监听

//当前操作类型
var OptionEnum = {
    None: -1,
    Connection: 0, //连接
    Reconnection: 1, //重连
    LockCmd: 2, //指令
    LockStatus: 3, //门锁状态
    OpenLock: 4 //打开门锁
};
var action_type = OptionEnum.None;

function ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function (bit) {
            return ('00' + bit.toString(16)).slice(-2)
        }
    )
    return hexArr.join('');
}

function hex2buf(str){
  var hex = str
  var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  }))
  return typedArray.buffer
}

/**
* 初始化蓝牙模块
* 参数1：mac地址
*/
function openBLEConnection(mac,callback) {
    filterDeviceName = mac.replace(/:/g, "");
    macAddress = mac;
    if( typeof callback == "function" ){
        connectCallBackEventListener = callback;
    }

    //断开连接
    closeBLEConnection();

    _discoveryStarted = false;
    isnotExist = true;
    //初始化蓝牙模块
    wx.openBluetoothAdapter({
        success: (res) => {
            console.log('openBluetoothAdapter 初始化蓝牙模块是否成功:', res);
            // 监听寻找新设备事件
            onBluetoothDeviceFound();
            
            startBluetoothDevicesDiscovery();
        },
        fail: (res) => {
            console.log('初始化蓝牙失败', res);
            callBackEventListener(res.errCode,res.errMsg);
        }
    })
}

function onBluetoothAdapterStateChange(){
    wx.onBluetoothAdapterStateChange(function(res) {
        console.log('onBluetoothAdapterStateChange:',res);
        if( !res.available ){
          //statusText = '请先开启手机蓝牙';
        }else if ( res.discovering ){
          //statusText = '扫描中...';
        }else{
          //statusText = '已停止扫描';
        }
    })
}

/**
 * 监听寻找新设备事件
 * 
 */
function onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {

        res.devices.forEach(device => {
            if (!device.localName) {
                return
            }
            
			let device_name = device.localName.toUpperCase();
			if ( !!device_name && (device_name.indexOf(filterDeviceName) != -1) && isnotExist) {
				isnotExist = false;
				deviceId = device.deviceId;

				stopBluetoothDevicesDiscovery();
				createBLEConnection();
			}
        })
    })
}

/**
 * 执行连接蓝牙设备
 */
function startBluetoothDevicesDiscovery() {
    if (!!_discoveryStarted) {
        return;
    }
    _discoveryStarted = true

    showLoading('搜索中...');

    wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: true,
        success: (res) => {
        },
        fail(res) {
            console.log('startBluetoothDevicesDiscovery ==>fail', res);
            callBackEventListener(res.errCode,res.errMsg);
        }
    })
}

//停止搜寻蓝牙设备。
function stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
}

/**
 * 连接蓝牙设备
 */
function createBLEConnection() {
    var that = this;
    showLoading('连接中...');

    wx.createBLEConnection({
        deviceId: deviceId,
        success: (res) => {
            //获取蓝牙所有服务
            getBLEDeviceServices(deviceId)
        },
        fail: (res) => {
            console.log('createBLEConnection ==>fail', res);
            callBackEventListener(res.errCode, res.errMsg);
        }
    })
    stopBluetoothDevicesDiscovery();
}

function callBackEventListener(errCode,errMsg){
    if( typeof connectCallBackEventListener == "function" ){
        connectCallBackEventListener({
            errCode:errCode,
            errMsg:errMsg
        });
    }
}

/**
 * 断开蓝牙连接
 */
function closeBLEConnection() {
    stopBluetoothDevicesDiscovery();
    console.log("deviceId-->:"+deviceId);
    if (deviceId) {
        wx.closeBLEConnection({
            deviceId: deviceId,
            success: function (res){
                console.log("closeBLEConnection。success", res);
            },
            fail: function (res){
                console.log("closeBLEConnection。fail", res);
            },
            complete: function (){
                status = false;
            }
        })
        /* --20220214先移到外面
        wx.closeBluetoothAdapter({
            success: function (res) {
                console.log("蓝牙列表关闭成功！");
                console.log("closeBluetoothAdapter ==>res:", res);
            },
            fail: function (error) {
                console.log("蓝牙列表关闭失败！");
                console.log("closeBluetoothAdapter ==>error:", error);
            }
        })*/
    }      
        wx.closeBluetoothAdapter({
            success: function (res) {
                console.log("蓝牙列表关闭成功！");
                console.log("closeBluetoothAdapter ==>res:", res);
            },
            fail: function (error) {
                console.log("蓝牙列表关闭失败！");
                console.log("closeBluetoothAdapter ==>error:", error);
            }
        })
    _discoveryStarted = false;
    isnotExist = true;
    _deviceId = '';
    deviceId = '';
    _authState = false;
}

/**
 * 密钥配对.ask
 */
function KeyPairing_ask(){
    showLoading('配对中...');

    if( !deviceId ){
      return false;
    }
    setTimeout(() => {
      sendCommand("00AA551200A000AA551200A0AA55020076CC");
    }, 1000);
}
/**
 * 密钥配对.answer
 */
function KeyPairing_answer(authcode){
    console.log("deviceid",macAddress);
    console.log("authcode",authcode);
    try{
      wx.request({
        url: app.globalData.apiHost.replace("/api/lock/","/api/auth/") + 'identification',
        data: {deviceid:macAddress,authcode:authcode,prefix:prefix()},
        method: "post",
        header: {'content-type': 'application/x-www-form-urlencoded'},
        success(res) {
          console.log("identification wx.request success:",res);
          if( res.statusCode == 200 && ( res.data.code == 0 || res.code == 500 ) ){
            console.log("KeyPairing_answer res",res);
            var cmd = res.data.data.encText;
            _preno = cmd.substr(0,12);
            if( _enc ){
                cmd = res.data.data.cmd;
            }
              
            if(res.code == 500){
                error(res.data.message);
            }
            setTimeout(() => {
                sendCommand(_preno + cmd);
            }, 100);
          }else if(res.statusCode == 200){
            error(res.data.message);
          }else{
            error("服务异常");
          }
        }
      });
    }catch(e){
      console.log("identification wx.request e:",e);
    }
}

function connectionState(){
    return _connectionState;
}

function authState(){
    return _authState;
}

function prefix(){
    if( !_enc ){
        return "";
    }
    var suffix = random(2);
    var timestamp = Date.parse(new Date());
    var pre = timestamp / 1000  + suffix;
    return pre;
}

function random(iLen) {
    var code = '';
    var len = (!iLen) ? 8:iLen;
    var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    for (var i = 0; i < len; i++) {
        var index = Math.floor(Math.random() * (9-0) + 0);
        code += random[index];
    }
    return code;
}

function showLoading(title){
    wx.showToast({
        title: title,
        icon: 'loading',
        duration: 10000
    })
}

function success(title){
  wx.showToast({
    title: title,
    icon:'success',
    duration: 1200
  })
}

function error(title){
  wx.showToast({
    title: title,
    icon:'error',
    duration: 2000
  })
}

/**
 * 获取蓝牙所有服务
 */
function getBLEDeviceServices(deviceId) {
    let dsn_old = "";  //20221020,为了防止新款锁调用配对代码
    dsn_old = filterDeviceName;
    wx.onBLEConnectionStateChange(function (res) {
        console.log("onBLEConnectionStateChange:", res);
        _connectionState = res.connected;
        if (res.connected == false) {
            console.log("连接意外断开等****", _deviceId);
            _deviceId = '';
            _authState = false;
            callBackEventListener(1010,'已断开');
        }else{
            if(dsn_old.indexOf('501A') != -1){
                dsn_old = "";//初始化
                setTimeout(() => {
                    KeyPairing_ask();
                 }, 10)
                 //callBackEventListener(0,'已连接');
            }
        }
    });

    wx.getBLEDeviceServices({
        deviceId: deviceId,
        success: (res) => {
            serviceUUID = res.services[1].uuid;
            getBLEDeviceCharacteristics(deviceId, res.services[1].uuid);
        },
        fail: (res) => {
            console.log('getBLEDeviceServices fail', res);
        }
    })
}

/**
 * 获取蓝牙特征值
 */
function getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: serviceId,
        success: (res) => {
            _characteristicId_Read = res.characteristics[0].uuid;
            wx.readBLECharacteristicValue({
                deviceId: deviceId,
                serviceId: serviceId,
                characteristicId: _characteristicId_Read
            });

            _deviceId = deviceId;
            _serviceId = serviceId;
            _characteristicId = res.characteristics[res.characteristics.length - 1].uuid;

            wx.notifyBLECharacteristicValueChange({
                deviceId: deviceId,
                serviceId: serviceId,
                characteristicId: _characteristicId_Read,
                state: true,
                success: function success(res) {
                    console.log('notification 通知数据', res);
                    status = true;
                    // wx.hideLoading();
                },
                fail: function fail(res) {
                    console.log('notifyBLECharacteristicValueChange fali', res);
                }
            });

            // 监听
            wx.onBLECharacteristicValueChange(function (res) {
                console.log(">>> onBLECharacteristicValueChange");

                var hex = ab2hex(res.value).toUpperCase();
                console.log("设备返回数据--->", hex);

                //连接密钥验证
                if( hex.indexOf('AA551200A0') != -1 || hex.indexOf('AA552200A0') != -1  || hex.indexOf('AA552800A0') != -1 ){
                    //连接密钥验证
                    var authcode =  hex.substr(_preLen + 10,32);
                    KeyPairing_answer(authcode);
                }else if( hex.indexOf('AA550300A0') != -1 ){
                    var resultcode = hex.substr(_preLen + 10,2);
                    if( resultcode == "01" ){
                        error("配对失败");
                        //callBackEventListener(1,'密钥配对失败');
                    }
                    else if( resultcode == "00" ){
                        _authState = true;
                        success("配对成功");
                        //wx.hideLoading();
                        callBackEventListener(0,'配对成功');
                    }
                }else{
                    var cmdid = hex.substr(0,_preLen);
                    var errCode = 0;
                    var errMsg = "操作成功";
                    var resultcode = "";
                    if( cmdid == _preno ){
                        if( hex.indexOf('AA550300940068') != -1 ){
                            returnValueCallBackEventListener({errCode:errCode,errMsg:errMsg,res:res});
                        }else if( hex.indexOf('AA5507005F03') != -1 || hex.indexOf('AA5507005F04') != -1 || hex.indexOf('AA5507005F01') != -1){
                            resultcode = hex.substr(12+18,2);
                            //if( !(resultcode == "00" || resultcode == "02") ){
                            if( resultcode != "00" ){
                                errCode = resultcode.slice(-1);
                                errMsg = "操作失败"
                            }
                            returnValueCallBackEventListener({errCode:errCode,errMsg:errMsg,res:hex});
                        }else if (hex.indexOf('AA550300B0') != -1 ){
                            resultcode = hex.substr(12+10,2);
                            if( resultcode != "00" ){
                                errCode = 1;
                                errMsg = "操作失败"
                            }
                            returnValueCallBackEventListener({errCode:errCode,errMsg:errMsg,res:hex});
                        }else if( hex.indexOf('AA5503009A0066') != -1 ){
                        }else if( hex.indexOf('AA550300B9') != -1 ){
                            resultcode = hex.substr(12+10,2);
                            if( resultcode != "00" ){
                                errCode = 1;
                                errMsg = "操作失败"
                            }
                            returnValueCallBackEventListener({errCode:errCode,errMsg:errMsg,res:hex});
                        }else if( hex.indexOf('003500000000') != -1 ){
                            //采集开门记录
                            var packn = hex.substr(12+18,2);
                            console.log("packn:",packn);
                            var packx = hex.substr(12+20,2);
                            console.log("packx:",packx);
                    
                            console.log("pack"+packx+" data:",hex.substr(12+22,hex.length-12-22-2) );
                    
                            if(packx == "01"){
                              //第一包
                              _oplog = hex.substr(12+22,hex.length-12-22-2);
                            }else{
                              _oplog = _oplog + hex.substr(12+22,hex.length-12-22-2);
                            }
                            if( packx == packn ){
                              //最后一包
                              console.log("_oplog:",_oplog);
                              success("操作成功");
                              returnValueCallBackEventListener({errCode:errCode,errMsg:errMsg,res:_oplog});
                            }
                        }
                    }
                }
                //dohandle
            })
        },
        fail: (res) => {
            console.log('getBLEDeviceCharacteristics fail', res)
        }
    })
}

/**
 * 写入数据
 */
function sendCommand(cmd, callback) {
    if (!status) {
        return;
    }
    if (!_deviceId) {
        return;
    }
    if( typeof callback == "function" ){
        returnValueCallBackEventListener = callback;
    }
    _preno = cmd.substr(0,_preLen);
    cmd = cmd.substr(_preLen);

    setTimeout(() => {
        var typedArray = new Uint8Array(cmd.match(/[\da-f]{2}/gi).map(function (h) {
          return parseInt(h, 16)
        }))
        var buffer1 = typedArray.buffer;

        wx.writeBLECharacteristicValue({
            deviceId: _deviceId,
            serviceId: _serviceId,
            characteristicId: _characteristicId,
            value: buffer1,
            success: (res) => {
                //wx.hideLoading();
                console.log("写数据返回结果", res.errMsg);
            },
            fail(res) {
                console.log("写数据失败..", res);
            }
        })
    }, 100)
}


/**
 * 门锁
 */
var Lock = {
    /**
    * 开锁指令
    */
    openLock: function (callBack) {
        status = true;
        returnValueCallBackEventListener = callBack;
        let hex = "AA55*****CC";
        writeData(hex);
    },

    /**
     * 处理开锁成功回调
     */
    openLockCallback: function (resData) {
        var isOpenLock = false;
    }
}

/**
 * 清空loadding
 */
function hideLoading() {
    wx.hideLoading();
}

/**
 * 检查是否打开蓝牙
 * 未连接设备前检测
 */
function checkIsOpenBluetooth(isEXec) {
    wx.openBluetoothAdapter({
        success: (res) => {
            isEXec(true);
        },
        fail: (res) => {
            wx.showModal({
                title: '提示',
                content: '请检查手机蓝牙是否打开',
                showCancel: false
            })

            isEXec(false);
        }
    })
}
/**
 * 蓝牙连接过程中错误码
 * 
 */
function bluetoothStatus(errorType) {
    switch (errorType) {
        case 10001:
            wx.showModal({
                title: '提示',
                content: '请检查手机蓝牙是否打开',
                showCancel: false
            })
            break;
        case 10002:
            wx.showToast({
                title: '没有找到指定设备',
                icon: 'none'
            })
            break;
        case 10003:
            wx.showToast({
                title: '连接失败',
                icon: 'none'
            })
            closeBLEConnection();
            break;
        case 10004:
            wx.showToast({
                title: '没有找到指定服务',
                icon: 'none'
            })
            closeBLEConnection();
            break;
        case 10005:
            wx.showToast({
                title: '没有找到指定特征值',
                icon: 'none'
            })
            closeBLEConnection();
            break;
        case 10007:
        case 10008:
        case 10013:
            wx.showToast({
                title: '设备启动失败，请重试',
                icon: 'none'
            })
            break;
        case 10009:
            wx.showModal({
                title: '提示',
                content: '当前系统版本过低，请更新版本体验',
                showCancel: false
            })
            break;
        case 10012:
            wx.showToast({
                title: '连接超时',
                icon: 'none'
            })
            break;
    }
}

module.exports = {
    openBLEConnection: openBLEConnection,
    closeBLEConnection: closeBLEConnection,
    sendCommand: sendCommand,
    connectionState: connectionState,
    authState: authState
}