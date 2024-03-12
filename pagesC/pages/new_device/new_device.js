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
      if ( index == '01' ) {  //水表绑定
        url = '../../../pagesC/pages/roomSB_list/roomSB_list';
      }else if ( index == '02' ) {  //水表采集器
        let cjqlx = "sb"; //水表采集器
        url = '../../../pagesC/pages/roomCollector_list/roomCollector_list?cjqlx='+cjqlx;
      }else if ( index == '03' ) {  //水表关联
        let cjqlx = "sb"; //水表采集器
        url = '../../../pagesC/pages/relation_list/relation_list?cjqlx='+cjqlx;
      }else if ( index == '04' ) {  //电表绑定
        url = '../../../pagesC/pages/roomDB_list/roomDB_list';
      }else if ( index == '05' ) {  //电表采集器
        let cjqlx = "db"; //电表采集器
        url = '../../../pagesC/pages/roomCollector_list/roomCollector_list?cjqlx='+cjqlx;
      }else if ( index == '06' ) {  //电表关联
        let cjqlx = "db"; //电表采集器
        url = '../../../pagesC/pages/relation_list/relation_list?cjqlx='+cjqlx;
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