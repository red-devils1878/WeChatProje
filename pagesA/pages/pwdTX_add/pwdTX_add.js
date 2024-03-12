var dsn= "";  //设备号
var userid= "";  //登陆人工号
var lylx= "";  //供应商类型
var newPwd = ""; //新密码
var pwdsl = 0;//密码数量
var roomId = "";//房间id
var keyGroupId= "903";  //用户Id
var authCode= "";  //鉴权码
var aesKey= "";  //秘钥
var myPlugin= "";  //组件
var managePassword= "";  //管理密码
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
const lockUtils = require("../../../utils/nzBleLockSDK/lockV2/LockUtils.js");//蓝牙操作文档(国民锁)
const bleApi = require("../../../utils/nzBleLockSDK/bleApi.js");//蓝牙操作文档(国民锁)
var com = require('../../../utils/commom.js');  //公共js

const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
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

  data: {  //页面的初始数据
    ljzt:"",  //连接状态
    Starttime: '',
    Endtime: '',
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    endIndex: [1,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    choose_year: '',
    showMB:true, //幕布
    setInter: '',
    num: 1,
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    myPlugin= "";
    dsn = options.dsn;
    apiUrl = app.globalData.apiUrl;   //获取api地址
    userid = app.globalData.userid;   //登陆人工号
    //设置默认的年份
    this.setData({
      choose_year: this.data.multiArray[0][0]
    });
    this.get_mcToMS(dsn); //获取设备号
    this.get_pwd(); //生成密码
    //this.get_msyhQty(dsn,'gl','03',userid); //获取门锁用户数量
  },
  get_mcToMS:function (dsn) { //获取设备号
    let _this = this;
    var _data = {ac: 'get_mcToMS',"dsn":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          roomId = units[0].hid;
          lylx = units[0].lx,
          aesKey = units[0].aesKey;
          authCode = units[0].commonAuthCode;
          managePassword = units[0].managePassword;
          _this.get_htrq(roomId); //获取合同有效期
          /*
          if(units[0].lx == "20"){  //新锁
            _this.introduce_myPlugin();  //引入组件
          }
          */
        }
        else{
          wx.showToast({
            title: '请先添加没锁！',
            icon: 'error',
            duration: 1000
          });           
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
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
          pwdsl = 0; //指纹数量
        }  
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  /*
  introduce_myPlugin: function () {  //引入组件
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
      console.log("plugin is on ready", plugin);
      console.log("蓝牙连接状态"+plugin.connected);
      if(plugin.connected="true"){
        self.setData({
          ljzt:'连接成功',
        })
        wx.showToast({
          title: '连接成功',
          icon: "success",
          duration: 1000
        })      
      }
      // 调用其他api
    });
    // 监听“断开连接”事件
    myPlugin.on("close", function(state) {
      console.log("plugin is on close, state -->", state);
      if(state.errCode="100024"){
        wx.showToast({
          title: '蓝牙连接已断开',
          icon: "none",
          duration: 1000
        })
        self.setData({
          ljzt:'',
          showMB:true,
        })
      }
    });
    // 监听“运行错误”事件
    myPlugin.on("error", function(err) {
      console.log("plugin is on error -->", err);
      const { errCode, errMsg } = err
      switch(errCode) {
        case 10000:  // 数据解析异常
          wx.showToast({
            title: '请打开手机蓝牙',
            icon: "none",
            duration: 1000
          })
          self.setData({
            ljzt:'',
          })
        break;
        case 10001:
          wx.showToast({
            title: '当前蓝牙适配器不可用',
            icon: "none",
            duration: 1000
          })
          self.setData({
            ljzt:'',
          })
        break;
        case 10002:
          wx.showToast({
            title: '没有找到指定设备',
            icon: "none",
            duration: 1000
          })
          self.setData({
            ljzt:'',
          })
        break;
        case 10003:
          wx.showToast({
            title: '连接失败',
            icon: "none",
            duration: 1000
          })
          self.setData({
            ljzt:'',
          })
        break;
        case 10006:
          wx.showToast({
            title: '当前连接已断开',
            icon: "none",
            duration: 1000
          })
          self.setData({
            ljzt:'',
          })
        break;
        case 10012:
          wx.showToast({
            title: '连接超时',
            icon: "none",
            duration: 1000
          })
          self.setData({
            ljzt:'',
          })
        break;
      }
    });
    // 监听“添加钥匙”事件
    myPlugin.on("addKey", function(data){
      console.log('plugin is on addKey, data is ', data)
    })
    // 监听“添加钥匙”事件上报
    myPlugin.on("report:addKey", function(data) {
      console.info("plugin is on add key, data is ", data);
    });
  },
  */
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
  onReady: function () {  //生命周期函数--监听页面初次渲染完成
  },
  formSubmit: function (e){  //保存数据
    var that = this;
    var startDate = e.detail.value.start_time;
    var endDate = e.detail.value.end_time;
    var newPwd = e.detail.value.pwd;
    if(pwdsl >= 5){
      wx.showToast({
        title: '密码最多1个,不能再下发!',
        icon: "none",
      })
      return false;
    }
    if(!startDate || !endDate){
      wx.showToast({
        title: '日期不能为空!',
        icon: "none",
      })
      return;
    }
    else{
      startDate = startDate+':00';
      endDate = endDate+':00';
    }
    if(!newPwd || newPwd.length != 6){
      wx.showToast({
        title: '请输入6位数字！',
        icon: 'none'
      })
    }
    else{
      var Stime2 = startDate.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
      var Etime2 = endDate.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
      var Stime2 = Stime2.substr(2,12); //截取字符串如20211231173000截取成211231173000
      var Etime2 = Etime2.substr(2,12);
      that.setData({
        showMB:false,  //显示幕布
      })
      wx.showLoading({
        title: '下发中...',
      })
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
            var validStartTime = new Date(startDate);
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
    var _data = {ac: 'operateLog_save',"wx_id":wx_id,"hid":hid,"sbh":sbh,"czlx":czlx,"Pwd_type":Pwd_type,"Pwd":Pwd,"xfly":xfly};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      async:false,  //同步    
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
  onShow: function () {  //生命周期函数--监听页面显示
  },

  /**
    * 生命周期函数--监听页面卸载
  */
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
})