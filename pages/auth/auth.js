//获取应用实例
//const util = require('../../utils/util.js')
const app = getApp()
//var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiUrl = "";   //获取api地址
var QZ = ""; 
Page({
  data: {
    zh:'',  //登陆账号
    pwd:'',  //密码    
  },
  onLoad: function(options) {

  },
  formSubmit: function (e){  //保存数据
    var that = this;
    let LoginId = e.detail.value.zh;
    let pwd = e.detail.value.pwd;
    var chk = e.detail.value.chk;
    let chk_value = chk[0];
    if(chk_value!="1"){
      wx.showToast({
        title: '请阅读用户协议与隐私政策',
        icon: "none",
        duration: 2000
      })
      return false;      
    }
    if(LoginId.length < 1 ) {
      wx.showModal({    
        title: '提示',    
        showCancel: false,    
        content: '请输入账号',    
        success: function (res) { }    
      })
      return false; 
    }
    else if(pwd.length < 1 ){
      wx.showModal({    
        title: '提示',    
        showCancel: false,    
        content: '请输入密码',    
        success: function (res) { }    
      })
      return false; 
    }
    if(LoginId.indexOf("zhongjun") != -1 && LoginId.indexOf("zhongjun")==0){   //中骏
      apiUrl = "https://aptWeChat.langsi.funplus.cn/api.ashx";   //获取api地址
	    let apiHost = "https://aptApi.langsi.funplus.cn/api/lock/";
	    let apiPC = "https://aptApi.langsi.funplus.cn/api/lock/cmd2";
	    let apiNC = "https://aiot.langsi.funplus.cn/api/lock/";
      QZ = "zhongjun";
      wx.setStorageSync("apiUrl", apiUrl);
      wx.setStorageSync("apiHost", apiHost);
      wx.setStorageSync("apiPC", apiPC);
      wx.setStorageSync("apiNC", apiNC);
      wx.setStorageSync("QZ", QZ);
      app.globalData.apiUrl = apiUrl;
      app.globalData.apiHost = apiHost;
      app.globalData.apiPC = apiPC;
      app.globalData.apiNC = apiNC;
      app.globalData.QZ = QZ;
    }
    else if(LoginId.indexOf("jxjf") != -1 && LoginId.indexOf("jxjf")==0){   //建信嘉福
      apiUrl = "https://jxWeChat.langsi.com.cn/api.ashx";   //获取api地址
      let apiHost = "https://jx.langsi.com.cn/api/lock/";
      let apiPC = "https://jx.langsi.com.cn/api/lock/cmd2";
      let apiYC = "https://jxpc.langsi.com.cn/api/api.ashx";
      QZ = "jianxin";
      wx.setStorageSync("apiUrl", apiUrl);
      wx.setStorageSync("apiHost", apiHost);
      wx.setStorageSync("apiPC", apiPC);
      wx.setStorageSync("apiYC", apiYC);
      wx.setStorageSync("QZ", QZ);
      app.globalData.apiUrl = apiUrl;
      app.globalData.apiHost = apiHost;
      app.globalData.apiPC = apiPC;
      app.globalData.apiYC = apiYC;
      app.globalData.QZ = QZ;
    }
    else if((LoginId.indexOf("jy") != -1 && LoginId.indexOf("jy")==2) || LoginId.indexOf("jy")==0){  //金圆
      apiUrl = "https://jyWeChat.langsi.com.cn/api.ashx";   //获取api地址
      let apiHost = "https://iotgyApi.langsi.com.cn/api/lock/";
      let apiPC = "https://iotgyApi.langsi.com.cn/api/lock/cmd2";
      let apiYC = "https://iotgy.langsi.com.cn/api/api.ashx";
      QZ = "jinyuan";
      wx.setStorageSync("apiUrl", apiUrl);
      wx.setStorageSync("apiHost", apiHost);
      wx.setStorageSync("apiPC", apiPC);
      wx.setStorageSync("apiYC", apiYC);
      wx.setStorageSync("QZ", QZ);
      app.globalData.apiUrl = apiUrl;
      app.globalData.apiHost = apiHost;
      app.globalData.apiPC = apiPC;
      app.globalData.apiYC = apiYC;
      app.globalData.QZ = QZ;
    }
    else if(LoginId.indexOf("aj") != -1 && LoginId.indexOf("aj")==0){  //安居
      apiUrl = "https://ajWeChat.langsi.com.cn/api.ashx";   //获取api地址
      let apiHost = "https://langsi.com.cn/api/lock/";
      let apiPC = "https://langsi.com.cn/api/lock/cmd2";
      let apiYC = "https://anju.langsi.com.cn/api/api.ashx";
      QZ = "anju";
      wx.setStorageSync("apiUrl", apiUrl);
      wx.setStorageSync("apiHost", apiHost);
      wx.setStorageSync("apiPC", apiPC);
      wx.setStorageSync("apiYC", apiYC);
      wx.setStorageSync("QZ", QZ);
      app.globalData.apiUrl = apiUrl;
      app.globalData.apiHost = apiHost;
      app.globalData.apiPC = apiPC;
      app.globalData.apiYC = apiYC;
      app.globalData.QZ = QZ;
    }
    else if(LoginId.indexOf("ls") != -1 && LoginId.indexOf("ls") ==0){  //iot
      apiUrl = "https://lsWeChat.langsi.com.cn/api.ashx";   //获取api地址
      let apiHost = "https://iot.langsi.com.cn/api/lock/";
      let apiPC = "https://iot.langsi.com.cn/api/lock/cmd2";
      let apiYC = "https://iot.langsi.com.cn/api/api.ashx";
      QZ = "iot"; //石总
      wx.setStorageSync("apiUrl", apiUrl);
      wx.setStorageSync("apiHost", apiHost);
      wx.setStorageSync("apiPC", apiPC);
      wx.setStorageSync("apiYC", apiYC);
      wx.setStorageSync("QZ", QZ);
      app.globalData.apiUrl = apiUrl;
      app.globalData.apiHost = apiHost;
      app.globalData.apiPC = apiPC;
      app.globalData.apiYC = apiYC;
      app.globalData.QZ = QZ;
    }
    else{  //公寓版
      apiUrl = "https://aptWeChat.langsi.com.cn/api.ashx";   //获取api地址
      //apiUrl = "http://localhost:7857/api.ashx";
      let apiHost = "https://aptApi.langsi.com.cn/api/lock/";
      let apiPC = "https://aptApi.langsi.com.cn/api/lock/cmd2";
      let apiNC = "https://aiot.langsi.com.cn/api/lock/";
      //let apiNC = "http://192.168.1.111/api/v1/lock/";
      let apiYC = "http://ldrk.langsi.com.cn/api/api.ashx";
      QZ = "langsi";  //公寓版
      wx.setStorageSync("apiUrl", apiUrl);
      wx.setStorageSync("apiHost", apiHost);
      wx.setStorageSync("apiPC", apiPC);
      wx.setStorageSync("apiNC", apiNC);
      wx.setStorageSync("apiYC", apiYC);
      wx.setStorageSync("QZ", QZ);
      app.globalData.apiUrl = apiUrl;
      app.globalData.apiHost = apiHost;
      app.globalData.apiPC = apiPC;
      app.globalData.apiNC = apiNC;
      app.globalData.apiYC = apiYC;
      app.globalData.QZ = QZ;
    }
    var _data = {ac: 'login_data',zh:LoginId,pwd:pwd};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=='1'){
          let units = res.data.rows;
          let _userid = units[0].emp_no; 
          let _job = units[0].job_name;
          let _LoginID = units[0].LoginID;
          wx.setStorageSync("userid", _userid);
          wx.setStorageSync("job", _job);
          wx.setStorageSync("LoginID", _LoginID);
          app.globalData.userid = _userid;
          app.globalData.job = _job;
          app.globalData.LoginID = _LoginID;
          if( !!_userid ){
            if(QZ=="jianxin" || QZ=="anju" || QZ=="jinyuan" || QZ=="iot"){ //建信、安居、石总
              setTimeout(function(){
                wx.switchTab({
                  url: '/pages/homeYY/homeYY',
                })
              },10)
            }else{
              if(_job=="样品管理员" || _job=="安装" || _job=="维保"){
                setTimeout(function(){
                  wx.switchTab({
                    url: '/pages/homeYS/homeYS',
                  })
                },10)
              }
              else {
                setTimeout(function(){
                  wx.switchTab({
                    url: '/pages/home/home',
                  })
                },10)
              }
            }
          }
        }
        else if(res.data.status=='2'){
          wx.showModal({    
            title: '提示',    
            showCancel: false,    
            content: '请联系管理员授权',    
            success: function (res) { }    
          })
          return false; 
        }
        else{
          wx.showModal({    
            title: '提示',    
            showCancel: false,    
            content: '账号或密码错误',    
            success: function (res) { }    
          })
          return false;    
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
  bindInputHandler: function(e) {
    var _this = this;
    var eid = e.currentTarget.dataset.id;
    if( eid == "zh" ) {
      _this.setData({
        zh: e.detail.value
      });
    }else if( eid == "pwd" ){
      _this.setData({
        pwd: e.detail.value
      });
    }
  },
  */
 checkboxChange: function(event) {
  console.log('Checkbox发生change事件，携带value值为：',event.detail.value);
  this.setData({
    chk2: event.detail.value
  });
  },
 yhxy: function(e) {  //跳转到用户协议
   wx.navigateTo({
      url: '../../pagesA/pages/yhxy_info/yhxy_info'
   })
  },
  yssm: function(e) {  //跳转到隐私政策
    wx.navigateTo({
      url: '../../pagesA/pages/yszc_info/yszc_info'
    })
  },
  onShow: function () {  //生命周期函数--监听页面显示
    wx.hideHomeButton();
  }
})