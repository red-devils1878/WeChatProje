var dsn= "";  //设备号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiYC = app.globalData.apiYC;     //获取门锁api地址(远程)
var apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档
var com = require('../../../utils/commom.js');  //公共js
const lockUtils = require("../../../utils/nzBleLockSDK/lockV2/LockUtils.js");//蓝牙操作文档(国民锁)
const bleApi = require("../../../utils/nzBleLockSDK/bleApi.js");//蓝牙操作文档(国民锁)
var newPwd = ""; //新密码
var userid= "";  //登陆人工号
var ptlx= "hongqi";  //平台类型
var lylx= "1";  //供应商类型
var roomId = "";//房间id
var keyGroupId= "903";  //用户Id
var authCode= "";  //鉴权码
var aesKey= "";  //秘钥
var myPlugin= "";  //组件
var managePassword= "";  //管理密码
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
var pwdsl = 0;//密码数量
//获取年
for (let i = date.getFullYear(); i <= date.getFullYear() + 50; i++) {
  years.push("" + i);
}
//获取月份
for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i);
}
//获取日期
for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days.push("" + i);
}
//获取小时
for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}
//获取分钟
for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i);
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Starttime: '',
    Endtime: '',
    multiArray: [years, months, days, hours, minutes],
    //multiIndex: [0,9, 16, 10, 17],
    multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    endIndex: [1,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    choose_year: '',
    showMB:true, //幕布
    second: 20, //倒计时20秒
    c:'',//定时器
    second_discon: 20, //倒计时20秒
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    myPlugin= "";
    dsn = options.dsn; //设备号
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiYC = app.globalData.apiYC;     //获取门锁api地址(远程)
    apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
    userid = app.globalData.userid;   //登陆人工号
    //dsn = "501A102106013906"; //设备号
    //设置默认的年份
    this.setData({
    choose_year: this.data.multiArray[0][0]
    });
    this.get_mcToMS(dsn); //获取门锁信息
    this.get_pwd(); //生成密码
    //this.get_msyhQty(dsn,'gl','03',userid); //获取门锁用户数量
  },
  get_htrq:function (roomId) { //获取合同有效期
    let _this = this;
    var _data = {ac: 'get_htzq',"hid":roomId};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let Sd = units[0].inTime2;
          let Ed = units[0].outTime2;
          if(!Sd){ 
            Sd = ""; 
          }
          else{ 
            Sd = Sd+' 00:00'; 
          }
          if(!Ed){
            Ed = "";
          }
          else{
            Ed = Ed+' 23:59';
          }
          _this.setData({
            Starttime:Sd,
            Endtime:Ed
          })
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_pwd:function () { //生成密码
    let that = this;
    let Num = that.MathRand(); //随机生成6位数密码
    newPwd = Num;
    that.setData({
      pwd:Num
    }); 
  },
  MathRand: function() { //生成密码
    var Num="";
    for(var i=0;i < 100;i++){
      for(var i=0;i < 6;i++)
      {
        var chr = Math.floor(Math.random()*10);
        //首个字母为0时，替换为6
        if( i == 0 && chr == 0 ){
          chr = 6;
        }
        Num+=chr;
      }
      break; 
    }
    return Num;
  },
  get_mcToMS:function (dsn) { //获取没锁信息
    var _that = this;
    var _data = {ac: 'get_mcToMS',"dsn":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          lylx = units[0].lx;
          roomId = units[0].hid;
          aesKey = units[0].aesKey;
          authCode = units[0].commonAuthCode;
          managePassword = units[0].managePassword;
          _that.get_htrq(roomId); //获取合同有效期
          _that.setData({
            lylx:units[0].lx
          })
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
    });  
  },
  get_msyhQty:function (dsn,xfly,lx,renterid) { //获取门锁用户数量
    var _data = {ac: 'get_msyhQty',"dsn":dsn,"xfly":xfly,"lx":lx,"renterid":renterid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          pwdsl = units.length; //密码数量
        }
        else{
          pwdsl = 0; //密码数量
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  setValue: function(e) {   //密码值改变事件
    newPwd = e.detail.value;
  },
  //获取开始时间日期
  bindStartPickerChange: function(e) {
  this.setData({
    multiIndex: e.detail.value
  })
  const index = this.data.multiIndex;
  const year = this.data.multiArray[0][index[0]];
  const month = this.data.multiArray[1][index[1]];
  const day = this.data.multiArray[2][index[2]];
  const hour = this.data.multiArray[3][index[3]];
  const minute = this.data.multiArray[4][index[4]];
  // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
  this.setData({
    Starttime: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
  })
  },
  //监听picker的滚动事件
  bindStartPickerColumnChange: function(e) {
  //获取年份
  if (e.detail.column == 0) {
    let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
    console.log(choose_year);
    this.setData({
      choose_year
    })
  }
  //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
  if (e.detail.column == 1) {
    let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
    let temp = [];
    if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
      for (let i = 1; i <= 31; i++) {
        if (i < 10) {
          i = "0" + i;
        }
        temp.push("" + i);
      }
      this.setData({
        ['multiArray[2]']: temp
      });
    } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
      for (let i = 1; i <= 30; i++) {
        if (i < 10) {
          i = "0" + i;
        }
        temp.push("" + i);
      }
      this.setData({
        ['multiArray[2]']: temp
      });
    } else if (num == 2) { //判断2月份天数
      let year = parseInt(this.data.choose_year);
      console.log(year);
      if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
        for (let i = 1; i <= 29; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else {
        for (let i = 1; i <= 28; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      }
    }
    console.log(this.data.multiArray[2]);
  }
  var data = {
    multiArray: this.data.multiArray,
    multiIndex: this.data.multiIndex
  };
  data.multiIndex[e.detail.column] = e.detail.value;
  this.setData(data);
  },
  //获取结束时间日期
  bindEndPickerChange: function(e) {
    this.setData({
      endIndex: e.detail.value
    })
    const Eindex = this.data.endIndex;
    const year = this.data.multiArray[0][Eindex[0]];
    const month = this.data.multiArray[1][Eindex[1]];
    const day = this.data.multiArray[2][Eindex[2]];
    const hour = this.data.multiArray[3][Eindex[3]];
    const minute = this.data.multiArray[4][Eindex[4]];
    // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
    this.setData({
      Endtime: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
    })
  },
  //监听picker的滚动事件(结束日期)
  bindEndPickerColumnChange: function(e) {
    //获取年份
    if (e.detail.column == 0) {
      let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
      console.log(choose_year);
      this.setData({
        choose_year
      })
    }
    //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    if (e.detail.column == 1) {
      let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
      let temp = [];
      if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 2) { //判断2月份天数
        let year = parseInt(this.data.choose_year);
        console.log(year);
        if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        }
      }
      console.log(this.data.multiArray[2]);
    }
    var data = {
      multiArray: this.data.multiArray,
      endIndex: this.data.endIndex
    };
    data.endIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
  formSubmit: function (e){  //保存数据
    var that = this;
    let ljzt = false;
    if(lylx == "1"){  //旧锁
      ljzt = BLE.authState();
    }
    else if(lylx == "2"){  //新锁
      ljzt = BLE_new.connectionState();
    }
    console.log("门锁连接状态："+ljzt);
    var Stime = e.detail.value.start_time;
    var Etime = e.detail.value.end_time;
    var newPwd = e.detail.value.pwd;
    var buttonType = e.detail.target.dataset.labelnum;
    if(pwdsl >= 5){
      wx.showToast({
        title: '密码最多1个,不能再下发!',
        icon: "none",
      })
      return false;
    }
    if(!Stime || !Etime){
      wx.showToast({
        title: '日期不能为空!',
        icon: "none",
      })
      return;
     //Stime = '1900-01-01 00:00:00';
     //Etime = '2999-12-30 18:00:00';
    }
    else{
      var Stime_BLE = Stime;  //新锁蓝牙开门时间
      var Etime_BLE = Etime;

      Stime = Stime+':00';
      Etime = Etime+':00';
    }
    if(!newPwd || newPwd.length != 6){
      wx.showToast({
        title: '请输入6位数字！',
        icon: 'none'
      })
    }
    else{
      that.setData({
        showMB:false,  //显示幕布
      })
      wx.showLoading({
        title: '下发中...',
      })     
      if(buttonType=="lanya"){
        var Stime2 = Stime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
        var Etime2 = Etime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
        var Stime2 = Stime2.substr(2,12); //截取字符串如20211231173000截取成211231173000
        var Etime2 = Etime2.substr(2,12);
        if(lylx=="5" || lylx=="6"){  //国民锁
          let cls = 0x02;   //权限类型(0x01 永久、0x02 限时、0x03 单次、4 循环  )
          let type = 0x01;  //开门方式(0x01 密码、0x09 卡片)
          let token = newPwd; //密码值
          let date = Stime2+Etime2;  //有效期
          let circle = '00';   //循环周期
          let pwdHex = lockUtils.authChangePwdCode(managePassword);
          wx.setStorageSync("device_key_" + dsn, pwdHex)
          let cmd = lockUtils.w_add_user(cls,type,token,date,circle);
          lockUtils.executeCmd({
            isAuthConnect: true,
            deviceSn: dsn,
            data: cmd,
            success: function (res) {
              console.log(JSON.stringify(res))
              if (res.code == 0) {
                let hexV2 = res.data.userID;
                var yhbh = com.ex16hex(hexV2);
                if(yhbh < 10){
                  yhbh = '00'+yhbh
                }
                else{
                  yhbh = '0'+yhbh
                }
                that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,Stime2,Etime2);//插入门锁用户表
                //that.Pwd_sendmsg(roomId,newPwd); //发送短信
                bleApi.closeBle();  //断开连接
                that.setData({
                  showMB:true,  //显示幕布
                })
              }
              else{
                wx.showToast({
                  title: '新增用户失败',
                  icon: "error",
                  duration: 1000
                })
                that.setData({
                  showMB:true,  //隐藏幕布
                })
                bleApi.closeBle();  //断开连接             
              } 
            },
            fail: function (err) {
              wx.showToast({
                title: err.msg,
                icon: "none",
                duration: 1000
              })
              bleApi.closeBle();
              that.setData({
                showMB:true,  //隐藏幕布
              })
              console.log(err.code+'——>>'+err.msg);    
            }
          })   
        }
        else if(lylx=="20" || lylx=="21"){ //同欣锁
          const createPlugin = requirePlugin("myPlugin");
          const Plugin = createPlugin()
          // 定义数据
          var config = {
            keyGroupId: 903,  // 由业务服务器返回
            lockMac: dsn,
            aesKey: aesKey, 
            authCode: authCode, 
            //skipDiscovery: true 
          };
          // 初始化时调用方式
          const self = this
          myPlugin = new Plugin(config);
          // 监听“初始化完成”事件
          myPlugin.on("ready", function(plugin) {
            if(plugin.connected="true"){
              wx.hideLoading();  //关闭提示框   
              wx.showLoading({
                title: '下发中...',
              })
              var validStartTime = new Date(Stime);
              //validStartTime.setHours(9, 12, 23);
              validStartTime = Math.floor(validStartTime.getTime() / 1000);
              var validEndTime = new Date(endDate);
              //validEndTime.setHours(9, 12, 23);
              validEndTime = Math.floor(validEndTime.getTime() / 1000);
              var lockKeyId = 0; // 钥匙ID由设备分配
              var keyGroupId = config.keyGroupId; // 用户组ID
              var usageCount = 255; // 使用次数,0:禁用,1~254：有效次数,255：无限次数
              var options1 = {
                lockKeyId,
                keyGroupId,
                validStartTime,
                validEndTime,
                usageCount,
                type: 1, // 按内容添加
                keyType: 1, // 密码类型
                validTimeMode: 0, // 时间模式为有效期类型
                key: newPwd // 内容值
              };
              myPlugin
                .addKey(options1)
                .then(function(res) {     
                  if(res.errCode=="01"){
                    var yhbh = res.data.lockKeyId;
                    if(yhbh < 10){
                      yhbh = '00'+yhbh
                    }
                    else{
                      yhbh = '0'+yhbh
                    }
                    that.setData({
                      showMB:true,  //显示幕布
                    })
                    that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                    that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,Stime2,Etime2);//插入门锁用户表
                    //that.Pwd_sendmsg(roomId,newPwd); //发送短信              
                  }              
                })
                .catch(function(err) {
                  wx.hideLoading();  //关闭提示框   
                  that.setData({
                    showMB:true,  //显示幕布
                  })
                  wx.showToast({
                    title: '新增用户失败',
                    icon: "error",
                    duration: 1000
                  })   
                });
            }
            else{
              wx.hideLoading();  //关闭提示框   
              wx.showToast({
                title: '连接失败',
                icon: "none",
                duration: 1000
              }) 
            }
            // 调用其他api
          });
          // 监听“断开连接”事件
          myPlugin.on("close", function(state) {
            if(state.errCode="100024"){
              wx.showToast({
                title: '蓝牙连接已断开',
                icon: "none",
                duration: 1000
              })
              self.setData({
                showMB:true,
              })
            }
          });
          // 监听“运行错误”事件
          myPlugin.on("error", function(err) {
            wx.hideLoading();  //关闭提示框
            myPlugin.disconnect();
            self.setData({
              showMB:true,
            })
            const { errCode, errMsg } = err
            switch(errCode) {
              case 10000:  // 数据解析异常
                wx.showToast({
                  title: '请打开手机蓝牙',
                  icon: "none",
                  duration: 1000
                })
              break;
              case 10001:
                wx.showToast({
                  title: '当前蓝牙适配器不可用',
                  icon: "none",
                  duration: 1000
                })
              break;
              case 10002:
                wx.showToast({
                  title: '没有找到指定设备',
                  icon: "none",
                  duration: 1000
                })
              break;
              case 10003:
                wx.showToast({
                  title: '连接失败',
                  icon: "none",
                  duration: 1000
                })
              break;
              case 10006:
                wx.showToast({
                  title: '当前连接已断开',
                  icon: "none",
                  duration: 1000
                })
              break;
              case 10012:
                wx.showToast({
                  title: '连接超时',
                  icon: "none",
                  duration: 1000
                })
              break;
              default:
                wx.showToast({
                  title: errMsg,
                  icon: "none",
                  duration: 1000
                })
            }
          });
          // 监听“添加钥匙”事件
          myPlugin.on("addKey", function(data){
          });
          // 监听“添加钥匙”事件上报
          myPlugin.on("report:addKey", function(data) {
          });
        }
      }
      else{
      //蓝牙下发
      if(ljzt){
        if(lylx == "1"){  //旧锁
          that.setData({
            second: 20,  //初始化成20秒
          });
          that.countdown(); //调用计时器
          var Stime2 = Stime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
          var Etime2 = Etime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
          var Stime2 = Stime2.substr(2,12); //截取字符串如20211231173000截取成211231173000
          var Etime2 = Etime2.substr(2,12);
          var cmd = "";
          var _data = {ac: 'GetNextNo'};
          wx.request({
            url: apiUrl,  //api地址
            data: _data,
            header: {'Content-Type': 'application/json'},
            method: "get",
            success(res) {
              if(res.data.status=="1"){
                var autoNo = res.data.autoNo;
                cmd = autoNo+'AA55170019020000'+newPwd+'FFFFFF'+Stime2+Etime2+'CC';       
                com.get_encryption(dsn,cmd,function(res){  //获取加密
                  //console.log("加密内码:"+res.errCode2);
                  if(res.errCode2=='1001'){
                    let cmd = res.cmd;
                    //console.log("加密cmd:"+cmd);
                    let cmdT = autoNo+cmd;
                    BLE.sendCommand(cmdT,function(res){  //写入数据
                      //console.log(res);
                      var hexV = res.res;
                      if(res.errCode==0){
                        var hexV2 = hexV.slice(-8+hexV.length,-4+hexV.length);
                        var yhbh = com.ex16hex(hexV2);
                        if(yhbh < 10){
                          yhbh = '00'+yhbh
                        }
                        else{
                          yhbh = '0'+yhbh
                        }
                        that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                        that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,Stime2,Etime2);//插入门锁用户表
                        that.setData({
                          showMB:true,  //显示幕布
                        })
                      }
                      else if(res.errCode==2){
                        wx.hideLoading();  //关闭提示框
                        that.setData({
                          showMB:true,  //显示幕布
                        })
                        wx.showToast({
                          title: '密码已存在',
                          icon: "error",
                          duration: 2000
                        })     
                      }
                      else{
                        wx.hideLoading();  //关闭提示框
                        that.setData({
                          showMB:true,  //显示幕布
                        })
                        wx.showToast({
                          title: '新增用户失败',
                          icon: "error",
                          duration: 2000
                        })     
                      }
                    });
                  }
                });           
              }
            },
            fail(res) {
              console.log("getunits fail:",res);
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //显示幕布
              })
            },
            complete(){   
            }
          }); 
        }
        else if(lylx == "2"){ //新锁
          //var StimeStamp = Date.parse(Stime_BLE);
          //var EtimeStamp = Date.parse(Etime_BLE);
          //console.log("开始时间戳："+StimeStamp);
          //console.log("结束时间戳："+EtimeStamp);
          var xfbs = "下发中";
          that.setData({
            second: 20,  //初始化成20秒
          });
          that.countdown(); //调用计时器
          var Stime_b = Stime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
          var Etime_b = Etime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
          var Stime_b = Stime_b.substr(2,12); //截取字符串如20211231173000截取成211231173000
          var Etime_b = Etime_b.substr(2,12);
          var _data2 = {
            "deviceSn":dsn,
            "cmd":"0301",
            "syncNo":"0",
            "cloudUnlockBO":{
             "unlockModeEnum":1,
             "registerStatusEnum":"START",
             "effectiveNum":0,
             "memberTypeEnum":"NORMAL", //NORMAL是普通用户，ADMIN是管理员
             "hardwareNumber":0,
             "menberId":2, //2是普通用户，1是管理员
             "isOpenCycle":0,
             "loopType":"LOOP_NOT",
             "loopFlag":"00000000",
             "password":newPwd,
             "startTime":Stime_BLE,
             "endTime":Etime_BLE
             }
            };
            wx.request({
              url: apiNC+'cloud_function',
              data: _data2,
              header: {'Content-Type': 'application/json'},
              method: "POST",
              dataType: 'application/json',
              async:false,  //同步                            
              success(res) {
                let _res = JSON.parse(res.data);                  
                var cmd2 = _res.data; 
                //第二次写入指令
                BLE_new.sendCommand(cmd2,function(res){
                  if(res.errCode==0){
                    var _data4 = {"deviceSn":dsn,"data":res.data};
                    wx.request({
                      url: apiNC+'cloud_function_parse',
                      data: _data4,
                      header: {'Content-Type': 'application/json'},
                      method: "POST",
                      dataType: 'application/json',
                      async:false,  //同步           
                      success(res) {
                        let _res = JSON.parse(res.data);
                        if( _res.code == 0 ){                                                
                          console.log("下发标识："+xfbs);
                          wx.hideLoading();  //关闭提示框  
                          that.setData({
                            showMB:true,  //显示幕布
                          })
                          var yhbh = _res.data.hardwareNumber;
                          if(yhbh < 10){
                            yhbh = '00'+yhbh
                          }
                          else{
                            yhbh = '0'+yhbh
                          }
                          if(xfbs=='已完成'){
                            return;
                          }
                          else{
                            xfbs='已完成';
                            that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                            that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,Stime_b,Etime_b);//插入门锁用户表
                            //that.Pwd_sendmsg(roomId,newPwd); //发送短信
                          }
                        }
                        else{   
                          xfbs='已完成';              
                          wx.hideLoading();  //关闭提示框
                          that.setData({
                            showMB:true,  //显示幕布
                          })
                          wx.showToast({
                            title: '新增用户失败',
                            icon: "error",
                            duration: 2000
                          })
                          console.log(res.data.code+'——>>'+res.data.msg);                    
                        }
                      },
                      fail(res) {
                        xfbs='已完成';
                        wx.hideLoading();  //关闭提示框
                        that.setData({
                          showMB:true,  //显示幕布
                        })
                        //console.log("getunits fail:",res);
                      },
                      complete(){
                      }
                    });                    
                  }
                }); 
              },
              fail(res) {
                xfbs='已完成';
                //console.log("getunits fail:",res);
              },
              complete(){
              }
            });        
        }
      }
      else{  //网关下发
        if(lylx == "1"){  //旧锁
          var useType = "02"; //普通用户
          var _dataYC = { ac: "lockauth", partnerid: ptlx, deviceid: dsn, password: newPwd, usertype: useType, begindate: Stime, enddate: Etime, channel: "21"};
          wx.request({
            url: apiYC,  //api地址
            data: _dataYC,
            header: {'content-type': 'application/x-www-form-urlencoded'},
            method: "POST",
            async:false,  //同步
            success(res) {
              if(res.data.state == true){
                wx.hideLoading();  //关闭提示框
                that.insertLog_LS(userid,'',dsn,'下发','普通用户',newPwd,'朗思管理端');
                wx.showToast({
                  title: '新增用户成功',
                  icon: "success",
                  duration: 2000
                })
                setTimeout(()=>{
                  wx.navigateBack({
                    delta: 1,
                }) 
                },1000)
              }
              else{
                wx.hideLoading();  //关闭提示框
                wx.showToast({
                  title: '新增用户失败',
                  icon: "error",
                  duration: 2000
                })          
              }
            },
            fail(res) {
              console.log("getunits fail:",res);
            },
            complete(){
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //显示幕布
              })
            }
          });
        }
        else if(lylx == "2"){ //新锁
          clearInterval(app.globalData.c_discon);//清除断开的定时器
          com.get_Connection(dsn,function(res){
            let conStatus = res;
            console.log("网关蓝牙连接返回："+conStatus);
            if(!conStatus){
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //显示幕布
              })              
              return;
            }   
            var L_date = new Date();
            var L_year = L_date.getFullYear();    //年
            var L_month = L_date.getMonth()+1;    //月
            var L_day = L_date.getDate();         //日
            var L_hour = L_date.getHours();       //时
            var L_minutes = L_date.getMinutes();  //分
            var L_seconds = L_date.getSeconds();  //秒
            var L_nowTime = L_year+ "-" +L_month+ "-" +L_day+ " " +L_hour+":"+L_minutes+":"+L_seconds;
            console.log("连接成功时间:——>>"+L_nowTime);
            
            var useType = "02"; //普通用户
            var _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","password":"'+newPwd+'","usertype":"'+useType+'","begindate":"'+Stime+'","enddate":"'+Etime+'","lx":"03","channel":"21"}'
            wx.request({
              url: apiNC+'lockauth',  //api地址
              data: _dataNC,
              header: {'Content-Type': 'application/json'},
              method: "POST",
              async:false,  //同步
              success(res) {
                if(res==""){
                  wx.showToast({
                    title: '失败',
                    icon: "none",
                    duration: 2000
                  })
                }
                else{
                  if(res.data.code=='0'){
                    console.log("返回的code:"+res.data.code);
                    var dateN = new Date();
                    var year_n = dateN.getFullYear();    //年
                    var month_n = dateN.getMonth()+1;    //月
                    var day_n = dateN.getDate();         //日
                    var hour_n = dateN.getHours();       //时
                    var minutes_n = dateN.getMinutes();  //分
                    var seconds_n = dateN.getSeconds();  //秒
                    var nowTime_n = year_n+ "-" +month_n+ "-" +day_n+ " " +hour_n+":"+minutes_n+":"+seconds_n;
                    console.log("下发成功后时间:——>>"+nowTime_n);
                    that.setData({
                      second_discon: 20,  //初始化成20秒
                    });
                    that.countdown_disconnect(); //调用断开的计时器
                    wx.hideLoading();  //关闭提示框      
                    that.insertLog_LS(userid,'',dsn,'下发','普通用户',newPwd,'朗思管理端');
                    //that.Pwd_sendmsg(roomId,newPwd); //发送短信
                    wx.showToast({
                      title: '新增用户成功',
                      icon: "success",
                      duration: 2000
                    })                 
                    setTimeout(()=>{
                      wx.navigateBack({
                        delta: 1,
                    }) 
                    },1000)                
                  }
                  else{           
                    wx.hideLoading();  //关闭提示框
                    if(res.data.code=="10010"){
                      wx.showToast({
                        title: res.data.msg,
                        icon: "error",
                        duration: 2000
                      }) 
                    }
                    else{
                      console.log(res.data.code+'——>>'+res.data.msg);
                      wx.showToast({
                        title: '新增用户失败',
                        icon: "error",
                        duration: 2000
                      }) 
                    }                    
                  }
                }        
              },
              fail(res) {
                console.log("getunits fail:",res);
                wx.showToast({
                  title: '新增用户失败',
                  icon: "error",
                  duration: 2000
                })
              },
              complete(){
                wx.hideLoading();  //关闭提示框
                that.setData({
                  showMB:true,  //显示幕布
                })
              }
            });
          });
        }
        else if(lylx == "5" || lylx == "6" || lylx == "20" || lylx == "21"){ //国民锁NB锁
          var useType = "02"; //普通用户
          let jk = ""; //接口
          if(lylx == "5" || lylx == "6"){
            jk = 'gm_add_user';
          }else if(lylx == "20" || lylx == "21"){
            jk = 'tx_add_user';
          }
          var _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","password":"'+newPwd+'","usertype":"'+useType+'","begindate":"'+Stime+'","enddate":"'+Etime+'","type":"03","channel":"21"}'
          wx.request({
            url: apiNC+jk,  //api地址
            data: _dataNC,
            header: {'Content-Type': 'application/json'},
            method: "POST",
            async:false,  //同步
            success(res) {
              if(res==""){
                wx.showToast({
                  title: '失败',
                  icon: "none",
                  duration: 2000
                })
              }
              else{
                if(res.data.code=='0'){
                  wx.hideLoading();  //关闭提示框      
                  that.insertLog_LS(userid,'',dsn,'下发','普通用户',newPwd,'朗思管理端');
                  //that.Pwd_sendmsg(roomId,newPwd); //发送短信
                  wx.showToast({
                    title: '新增用户成功',
                    icon: "success",
                    duration: 2000
                  })                 
                  setTimeout(()=>{
                    wx.navigateBack({
                      delta: 1,
                  }) 
                  },1500)                
                }
                else{       
                  wx.hideLoading();  //关闭提示框
                  console.log(res.data.code+'——>>'+res.data.message);
                  wx.showToast({
                    title: res.data.message,
                    icon: "none",
                    duration: 2000
                  })                                   
                }
              }        
            },
            fail(res) {
              wx.showToast({
                title: '新增用户失败',
                icon: "error",
                duration: 2000
              })
            },
            complete(){
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //显示幕布
              })
            }
          });
        }
      }
    }
    }
  },
  insert_Rh_yhb: function (dsn,lx,yhbh,newPwd,Stime,Etime){  //插入门锁用户表
    var yhlx = "02";    //用户类型
    var channel = "21"; //下发来源
    var remark = "";  
    if(!Stime){ Stime = "000000000000"}
    if(!Etime){ Etime = "991230180000"}
    var _data = {ac: 'yhb_save',"yhbh":yhbh,"lx":lx,"yhlx":yhlx,"dsn":dsn,"Pwd":newPwd,"Stime":Stime,"Etime":Etime,"channel":channel,"remark":remark};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步    
      success(res) {
        if(res.data.status=="1"){
          wx.hideLoading();  //关闭提示框
          wx.showToast({
            title: '新增用户成功',
            icon: "success",
            duration: 2000
          })
          setTimeout(()=>{
            wx.navigateBack({
              delta: 1,
          }) 
          },1000)    
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  //插入下发日志
  insertLog_LS:function(wx_id,hid,sbh,czlx,Pwd_type,Pwd,xfly){
    var _data = {ac: 'operateLog_save',"wx_id":wx_id,"hid":hid,"sbh":sbh,"czlx":czlx,"Pwd_type":Pwd_type,"Pwd":Pwd,"xfly":xfly};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      async:false,  //同步    
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  //发送短信
  Pwd_sendmsg:function(hid,pwd){
    var _data = {ac: 'Pwd_sendmsg',"hid":hid,"pwd":pwd};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          console.log(res.data.msg);
        }
        else{
          console.log(res.data.msg);
        }   
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  countdown: function () {
    var that = this;
    let second = that.data.second;
    clearInterval(this.data.c);//清除定时器
    that.data.c = setInterval(() => {//启动倒计时
      if(second == 0){
        clearInterval(this.data.c);//清除定时器
        wx.hideLoading();  //关闭提示框  
        that.setData({
          showMB:true,  //隐藏幕布
        });
        return;
      }
      else{
        second = second - 1;
      }
      that.setData({
        second: second
      });
    }, 1000);
  },
  countdown_disconnect: function () { //断开的定时器
    var that = this;
    let second_discon = this.data.second_discon;
    clearInterval(this.data.c);//清除旧的定时器
    clearInterval(app.globalData.c_discon);//清除断开的定时器 
    app.globalData.c_discon = setInterval(() => {//启动倒计时
      if(second_discon == 0){
        clearInterval(app.globalData.c_discon);//清除断开的定时器
        app.globalData.c_discon = ""; //设置成空
        com.break_link(dsn); //断开连接
        return;
      }
      else{
        second_discon = second_discon - 1;
      }
      that.setData({
        second_discon: second_discon
      });
      //console.log(second_discon);
    }, 1000);  
  },
  onShow: function () {  //生命周期函数--监听页面显示
    //this.get_msyhQty(dsn,'gl','03',userid); //获取门锁用户数量
  }
})