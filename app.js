// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    
    //获取当前设备信息
    wx.getSystemInfo({
      success: res => {
        // 苹果X及以上的底部安全区域
        if (res.safeArea.top > 20) {
          this.globalData.bottomLift = (res.screenHeight - res.safeArea.bottom)+2;
        }
      },
      fail:err => {
        console.log(err);
      }
    })
  },
  globalData: {
    authcode:'',
    code:'',
    userInfo: null,
    mobile:wx.getStorageSync("mobile") || "",
    openid:wx.getStorageSync("openid") || "",
    //apiUrl:'http://localhost:7857/api.ashx',
    /*
    apiUrl:'https://aptWeChat.langsi.com.cn/api.ashx',  //业务逻辑api
    apiHost:'https://aptApi.langsi.com.cn/api/lock/',
    apiPC:'https://aptApi.langsi.com.cn/api/lock/cmd2',  //门锁指令的api
    apiNC:'https://aiot.langsi.com.cn/api/lock/',  //门锁指令的api(新锁)
    apiYC:'http://ldrk.langsi.com.cn/api/api.ashx',  //门锁指令的api(远程)
    */
   apiUrl_LS:'https://aptWeChat.langsi.com.cn/api.ashx', //公寓数据库
   apiUrl:wx.getStorageSync("apiUrl") || "",
   apiHost:wx.getStorageSync("apiHost") || "",
   apiPC:wx.getStorageSync("apiPC") || "",
   apiNC:wx.getStorageSync("apiNC") || "",
   apiYC:wx.getStorageSync("apiYC") || "",
    //apiYC:'https://apt.langsi.com.cn/api/api.ashx',  //门锁指令的api(远程)
    //apiYC:'https://ldrkpc.langsi.com.cn/api/api.ashx',  //门锁指令的api(远程)
    aiotAPI:'https://aiot.langsi.com.cn/api/',     //水电表指令的api
    apiTX:'https://aptWebApi.langsi.com.cn/api.ashx',  //小陈指纹、卡片接口
    apiDB:'https://langsi.com.cn:7800',  //电表指令api
    apiSB:'https://langsi.com.cn:7800',  //水表指令api
    isLogin: wx.getStorageSync("mobile") ? true : false,
    version: "1.5.8",
    isOnline:false,
    statusBarHeight:0,
    navigationBarHeight:0,
    navigationBarWidth:0,
    hostUrl:'http://localhost:7857/',
    imgUrl:'http://localhost:7857/upload/',
    userid:wx.getStorageSync("userid") || "", //登陆人工号
    ljzt_qj:false,  //蓝牙连接状态
    c_discon:'',  //计时器
    job:wx.getStorageSync("job") || "",  //登陆职务
    //userid:'gly5387',  //登陆人工号
    QZ:wx.getStorageSync("QZ") || "",  //账号前缀
    LoginID:wx.getStorageSync("LoginID") || "",  //登录账号
    bottomLift: 0 //苹果X及以上的底部小黑条高度

    /* 添加到域名
    https://jxWeChat.langsi.com.cn
    https://jx.langsi.com.cn
    https://jxpc.langsi.com.cn
    https://ajWeChat.langsi.com.cn
    https://anju.langsi.com.cn
    https://langsi.com.cn
    https://jyWeChat.langsi.com.cn
    https://iotgyApi.langsi.com.cn
    https://iotgy.langsi.com.cn
    https://lsWeChat.langsi.com.cn
    https://iot.langsi.com.cn
    */
  }
})