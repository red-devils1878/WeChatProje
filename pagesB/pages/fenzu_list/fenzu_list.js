// pages/fenzu_list/fenzu_list.js
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl; 
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
          that.data.navH = res.statusBarHeight+45;  //导航高度
          that.setData( {
              winWidth: res.windowWidth,
              winHeight: res.windowHeight,
          });
      }
    });
    this.get_houseBelong_list();  //获取分组
  },
  get_houseBelong_list:function () { //获取分组
    let _this = this;
    var _data = {ac: 'get_houseBelong_list'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const fzlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            fzlist.push({
              "value":units[i].sid,
              "name":units[i].sname
            })
          }
          setTimeout(()=>{
            _this.setData({
              items:_this.data.servicelist.concat(fzlist)
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
  checkboxChange: function (e) {  //获取选中的值
    var fz = e.detail.value;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      mydata:{
        fz : fz
      }
    })
    wx.navigateBack({
      delta: 1,
    })
  },
  goToTop:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  scrollLoading:function(){ //滚动加载
    //this.get_houseBelong_list();  //获取分组
  },
  onReady: function () {  //生命周期函数--监听页面初次渲染完成
  }
})