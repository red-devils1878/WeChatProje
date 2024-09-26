var app = getApp();
var apiUrl = "";   //获取api地址
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData:[], 
    qtfyData:[], 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    apiUrl = app.globalData.apiUrl; 
    //获取当前设备的宽高
    wx.getSystemInfo({ 
      success: function( res ) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  onShow: function () { // 生命周期函数--监听页面显示

  }
})