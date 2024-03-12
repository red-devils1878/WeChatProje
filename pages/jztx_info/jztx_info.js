var fid = "";
var app = getApp();
var apiUrl = "";   //获取api地址
Page({

  data: {  //页面的初始数据
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    fid = options.fid;
    //fid = "HTMX22042103361";
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    //that.rent_detail(fid);  //获取账单明细
    that.syzd_info(fid);  //获取账单明细
    that.setData({
      title: "支付账单",
      appId: 'wx5823704502996153',
      path: '/pages/rent_detail/rent_detail?fid='+fid, 
      envVersion: 'release',//develop开发版；trial体验版；release正式版
    });
  },
  syzd_info:function (fid) { //获取账单详情
    let _this = this;
    var _data = {ac: 'syzd_info',"id":fid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          _this.setData({
            id:units[0].id,
            contractNo:units[0].hth,
            je:units[0].xstje,
            roomNo:units[0].roomNo,
            zq:units[0].kssj2+'至'+units[0].jssj2,
            fksj:units[0].yssj2,            
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
  rent_detail:function (fid) { //获取账单明细
    let _this = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'rent_detail',"fid":fid};
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
              "fid":units[i].fid,
              "id":units[i].id,
              "fylx_name":units[i].fylx_name,
              "xstje":(units[i].lx=='收款') ? "+"+units[i].receivable:"-"+units[i].receivable,
              "yssj2":units[i].start2+'--'+units[i].end2
            })
          } 
          setTimeout(()=>{
            _this.setData({
              servicelist:newlist
            })
          },1500)
      },
      fail(res) {
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      },
      complete(){
        //wx.hideLoading();
        //wx.hideNavigationBarLoading(); //完全停止加载
        //wx.stopPullDownRefresh();  //停止下拉刷新
      }
    });  
  },
  goToTopZD:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  scrollLoadingZD:function(){ //滚动加载
    if(this.data.hasMoreData){
      this.rent_detail(fid);
    }
    else{
      wx.showToast({
        title: '没有更过数据',
        icon: 'none'
      })
    }
  },
  onPullDownRefresh:function(){ //下拉刷新
    this.setData({
      page:0,
      servicelist:[]
    })
    this.rent_detail(fid);
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },1000)
  },
  onShow: function () {  //生命周期函数--监听页面显示
    wx.hideHomeButton();
  }
})