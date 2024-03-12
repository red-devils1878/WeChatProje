var userid= "";  //登陆人工号
var job= "";  //登陆角色
var tabBarIndex= 2;  //tabBar下标
var QZ= ""; //前缀
var app = getApp();
var apiUrl = "";  //获取api地址
Page({

    data: {  // 页面的初始数据
      ifName: false,
      newPwd:""
    },
    onLoad: function (options) {  //生命周期函数--监听页面加载
      apiUrl = app.globalData.apiUrl; 
      userid = app.globalData.userid;   //登陆人工号
      job = app.globalData.job;
      QZ = app.globalData.QZ;
      var LX= "WGY";
      if(job == "样品管理员" || QZ == "jianxin" || QZ == "anju" || QZ == "jinyuan" || QZ == "iot"){
        tabBarIndex = 1;
      }else{
        tabBarIndex = 2;
      }
      if(QZ == "jianxin" || QZ == "anju" || QZ == "jinyuan" || QZ == "iot"){ //建信、安居
        LX= "GJ";
      }else{
        LX= "WGY";
      }   
      this.get_userData(userid,LX);  //获取信息
    },
    get_userData:function (userid,LX) { //获取信息
        let _this = this;
        var _data = {ac: 'get_userData',"userid":userid,"LX":LX};
        wx.request({
          url: apiUrl,  //api地址
          data: _data,
          header: {'Content-Type': 'application/json'},
          method: "get",
          success(res) {
            var units = res.data.rows;
            if(units.length > 0){
              _this.setData({
                username:units[0].username,
                tel:units[0].tel2         
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
    tapEvent: function(e) {
      var that = this;
      let index = e.currentTarget.dataset.index;
      if (index == '05') {  //退出登录
        let _userid= "";
        wx.setStorageSync("userid", _userid);
        app.globalData.userid = _userid;  //存入全局变量
        wx.redirectTo({
          url: '/pages/auth/auth'
        })
      }else if(index == '03'){
        wx.navigateTo({
          url: '/pages/helpNotes/helpNotes'
        })
      }else if(index == '01'){
        if(QZ == "jianxin" || QZ == "anju" || QZ == "jinyuan" || QZ == "iot"){ //建信、安居
          wx.showToast({
            title: '暂不支持修改',
            icon: 'none',
            duration: 2000
          })
        }else{
          that.setData( {
            ifName: true,    //显示弹出框
          }); 
        }  
      }
    },
    setValue: function(e) {   //密码值改变事件
      let newPwd = e.detail.value;
      this.setData( {
        newPwd:newPwd
      }); 
    },
    cancel: function (e) {  //取消
      this.setData( {
        ifName: false,    //隐藏弹出框
        newPwd:""
      }); 
    },
    confirm: function (e) {  //确定
      let that = this;
      let newPwd = that.data.newPwd;
      if(!newPwd){
        wx.showToast({
          title: '请输入新密码！',
          icon: 'none',
          duration: 2000
        })
      }
      else{
        var _data = {ac: "update_loginPwd","userid":userid,"newPwd":newPwd};
        wx.request({
          url: apiUrl,  //api地址
          data: _data,
          header: {'Content-Type': 'application/json'},
          method: "get",
          success(res) {
            if(res.data.status=='1'){
              that.setData({
                ifName: false,    //隐藏弹出框
                newPwd:""
              });
              wx.showToast({
                title: '修改成功',
                icon: "success",
                duration: 1500
              })
              setTimeout(()=>{
                wx.redirectTo({
                  url: '/pages/auth/auth'
                })
              },2000)
            }
            else{
              that.setData({
                ifName: false,    //隐藏弹出框
                newPwd:""
              });
              wx.showToast({
                title: '修改失败',
                icon: "error",
                duration: 1000
              })     
            }      
          },
          fail(res) {
            console.log("getunits fail:",res);
          },
          complete(){
          }
        });
      }
    },
    onShow: function () {  //生命周期函数--监听页面显示
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
          selected: tabBarIndex
        })
      }
    }
})