var hid= "";  //房间id
var dsn= "";  //设备号
var job= "";  //登录角色
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    checked: false,  //所属门店
    batchIds: '',    //选中的ids
    qty: 0,
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    //hid = "49710"; //房间id
    hid = options.hid;
    job = app.globalData.job;   //登录角色
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          job:job
        });
      }
    });
    this.get_macToMS(hid); //获取房间门锁
    this.get_userList(hid); //获取用户列表
  },
  get_macToMS:function (hid) { //获取房间门锁
    let _this = this;
    var _data = {ac: 'get_macToMS',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          dsn = units[0].equip_no
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_userList:function (hid) { //获取用户列表
    let _this = this;
    var _data = {ac: 'get_userList',"hid":hid};
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
            servicelist:units,
          })
        },10)
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  tjsq:function(e){  //添加授权
    var that = this;
    let renterNo = e.currentTarget.dataset.key;  // 员工工号
    if(!!dsn){
      wx.navigateTo({
        url: '../../../pagesA/pages/xfsq_add/xfsq_add?renterNo='+renterNo+'&dsn='+dsn
      })
    }
    else{
      wx.showToast({
        title: '请先添加门锁！',
        icon: 'error',
        duration: 1000
      });           
    }
  },
  ckqx:function(e){  //查看权限
    var that = this;
    let renterNo = e.currentTarget.dataset.key;  // 员工工号
    if(!!dsn){
      wx.navigateTo({
        url: '../../../pagesA/pages/msyhZK_list/msyhZK_list?renterNo='+renterNo+'&dsn='+dsn
      })
    }
    else{
      wx.showToast({
        title: '请先添加门锁！',
        icon: 'error',
        duration: 1000
      });           
    }
  },
  addUser:function(e){  //添加同住人
    var that = this;
    wx.navigateTo({
      url: '../../../pagesB/pages/roomUser_add/roomUser_add?hid='+hid
    })
  },
  onShow: function () { //生命周期函数--监听页面显示
    this.get_userList(hid); //获取用户列表
  },
})