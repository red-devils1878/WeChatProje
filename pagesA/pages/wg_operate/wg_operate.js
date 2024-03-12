var gatewaySn= "";  //设备号
var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var aiotAPI = app.globalData.aiotAPI;   //获取api地址
var ptlx = "";//供应商类型
var verVlue = 1.12;//网关版本
Page({

  data: {  //页面的初始数据
    winWidth: 0,
    winHeight: 0,
    detail_yd:true,
    arrow_yd: 'arrow_bottom',
    showMB:true, //幕布
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    gatewaySn = options.gatewaySn;
    apiUrl = app.globalData.apiUrl;   //获取api地址
    aiotAPI = app.globalData.aiotAPI;   //获取api地址
    userid = app.globalData.userid;   //登陆人工号
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          yhid:userid,
        });
      }
    });
    that.get_wgInfo(gatewaySn);  //获取设备详情
  },
  get_wgInfo:function (gatewaySn) { //获取设备详情
    let _this = this;
    var _data = {ac: 'gateway_Info',"gatewaySn":gatewaySn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          ptlx = units[0].ptlx;
          let verS = units[0].appVersion;
          let insexs = verS.indexOf("V");
          if(insexs>-1){
            verVlue = verS.substring(insexs+1,verS.length);
          }
          console.log("版本号："+verVlue);
          _this.setData({
            dsn:units[0].equip_no,
            mc:units[0].equip_name,    
            zt:units[0].online_status, 
            appVersion:units[0].appVersion,
            hardwareVersion:units[0].hardwareVersion,    
            online_time:units[0].online_time, 
            ptlx:units[0].ptlx, 
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
  tapDB: function(e) {  //网关
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let dsn = e.currentTarget.dataset.key;
    if ( index == '2' ) {  //用电
      let arrow_yd="arrow_bottom";
      let yd=!this.data.detail_yd;
      if(yd){
        arrow_yd = "arrow_bottom";
      }
      else{
        arrow_yd = "arrow_top";
      }
      _this.setData({
        detail_yd:yd,
        arrow_yd:arrow_yd
      })    
    }
  },
  tapYD: function(e) {  //操作
    let that = this;
    let index = e.currentTarget.dataset.index;
    let wgNo = e.currentTarget.dataset.key;
    if(ptlx!='mf'){
      wx.showToast({
        title: '该网关无操作权限',
        icon: "none",
        duration: 2000
      })
      return false;
    }
    if ( index == '1' ) {  //获取网关信号
      that.get_signal(wgNo);   
    }else if ( index == '2' ) {  //重启网关
      that.Restart(wgNo);  
    }else if ( index == '3' ) {  //获取网关版本
      that.get_Version(wgNo);   
    }
  },
  get_signal: function(wgNo) {  //获取网关信号
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '信号获取中...',
    })  
    var _dataNC = '{ac: "wifi","gatewaySn":"'+wgNo+'"}'
    wx.request({
      url: aiotAPI + 'gateway/wifi',  //api地址
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
            var title = "网关信号值";
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
              otp = res.data.data.signalStrength; 
              console.log("网关信号值——>>："+otp);
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
  get_Version: function(wgNo) {  //获取网关版本
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '版本获取中...',
    })  
    var _dataNC = '{ac: "firmware_version","gatewaySn":"'+wgNo+'"}'
    wx.request({
      url: aiotAPI + 'gateway/firmware_version',  //api地址
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
            var title = "网关版本号";
            var otp = res.data.data.firmwareversion;
            console.log("网关版本号——>>："+otp);
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
  Restart: function(wgNo) {  //重启网关
    var that = this;
    if(verVlue*1 < 1.21){
      wx.showToast({
        title: '1.21及版本网关才能重启',
        icon: "none",
        duration: 2000
      })
      return false;
    }
    wx.showModal({
      title: '重启网关',
      content: '是否确认重启网关',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          that.setData({
            showMB:false,  //显示幕布
          })
          wx.showLoading({
            title: '网关重启中...',
          })  
          var _dataNC = '{ac: "restart_sync","gatewaySn":"'+wgNo+'"}'
          wx.request({
            url: aiotAPI + 'gateway/restart_sync',  //api地址
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
                  wx.showToast({
                    title: '重启成功',
                    icon: "success",
                    duration: 2000
                  })
                  that.setData({
                    showMB:true,  //显示幕布
                  })
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
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  onShow: function () {  //生命周期函数--监听页面显示

  }
})