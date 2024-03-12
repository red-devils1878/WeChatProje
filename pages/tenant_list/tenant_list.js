var search= "";  //搜索内容
var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = "";   //获取api地址
Page({
  /**
   * 页面的初始数据
   */
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
    userid = app.globalData.userid;   //登陆人工号
    search = "";
    wx.getSystemInfo( {      //获取当前设备的宽高
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
    this.get_tenant(userid,search); //获取租客列表
  },
  get_tenant:function (userid,search) { //获取租客列表
  let _this = this;
  _this.setData({
    servicelist:[]
  })
  wx.showToast({
    title: '加载中',
    icon: 'loading'
  })
  var _data = {ac: 'tenant_list',"userid":userid,"search":search};
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
            "id":units[i].contractNo,
            "name":units[i].tenantName+'.'+units[i].houseName,
            "imgurl":units[i].imgurl=='' ? "/static/images/touxiang.jpg" : units[i].imgurl,
            "zq":units[i].inTime3+'--'+units[i].outTime3,
            "tag":units[i].htzt_name,
          })
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
    this.get_tenant(userid,search); //获取租客列表
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
    //this.get_tenant(userid,search); //获取租客列表
  },
  onPullDownRefresh:function(){ //下拉刷新
    this.setData({
      page:0,
      servicelist:[]
    })
    this.fetchServiceData();
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },10)
  },
  onReady: function () {  //生命周期函数--监听页面初次渲染完成
  },
  onShow: function () { //生命周期函数--监听页面显示
  }
})