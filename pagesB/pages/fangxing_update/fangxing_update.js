var houseNo = ""; //房源编号
var fxid = ""; //房型id
var cxQJ = [];  //朝向数组
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  data: {  //页面的初始数据
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
    cxIndex: 0,
    multiIndex: [1, 1, 1],
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    houseNo = options.houseNo;
    fxid = options.fxid;
    //houseNo = "FN2207070161";
    //fxid = "30";
    //获取当前设备的宽高
    wx.getSystemInfo( { 
        success: function( res ) {
          that.setData( {
            winWidth: res.windowWidth,
            winHeight: res.windowHeight,  
          });
        }
    });
    that.get_fwpzList(); //房屋配置列表
    that.get_cxList(); //朝向
    that.get_fangxing(); //获取房型
    that.get_fxInfo(houseNo,fxid); //房型详情
  },
  get_cxList:function () { //朝向
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_chaoxiang'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          cxQJ = units;
          setTimeout(()=>{
            _this.setData({
              cx:units
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
  get_fwpzList:function () { //房屋配置列表
    let _this = this;
    var _data = {ac: 'get_fwpzList'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              servicelist:units
            })
          },100)
      },
      fail(res) {
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      },
      complete(){
      }
    });  
  },
  get_fangxing:function () { //获取房型
    let _this = this;
    var _data = {ac: 'get_fangxing'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          console.log("getunits success:",res); 
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              multiArray:units
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
  get_fxInfo:function (houseNo,id) { //获取房型详情
    let _this = this;
    var _data = {ac: 'get_fxInfo',"houseNo":houseNo,"id":id};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          var CountS = units[0].CountS_d2;
          var CountT = units[0].CountT_d2;
          var CountW = units[0].CountW_d2;
          if(CountS==""){ CountS = 1; }
          else { CountS = CountS*1; }
          if(CountT==""){ CountT = 1; }
          else { CountT = CountT*1; }
          if(CountW==""){ CountW = 1; }
          else { CountW = CountW*1; }
          _this.setData({
            id:units[0].id2,
            cxIndex:_this.get_indexYW(cxQJ,units[0].orientation_d2),  
            area:units[0].roomArea_d2,
            rent:units[0].rent_d2,
            fxmc:units[0].room_name,
            multiIndex:[CountS,CountT,CountW],
            fwpz:units[0].fwpz_d2,
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
  bindCXChange: function(e) {  //朝向事件
    this.setData({
        cxIndex: e.detail.value
    })
  },
  bindMultiPickerChange: function (e) {  //户型事件
    this.setData({
      multiIndex: e.detail.value
    })
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
  formSubmit: function (e){  //保存数据
    let that = this;
    var id = e.detail.value.id2;
    var fxmc = e.detail.value.fxmc;
    var fangxing = e.detail.value.fangxing;
    var cx = e.detail.value.cx;
    var area = e.detail.value.area;
    var rent = e.detail.value.rent;
    var sb = e.detail.value.sb;
    if(!fxmc){ 
      wx.showToast({
        title: '房型名称必填',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else if(!rent || rent<=0){ 
      wx.showToast({
        title: '租金必须大于0',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else if(!area || area<=0){ 
      wx.showToast({
        title: '面积必须大于0',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    var mx_sb = "";
    var sb_length = sb.length;
    for(let i = 0; i < sb_length; i++){
      if(i==sb_length-1){
        mx_sb += sb[i];
      }
      else{
        mx_sb += sb[i] + ",";
      }
    }
    var _data = {ac: 'fangxing_update',"id":id,"fxmc":fxmc,"fangxing":fangxing,"cx":cx,"area":area,"rent":rent,"mx_sb":mx_sb};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=='1'){
           wx.showToast({
              title: '修改成功',
              icon: "success",
              duration: 1000
          })
          setTimeout(()=>{
              wx.navigateBack({
              delta: 1,
            }) 
          },1000)
        }
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