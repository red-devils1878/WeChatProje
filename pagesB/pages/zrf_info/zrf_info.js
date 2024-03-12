var fid = "";
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  data: {  //页面的初始数据
    servicelist:[], //服务集市列表
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl; 
    fid = options.fid;
    //fid = "HTMX22042103361";
    that.syzd_info(fid);  //获取账单详情
    that.rent_detail(fid);  //获取账单明细
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
            /*
            let ks = (units[0].kssj);
            let js = (units[0].jssj);
            ks = ks.replace('0:00:00','').replace('/','-').replace('/','-');
            js = js.replace('0:00:00','').replace('/','-').replace('/','-');
            */
            _this.setData({
              id:units[0].id,
              contractNo:units[0].hth,
              xstje:units[0].xstje,
              zy:units[0].periods_num,
              roomNo:units[0].roomNo,
              tenantName:units[0].tenantName,
              kssj:units[0].kssj2,
              jssj:units[0].jssj2,            
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
              "xstje":units[i].receivable-units[i].receivable2,
              "yssj2":units[i].start2+'--'+units[i].end2
            })
          }
          _this.setData({
            servicelist:newlist
          })
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
  send:function (e) {
    var _data = {ac: 'insert_sendLog',"fid":fid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          console.log("发送成功:",res);
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  onShow: function () {  //生命周期函数--监听页面显示

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '支付账单',
      path:'/pages/forward_info/forward_info?LY=ZD&dsn='+fid,
      imageUrl:'/static/images/my/reward.png',
      success: function (res) {
        console.log("分享成功",res);// 分享成功
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        })
      },
      fail: function (res) {
        console.log("分享失败",res);// 转发失败
      }
    }
  }
})