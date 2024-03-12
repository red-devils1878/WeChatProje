var search= "";  //搜索内容
var ts= "";  //楼层
var houseNo= "";  //楼栋
var userid= "";  //登陆人工号
var mysl = 20; //每页数量
var page_total = 0; //总页数
var fyQJ = [];  //房源数组
var app = getApp();
var apiUrl = "";   //获取api地址
Page({

  data: {  //页面的初始数据
    ts:'',
    search:"",
    winWidth: 0,
    winHeight: 0,
    fyIndex: 0,
    total: 0,
    page: 0  //分页
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    userid = app.globalData.userid;   //登陆人工号
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
    that.get_cqwkm(userid,houseNo,ts,search); //获取长期未开门
  },
  get_house:function () { //获取房源
    let _this = this;
    var _data = {ac: 'get_houseName',"userid":userid};
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
  bindFYChange: function(e) {
    this.setData({
      fyIndex: e.detail.value
    })
    houseNo = this.data.fy[e.detail.value].houseNo;
  },
  inputLC:function(e){
    this.setData({
      ts:e.detail.value
    })
  },
  inputsbh:function(e){
    this.setData({
      search:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    ts = this.data.ts;
    search = this.data.search;
    this.get_cqwkm(userid,houseNo,ts,search); //获取长期未开门
  },
  get_cqwkm:function (userid,houseNo,ts,search) { //获取长期未开门
    let _this = this;
    if(!ts){
      ts = 0;  //默认0天
    }
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
    var _data = {ac: 'cqwkm_list',"userid":userid,"houseNo":houseNo,"ts":ts,"search":search};
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
              "id":units[i].dsn,
              "houseName":units[i].houseName+units[i].roomNo,
              "rent_name":units[i].rent_name+' | '+units[i].rent_tel,
              "kmr":units[i].kmr,
              "kmlx":units[i].kmlx,
              "zhkmsj":units[i].zhkmsj,
              "wkmts":units[i].wkmts,
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
  scrollLoading: function() {
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
            "id":units[i].dsn,
            "houseName":units[i].houseName+units[i].roomNo,
            "rent_name":units[i].rent_name+' | '+units[i].rent_tel,
            "kmr":units[i].kmr,
            "kmlx":units[i].kmlx,
            "zhkmsj":units[i].zhkmsj,
            "wkmts":units[i].wkmts,
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
  onShow: function () {  //生命周期函数--监听页面显示
 
  }
})