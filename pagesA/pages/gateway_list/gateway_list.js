var search= "";  //搜索内容
var lc= "";  //楼层
var houseNo= "";  //楼栋
var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = "";   //获取api地址
var apiNC = "";     //获取门锁api地址(新锁)
Page({
  data: {  //页面的初始数据
    lc:'',
    search:"",
    winWidth: 0,
    winHeight: 0,
    fyIndex: 0,
    total: 0,
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
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
  get_gatewayList:function (userid,houseNo,lc,search) { //门锁列表
    let _this = this;
    _this.setData({
      servicelist:[],
      total:0
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'gateway_list',"userid":userid,"houseNo":houseNo,"lc":lc,"search":search};
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
              "id":units[i].equip_no,
              "name":units[i].equip_name,
              "online":units[i].online,
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
  inputsbh:function(e){
    this.setData({
      search:e.detail.value
    })
  },
  jupLock:function(e){  //门锁操作页面
    let wgh = e.currentTarget.dataset.key;
    wx.navigateTo({
      url: '../../../pagesA/pages/wg_operate/wg_operate?gatewaySn='+wgh
    })
    /*
    var _dataNC = '{ac: "wifi","gatewaySn":"'+wgh+'"}'
    wx.request({
        url: 'https://aiot.langsi.com.cn/api/gateway/wifi',  //api地址
        data: _dataNC,
        header: {'Content-Type': 'application/json'},
        method: "POST",
        async:false,  //同步
        success(res) {
          if(res==""){
            wx.showToast({
              title: '失败',
              icon: "none",
              duration: 1000
            })  
          }
          else {
            if(res.data.code=='0'){
              var otp= "";
              var title = "网关信号值";
              var dataV = res.data.data;       
              if(!dataV){
                console.log("超时——>>："+res.data.msg);
                wx.showToast({
                    title: res.data.msg,
                    icon: "none",
                    duration: 2000
                }) 
              }
              else{
                otp = res.data.data.signalStrength; 
                console.log("网关信号值——>>："+otp);
                wx.showModal({
                    title: title,
                    showCancel: false,
                    cancelText:'关闭',
                    cancelColor:'red',
                    confirmText:'返回',
                    confirmColor:'#47a86c',
                    content:otp,
                    success: function(res) {
                    }
                  }) 
              }   
            }
            else{
              wx.showToast({
                title: res.data.msg,
                icon: "none",
                duration: 1000
              })                  
            }
          }
        }
      });
      */
  },
  submitSearch:function(){  //提交搜索
    lc = this.data.lc;
    search = this.data.search;
    this.get_gatewayList(userid,houseNo,lc,search); //获取门锁设备
  },
  onShow: function () {  //生命周期函数--监听页面显示
  }
})