
let app = getApp();
var BLE = require('../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../utils/BLE_new.js');  //蓝牙操作文档(新锁)
var com = require('../../utils/commom.js');  //公共js
const lockUtils = require("../../utils/nzBleLockSDK/lockV2/LockUtils.js");//蓝牙操作文档(国民锁)
const bleApi = require("../../utils/nzBleLockSDK/bleApi.js");//蓝牙操作文档(国民锁)
var apiUrl = "";   //获取api地址
var apiYC = "";     //获取门锁api地址(远程)
var apiNC = "";     //获取门锁api地址(新锁)
var dsn = ""; //设备号
var hid= "";  //房间id
var emp_no = ""; //登陆人编号
var ptlx= "hongqi";  //平台类型
var lylx= "1";  //供应商类型
var bleN= "";  //蓝牙号
var dsn_ylj= "";  //已连接设备号
var val_yl= "01"; //音量
var keyGroupId= "903";  //用户Id
var authCode= "";  //鉴权码
var aesKey= "";  //秘钥
var myPlugin= "";  //组件
var managePassword= "";  //管理密码
var job= "";  //职务
var QZ= "";  //前缀
Page({
  data: {
    ljzt:"",  //连接状态
    detail_Ref:false,
    detail_add:true,
    showMB:true, //幕布
    second: 20, //倒计时20秒
    c:"",//定时器
    roomlist:[],
    hi:true,
    dsn:"",
    setInter: '',
    num: 1,
  },
  onLoad: function(options) {
    let that = this; 
    emp_no = app.globalData.userid;
    job = app.globalData.job;
    QZ = app.globalData.QZ;    //前缀
    apiUrl = app.globalData.apiUrl; 
    apiYC = app.globalData.apiYC; 
    apiNC = app.globalData.apiNC; 
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
    if( !emp_no || !QZ){
      wx.redirectTo({
        url: '/pages/auth/auth'
      })
    }
    /*
    else{
      if(QZ=="jianxin" || QZ=="anju" || QZ=="jinyuan" || QZ=="iot"){
        wx.switchTab({
          url: '/pages/homeYY/homeYY',
        })
      }
      else{
        if(job=="样品管理员" || job=="安装" || job=="维保"){  //样品管理员
          wx.switchTab({
            url: '/pages/homeYS/homeYS',
          })
        }
        else{
          wx.switchTab({
            url: '/pages/home/home',
          })     
        }
      }
     }
     */
    that.myLockZK_list(emp_no,'');  //获取门锁列表
    that.myRoomLock_list(emp_no,'');  //获取房间列表
    /*调用一次定位*/
    /*
   wx.getLocation({
    type: 'gcj02',
    success (res) {
      console.log(res)
    }
   })
   */
  },
  myLockZK_list:function (userid,search) { //获取门锁列表
    let _this = this;
    var _data = {ac: 'myLockZK_list',"userid":userid,"search":search};
    wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
           var units = res.data.rows;
           let lengths = units.length;
           if(lengths > 1){
            _this.setData({
              detail_add:false,
            })
           }else{
            _this.setData({
              detail_add:true,
            })
           }
           if(lengths > 0){
             hid = units[0].hid;
             dsn = units[0].dsn;
             lylx = units[0].lylx;
             bleN = units[0].bleName;
             aesKey = units[0].aesKey;
             authCode = units[0].commonAuthCode;
             managePassword = units[0].managePassword;
             let showRef = false;
             if(!dsn){
                showRef = false;
             }
             else{
                showRef = true;    
             }
              _this.setData({
                hid:units[0].hid,
                dsn:units[0].dsn,
                detail_Ref:showRef,
                sbmc:units[0].houseName+units[0].roomNo
              })
            }
            else{
              lylx ="";
              bleN ="";
              aesKey ="";
              authCode ="";
              managePassword ="";
              _this.setData({
                hid:"",
                dsn:"",
                detail_Ref:false,
                sbmc:"",
              })            
            }
        },
        fail(res) {
          //console.log("getunits fail:",res);
        },
        complete(){
        }
    });  
  },
  myRoomLock_list:function (userid,search) { //获取房间列表
    let _this = this;
    _this.setData({
      roomlist:[]
    })
    var _data = {ac: 'myLockZK_list',"userid":userid,"search":search};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            let cl = '';
            if(i==0){
              cl = "xz"
            }
            else{
              cl = "cc"  
            }
            newlist.push({
              "no":i,
              "cl":cl,
              "hid":units[i].hid,
              "room":units[i].houseName+units[i].roomNo
            })
          } 
          setTimeout(()=>{
            _this.setData({
               roomlist:newlist
            })
          },1000)
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
  changeRoom:function(){
    let hi=!this.data.hi
    this.setData({
      hi:hi
    })
  },
  roomXz:function(e){
    var that = this;
    //console.log(e.currentTarget.dataset.no);
    let g=[]
    for(let y of this.data.roomlist){
      y.cl="cc"
      g.push(y)
    }
    g[e.currentTarget.dataset.no].cl="xz"
    this.setData({
      hi:true,
      roomlist:g
    })
    hid = e.currentTarget.dataset.hid;
    that.get_macToMS(hid);
    that.house_info(hid);
  },
  get_macToMS:function (hid) { //获取门锁设备号
    let _this = this;
    var _data = {ac: 'get_macToMS',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          dsn = units[0].equip_no;
          lylx = units[0].lx;
          bleN = units[0].bleName;
          aesKey = units[0].aesKey;
          authCode = units[0].commonAuthCode;
          managePassword = units[0].managePassword;
          let showRef = false;
          if(!dsn){
            showRef = false;
          }
          else{
            showRef = true;    
          }
          _this.setData({
            dsn:units[0].dsn,
            detail_Ref:showRef,
          })
        }
        else{
          lylx ="";
          bleN ="";
          aesKey ="";
          authCode ="";
          managePassword ="";
        }
      },
      fail(res) {
        //console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  house_info:function (hid) { //获取房号
    let _this = this;
    var _data = {ac: 'house_info',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          _this.setData({
            sbmc:units[0].houseName+units[0].roomNo,
          })
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  tapEvent: function(e) {
    let _this = this;
    var that = this;
    let index = e.currentTarget.dataset.index;
    let url = "";
    let ljzt = false;//连接状态
    if(!dsn){
      wx.showToast({
        title: '请添加没锁',
        icon: "error",
        duration: 1000
      })
      return false;
    }
    if(lylx == "1"){
      ljzt = BLE.authState();//连接状态
    }
    else if(lylx == "2"){
      ljzt = BLE_new.connectionState();//连接状态
    }
    console.log("ljzt:"+ljzt);
    if (index == '01') {  //一次性密码
      //蓝牙下发
      if(ljzt && lylx == "1"){
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
            that.insertLog_LS(emp_no,'',dsn,'下发','一次性密码',otp,'朗思管理端');
        }
      });
      }
      else{  //网关下发
        if(lylx == "1"){  //旧锁
          var _dataYC = { ac: "temppassword", partnerid: ptlx, deviceid: dsn};
          wx.request({
            url: apiYC+'temppassword',  //api地址
            data: _dataYC,
            header: {'Content-Type': 'application/json'},
            method: "get",
            success(res) {
              var otp = res.data.data.password;
              wx.showModal({
                 title: '注：一次性密码，有效期10分钟',
                 showCancel: false,
                 cancelText:'关闭',
                 cancelColor:'red',
                 confirmText:'返回',
                 confirmColor:'#47a86c',
                 content: res.data.data.password.substr(0,4) + '  ' + res.data.data.password.substr(4,4),
                 success: function(res) {
                 }
              })
              that.insertLog_LS(emp_no,'',dsn,'下发','一次性密码',otp,'朗思管理端');
            }
          });
        }
        else if(lylx == "2"){  //新锁
          var _dataNC = '{ac: "temppassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'"}'
          wx.request({
            url: apiNC+'temppassword',  //api地址
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
                  var otp = res.data.data;
                  wx.showModal({
                     title: '注：一次性密码，有效期6小时',
                     showCancel: false,
                     cancelText:'关闭',
                     cancelColor:'red',
                     confirmText:'返回',
                     confirmColor:'#47a86c',
                     content: otp.substr(0,4) + '  ' + otp.substr(4,4)+ '  ' + otp.substr(8,4),
                     success: function(res) {
                     }
                  })
                  that.insertLog_LS(emp_no,'',dsn,'下发','一次性密码',otp,'朗思管理端');            
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
        else if(lylx=="5" || lylx=="6"){ //国民NB锁
          var _dataNC = '{ac: "temppassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'"}'
          wx.request({
            url: apiNC+'gm_otp',  //api地址
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
                     content: otp.substr(0,4) + '  ' + otp.substr(4,4)+ '  ' + otp.substr(8,4),
                     success: function(res) {
                     }
                  })
                  that.insertLog_LS(emp_no,'',dsn,'下发','一次性密码',otp,'朗思管理端');           
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
                  that.insertLog_LS(emp_no,'',dsn,'下发','一次性密码',otp,'朗思管理端');         
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
    } else if ( index == '02' ) {  //录入指纹
      /*
      if(lylx=="5" || lylx=="6"){
        wx.showToast({
          title: '请在PC端进行指纹采集',
          icon: "none",
          duration: 1000
        })
      }
      else{
        wx.navigateTo({
          url: '../../pagesA/pages/zhiwen_add/zhiwen_add?dsn='+dsn
        })
      }
      */
      if(!!myPlugin){
        myPlugin.disconnect();
      }
      wx.navigateTo({
        url: '../../pagesA/pages/zhiwen_add/zhiwen_add?dsn='+dsn
      })
    }else if( index == '03' ){  //录入密码    
      wx.navigateTo({
        url: '../../pagesA/pages/pwd_add/pwd_add?dsn='+dsn
      })
    }else if( index == '04' ){  //蓝牙开门
      that.setData({
        showMB:false,  //显示幕布
      })
      if(lylx == "1"){  //旧锁
        let ljzt_qj = app.globalData.ljzt_qj;  //全局连接状态
        if(ljzt && dsn==dsn_ylj){  //已连接
          that.OldLockBLE_openDoor(); //旧锁蓝牙开门
        }
        else{
          BLE.openBLEConnection(dsn,function(res){
            if(res.errCode=='0'){
              dsn_ylj = dsn;  //把当前设备号付给已连接设备号
              that.OldLockBLE_openDoor(); //旧锁蓝牙开门
            }
            else{
              that.setData({
                showMB:true,  //隐藏幕布
              })    
            }
         });
        }
      }
      else if(lylx == "2"){  //新锁
        that.setData({
          second: 20,  //初始化成20秒
        });
        that.countdown(); //调用计时器       
        ljzt = BLE_new.connectionState();//连接状态
        let ljzt_qj = app.globalData.ljzt_qj;  //全局连接状态
        if(ljzt && dsn==dsn_ylj &&ljzt_qj){  //已连接
          that.BLE_openDoor(); //新锁蓝牙开门
        }
        else{ //连接门锁
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
              console.log("{deviceId:"+dsn+",cmd:"+cmd+"}");
              BLE_new.openBLEConnection(bleN,function(res){
              if(res.errCode=='0'){
                dsn_ylj = dsn;  //把当前设备号付给已连接设备号
                app.globalData.ljzt_qj = true; //写入全局
                if( that.data.ljzt == "连接成功" ) return;
                that.setData({
                  ljzt:'连接成功',
                })
              //第一次写入指令
              setTimeout(function(){
                BLE_new.sendCommand(cmd,function(res){
                if(res.errCode==-1){
                  //console.log(res.errMsg);
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
                              //console.log("第二次写入指令操作成功");
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
                                    that.BLE_openDoor(); //新锁蓝牙开门
                                  }
                                  else{
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
                  icon: "none",
                  duration: 1000
                }) 
              }
            });
          },500);
        }
        else{
          app.globalData.ljzt_qj = false; //写入全局
          dsn_ylj = "";
          that.setData({
            ljzt:'连接失败',
            showMB:true,  //隐藏幕布
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
        that.setData({
          showMB:true,  //隐藏幕布
        })
      },
      complete(){
      }
    });
    }
  }
    else if(lylx == "5" || lylx == "6"){  //国民锁
      that.setData({
        second: 20,  //初始化成20秒
        showMB:false,  //隐藏幕布
      }); 
      that.countdown(); //调用计时器         
      that.BLEopenLock_GM(); //蓝牙开门(国民锁)
    }
    else if(lylx == "20" || lylx == "21"){  //同欣锁
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
        that.setData({
          showMB:true,  //隐藏幕布
        });          
      }
    }
  }
  else if ( index == '11' ) {  //授时操作
    if(lylx=="1"){
      if(ljzt && dsn==dsn_ylj){
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
      if(ljzt && dsn==dsn_ylj){
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
      let zt = that.data.ljzt;
      if(zt=="连接成功"){
        wx.showToast({
          title: '授时中，请等待',
          icon: "loading",
          duration: 10000
        })
        that.Timing_TX(); //授时
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
  else if ( index == '12' ) {  //密码管理
    url = '../../pagesA/pages/mssj_list/mssj_list?dsn='+dsn;
  }
    else if ( index == '13' ) {  //音量调节
      if(lylx=="2"){
        that.setData({
          ifName:true,  //显示
        }); 
      }
      else{
        wx.showToast({
          title: '该锁不支持',
          icon: "error",
          duration: 1000
        })
      }
    }
    else if ( index == '14' ) {  //我的门锁
      url = '/pages/myLock_list/myLock_list';
    }
    else if ( index == '15' ) {  //开门记录
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
            url: '/pages/openLock_list/openLock_list?mac='+dsn
          })
        },4000)
      }
      else{ //新锁
        wx.navigateTo({
          url: '/pages/openLock_list/openLock_list?mac='+dsn
        })
      }
    }
    else if ( index == '16' ) {  //门锁信息
      wx.navigateTo({
        url: '/pages/ms_info/ms_info?dsn='+dsn
      })
    }
    else if ( index == '17' ) {  //成员管理
      wx.navigateTo({
        url: '../../pagesB/pages/roomUser_list/roomUser_list?hid='+hid
      })
    }else if ( index == '18' ) {  //胁迫密码
      wx.showModal({
          title: '注：您的胁迫密码是',
          showCancel: false,
          cancelText:'关闭',
          cancelColor:'red',
          confirmText:'返回',
          confirmColor:'#47a86c',
          content: '666'+ '  ' +'666',
      })
    }else if ( index == '19' ) {  //免扰时段
      wx.navigateTo({
        url: '../../pagesB/pages/openSetting/openSetting?hid='+hid
      })
    }else if ( index == '20' ) {  //报警查询
      wx.navigateTo({
        url: '/pages/alarm_query/alarm_query?dsn='+dsn
      })
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  tapEvent2: function(e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    let url = "";
    if ( index == '21' ) {  //搜索门锁
      url = '../../pagesA/pages/lock_query/lock_query';
    }   
    if ( index == '22' ) {  //工单管理
      if(job=="维保"){
        url = '../../pagesC/pages/workOrderWB_list/workOrderWB_list';
      }
      else{
        wx.showToast({
          title: '没有权限查看',
          icon: "none",
          duration: 1000
        })
      }
    }
    if ( index == '23' ) {  //水电绑定(旧设备)
      if(job=="维保"){
        url = '../../pagesC/pages/old_device/old_device';
      }
      else{
        wx.showToast({
          title: '没有权限查看',
          icon: "none",
          duration: 1000
        })
      }
    }
    if ( index == '24' ) {  //水电绑定(新设备)
      if(job=="安装" || job=="维保"){
        url = '../../pagesC/pages/new_device/new_device';
      }
      else{
        wx.showToast({
          title: '没有权限查看',
          icon: "none",
          duration: 1000
        })
      }
    }else if ( index == '25' ) {  //水表读数
      url = '/pages/myDevice_list/myDevice_list';
    }else if ( index == '26' ) {  //电表读数
      url = '/pages/myDeviceDB_list/myDeviceDB_list';
    }
    if( !!url ){
      wx.navigateTo({
        url: url
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
          app.globalData.ljzt_qj = true; //写入全局
          dsn_ylj = dsn; 
          that.setData({
            ljzt:'连接成功',
          })
          that.timeService(); //授时
        }
        else{
          app.globalData.ljzt_qj = false; //写入全局
          dsn_ylj = ""; 
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
  unLinkBLE: function() {  //断开连接
    var that = this;
    app.globalData.ljzt_qj = false;
    dsn_ylj = ""; 
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
  //插入开门记录
  insert_OpenLog:function(userid,dsn,xfly){
    var _data = {ac: 'insert_OpenLog',"userid":userid,"dsn":dsn,"xfly":xfly};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
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
  //插入下发日志
  insertLog_LS:function(wx_id,hid,sbh,czlx,Pwd_type,Pwd,xfly){
    var _data = {ac: 'operateLog_save',"wx_id":wx_id,"hid":hid,"sbh":sbh,"czlx":czlx,"Pwd_type":Pwd_type,"Pwd":Pwd,"xfly":xfly};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
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
    var Dtime = y.toString()+m.toString()+d.toString()+h.toString()+mi.toString()+s.toString();  //拼接时间如20220102001334
    var timeT = Dtime.substr(2,12); //截取成220102001334
    var cmd = "";
    wx.showLoading({
      title: '授时中...',
    })
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
              //console.log("加密cmd:"+cmd);
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                if(res.errCode==0){
                setTimeout(()=>{
                  wx.hideLoading();  //关闭提示框
                  wx.showToast({
                    title: '授时成功',
                    icon: "success",
                    duration: 1000
                  })
                  that.setData({
                    showMB:true,  //隐藏幕布
                  })    
                },1000)               
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
        wx.hideLoading();  //关闭提示框
        that.setData({
          showMB:true,  //隐藏幕布
        })
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
      }, j * 100);                             
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
  BLE_openDoor:function () { //蓝牙开门
    var that = this;
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
                  that.insert_OpenLog(emp_no,dsn,'朗思管理端');//插入开门日志
                  wx.showLoading({
                    title: '开锁成功，请稍后',
                  })              
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
  OldLockBLE_openDoor:function () { //旧锁蓝牙开门
    var that = this;
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
      async:false,  //同步
      success(res) {
        if(res.data.status=="1"){
          var autoNo = res.data.autoNo;
          cmd = autoNo+'AA5503003901'+'CC';
          com.get_encryption(dsn,cmd,function(res){  //获取加密(蓝牙开门)
            if(res.errCode2=='1001'){
              let cmd = res.cmd;
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                if(res.errCode==0){
                  that.insert_OpenLog(emp_no,dsn,'朗思管理端');//插入开门日志
                  setTimeout(()=>{
                    wx.hideToast();  //关闭提示框
                    wx.showToast({
                      title: '开锁成功',
                      icon: "success",
                      duration: 1000
                    })    
                  },1000)
                  //BLE.closeBLEConnection(); //断开连接
                  that.setData({
                    showMB:true,  //隐藏
                  })
                }
                else{
                  wx.hideToast();  //关闭提示框
                  wx.showToast({
                    title: '操作失败',
                    icon: "error",
                     duration: 1000
                  })
                  that.setData({
                    showMB:true,  //隐藏
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
          showMB:true,  //隐藏
        })
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
        console.log("幕布链接状态："+ljState);
        if(!ljState){
          app.globalData.ljzt_qj = false; //写入全局
          dsn_ylj = ""; 
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
          app.globalData.ljzt_qj = true; //写入全局
          dsn_ylj = dsn; 
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
        app.globalData.ljzt_qj = false; //写入全局
        dsn_ylj = ""; 
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
  radioChangeSJ:function(e){
    val_yl=e.detail.value;//获取输入的值
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
      console.log("其他供应商锁");
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
      //console.log("plugin is on ready", plugin);
      //console.log("蓝牙连接状态"+plugin.connected);
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
        //console.log("openLock res -->", res);
        if(res.errCode=="01"){
          that.insert_OpenLog(emp_no,dsn,'管理端');//插入开门日志
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
        //console.log("openLock res -->", res);
        that.setData({
          showMB:true,  //隐藏幕布
        })
      });
  },
  // 同欣蓝牙授时
  Timing_TX: function() {
    var now_date = new Date()
    //var n = now_date.getTimezoneOffset();
    var timestamp = Math.floor(now_date.getTime() / 1000);
    const params = {
      synchronizeTime: true,  // 启用校准时间
      systemTime: timestamp, // 时间戳，可以取系统时间，或NTP时间
      timezoneOffset: -480 * 60, // 时区偏移量，计算方式如：new Date().getTimezoneOffset() * 60
    };
    myPlugin
      .synchronizeLockSystemTime(params)
      .then(res => {
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
    let cmd = lockUtils.c_lock_open(emp_no);
    lockUtils.executeCmd({
      isAuthConnect: true,
      deviceSn: dsn,
      data: cmd,
      success: function (res) {
        console.log(JSON.stringify(res))
        if (res.data.state == 0) {
          that.insert_OpenLog(emp_no,dsn,'管理端');//插入开门日志
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
  onShow: function () {  //生命周期函数--监听页面显示
    let that = this; 
    emp_no = app.globalData.userid;
    job = app.globalData.job;
    QZ = app.globalData.QZ;    //前缀
    apiUrl = app.globalData.apiUrl; 
    apiYC = app.globalData.apiYC; 
    apiNC = app.globalData.apiNC; 
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    //that.myLockZK_list(emp_no,'');  //获取门锁列表
    that.myRoomLock_list(emp_no,'');  //获取房间列表
    if(!!emp_no){
      that.Judge_loginGJ(emp_no);  //判断用户是否有权登陆
    }
    setTimeout(()=>{
      let ljztS = false;//连接状态
      if(lylx == "1"){
        ljztS = BLE.authState();
      }
      else if(lylx == "2"){
        ljztS = BLE_new.connectionState();
      }
      console.log("门锁来源："+lylx);
      console.log("onShow打印的连接状态："+ljztS);
      if(ljztS){
        that.setData({
          ljzt:'连接成功',
        })
      }
      else{
        that.setData({
          ljzt:'连接失败',
        })    
      }
    },1000)
  },
  Judge_loginGJ:function (emp_no) { //判断用户是否有权登陆
    let _this = this;
    var _data = {ac: 'Judge_loginGJ',"userid":emp_no};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
        }
        else{
          wx.showModal({    
            title: '提示',    
            showCancel: false,    
            content: '请联系管理员授权',    
            success: function (res) {
              let _userid = "";
              wx.setStorageSync("userid", _userid);
              app.globalData.userid = _userid;
              wx.redirectTo({
                url: '/pages/auth/auth'
              })
            }
          })
          return false;
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  }
})