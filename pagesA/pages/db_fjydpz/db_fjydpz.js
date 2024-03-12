var dsn= "";  //设备号
var hid= "";  //房间id
var faQJ = [];  //方案数组
var ffQJ = [];  //付费数组
var app = getApp();
var apiUrl = "";   //获取api地址
Page({

  data: {  //页面的初始数据
    faIndex: 0,
    ffIndex: 0
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    dsn = options.dsn;
    //dsn = "NL0909798";
    that.get_ffms();  //获取付费模式
    that.get_plan('db');  //获取电价方案
    that.get_houseInfo(dsn,'db'); //获取房间详情
  },
  get_ffms:function () { //获取付费模式
    let _this = this;
    var _data = {ac: 'Ebasic_other',otherid:'fufei_moshi'};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        ffQJ = units;
        setTimeout(()=>{
            _this.setData({
              ffms:units
            })
        },100)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_plan:function (sblx) { //获取电价方案
    let _this = this;
    var _data = {ac: 'get_plan',"sblx":sblx};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        faQJ = units;
        setTimeout(()=>{
            _this.setData({
               plan:units
            })
        },100)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_houseInfo:function (dsn,sblx) { //获取房间详情
    let _this = this;
    var _data = {ac: 'get_houseInfo',"dsn":dsn,"sblx":sblx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            hid = units[0].hid,
            _this.setData({
              faIndex:_this.get_indexYW(faQJ,units[0].electric),
              ffIndex:_this.get_indexYW(ffQJ,units[0].ele_type),
            })
          }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  //获取一维数组下标
  get_indexYW:function(arrayName,code){
    let arrtofor=arrayName;
    for (let index = 0; index < arrtofor.length; index++) {
      if(arrtofor[index].code==code){
        return index;
      }
    }
  },
  bindFAChange: function(e) {
    this.setData({
        faIndex: e.detail.value
    })
  },
  bindFFChange: function(e) {
    this.setData({
        ffIndex: e.detail.value
    })
  },
  formSubmit: function (e){  //保存数据
    var plan = e.detail.value.plan;
    var ffms = e.detail.value.ffms;
    let sblx = 'db';
    var _data = {ac: 'fjydpz_update',"hid":hid,"plan":plan,"ffms":ffms,"sblx":sblx};
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
        setTimeout(function () {
            wx.navigateBack({
                delta: 1,
            })   
        }, 1000);
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  onShow: function () {  //生命周期函数--监听页面显示

  }
})