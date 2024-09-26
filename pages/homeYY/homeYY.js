var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = "";   //获取api地址
var job= "";  //登陆角色
var QZ= "";  //前缀
Page({
    data: {   //页面的初始数据
      winWidth: 0,
      winHeight: 0,
    },
    onLoad: function (options) {  //生命周期函数--监听页面加载
      var that = this;
      apiUrl = app.globalData.apiUrl; 
      userid = app.globalData.userid;   //登陆人工号
      job = app.globalData.job;    //登陆角色
      QZ = app.globalData.QZ;    //前缀
      //获取当前设备的宽高
      wx.getSystemInfo( { 
        success: function( res ) {
          that.setData( {
            winWidth: res.windowWidth,
            winHeight: res.windowHeight
          });
        }
      });
      if( !userid || !QZ){
        wx.redirectTo({
          url: '/pages/auth/auth'
        })
       }
        /*
       else{
        if(QZ=="jianxin" || QZ=="anju" || QZ=="jinyuan" || QZ=="iot"){
          wx.switchTab({
            url: '/pages/homeYY/homeYY',
          })
        }
        else{
          if(job=="样品管理员" || job=="安装" || job=="维保"){  //样品管理员
            wx.switchTab({
              url: '/pages/homeYS/homeYS',
            })
          }
          else{
            wx.switchTab({
              url: '/pages/home/home',
            })     
          }
        }
      }
      */
     /*调用一次定位*/
     /*
     wx.getLocation({
      type: 'gcj02',
      success (res) {
        console.log(res)
      }
     })
     */
    },
    tapEvent: function(e) {
      let _this = this;
      let index = e.currentTarget.dataset.index;
      let url = "";
      if ( index == '01' ) {  //门锁列表
        url = '/pages/myLock_list/myLock_list';
      }else if ( index == '02' ) {  //工单管理
        url = '../../pagesC/pages/workOrderYY_list/workOrderYY_list';
      }else if ( index == '03' ) {  //电表绑定
        url = '/pages/db_bind/db_bind';
      }
      if( !!url ){
        wx.navigateTo({
          url: url
        })
      }
    },
    onShow: function () {  //生命周期函数--监听页面显示
      apiUrl = app.globalData.apiUrl; 
      userid = app.globalData.userid;   //登陆人工号
      job = app.globalData.job;    //登陆角色
      QZ = app.globalData.QZ;    //前缀  
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
          selected: 0
        })
      }
      if(!!userid){
        this.Judge_loginGJ(userid);  //判断用户是否有权登陆
      }
    },
    Judge_loginGJ:function (emp_no) { //判断用户是否有权登陆
      let _this = this;
      var _data = {ac: 'Judge_loginGJ',"userid":emp_no};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          var units = res.data.rows;
          if(units.length > 0){
          }
          else{
            wx.showModal({    
              title: '提示',    
              showCancel: false,    
              content: '请联系管理员授权',    
              success: function (res) {
                let _userid = "";
                wx.setStorageSync("userid", _userid);
                app.globalData.userid = _userid;
                wx.redirectTo({
                  url: '/pages/auth/auth'
                })
              }
            })
            return false;
          }
        },
        fail(res) {
        },
        complete(){
        }
      });  
    }
})