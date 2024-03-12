Page({
    data: {   //页面的初始数据
      winWidth: 0,
      winHeight: 0,
    },
    onLoad: function (options) {  //生命周期函数--监听页面加载
      var that = this;
      //获取当前设备的宽高
      wx.getSystemInfo( { 
        success: function( res ) {
          that.setData( {
            winWidth: res.windowWidth,
            winHeight: res.windowHeight
          });
        }
      });
    },
    tapEvent: function(e) {
      let _this = this;
      let index = e.currentTarget.dataset.index;
      let url = "";
      if ( index == '01' ) {  //门锁绑定
        url = '../../../pagesC/pages/ms_bind/ms_bind';
      }else if ( index == '02' ) {  //水表绑定
        url = '../../../pagesC/pages/sb_bind/sb_bind';
      }else if ( index == '03' ) {  //电表绑定
        url = '../../../pagesC/pages/db_bind/db_bind';
      }
      if( !!url ){
        wx.navigateTo({
          url: url
        })
      }
    },
    onShow: function () {  //生命周期函数--监听页面显示
    }
})