var dsn= "";   //设备号
var userid= "";  //登录账号
var lylx= "";  //来源类型
var ptlx= "";  //通讯方式
var collectorSn= "";  //采集器编号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiDB = app.globalData.apiDB;   //电表指令api
Page({
  data: {

  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    dsn = options.dsn;
    apiUrl = app.globalData.apiUrl; 
    userid = app.globalData.userid;   //登陆人工号
    this.ammeter_info(dsn); //获取价格信息
  },
  ammeter_info:function (dsn) { //获取电表详情
    let _this = this;
    var _data = {ac: 'ammeter_info',"mac":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
            lylx = units[0].lx;
            ptlx = units[0].ptlx;
            collectorSn = units[0].collectorSn;
          _this.setData({
            price_j:units[0].sharp_price,
            price_f:units[0].peak_price,
            price_p:units[0].shoulder_price,
            price_g:units[0].off_peak_price,
          })
        }
      },
      fail(res) {
      },
      complete(){
      }
    });
  },
  jdjChange: function(e) {   //尖电价
    var jdj = 0;//电费单价
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
        jdj = e.detail.value;
    } else {
      wx.showToast({
        title: '单价只留2位小数',
        icon: "none",
        duration: 1000
      })
      jdj = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
        price_j:jdj
    })
  },
  fdjChange: function(e) {   //峰电价
    var fdj = 0;//峰电费单价
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
        fdj = e.detail.value;
    } else {
      wx.showToast({
        title: '单价只留2位小数',
        icon: "none",
        duration: 1000
      })
      fdj = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
        price_f:fdj
    })
  },
  pdjChange: function(e) {   //平电价
    var pdj = 0;//电费单价
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
        pdj = e.detail.value;
    } else {
      wx.showToast({
        title: '单价只留2位小数',
        icon: "none",
        duration: 1000
      })
      pdj = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
        price_p:pdj
    })
  },
  gdjChange: function(e) {   //谷电价
    var gdj = 0;//电费单价
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
        gdj = e.detail.value;
    } else {
      wx.showToast({
        title: '单价只留2位小数',
        icon: "none",
        duration: 1000
      })
      gdj = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
        price_g:gdj
    })
  },
  formSave: function (e){  //修改单价
    this.data.index = 1;
    var jdj = e.detail.value.jdj;
    var fdj = e.detail.value.fdj;
    var pdj = e.detail.value.pdj;
    var gdj = e.detail.value.gdj;
    if(!jdj){
      jdj = 0;
    }
    if(!fdj){
      fdj = 0;
    }
    if(!pdj){
      pdj = 0;
    }
    if(!gdj){
      gdj = 0;
    }
    if(ptlx=="BLE"){  //蓝牙电表
      let pages = getCurrentPages()
      let lastPage = pages[pages.length - 2]
      lastPage.suitPrice(this.data.index, [jdj, fdj, pdj, gdj])
      lastPage.setValue([jdj, fdj, pdj, gdj])
    }
    else if(ptlx=="485"){  //485电表
      let jk = '/qc/am/485/prepaid/setPeriodPrice';
      var _data = '{"concentratorAddr":"'+collectorSn+'","comAddr":"'+dsn+'","sharpPrice":"'+jdj+'","peakPrice":"'+fdj+'","shoulderPrice":"'+pdj+'","offPeakPrice":"'+gdj+'"}'
      wx.request({
       url: apiDB+jk,  //电表指令的api
       data: _data,
       header: {'Content-Type': 'application/json'},
       method: "POST",
       dataType: 'application/json',
       async:false,  //同步 
       success(res) {
        let _res = JSON.parse(res.data);
        if(!!_res.success ){
          wx.showToast({
            title: '设置成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            wx.navigateBack({
              delta: 1,
            })
          },1500)
        }
        else{
          wx.showToast({
            title: _res.msg,
            icon: "none",
            duration: 2000
          })
          console.log(_res.Code+'——>>'+_res.msg);
        }
       },
       fail(res) {
       },
       complete(){
       }
     });
    }
    else{
      wx.showToast({
        title: '开发中...',
        icon: "none",
        duration: 1000
      })
    }
  },
  onShow: function () { //生命周期函数--监听页面显示
  }
})