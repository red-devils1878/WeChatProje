var search= "";  //搜索内容
var mysl = 30; //每页数量
var page_total = 0; //总页数
var fyQJ = [];  //房源数组
var app = getApp();
var apiUrl = app.globalData.apiUrl_LS;   //获取api地址
Page({
  data: {
    searchtext:'',  //搜索文字
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0  //分页
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
    //this.get_prd_list(search);  //获取分组
  },
  get_prd_list:function (search) { //获取分组
    let _this = this;
    fyQJ = [];  //初始化数组
    _this.setData({
      servicelist:[]
    })
    this.setData({
      page:1
    })
    const page = this.data.page;
    var tips = "加载中...";
    wx.showLoading({
     title: tips,
    })
    var _data = {ac: 'get_prd_list',"search":search};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.hideLoading();
        const fzlist = [];
        var units = res.data.rows;
        var qty_total = units.length; //总条数
        if(qty_total > 0){
          fyQJ = units;
          page_total = Math.ceil(qty_total/mysl);  //总页数
          var qty = 0;
          if(qty_total > page*mysl){
            qty = page*mysl;
          }
          else{
            qty = qty_total;
          }
          for (var i = (page-1)*mysl; i < qty; i++) {
            fzlist.push({
              "value":units[i].prd_no,
              "name":units[i].prd_name
            })
          }                        
        }
        setTimeout(()=>{
          _this.setData({
            servicelist:fzlist
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
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      searchtext:e.detail.value
    })
    //search = e.detail.value;
    //this.get_prd_list(search);  //获取分组
  },
  submitSearch:function(){  //提交搜索
    search = this.data.searchtext;
    if(!search){
        wx.showToast({
            title: '输入搜索条件',
            icon: 'none'
        })
    }else{
        this.get_prd_list(search);  //获取分组
    }
  },
  goToTop:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  scrollLoading:function(){ //滚动加载
    this.loadMoreData();
  },
  loadMoreData: function () {
    var _this = this
    var currentPage = _this.data.page; // 获取当前页码
    currentPage += 1; // 加载当前页面的下一页数据
    if(currentPage > page_total){
      wx.showToast({
        title: '没有更过数据',
        icon: 'none'
      })
    }
    else{
      var tips = "加载中...";
      wx.showLoading({
        title: tips,
      })
      wx.hideLoading();
      const fzlist = [];
      var units = fyQJ;
      var qty_total = units.length; //总条数
      if(qty_total > 0){
        var qty = 0;
        if(qty_total > currentPage*mysl){
          qty = currentPage*mysl;
        }
        else{
          qty = qty_total;
        }
        for (var i = (currentPage-1)*mysl; i < qty; i++) {
          fzlist.push({
            "value":units[i].prd_no,
            "name":units[i].prd_name
          })
        }               
      }
      setTimeout(()=>{
        _this.setData({
          servicelist:_this.data.servicelist.concat(fzlist),
          page: currentPage
        })
      },10)
    }
  },
  onReady: function () {  //生命周期函数--监听页面初次渲染完成
  }
})