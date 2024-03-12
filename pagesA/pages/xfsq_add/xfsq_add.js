// pages/xfsq_add/xfsq_add.js
var userid = ""; //登陆人工号
var hid= "";  //房间id
var dsn= "";  //设备号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiYC = app.globalData.apiYC;     //获取门锁api地址(远程)
var apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
var apiTX = app.globalData.apiTX;     //小陈指纹、卡片接口
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档
var com = require('../../../utils/commom.js');  //公共js
const lockUtils = require("../../../utils/nzBleLockSDK/lockV2/LockUtils.js");//蓝牙操作文档(国民锁)
const bleApi = require("../../../utils/nzBleLockSDK/bleApi.js");//蓝牙操作文档(国民锁)
var newPwd = ""; //新密码
var ptlx= "hongqi";  //平台类型
var lylx= "1";  //供应商类型
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
var pwdsl = 0;//密码数量
var renterNo = "";//租客工号
var keyGroupId= "903";  //用户Id
var authCode= "";  //鉴权码
var aesKey= "";  //秘钥
var myPlugin= "";  //组件
var managePassword= "";  //管理密码
var cjqNo_n = "" //采集器(新)
var cjqNo = "" //采集器
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
    kslxIndex: 0,
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
    lylx:'',//门锁来源
    mydata : "",
    setInter: '',
    num: 1,
    imgurl : "../../../static/images/my/zhiwen_add1.png",
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    dsn = options.dsn;
    renterNo = options.renterNo;
    apiUrl = app.globalData.apiUrl;
    apiYC = app.globalData.apiYC;
    apiNC = app.globalData.apiNC;
    userid = app.globalData.userid;   //登陆人工号
    this.get_kslx();  //获取开锁类型
    //设置默认的年份
    this.setData({
    choose_year: this.data.multiArray[0][0]
    });
    this.get_mcToMS(dsn); //获取门锁信息
    this.get_pwd(); //生成密码
    this.get_msyhQty(dsn,'gl','03',renterNo); //获取门锁用户数量
  },
  get_kslx:function () { //获取开锁类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'SDI_ms_kslx'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var kslxs = res.data.rows;
        setTimeout(()=>{
          _this.setData({
            kslx:kslxs
          })
        },1000)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
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
          hid = units[0].hid;
          aesKey = units[0].aesKey;
          authCode = units[0].commonAuthCode;
          managePassword = units[0].managePassword;
          _that.get_htrq(hid); //获取合同有效期
          _that.setData({
            lylx:units[0].lx
          })
        }
        else{
          lylx = "";
          hid = "";
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
  bindKSChange: function(e) {  //开锁类型改变事件
    let kslxNo = this.data.kslx[e.detail.value].code;
    this.setData({
      kslxIndex: e.detail.value,
      kslxNo: kslxNo
    })
    this.get_msyhQty(dsn,'gl',kslxNo,renterNo); //获取门锁用户数量
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
    //console.log(choose_year);
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
      //console.log(year);
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
    //console.log(this.data.multiArray[2]);
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
      //console.log(choose_year);
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
        //console.log(year);
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
      //console.log(this.data.multiArray[2]);
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
    var ksType= e.detail.value.kslx;
    var Stime = e.detail.value.start_time;
    var Etime = e.detail.value.end_time;
    var newPwd = e.detail.value.pwd;
    var buttonType = e.detail.target.dataset.labelnum;
    var cjq = e.detail.value.cjq;
    if(ksType=='01'){  //指纹
      if(pwdsl >= 1){
        wx.showToast({
          title: '指纹最多1个,不能再下发!',
          icon: "none",
        })
        return false;
      }
    }
    else if(ksType=='03'){  //密码
      if(pwdsl >= 1){
        wx.showToast({
          title: '密码最多1个,不能再下发!',
          icon: "none",
        })
        return false;
      }
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
    if(ksType=='03'){   //密码
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
          if(lylx == "20" || lylx == "21"){  //同欣蓝牙下发
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
                  type: 1, // 按内容添加
                  keyType: 1, // 密码类型
                  validTimeMode: 0, // 时间模式为有效期类型
                  key: newPwd // 内容值
                };
                myPlugin
                  .addKey(options1)
                  .then(function(res) {
                    //console.log("addKey1 res -->", res);          
                    if(res.errCode=="01"){
                      var yhbh = res.data.lockKeyId;
                      if(yhbh < 10){
                        yhbh = '00'+yhbh
                      }
                      else{
                        yhbh = '0'+yhbh
                      }
                      that.setData({
                        showMB:true,  //隐藏幕布
                      })   
                      that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,Stime2,Etime2);//插入门锁用户表
                      that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                      that.update_pwdRenterOld(dsn,newPwd,renterNo,'03',yhbh);//更新密码所有人   
                      that.Pwd_sendmsg(hid,renterNo,newPwd); //发送短信                                  
                    }              
                  })
                  .catch(function(err) {
                    wx.hideLoading();  //关闭提示框   
                    that.setData({
                      showMB:true,  //隐藏幕布
                    })
                    wx.showToast({
                      title: '新增用户失败',
                      icon: "error",
                      duration: 2000
                    })   
                  });
              }
              else{
                wx.hideLoading();  //关闭提示框   
                that.setData({
                  showMB:true,  //隐藏幕布
                })   
                wx.showToast({
                  title: '连接失败',
                  icon: "none",
                  duration: 2000
                }) 
              }
            });
            // 监听“断开连接”事件
            myPlugin.on("close", function(state) {
              if(state.errCode="100024"){
                wx.showToast({
                  title: '蓝牙连接已断开',
                  icon: "none",
                  duration: 2000
                })
                self.setData({
                  showMB:true, //隐藏幕布
                })
              }
            });
            // 监听“运行错误”事件
            myPlugin.on("error", function(err) {       
              wx.hideLoading();  //关闭提示框
              myPlugin.disconnect();
              self.setData({
                showMB:true,  //隐藏幕布
              })
              const { errCode, errMsg } = err
              switch(errCode) {
                case 10000:  // 数据解析异常
                  wx.showToast({
                    title: '请打开手机蓝牙',
                    icon: "none",
                    duration: 2000
                  })
                break;
                case 10001:
                  wx.showToast({
                    title: '当前蓝牙适配器不可用',
                    icon: "none",
                    duration: 2000
                  })
                break;
                case 10002:
                  wx.showToast({
                    title: '没有找到指定设备',
                    icon: "none",
                    duration: 2000
                  })
                break;
                case 10003:
                  wx.showToast({
                    title: '连接失败',
                    icon: "none",
                    duration: 2000
                  })
                break;
                case 10006:
                  wx.showToast({
                    title: '当前连接已断开',
                    icon: "none",
                    duration: 2000
                  })
                break;
                case 10012:
                  wx.showToast({
                    title: '连接超时',
                    icon: "none",
                    duration: 2000
                  })
                break;
                default:
                  wx.showToast({
                    title: errMsg,
                    icon: "none",
                    duration: 2000
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
          else if(lylx == "5" || lylx == "6"){  //国民蓝牙下发
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
                  that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,Stime2,Etime2);//插入门锁用户表
                  that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                  that.update_pwdRenterOld(dsn,newPwd,renterNo,'03',yhbh);//更新密码所有人
                  that.Pwd_sendmsg(hid,renterNo,newPwd); //发送短信                                       
                  bleApi.closeBle();  //断开连接
                  that.setData({
                    showMB:true,  //隐藏幕布
                  })
                }
                else{
                  wx.showToast({
                    title: '新增用户失败',
                    icon: "error",
                    duration: 2000
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
                  duration: 2000
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
          if(lylx == "1"){ //旧锁
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
                        that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,Stime2,Etime2);//插入门锁用户表
                        that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                        that.update_pwdRenterOld(dsn,newPwd,renterNo,'03',yhbh);   //更新密码所有人(旧锁)
                        that.setData({
                          showMB:true,  //隐藏幕布
                        })
                      }
                      else if(res.errCode==2){
                        wx.hideLoading();  //关闭提示框
                        that.setData({
                          showMB:true,  //隐藏幕布
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
                            showMB:true,  //隐藏幕布
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
                  showMB:true,  //隐藏幕布
                })
              },
              complete(){
              }
            });        
          }
          else if (lylx == "2"){ //新锁
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
                              showMB:true,  //隐藏幕布
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
                              that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,Stime_b,Etime_b);//插入门锁用户表
                              that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');    
                              that.update_pwdRenterOld(dsn,newPwd,renterNo,'03',yhbh);//更新密码所有人                     
                              that.Pwd_sendmsg(hid,renterNo,newPwd); //发送短信
                            }      
                          }
                          else{   
                            xfbs='已完成';              
                            wx.hideLoading();  //关闭提示框
                            that.setData({
                              showMB:true,  //隐藏幕布
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
                            showMB:true,  //隐藏幕布
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
          if(lylx == "1"){ //旧锁
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
                  that.update_pwdRenter(dsn,newPwd,renterNo,'03'); 
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
                  showMB:true,  //隐藏幕布
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
                  showMB:true,  //隐藏幕布
                })  
                return;
              }
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
                      that.setData({
                        second_discon: 20,  //初始化成20秒
                      });
                      that.countdown_disconnect(); //调用断开的计时器                     
                      that.insertLog_LS(userid,'',dsn,'下发','普通用户',newPwd,'朗思管理端');
                      that.update_pwdRenter(dsn,newPwd,renterNo,'03'); 
                      that.Pwd_sendmsg(hid,renterNo,newPwd); //发送短信
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
                    showMB:true,  //隐藏幕布
                  })
                }
              });
            });               
          }
          else if(lylx == "5" || lylx == "6" || lylx == "20" || lylx == "21"){ //国民NB锁
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
                    that.insertLog_LS(userid,'',dsn,'下发','普通用户',newPwd,'朗思管理端');
                    that.update_pwdRenter(dsn,newPwd,renterNo,'03'); 
                    that.Pwd_sendmsg(hid,renterNo,newPwd); //发送短信
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
                  else{                   
                    wx.hideLoading();  //关闭提示框           
                    console.log(res.data.code+'——>>'+res.data.message);
                    wx.showToast({
                      title: '新增用户失败',
                      icon: "error",
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
                  showMB:true,  //隐藏幕布
                })
              }
            });
          }
        }
        }
      }
    }
    else if(ksType=='01'){  //指纹
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
        if(lylx == "5" || lylx == "6"){ //国民锁
          wx.hideLoading();  //关闭提示框
          wx.showToast({
            title: '请在PC端进行指纹采集',
            icon: "none",
            duration: 2000
          })
          that.setData({
            showMB:true,
          }) 
        }
        if(lylx == "20" || lylx == "21"){ //TX433
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
               duration: 2000
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
               duration: 2000
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
                 duration: 2000
               })
             break;
             case 10001:
               wx.showToast({
                 title: '当前蓝牙适配器不可用',
                 icon: "none",
                 duration: 2000
               })
             break;
             case 10002:
               wx.showToast({
                 title: '没有找到指定设备',
                 icon: "none",
                 duration: 2000
               })
             break;
             case 10003:
               wx.showToast({
                 title: '连接失败',
                 icon: "none",
                 duration: 2000
               })
             break;
             case 10006:
               wx.showToast({
                 title: '当前连接已断开',
                 icon: "none",
                 duration: 2000
               })
             break;
             case 10012:
               wx.showToast({
                 title: '连接超时',
                 icon: "none",
                 duration: 2000
               })
             break;
             default:
               wx.showToast({
                 title: errMsg,
                 icon: "none",
                 duration: 2000
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
            else{
              yhbh = '0'+yhbh
            }
            self.setData({
              showMB:true,  //显示幕布
              imgurl: "../../../static/images/my/zhiwen_add5.png",//赋值图片
            })
            wx.hideLoading();  //关闭提示框    
            self.insert_Rh_yhb(dsn,'01',yhbh,'',Stime2,Etime2);//插入门锁用户表
            self.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');
            self.update_pwdRenterOld(dsn,'',renterNo,'01',yhbh);   //更新密码所有人
          }
          else{
            wx.hideLoading();  //关闭提示框   
            self.setData({
              showMB:true,  //显示幕布
            })
            wx.showToast({
              title: '新增指纹失败',
              icon: "error",
              duration: 2000
            }) 
          }
        });
        }
      }
      else{
      //蓝牙下发
      if(ljzt){
        if(lylx == "1"){ //旧锁
          that.setData({
            second: 20,  //初始化成40秒
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
                        that.insert_Rh_yhb(dsn,'01',yhbh,'',Stime2,Etime2);//插入门锁用户表
                        that.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');
                        that.update_pwdRenterOld(dsn,'',renterNo,'01',yhbh);   //更新密码所有人(旧锁)
                        that.setData({
                          showMB:true,  //隐藏幕布
                        })
                      }
                      else{
                        wx.hideLoading();  //关闭提示框
                        that.setData({
                          showMB:true,
                        })
                        wx.showToast({
                          title: '新增指纹失败',
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
                showMB:true,
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
            "menberId":2, //2是普通用户，1是管理员
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
                            showMB:true,  //隐藏幕布
                          })
                          var yhbh = _res.data.hardwareNumber;
                          if(yhbh < 10){
                            yhbh = '00'+yhbh
                          }
                          else{
                            yhbh = '0'+yhbh
                          }
                          xfbs='已完成';
                          that.insert_Rh_yhb(dsn,'01',yhbh,'',Stime_b,Etime_b);//插入门锁用户表
                          that.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');  
                          that.update_pwdRenterOld(dsn,'',renterNo,'01',yhbh);             
                        }                                              
                      }
                      else{   
                        xfbs='已完成';              
                        wx.hideLoading();  //关闭提示框
                        that.setData({
                          showMB:true,  //隐藏幕布
                        })
                        wx.showToast({
                          title: '新增指纹失败',
                          icon: "error",
                          duration: 2000
                        })
                        console.log(_res.code+'——>>'+_res.msg);                    
                      }
                    },
                    fail(res) {
                      xfbs='已完成';
                      wx.hideLoading();  //关闭提示框
                      that.setData({
                        showMB:true,
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
      else{  //网关下发
        if(lylx == "1"){ //旧锁
          wx.hideLoading();  //关闭提示框
          wx.showToast({
            title: '旧锁调用指纹的方法',
            icon: "none",
            duration: 2000
          })
          that.setData({
            showMB:true,  //隐藏幕布
          }) 
        }
        else if(lylx == "2"){ //新锁
          clearInterval(app.globalData.c_discon);//清除断开的定时器
          com.get_Connection(dsn,function(res){
            let conStatus = res;
            console.log("网关蓝牙连接返回："+conStatus);
            if(!conStatus){
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //隐藏幕布
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
                    duration: 2000
                  })
                }
                else{
                  if(res.data.code=='0'){
                    console.log("返回的code:"+res.data.code);
                    that.setData({
                      second_discon: 20,  //初始化成20秒
                    });
                    that.countdown_disconnect(); //调用断开的计时器
                    var yhbh = res.data.data.hardwareId;
                    if(yhbh < 10){
                      yhbh = '00'+yhbh
                    }
                    else{
                      yhbh = '0'+yhbh
                    }
                    that.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');
                    that.update_pwdRenterOld(dsn,'',renterNo,'01',yhbh);   //更新密码所有人
                    wx.hideLoading();  //关闭提示框
                    wx.showToast({
                      title: '新增指纹成功',
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
                      wx.showToast({
                        title: '新增指纹失败',
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
                  title: '新增指纹失败',
                  icon: "error",
                  duration: 2000
                })
              },
              complete(){
                wx.hideLoading();  //关闭提示框
                that.setData({
                  showMB:true,
                })  
              }
            });
          });
        }
        else if(lylx == "5" || lylx == "6"){ //国民NB锁
          wx.hideLoading();  //关闭提示框
          wx.showToast({
            title: '请在PC端进行指纹采集',
            icon: "none",
            duration: 2000
          })
          that.setData({
            showMB:true,
          }) 
        }
        else if(lylx == "20" || lylx == "21"){ //同欣TX433
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
  }
  else if(ksType=='02'){
    var Stime2 = Stime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
    var Etime2 = Etime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
    var Stime2 = Stime2.substr(2,12); //截取字符串如20211231173000截取成211231173000
    var Etime2 = Etime2.substr(2,12);
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '下发中...',
    })
    that.countdown(); //调用计时器
    if(buttonType=="lanya"){
      if(lylx == "5" || lylx == "6"){ //国民锁
        wx.showToast({
          title: '请在PC端进行卡片采集...',
          icon: "none",
          duration: 2000
        })
        that.setData({
          showMB:true, //隐藏幕布
        })    
      }
      else if(lylx == "20" || lylx == "21"){ //同欣TX433
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
             keyType: 2, // 钥匙类型，0指纹，1密码，2卡片
             validTimeMode: 0, // 时间模式为有效期类型
           };
           myPlugin.addKey(options1);  //下发指纹
         }
         else{
           wx.hideLoading();  //关闭提示框   
           wx.showToast({
             title: '连接失败',
             icon: "none",
             duration: 2000
           }) 
         }
       });
       // 监听“断开连接”事件
       myPlugin.on("close", function(state) {
         if(state.errCode="100024"){
           wx.showToast({
             title: '蓝牙连接已断开',
             icon: "none",
             duration: 2000
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
               duration: 2000
             })
           break;
           case 10001:
             wx.showToast({
               title: '当前蓝牙适配器不可用',
               icon: "none",
               duration: 2000
             })
           break;
           case 10002:
             wx.showToast({
               title: '没有找到指定设备',
               icon: "none",
               duration: 2000
             })
           break;
           case 10003:
             wx.showToast({
               title: '连接失败',
               icon: "none",
               duration: 2000
             })
           break;
           case 10006:
             wx.showToast({
               title: '当前连接已断开',
               icon: "none",
               duration: 2000
             })
           break;
           case 10012:
             wx.showToast({
               title: '连接超时',
               icon: "none",
               duration: 2000
             })
           break;
           default:
             wx.showToast({
               title: errMsg,
               icon: "none",
               duration: 2000
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
          else{
            yhbh = '0'+yhbh
          }
          self.setData({
            showMB:true,  //显示幕布
          })
          wx.hideLoading();  //关闭提示框
          self.insert_Rh_yhb(dsn,'02',yhbh,'',Stime2,Etime2);//插入门锁用户表
          self.insertLog_LS(userid,'',dsn,'下发','卡片('+yhbh+')','','朗思管理端');
          self.update_pwdRenterOld(dsn,'',renterNo,'02',yhbh);   //更新密码所有人
        }
        else{
          wx.hideLoading();  //关闭提示框   
          self.setData({
            showMB:true,  //显示幕布
          })
          wx.showToast({
            title: '新增卡片失败',
            icon: "error",
            duration: 2000
          }) 
        }
      });
      }
    }
    else{
      if(lylx == "20" || lylx == "21"){ //同欣TX433
        if(!cjq){
          wx.hideLoading();  //关闭提示框
          that.setData({
            showMB:true,  //隐藏幕布
          })
          wx.showToast({
            title: '请先选择采集器',
            icon: "none",
            duration: 2000
          })
          return;
        }
        var _dataNC = {act: "langsi_Get_card",eqnumber:cjq}
        wx.request({
          url: apiTX,  //api地址
          data: _dataNC,
          header: {'Content-Type': 'application/json'},
          method: "POST",
          async:false,  //同步
          success(res) {
            if(res==""){
              wx.showToast({
                title: res.data.reason,
                icon: "none",
                duration: 2000
              })
              that.setData({
                showMB:true,  //隐藏幕布
              })
            }
            else{
              let resultCode = res.data.resultCode;
              if(resultCode == "0")
              {
                let cardNo = res.data.data.cardNo;
                that.card_addTX(cardNo,Stime,Etime);  //同欣卡片添加
              }
              else{
                let reason = res.data.reason;
                wx.showToast({
                  title: reason,
                  icon: "none",
                  duration: 2000
                })
                that.setData({
                  showMB:true,  //隐藏幕布
                })
                console.log("resultCode：" + resultCode + '——>' + reason);
              }
            }       
          },
          fail(res) {
            console.log("getunits fail:",res);
          },
          complete(){
          }
        });
      }
      else{
        wx.showToast({
          title: '请在PC端进行卡片采集',
          icon: "none",
          duration: 2000
        })  
        that.setData({
          showMB:true,  //隐藏幕布
        })    
      }
    }
  }
  else if(ksType=='04'){
    wx.showToast({
      title: '功能开发中~',
      icon: "none",
      duration: 500
    })
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
      success(res) {
        if(res.data.status=="1"){
          wx.hideToast();  //关闭提示框
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
      header: {'Content-Type': 'application/json'},
      method: "get",
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
  Pwd_sendmsg:function(hid,renterNo,pwd){
    var _data = {ac: 'Pwd_sendmsg',"hid":hid,"pwd":pwd,"renterNo":renterNo};
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
 //更新密码所有人
 update_pwdRenter:function(dsn,newPwd,renterid,kslx){
  if(!newPwd){
    newPwd = "";
  }
  var _data = {ac: 'update_pwdRenter',"dsn":dsn,"newPwd":newPwd,"renterid":renterid,"kslx":kslx};
  wx.request({
    url: apiUrl,  //api地址
    data: _data,
    header: {'Content-Type': 'application/json'},
    method: "get",
    async:false,  //同步
    success(res) {
    },
    fail(res) {
    },
    complete(){
    }
  });    
  },
 //更新密码所有人
 update_pwdRenterOld:function(dsn,newPwd,renterid,kslx,yhbh){
  if(!newPwd){
    newPwd = "";
  }
  var _data = {ac: 'update_pwdRenterOld',"dsn":dsn,"newPwd":newPwd,"renterid":renterid,"kslx":kslx,"yhbh":yhbh};
  wx.request({
    url: apiUrl,  //api地址
    data: _data,
    header: {'Content-Type': 'application/json'},
    method: "get",
    async:false,  //同步
    success(res) {
    },
    fail(res) {
    },
    complete(){
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
  connectWebSocket: function (cjqbh,Stime,Etime){  //创建WebSocket服务器
    var that = this;
    wx.connectSocket({
      url: 'ws://139.9.182.161:7500/webSocket',
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
      //console.log('接收服务器发送的数据',res.data);
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
    var _dataNC = {act: "langsi_Get_fingerprints",eqnumber:cjqbh}
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
            duration: 2000
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
            duration: 2000
          })
        }
        else{
          if(res.data.code=='0'){
            wx.hideLoading();  //关闭提示框      
            that.insertLog_LS(userid,'',dsn,'下发','指纹','','朗思管理端');  
            that.update_pwdRenter(dsn,'',renterNo,'01'); 
            wx.showToast({
              title: '新增指纹成功',
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
          title: '新增指纹失败',
          icon: "error",
          duration: 2000
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
  card_addTX: function (cardNo,Stime,Etime){  //同欣卡片添加
    var that = this;
    var _dataNC = '{ac: "lockauth","partnerid":"hongqi","deviceid":"'+dsn+'","userdata":"'+cardNo+'","usertype":"02","begindate":"'+Stime+'","enddate":"'+Etime+'","channel":"21","type":"02"}'
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
            duration: 2000
          })
        }
        else{
          if(res.data.code=='0'){
            wx.hideLoading();  //关闭提示框      
            that.insertLog_LS(userid,'',dsn,'下发','卡片',cardNo,'朗思管理端');  
            that.update_pwdRenter(dsn,cardNo,renterNo,'02'); 
            wx.showToast({
              title: '新增卡片成功',
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
          title: '新增卡片失败',
          icon: "error",
          duration: 2000
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
    this.get_msyhQty(dsn,'gl','03',renterNo); //获取门锁用户数量
  }
})