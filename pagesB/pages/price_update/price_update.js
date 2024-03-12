var hid= "";   //房间id
var userid= "";  //登录账号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {

  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    hid = options.hid;
    apiUrl = app.globalData.apiUrl; 
    userid = app.globalData.userid;   //登陆人工号
    this.price_info(hid); //获取价格信息
  },
  price_info:function (hid) { //获取价格信息
    let _this = this;
    var _data = {ac: 'get_priceInfo',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
            _this.setData({
              price_sf:units[0].cWater_price,
              price_df:units[0].ele_price,
              price_rq:0,
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
  sfChange: function(e) {   //水费改变事件
    var sfdj = 0;//水费单价
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      sfdj = e.detail.value;
    } else {
      wx.showToast({
        title: '单价只留2位小数',
        icon: "none",
        duration: 1000
      })
      sfdj = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      price_sf:sfdj
    })
  },
  dfChange: function(e) {   //电费改变事件
    var dfdj = 0;//电费单价
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      dfdj = e.detail.value;
    } else {
      wx.showToast({
        title: '单价只留2位小数',
        icon: "none",
        duration: 1000
      })
      dfdj = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      price_df:dfdj
    })
  },
  formSave: function (e){  //修改单价
    var sf = e.detail.value.sf;
    var df = e.detail.value.df;
    if(!sf){
      sf = 0;
    }
    if(!df){
      df = 0;
    }
    //var rqf = e.detail.value.rqf;
    //var wyf = e.detail.value.wyf;
    //var kdf = e.detail.value.kdf;
    var rqf =0
    var wyf = 0;
    var kdf = 0;
    var _data = {ac: 'priceInfo_update',"userid":userid,"hid":hid,"sf":sf,"df":df,"rqf":rqf,"wyf":wyf,"kdf":kdf};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '修改成功',
          icon: "success",
          duration: 1000
        }),
        setTimeout(()=>{
          wx.navigateBack({
            delta: 1,
        })
        },1500)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  onShow: function () { //生命周期函数--监听页面显示
  }
})