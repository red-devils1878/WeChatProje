
var lc= "";  //楼层
var houseNo= "";  //楼栋
var dl_min= "";  //最小电量
var dl_max= "";  //最大电量
var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = "";   //获取api地址
Page({

  data: {  //页面的初始数据
    lc:'',
    dl_min:0,
    dl_max:100,
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
    //that.get_mrdl(userid,houseNo,lc,dl_min,dl_max); //每日电量
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
  get_mrdl:function (userid,houseNo,lc,dl_min,dl_max) { //每日电量
    let _this = this;
    _this.setData({
      servicelist:[],
      total:0,
    })
    wx.showToast({
        title: '加载中',
        icon: 'loading'
    })
    var _data = {ac: 'get_mrdl',"userid":userid,"houseNo":houseNo,"lc":lc,"dl_min":dl_min,"dl_max":dl_max};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        const newlist = [];
        var units = res.data.rows;
        if(units.length > 0){
          let total = units.length;
          for (var i = 0; i < units.length; i++) {
            newlist.push({
              "id":units[i].hid,
              "roomNo":units[i].houseName+units[i].roomNo,
              "zxtbsj":(units[i].zxtbsj).replace('/','-').replace('/','-'),
              "dcdl":units[i].dcdl,
              "yjlx":units[i].yjlx,
              "address":units[i].address,
              "dl":units[i].dl_value,
            })
          }
          _this.setData({
            servicelist:newlist,
            total:total,
          })
        }
        else{
          wx.showToast({
            title: "没有数据",
            icon: 'none',
            duration: 1000
          })
        }
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
  inputMax:function(e){
    this.setData({
      dl_max:e.detail.value
    })
  },
  inputMin:function(e){
    this.setData({
       dl_min:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    lc = this.data.lc;
    dl_min = this.data.dl_min;
    dl_max = this.data.dl_max;
    this.get_mrdl(userid,houseNo,lc,dl_min,dl_max); //每日电量
  },
  onShow: function () {  //生命周期函数--监听页面显示

  }
})