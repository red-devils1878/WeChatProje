var app = getApp();
var apiUrl = "";   //获取api地址
var apiYC = "";     //获取门锁api地址(远程)
var apiNC = "";     //获取门锁api地址(新锁)
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档(新锁)
var com = require('../../../utils/commom.js');  //公共js
const lockUtils = require("../../../utils/nzBleLockSDK/lockV2/LockUtils.js");//蓝牙操作文档(国民锁)
const bleApi = require("../../../utils/nzBleLockSDK/bleApi.js");//蓝牙操作文档(国民锁)
var dsn= "";  //设备号
var userid= "";  //登陆人工号
var ptlx= "hongqi";  //平台类型
var renterNo= "";  //归属人
var lylx= "";  //供应商类型
var ljzt_new= false;  //新锁连接状态
var bleN= "";  //蓝牙号
var hid= "";  //房间id
var keyGroupId= "903";  //用户Id
var authCode= "";  //鉴权码
var aesKey= "";  //秘钥
var myPlugin= "";  //组件
var managePassword= "";  //管理密码
var gysly= "";  //供应商来源
Page({
  
  data: {
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    showMB:true, //幕布
    yhIndex: 0,
    second: 30, //倒计时20秒
    c:"",//定时器
    ljzt:"",  //连接状态
    detail_link:true, //连接按钮
    BLE_link:"",  //连接状态
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    myPlugin= "";
    dsn = options.dsn;
    renterNo = options.renterNo;
    //dsn = "501A102106013906"
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiYC = app.globalData.apiYC;     //获取门锁api地址(远程)
    apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
    userid = app.globalData.userid;   //登陆人工号
    wx.getSystemInfo( {   //获取当前设备的宽高
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
    this.get_mssj(dsn,renterNo); //获取门锁数据
    this.get_mcToMS(dsn); //获取设备号

  /*调用一次定位*/
  wx.getLocation({
    type: 'gcj02',
    success (res) {
      console.log(res)
    }
  })
  },
  get_mssj:function (dsn,renterNo) { //获取门锁数据
    let _this = this;
    _this.setData({
      servicelist:[]
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'msyhZK_list',"dsn":dsn,"renterNo":renterNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        const newlist = [];
        var units = res.data.rows;
        if(units.length > 0){
          var sbmc = units[0].equip_name;
          hid = units[0].hid;
          bleN = units[0].bleName;
          lylx = units[0].lylx;
          for (var i = 0; i < units.length; i++) {
            newlist.push({
              "id":units[i].id,
              "hid":units[i].hid,
              "equip_no":units[i].equip_no,
              "yhbh":units[i].yhbh,
              "kslxmc":units[i].kslxmc,
              "lx":units[i].lx,
              "ly":units[i].channel_name,
              "pwd":units[i].password,
              "pwd_user":units[i].pwd_user,
              "yxsj":units[i].kssj+'--'+units[i].jssj,
              "renterid":units[i].renterid,
              "ztmc":units[i].ztmc,
              "lylx":units[i].lylx,
            })
          } 
          setTimeout(()=>{
            _this.setData({
              servicelist:newlist,
              sbmc:sbmc,
              detail_link:false
            })
          },1000)
        }
        else{
          _this.setData({
            detail_link:true
          })
        }
      },
      fail(res) {
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      },
      complete(){
      }
    });  
  },
  get_mcToMS:function (dsn) { //获取设备号
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
          aesKey = units[0].aesKey;
          authCode = units[0].commonAuthCode;
          gysly = units[0].lx;
          managePassword = units[0].managePassword;
        }
        else{
          aesKey = "";
          authCode = "";
          gysly = "";
          managePassword = "";         
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
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
        wx.hideLoading();  //关闭提示框   
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
      if(state.errCode="100024"){
        wx.hideLoading();  //关闭提示框   
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
    // 监听“删除钥匙”事件
    myPlugin.on("removeKey", function(data){
    });
    // 监听“删除钥匙”事件上报
    myPlugin.on("report:removeKey", function(data) {
    });
  },
  goToTop:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  scrollLoading:function(){ //滚动加载
    //this.get_mssj(dsn,renterNo); //获取门锁数据
  },
  //重新发送
  Resend: function(e){
    let that = this;
    let rentId = e.currentTarget.dataset.rentid;  //租客
    let hid = e.currentTarget.dataset.hid;  //房间id
    let pwd = e.currentTarget.dataset.pwd;  //密码
    let lx = e.currentTarget.dataset.lx;  //类型
    if(lx=="03"){ //密码
      if(!rentId || !pwd){
        wx.showToast({
          title: '租客或密码为空，发送失败！',
          icon: "none",
          duration: 2000
        }) 
      }
      else{
        that.Pwd_sendmsg(hid,rentId,pwd); //发送短信
      }
    }
    else{
      wx.showToast({
        title: '只能重发密码！',
        icon: "none",
        duration: 1000
      }) 
    }
  },
  // 删除
  delList: function(e){
    let that = this;
    let id = e.currentTarget.dataset.key;  // 当前流水号
    var _data = {ac: "mssj_info","id":id};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let id = units[0].id
          let yhbh = units[0].yhbh
          let dsn = units[0].equip_no
          let lx = units[0].lx //01指纹，02卡片，03密码
          let pwd_old = units[0].password //密码
          let lylx = units[0].lylx
          that.password_del(yhbh,lx,dsn,pwd_old,lylx); //删除密码
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  password_del:function(yhbh,lx,dsn,pwd_old,lylx){  //删除密码
    var that = this;
    let ljzt = false;//连接状态
    if(lylx=="1"){
      ljzt = BLE.authState();//连接状态
    }
    else if(lylx=="2"){
      ljzt = BLE_new.connectionState();//连接状态  
    }
    else if(lylx=="20" || lylx=="21"){
      if(that.data.ljzt=="连接成功"){
        ljzt = true;
      }
      else{
        ljzt = false;
      }
    }
    that.setData({
      showMB:false,  //显示幕布
      second: 40,  //初始化成40秒
    })
    that.countdown(); //调用计时器
    //蓝牙下发
    if(ljzt){
      wx.showLoading({
        title: '删除中...',
      })
      if(lylx == "1"){
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
              var hexyhbh = com.ex10hex(yhbh,2); //十进制转成十六进制
              if(lx=='01'){  //01指纹
                cmd = autoNo+'AA5505001C0201'+hexyhbh+'CC';
              }else if(lx=='03'){ //03密码
                cmd = autoNo+'AA5505001C0203'+hexyhbh+'CC';
              }
              com.get_encryption(dsn,cmd,function(res){  //获取加密
                if(res.errCode2=='1001'){
                  let cmd = res.cmd;
                  let cmdT = autoNo+cmd;
                  BLE.sendCommand(cmdT,function(res){  //写入数据
                    if(res.errCode==0){
                      wx.hideLoading();  //关闭提示框
                      that.del_Rh_yhb(dsn,yhbh,lx);//删除门锁用户
                      if(lx=='01'){  //01指纹
                        that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                      }else if(lx=='03'){ //03密码
                        that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                      }
                    }
                    else{
                      wx.hideLoading();  //关闭提示框
                      wx.showToast({
                        title: '删除失败',
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
            wx.hideLoading();  //关闭提示框
            console.log("getunits fail:",res);
          },
          complete(){
            that.setData({
              showMB:true,  //显示幕布
            })
          }
        });
      }
      else if(lylx == "2"){
        var xfbs_del='下发中';
        var hardwareNumber = parseInt(yhbh, 10);  //用户编号
        var unlockModeEnum = 1;
        if(lx=='01'){  //指纹
          unlockModeEnum = 3; //代表密码，3代表指纹
        }
        else if(lx=='03'){ //密码
          unlockModeEnum = 1;
        }    
        var _data2 = {
          "deviceSn":dsn,
          "cmd":"0302",
          "syncNo":"0",
          "cloudUnlockBO":{
          "unlockModeEnum":unlockModeEnum,
          "registerStatusEnum":"START",
          "effectiveNum":0,
          "memberTypeEnum":"NORMAL", //NORMAL是普通用户，ADMIN是管理员
          "hardwareNumber":hardwareNumber,
          "menberId":2, //2是普通用户，1是管理员
          "isOpenCycle":0,
          "loopType":"LOOP_NOT",
          "loopFlag":"00000000",
          "password":'',
          "startTime":'',
          "endTime":''
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
                    if( _res.code == 0 ){
                      wx.hideLoading();  //关闭提示框
                      console.log("删除下发标识："+xfbs_del);
                      that.setData({
                        showMB:true,  //显示幕布
                      })
                      if(xfbs_del =='已完成'){
                        return;
                      }
                      else{
                        xfbs_del='已完成';
                        that.del_Rh_yhb(dsn,yhbh,lx);//删除门锁用户
                        if(lx=='01'){  //指纹
                          that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                        }
                        else if(lx=='03'){ //密码
                          that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                        }
                      }                      
                    }
                    else{   
                      that.setData({
                        showMB:true,  //显示幕布
                      })         
                      wx.showToast({
                        title: '删除用户失败',
                        icon: "error",
                        duration: 1000
                      })
                      xfbs_del='已完成';
                      console.log(_res.code+'——>>'+_res.msg);                    
                    }
                  },
                  fail(res) {
                    that.setData({
                      showMB:true,  //显示幕布
                    })
                    xfbs_del='已完成';
                    //console.log("getunits fail:",res);
                  },
                  complete(){
                  }
                });                    
              }
            });     
          },
          fail(res) {
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
      else if(lylx == "20" || lylx == "21"){
        let lockKeyId = yhbh*1;  //用户编号
        let keyTypeArray = [1];
        if(lx=='01'){  //01指纹
          keyTypeArray = [0];
        }else if(lx=='02'){  //卡片
          keyTypeArray = [2];
        }else if(lx=='03'){  //密码
          keyTypeArray = [1];
        }
        var options1 = {
          mode: 0,
          lockKeyId: lockKeyId,
          keyType: keyTypeArray
        };
        myPlugin
          .removeKey(options1)
          .then(function(res) {   
            if(res.errCode=="01"){
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //显示幕布
              })
              that.del_Rh_yhb(dsn,yhbh,lx);//删除门锁用户
              if(lx=='01'){  //01指纹
                that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
              }else if(lx=='02'){ //02卡片
                that.insertLog_LS(userid,'',dsn,'删除','卡片('+yhbh+')',pwd_old,'朗思管理端');
              }else if(lx=='03'){ //03密码
                that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
              }                       
            }              
          })
          .catch(function(err) {
            wx.hideLoading();  //关闭提示框   
            that.setData({
              showMB:true,  //显示幕布
            })
            wx.showToast({
              title: '删除用户失败',
              icon: "error",
              duration: 1000
            })   
          });
      }
    }
    else{  //网关下发
    if(lylx == "1"){  //旧锁
      wx.showLoading({
        title: '删除中...',
      })
      if(lx=='01'){  //01指纹
        var _dataYC = { ac: "deletepassword", partnerid: ptlx, deviceid: dsn, passwordid: yhbh, channel: "21"};
        wx.request({
          url: apiYC,  //api地址
          data: _dataYC,
          header: {'content-type': 'application/x-www-form-urlencoded'},
          method: "POST",
          async:false,  //同步
          success(res) {
            if(res.data.state == true){
              wx.hideLoading();  //关闭提示框
              that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
              wx.showToast({
                title: '删除成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_mssj(dsn,renterNo); //获取门锁数据
              },1000)
            }
            else{
              wx.hideLoading();  //关闭提示框
              wx.showToast({
                title: '删除失败',
                icon: "error",
                duration: 1000
              })          
            }
          },
          fail(res) {
            console.log("getunits fail:",res);
            wx.showToast({
              title: '删除失败',
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
      }else if(lx=='03'){ //03密码
        var _dataYC = { ac: "deletepassword", partnerid: ptlx, deviceid: dsn, passwordid: yhbh, channel: "21"};
        wx.request({
          url: apiYC,  //api地址
          data: _dataYC,
          header: {'content-type': 'application/x-www-form-urlencoded'},
          method: "POST",
          async:false,  //同步
          success(res) {
            if(res.data.state == true){
              wx.hideLoading();  //关闭提示框
              that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
              wx.showToast({
                title: '删除成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_mssj(dsn,renterNo); //获取门锁数据
              },1000)
            }
            else{
              wx.hideLoading();  //关闭提示框
              wx.showToast({
                title: '删除失败',
                icon: "error",
                duration: 1000
              })          
            }
          },
          fail(res) {
            console.log("getunits fail:",res);
            wx.showToast({
              title: '删除失败',
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
      }
    }
    else if(lylx == "2"){  //新锁
      clearInterval(app.globalData.c_discon);//清除断开的定时器
      wx.showLoading({
        title: '删除中...',
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
        var _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
        wx.request({
          url: apiNC+'deletepassword',  //api地址
          data: _dataNC,
          header: {'content-type': 'application/json'},
          method: "POST",
          async:false,  //同步
          success(res) {
            if(res==""){
              wx.hideLoading();  //关闭提示框
              wx.showToast({
                title: '删除失败',
                icon: "none",
                duration: 1000
              })
            }
            else{
              if(res.data.code == '0' || res.data.code == '40009'){
                wx.hideLoading();  //关闭提示框
                if(lx=='01'){  //指纹
                  that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                }
                else if(lx=='03'){ //密码
                  that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                }               
                wx.showToast({
                  title: '删除成功',
                  icon: "success",
                  duration: 1000
                })
                setTimeout(()=>{
                  that.get_mssj(dsn,renterNo); //获取门锁数据
                },1000)
              }
              else{              
                console.log("code:"+res.data.code+"——>>msg:"+res.data.msg);             
                wx.hideLoading();  //关闭提示框
                if(res.data.code=="10010"){
                  wx.showToast({
                    title: res.data.msg,
                    icon: "error",
                    duration: 1000
                  }) 
                }
                else{
                  wx.showToast({
                    title: '删除失败',
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
              title: '删除失败',
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
    else if(lylx == "5" || lylx == "6" || lylx == "20" || lylx == "21"){ //国民NB锁或同欣433
      wx.showLoading({
        title: '删除中...',
      })
      let jk = ""; //接口
      if(lylx == "5" || lylx == "6"){
        jk = 'gm_del_user';
      }else if(lylx == "20" || lylx == "21"){
        jk = 'tx_del_user';
      }
      var _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
      wx.request({
        url: apiNC+jk,  //api地址
        data: _dataNC,
        header: {'content-type': 'application/json'},
        method: "POST",
        async:false,  //同步
        success(res) {
          if(res==""){
            wx.hideLoading();  //关闭提示框
            wx.showToast({
              title: '删除失败',
              icon: "none",
              duration: 1000
            })
          }
          else{
            if(res.data.code == '0'){            
              if(lx=='01'){  //指纹
                that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
              }
              else if(lx=='02'){ //卡片
                that.insertLog_LS(userid,'',dsn,'删除','卡片('+yhbh+')',pwd_old,'朗思管理端');
              }
              else if(lx=='03'){ //密码
                that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
              }       
              wx.hideLoading();  //关闭提示框    
              wx.showToast({
                title: '删除成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_mssj(dsn,renterNo); //获取门锁数据
              },1000)
            }
            else{              
              console.log("code:"+res.data.code+"——>>msg:"+res.data.message);    
              wx.hideLoading();  //关闭提示框        
              wx.showToast({
                title: '删除失败',
                icon: "error",
                duration: 1000
              })                             
            }     
          }
        },
        fail(res) {
          wx.showToast({
            title: '删除失败',
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
    }
    }
  },
  del_Rh_yhb: function (dsn,yhbh,lx){  //删除门锁用户
    var that = this;
    var _data = {ac: 'yhb_del',"yhbh":yhbh,"dsn":dsn,"lx":lx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.hideToast();  //关闭提示框
          wx.showToast({
            title: '删除成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            that.get_mssj(dsn,renterNo); //获取门锁数据
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
    var _data = {ac: 'operateLog_save',"wx_id":wx_id,"hid":hid,"sbh":sbh,"czlx":czlx,"Pwd_type":Pwd_type,"Pwd":Pwd,"xfly":xfly,"renterNo":renterNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
        console.log("getunits success:",res);
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });    
  },
  // 冻结
  frozen: function(e){
    let that = this;
    let id = e.currentTarget.dataset.key;  // 当前流水号
    let ljzt = false;
    if(gysly=="1"){
      ljzt = BLE.authState();//连接状态
    }
    else if(gysly=="2"){
      ljzt = BLE_new.connectionState();//连接状态  
    }
    wx.showToast({
      title: '冻结中...',
      icon: "loading",
      duration: 5000
    })
    var _data = {ac: "mssj_info","id":id};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let id = units[0].id
          let yhbh = units[0].yhbh
          let dsn = units[0].equip_no
          let lx = units[0].lx //01指纹，02卡片，03密码
          let pwd_old = units[0].password //密码
          let lylx = units[0].lylx
          let yhlx = units[0].yhlx
          if(ljzt){  //蓝牙操作
            that.password_frozen(yhbh,lx,dsn,pwd_old,lylx); //冻结     
          }else{
            if(lylx == "1"){  //旧锁
              that.lockfrozen(yhbh,lx,dsn,pwd_old,'frozen'); //冻结/解冻
            }
            else if(lylx == "2"){
              if(yhlx == "03"){
                wx.showToast({
                  title: '离线密码不支持冻结',
                  icon: "none",
                  duration: 1500
                })
              }
              else{
                that.lockfrozen_fz(yhbh,lx,dsn,pwd_old,'frozen'); //冻结/解冻
              }
            }
            else if(lylx == "5" || lylx == "6"){  //国民锁       
              if(yhlx == "03"){
                wx.showToast({
                  title: '离线密码不支持冻结',
                  icon: "none",
                  duration: 1500
                })
              }
              else{
                that.lockfrozen_gm(yhbh,lx,dsn,pwd_old,'frozen'); //冻结/解冻
              }
            }  
            else if(lylx == "20" || lylx == "21"){  //同欣锁
              if(yhlx == "03"){
                wx.showToast({
                  title: '离线密码不支持冻结',
                  icon: "none",
                  duration: 1500
                })
              }
              else{
                that.lockfrozen_tx(yhbh,lx,dsn,pwd_old,'frozen'); //冻结
              }
            }       
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
  // 解冻
  unfreeze: function(e){
    let that = this;
    let id = e.currentTarget.dataset.key;  // 当前流水号
    let ljzt = false;
    if(gysly=="1"){
      ljzt = BLE.authState();//连接状态
    }
    else if(gysly=="2"){
      ljzt = BLE_new.connectionState();//连接状态  
    }
    wx.showToast({
      title: '解冻中...',
      icon: "loading",
      duration: 5000
    })
    var _data = {ac: "mssj_info","id":id};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            let id = units[0].id
            let yhbh = units[0].yhbh
            let dsn = units[0].equip_no
            let lx = units[0].lx //01指纹，02卡片，03密码
            let pwd_old = units[0].password //密码
            let lylx = units[0].lylx
            let yhlx = units[0].yhlx
            if(ljzt){  //蓝牙操作
              that.password_unfreeze(yhbh,lx,dsn,pwd_old,lylx); //解冻    
            }else{  //网关操作
              if(lylx == "1"){  //旧锁
                that.lockfrozen(yhbh,lx,dsn,pwd_old,'unfreeze'); //冻结/解冻
              }
              else if(lylx == "2"){
                if(yhlx == "03"){
                  wx.showToast({
                    title: '离线密码不支持解冻',
                    icon: "none",
                    duration: 1500
                  })
                }  
                else{
                  that.lockfrozen_fz(yhbh,lx,dsn,pwd_old,'unfreeze'); //冻结/解冻
                }  
              }
              else if(lylx == "5" || lylx == "6"){  //国民锁            
                if(yhlx == "03"){
                  wx.showToast({
                    title: '离线密码不支持解冻',
                    icon: "none",
                    duration: 1500
                  })
                }  
                else{
                  that.lockfrozen_gm(yhbh,lx,dsn,pwd_old,'unfreeze'); //冻结/解冻
                }          
              }
              else if(lylx == "20" || lylx == "21"){  //同欣锁
                if(yhlx == "03"){
                  wx.showToast({
                    title: '离线密码不支持解冻',
                    icon: "none",
                    duration: 1500
                  })
                }  
                else{
                  that.lockfrozen_tx(yhbh,lx,dsn,pwd_old,'unfreeze'); //解冻
                }     
              }       
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
  password_frozen:function(yhbh,lx,dsn,pwd_old,lylx){  //冻结用户
    var that = this;
    if(lylx == "1"){  //旧锁
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
            let yhbhEnd = yhbh.slice(-2); //截取2位用户编号，如12
            var hexyhbh = com.str2hex(yhbhEnd); //冻结转换用户编号
            if(lx=='01'){  //01指纹
              cmd = autoNo+'AA551100300101'+hexyhbh+'CC';
            }else if(lx=='03'){ //03密码
              cmd = autoNo+'AA551100300301'+hexyhbh+'CC';
            }
            com.get_encryption(dsn,cmd,function(res){  //获取加密
              if(res.errCode2=='1001'){
                let cmd = res.cmd;
                let cmdT = autoNo+cmd;
                BLE.sendCommand(cmdT,function(res){  //写入数据
                  if(res.errCode==0){
                    that.frozen_Rh_yhb(dsn,yhbh,'8',lx);//冻结用户
                    if(lx=='01'){  //01指纹
                      that.insertLog_LS(userid,'',dsn,'冻结','指纹('+yhbh+')','','朗思管理端');
                    }else if(lx=='03'){ //03密码
                      that.insertLog_LS(userid,'',dsn,'冻结','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                    }   
                  }
                  else{
                    wx.hideToast();  //关闭提示框
                    wx.showToast({
                      title: '冻结失败',
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
    }
    else if(lylx == "2"){  //新锁
      that.setData({
        showMB:false,  //显示幕布
        second: 40,  //初始化成40秒
      })
      that.countdown(); //调用计时器
      var xfbs_dj='下发中';
      var hardwareNumber = parseInt(yhbh, 10);  //用户编号
      var unlockModeEnum = 1;
      if(lx=='01'){  //指纹
        unlockModeEnum = 3; //代表密码，3代表指纹
      }
      else if(lx=='03'){ //密码
        unlockModeEnum = 1;
      } 
      var _data2 = {
        "deviceSn":dsn,
        "cmd":"0305",
        "syncNo":"0",
        "freezeUnlockCloudBO":{
          "freezeAccountEnum":"FREEZE",
          "menberId":2, //填注册开锁方式实际入参
        /*
        "unlockModeEnum":unlockModeEnum,
        "registerStatusEnum":"START",
        "effectiveNum":0,
        "memberTypeEnum":"NORMAL", //NORMAL是普通用户，ADMIN是管理员
        "hardwareNumber":hardwareNumber,
        "menberId":2, //2是普通用户，1是管理员
        "isOpenCycle":0,
        "loopType":"LOOP_NOT",
        "loopFlag":"00000000",
        "password":'',
        "startTime":'',
        "endTime":''
        */
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
                  if( _res.code == 0 ){
                    wx.hideLoading();  //关闭提示框
                    console.log("冻结下发标识："+xfbs_dj);
                    that.setData({
                      showMB:true,  //显示幕布
                    })
                    if(xfbs_dj =='已完成'){
                      return;
                    }
                    else{
                      xfbs_dj='已完成';
                      that.frozen_Rh_yhb(dsn,yhbh,'8',lx);//冻结用户
                      if(lx=='01'){  //指纹
                        that.insertLog_LS(userid,'',dsn,'冻结','指纹('+yhbh+')','','朗思管理端');
                      }
                      else if(lx=='03'){ //密码
                        that.insertLog_LS(userid,'',dsn,'冻结','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                      }
                    }                      
                  }
                  else{   
                    that.setData({
                      showMB:true,  //显示幕布
                    })         
                    wx.showToast({
                      title: '冻结用户失败',
                      icon: "error",
                      duration: 1000
                    })
                    xfbs_dj='已完成';
                    console.log(_res.code+'——>>'+_res.msg);                    
                  }
                },
                fail(res) {
                  that.setData({
                    showMB:true,  //显示幕布
                  })
                  xfbs_dj='已完成';
                  //console.log("getunits fail:",res);
                },
                complete(){
                }
              });                    
            }
          });     
        },
        fail(res) {
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
  },
  frozen_Rh_yhb: function (dsn,yhbh,zt,lx){  //冻结用户
    var that = this;
    var _data = {ac: 'yhb_frozen',"yhbh":yhbh,"dsn":dsn,"zt":zt,"lx":lx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.hideToast();  //关闭提示框
          wx.showToast({
            title: '冻结成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            that.get_mssj(dsn,renterNo); //获取门锁数据
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
  password_unfreeze:function(yhbh,lx,dsn,pwd_old,lylx){  //解冻用户
    var that = this;
    if(lylx == "1"){  //旧锁
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
            let yhbhEnd = yhbh.slice(-2); //截取2位用户编号，如12
            var hexyhbh = com.str2hex(yhbhEnd); //冻结转换用户编号
            if(lx=='01'){  //01指纹
              cmd = autoNo+'AA551100300100'+hexyhbh+'CC';
            }else if(lx=='03'){ //03密码
              cmd = autoNo+'AA551100300300'+hexyhbh+'CC';
            }
            com.get_encryption(dsn,cmd,function(res){  //获取加密
              if(res.errCode2=='1001'){
                let cmd = res.cmd;
                let cmdT = autoNo+cmd;
                BLE.sendCommand(cmdT,function(res){  //写入数据
                  //console.log("解冻写入成功:"+res);
                  if(res.errCode==0){
                    that.unfreeze_Rh_yhb(dsn,yhbh,'1',lx);//解冻用户
                    if(lx=='01'){  //01指纹
                      that.insertLog_LS(userid,'',dsn,'解冻','指纹('+yhbh+')','','朗思管理端');
                    }else if(lx=='03'){ //03密码
                      that.insertLog_LS(userid,'',dsn,'解冻','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                    }
                  }
                  else{
                    wx.hideToast();  //关闭提示框
                    wx.showToast({
                      title: '解冻失败',
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
    }
    else if (lylx == "2"){  //新锁
      wx.hideToast();
      wx.showToast({
        title: '解冻新锁',
        icon: "none",
        duration: 1000
      })  
    }
  },
  unfreeze_Rh_yhb: function (dsn,yhbh,zt,lx){  //解冻用户
    var that = this;
    var _data = {ac: 'yhb_frozen',"yhbh":yhbh,"dsn":dsn,"zt":zt,"lx":lx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.hideToast();  //关闭提示框
          wx.showToast({
            title: '解冻成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            that.get_mssj(dsn,renterNo); //获取门锁数据
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
  //网关冻结/解冻用户
  lockfrozen: function(yhbh,lx,dsn,pwd_old,zclx){
    let that = this;
    let op = "01"; //冻结为01，解冻为00
    let czName = "冻结";
    if(zclx=="frozen"){  //冻结
      op = "01";
      czName = "冻结";
    }
    else{
      op = "00";
      czName = "解冻";
    }
    if(lx=='01'){  //01指纹
      wx.hideToast();
      wx.showToast({
        title: '指纹',
        icon: "none",
        duration: 1000
      }) 
    }
    else if(lx=='03'){  //03密码
      var _dataYC = { ac: "lockfrozen", partnerid: ptlx, deviceid: dsn, passwordid: yhbh,op: op, channel: "21"};
      wx.request({
        url: apiYC,  //api地址
        data: _dataYC,
        header: {'content-type': 'application/x-www-form-urlencoded'},
        method: "POST",
        success(res) {
          wx.hideToast();  //关闭提示框
          if(res.data.state == true){
            that.insertLog_LS(userid,'',dsn,czName,'普通用户('+yhbh+')',pwd_old,'朗思管理端');
            wx.hideToast();
            wx.showToast({
              title: czName+'成功',
              icon: "success",
              duration: 1000
            })
            setTimeout(()=>{
              that.get_mssj(dsn,renterNo); //获取门锁数据
            },1000)
          }
          else{
            wx.hideToast();
            wx.showToast({
              title: czName+'失败',
              icon: "error",
              duration: 1000
            })          
          }
        },
        fail(res) {
          wx.hideToast();
          wx.showToast({
            title: czName+'失败',
            icon: "error",
            duration: 1000
          })  
        },
      }); 
    }
  },
  //网关冻结/解冻用户
  lockfrozen_fz: function(yhbh,lx,dsn,pwd_old,zclx){
    let that = this;
    let op = "01"; //冻结为01，解冻为00
    let czName = "冻结";
    if(zclx=="frozen"){  //冻结
      op = "01";
      czName = "冻结";
    }
    else{
      op = "00";
      czName = "解冻";
    }
    that.setData({
      showMB:false,  //显示幕布
      second: 40,  //初始化成40秒
    })
    that.countdown(); //调用计时器
    clearInterval(app.globalData.c_discon);//清除断开的定时器
    wx.showLoading({
      title: czName+'中...',
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
      var _dataNC = "";
      var apiNC_jk = "";  //接口
      if(zclx=="frozen"){  //冻结
        _dataNC = '{ac: "frozen_user","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","op":"'+op+'","channel":"21"}'
        apiNC_jk = 'frozen_user';
      }
      else if(zclx=="unfreeze"){ //解冻
        _dataNC = '{ac: "unfrozen_user","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","op":"'+op+'","channel":"21"}'
        apiNC_jk = 'unfrozen_user';
      }
      wx.request({
        url: apiNC+apiNC_jk,  //api地址
        data: _dataNC,
        header: {'content-type': 'application/json'},
        method: "POST",
        async:false,  //同步
        success(res) {
          if(res==""){
            wx.hideLoading();  //关闭提示框
            wx.showToast({
              title: czName+'失败',
              icon: "none",
              duration: 1000
            })
          }
          else{
            if(res.data.code == '0' || res.data.code == '40009'){           
              if(lx=='01'){  //指纹
                that.insertLog_LS(userid,'',dsn,czName,'指纹('+yhbh+')','','朗思管理端');
              }
              else if(lx=='03'){ //密码
                that.insertLog_LS(userid,'',dsn,czName,'普通用户('+yhbh+')',pwd_old,'朗思管理端');
              }     
              wx.hideLoading();  //关闭提示框          
              wx.showToast({
                title: czName+'成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_mssj(dsn,renterNo); //获取门锁数据
              },1000)
            }
            else{              
              console.log("code:"+res.data.code+"——>>msg:"+res.data.msg);             
              wx.hideLoading();  //关闭提示框
              if(res.data.code=="10010"){
                wx.showToast({
                  title: res.data.msg,
                  icon: "error",
                  duration: 1000
                }) 
              }
              else{
                wx.showToast({
                  title: czName+'失败',
                  icon: "error",
                  duration: 1000
                }) 
              }                
            }     
          }
        },
        fail(res) {
          wx.showToast({
            title: czName+'失败',
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
  //网关冻结/解冻用户
  lockfrozen_tx: function(yhbh,lx,dsn,pwd_old,zclx){
    let that = this;
    let op = "01"; //冻结为01，解冻为00
    let czName = "冻结";
    if(zclx=="frozen"){  //冻结
      op = "01";
      czName = "冻结";
    }
    else{
      op = "00";
      czName = "解冻";
    }
    that.setData({
      showMB:false,  //显示幕布
      second: 40,  //初始化成40秒
    })
    that.countdown(); //调用计时器
    clearInterval(app.globalData.c_discon);//清除断开的定时器
    wx.showLoading({
      title: czName+'中...',
    })
    var _dataNC = "";
    var apiNC_jk = "";  //接口
    if(zclx=="frozen"){  //冻结
      _dataNC = '{ac: "tx_frozen_user","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","op":"'+op+'","channel":"21"}'
      apiNC_jk = 'tx_frozen_user';
    }
    else if(zclx=="unfreeze"){ //解冻
      _dataNC = '{ac: "tx_unfrozen_user","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","op":"'+op+'","channel":"21"}'
      apiNC_jk = 'tx_unfrozen_user';
    }
    wx.request({
      url: apiNC+apiNC_jk,  //api地址
      data: _dataNC,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: czName+'失败',
            icon: "none",
            duration: 1000
          })
        }
        else{
          if(res.data.code=='0'){
            if(lx=='01'){  //指纹
              that.insertLog_LS(userid,'',dsn,czName,'指纹('+yhbh+')','','朗思管理端');
            }
            else if(lx=='02'){ //卡片
              that.insertLog_LS(userid,'',dsn,czName,'卡片('+yhbh+')',pwd_old,'朗思管理端');
            } 
            else if(lx=='03'){ //密码
              that.insertLog_LS(userid,'',dsn,czName,'普通用户('+yhbh+')',pwd_old,'朗思管理端');
            }           
            wx.hideLoading();  //关闭提示框          
            wx.showToast({
              title: czName+'成功',
              icon: "success",
              duration: 1000
            })
            setTimeout(()=>{
              that.get_mssj(dsn,renterNo); //获取门锁数据
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
          title: czName+'失败',
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
  },
  //网关冻结/解冻用户
  lockfrozen_gm: function(yhbh,lx,dsn,pwd_old,zclx){
    let that = this;
    let op = "01"; //冻结为01，解冻为00
    let czName = "冻结";
    if(zclx=="frozen"){  //冻结
      op = "01";
      czName = "冻结";
    }
    else{
      op = "00";
      czName = "解冻";
    }
    that.setData({
      showMB:false,  //显示幕布
      second: 40,  //初始化成40秒
    })
    that.countdown(); //调用计时器
    clearInterval(app.globalData.c_discon);//清除断开的定时器
    wx.showLoading({
      title: czName+'中...',
    })
    var _dataNC = "";
    var apiNC_jk = "";  //接口
    if(zclx=="frozen"){  //冻结
      _dataNC = '{ac: "gm_frozen_user","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","op":"'+op+'","channel":"21"}'
      apiNC_jk = 'gm_frozen_user';
    }
    else if(zclx=="unfreeze"){ //解冻
      _dataNC = '{ac: "gm_unfrozen_user","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","op":"'+op+'","channel":"21"}'
      apiNC_jk = 'gm_unfrozen_user';
    }
    wx.request({
      url: apiNC+apiNC_jk,  //api地址
      data: _dataNC,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: czName+'失败',
            icon: "none",
            duration: 1000
          })
        }
        else{
          if(res.data.code=='0'){
            if(lx=='01'){  //指纹
              that.insertLog_LS(userid,'',dsn,czName,'指纹('+yhbh+')','','朗思管理端');
            }
            else if(lx=='02'){ //卡片
              that.insertLog_LS(userid,'',dsn,czName,'卡片('+yhbh+')',pwd_old,'朗思管理端');
            } 
            else if(lx=='03'){ //密码
              that.insertLog_LS(userid,'',dsn,czName,'普通用户('+yhbh+')',pwd_old,'朗思管理端');
            }           
            wx.hideLoading();  //关闭提示框          
            wx.showToast({
              title: czName+'成功',
              icon: "success",
              duration: 1000
            })
            setTimeout(()=>{
              that.get_mssj(dsn,renterNo); //获取门锁数据
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
          title: czName+'失败',
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
          wx.showToast({
            title: res.data.msg,
            icon: "success",
            duration: 1000
          })
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
  //蓝牙删除
  BLEdel: function(e){
    let that = this;
    let id = e.currentTarget.dataset.key;  // 当前流水号
    wx.showModal({
      title: '删除用户',
      content: '确认删除用户？',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          var _data = {ac: "mssj_info","id":id};
          wx.request({
            url: apiUrl,  //api地址
            data: _data,
            header: {'Content-Type': 'application/json'},
            method: "get",
            success(res) {
              var units = res.data.rows;
              if(units.length > 0){
                let yhbh = units[0].yhbh
                let lx = units[0].lx //01指纹，02卡片，03密码
                let pwd_old = units[0].password //密码
                let lylx = units[0].lylx //来源类型
                let yhlx = units[0].yhlx
                if(yhlx == "03"){
                  wx.showToast({
                    title: '离线密码不支持蓝牙删除',
                    icon: "none",
                    duration: 1500
                  })
                  return false;
                }     
                if(lylx=='5' || lylx=='6'){  //国民锁
                  that.BLEpassword_delGM(yhbh,lx,pwd_old); //删除密码 
                }
                else if(lylx=='20' || lylx=='21'){
                  that.BLEpassword_delTX(yhbh,lx,pwd_old); //删除密码        
                }
              }          
            },
            fail(res) {
              console.log("getunits fail:",res);
            },
            complete(){
            }
          });
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
  BLEpassword_delTX:function(yhbh,lx,pwd_old){  //删除密码
    let that = this;
    let lockKeyId = yhbh*1;  //用户编号
    let keyTypeArray = [1];
    if(lx=='01'){  //01指纹
      keyTypeArray = [0];
    }else if(lx=='02'){  //卡片
      keyTypeArray = [2];
    }else if(lx=='03'){  //密码
      keyTypeArray = [1];
    }
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '删除中...',
    })
    if(that.data.BLE_link==""){
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
          self.setData({
            BLE_link:'连接成功',
          })
          var options1 = {
            mode: 0,
            lockKeyId: lockKeyId,
            keyType: keyTypeArray
          };
          myPlugin
            .removeKey(options1)
            .then(function(res) {   
              if(res.errCode=="01"){
                wx.hideLoading();  //关闭提示框
                that.setData({
                  showMB:true,  //显示幕布
                })
                that.del_Rh_yhb(dsn,yhbh,lx);//删除门锁用户
                if(lx=='01'){  //01指纹
                  that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                }else if(lx=='02'){ //02卡片
                  that.insertLog_LS(userid,'',dsn,'删除','卡片('+yhbh+')',pwd_old,'朗思管理端');
                }else if(lx=='03'){ //03密码
                  that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                }          
              }              
            })
            .catch(function(err) {
              wx.hideLoading();  //关闭提示框   
              that.setData({
                showMB:true,  //显示幕布
              })
              wx.showToast({
                title: '删除用户失败',
                icon: "error",
                duration: 1000
              })   
            });
        }
        else{
          wx.hideLoading();  //关闭提示框   
          self.setData({
            BLE_link:'',
          })
          wx.showToast({
            title: '连接失败',
            icon: "none",
            duration: 1000
          }) 
        }
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
            BLE_link:'',
            showMB:true,
          })
        }
      });
      // 监听“运行错误”事件
      myPlugin.on("error", function(err) {
        wx.hideLoading();  //关闭提示框
        myPlugin.disconnect();
        self.setData({
          BLE_link:'',
          showMB:true,  //显示幕布
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
      // 监听“删除钥匙”事件
      myPlugin.on("removeKey", function(data){
        //console.log('plugin is on addKey, data is ', data)
      });
      // 监听“删除钥匙”事件上报
      myPlugin.on("report:removeKey", function(data) {
        //console.info("plugin is on remove key, data is ", data);
      });
    }
    else{
      var options1 = {
        mode: 0,
        lockKeyId: lockKeyId,
        keyType: keyTypeArray
      };
      myPlugin
        .removeKey(options1)
        .then(function(res) {    
          if(res.errCode=="01"){
            wx.hideLoading();  //关闭提示框
            that.setData({
              showMB:true,  //显示幕布
            })   
            that.del_Rh_yhb(dsn,yhbh,lx);//删除门锁用户
            if(lx=='01'){  //01指纹
              that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
            }else if(lx=='02'){ //02卡片
              that.insertLog_LS(userid,'',dsn,'删除','卡片('+yhbh+')',pwd_old,'朗思管理端');
            }else if(lx=='03'){ //03密码
              that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
            }       
          }              
        })
        .catch(function(err) {
          wx.hideLoading();  //关闭提示框   
          that.setData({
            showMB:true,  //显示幕布
          })
          wx.showToast({
            title: '删除用户失败',
            icon: "error",
            duration: 1000
          })   
        });
    }
  },
  BLEpassword_delGM:function(yhbh,lx,pwd_old){  //国民蓝牙修改密码
    let that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '删除中...',
    })
    let lockKeyId = yhbh*1;  //用户编号
    let cls = 0x01;   //操作类型(0x01 删除 	0x02 修改有效期 	0x03 修改密码，仅限密码)
    let id = lockKeyId;  //用户id
    let pwd = ''; //修改密码
    let date = '';  //有效期
    let circle = '00';   //循环周期
    let pwdHex = lockUtils.authChangePwdCode(managePassword);
    wx.setStorageSync("device_key_" + dsn, pwdHex)
    let cmd = lockUtils.c_update_user(cls,id,pwd,date,circle);
    lockUtils.executeCmd({
      isAuthConnect: true,
      deviceSn: dsn,
      data: cmd,
      success: function (res) {
        console.log(JSON.stringify(res))
        if (res.code == 0) {
          that.del_Rh_yhb(dsn,yhbh,lx);//删除门锁用户
          if(lx=='01'){  //01指纹
            that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
          }else if(lx=='02'){ //02卡片
            that.insertLog_LS(userid,'',dsn,'删除','卡片('+yhbh+')',pwd_old,'朗思管理端');
          }else if(lx=='03'){ //03密码
            that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
          }
          wx.hideLoading();  //关闭提示框 
          that.setData({
            showMB:true,  //显示幕布
          })
          bleApi.closeBle();  //断开连接
        }
        else{
          wx.showToast({
            title: '删除用户失败',
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
          //that.timeService(); //授时
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
  onShow: function () { //生命周期函数--监听页面显示
    this.get_mssj(dsn,renterNo); //获取门锁数据
  }
})