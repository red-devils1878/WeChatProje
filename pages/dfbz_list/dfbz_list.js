var userid= "";  //租客编号
var role= "";  //登陆角色
var search= "";  //搜索内容
var mysl = 20; //每页数量
var page_total = 0; //总页数
var fyQJ = [];  //数组
var houseNo= "";  //楼栋
var app = getApp();
var apiUrl = "";   //获取api地址

Page({
  data: {   //页面的初始数据
    showsearch:true,   //显示搜索按钮
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    fyIndex: 0,
    total: 0,
    page: 0,  //分页
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    search = "";
    apiUrl = app.globalData.apiUrl;
    userid = options.userid;
    role = "WGY";   //登陆人工号
    //userid = "ZK2202150934";
    var that = this;
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    that.get_house(); //获取房源
    that.get_dfbzList(role,userid,houseNo);  //电费不足
  },
  get_house:function () { //获取房源
    let _this = this;
    let act = "get_houseName";
    var _data = {ac: act,"userid":userid};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var fy = res.data.rows;   
          _this.setData({
            fy:fy
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  get_dfbzList:function (role,userid,houseNo) { //电费不足
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
    var _data = {ac: 'dfbz_list',"LY":role,"userid":userid,"houseNo":houseNo};
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
        if(!qty_total){
          qty_total = 0;
        }
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
              "id":units[i].mac,
              "hid":units[i].hid,
              "title":units[i].houseName+units[i].sblx_name,
              "gxsj":units[i].gxsj2,
              "czzt":units[i].czzt,
              "sydl":units[i].sydl,
              "dqds":units[i].allpower,
              "imgurl":units[i].lhzzt=='合闸' ? "/static/images/my/tongdian.jpg":"/static/images/my/duandian.jpg",
            })
          }              
        }
        setTimeout(()=>{
          _this.setData({
            servicelist:newlist,
            total:qty_total
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
  bindFYChange: function(e) {
    this.setData({
      fyIndex: e.detail.value
    })
    houseNo = this.data.fy[e.detail.value].houseNo;
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
      if(!qty_total){
        qty_total = 0;
      }
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
            "id":units[i].mac,
            "hid":units[i].hid,
            "title":units[i].houseName+units[i].sblx_name,
            "gxsj":units[i].gxsj2,
            "czzt":units[i].czzt,
            "sydl":units[i].sydl,
            "dqds":units[i].allpower,
            "imgurl":units[i].lhzzt=='合闸' ? "/static/images/my/tongdian.jpg":"/static/images/my/duandian.jpg",
          })
        }               
      }
      setTimeout(()=>{
        _this.setData({
          servicelist:_this.data.servicelist.concat(newlist),
          page: currentPage,
          total:qty_total
        })
      },10)
    }
  },
  submitSearch:function(){  //提交搜索
    this.get_dfbzList(role,userid,houseNo);  //电费不足
  },
  bindJump: function (e) {
    let mac = e.currentTarget.id;
    let hid = e.currentTarget.dataset.hid;
    wx.navigateTo({
      url: '../../pagesA/pages/db_operate/db_operate?dsn='+mac
    })   
  },
  onShow: function () {  //生命周期函数--监听页面显示
    this.get_dfbzList(role,userid,houseNo);  //电费不足
  }
})