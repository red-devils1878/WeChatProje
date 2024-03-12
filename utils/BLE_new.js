const app = getApp()

var serviceUUID = [] //service uuid
var writeUUID = ""; //write UUIDf
var notifyUUID = ""; //notify UUID
var filterDeviceName = ""; //过滤设备名称
var filterDeviceId = ""; //过滤设备Id

var macAddress = ""; //mac地址
var _discoveryStarted = false;
var deviceId = ''; //设备ID
var sn = ''; //设备SN号

var _enc = false;
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
var _that = null;
var _cmdList = [];
var _cmdNum = 0;

var _recvDataPacket = "";
var _packx = 0;
var connectCallBackEventListener = null; //连接回调事件监听
var returnValueCallBackEventListener = null; //执行结果回调事件监听
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
function openBLEConnection(dsn,callback) {
    filterDeviceName = dsn;
    if( typeof callback == "function" ){
        connectCallBackEventListener = callback;
    }
    closeBLEConnection();
    _discoveryStarted = false;
    isnotExist = true;
    wx.openBluetoothAdapter({
        success: (res) => {
            console.log('openBluetoothAdapter 初始化蓝牙模块是否成功:', res);
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
function onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
        res.devices.forEach(device => {
            if( !!device.localName ){
                if ( filterDeviceName == device.localName && isnotExist) {
                    isnotExist = false;
                    deviceId = device.deviceId;
                    stopBluetoothDevicesDiscovery();
                    createBLEConnection();
                }
            }
        })
    })
}
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
function stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
}
function createBLEConnection() {
    var that = _that;
    showLoading('连接中...');
console.log("createBLEConnection deviceId:"+deviceId);
    wx.createBLEConnection({
        deviceId: deviceId,
        success: (res) => {
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
function closeBLEConnection() {
    stopBluetoothDevicesDiscovery();
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
    _connectionState = false;
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
function getBLEDeviceServices(deviceId) {
    wx.onBLEConnectionStateChange(function (res) {
        console.log("onBLEConnectionStateChange:", res);
        _connectionState = res.connected;
        if (res.connected == false) {
            console.log("连接意外断开等****", _deviceId);
            _deviceId = '';
            _authState = false;
            callBackEventListener(1010,'已断开');
        }else{
            console.log("onBLEConnectionStateChange:",_connectionState);
            success("连接成功");
            callBackEventListener(0,'已连接');
        }
    });
    wx.getBLEDeviceServices({
        deviceId: deviceId,
        success: (res) => {
            console.log("services:",res.services);
            serviceUUID = res.services[0].uuid;
            getBLEDeviceCharacteristics(deviceId, res.services[0].uuid);
        },
        fail: (res) => {
            console.log('getBLEDeviceServices fail', res);
        }
    })
}
function getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: serviceId,
        success: (res) => {
            console.log("getBLEDeviceCharacteristics:",res.characteristics);
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
                },
                fail: function fail(res) {
                    console.log('notifyBLECharacteristicValueChange fali', res);
                }
            });
            wx.onBLECharacteristicValueChange(function (res) {
                console.log(">>> onBLECharacteristicValueChange");
                var hex = ab2hex(res.value).toUpperCase();
                console.log("设备返回数据--->", hex);
                if( hex.substr(0,4) == '4D46' ){
                    _recvDataPacket = hex;
                    _packx = 1;
                    if( hex.length < 40 ){
                        console.log("_recvDataPacket:",_recvDataPacket);
                        returnValueCallBackEventListener({errCode:0,errMsg:'操作成功',data:_recvDataPacket});
                    }
                }else if( _recvDataPacket != "" ){
                    _recvDataPacket += hex;
                    _packx += 1;
                    if( hex.length < 40 || _packx == 3 ){
                        console.log("_recvDataPacket:",_recvDataPacket);
                        returnValueCallBackEventListener({errCode:0,errMsg:'操作成功',data:_recvDataPacket});
                    }
                }else{
                    console.log("_recvDataPacket:",_recvDataPacket);
                    returnValueCallBackEventListener({errCode:0,errMsg:'操作成功',data:_recvDataPacket});
                }
            })
        },
        fail: (res) => {
            console.log('getBLEDeviceCharacteristics fail', res)
        }
    })
}
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
    console.log("cmd:",cmd);
    var cmds = packages(cmd);
    writeDataEx(cmds);
}
function writeDataEx(cmds,idx) {
    var cmd = "";
    var idx = (!!idx) ? idx:0;
    if( typeof(cmds) == "string" ){
        cmd = cmds;
    }else if( typeof(cmds) == "object" ){
        cmd = cmds[idx];
    }
    console.log('cmd:', cmd);
    if( !cmd ){
        return;
    }
    wx.writeBLECharacteristicValue({
        deviceId: _deviceId,
        serviceId: _serviceId,
        characteristicId: _characteristicId,
        value: hex2buf( cmd ),
        success: function(res) {
            console.log(idx.toString() + '发送成功', res.errMsg);
            if ( (typeof(cmds) == "object" && idx >= cmds.length-1) || typeof(cmds) == "string" ) {
                wx.showToast({
                  title: '发送成功',
                  icon: 'success',
                  duration: 2000
                })
                //returnValueCallBackEventListener({errCode:-1,errMsg:'发送成功',data:res});
            }else{
                setTimeout(function() {
                    writeDataEx(cmds,idx+1);
                }, 10)
            }
        },
        fail: function(res) {
            console.log(res);
            idx = 0;
        }
    })
  }
  function packages(cmd) {
    var cmdList = [];
    var packageSize = 20*2;
    var packageCount = Math.ceil(cmd.length / packageSize);
    for (let i = 0; i < packageCount; i++) {
      let cmdItem = '';
      if (i == packageCount - 1) {
        cmdItem = cmd.substring(cmd.length % packageSize == 0 ? packageSize : cmd.length - cmd.length % packageSize);
      } else {
        cmdItem = cmd.substr(i == 0 ? 0 : i * packageSize, packageSize);
      }
      cmdList[i] = cmdItem;
    }
    console.log(cmdList)
    return cmdList;
  }
  function char2buf(str) {
    var out = new ArrayBuffer(str.length)
    var u8a = new Uint8Array(out)
    var strs = str.split("")
    for (var i = 0; i < strs.length; i++) {
      u8a[i] = strs[i].charCodeAt()
    }
    return out
  }
  function hideLoading() {
    wx.hideLoading();
  }
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