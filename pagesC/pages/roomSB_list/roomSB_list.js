var lc= "";  //楼层
var houseNo= "";  //楼栋
var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  data: {  //页面的初始数据
    lc:'',
    winWidth: 0,
    winHeight: 0,
    fyIndex: 0,
    total: 0,
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
          winHeight: res.windowHeight,
        });
      }
    });
    that.get_house(); //获取房源
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
  get_myRoomList:function (userid,houseNo,lc) { //房间列表
    let _this = this;
    _this.setData({
      servicelist:[],
      total:0
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'myRoom_list',"userid":userid,"houseNo":houseNo,"lc":lc};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          let total = units.length;
          if(!total){
            total = 0;
          }
          for (var i = 0; i < units.length; i++) {
            newlist.push({
              "id":units[i].hid,
              "name":units[i].houseName+units[i].roomNo,
              "sbNo":units[i].sbNo,
            })
          } 
          setTimeout(()=>{
            _this.setData({
              servicelist:newlist,
              total:total
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
  inputLC:function(e){
    this.setData({
      lc:e.detail.value
    })
  },
  jupBind:function(e){  //绑定页面
    var hid = e.currentTarget.dataset.key;
    let sblx = "sb"; //水表
    wx.navigateTo({
      url:  '../../../pagesC/pages/SBbind_info/SBbind_info?hid='+hid+'&sblx='+sblx
    }) 
  },
  submitSearch:function(){  //提交搜索
    lc = this.data.lc;
    if(!houseNo || !lc){
      wx.showToast({
        title: '请选择楼栋和楼层',
        icon: "none",
        duration: 1000
      })
    }
    else{
      this.get_myRoomList(userid,houseNo,lc); //获取门锁设备
    }
  },
  onShow: function () {  //生命周期函数--监听页面显示
    if(!!houseNo && !!lc){
      this.get_myRoomList(userid,houseNo,lc); //获取门锁设备
    }
  }
})