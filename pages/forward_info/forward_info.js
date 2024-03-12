// pages/forward_info/forward_info.js
var LY = ""
Page({
  data: {  //页面的初始数据
    title:"", //标题
    imgUrl:"", //图片路径
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    var dsn = options.dsn; //设备号
    LY = options.LY;
    console.log("来源"+LY);
    console.log("设备号"+dsn);
    if(LY=="GJ"){  //管家端
      that.setData({
        title: "朗思管家端",
        imgUrl: '/static/images/butlerQR.jpg',
        appId: 'wx39611dc785024339',
        path: '/pages/home/home', 
        envVersion: 'trial', 
      });
    }
    else if(LY=="ZK"){  //租客端
      that.setData({
        title: "朗思租客端",
        imgUrl: '/static/images/tenantQR.jpg',
        appId: 'wx5823704502996153',
        path: '/pages/home/home?dsn='+dsn, 
        envVersion: 'trial', 
      });
    }
    else if(LY=="YZ"){  //业主端
      that.setData({
        title: "朗思业主端",
        imgUrl: '/static/images/ownerQR.jpg',
        appId: 'wx1c61bafc36e672b6',
        path: '/pages/home/home', 
        envVersion: 'trial', 
      });
    }
    else if(LY=="FW"){  //服务端
      that.setData({
        title: "朗思服务端",
        imgUrl: '/static/images/serverQR.jpg',
        appId: 'wx04975f7fbe71f36d',
        path: '/pages/workOrder_taking/workOrder_taking?orderNo='+dsn, 
        envVersion: 'trial', 
      });
    }
    else if(LY=="ZD"){  //租客端
      that.setData({
        title: "支付账单",
        imgUrl: '/static/images/my/reward.png',
        appId: 'wx5823704502996153',
        path: '/pages/zfzd_info/zfzd_info?fid='+dsn, 
        envVersion: 'release',  //develop开发版；trial体验版；release正式版
      });
    }
  },
  clickImg: function () {
    if(LY=="GJ"){  //管家端
      wx.previewImage({
        urls: ['/static/images/butlerQR.jpg'],
      })
    }
    else if(LY=="ZK"){  //租客端
      wx.previewImage({
        urls: ['/static/images/tenantQR.jpg'],
      })
    }
    else if(LY=="YZ"){  //业主端
      wx.previewImage({
        urls: ['/static/images/ownerQR.jpg'],
      })
    }
    else if(LY=="FW"){  //服务端
      wx.previewImage({
        urls: ['/static/images/serverQR.jpg'],
      })
    }
    else if(LY=="ZD"){  //账单
      wx.previewImage({
        urls: ['/static/images/my/reward.png'],
      })
    }
  },
  onShow: function () {  //生命周期函数--监听页面显示
    wx.hideHomeButton();
  },
  onUnload: function () {  //生命周期函数--监听页面卸载
  },
  onShareAppMessage: function () {  //用户点击右上角分享
  }
})