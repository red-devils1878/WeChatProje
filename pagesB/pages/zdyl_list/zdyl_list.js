var contractNo = ""; //合同编号
var userid= "";  //登陆人工号
var renterNo= "";  //租客编号
var dsn= "";  //设备号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {  //页面的初始数据
    showsearch:true,   //显示搜索按钮
    searchtext:'',  //搜索文字
    filterdata:{},  //筛选条件数据
    showfilter:false, //是否显示下拉筛选
    showfilterindex:null, //显示哪个筛选类目
    room_list:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0  //分页
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl; 
    userid = app.globalData.userid;   //登陆人工号
    contractNo = options.contractNo;
    //contractNo = "Cont2204180061";
    //获取当前设备的宽高
    wx.getSystemInfo( {
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
    this.get_rentList(contractNo); //租金明细
    this.get_rentTotal(contractNo); //获取总金额
    this.get_sbToContract(contractNo); //获取设备号
  },
  get_rentList:function (contractNo) { //租金明细
    let _this = this;
    _this.setData({
      servicelist:[]
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'get_rentList',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        setTimeout(()=>{
          _this.setData({
            servicelist:units
          })
        },100)
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
  get_rentTotal:function (contractNo) { //获取总金额
    let _this = this;
    var _data = {ac: 'get_rentTotal',"contractNo":contractNo};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var total = 0;
        if(units.length > 0){
          total = units[0].amountTotal;
        }
        _this.setData({
          amountTotal:total
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_sbToContract:function (contractNo) { //获取设备号
    let _this = this;
    var _data = {ac: 'get_sbToContract',"contractNo":contractNo};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          renterNo = units[0].rent_no;
          dsn = units[0].equip_no;
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  //创建并确认
  tapSure:function(e){
    let that = this;
    /*
    setTimeout(()=>{
      that.setData({
        ifName: true,    //显示弹出框
      }); 
    },100)
    */
    var _data = {ac: 'insert_syzd',"contractNo":contractNo,"userid":userid};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status =='1'){
          wx.showToast({
            title: '创建成功',
            icon: 'success',
            duration: 1000
          })
          /*
          setTimeout(function() {
            wx.navigateBack({
              delta: 2,
            }) 
          }, 1000)
          */
          if(!!dsn){
            setTimeout(()=>{
              that.setData({
                ifNameXF: true,    //显示弹出框
              }); 
            },1000)
          }
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  cancel: function (e) {  //取消
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    }); 
    setTimeout(function(){
      wx.switchTab({
        url: '../../../pages/home/home',
      })
    },10)
  },
  confirm: function (e) {  //确定
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    }); 
    that.update_sentTime(contractNo); //更新发送时间
  },
  update_sentTime:function (contractNo) { //更新发送时间
    var _data = {ac: 'update_sentTime',"contractNo":contractNo};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        setTimeout(function(){
          wx.switchTab({
            url: '../../../pages/home/home',
          })
        },1000)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  cancelXF: function (e) {  //取消
    let that = this;
    that.setData({
      ifNameXF: false,    //隐藏弹出框
    }); 
    setTimeout(function(){
      wx.navigateBack({
        delta: 2,
      }) 
    },10)
  },
  confirmXF: function (e) {  //确定
    let that = this;
    that.setData({
      ifNameXF: false,    //隐藏弹出框
    }); 
    wx.redirectTo({
      url: '../../../pagesA/pages/xfsq_add/xfsq_add?renterNo='+renterNo+'&dsn='+dsn
    })
  },
  onShow: function () {  //生命周期函数--监听页面显示
  },
  onShareAppMessage: function () { //用户点击右上角分享
    return {
      //title: '朗思租客端',
      //path:'../../../pagesB/pages/forward_info/forward_info?LY=ZK&dsn='+dsn,
      //imageUrl:'../../../static/images/tenantQR.jpg',
      path: '../../../pagesB/pages/rztx_info/rztx_info?contractNo='+contractNo,
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