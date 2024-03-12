var houseNo= "";  //房源编号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  data: {  //页面的初始数据
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    houseNo = options.houseNo;
    //houseNo = "FN2207060158";
    apiUrl = app.globalData.apiUrl; 
    //获取当前设备的宽高
    wx.getSystemInfo( { 
        success: function( res ) {
            that.setData( {
                winWidth: res.windowWidth,
                winHeight: res.windowHeight,
            });
        }
    });
    this.publishRoom_list(houseNo);
  },
  publishRoom_list:function (houseNo) { //获取房间列表
    let _this = this;
    var _data = {ac: 'publishRoom_list',"houseNo":houseNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              room_list:units
            })
          },10)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  tapjump: function(e) {
    let _this = this;
    let hid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../../../pagesB/pages/room_next/room_next?hid='+hid
    })
  },
  goBack:function(){ //返回到房源列表
    let url = "";
    url = '../../../pages/room_list2/room_list2';
    if( !!url ){
      wx.switchTab({
        url: url
      })
    }
  },
  onShow: function () {  //生命周期函数--监听页面显示

  }
})