// pages/configureRoom/configureRoom.js
var houseNo = ""; //房间id
var yxfj = "";    //已选房间id
var roomNo = "";    //已选房间
var first_fxid = "" //第一条房型id
var cxQJ = [];  //朝向数组
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  data: {  //页面的初始数据
    navH:0,
    winWidth: 0,
    winHeight: 0,
    servicelist:[],
    cxIndex: 0,
    fxIndex: 0,
    multiIndex: [1, 1, 1],
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    houseNo = options.houseNo;
    yxfj = options.yxfj;
    roomNo = options.roomNo;
    //houseNo = "FN2207070161";
    //yxfj = "10357,10358,10359";
  //获取当前设备的宽高
   wx.getSystemInfo( { 
    success: function( res ) {
      that.setData( {
         winWidth: res.windowWidth,
         winHeight: res.windowHeight,       
      });
    }
   });
    that.setData( {
      roomNo: roomNo, 
    });
    that.get_fxList(houseNo); //获取房型列表
    that.get_cxList(); //朝向
  },
  get_fxList:function (houseNo) { //获取房型列表
    let _this = this;
    var _data = {ac: 'get_fxList',"houseNo":houseNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        const newlist = [];
        var units = res.data.rows;
        for (var i = 0; i < units.length; i++) {
          newlist.push({
            "id":units[i].id2,
            "name":units[i].room_name,
            "roomArea":units[i].roomArea_d2,
            "cx_name":units[i].cx_name,
            "cx":units[i].orientation_d2,
            "fxName":units[i].CountS_d2+'室'+units[i].CountT_d2+'厅'+units[i].CountW_d2+'卫'+' — '+units[i].roomArea_d2+'㎡'
          })
        }
        _this.setData({
          servicelist:newlist,
        })
        if(units.length > 0){
          first_fxid = units[0].id2;
          _this.get_fxInfo(houseNo,first_fxid); //房型详情
        }
      },
      fail(res) {

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
          _this.setData({
            id:units[0].id2,
            cxIndex:_this.get_indexYW(cxQJ,units[0].orientation_d2),  
            area:units[0].roomArea_d2,
            rent:units[0].rent_d2,
            room_name:units[0].room_name,
            S:units[0].CountS_d2,
            T:units[0].CountT_d2,
            W:units[0].CountW_d2,
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
  bindFXChange: function(e) {  //房型事件
    var that = this; 
    this.setData({
      fxIndex: e.detail.value
    })
    let fxid = this.data.servicelist[e.detail.value].id;
    that.get_fxInfo(houseNo,fxid); //房型详情
  },
  bindCXChange: function(e) {  //朝向事件
    this.setData({
      cxIndex: e.detail.value
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
  addFX:function(e){  //添加房型
    wx.navigateTo({
      url: '../../../pagesB/pages/fangxing_add/fangxing_add?houseNo='+houseNo
    })
  },
  update:function(e){  //修改房型
    let fxid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../../../pagesB/pages/fangxing_update/fangxing_update?houseNo='+houseNo+'&fxid='+fxid
    })
  },
  del:function(e){  //删除房型
    let that =this;
    let fxid = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除房型',
      content: '确认删除？',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          var _data = {ac: 'get_fxToRoom',"fxid":fxid};
          wx.request({
            url: apiUrl,
            data: _data,
            header: {'Content-Type': 'application/json'},
            method: "get",
            success(res) {
              var units = res.data.rows;
              if(units.length > 0){
                let qty = units.length;
                wx.showToast({
                  title: '该房型下存在'+qty+'个房间，请先将这些房间移到其他房型下后，再进行删除',
                  icon: "none",
                  duration: 1500
                });
              }
              else{
                var _data = {ac: 'fangxing_del',"fxid":fxid};
                wx.request({
                  url: apiUrl,
                  data: _data,
                  header: {'Content-Type': 'application/json'},
                  method: "get",
                  success(res) {
                    wx.showToast({
                      title: '删除成功',
                        icon: "success",
                        duration: 500//持续的时间
                      });
                      setTimeout(()=>{
                        that.get_fxList(houseNo); //获取房型列表
                    },1000)
                  },
                  fail(res) {
                    console.log("getunits fail:",res);
                  },
                  complete(){
                  }
                });
              }            
            },
            fail(res) {
              console.log("getunits fail:",res);
            },
            complete(){
            }
          });



          /*
          var _data = {ac: 'fangxing_del',"fxid":fxid};
          wx.request({
            url: apiUrl,
            data: _data,
            header: {'Content-Type': 'application/json'},
            method: "get",
            success(res) {
              wx.showToast({
                title: '删除成功',
                  icon: "success",
                  duration: 500//持续的时间
                });
                setTimeout(()=>{
                  that.get_fxList(houseNo); //获取房型列表
              },1000)
            },
            fail(res) {
              console.log("getunits fail:",res);
            },
            complete(){
            }
          });
          */
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
  formSubmit: function (e){  //保存数据
    var id2 = e.detail.value.id2;
    var cx = e.detail.value.cx;
    var area = e.detail.value.area;
    var rent = e.detail.value.rent;
    var S = e.detail.value.S;
    var T = e.detail.value.T;
    var W = e.detail.value.W;
    var fwpz = e.detail.value.fwpz;
    var room_name = e.detail.value.room_name;
    if(!id2) {id2 = "" }
    if(!S) {S = "" }
    if(!T) {T = "" }
    if(!W) {W = "" }
    if(!fwpz) {fwpz = "" }
    if(!room_name) {room_name = "" }
    if(!rent || rent<=0){ 
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
    var _data = {ac: 'fwpz_update',"houseNo":houseNo,"yxfj":yxfj,"id2":id2,"cx":cx,"area":area,"rent":rent,"S":S,"T":T,"W":W,"fwpz":fwpz,"room_name":room_name};
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
    var that = this;
    that.get_fxList(houseNo); //获取房型列表
  }
})