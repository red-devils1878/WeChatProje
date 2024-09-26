var dsn= "";  //设备号
var sbName = "" //设备名称
var QZ= "";  //账号前缀
var app = getApp();
var apiUrl = "";   //获取api地址
var apiNC = "";     //获取门锁api地址(新锁)
var gateway_id = "" //网关id
Page({
  data: {  //页面的初始数据
    ifName: false,
    showMB:true, //幕布
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    apiNC = app.globalData.apiNC; 
    dsn = options.dsn;
    that.get_msInfo(dsn);  //获取设备详情
    that.get_mcToMS(dsn); //获取设备号
  },
  get_msInfo:function (dsn) { //获取设备详情
    let _this = this;
    var _data = {ac: 'get_msInfo',"dsn":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          _this.setData({
            mc:units[0].mc,
            dsn:units[0].dsn,
            val_xh:units[0].val_xh=='' ? '无':units[0].val_xh,
            at_xh:units[0].at_xh,      
            val_dl:units[0].val_dl,    
            at_dl:units[0].at_dl,    
            lx:units[0].lx,
            zxzt:units[0].online_status,
            device_id:units[0].device_id,
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
          gateway_id = units[0].gateway_id;
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  tapYD: function(e) {  //操作
    let that = this;
    let index = e.currentTarget.dataset.index;
    let dsn = e.currentTarget.dataset.key;
    let lx = that.data.lx;
    if(lx=='2' || lx=='20' || lx=='21' || lx=='6'){
      if ( index == '1' ) {  //获取门锁信号
        if(lx=='2'){ //福州锁
          that.get_signal(dsn);  //获取门锁信号
        }
        else if(lx=='20' || lx=='21'){
          that.get_signalTX(dsn);  //获取门锁信号同欣
        }
        else if(lx=='6'){
          that.get_signalGM(dsn);  //获取门锁信号(国民)
        }
      }
    }
    else{
      wx.showToast({
        title: '该门锁无操作权限',
        icon: "none",
        duration: 2000
      })
      return false;    
    }
  },
  get_signal: function(dsn) {  //获取门锁信号
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '信号获取中...',
    })  
    var _dataNC = '{ac: "detail","deviceid":"'+dsn+'"}'
    wx.request({
      url: apiNC+'detail',
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
            showMB:true,  //显示幕布
          })  
        }
        else {
          if(res.data.code=='0'){
            wx.hideLoading();  //关闭提示框
            that.setData({
              showMB:true,  //显示幕布
            })
            var otp= "";
            var title = "门锁信号值";
            var dataV = res.data.data;       
            if(!dataV){
              console.log("超时——>>："+res.data.msg);
              wx.showToast({
                title: res.data.msg,
                icon: "none",
                duration: 2000
              }) 
            }
            else{
              otp = res.data.data.signalIntensity; 
              console.log("门锁信号值——>>："+otp);
              wx.showModal({
                title: title,
                showCancel: false,
                cancelText:'关闭',
                cancelColor:'red',
                confirmText:'返回',
                confirmColor:'#47a86c',
                content:otp,
                success: function(res) {
                }
              }) 
            }   
          }
          else{
            wx.showToast({
              title: res.data.msg,
              icon: "none",
              duration: 1000
            })
            that.setData({
              showMB:true,  //显示幕布
            })                  
          }
        }
      }
    });
  },
  get_signalTX: function(dsn) {  //获取门锁信号同欣
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '信号获取中...',
    })
    var _dataNC = '{ac: "gatewaySearchLockRssi","deviceid":"'+dsn+'","gatewayid":"'+gateway_id+'"}'
    wx.request({
      url: apiNC+'gatewaySearchLockRssi',
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
            showMB:true,  //显示幕布
          })  
        }
        else {
          if(res.data.resultCode=='0'){
            wx.hideLoading();  //关闭提示框
            that.setData({
              showMB:true,  //显示幕布
            })
            var otp= "";
            var title = "门锁信号值";   
            otp = "信号值:"+res.data.data.list[0].upRssi+", 信道:"+res.data.data.list[0].channel;
            console.log("门锁信号值——>>："+otp);
            wx.showModal({
              title: title,
              showCancel: false,
              cancelText:'关闭',
              cancelColor:'red',
              confirmText:'返回',
              confirmColor:'#47a86c',
              content:otp,
              success: function(res) {
              }
            })
          }
          else{
            wx.showToast({
              title: res.data.reason,
              icon: "none",
              duration: 1000
            })
            that.setData({
              showMB:true,  //显示幕布
            })                  
          }
        }
      }
    });
  },
  get_signalGM: function(dsn) {  //获取门锁信号(国民)
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '信号获取中...',
    })
    var _dataNC = '{ac: "gm_get_deviceInfo","deviceid":"'+dsn+'"}'
    wx.request({
      url: apiNC+'gm_get_deviceInfo',
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
            showMB:true,  //显示幕布
          })  
        }
        else {
          if(res.data.code=='0'){
            wx.hideLoading();  //关闭提示框
            that.setData({
              showMB:true,  //显示幕布
            })
            var otp= "";
            var title = "门锁信号值";   
            otp = "信号值: "+res.data.data.wifiRssi;
            console.log("门锁信号值——>>："+otp);
            wx.showModal({
              title: title,
              showCancel: false,
              cancelText:'关闭',
              cancelColor:'red',
              confirmText:'返回',
              confirmColor:'#47a86c',
              content:otp,
              success: function(res) {
              }
            })
          }
          else{
            wx.showToast({
              title: res.data.message,
              icon: "none",
              duration: 1000
            })
            that.setData({
              showMB:true,  //显示幕布
            })                  
          }
        }
      }
    });
  },
  onShow: function () {  //生命周期函数--监听页面显示
  }
})