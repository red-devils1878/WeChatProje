//公共js
var app = getApp();
var apiPC = app.globalData.apiPC;   //获取门锁api地址
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
var callBackValue = null; //返回值的监听事件
var _result = false;
//10进制转16进制
function ex10hex(num, width) {
  var hex = "0123456789ABCDEF";
  var s = "";
  while (num) {
    s = hex.charAt(num % 16) + s;
    num = Math.floor(num / 16);
  }
  if (typeof width === "undefined" || width <= s.length) {
    //return "0x" + s;//如果返回四位这个解开
    return s;
  }
  var delta = width - s.length;
  var padding = "";
  while(delta-- > 0) {
    padding += "0";
  }
  return padding + s;
}

//16进制转10进制
function ex16hex(hex) {
  var len = hex.length, a = new Array(len), code;
  for (var i = 0; i < len; i++) {
      code = hex.charCodeAt(i);
      if (48<=code && code < 58) {
          code -= 48;
      } else {
          code = (code & 0xdf) - 65 + 10;
      }
      a[i] = code;
  }
  return a.reduce(function(acc, c) {
      acc = 16 * acc + c;
      return acc;
  }, 0);
}

//获取加密后的值
function get_encryption(dsn,cmd,callback) {
  if( typeof callback == "function" ){
    callBackValue = callback;
}
  var that = this;
  var _data = {"deviceid":dsn,"cmd":cmd};
  wx.request({
    url: apiPC,  //api地址
    data: _data,
    header: {'content-type': 'application/x-www-form-urlencoded'},
    method: "post",
    success(res) {
      let cmd = res.data.data.cmd;   //加密后的值
      if(!!cmd){
        callBackValue({errCode2:'1001',errMsg:'加密成功',cmd:cmd})
      }
      else{
        wx.showToast({
          title: '加密失败',
          icon: "error",
          duration: 1000
        })          
      }
    },
    fail(res) {
      console.log("getunits fail:",res);
    },
    complete(){
    }
  });
}
//冻结解冻用户编号转换
function str2hex(strs) {
      var hex2 = "8040201008040201"
      var u8a2 = new Uint8Array(hex2.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
      }));
      var hex = "00000000000000000000000000";
      var u8a = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
          return parseInt(h, 16)
      }));
      var arr = strs.match(/[\da-f]{2}/gi).map(function (h) {
        return h
      });
      console.log("strs:", arr);
      var a,b =0;
      for (var i = 0; i < arr.length; i++) {
          a = parseInt( arr[i]*1 / 8 );
          b = parseInt(arr[i]*1 % 8);
          u8a[a] += u8a2[b];
      }
      var hexArr = Array.prototype.map.call(
        new Uint8Array(u8a.buffer),
        function(bit) {
          return ('00' + bit.toString(16)).slice(-2)
        }
      )
      return hexArr.join('');
}
//获取网关和蓝牙连接状态
function get_Connection(dsn,callback) {
  if( typeof callback == "function" ){
    _result = callback;
  }
  var _data = {ac: 'get_gateway',"dsn":dsn};
  wx.request({
    url: apiUrl,  //api地址
    data: _data,
    header: {'Content-Type': 'application/json'},
    method: "get",
    async:false,  //同步
    success(res) {
      var units = res.data.rows;
      if(units.length > 0){
        let gatewaySn = units[0].gatewaySn; //网关号
        var N_date = new Date();
        var N_year = N_date.getFullYear();    //年
        var N_month = N_date.getMonth()+1;    //月
        var N_day = N_date.getDate();         //日
        var N_hour = N_date.getHours();       //时
        var N_minutes = N_date.getMinutes();  //分
        var N_seconds = N_date.getSeconds();  //秒
        var N_nowTime = N_year+ "-" +N_month+ "-" +N_day+ " " +N_hour+":"+N_minutes+":"+N_seconds;
        console.log("开始连接时间:——>>"+N_nowTime);
        var _dataNC = '{ac: "bluetooth_connect","gatewaySn":"'+gatewaySn+'","deviceSn":"'+dsn+'"}'
        //console.log("网关号："+gatewaySn);
        //console.log("设备号："+dsn);
        wx.request({
          url: apiNC+'bluetooth_connect',  //api地址
          data: _dataNC,
          header: {'Content-Type': 'application/json'},
          method: "POST",
          async:false,  //同步
          success(res) {
            if(res==""){
              _result(false); 
            }
            else{
              if(res.data.code=='0'){
                var reseltCode = res.data.data.connectResult;
                if(reseltCode=="1" || reseltCode=="5"){
                  console.log("连接成功connectResult:"+reseltCode+'——>>'+"msg:"+res.data.msg); 
                  console.log("当前设备号:"+dsn); 
                  _result(true); 
                }else{
                  if(reseltCode=="6"){
                    wx.showToast({
                      title: '另一把锁正在操作，请稍后...',
                      icon: "none",
                      duration: 2000
                    })
                  }
                  else if(reseltCode=="4"){
                    wx.showToast({
                      title: '网络错误,请重新下发',
                      icon: "none",
                      duration: 2000
                    })
                  }
                  else{
                    wx.showToast({
                      title: res.data.msg,
                      icon: "error",
                      duration: 1000
                    })
                  }
                  console.log("connectResult:"+reseltCode+'——>>'+"msg:"+res.data.msg); 
                  _result(false); 
                }
              }
              else{
                wx.showToast({
                  title: res.data.msg,
                  icon: "error",
                  duration: 1000
                })
                _result(false);
                console.log("没有返回connectResult");
                console.log(res.data.code+'——>>'+res.data.msg);      
              }
            }
          },
          fail(res) {
            _result(false); 
          },
          complete(){
          }
        });
      }else{
        wx.showToast({
          title: '没绑定网关',
          icon: "none",
          duration: 1000
        })
        _result(false); 
        console.log("没绑定网关"); 
      }
    },
    fail(res) {
      console.log("getunits fail:",res);
    },
    complete(){
    }
  });
}
function break_link(dsn) {  //切换房间，断开连接
  var _data = {ac: 'get_gateway',"dsn":dsn};
  wx.request({
    url: apiUrl,  //api地址
    data: _data,
    header: {'Content-Type': 'application/json'},
    method: "get",
    async:false,  //同步
    success(res) {
      var units = res.data.rows;
      if(units.length > 0){
        let gatewaySn = units[0].gatewaySn; //网关号
        var _dataNC = '{ac: "bluetooth_disconnect","gatewaySn":"'+gatewaySn+'","deviceSn":"'+dsn+'"}'
        wx.request({
          url: apiNC+'bluetooth_disconnect',  //api地址
          data: _dataNC,
          header: {'Content-Type': 'application/json'},
          method: "POST",
          async:false,  //同步
          success(res) {
            if(res==""){
              console.log("res:"+res); 
            }
            else{
              if(res.data.code=='0'){
                console.log("断开成功"); 
              }
              else{
                console.log("断开失败:"+res.data.msg);
                console.log(res.data.code+'——>>'+res.data.msg);  
              }
            }
          },
          fail(res) {
          },
          complete(){
          }
        });
      }else{
        wx.showToast({
          title: '没绑定网关',
          icon: "none",
          duration: 1000
        })
        console.log("没绑定网关"); 
      }
    },
    fail(res) {
      console.log("getunits fail:",res);
    },
    complete(){
    }
  });
}
module.exports = {
  ex10hex: ex10hex,
  ex16hex: ex16hex,
  str2hex: str2hex,
  get_encryption: get_encryption,
  get_Connection: get_Connection,
  break_link: break_link,
}