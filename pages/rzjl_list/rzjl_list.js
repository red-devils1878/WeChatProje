// pages/rzjl_list/rzjl_list.js
var hid= "";  //房间id
var search= "";  //搜索内容
var mysl = 30; //每页数量
var page_total = 0; //总页数
var fyQJ = [];  //房源数组
var app = getApp();
var apiUrl = "";   //获取api地址
Page({
  data: {
    showsearch:true,   //显示搜索按钮
    searchtext:'',  //搜索文字
    filterdata:{},  //筛选条件数据
    showfilter:false, //是否显示下拉筛选
    showfilterindex:null, //显示哪个筛选类目
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0  //分页
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    hid = options.hid;
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
    this.get_rzjl(hid,search); //获取入住记录
  },
  onReady: function () {  //生命周期函数--监听页面初次渲染完成
  },
  get_rzjl:function (hid,search) { //获取入住记录
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
    var _data = {ac: 'rzjl_list',"hid":hid,"search":search};
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
                "id":units[i].contractNo,
                "name":units[i].houseName,
                "htzt_name":units[i].htzt_name,
                "zq":units[i].inTime3+'--'+units[i].outTime3,
                "tenantName":units[i].tenantName,
              })
            }                        
          }
          setTimeout(()=>{
            _this.setData({
              servicelist:newlist,
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
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      //showsearch:e.detail.cursor>0,
      showsearch:1,
      searchtext:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    console.log(this.data.searchtext);
    search = this.data.searchtext;
    this.get_rzjl(hid,search); //获取入住记录
  },
  hideFilter: function(){ //关闭筛选面板
    this.setData({
      showfilter: false,
      showfilterindex: null
    })
  },
  goToTop:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  scrollLoading:function(){ //滚动加载
    //this.get_rzjl(hid,search); //获取入住记录
    this.loadMoreData();
  },
  onPullDownRefresh:function(){ //下拉刷新
    /*
    this.setData({
      page:0,
      servicelist:[]
    })
    this.get_rzjl(hid,search); //获取入住记录
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },1000)
    */
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
        //console.log("加载第 " + (currentPage) + "页");
        wx.showLoading({
          title: tips,
        })
        wx.hideLoading();
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
              "id":units[i].contractNo,
              "name":units[i].houseName,
              "htzt_name":units[i].htzt_name,
              "zq":units[i].inTime3+'--'+units[i].outTime3,
              "tenantName":units[i].tenantName,
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
})