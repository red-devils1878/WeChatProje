// pages/checkOut_remark/checkOut_remark.js
var dis = ""
var tzNo= "";   //退租编号
var fjms = ""  //退租备注
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    disableT:'',
  },

  onLoad: function (options) { //生命周期函数--监听页面加载
    apiUrl = app.globalData.apiUrl; 
    tzNo = options.tzNo;
    this.tzsp_info(tzNo); //获取退租详情
  },
  tzsp_info:function (tzNo) { //获取退租详情
    let _this = this;
    var _data = {ac: 'tzsp_info',"tzNo":tzNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          var remark = units[0].remark;
          var dis = ""
          if(!!remark){
            dis = "1"
          }
            _this.setData({
              fjms:remark,
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
  formSave: function (e){  //修改退租备注
    var tzbz = e.detail.value.fjms;
    var _data = {ac: 'tzbz_update',"tzNo":tzNo,"tzbz":tzbz};
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