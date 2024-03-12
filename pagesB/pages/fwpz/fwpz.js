
var hid= "";  //房间id
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0  //分页
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    hid = options.hid;
    apiUrl = app.globalData.apiUrl;
    /**
     * 获取当前设备的宽高
     */
    wx.getSystemInfo( {
        success: function( res ) {
            that.setData( {
                winWidth: res.windowWidth,
                winHeight: res.windowHeight
            });
        }
    });
    this.fwpz_info(hid);  //获取房间的设备
    this.get_fwpzList(); //房屋配置列表
  },
  get_fwpzList:function () { //房屋配置列表
    let _this = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'get_fwpzList'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              servicelist:units
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

      }
    });  
  },
  fwpz_info:function (hid) { //获取房屋配置
    let _this = this;
    var _data = {ac: 'house_info',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          var fwpz = units[0].fwpz;
          console.log(fwpz); 
            _this.setData({
              fwpz:fwpz
            })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  formSubmit: function (e){  //保存数据
    var mx_sb = "";
    var sb = e.detail.value.sb;
    var sb_length = sb.length;
    for(let i = 0; i < sb_length; i++){
      if(i==sb_length-1){
        mx_sb += sb[i];
      }
      else{
        mx_sb += sb[i] + ",";
      }
    }
    var _data = {ac: 'update_fwpz',"hid":hid,"sb":mx_sb};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '保存成功',
          icon: "success",
          duration: 1000
        })
        setTimeout(()=>{
          wx.navigateBack({
            delta: 1,
        }) 
        },1500)
      },
      fail(res) {
        console.log("getunits fail:",res);
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
    //this.get_fwpzList(); //房屋配置列表
  },
  onPullDownRefresh:function(){ //下拉刷新
    this.setData({
      page:0,
      servicelist:[]
    })
    //this.get_fwpzList(); //房屋配置列表
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },1000)
  },
})