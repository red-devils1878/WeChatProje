var search= "";  //搜索内容
var app = getApp();
var apiUrl = "";   //获取api地址
var apiYC = "";     //获取门锁api地址(远程)
var apiNC = "";     //获取门锁api地址(新锁)
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档(新锁)
var com = require('../../../utils/commom.js');  //公共js
const lockUtils = require("../../../utils/nzBleLockSDK/lockV2/LockUtils.js");//蓝牙操作文档(国民锁)
const bleApi = require("../../../utils/nzBleLockSDK/bleApi.js");//蓝牙操作文档(国民锁)
var newPwd = "" //新密码
var dsn= "";  //设备号
var userid= "";  //登陆人工号
var ptlx= "hongqi";  //平台类型
var renterid= "";  //归属人
var keyGroupId= "903";  //用户Id
var authCode= "";  //鉴权码
var aesKey= "";  //秘钥
var myPlugin= "";  //组件
var managePassword= "";  //管理密码
var gysly= "";  //供应商来源
var hid= "";  //hid
Page({
  
  data: {
    showsearch:true,   //显示搜索按钮
    searchtext:'',  //搜索文字
    showfilter:false, //是否显示下拉筛选
    showfilterindex:null, //显示哪个筛选类目
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    ifName: false,
    showMB:true, //幕布
    ifNameFP: false,
    yhIndex: 0,
    second: 30, //倒计时20秒
    c:"",//定时器
    BLE_link:"",  //连接状态
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    dsn = options.dsn;
    //dsn = "501A102106013906"
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiYC = app.globalData.apiYC;     //获取门锁api地址(远程)
    apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
    userid = app.globalData.userid;   //登陆人工号
    newPwd = ""; //密码设置成空
    wx.getSystemInfo( {   //获取当前设备的宽高
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          fxmc:""
        });
      }
    });
    this.get_mssj(dsn,search); //获取门锁数据
    this.get_mcToMS(dsn); //获取设备号

  /*调用一次定位*/
  wx.getLocation({
    type: 'gcj02',
    success (res) {
      console.log(res)
    }
  })
  },
  get_mssj:function (dsn,search) { //获取门锁数据
    let _this = this;
    _this.setData({
      servicelist:[]
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'mssj_list',"dsn":dsn,"search":search};
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
          var hid = units[0].hid;
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
              "imgurl":units[i].imgurl=='' ? "../../../static/images/touxiang.jpg" : units[i].imgurl,
            })
          } 
          setTimeout(()=>{
            _this.setData({
              servicelist:newlist,
              sbmc:sbmc
            })
            _this.get_userList(hid); //获取房间用户列表
          },1000)
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
  get_userList:function (hid) { //获取房间用户列表
    let _this = this;
    var _data = {ac: 'get_userList',"hid":hid};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var yhList = res.data.rows;
          _this.setData({
            yhList:yhList
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  bindFPChange: function(e) {
    this.setData({
      yhIndex: e.detail.value,
      rent_no: this.data.yhList[e.detail.value].rent_no,
    })
    //rent_no = this.data.yhList[e.detail.value].rent_no;
  },
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      showsearch:1,
      searchtext:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    search = this.data.searchtext;
    this.get_mssj(dsn,search); //获取门锁数据
  },
  hideFilter: function(){ //关闭筛选面板
    this.setData({
      showfilter: false,
      showfilterindex: null
    })
  },
  goToTop:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  scrollLoading:function(){ //滚动加载
    //this.get_mssj(dsn,search); //获取门锁数据
  },
  onPullDownRefresh:function(){ //下拉刷新
    this.setData({
      page:0,
      servicelist:[]
    })
    this.get_mssj(dsn,search); //获取门锁数据
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },1000)
  },
  pwdAdd:function(e){  //下发授权
    wx.navigateTo({
      url: '../../../pagesA/pages/xfsq_add/xfsq_add?dsn='+dsn
    })
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
 // 查看人脸
 showFace: function(e){
  let id = e.currentTarget.dataset.key;  // 当前流水号
  wx.navigateTo({
    url: '../../../pagesA/pages/face_show/face_show?id='+id
  })
},
  // 删除人脸
  delFace: function(e){
    let that = this;
    let id = e.currentTarget.dataset.key;  // 当前流水号
    var _data = {ac: "face_del","id":id};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.showToast({
            title: '删除成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            that.get_mssj(dsn,search); //获取门锁数据
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
  // 删除
  delList: function(e){
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
                hid = units[0].hid
                let id = units[0].id
                let yhbh = units[0].yhbh
                let dsn = units[0].equip_no
                let lx = units[0].lx //01指纹，02卡片，03密码
                let pwd_old = units[0].password //密码
                let lylx = units[0].lylx
                let yhlx = units[0].yhlx
                renterid = units[0].renterid 
                that.password_del(yhbh,lx,dsn,pwd_old,lylx,yhlx); //删除密码
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
  password_del:function(yhbh,lx,dsn,pwd_old,lylx,yhlx){  //删除密码
    var that = this;
    let ljzt = false;//连接状态
    if(lylx=="1"){
      ljzt = BLE.authState();//连接状态
    }
    else if(lylx=="2"){
      ljzt = BLE_new.connectionState();//连接状态  
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
              //console.log("删除密码加密前cmd:"+cmd);
              com.get_encryption(dsn,cmd,function(res){  //获取加密
                //console.log("加密内码:"+res.errCode2);
                if(res.errCode2=='1001'){
                  let cmd = res.cmd;
                  let cmdT = autoNo+cmd;
                  BLE.sendCommand(cmdT,function(res){  //写入数据
                    //console.log("删除返回结果:"+res);
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
    }
    else{  //网关下发
    if(lylx == "1"){  //旧锁
      wx.showLoading({
        title: '删除中...',
      })
      if(lx=='01'){  //01指纹
        var _dataYC = { ac: "deletepassword", partnerid: ptlx, deviceid: dsn, passwordid: yhbh, channel: "21",extracode:hid};
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
                that.get_mssj(dsn,search); //获取门锁数据
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
                that.get_mssj(dsn,search); //获取门锁数据
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
        var L_date = new Date();
        var L_year = L_date.getFullYear();    //年
        var L_month = L_date.getMonth()+1;    //月
        var L_day = L_date.getDate();         //日
        var L_hour = L_date.getHours();       //时
        var L_minutes = L_date.getMinutes();  //分
        var L_seconds = L_date.getSeconds();  //秒
        var L_nowTime = L_year+ "-" +L_month+ "-" +L_day+ " " +L_hour+":"+L_minutes+":"+L_seconds;
        console.log("连接成功时间:——>>"+L_nowTime);     

        var _dataNC = "";
        var del_fz = "";
        if(yhlx=="03"){  //离线密码
          _dataNC = '{ac: "delete_offline_password","deviceid":"'+dsn+'","password":"'+pwd_old+'","channel":"21"}'
          del_fz = "delete_offline_password";
        }
        else{
          _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
          del_fz = "deletepassword";
        }
        wx.request({
          url: apiNC+del_fz,  //api地址
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
                var dateN = new Date();
                var year_n = dateN.getFullYear();    //年
                var month_n = dateN.getMonth()+1;    //月
                var day_n = dateN.getDate();         //日
                var hour_n = dateN.getHours();       //时
                var minutes_n = dateN.getMinutes();  //分
                var seconds_n = dateN.getSeconds();  //秒
                var nowTime_n = year_n+ "-" +month_n+ "-" +day_n+ " " +hour_n+":"+minutes_n+":"+seconds_n;
                console.log("删除成功后时间:——>>"+nowTime_n);                            
                if(lx=='01'){  //指纹
                  that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                }
                else if(lx=='03'){ //密码
                  if(yhlx=="03"){  //离线密码
                    that.insertLog_LS(userid,'',dsn,'删除','离线密码('+yhbh+')',pwd_old,'朗思管理端');
                  }
                  else{
                    that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');   
                  }
                }     
                wx.hideLoading();  //关闭提示框          
                wx.showToast({
                  title: '删除成功',
                  icon: "success",
                  duration: 1000
                })
                setTimeout(()=>{
                  that.get_mssj(dsn,search); //获取门锁数据
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
    else if(lylx == "5" || lylx == "6" || lylx == "20" || lylx == "21"){ //国民NB锁
      wx.showLoading({
        title: '删除中...',
      })
      let jk = "";//接口    
      var _dataNC = "";
      if(yhlx=="03"){  //离线密码
        if(lylx == "5" || lylx == "6"){  //国民锁
          jk = 'gm_delete_offline_password';
          _dataNC = '{ac: "gm_delete_offline_password","deviceid":"'+dsn+'","password":"'+pwd_old+'","channel":"21"}'
        }else if(lylx == "20" || lylx == "21"){  //同欣锁
          jk = 'tx_delete_offline_password';
          _dataNC = '{ac: "tx_delete_offline_password","deviceid":"'+dsn+'","password":"'+pwd_old+'","channel":"21"}'
        }
      }
      else{
        if(lylx == "5" || lylx == "6"){
          jk = 'gm_del_user';
        }else if(lylx == "20" || lylx == "21"){
          jk = 'tx_del_user';
        }
        _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
      }  
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
                if(yhlx=="03"){ 
                  that.insertLog_LS(userid,'',dsn,'删除','离线密码('+yhbh+')',pwd_old,'朗思管理端');
                }
                else{
                  that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');   
                }
              }      
              wx.hideLoading();  //关闭提示框     
              wx.showToast({
                title: '删除成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_mssj(dsn,search); //获取门锁数据
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
  updList:function(e){  //修改密码
    var that = this;
    var id = e.currentTarget.dataset.key;  // 当前流水号
    var kmlx = e.currentTarget.dataset.kmlx;  // 开门类型，01：指纹，02卡片，03密码
    clearInterval(app.globalData.c_discon);//清除断开的定时器
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
          let bdate = units[0].bdate
          let edate = units[0].edate
          let lx = units[0].lx //01指纹，02卡片，03密码
          let pwd_old = units[0].password //密码
          let lylx = units[0].lylx
          renterid = units[0].renterid  //归属人
          let yhlx = units[0].yhlx
          if(kmlx=='01'){  //指纹
            if(lylx=="5" || lylx=="6" || lylx=="20" || lylx=="21"){
              wx.showToast({
                title: '手机端不支持修改',
                icon: 'none',
                duration: 1000
              })
            }else{
              that.password_upd(yhbh,lx,dsn,'',bdate,edate,pwd_old,lylx); //修改指纹
            }
          }
          else if(kmlx=='03'){
            if(yhlx == "03"){
              wx.showToast({
                title: '离线密码不支持修改',
                icon: "none",
                duration: 1500
              })
            }
            else{
              that.setData( {
                ifName: true,    //显示弹出框
                yhbhid:id
              }); 
            }
          }
          else if(kmlx=='02' || kmlx=='04'){
            wx.showToast({
              title: '手机端不支持修改',
              icon: 'none',
              duration: 1000
            })
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
  setValue: function(e) {   //密码值改变事件
    newPwd = e.detail.value;
  },
  cancel: function (e) {  //取消
    newPwd = "";
    this.setData( {
      ifName: false,    //隐藏弹出框
      fxmc:""
    }); 
  },
  confirm: function (e) {  //确定
    if(!newPwd || newPwd.length != 6){
      wx.showToast({
        title: '请输入6位数字！',
        icon: 'none'
      })
    }
    else{
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
            let bdate = units[0].bdate
            let edate = units[0].edate
            let pwd_old = units[0].password //密码
            let lylx = units[0].lylx
            renterid = units[0].renterid  //归属人
            that.password_upd(yhbh,lx,dsn,newPwd,bdate,edate,pwd_old,lylx); //修改密码
          }          
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });
    }
  },
  password_add:function(dsn,newPwd,bdate,edate){  //新增密码
    var that = this;
    wx.showLoading({
      title: '下发中...',
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
          cmd = autoNo+'AA55170019020000'+newPwd+'FFFFFF'+bdate+edate+'CC';  
          //console.log("加密前:"+cmd);
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
                  else if(yhbh >= 10 && yhbh < 100){
                    yhbh = '0'+yhbh
                  }
                  else{
                    yhbh = yhbh
                  }
                  that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,bdate,edate);//插入门锁用户表
                  that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                  that.update_pwdRenterOld(dsn,newPwd,renterid,'03',yhbh);   //更新密码所有人(旧锁)
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
                    title: '修改密码失败',
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
        that.setData({
          showMB:true,  //显示幕布
        })
      },
      complete(){
      }
    });  
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
            that.get_mssj(dsn,search); //获取门锁数据
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
  del_Rh_yhb_Udp: function (dsn,yhbh,lx){  //删除门锁用户
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
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  zhiwen_add:function(dsn,bdate,edate){  //新增指纹
    var that = this;
    wx.showLoading({
      title: '下发中...',
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
          cmd = autoNo+'AA5511001A020000'+bdate+edate+'CC';     
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
                  else if(yhbh >= 10 && yhbh < 100){
                    yhbh = '0'+yhbh
                  }
                  else{
                    yhbh = yhbh
                  }
                  that.insert_Rh_yhb(dsn,'01',yhbh,'',bdate,edate);//插入门锁用户表
                  that.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');
                  that.update_pwdRenterOld(dsn,'',renterid,'01',yhbh);   //更新密码所有人(旧锁)
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
                    title: '修改指纹失败',
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
  },
  insert_Rh_yhb: function (dsn,lx,yhbh,newPwd,Stime,Etime){  //插入门锁用户表
    var that = this;
    var yhlx = "02";    //用户类型
    var channel = "21"; //下发来源
    var remark = "";  
    var title = "修改密码成功";
    if(lx=="01"){
      title = "修改指纹成功";
    }
    else{
      title = "修改密码成功";
    }
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
          wx.hideToast();  //关闭提示框
          wx.showToast({
            title: title,
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            that.get_mssj(dsn,search); //获取门锁数据
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
    var _data = {ac: 'operateLog_save',"wx_id":wx_id,"hid":hid,"sbh":sbh,"czlx":czlx,"Pwd_type":Pwd_type,"Pwd":Pwd,"xfly":xfly,"renterNo":renterid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
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
  password_upd:function(yhbh,lx,dsn,newPwd,bdate,edate,pwd_old,lylx){  //修改密码
    var that = this;
    let ljzt = false;
    if(lylx=="1"){
      ljzt = BLE.authState();//连接状态
    }
    else if(lylx=="2"){
      ljzt = BLE_new.connectionState();//连接状态  
    }
    that.setData({
      showMB:false,  //显示幕布
    })
    //蓝牙下发
    if(ljzt){
      wx.showToast({
        title: '密码修改中...',
        icon: "loading",
        duration: 5000
      })
      if(lylx == "1"){
        clearInterval(this.data.c);//清除定时器
        that.setData({
         second: 20,  //初始化成20秒
        });
        that.countdown(); //调用计时器
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
                      that.del_Rh_yhb(dsn,yhbh,lx);//删除门锁用户
                      if(lx=='01'){  //01指纹
                        that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                        that.zhiwen_add(dsn,bdate,edate); //新增指纹
                      }else if(lx=='03'){ //03密码
                        that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                        that.password_add(dsn,newPwd,bdate,edate); //新增密码
                        setTimeout(()=>{
                          newPwd = "";
                          that.setData( {
                            ifName: false,    //隐藏弹出框
                            fxmc:""
                          });
                        },1000)
                      }
                    }
                    else{
                      wx.hideToast();  //关闭提示框
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
       var xfbs_delBLE = "下发中";
       clearInterval(this.data.c);//清除定时器
       that.setData({
        second: 40,  //初始化成40秒
       });
       that.countdown(); //调用计时器
       var hardwareNumber = parseInt(yhbh, 10);  //用户编号
       var unlockModeEnum = 1;
       if(lx=='01'){  //指纹
        unlockModeEnum = 3; //1代表密码，3代表指纹
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
                    if(xfbs_delBLE=='已完成'){
                      return;
                    }
                    else{
                      xfbs_delBLE='已完成';
                      that.del_Rh_yhb_Udp(dsn,yhbh,lx);//删除门锁用户
                      if(lx=='01'){  //指纹
                        that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                        that.zhiwen_addNewLockBLE(dsn,bdate,edate); //新增指纹(新锁蓝牙)
                      }
                      else if(lx=='03'){ //密码
                        that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                        that.password_addNewLockBLE(dsn,newPwd,bdate,edate); //新增密码(新锁蓝牙)
                        setTimeout(()=>{                   
                          that.setData( {
                            ifName: false,    //隐藏弹出框
                            fxmc:""
                          });
                        },1000) 
                      }
                    }                                      
                  }
                  else{
                    xfbs_delBLE='已完成';  
                    that.setData({
                      showMB:true,  //显示幕布
                    })         
                    wx.showToast({
                      title: '删除用户失败',
                      icon: "error",
                      duration: 1000
                    })
                    console.log(_res.code+'——>>'+_res.msg);                    
                  }
                 },
                 fail(res) {
                  xfbs_delBLE='已完成';  
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
           xfbs_delBLE='已完成';  
           //console.log("getunits fail:",res);
         },
         complete(){
         }
       });   
      }
    }
    else{ //网关下
     setTimeout(()=>{
      that.setData( {
        ifName: false,    //隐藏弹出框
        fxmc:""
      });
     },1000)
     that.password_delNC(yhbh,lx,dsn,pwd_old,lylx,newPwd,bdate,edate); //删除密码
    }
  },
  password_delNC:function(yhbh,lx,dsn,pwd_old,lylx,newPwd,bdate,edate){  //删除密码
    var that = this;
    wx.showLoading({
      title: '删除中...',
    })
    if(lylx == "1"){  //旧锁
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
                that.password_addYC(dsn,newPwd,bdate,edate,lx,lylx); //新增用户(网关)
              },1000)
            }
            else{
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //显示幕布
              })
              wx.showToast({
                title: '删除失败',
                icon: "error",
                duration: 1000
              })          
            }
          },
          fail(res) {
            wx.hideLoading();  //关闭提示框
            that.setData({
              showMB:true,  //显示幕布
            })
            wx.showToast({
              title: '删除失败',
              icon: "error",
              duration: 1000
            }) 
          },
          complete(){
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
                that.password_addYC(dsn,newPwd,bdate,edate,lx,lylx); //新增用户(网关)
              },1000)
            }
            else{
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //显示幕布
              })
              wx.showToast({
                title: '删除失败',
                icon: "error",
                duration: 1000
              })          
            }
          },
          fail(res) {
            console.log("getunits fail:",res);
            wx.hideLoading();  //关闭提示框
            that.setData({
              showMB:true,  //显示幕布
            })
            wx.showToast({
              title: '删除失败',
              icon: "error",
              duration: 1000
            })
          },
          complete(){
          }
        }); 
      }
    }
    else if(lylx == "2"){  //新锁
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
              that.setData({
                showMB:true,  //显示幕布
              })
              wx.showToast({
                title: '删除失败',
                icon: "none",
                duration: 1000
              })
            }
            else{
              if(res.data.code == '0' || res.data.code == '40009'){
                wx.hideLoading();  //关闭提示框
                if(lx=='01'){  //01指纹
                  that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                }
                else if(lx=='03'){ //03密码
                  that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                }
                wx.showToast({
                  title: '删除成功',
                  icon: "success",
                  duration: 1000
                })
                setTimeout(()=>{
                  that.password_addYC(dsn,newPwd,bdate,edate,lx,lylx); //新增用户(网关)
                },1000)
              }
              else{
                console.log(res.data.msg);
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
    }else if(lylx == "5" || lylx == "6" || lylx == "20" || lylx == "21"){  //国民NB锁
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
            that.setData({
              showMB:true,  //显示幕布
            })
            wx.showToast({
              title: '删除失败',
              icon: "none",
              duration: 1000
            })
          }
          else{
            if(res.data.code == '0'){
              wx.hideLoading();  //关闭提示框
              if(lx=='01'){  //指纹
                that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
              }
              else if(lx=='03'){ //密码
                that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
              }
              setTimeout(()=>{
                that.password_addYC(dsn,newPwd,bdate,edate,lx,lylx); //新增用户(网关)
              },1000)
            }
            else{
              wx.showToast({
                title: res.data.message,
                icon: "none",
                duration: 1000
              })
              console.log("code:"+res.data.code+"——>>msg:"+res.data.message); 
            }     
          }
        },
        fail(res) {
        },
        complete(){
          wx.hideLoading();  //关闭提示框
          that.setData({
            showMB:true,  //显示幕布
          })
        }
      }); 
    }
  },
  //新增用户(网关)
  password_addYC:function(dsn,newPwd,bdate,edate,lx,lylx){
    var that = this;
    let Stime = bdate;
    let Etime = edate;
    let StimeN = '20'+bdate.substr(0,2)+'-'+bdate.substr(2,2)+'-'+bdate.substr(4,2)+' '+bdate.substr(6,2)+':'+bdate.substr(8,2)+':'+bdate.substr(10,2);
    let EtimeN = '20'+edate.substr(0,2)+'-'+edate.substr(2,2)+'-'+edate.substr(4,2)+' '+edate.substr(6,2)+':'+edate.substr(8,2)+':'+edate.substr(10,2);
    that.setData({
      showMB:false,  //显示幕布
    }) 
    wx.showLoading({
      title: '下发中...',
    })   
    if(lylx == "1"){  //旧锁
      if(lx=='01'){  //指纹
        wx.showToast({
          title: '旧锁新增指纹开发中',
          icon: "none",
          duration: 1000
        }) 
      }
      else if(lx=='03'){  //密码
        var useType = "02"; //普通用户
        var _dataYC = { ac: "lockauth", partnerid: ptlx, deviceid: dsn, password: newPwd, usertype: useType, begindate: Stime, enddate: Etime, channel: "21"};
        wx.request({
          url: apiYC,  //api地址
          data: _dataYC,
          header: {'content-type': 'application/x-www-form-urlencoded'},
          method: "POST",
          success(res) {
            if(res.data.state == true){
              wx.hideLoading();  //关闭提示框
              that.insertLog_LS(userid,'',dsn,'下发','普通用户',newPwd,'朗思管理端');
              that.update_pwdRenter(dsn,newPwd,renterid,'03');   //更新密码所有人(旧锁)
              wx.showToast({
                title: '修改密码成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_mssj(dsn,search); //获取门锁数据
              },1000)
            }
            else{
              wx.hideLoading();  //关闭提示框
              wx.showToast({
                title: '修改用户失败',
                icon: "error",
                duration: 1000
              })  
            }
          },
          fail(res) {
            console.log("getunits fail:",res);
            wx.showToast({
              title: '修改用户失败',
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
        if(lx=='01'){  //指纹
          var zwlx = "01"; 
          var _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","lx":"'+zwlx+'","begindate":"'+StimeN+'","enddate":"'+EtimeN+'","channel":"21"}'
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
                  that.update_pwdRenterOld(dsn,'',renterid,'01',yhbh);   //更新密码所有人      
                  wx.showToast({
                    title: '修改指纹成功',
                    icon: "success",
                    duration: 1000
                  })
                  setTimeout(()=>{
                    that.get_mssj(dsn,search); //获取门锁数据
                  },1000)             
                }
                else{
                  wx.hideLoading();  //关闭提示框
                  wx.showToast({
                    title: '修改指纹失败',
                    icon: "error",
                    duration: 1000
                  })          
                }
              }        
            },
            fail(res) {
              console.log("getunits fail:",res);
              wx.showToast({
                title: '修改指纹失败',
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
        else if(lx=='03'){ //密码
          var useType = "02"; //普通用户
          var _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","password":"'+newPwd+'","usertype":"'+useType+'","begindate":"'+StimeN+'","enddate":"'+EtimeN+'","lx":"03","channel":"21"}'
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
                  wx.hideLoading();  //关闭提示框
                  that.insertLog_LS(userid,'',dsn,'下发','普通用户',newPwd,'朗思管理端');
                  that.update_pwdRenter(dsn,newPwd,renterid,'03');   //更新密码所有人   
                  wx.showToast({
                    title: '修改用户成功',
                    icon: "success",
                    duration: 1000
                  })
                  setTimeout(()=>{
                    that.get_mssj(dsn,search); //获取门锁数据
                  },1000)
                }
                else{
                  wx.hideLoading();  //关闭提示框
                  wx.showToast({
                    title: '修改用户失败',
                    icon: "error",
                    duration: 1000
                  })          
                }
              }        
            },
            fail(res) {
              console.log("getunits fail:",res);
              wx.showToast({
                title: '修改用户失败',
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
      var _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","password":"'+newPwd+'","usertype":"'+useType+'","begindate":"'+StimeN+'","enddate":"'+EtimeN+'","type":"03","channel":"21"}'
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
          else{
            if(res.data.code=='0'){
              wx.hideLoading();  //关闭提示框
              that.insertLog_LS(userid,'',dsn,'下发','普通用户',newPwd,'朗思管理端');
              that.update_pwdRenter(dsn,newPwd,renterid,'03');   //更新密码所有人   
              wx.showToast({
                title: '修改用户成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_mssj(dsn,search); //获取门锁数据
              },1000)
            }
            else{
              wx.hideLoading();  //关闭提示框
              wx.showToast({
                title: '修改用户失败',
                icon: "error",
                duration: 1000
              })          
            }
          }        
        },
        fail(res) {
          wx.showToast({
            title: '修改用户失败',
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
  },
  fp: function(e){ //分配密码
    let id = e.currentTarget.dataset.key;  // 当前流水号
    this.setData( {
      ifNameFP: true,    //显示弹出框
      yhbhid_fp:id
    }); 
  },
  cancelFP: function (e) {  //取消
    this.setData( {
      ifNameFP: false,    //隐藏弹出框
    }); 
  },
  confirmFP: function (e) {  //确定
    let that = this;
    let id = e.currentTarget.dataset.key;  // 当前流水号
    let yhNo = this.data.rent_no;
    if(!yhNo){
      yhNo = this.data.yhList[0].rent_no;
    }
    that.setData( {
      ifNameFP: false,    //隐藏弹出框
    }); 
    var _data = {ac: "update_pwdUser","id":id,"yhNo":yhNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.showToast({
            title: '分配成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            that.get_mssj(dsn,search); //获取门锁数据
          },1000)
        }  
      },
      fail(res) {
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
          renterid = units[0].renterid //归属人
          if(ljzt){  //蓝牙操作
            wx.showToast({
              title: '冻结中...',
              icon: "loading",
              duration: 5000
            })
            that.password_frozen(yhbh,lx,dsn,pwd_old,lylx); //冻结     
          }else{
            if(lylx == "1"){  //旧锁
              wx.showToast({
                title: '冻结中...',
                icon: "loading",
                duration: 5000
              })
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
            renterid = units[0].renterid //归属人
            if(ljzt){  //蓝牙操作
              wx.showToast({
                title: '解冻中...',
                icon: "loading",
                duration: 5000
              })
              that.password_unfreeze(yhbh,lx,dsn,pwd_old,lylx); //解冻    
            }else{  //网关操作
              if(lylx == "1"){  //旧锁
                wx.showToast({
                  title: '解冻中...',
                  icon: "loading",
                  duration: 5000
                })
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
            that.get_mssj(dsn,search); //获取门锁数据
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
        }
        setTimeout(()=>{
          that.get_mssj(dsn,search); //获取门锁数据
        },1000)     
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
              that.get_mssj(dsn,search); //获取门锁数据
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
                that.get_mssj(dsn,search); //获取门锁数据
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
              that.get_mssj(dsn,search); //获取门锁数据
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
              that.get_mssj(dsn,search); //获取门锁数据
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
  password_addNewLockBLE:function(dsn,newPwd,bdate,edate){  //新增密码(新锁蓝牙)
    console.log("操作方法：password_addNewLockBLE");
    wx.showLoading({
      title: '下发中...',
    })
    var that = this;
    var xfbs_addBLE = "下发中";
    let Stime_BLE = '20'+bdate.substr(0,2)+'-'+bdate.substr(2,2)+'-'+bdate.substr(4,2)+' '+bdate.substr(6,2)+':'+bdate.substr(8,2);
    let Etime_BLE = '20'+edate.substr(0,2)+'-'+edate.substr(2,2)+'-'+edate.substr(4,2)+' '+edate.substr(6,2)+':'+edate.substr(8,2);
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
                  console.log("新增下发标识："+xfbs_addBLE);          
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
                  if(xfbs_addBLE=='已完成'){
                    return;
                  }
                  else{
                    that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,bdate,edate);//插入门锁用户表
                    that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                    that.update_pwdRenterOld(dsn,newPwd,renterid,'03',yhbh);   //更新密码所有人(旧锁)
                    xfbs_addBLE='已完成';
                    newPwd = "";
                  }  
                }
                else{       
                  xfbs_addBLE='已完成';            
                  wx.hideLoading();  //关闭提示框
                  that.setData({
                    showMB:true,  //显示幕布
                  })
                  wx.showToast({
                    title: '新增用户失败',
                    icon: "error",
                    duration: 1000
                  })
                  console.log(_res.code+'——>>'+_res.msg);                 
                }
              },
              fail(res) {
                xfbs_addBLE='已完成';
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
        xfbs_addBLE='已完成';
        //console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  zhiwen_addNewLockBLE:function(dsn,bdate,edate){  //新增指纹(新锁蓝牙)
    wx.showLoading({
      title: '下发中...',
    })
    var that = this;
    var xfbs_addBLE = "下发中";
    let Stime_BLE = '20'+bdate.substr(0,2)+'-'+bdate.substr(2,2)+'-'+bdate.substr(4,2)+' '+bdate.substr(6,2)+':'+bdate.substr(8,2);
    let Etime_BLE = '20'+edate.substr(0,2)+'-'+edate.substr(2,2)+'-'+edate.substr(4,2)+' '+edate.substr(6,2)+':'+edate.substr(8,2);
    var _data2 = {
      "deviceSn":dsn,
      "cmd":"0301",
      "syncNo":"0",
      "cloudUnlockBO":{
       "unlockModeEnum":3,
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
                let registerStatus = _res.data.registerStatusEnum; //状态
                if( _res.code == 0 ){
                  if(registerStatus=="START" || registerStatus=="IN"){
                    wx.showLoading({
                      title: '下发中...',
                    })
                  }
                  if(xfbs_addBLE=='已完成'){
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
                    xfbs_addBLE='已完成';
                    that.insert_Rh_yhb(dsn,'01',yhbh,'',bdate,edate);//插入门锁用户表
                    that.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');   
                    that.update_pwdRenterOld(dsn,'',renterid,'01',yhbh);   //更新密码所有人(旧锁)                 
                  }   
                }
                else{  
                  xfbs_addBLE='已完成';              
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
                xfbs_addBLE='已完成';
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
        xfbs_addBLE='已完成';
        //console.log("getunits fail:",res);
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
                renterid = units[0].renterid //归属人
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
  updTX:function(e){  //同欣修改密码
    var that = this;
    var id = e.currentTarget.dataset.key;  // 当前流水号
    var kmlx = e.currentTarget.dataset.kmlx;  // 开门类型，01：指纹，02卡片，03密码
    var _data = {ac: "mssj_info","id":id};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let yhlx = units[0].yhlx
          renterid = units[0].renterid //归属人
          if(kmlx!='03'){
            wx.showToast({
              title: '手机端不支持修改',
              icon: "none",
              duration: 1000
            })   
          }
          else{
            if(yhlx == "03"){
              wx.showToast({
                title: '离线密码不支持修改',
                icon: "none",
                duration: 1500
              })
            }
            else{
              that.setData( {
                ifNameTX: true,    //显示弹出框
                yhbhid:id
              }); 
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
  cancelTX: function (e) {  //取消
    newPwd = "";
    this.setData( {
      ifNameTX: false,    //隐藏弹出框
      fxmc:""
    }); 
  },
  confirmWG: function (e) {  //网关修改
    let that = this;
    if(!newPwd || newPwd.length != 6){
      wx.showToast({
        title: '请输入6位数字！',
        icon: 'none'
      })
    }
    else{
      let id = e.currentTarget.dataset.key;  // 当前流水号
      that.setData( {
        ifNameTX: false,
        fxmc:""
      });
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
            let dsn = units[0].equip_no
            let lx = units[0].lx //01指纹，02卡片，03密码
            let pwd_old = units[0].password //密码
            let lylx = units[0].lylx //来源类型
            let bdate = units[0].bdate
            let edate = units[0].edate
            renterid = units[0].renterid //归属人
            that.password_delNC(yhbh,lx,dsn,pwd_old,lylx,newPwd,bdate,edate); //删除密码
          }          
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });
    }
  },
  confirmTX: function (e) {  //确定
    let that = this;
    if(!newPwd || newPwd.length != 6){
      wx.showToast({
        title: '请输入6位数字！',
        icon: 'none'
      })
    }
    else{
      let id = e.currentTarget.dataset.key;  // 当前流水号
      that.setData( {
        ifNameTX: false,
        fxmc:""
      });
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
            let dsn = units[0].equip_no
            let pwd_old = units[0].password //密码
            let lylx = units[0].lylx //来源类型
            renterid = units[0].renterid //归属人
            if(lylx=='5' || lylx=='6'){  //国民
              that.BLEpassword_updGM(yhbh,dsn,newPwd,pwd_old); //修改密码
            }
            else if(lylx=='20' || lylx=='21'){  //同欣
              that.BLEpassword_updTX(yhbh,dsn,newPwd,pwd_old); //修改密码
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
  },
  BLEpassword_updTX:function(yhbh,dsn,newPwd,pwd_old){  //同欣蓝牙修改密码
    let that = this;
    let lockKeyId = yhbh*1;  //用户编号
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '修改中...',
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
          myPlugin.updatePassword({
            newPassword: newPwd,
            lockKeyId: lockKeyId
          }).then(function(res) {  
            if(res.errCode=="01"){
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //显示幕布
              })
              that.upd_Rh_yhb(yhbh,pwd_old,newPwd);//修改门锁用户
              that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
              setTimeout(()=>{
                that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');   
              },10)             
            }              
          })
          .catch(function(err) {
            wx.hideLoading();  //关闭提示框   
            that.setData({
              showMB:true,  //显示幕布
            })
            wx.showToast({
              title: '修改用户失败',
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
      // 监听“修改钥匙”事件
      myPlugin.on("updatePassword", function(data){
      });
      // 监听“修改钥匙”事件上报
      myPlugin.on("report:updatePassword", function(data) {
      });
    }
    else{
      myPlugin.updatePassword({
        newPassword: newPwd,
        lockKeyId: lockKeyId
      }).then(function(res) {  
        if(res.errCode=="01"){
          that.upd_Rh_yhb(yhbh,pwd_old,newPwd);//修改门锁用户
          that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
          setTimeout(()=>{
            that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');   
          },10)
          wx.hideLoading();  //关闭提示框
          that.setData({
            showMB:true,  //显示幕布
          })      
        }            
      })
      .catch(function(err) {
        wx.hideLoading();  //关闭提示框   
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.showToast({
          title: '修改用户失败',
          icon: "error",
          duration: 1000
        })   
      });
    }
  },
  BLEpassword_updGM:function(yhbh,dsn,newPwd,pwd_old){  //国民蓝牙修改密码
    let that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '修改中...',
    })
    let lockKeyId = yhbh*1;  //用户编号
    let cls = 0x03;   //操作类型(0x01 删除 	0x02 修改有效期 	0x03 修改密码，仅限密码)
    let id = lockKeyId;  //用户id
    let pwd = newPwd; //修改密码
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
          that.upd_Rh_yhb(yhbh,pwd_old,newPwd);//修改门锁用户
          that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
          setTimeout(()=>{
            that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');   
          },10)
          wx.hideLoading();  //关闭提示框 
          that.setData({
            showMB:true,  //显示幕布
          })
          bleApi.closeBle();  //断开连接
        }
        else{
          wx.showToast({
            title: '修改用户失败',
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
  //修改门锁用户
  upd_Rh_yhb:function(yhbh,pwd_old,newPwd){
    var that = this;
    var _data = {ac: 'updpwd',"dsn":dsn,"yhbh":yhbh,"pwd_old":pwd_old,"newPwd":newPwd};
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
          setTimeout(()=>{
            that.get_mssj(dsn,search); //获取门锁数据
          },500)
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
  onUnload: function () {
    if(gysly=="20" || gysly=="21"){
      if(!!myPlugin){
        myPlugin.disconnect();
      }
    }
    else if(gysly=="5" || gysly=="6"){
      bleApi.closeBle();
    }
  },
  onShow: function () { //生命周期函数--监听页面显示
    this.get_mssj(dsn,search); //获取门锁数据
  }
})