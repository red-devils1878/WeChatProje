let app = getApp();
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档(新锁)
const lockUtils = require("../../../utils/nzBleLockSDK/lockV2/LockUtils.js");//蓝牙操作文档(国民锁)
const bleApi = require("../../../utils/nzBleLockSDK/bleApi.js");//蓝牙操作文档(国民锁)
var com = require('../../../utils/commom.js');  //公共js
var apiUrl = "";   //获取api地址
var apiNC = "";     //获取门锁api地址(新锁)
var dsn= "";  //设备号
var userid= "";  //登陆人工号
var lylx= "";  //供应商类型
var ljzt= false;  //连接状态
var ljzt_new= false;  //新锁连接状态
var bleN= "";  //蓝牙号
var ptlx= "hongqi";  //平台类型
var job= "";  //登录角色
var keyGroupId= "903";  //用户Id
var authCode= "";  //鉴权码
var aesKey= "";  //秘钥
var myPlugin= "";  //组件
var managePassword= "";  //管理密码
var gatewaySn= "";  //网关编号
var sbid= "";  //蓝牙id

Page({
  data: {
    cmdText:"",
    ljzt:"",  //连接状态
    showMB:true, //幕布
    second: 20, //倒计时20秒
    c:"",//定时器
    setInter: '',
    num: 1,
    showTime:true, //隐藏
  },
  onLoad: function (options) {
    let that = this;
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
    userid = app.globalData.userid;   //登陆人工号
    myPlugin= "";
    sbid = options.sbid;
    dsn = options.sbid;
    if(sbid.indexOf("501A") != -1){
      lylx = "1";
    }
    that.get_dsnToMS(sbid); //获取设备号
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
          that.insert_OpenLog(userid,dsn,'管理端');//插入开门日志
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
  get_dsnToMS:function (sbid) { //获取设备号
    let _this = this;
    var _data = {ac: 'get_dsnToMS',"sbid":sbid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          dsn = units[0].dsn,
          lylx = units[0].lx,
          bleN = units[0].bleName;
          aesKey = units[0].aesKey;
          authCode = units[0].commonAuthCode;
          managePassword = units[0].managePassword;
          gatewaySn = units[0].gatewaySn;
          _this.setData({
            dsn:units[0].dsn,
            sbmc:units[0].mc,
            powerV:units[0].power,
          })
          let apiHost = "https://aptApi.langsi.com.cn/api/lock/";
          let apiPC = "https://aptApi.langsi.com.cn/api/lock/cmd2";
          app.globalData.apiHost = apiHost;   
          app.globalData.apiPC = apiPC;   
          wx.setStorageSync("apiHost", apiHost);
          wx.setStorageSync("apiPC", apiPC);
        }
        else{
          if(sbid.indexOf("501A") == -1){
            bleN = "";
            aesKey = "";
            authCode = "";
            managePassword = "";
            gatewaySn = "";
            let apiHost = "https://aptApi.langsi.com.cn/api/lock/";
            let apiPC = "https://aptApi.langsi.com.cn/api/lock/cmd2";
            app.globalData.apiHost = apiHost;
            app.globalData.apiPC = apiPC; 
            wx.setStorageSync("apiHost", apiHost);
            wx.setStorageSync("apiPC", apiPC);
            wx.showToast({
              title: '请先添加没锁！',
              icon: 'error',
              duration: 1000
            });  
          }
          else{
            let apiHost = "https://langsi.com.cn/api/lock/";
            let apiPC = "https://langsi.com.cn/api/lock/cmd2";
            app.globalData.apiHost = apiHost;   
            app.globalData.apiPC = apiPC; 
            wx.setStorageSync("apiHost", apiHost);
            wx.setStorageSync("apiPC", apiPC);
          }    
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
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
    if(sbid.indexOf("501A") == -1 && lylx==''){
      wx.showToast({
        title: '门锁不在基本档',
        icon: 'none',
        duration: 1000
      }); 
      return false;
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
            that.setData({
               showMB:false,  //显示幕布
            })    
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
                         that.insert_OpenLog(userid,dsn,'管理端');//插入开门日志
                         setTimeout(()=>{
                          wx.hideToast();  //关闭提示框
                          that.setData({
                            showMB:true,  //显示幕布
                          })  
                          wx.showToast({
                            title: '开锁成功',
                            icon: "success",
                            duration: 1000
                          })    
                        },1000)
                        }
                        else{
                          wx.hideToast();  //关闭提示框
                          that.setData({
                            showMB:true,  //显示幕布
                          })  
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
                that.setData({
                    showMB:true,  //显示幕布
                })
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
   else if ( index == '03' ) { //授时  
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
          }
        });
      }
      else if(lylx=="2" || lylx=="5" || lylx=="6"){ //新锁
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
    }
    else if( index == '15' ){ //设备详情
      wx.navigateTo({
        url: '../../../pages/ms_info/ms_info?dsn='+dsn
      })
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
    if(job=="样品管理员"){
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
                  that.insert_OpenLog(userid,dsn,'管理端');//插入开门日志
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
          that.insert_OpenLog(userid,dsn,'管理端');//插入开门日志
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
})