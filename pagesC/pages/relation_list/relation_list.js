var lc= "";  //楼层
var houseNo= "";  //楼栋
var userid= "";  //登陆人工号
var cjqlx = ""; //采集器类型
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
    cjqlx = options.cjqlx;
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
  roomCollector_list:function (userid,houseNo,lc) { //获取采集器位置列表
    let _this = this;
    _this.setData({
      servicelist:[],
      total:0
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'roomCollector_list',"userid":userid,"houseNo":houseNo,"lc":lc,"cjqlx":cjqlx};
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
            "id":units[i].hid3,
            "name":units[i].houseName+units[i].locationName,
            "sbNo":units[i].equip_no,
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
  jupBind:function(e){  //关联页面
    var collectorNo = e.currentTarget.dataset.sbh;
    var hid3 = e.currentTarget.dataset.key;
    if(!collectorNo){
      wx.showToast({
        title: '没有可关联的采集器',
        icon: "none",
        duration: 2000
      })
    }
    else{
      wx.navigateTo({
        url:  '../../../pagesC/pages/relation_bindInfo/relation_bindInfo?collectorNo='+collectorNo+'&hid3='+hid3+'&cjqlx='+cjqlx
      }) 
    }
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
      this.roomCollector_list(userid,houseNo,lc); //获取采集器位置列表
    }
  },
  onShow: function () {  //生命周期函数--监听页面显示
  }
})