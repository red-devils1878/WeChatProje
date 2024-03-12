var dis = ""
var orderNo= "";  //工单号
var cljg = ""  //处理结果
var app = getApp();
var apiUrl = app.globalData.apiUrl_LS;   //获取api地址
Page({
  data: {
    disableT:'',
  },

  onLoad: function (options) { //生命周期函数--监听页面加载
    orderNo = options.orderNo;
    this.workOrder_info(orderNo); //获取房间详情
  },
  workOrder_info:function (orderNo) { //获取房间信息
    let _this = this;
    var _data = {ac: 'workOrder_info',"orderNo":orderNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          console.log("getunits success:",res); 
          var units = res.data.rows;
          var clgc = units[0].clgc;
          var dis = ""
          if(!!clgc){
            dis = "1"
          }
            _this.setData({
              cljg:clgc,
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
  formSave: function (e){  //保存结果
    var cljg = e.detail.value.cljg;
    var _data = {ac: 'clgc_update',"orderNo":orderNo,"cljg":cljg};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '保存成功',
          icon: "success",
          duration: 1000
        }),
        setTimeout(()=>{
          wx.navigateBack({
            delta: 1,
        }) 
        },1000)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  valueChange: function(e) {   //房间描述改变事件
    cljg = e.detail.value;
    if(!!cljg){
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