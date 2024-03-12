// pages/roomDescription/roomDescription.js
var dis = ""
var hid= "";  //房间id
var fjms = ""  //房间描述
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    disableT:'',
  },

  onLoad: function (options) { //生命周期函数--监听页面加载
    apiUrl = app.globalData.apiUrl;
    hid = options.hid;
    this.house_info(hid); //获取房间详情
  },
  house_info:function (hid) { //获取房间信息
    let _this = this;
    var _data = {ac: 'house_info',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          var describe = units[0].describe;
          var dis = ""
          if(!!describe){
            dis = "1"
          }
            _this.setData({
              fjms:describe,
              disableT:dis
            })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  formSave: function (e){  //修改房间描述
    var fjms = e.detail.value.fjms;
    var _data = {ac: 'fjms_update',"hid":hid,"fjms":fjms};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '修改成功',
          icon: "none"
        }),
        wx.navigateBack({
            delta: 1,
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  valueChange: function(e) {   //房间描述改变事件
    fjms = e.detail.value;
    if(!!fjms){
      dis = "1"
    }else{
      dis = ""
    }
    this.setData({
       disableT:dis
    })
  },
  onShow: function () {  //生命周期函数--监听页面显示
  }
})