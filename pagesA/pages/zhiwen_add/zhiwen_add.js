var dsn= "";  //设备号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
var apiTX = app.globalData.apiTX;     //小陈指纹、卡片接口
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档
var com = require('../../../utils/commom.js');  //公共js
const lockUtils = require("../../../utils/nzBleLockSDK/lockV2/LockUtils.js");//蓝牙操作文档(国民锁)
const bleApi = require("../../../utils/nzBleLockSDK/bleApi.js");//蓝牙操作文档(国民锁)
var userid= "";  //登陆人工号
var ptlx= "hongqi";  //平台类型
var lylx= "1";  //供应商类型
var roomId= "";  //房间id
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
var ljzt = false;
var zwsl = 0;//指纹数量
var keyGroupId= "903";  //用户Id
var authCode= "";  //鉴权码
var aesKey= "";  //秘钥
var myPlugin= "";  //组件
var managePassword= "";  //管理密码
var cjqNo_n = "" //采集器(新)
var cjqNo = "" //采集器
var renterNo = "" 
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
    second: 40, //倒计时20秒
    c:'',//定时器
    second_discon: 20, //倒计时20秒
    lylx:'',//门锁来源
    mydata : "",
    imgurl : "../../../static/images/my/zhiwen_add1.png",
    setInter: '',
    num: 1,
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    var _this = this;
    dsn = options.dsn; //设备号
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
    userid = app.globalData.userid;   //登陆人工号
    //设置默认的年份
    this.setData({
    choose_year: this.data.multiArray[0][0]
    });
    this.get_mcToMS(dsn); //获取门锁信息
    //this.get_msyhQty(dsn,'gl','01',renterNo); //获取门锁用户数量

  /*调用一次定位*/
  wx.getLocation({
    type: 'gcj02',
    success (res) {
      console.log(res)
    }
  })
  },
  get_htrq:function (hid) { //获取合同有效期
    let _this = this;
    var _data = {ac: 'get_htzq',"hid":hid};
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
        else{
          lylx = "";
          roomId = "";
          aesKey = "";
          authCode = "";
          managePassword = "";
          _that.setData({
            lylx:""
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
          zwsl = units.length; //指纹数量
        }
        else{
          zwsl = 0; //指纹数量
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
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
  tapList: function(e) {   //根据标识跳转页面
    wx.navigateTo({
      url: '../../../pagesB/pages/cjq_list/cjq_list'
    })
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
    var Stime = e.detail.value.start_time;
    var Etime = e.detail.value.end_time;
    var buttonType = e.detail.target.dataset.labelnum;
    var cjq = e.detail.value.cjq;
    if(zwsl >= 3){
      wx.showToast({
        title: '指纹最多3个,不能再下发!',
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
    }
    else{
      var Stime_BLE = Stime;  //新锁蓝牙开门时间
      var Etime_BLE = Etime;
      Stime = Stime+':00';
      Etime = Etime+':00';
    }
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '下发中...',
    })
    if(buttonType=="lanya"){
      if(lylx == "20" || lylx == "21"){ //同欣TX433
        var Stime2 = Stime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
        var Etime2 = Etime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
        var Stime2 = Stime2.substr(2,12); //截取字符串如20211231173000截取成211231173000
        var Etime2 = Etime2.substr(2,12);
       const createPlugin = requirePlugin("myPlugin");
       const Plugin = createPlugin()
       // 定义数据
       var config = {
         keyGroupId: 903,  // 由业务服务器返回
         lockMac: dsn,
         aesKey: aesKey, 
         authCode: authCode, 
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
           validStartTime = Math.floor(validStartTime.getTime() / 1000);
           var validEndTime = new Date(Etime);
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
             type: 0, // 添加方式
             keyType: 0, // 钥匙类型，0指纹，1密码，2卡片
             validTimeMode: 0, // 时间模式为有效期类型
             key: '' // 内容值
           };
           myPlugin.addKey(options1);  //下发指纹
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
       myPlugin.on('addKey', res => {
        if(res.errCode == '01'){
          console.log("添加成功");
        }else{
          console.log("添加失败");
        }
      })
       // 监听“添加钥匙”事件上报
       myPlugin.on("report:addKey", function(data) {
        if(data.errCode=="01"){
          var yhbh = data.data.lockKeyId;
          console.log("编号：", yhbh);
          if(yhbh < 10){
            yhbh = '00'+yhbh
          }
          else if(yhbh >= 10 && yhbh < 100){
            yhbh = '0'+yhbh
          }
          else{
            yhbh = yhbh
          }  
          self.setData({
            showMB:true,  //显示幕布
            imgurl: "../../../static/images/my/zhiwen_add5.png",//赋值图片
          })
          wx.hideLoading();  //关闭提示框    
          self.insert_Rh_yhb(dsn,'01',yhbh,'',Stime2,Etime2);//插入门锁用户表
          self.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');
        }
        else{
          wx.hideLoading();  //关闭提示框   
          self.setData({
            showMB:true,  //显示幕布
          })
          wx.showToast({
            title: '新增指纹失败',
            icon: "error",
            duration: 1000
          }) 
        }
      });
    }
    else{
      /*
      wx.hideLoading();  //关闭提示框
      wx.showToast({
        title: '请在PC端进行指纹采集',
        icon: "none",
        duration: 1000
      })
      that.setData({
        showMB:true,  //显示幕布
      })  
      */ 
     var Stime2 = Stime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
     var Etime2 = Etime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
     var Stime2 = Stime2.substr(2,12); //截取字符串如20211231173000截取成211231173000
     var Etime2 = Etime2.substr(2,12);
     let cls = 0x02;   //权限类型(0x01 永久 	0x02 限时 	0x81 取消)
     let type = 0x00;  //开门方式(0x00 指纹  	0x01 密码)
     let date = Stime2+Etime2;  //有效期
     let circle = '00';   //循环周期
     let pwdHex = lockUtils.authChangePwdCode(managePassword);
     wx.setStorageSync("device_key_" + dsn, pwdHex)
     let cmd = lockUtils.c_add_user(cls,type,date,circle);
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
          else if(yhbh >= 10 && yhbh < 100){
            yhbh = '0'+yhbh
          }
          else{
            yhbh = yhbh
          }
           that.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');
           that.insert_Rh_yhb(dsn,'01',yhbh,'',Stime2,Etime2);//插入门锁用户表
           bleApi.closeBle();  //断开连接
           that.setData({
             showMB:true,  //显示幕布
           })
         }
         else{
           wx.showToast({
             title: '新增指纹失败',
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
    }
    else{
    //蓝牙下发
    if(ljzt){
      if(lylx == "1"){  //新锁
        that.setData({
          second: 40,  //初始化成40秒
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
              cmd = autoNo+'AA5511001A020000'+Stime2+Etime2+'CC';    
              com.get_encryption(dsn,cmd,function(res){  //获取加密
                if(res.errCode2=='1001'){
                  let cmd = res.cmd;
                  let cmdT = autoNo+cmd;
                  BLE.sendCommand(cmdT,function(res){  //写入数据
                    var hexV = res.res;
                    if(res.errCode==0){                    
                      var hexV2 = hexV.slice(-8+hexV.length,-4+hexV.length);
                      var yhbh = com.ex16hex(hexV2);
                      if(yhbh < 10){
                        yhbh = '00'+yhbh
                      }
                      else if(yhbh >= 10 && yhbh < 100){
                        yhbh = '0'+yhbh
                      }
                      else{
                        yhbh = yhbh
                      }
                      that.insert_Rh_yhb(dsn,'01',yhbh,'',Stime2,Etime2);//插入门锁用户表
                      that.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');
                      that.setData({
                        showMB:true,  //显示幕布
                      })
                    }
                    else{
                      wx.hideLoading();  //关闭提示框
                      that.setData({
                        showMB:true,  //显示幕布
                      })
                      wx.showToast({
                        title: '新增指纹失败',
                        icon: "error",
                        duration: 1000
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
      else if(lylx == "2"){  //新锁 
        var xfbs = "下发中";
        that.setData({
          second: 40,  //初始化成40秒
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
          "unlockModeEnum":3,  //1是密码，3是指纹
          "registerStatusEnum":"START",
          "effectiveNum":0,
          "memberTypeEnum":"NORMAL", //NORMAL是普通用户，ADMIN是管理员
          "hardwareNumber":0,
          "menberId":2, //0是普通用户，1是管理员
          "isOpenCycle":0,
          "loopType":"LOOP_NOT",
          "loopFlag":"00000000",
          "password":'',
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
                    let registerStatus = _res.data.registerStatusEnum;
                    if( _res.code == 0){  
                      //console.log("新锁新增指纹下发标识："+xfbs);
                      //console.log("成功标志："+_res.data.registerStatusEnum);
                      if(registerStatus=="START" || registerStatus=="IN"){
                        wx.showLoading({
                          title: '下发中...',
                        })
                      }
                      if(xfbs=='已完成'){
                        return;
                      }    
                      else if(registerStatus=="FINISH"){
                        wx.hideLoading();  //关闭提示框  
                        that.setData({
                          showMB:true,  //显示幕布
                        })
                        var yhbh = _res.data.hardwareNumber;
                        if(yhbh < 10){
                          yhbh = '00'+yhbh
                        }
                        else if(yhbh >= 10 && yhbh < 100){
                          yhbh = '0'+yhbh
                        }
                        else{
                          yhbh = yhbh
                        }
                        xfbs='已完成';
                        that.insert_Rh_yhb(dsn,'01',yhbh,'',Stime_b,Etime_b);//插入门锁用户表
                        that.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');                       
                      }                                              
                    }
                    else{   
                      xfbs='已完成';              
                      wx.hideLoading();  //关闭提示框
                      that.setData({
                        showMB:true,  //显示幕布
                      })
                      wx.showToast({
                        title: '新增指纹失败',
                        icon: "error",
                        duration: 1000
                      })
                      console.log(_res.code+'——>>'+_res.msg);                    
                    }
                  },
                  fail(res) {
                    xfbs='已完成';
                    wx.hideLoading();  //关闭提示框
                    that.setData({
                      showMB:true,  //显示幕布
                    })
                    console.log("新增指纹失败");
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
    else{ //网关下发
      if(lylx == "1"){  //旧锁
        wx.hideLoading();  //关闭提示框
        wx.showToast({
          title: '旧锁指纹下发',
          icon: "none",
          duration: 1000
        }) 
        that.setData({
          showMB:true,  //显示幕布
        })       
      }
      else if (lylx == "2"){  //新锁
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
          var lx = "01"; //指纹
          var _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","lx":"'+lx+'","begindate":"'+Stime+'","enddate":"'+Etime+'","channel":"21"}'
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
                  duration: 1000
                })
              }
              else{
                if(res.data.code=='0'){
                  console.log("返回的code:"+res.data.code);
                  that.setData({
                    second_discon: 20,  //初始化成20秒
                  });
                  that.countdown_disconnect(); //调用断开的计时器
                  wx.hideLoading();  //关闭提示框
                  var yhbh = res.data.data.hardwareId;
                  if(yhbh < 10){
                    yhbh = '00'+yhbh
                  }
                  else if(yhbh >= 10 && yhbh < 100){
                    yhbh = '0'+yhbh
                  }
                  else{
                    yhbh = yhbh
                  }
                  that.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');
                  wx.showToast({
                    title: '新增指纹成功',
                    icon: "success",
                    duration: 1000
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
                      duration: 1000
                    }) 
                  }
                  else{
                    console.log(res.data.code+'——>>'+res.data.msg);
                    wx.showToast({
                      title: '新增指纹失败',
                      icon: "error",
                      duration: 1000
                    }) 
                  }                  
                }
              }        
            },
            fail(res) {
              console.log("getunits fail:",res);
              wx.showToast({
                title: '新增指纹失败',
                icon: "error",
                duration: 1000
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
      else if(lylx == "5" || lylx == "6"){  //国民NB锁
        wx.hideLoading();  //关闭提示框
        wx.showToast({
          title: '请在PC端进行指纹采集',
          icon: "none",
          duration: 1000
        })
        that.setData({
          showMB:true,  //显示幕布
        })      
      }
      else if(lylx == "20" || lylx == "21"){  //同欣TX433
        if(!cjq){
          wx.hideLoading();  //关闭提示框
          that.setData({
            showMB:true,
          })
          wx.showToast({
            title: '请先选择采集器',
            icon: "none",
          })
          return;
        }
        that.connectWebSocket(cjq,Stime,Etime);//创建WebSocket服务器
      }
    }
    }
  },
  insert_Rh_yhb: function (dsn,lx,yhbh,newPwd,Stime,Etime){  //插入门锁用户表
    var yhlx = "02";    //用户类型
    var channel = "21"; //下发来源
    var remark = "";  
    if(!Stime){ Stime = "000101000000"}
    if(!Etime){ Etime = "991230180000"}
    var _data = {ac: 'yhb_save',"yhbh":yhbh,"lx":lx,"yhlx":yhlx,"dsn":dsn,"Pwd":newPwd,"Stime":Stime,"Etime":Etime,"channel":channel,"remark":remark};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.hideLoading();  //关闭提示框
          wx.showToast({
            title: '新增指纹成功',
            icon: "success",
            duration: 1000
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
    let renterNo = "";
    var _data = {act: "operateLog_save2",wx_id:wx_id,hid:hid,sbh:sbh,czlx:czlx,Pwd_type:Pwd_type,Pwd:Pwd,xfly:xfly,renterNo:renterNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'content-type': 'application/x-www-form-urlencoded'},
      method: "POST",
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
    //console.log("开启断开计时器");
    //console.log("计时器的id："+app.globalData.c_discon);
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
  connectWebSocket: function (cjqbh,Stime,Etime){  //创建WebSocket服务器
    var that = this;
    wx.connectSocket({
      url: 'wss://139.9.182.161:7500/webSocket',
      success(res) {
        console.log('webSocket连接成功');
      },
      fail(res) {
        wx.hideLoading();  //关闭提示框
        that.setData({
          showMB:true,  //隐藏幕布
        })
        console.log("webSocket连接失败:",res);
      },
    })
    wx.onSocketOpen(function(res){
      console.log('webSocket连接打开成功');
      wx.sendSocketMessage({  //发送WebSocket消息
        data: cjqbh,
      })
    })
    //接收服务器发送的数据
    wx.onSocketMessage(function(res){
      if(res!=""){
        let _res = JSON.parse(res.data);
        let characteristic = _res.data;
        if(characteristic==-1){
          return;
        }else if(characteristic==1){
          that.enterFinger(cjqbh); //进入指纹模式
        }else{
          let Num = characteristic.indexNum;
          let img = "";
          if(Num==1){
            img = "../../../static/images/my/zhiwen_add2.png";
          }
          else if(Num==2){
            img = "../../../static/images/my/zhiwen_add3.png";
          }
          else if(Num==3){
            img = "../../../static/images/my/zhiwen_add4.png";
          }
          else if(Num==4){
            img = "../../../static/images/my/zhiwen_add5.png";
          }
          that.setData({
            imgurl:img,//赋值图片
          }) 
          if(characteristic.indexNum==4){//录入四次指纹中断连接
            var message = characteristic.fingerPrint;
            console.log("特征值："+message);
            that.zhiwen_addTX(message,Stime,Etime); //同欣下发指纹
            wx.closeSocket();
          }
        }
      }
    })
  },
  enterFinger: function (cjqbh){  //进入指纹模式
    var that = this;
    var _dataNC = {act: "langsi_Get_fingerprints",eqnumber:cjqbh,url:'http://139.9.182.161:7300'}
    wx.request({
      url: apiTX,  //api地址
      data: _dataNC,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: '失败',
            icon: "none",
            duration: 1000
          })
          that.setData({
            showMB:true,  //隐藏幕布
          })
        }
        else{
          console.log(res);
        }        
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  zhiwen_addTX: function (message,Stime,Etime){  //同欣下发指纹
    var that = this;
    var _dataNC = '{ac: "lockauth","partnerid":"hongqi","deviceid":"'+dsn+'","userdata":"'+message+'","usertype":"02","begindate":"'+Stime+'","enddate":"'+Etime+'","channel":"21","type":"01"}'
    wx.request({
      url: apiNC+'tx_add_user',  //api地址
      data: _dataNC,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: '失败',
            icon: "none",
            duration: 1000
          })
        }
        else{
          if(res.data.code=='0'){
            wx.hideLoading();  //关闭提示框      
            that.insertLog_LS(userid,'',dsn,'下发','指纹',message,'朗思管理端');
            wx.showToast({
              title: '新增指纹成功',
              icon: "success",
              duration: 1000
            })                 
            setTimeout(()=>{
              wx.navigateBack({
                delta: 1,
            }) 
            },1000)                
          }
          else{       
            wx.hideLoading();  //关闭提示框
            console.log(res.data.code+'——>>'+res.data.message);
            wx.showToast({
              title: res.data.message,
              icon: "none",
              duration: 1000
            })                                   
          }
        }        
      },
      fail(res) {
        wx.showToast({
          title: '新增指纹失败',
          icon: "error",
          duration: 1000
        })
      },
      complete(){
        wx.hideLoading();  //关闭提示框
        that.setData({
          showMB:true,  //隐藏幕布
        })
      }
    });
  },
  onUnload: function () {
    if(lylx=="20" || lylx=="21"){
      if(!!myPlugin){
        myPlugin.disconnect();
      }
    }
    else if(lylx=="5" || lylx=="6"){
      bleApi.closeBle();
    }
  },
  onShow: function () {  //生命周期函数--监听页面显示
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    let cjqNo_n = currPage.data.mydata.cjq;
    if(!!cjqNo_n){
      cjqNo = cjqNo_n;
    }
    if(!!cjqNo){
      this.setData({
        cjq: cjqNo
      })
    }
    //this.get_msyhQty(dsn,'gl','01',renterNo); //获取门锁用户数量
  }
})