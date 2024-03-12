// pages/energy_list/energy_list.js
var hid= "";   //房间id
var sfdj = 0;  //水费单价
var dfdj = 0;  //电费单价
var rqdj = 0;  //燃气单价
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
   navH:0
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
  //swiper设置高度
  apiUrl = app.globalData.apiUrl; 
  this.navHeight();
  hid = options.hid;
  this.price_info(); //获取价格信息
  },
  navHeight: function () {
    var that = this;
    //获取手机系统信息
    wx.getSystemInfo({
      success: (res) => {
        //导航高度
        that.data.navH = res.statusBarHeight+45;
        that.setData({navH:res.statusBarHeight+45})
      },fail(err){
      console.log(err);
      }
    })
  },
  tapInfo: function(e) {
    let _this = this;
    let index = e.currentTarget.dataset.index;
    if (index == '1') {
      wx.navigateBack({
        changed:true
      })
    } else if ( index == '2' ) {
      wx.navigateTo({
        url: '../../../pagesB/pages/price_update/price_update?hid='+hid
      })
    }
  },
  price_info:function () { //获取价格信息
    let _this = this;
    var _data = {ac: 'get_priceInfo',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          sfdj = units[0].cWater_price,
          dfdj = units[0].ele_price,
          rqdj = 0,
            _this.setData({
              price_sf:units[0].cWater_price,
              use_sl:'暂无数据',
              amount_sl:'暂无数据',
              price_df:units[0].ele_price,
              use_dl:'暂无数据',
              amount_dl:'暂无数据',
              price_rq:0,
              use_rq:'暂无数据',
              amount_rq:'暂无数据',
              price_wy:0,
              price_kd:0,
            })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  bindSF: function () { //水费抄表
    let _this = this;
    var _data = {ac: 'get_energyUse',"hid":hid,"LX":"1"};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
            _this.setData({
              use_sl:units[0].qty=="" ? "暂无数据":units[0].qty,
              amount_sl:units[0].qty=="" ? "暂无数据":(units[0].qty*sfdj).toFixed(2)
            })
      },
      fail(res) {
        console.log("getunits fail:",res);
        _this.setData({
          use_sl:'暂无数据',
          amount_sl:'暂无数据'
        })
      },
      complete(){
      }
    });  
  },
  bindDF: function () { //电费抄表
    let _this = this;
    var _data = {ac: 'get_energyUse',"hid":hid,"LX":"2"};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
            _this.setData({
              use_dl:units[0].qty=="" ? "暂无数据":units[0].qty,
              amount_dl:units[0].qty=="" ? "暂无数据":(units[0].qty*dfdj).toFixed(2)
            })
      },
      fail(res) {
        console.log("getunits fail:",res);
        _this.setData({
          use_sl:'暂无数据',
          amount_sl:'暂无数据'
        })
      },
      complete(){
      }
    });
  },
  bindRQ: function () { //燃气费抄表
    let _this = this;
    var _data = {ac: 'get_energyUse',"hid":hid,"LX":"3"};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
            _this.setData({
              use_rq:units[0].qty=="" ? "暂无数据":units[0].qty,
              amount_rq:units[0].qty=="" ? "暂无数据":(units[0].qty*rqdj).toFixed(2)
            })
      },
      fail(res) {
        console.log("getunits fail:",res);
        _this.setData({
          use_sl:'暂无数据',
          amount_sl:'暂无数据'
        })
      },
      complete(){
      }
    });
  },
  onShow: function () { //生命周期函数--监听页面显示
    this.price_info(); //获取价格信息
  },
  onPullDownRefresh: function () { //页面相关事件处理函数--监听用户下拉动作
  }
})