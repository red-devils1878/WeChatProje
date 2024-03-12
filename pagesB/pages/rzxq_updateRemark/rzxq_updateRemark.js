// pages/rzxq_updateRemark/rzxq_updateRemark.js
var contractNo= "";  //合同号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    remark:'',
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    apiUrl = app.globalData.apiUrl;
    contractNo = options.contractNo;
  },
  formSave: function (e){  //修改备注
    var remark = e.detail.value.remark;
    var _data = {ac: 'remark_update',"contractNo":contractNo,"remark":remark};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '修改成功',
          icon: "success",
          duration: 500
        })
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
  onShow: function () {  //生命周期函数--监听页面显示
    var app = getApp();
    var remark_old=app.globalData.rzxq_remark; 
    this.setData({
      remark:remark_old
   })
  }
})