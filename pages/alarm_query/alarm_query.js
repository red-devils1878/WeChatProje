var bjlx= "";  //报警类型
var search= "";  //搜索内容
var dsn= "";  //设备号
var tabV = 0;
var mysl = 10; //每页数量
var page_total = 0; //总页数
var fyQJ = [];  //数组
var app = getApp();
var apiUrl = "";   //获取api地址

Page({

  data: {   //页面的初始数据
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    showsearch:true,   //显示搜索按钮
    searchtext:'',  //搜索文字
    showfilter:false, //是否显示下拉筛选
    showfilterindex:null, //显示哪个筛选类目
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    bjlx= "报警";  //报警类型
    dsn = options.dsn;
    var that = this;
    apiUrl = app.globalData.apiUrl; 
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    that.get_alarmList(bjlx,search,dsn);  //报警列表
  },
  //  tab切换逻辑
  swichNav: function( e ) {
    var that = this;
    if( this.data.currentTab === e.target.dataset.current ) {
        return false;
    } else {
        var tabV = e.target.dataset.current;
        if(tabV=="0"){
            bjlx = "报警"
        }else if(tabV=="1"){
            bjlx = "挟持报警"
        }else if(tabV=="2"){
            bjlx = "门铃报警"
        }
        this.get_alarmList(bjlx,search,dsn);  //报警列表
        that.setData( {
          currentTab: e.target.dataset.current
        })
    }
  },
  bindChange: function( e ) {
    var that = this;
    tabV = e.detail.current;
    that.setData( { 
      currentTab: e.detail.current 
    });
    if(tabV=="0"){
        bjlx = "报警"
    }else if(tabV=="1"){
        bjlx = "挟持报警"
    }else if(tabV=="2"){
        bjlx = "门铃报警"
    }
    that.get_alarmList(bjlx,search,dsn);  //报警列表
  },
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      showsearch:1,
      searchtext:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    search = this.data.searchtext;
    this.get_alarmList(bjlx,search,dsn);  //报警列表
  },
  hideFilter: function(){ //关闭筛选面板
    this.setData({
      showfilter: false,
      showfilterindex: null
    })
  },
  get_alarmList:function (bjlx,search,dsn) { //报警列表
    let _this = this;
    fyQJ = [];  //初始化房源数组
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
    var _data = {ac: 'get_alarmList',"bjlx":bjlx,"search":search,"dsn":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          wx.hideLoading();  
          const newlist = [];
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
              newlist.push({
                "id":units[i].dsn,
                "name":units[i].userType,
                "kmlx":units[i].des,
                "kmrq":units[i].opTime
              })
            }              
          }
          setTimeout(()=>{
            _this.setData({
              servicelist:newlist
            })
          },10)
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
        setTimeout(()=>{
          wx.hideLoading();
        },500)
        const newlist = [];
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
            newlist.push({
                "id":units[i].dsn,
                "name":units[i].userType,
                "kmlx":units[i].des,
                "kmrq":units[i].opTime
            })
          }               
        }
        setTimeout(()=>{
          _this.setData({
            servicelist:_this.data.servicelist.concat(newlist),
            page: currentPage
          })
        },10)
    }
  },
  onShow: function () {  //生命周期函数--监听页面显示
  },
})