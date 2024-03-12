let app = getApp();
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档(新锁)
const lockUtils = require("../../../utils/nzBleLockSDK/lockV2/LockUtils.js");//蓝牙操作文档(国民锁)
const bleApi = require("../../../utils/nzBleLockSDK/bleApi.js");//蓝牙操作文档(国民锁)
var com = require('../../../utils/commom.js');  //公共js
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
var dsn= "";  //设备号
var userid= "";  //登陆人工号
var lylx= "";  //供应商类型
var ljzt= false;  //连接状态
var ljzt_new= false;  //新锁连接状态
var bleN= "";  //蓝牙号
var ptlx= "hongqi";  //平台类型
var val_yl= "01"; //音量
var hid= "";  //房间id
var job= "";  //登录角色
var keyGroupId= "903";  //用户Id
var authCode= "";  //鉴权码
var aesKey= "";  //秘钥
var myPlugin= "";  //组件
var managePassword= "";  //管理密码
var gatewaySn= "";  //网关编号

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
  data: {
    cmdText:"",
    ljzt:"",  //连接状态
    showMB:true, //幕布
    second: 20, //倒计时20秒
    c:"",//定时器

    Starttime: '',
    Endtime: '',
    multiArray: [years, months, days, hours],
    //multiArray: [years, months, days, hours, minutes],
    //multiIndex: [0,9, 16, 10, 17],
    //multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    //endIndex: [1,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours()],
    endIndex: [1,date.getMonth(),date.getDate()-1,date.getHours()],
    choose_year: '',
    setInter: '',
    num: 1,
    showTime:true, //隐藏
  },
  onLoad: function (options) {
    let that = this;
    myPlugin= "";
    dsn = options.dsn;
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
    userid = app.globalData.userid;   //登陆人工号
    job = app.globalData.job;   //登录角色
    that.get_mcToMS(dsn); //获取设备号
    setTimeout(()=>{
      let lj_now = false;
      if(lylx == "1"){  //旧锁
        ljzt = BLE.authState();
      }
      else if(lylx == "2"){  //新锁
        ljzt = BLE_new.connectionState();
      }
      console.log("当前连接状态："+ljzt);
      if(!lj_now){
        if(lylx=="1"){  //旧锁
          BLE.openBLEConnection(dsn,function(res){
            if(res.errCode=='0'){
              ljzt_new = true;  //已连接
              that.setData({
                ljzt:'连接成功',
              })
            }
            else{
              ljzt_new = false;  //已连接
              that.setData({
                ljzt:'连接失败',
              })    
            }
          });
        }
        /*
        else if(lylx=="2"){  //新锁
          that.get_BLEConnection();  //蓝牙连接
        }
        */
      }
    },1500);
    /*
    setTimeout(()=>{
      that.setData({
        mslx:lylx,
        yhid:userid,
      })
    },10);
    */
    this.setData({
      choose_year: this.data.multiArray[0][0]
    });
  },
  introduce_myPlugin: function () {  //引入组件
    this.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '连接中...',
    })
    // 引入插件
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
        self.setData({
          ljzt:'连接成功',
          showMB:true,  //显示幕布
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
      wx.hideLoading();  //关闭提示框  
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
      wx.hideLoading();  //关闭提示框
      myPlugin.disconnect();
      self.setData({
        ljzt:'',
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
    // 监听“开锁”事件上报
    myPlugin.on("report:openLock", function(data) {
    });
  },
  // 同欣蓝牙开锁
  BLEopenLock_TX: function() {
    let that = this;
    myPlugin
      .openLock()
      .then(res => {
        if(res.errCode=="01"){
          that.insert_OpenLog(userid,dsn,'朗思管理端');//插入开门日志
          wx.hideToast();  //关闭提示框
          wx.showLoading({
            title: '开锁成功，请稍后',
          })
          clearInterval(that.data.c)//清除定时器
          setTimeout(()=>{
            wx.hideLoading();
            that.setData({
              showMB:true,  //隐藏幕布
            })  
          },6000)
        }
        else{
          wx.showToast({
            title: '操作失败',
            icon: "error",
            duration: 1000
          })
          that.setData({
            showMB:true,  //隐藏幕布
          })
        }
      })
      .catch(err => {
        that.setData({
          showMB:true,  //隐藏幕布
        })
      });
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
          dsn = units[0].equip_no,
          lylx = units[0].lx,
          bleN = units[0].bleName;
          hid = units[0].hid;
          aesKey = units[0].aesKey;
          authCode = units[0].commonAuthCode;
          managePassword = units[0].managePassword;
          gatewaySn = units[0].gatewaySn;
          _this.setData({
            hid:units[0].hid,
            dsn:units[0].equip_no,
            sbmc:units[0].equip_name,
            powerV:units[0].powerV,
            mslx:units[0].lx,
            yhid:userid,
          })
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
    //const minute = this.data.multiArray[4][index[4]];
    // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
     let tiem_s = year + '-' + month + '-' + day + ' ' + hour + ':' + '00';
     let ks = tiem_s.replace(/-/g, "/");
     let tiem_n = new Date();
     var s_Time = new Date(ks);  //开始时间
     var hour2  = parseInt((s_Time.getTime() - tiem_n.getTime()) / parseInt(1000 * 3600));
     if(hour2 <= -24){
      wx.showToast({
        title: '开始时间不能早于当前时间24小时',
        icon: 'none',
        duration: 1500
      });   
      this.setData({
        //Starttime: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
        Starttime: ''
      })
     }
     else{
      this.setData({
        //Starttime: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
        Starttime: tiem_s
      })
     }
     console.log("相差小时数："+hour2);
      console.log("开始时间："+year + '-' + month + '-' + day + ' ' + hour+ ':' + '00');
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
      //const minute = this.data.multiArray[4][Eindex[4]];
      this.setData({
        //Endtime: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
        Endtime: year + '-' + month + '-' + day + ' ' + hour + ':' + '00'
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
  tapEvent: function(e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    let url = "";
    if(lylx=="1"){
      ljzt = BLE.authState();//连接状态
    }
    else if(lylx=="2"){
      ljzt = BLE_new.connectionState();//连接状态  
    }
    if (index == '01') {  //蓝牙开门
      if(lylx=="20" || lylx=="21"){  //同欣锁
        let zt = that.data.ljzt;
        if(zt=="连接成功"){
          wx.showToast({
            title: '开锁中，请等待',
            icon: "loading",
            duration: 10000
          })
          that.setData({
            second: 20,  //初始化成20秒
            showMB:false,  //隐藏幕布
          }); 
          that.countdown(); //调用计时器         
          that.BLEopenLock_TX(); //蓝牙开门
        }
        else{
          wx.showToast({
            title: '请先连接门锁',
            icon: 'error',
            duration: 1000
          });    
        }
      }
      else if(lylx=="5" || lylx=="6"){ //国民锁
        that.setData({
          second: 20,  //初始化成20秒
          showMB:false,  //隐藏幕布
        }); 
        that.countdown(); //调用计时器         
        that.BLEopenLock_GM(); //蓝牙开门(国民锁)
      }
      else{
        if(ljzt && ljzt_new){
          if(lylx=="1"){
            wx.showToast({
              title: '开锁中，请等待',
              icon: "loading",
              duration: 10000
            })
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
                  cmd = autoNo+'AA5503003901'+'CC';
                  com.get_encryption(dsn,cmd,function(res){  //获取加密(蓝牙开门)
                    if(res.errCode2=='1001'){
                      let cmd = res.cmd;
                      let cmdT = autoNo+cmd;
                      BLE.sendCommand(cmdT,function(res){  //写入数据
                        //console.log("操作成功返回:"+res);
                        if(res.errCode==0){
                         that.insert_OpenLog(userid,dsn,'朗思管理端');//插入开门日志
                         setTimeout(()=>{
                          wx.hideToast();  //关闭提示框
                          wx.showToast({
                            title: '开锁成功',
                            icon: "success",
                            duration: 1000
                          })    
                        },1000)
                        }
                        else{
                          wx.hideToast();  //关闭提示框
                          wx.showToast({
                            title: '操作失败',
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
                wx.hideToast();  //关闭提示框
                console.log("getunits fail:",res);
              },
              complete(){
              }
            });         
          }
          else if(lylx=="2"){
            that.setData({
              second: 20,  //初始化成20秒
              showMB:false,  //隐藏幕布
            }); 
            wx.showToast({
              title: '开锁中，请等待',
              icon: "loading",
              duration: 10000
            })
            that.countdown(); //调用计时器         
            that.BLE_openDoor(); //新锁蓝牙开门
          }
        }
        else{
          wx.showToast({
            title: '请先连接门锁',
            icon: 'error',
            duration: 1000
          });       
        }
      }
    }
    else if (index == '02') { //管理
      if(lylx=="20" || lylx=="21"){
        if(!!myPlugin){
          myPlugin.disconnect();
        }
      }
      wx.navigateTo({
        url: '../../../pagesA/pages/mssj_list/mssj_list?dsn='+dsn
      })
    } else if ( index == '03' ) { //授时  
      if(lylx=="1"){
        if(ljzt && ljzt_new){
          that.setData({
            second: 20,  //初始化成20秒
            showMB:false,  //隐藏幕布
          }); 
          that.countdown(); //调用计时器            
          that.timeService(); //授时
        }
        else{
          wx.showToast({
            title: '请先连接门锁',
            icon: 'error',
            duration: 1000
          });           
        }
      }
      else if(lylx=="2"){
        if(ljzt && ljzt_new){
          that.setData({
            second: 20,  //初始化成20秒
            showMB:false,  //隐藏幕布
          }); 
          that.countdown(); //调用计时器            
          that.TOtime_newLock(); //OT时间
        }
        else{
          wx.showToast({
            title: '请先连接门锁',
            icon: 'error',
            duration: 1000
          });           
        }
      }
      else if(lylx=="5" || lylx=="6"){
        wx.showToast({
          title: '授时成功',
          icon: 'success',
          duration: 1000
        });
      }
      else if(lylx=="20" || lylx=="21"){
        //that.readDNAInfo_TX(); //读取DNA信息
        let zt = that.data.ljzt;
        if(zt=="连接成功"){
          wx.showToast({
            title: '授时中，请等待',
            icon: "loading",
            duration: 10000
          })
          that.Timing_TX(); //授时
          //that.readSystemInfo_TX(); //读取系统状态和参数
          //that.readDNAInfo_TX(); //读取DNA信息
        }
        else{
          wx.showToast({
            title: '请先连接门锁',
            icon: 'error',
            duration: 1000
          });    
        }     
      }     
    }else if( index == '04' ){ //一次性密码
      if(lylx=="1"){  //旧锁
        wx.request({
          url: app.globalData.apiHost + 'otpBle',
          data: {"deviceid":dsn},
          method: "get",
          success(res) {
            var otp = res.data.data.otp;
            wx.showModal({
              title: '注：一次性密码，有效期10分钟',
              showCancel: false,
              cancelText:'关闭',
              cancelColor:'red',
              confirmText:'返回',
              confirmColor:'#47a86c',
              content: res.data.data.otp.substr(0,4) + '  ' + res.data.data.otp.substr(4,4),
              success: function(res) {
              }
            })
            that.insertLog_LS(userid,'',dsn,'下发','一次性密码',otp,'朗思管家端');
          }
        });
      }
      else if(lylx=="2" || lylx=="5" || lylx=="6"){ //新锁
        /*
        that.setData({
          Starttime:'',
          Endtime:'',
          ifNameF:true,  //显示
        }); 
        */
       var jk = ""; //接口
       if(lylx=="2"){ //福州
         jk = 'temppassword';
       }
       else if(lylx=="5" || lylx=="6"){ //国民
         jk = 'gm_otp';
       }
       var _dataNC = '{ac: "temppassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'"}'
       wx.request({
        url: apiNC+jk,  //api地址
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
          else {
            if(res.data.code=='0'){
              var otp= "";
              var result_opt = "";
              var title = "注：一次性密码，有效期10分钟";
              if(lylx=="2"){
                otp = res.data.data;
                title = "注：一次性密码，有效期6小时";       
                result_opt = otp.substr(0,4) + '  ' + otp.substr(4,4)+ '  ' + otp.substr(8,4);
              }
              else if(lylx=="5" || lylx=="6"){
                otp = res.data.data.password;
                result_opt = otp.substr(0,4) + '  ' + otp.substr(4,4)+ '  ' + otp.substr(8,4);
                title = "注：一次性密码，有效期10分钟";
              }
              wx.showModal({
                  title: title,
                  showCancel: false,
                  cancelText:'关闭',
                  cancelColor:'red',
                  confirmText:'返回',
                  confirmColor:'#47a86c',
                  content: result_opt,
                  success: function(res) {
                  }
              })
              that.insertLog_LS(userid,'',dsn,'下发','一次性密码',otp,'朗思管家端');       
            }
            else{
              wx.showToast({
                title: res.data.msg,
                icon: "none",
                duration: 1000
              })                  
            }
          }
         }
       });
      }
      else if(lylx=="20" || lylx=="21"){ //同欣一次性密码
        var _dataNC = '{ac: "temppassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'"}'
        wx.request({
          url: apiNC+'tx_otp',  //api地址
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
            else {
              if(res.data.code=='0'){
                var otp = res.data.data.password;
                wx.showModal({
                   title: '注：一次性密码，有效期10分钟',
                   showCancel: false,
                   cancelText:'关闭',
                   cancelColor:'red',
                   confirmText:'返回',
                   confirmColor:'#47a86c',
                   content: otp.substr(0,3) + '  ' + otp.substr(3,3),
                   success: function(res) {
                   }
                })
                that.insertLog_LS(userid,'',dsn,'下发','一次性密码',otp,'朗思管家端');          
              }
              else{
                wx.showToast({
                  title: res.data.message,
                  icon: "none",
                  duration: 1000
                })                  
              }
            }
          }
        });
      }
    }else if( index == '05' ){ //新增用户
      wx.navigateTo({
        url: '../../../pagesA/pages/pwd_add/pwd_add?dsn='+dsn
      })
    }else if( index == '06' ){ //添加授权
      if(!!myPlugin){
        myPlugin.disconnect();
      }
      wx.navigateTo({
        url: '../../../pagesB/pages/roomUser_list/roomUser_list?hid='+hid
      })
    }else if( index == '11' ){ //新增指纹
      if(!!myPlugin){
        myPlugin.disconnect();
      }
      wx.navigateTo({
        url: '../../../pagesA/pages/zhiwen_add/zhiwen_add?dsn='+dsn
      })
    }else if( index == '12' ){ //下管理员
      if(ljzt && ljzt_new){
        wx.navigateTo({
          url: '../../../pagesA/pages/pwdGL_add/pwdGL_add?dsn='+dsn
        })
      }
      else{
        wx.showToast({
          title: '请先连接门锁',
          icon: 'error',
          duration: 1000
        });           
      }
    }else if( index == '13' ){ //添加人脸
      wx.navigateTo({
        url: '../../../pagesA/pages/face_add/face_add?dsn='+dsn
      })
    }else if( index == '14' ){ //同欣蓝牙下发
      if(!!myPlugin){
        myPlugin.disconnect();
      }
      wx.navigateTo({
        url: '../../../pagesA/pages/pwdTX_add/pwdTX_add?dsn='+dsn
      })
    }
    else if( index == '07' ){ //音量调节     
      if(lylx=="2"){  //福州锁
        that.setData({
          ifName:true,  //显示
        }); 
      }
      else{
        wx.showToast({
          title: '该锁不支持此功能',
          icon: "none",
          duration: 1000
        })
      }
    }else if(index == '08' ){//开门记录
      if(lylx=="1"){  //旧锁
        that.Lock_operationLog(dsn); //获取门锁日志
        wx.showToast({
          title: '加载中',
          icon: "loading",
          duration: 5000
        })
        setTimeout(()=>{
          wx.hideToast();
          wx.navigateTo({
            url: '../../../pages/openLock_list/openLock_list?mac='+dsn
          })
        },4000)
      }
      else{ //新锁
        wx.navigateTo({
          url: '../../../pages/openLock_list/openLock_list?mac='+dsn
        })
      }
    }else if ( index == '09' ) { //下发卡片
      if(lylx=="5" || lylx=="6"){
        bleApi.closeBle();
        /*
        wx.showToast({
          title: '请在PC端进行卡片采集',
          icon: "none",
          duration: 1000
        })  
        */
        wx.navigateTo({
          url: '../../../pagesA/pages/card_add/card_add?dsn='+dsn
        })
      }
      else{
        if(!!myPlugin){
          myPlugin.disconnect();
        }
        wx.navigateTo({
          url: '../../../pagesA/pages/card_add/card_add?dsn='+dsn
        })
      }
    }else if( index == '15' ){ //设备详情
      wx.navigateTo({
        url: '../../../pages/ms_info/ms_info?dsn='+dsn
      })
    }else if( index == '16' ){ //网关开门(福州锁)
      if(lylx=="2"){
        that.gatewayOpen(); //网关开门 
      }
      else if(lylx=="20" || lylx=="21"){
        that.gatewayOpen_TX(); //网关开门(同欣)
      }
    }else if( index == '17' ){ //离线密码
      wx.navigateTo({
        url: '../../../pagesA/pages/offline_add/offline_add?dsn='+dsn
      })
    }else if( index == '18' ){ //门锁OTA
      that.Lock_OTA(); //门锁OTA
    }
  },
  back: function() { //返回首页
    ljzt_new = false;
    if(lylx=="1"){
      BLE.closeBLEConnection();
    }
    else if(lylx=="2"){
      clearInterval(app.globalData.c_discon);//清除断开的定时器
      BLE_new.closeBLEConnection();
    }
    else if(lylx=="20" || lylx=="21"){
      if(!!myPlugin){
        myPlugin.disconnect();
      }
    }
    else if(lylx=="5" || lylx=="6"){
      bleApi.closeBle();
    }
    if(job=="样品管理员" || job=="安装" || job=="维保"){
      wx.switchTab({
        url: '../../../pages/homeYS/homeYS',
      })
    }else{
      wx.switchTab({
        url: '../../../pages/home/home',
      })
    }
  },
  linkBLE: function() {  //重新连接
    var that = this;
    that.setData({
      ljzt:'',
    })
    if(lylx=="1"){  //旧锁
      BLE.openBLEConnection(dsn,function(res){
        console.log(res)
        if(res.errCode=='0'){
            ljzt_new = true;
            that.setData({
            ljzt:'连接成功',
          })
          that.timeService(); //授时
        }
        else{
            ljzt_new = false;
            that.setData({
            ljzt:'连接失败',
          })    
        }
      });
    }
    else if(lylx=="2"){  //新锁
      that.get_BLEConnection();  //蓝牙连接
    }
    else if(lylx=="20" || lylx=="21"){
      that.introduce_myPlugin();  //引入组件
    }
    else if(lylx=="5" || lylx=="6"){
      wx.showToast({
        title: '该款锁无需蓝牙连接',
        icon: "none",
        duration: 1000
      })
    }
  },
  UnlinkBLE: function () {  //断开连接
    var that = this;
    ljzt_new = false;
    that.setData({
      ljzt:'',
    })
    if(lylx=="1"){
      BLE.closeBLEConnection();
    }
    else if(lylx=="2"){
      BLE_new.closeBLEConnection();
    }
    else if(lylx=="20" || lylx=="21"){
      myPlugin.disconnect();
    }
  },
  get_BLEConnection:function () {  //蓝牙连接
    var that = this;
    var _data1 = {"deviceSn":dsn,"cmd":'0101',"syncNo":''};
    var _data2 = {"deviceSn":dsn,"cmd":'0102',"syncNo":''};
    //第一次请求指令
    wx.request({
      url: apiNC+'cloud_function',  //api地址
      data: _data1,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      dataType: 'application/json',
      async:false,  //同步
      success(res) {
        let _res = JSON.parse(res.data);
        let cmd =_res.data;
        var cmdId = 0;
        //蓝牙连接
        BLE_new.openBLEConnection(bleN,function(res){
        if(res.errCode=='0'){
          ljzt_new = true;  //已连接
          if( that.data.ljzt == "连接成功" ) return;
          that.setData({
            ljzt:'连接成功',
          })
          //第一次写入指令
          setTimeout(function(){
            BLE_new.sendCommand(cmd,function(res){
            if(res.errCode==-1){
              console.log(res.errMsg);
            }
            else if(res.errCode==0){
            var _data3 = {"deviceSn":dsn,"data":res.data};
            //结果请求解析
            wx.request({
              url: apiNC+'cloud_function_parse',
              data: _data3,
              header: {'Content-Type': 'application/json'},
              method: "POST",
              dataType: 'application/json',
              async:false,  //同步
              success(res) {
                let _res = JSON.parse(res.data);
                if(_res.code == 0 ){
                  //如成功，则请求第二次指令
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
                                wx.showToast({
                                  title: '认证成功',
                                  icon: "success",
                                  duration: 1000
                                })
                              }
                            },
                            fail(res) {
                              //console.log("getunits fail:",res);
                            },
                            complete(){
                            }
                          });                    
                        }
                      }); 
                    },
                    fail(res) {
                      //console.log("getunits fail:",res);
                    },
                    complete(){
                    }
                  });         
                }                      
              },
              fail(res) {
                //console.log("getunits fail:",res);
              },
              complete(){
              }
              });
            }
            else{
              wx.showToast({
                title: '操作失败',
                icon: "none",
                duration: 1000
              })
            }
          });
        },500);
      }
      else{
        ljzt_new = false;  //连接失败
        that.setData({
          ljzt:'连接失败',
        })
        wx.showToast({
          title: '连接失败',
          icon: "none",
          duration: 1000
        })         
      }
      });
    },
    fail(res) {
    },
    complete(){
    }
    });
  },
  timeService: function() {  //授时
    var that = this;
    const date = new Date(); //获取当前时间
    let y = date.getFullYear();  //年
    let m = date.getMonth()+1; //月
    let d = date.getDate();  //日
    let h = date.getHours(); //时
    let mi = date.getMinutes(); //分
    let s = date.getSeconds(); //秒
    if(m < 10){ m = '0'+ m }
    if(d < 10){ d = '0'+ d }
    if(h < 10){ h = '0'+ h }
    if(mi < 10){ mi = '0'+ mi }
    if(s < 10){ s = '0'+ s }
    var Dtime = y.toString()+m.toString()+d.toString()+h.toString()+mi.toString()+s.toString();
    var timeT = Dtime.substr(2,12); //截取成220102001334
    wx.showLoading({
      title: '授时中...',
    })
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
          cmd = autoNo+'AA55080014'+timeT+'CC';
          //that.get_encryptionSS(dsn,cmd,autoNo);//获取加密(授时)
          com.get_encryption(dsn,cmd,function(res){  //获取加密(授时)
            //console.log("加密内码:"+res.errCode2);
            if(res.errCode2=='1001'){
              let cmd = res.cmd;
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                if(res.errCode==0){
                //setTimeout(()=>{
                  wx.hideLoading();  //关闭提示框
                  wx.showToast({
                    title: '授时成功',
                    icon: "success",
                    duration: 1000
                  })
                  that.setData({
                    showMB:true,  //隐藏幕布
                  })
                  //that.Lock_operationLog(dsn); //获取门锁日志    
                //},10)
                }
                else{
                  wx.hideLoading();  //关闭提示框
                  wx.showToast({
                    title: '授时失败',
                    icon: "error",
                    duration: 1000
                  })
                  that.setData({
                    showMB:true,  //隐藏幕布
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
  },
  onUnload: function () {  //生命周期函数--监听页面卸载
    ljzt_new = false;
    if(lylx=="1"){
      BLE.closeBLEConnection();
    }
    else if(lylx=="2"){
      clearInterval(app.globalData.c_discon);//清除断开的定时器
      BLE_new.closeBLEConnection();
      com.break_link(dsn); //断开连接
    }
    else if(lylx=="20" || lylx=="21"){
      if(!!myPlugin){
        myPlugin.disconnect();
      }
    }
    else if(lylx=="5" || lylx=="6"){
      bleApi.closeBle();
    }
  },
  BLE_openDoor:function () { //蓝牙开门
    let that = this;
    var _data1 = {"deviceSn":dsn,"cmd":'0204',"syncNo":''};
    wx.request({
      url: apiNC+'cloud_function',  //api地址
      data: _data1,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      dataType: 'application/json',
      async:false,  //同步    
      success(res) {
        let _res = JSON.parse(res.data);
        var cmd = _res.data;
        var cmdId = 0;
         //第一次写入指令
         BLE_new.sendCommand(cmd,function(res){
          if(res.errCode==-1){
            //console.log(res.errMsg);
            that.setData({
              showMB:true,  //隐藏幕布
            })
          }
          else if(res.errCode==0){
            var _data2 = {"deviceSn":dsn,"data":res.data};
            wx.request({
              url: apiNC+'cloud_function_parse',  //api地址
              data: _data2,
              header: {'Content-Type': 'application/json'},
              method: "POST",
              dataType: 'application/json',
              async:false,  //同步 
              success(res) {
                let _res = JSON.parse(res.data);
                if(_res.code == 0 ){
                  that.insert_OpenLog(userid,dsn,'朗思管理端');//插入开门日志
                  wx.showLoading({
                    title: '开锁成功，请稍后',
                  })
                  clearInterval(that.data.c)//清除定时器
                  setTimeout(()=>{
                    wx.hideLoading();
                    that.setData({
                    showMB:true,  //隐藏幕布
                    })  
                  },6000)
                }
                else{
                  wx.showToast({
                    title: '操作失败',
                    icon: "error",
                    duration: 1000
                  })
                  that.setData({
                    showMB:true,  //隐藏幕布
                  })
                }
              },
              fail(res) {
                that.setData({
                  showMB:true,  //隐藏幕布
                })
              },
              complete(){
              }
            });
          }
          else{
            wx.showToast({
              title: '操作失败',
              icon: "error",
              duration: 1000
            })
            that.setData({
              showMB:true,  //隐藏幕布
            })
          }
        });
      },
      fail(res) {
        that.setData({
          showMB:true,  //隐藏幕布
        })
      },
      complete(){
      }
    });  
  },
  TOtime_newLock:function () { //OT时间
    var that = this;
    var _data1 = {"deviceSn":dsn,"cmd":'0210',"syncNo":''};
    wx.request({
      url: apiNC+'cloud_function',  //api地址
      data: _data1,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      dataType: 'application/json',
      async:false,  //同步    
      success(res) {
        let _res = JSON.parse(res.data);
        var cmd = _res.data;
         BLE_new.sendCommand(cmd,function(res){
          if(res.errCode==-1){
            //console.log(res.errMsg);
            that.setData({
              showMB:true,  //隐藏幕布
            })
          }
          else if(res.errCode==0){
            var _data2 = {"deviceSn":dsn,"data":res.data};
            wx.request({
              url: apiNC+'cloud_function_parse',  //api地址
              data: _data2,
              header: {'Content-Type': 'application/json'},
              method: "POST",
              dataType: 'application/json',
              async:false,  //同步 
              success(res) {
                let _res = JSON.parse(res.data);
                if(_res.code == 0 ){
                  that.EndTime_newLock();//终端时间
                  setTimeout(()=>{
                    that.setData({
                    showMB:true,  //隐藏幕布
                    })  
                  },1000)
                }
                else{
                  wx.showToast({
                    title: 'OT时间失败',
                    icon: "error",
                    duration: 1000
                  })
                  that.setData({
                    showMB:true,  //隐藏幕布
                  })
                }
              },
              fail(res) {
                that.setData({
                  showMB:true,  //隐藏幕布
                })
              },
              complete(){
              }
            });
          }
          else{
            wx.showToast({
              title: 'OT时间失败',
              icon: "error",
              duration: 1000
            })
            that.setData({
              showMB:true,  //隐藏幕布
            })
          }
        });
      },
      fail(res) {
        that.setData({
          showMB:true,  //隐藏幕布
        })
      },
      complete(){
      }
    });  
  },
  EndTime_newLock:function () { //终端时间
    var that = this;
    var _data1 = {"deviceSn":dsn,"cmd":'0202',"syncNo":''};
    wx.request({
      url: apiNC+'cloud_function',  //api地址
      data: _data1,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      dataType: 'application/json',
      async:false,  //同步    
      success(res) {
        let _res = JSON.parse(res.data);
        var cmd = _res.data;
         BLE_new.sendCommand(cmd,function(res){
          if(res.errCode==-1){
            //console.log(res.errMsg);
          }
          else if(res.errCode==0){
            var _data2 = {"deviceSn":dsn,"data":res.data};
            wx.request({
              url: apiNC+'cloud_function_parse',  //api地址
              data: _data2,
              header: {'Content-Type': 'application/json'},
              method: "POST",
              dataType: 'application/json',
              async:false,  //同步 
              success(res) {
                let _res = JSON.parse(res.data);
                if(_res.code == 0 ){
                  wx.showToast({
                    title: '授时成功',
                    icon: "success",
                    duration: 1000
                  })
                }
                else{
                  wx.showToast({
                    title: '授时失败',
                    icon: "error",
                    duration: 1000
                  })
                }
              },
              fail(res) {
              },
              complete(){
              }
            });
          }
          else{
            wx.showToast({
              title: '授时失败',
              icon: "error",
              duration: 1000
            })
          }
        });
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  countdown: function () {
    let that = this;
    let second = that.data.second;
    clearInterval(this.data.c)//清除定时器
    that.data.c = setInterval(() => {//启动倒计时
      if(second == 0){
        clearInterval(this.data.c)//清除定时器
        //wx.hideLoading();  //关闭提示框
        that.setData({
          showMB:true,  //隐藏幕布
        });
        let ljState = false;
        if(lylx=="1"){
          ljState = BLE.authState();
        }
        else if(lylx=="2"){
          ljState = BLE_new.connectionState();//连接状态
        }
        if(!ljState){
          BLE_new.closeBLEConnection(); //断开连接
        }
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
  //插入开门记录
  insert_OpenLog:function(userid,dsn,xfly){
    var _data = {ac: 'insert_OpenLog',"userid":userid,"dsn":dsn,"xfly":xfly};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
      },
      fail(res) {
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
      },
      complete(){
      }
    });    
  },
  //获取门锁日志
  Lock_operationLog:function(dsn){
    var that = this;
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
          cmd = autoNo+'AA55020035'+'CC';
          com.get_encryption(dsn,cmd,function(res){  //获取加密(门锁日志)
            if(res.errCode2=='1001'){
              let cmd = res.cmd;
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                //console.log("获取门锁日志成功返回:"+res);
                if(res.errCode==0){
                  //console.log("获取门锁日志成功返回:"+res.res);
                  that.analyse_LockLog(dsn,res.res); //拆解门锁日志
                }
                else{
                  wx.showToast({
                    title: '操作失败',
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
      },
      complete(){
      }
    });   
  },
  //拆解门锁日志
  analyse_LockLog:function(dsn,val){
    var that = this;
    var strArr = [];
    var n = 1000;
    for (var i = 0, l = val.length; i < l/n; i++) {
    var a = val.slice(n*i, n*(i+1));
    strArr.push(a);
    }
    for (var j = 0; j < strArr.length; j++) {
      var k = 0;
      setTimeout(function () {
        that.insert_LockLog(dsn,strArr[k]); //插入门锁日志 
        k++    
      }, j * 200);                             
    }
  },
  //插入门锁日志
  insert_LockLog:function(dsn,val){
    //console.log("分解日志:"+val);
    var _data = {ac: 'insert_LockLog',"dsn":dsn,"val":val};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        //console.log("getunits success:",res);
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  radioChangeSJ:function(e){
    val_yl=e.detail.value;//获取输入的值
  },
  radioChangeXF:function(e){
    let that = this;
    var xflx = e.detail.value;
    if(xflx=="ycx"){  //一次性密码
      that.setData({
        showTime: true,    //隐藏弹出框
        xflx:xflx,
        Starttime: '',
        Endtime: ''
      }); 
    }
    else{
      that.setData({
        showTime: false,    //隐藏弹出框
        xflx:xflx
      }); 
    }
    console.log("下发类型："+xflx);
  },
  cancel: function (e) {  //返回
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    }); 
  },
  confirm: function (e) { //完善房间
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    });
    if(lylx == "2"){  //福州锁
      console.log("音量值："+val_yl);
      that.Adjust_volume(val_yl); //调节音量
    }
    else{
      wx.showToast({
        title: '该锁不支持此功能',
        icon: "none",
        duration: 1000
      })
    }
  },
  Adjust_volume:function (val_yl) { //调节音量
    let that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '音量调节中...',
    })  
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
      var _dataNC = '{ac: "param","deviceSn":"'+dsn+'","paramValue":"'+val_yl+'"}'
      wx.request({
        url: apiNC+'param',  //api地址
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
              that.setData({
                showMB:true,  //显示幕布
              })
              console.log("返回的code:"+res.data.code);
              com.break_link(dsn); //断开连接
              wx.showToast({
                title: '调节成功',
                icon: "success",
                duration: 1000
              })              
            }
            else{      
              console.log(res.data.code+'——>>'+res.data.msg);
              wx.showToast({
                title: '调节失败',
                icon: "error",
                duration: 1000
              })                              
            }
          }        
        },
        fail(res) {
          console.log("getunits fail:",res);
          wx.showToast({
            title: '调节失败',
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
  },
  cancelF: function (e) {  //返回
    let that = this;
    that.setData({
      Starttime:'',
      Endtime:'',
      ifNameF: false,    //隐藏弹出框
    }); 
  },
  confirmF: function (e) {
    let that = this;
    that.setData({
      ifNameF: false,    //隐藏弹出框
    });
    var kssj = that.data.Starttime;
    var jssj = that.data.Endtime;
    var xflx = that.data.xflx;
    var _dataNC = "";
    var jk = ""; //接口
    if(lylx=="2"){ //福州
      jk = 'temppassword';
    }
    else if(lylx=="5" || lylx=="6"){ //国民
      jk = 'gm_otp';
    }
    if(xflx!='offline'){  //一次性密码
      _dataNC = '{ac: "temppassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'"}'
      that.generate_pwd(jk,_dataNC,lylx,'','');
    }
    else{
      if(!kssj || !jssj){
        wx.showToast({
          title: '日期不能为空',
          icon: "none",
          duration: 1000
        })
        return false;      
      }
      var index_s = kssj.lastIndexOf(":");
      var star=kssj.substring(0,index_s+1);
      var ks=star+'00';
      var index_e = jssj.lastIndexOf(":");
      var end=jssj.substring(0,index_e+1);
      var js=end+'00';
      ks = ks.replace(/-/g, "/");
      js = js.replace(/-/g, "/");
      var sTime = new Date(ks);  //开始时间
      var eTime = new Date(js);  //结束时间
      var hous_xc  = parseInt((eTime.getTime() - sTime.getTime()) / parseInt(1000 * 3600));
      kssj = kssj+':00';
      jssj = jssj+':00';
      if(lylx=="2"){ 
        let star_s = star+'00';
        let end_e = end+'00';
        if(hous_xc < 1){
          wx.showToast({
            title: '开始时间和结束时间至少要差1个小时',
            icon: "none",
            duration: 1000
          }) 
          return false;
        }
        else{
          var _dataS = {ac: 'get_offlineFlag',"dsn":dsn,"kssj":kssj,"jssj":jssj};
          wx.request({
            url: apiUrl,  //api地址
            data: _dataS,
            header: {'Content-Type': 'application/json'},
            method: "get",
            async:false,  //同步
            success(res) {
              let xfzt = res.data.xfzt;
              if(xfzt=="已下发"){
                wx.showToast({
                  title: '该时间段已下发过，请选择别的时间段',
                  icon: "none",
                  duration: 1500
                }) 
                return false;
              }
              else{
                jk = 'add_offline_password';
                _dataNC = '{ac: "add_offline_password","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","begindate":"'+star_s+'","enddate":"'+end_e+'"}'
                that.generate_pwd(jk,_dataNC,lylx,kssj,jssj);
              }
            },
            fail(res) {
            },
          });
        }
      }
      else if(lylx=="5" || lylx=="6"){
        _dataNC = '{ac: "temppassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","begindate":"'+kssj+'","enddate":"'+jssj+'"}'
        that.generate_pwd(jk,_dataNC,lylx,kssj,jssj);
      }
    }
  },
  generate_pwd: function(jk,_dataNC,lylx,kssj,jssj) {
    let that = this;
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
            duration: 1000
          })  
        }
        else {
          if(res.data.code=='0'){
            var otp= "";
            var result_opt = "";
            var title = "注：一次性密码，有效期10分钟";
            if(lylx=="2"){
              if(jk == "add_offline_password"){ //离线密码
                otp = res.data.data.password;
                title = "注：离线密码，有效期24小时";
              }
              else{
                otp = res.data.data;
                title = "注：一次性密码，有效期6小时";
              }
              result_opt = otp.substr(0,4) + '  ' + otp.substr(4,4)+ '  ' + otp.substr(8,4);
            }
            else if(lylx=="5" || lylx=="6"){
              otp = res.data.data.password;
              result_opt = otp.substr(0,4) + '  ' + otp.substr(4,4)+ '  ' + otp.substr(8,4);
              title = "注：一次性密码，有效期10分钟";
            }
            wx.showModal({
              title: title,
              showCancel: false,
              cancelText:'关闭',
              cancelColor:'red',
              confirmText:'返回',
              confirmColor:'#47a86c',
              content: result_opt,
              success: function(res) {
              }
            })
            if(lylx=="2" && jk == "add_offline_password"){
              that.insert_offlineLog(dsn,kssj,jssj,otp);  //插入离线日志
            }
            that.insertLog_LS(userid,'',dsn,'下发','一次性密码',otp,'朗思管家端');          
          }
          else{
            wx.showToast({
              title: res.data.msg,
              icon: "none",
              duration: 1000
            })                  
          }
        }
      }
    });
  },
  // 同欣蓝牙授时
  Timing_TX: function() {
    var now_date = new Date()
    //var n = now_date.getTimezoneOffset();
    var timestamp = Math.floor(now_date.getTime() / 1000);
    console.log("时间戳："+timestamp);
    const params = {
      synchronizeTime: true,  // 启用校准时间
      systemTime: timestamp, // 时间戳，可以取系统时间，或NTP时间
      timezoneOffset: 28800, // 时区偏移量，计算方式如：new Date().getTimezoneOffset() * 60
    };
    myPlugin
      .synchronizeLockSystemTime(params)
      .then(res => {
        //console.log("openLock res -->", res);
        if(res.errCode=="01"){
          wx.hideToast();  //关闭提示框
          wx.showToast({
            title: '授时成功',
            icon: "success",
            duration: 1000
          })
        }
      })
      .catch(err => {
        //console.log("openLock res -->", res);
        wx.hideToast();  //关闭提示框
        wx.showToast({
          title: '授时失败',
          icon: "error",
          duration: 1000
        })
      });
  },
  // 国民蓝牙开锁
  BLEopenLock_GM: function() {
    let that = this
    wx.showToast({
      title: '开锁中，请等待',
      icon: "loading",
      duration: 15000
    })
    let pwdHex = lockUtils.authChangePwdCode(managePassword);
    wx.setStorageSync("device_key_" + dsn, pwdHex)
    let cmd = lockUtils.c_lock_open(userid);
    lockUtils.executeCmd({
      isAuthConnect: true,
      deviceSn: dsn,
      data: cmd,
      success: function (res) {
        console.log(JSON.stringify(res))
        if (res.data.state == 0) {
          that.insert_OpenLog(userid,dsn,'朗思管理端');//插入开门日志
          wx.hideToast();  //关闭提示框
          wx.showLoading({
            title: '已开锁，请稍后',
          })
          clearInterval(that.data.c)//清除定时器
          setTimeout(()=>{
            wx.hideLoading();
            that.setData({
              showMB:true,  //隐藏幕布
            }) 
            bleApi.closeBle();
          },6000)
        } else if (res.data.state == 1) {
          wx.showToast({
            title: '已关锁',
            icon: "success",
            duration: 1000
          })
        }
      },
      fail: function (err) {
        if (err.code == 1105 || err.code == 1102) {
          return;
        }
        bleApi.closeBle();
        wx.showToast({
          title: '开锁失败'+ err.msg,
          icon: "none",
          duration: 1000
        })
        that.setData({
          showMB:true,  //隐藏幕布
        })
      }
    })
  },
  gatewayOpen: function() { //网关开门
    let that = this
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '开锁中，请等待',
    })   
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

      var _dataNC = '{ac: "unlock","deviceid":"'+dsn+'"}'
      wx.request({
        url: apiNC+'unlock',  //api地址
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
              com.break_link(dsn); //断开连接
              var dateN = new Date();
              var year_n = dateN.getFullYear();    //年
              var month_n = dateN.getMonth()+1;    //月
              var day_n = dateN.getDate();         //日
              var hour_n = dateN.getHours();       //时
              var minutes_n = dateN.getMinutes();  //分
              var seconds_n = dateN.getSeconds();  //秒
              var nowTime_n = year_n+ "-" +month_n+ "-" +day_n+ " " +hour_n+":"+minutes_n+":"+seconds_n;
              console.log("开锁成功后时间:——>>"+nowTime_n);
              wx.showToast({
                title: '开锁成功',
                icon: "success",
                duration: 2000
              })                 
              that.setData({
                showMB:true,  //显示幕布
              })           
            }
            else{    
              wx.hideLoading();  //关闭提示框
              console.log(res.data.code+'——>>'+res.data.msg);
              wx.showToast({
                title: '开锁失败',
                icon: "error",
                duration: 2000
              })                           
            }
          }        
        },
        fail(res) {
          wx.showToast({
            title: '开锁失败',
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
  },
  gatewayOpen_TX: function() { //网关开门(同欣)
    let that = this
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '开锁中，请等待',
    })
    var _dataNC = '{ac: "tx_openDoorLock","deviceid":"'+dsn+'"}'
    wx.request({
      url: apiNC+'tx_openDoorLock',  //api地址
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
            showMB:true,  //显示幕布
          })
        }
        else{
          if(res.data.code=='0'){
            that.insert_OpenLog(userid,dsn,'朗思管理端');//插入开门日志
            wx.showLoading({
              title: '已开锁',
            })
            setTimeout(()=>{
              wx.hideLoading();
              that.setData({
                showMB:true,  //隐藏幕布
              })  
            },6000)           
          }
          else{   
            wx.hideLoading();  //关闭提示框
            console.log(res.data.code+'——>>'+res.data.message);
            wx.showToast({
              title: '开锁失败',
              icon: "error",
              duration: 2000
            })
            that.setData({
              showMB:true,  //显示幕布
            })                           
          }
        }        
      },
      fail(res) {
        wx.showToast({
          title: '开锁失败',
          icon: "error",
          duration: 2000
        })
        that.setData({
          showMB:true,  //显示幕布
        })
      },
      complete(){
        /*
        wx.hideLoading();  //关闭提示框
        that.setData({
          showMB:true,  //显示幕布
        })
        */
      }
    });
  },
  //同欣获取系统状态
  readSystemInfo_TX: function() {
    myPlugin.readSystemInfo().then(res => {
      if(res.errCode=="01"){
        let sqV = "" +res.data.timezoneOffset;
        console.log("时区差值——>>："+sqV);
        var title = "时区差值";
        wx.showModal({
          title: title,
          showCancel: false,
          cancelText:'关闭',
          cancelColor:'red',
          confirmText:'返回',
          confirmColor:'#47a86c',
          content:sqV,
          success: function(res) {
          }
        })
      }
    }).catch(err => {
      wx.hideToast();  //关闭提示框
      wx.showToast({
        title: '获取失败',
        icon: "error",
        duration: 1000
      })
    });
  },
 //同欣读取DNA信息
 readDNAInfo_TX: function() {
  myPlugin.readDNAInfo().then(res => {
    if(res.errCode=="01"){
      let dna = "" +res.data.DNAInfo;
      console.log("DNA信息——>>："+dna);
    }
  }).catch(err => {
    wx.hideToast();  //关闭提示框
    wx.showToast({
      title: '获取失败',
      icon: "error",
      duration: 1000
    })
  });
},
Lock_OTA: function() { //门锁ota
  let that = this
  that.setData({
    showMB:false,  //显示幕布
  })
  wx.showLoading({
    title: '升级中，请等待',
  })
    var _dataNC = '{ac: "version","deviceSn":"'+dsn+'"}'
    wx.request({
      url: apiNC+'version',  //api地址
      data: _dataNC,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: '升级失败',
            icon: "none",
            duration: 2000
          })
          that.setData({
            showMB:true,  //显示幕布
          })
        }
        else{
          if(res.data.code=='0'){
            //console.log("地址："+res.data.data.url);  
            let contentUrl = res.data.data.url;
            //let contentUrl = "https://lock-file-prod.oss-cn-hangzhou.aliyuncs.com/ota/8324420231027160825.bin";
            if(!contentUrl){
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //显示幕布
              })
              wx.showToast({
                title: '没有可升级的版本',
                icon: "none",
                duration: 2000
              })
            }
            else{
              var _dataNC = '{ac: "upgrade","contentUrl":"'+contentUrl+'","deviceSn":"'+dsn+'","gatewaySn":"'+gatewaySn+'"}'
              wx.request({
                url: apiNC+'upgrade',  //api地址
                data: _dataNC,
                header: {'Content-Type': 'application/json'},
                method: "POST",
                async:false,  //同步
                success(res) {
                  if(res==""){
                    wx.showToast({
                      title: '升级失败',
                      icon: "none",
                      duration: 2000
                    })
                    that.setData({
                      showMB:true,  //显示幕布
                    })
                  }
                  else{
                    that.progress_result(); //升级进度查询
                  }        
                },
                fail(res) {
                  wx.showToast({
                    title: '升级失败',
                    icon: "error",
                    duration: 2000
                  })
                  that.setData({
                    showMB:true,  //显示幕布
                  })
                },
                complete(){
                }
              });
            }
          }
          else{    
            wx.hideLoading();  //关闭提示框
            console.log(res.data.code+'——>>'+res.data.msg);
            wx.showToast({
              title: 'OTA失败',
              icon: "error",
              duration: 2000
            })
            that.setData({
              showMB:true,  //显示幕布
            })                           
          }
        }        
      },
      fail(res) {
        wx.showToast({
          title: 'OTA失败',
          icon: "error",
          duration: 2000
        })
        that.setData({
          showMB:true,  //显示幕布
        })
      },
      complete(){
      }
    });
},
progress_result: function() { //升级进度查询
  let that = this 
  var _dataNC = '{ac: "progress","deviceSn":"'+dsn+'","gatewaySn":"'+gatewaySn+'"}'
  wx.request({
    url: apiNC+'progress',  //api地址
    data: _dataNC,
    header: {'Content-Type': 'application/json'},
    method: "POST",
    async:false,  //同步
    success(res) {
      if(res==""){
        wx.showToast({
          title: '升级成功',
          icon: "none",
          duration: 2000
        })
      }
      else{
        if(res.data.code=='0'){
          let str = res.data.data;
          var index = str.indexOf("-");
          var totalSize = str.substring(0,index);
          var offset = str.substring(index + 1, str.length);
          var bfb = ((offset*1/totalSize*1)*100).toFixed(2);
          //console.log("百分比"+bfb);
          wx.showLoading({
            title: '升级进度'+bfb+'%',
          })
          if(totalSize==offset){
            that.upgrade_result(); //最终进度查询
          }
          else{
            setTimeout(()=>{
              that.progress_result(); //升级进度查询
            },1000)     
          }     
        }
        else{    
          wx.hideLoading();  //关闭提示框
          console.log(res.data.code+'——>>'+res.data.msg);
          wx.showToast({
            title: '升级失败',
            icon: "error",
            duration: 2000
          })
          that.setData({
            showMB:true,  //显示幕布
          })                           
         }
      }        
    },
    fail(res) {
      wx.showToast({
        title: '升级失败',
        icon: "error",
        duration: 2000
      })
      that.setData({
        showMB:true,  //显示幕布
      })
    },
    complete(){
    }
  });
},
upgrade_result: function() { //最终进度查询
  let that = this 
  var _dataNC = '{ac: "upgrade_result","deviceSn":"'+dsn+'","gatewaySn":"'+gatewaySn+'"}'
  wx.request({
    url: apiNC+'upgrade_result',  //api地址
    data: _dataNC,
    header: {'Content-Type': 'application/json'},
    method: "POST",
    async:false,  //同步
    success(res) {
      if(res==""){
        wx.showToast({
          title: '升级成功',
          icon: "none",
          duration: 2000
        })
      }
      else{
        if(res.data.code=='0'){
          console.log("升级成功");
          wx.showToast({
            title: '升级成功',
            icon: "success",
            duration: 2000
          })                 
          that.setData({
            showMB:true,  //显示幕布
          })           
        }
        else{    
          wx.hideLoading();  //关闭提示框
          console.log(res.data.code+'——>>'+res.data.msg);
          wx.showToast({
            title: '升级失败',
            icon: "error",
            duration: 2000
          })                           
        }
      }        
    },
    fail(res) {
      wx.showToast({
        title: '升级失败',
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
},
 //插入离线日志
 insert_offlineLog:function(dsn,kssj,jssj,Pwd){
  var _data = {ac: 'offlineLog_save',"dsn":dsn,"kssj":kssj,"jssj":jssj,"Pwd":Pwd};
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
})