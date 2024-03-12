// pages/htDlg_list/htDlg_list.js
var search= "";  //搜索内容
var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    showsearch:true,   //显示搜索按钮
    searchtext:'',  //搜索文字
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    search = "";
    apiUrl = app.globalData.apiUrl;
    userid = app.globalData.userid;   //登陆人工号
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
    this.get_contract_list(userid,search);  //获取合同
  },
  get_contract_list:function () { //获取合同
    let _this = this;
    var _data = {ac: 'tenant_list',"userid":userid,"search":search};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const fylist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            fylist.push({
              "value":units[i].contractNo,
              "name":units[i].houseName+'.'+units[i].tenantName+'.'+units[i].htzt_name
            })
          }
          setTimeout(()=>{
            _this.setData({
              items:fylist
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
    var ht = e.detail.value;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      mydata:{
        ht : ht
      }
    })
    wx.navigateBack({
      delta: 1,
    })
  },
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      showsearch:1,
      searchtext:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    search = this.data.searchtext;
    this.get_contract_list(userid,search);  //获取合同
  },
  goToTop:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  scrollLoading:function(){ //滚动加载
    //this.get_contract_list(userid,search);  //获取合同
  }
})