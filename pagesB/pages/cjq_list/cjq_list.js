var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var userid= "";  //登陆人工号
var search= "";  //搜索内容
Page({
  data: {
    searchtext:'',  //搜索文字
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
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
    apiUrl = app.globalData.apiUrl; 
    userid = app.globalData.userid;   //登陆人工号
    this.get_cjqList(search);  //获取采集器
  },
  get_cjqList:function () { //获取采集器
    let _this = this;
    var _data = {ac: 'get_cjqList',"userid":userid,"search":search};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const cjqlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            cjqlist.push({
              "value":units[i].spider_id,
              "name":units[i].spider_id
            })
          }
          setTimeout(()=>{
            _this.setData({
              items:cjqlist
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
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      searchtext:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    search = this.data.searchtext;
    this.get_cjqList(search);  //获取采集器
  },
  checkboxChange: function (e) {  //获取选中的值
    var cjq = e.detail.value;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      mydata:{
        cjq : cjq
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
  },
  onReady: function () {  //生命周期函数--监听页面初次渲染完成
  }
})