var contractNo= "";  //合同号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var dsn = ""; //设备号
Page({
  data: {  //页面的初始数据
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    apiUrl = app.globalData.apiUrl;
    contractNo = options.contractNo;
    this.tenant_info(contractNo);  //获取租客信息
  },
  tenant_info:function (contractNo) { //获取租客信息
    let _this = this;
    var _data = {ac: 'checkIn_info',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            dsn = units[0].equip_no;
            _this.setData({
              tenantNo:units[0].tenantNo,
              name:units[0].tenantName,
              tel:units[0].tenantTel,
              sex:units[0].sex_name,
              cardType:units[0].zjlx_name,
              idcardNo:units[0].credentialsNo,
              contractNo:units[0].contractNo
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
  tapName: function(e) { 
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let keyN = e.currentTarget.dataset.key;
    let url = "";
    if (index == '1') {
      /* 
      wx.showToast({
        title: '功能开发中~',
        icon: "none",
        duration: 500
      })
      */
    } else if ( index == '2' ) {
      wx.showToast({
        title: '功能开发中~',
        icon: "none",
        duration: 500
      })
    }else if( index == '3' ){
      url = '../../../pagesB/pages/kmfs_add/kmfs_add?contractNo='+contractNo;
    }
    else if( index == '4' ){
      url = '../../../pagesB/pages/rzxq_info/rzxq_info?contractNo='+contractNo;
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  callTel: function(e) { //拨打电话
    let telNumber = e.currentTarget.dataset.tel;
    wx.makePhoneCall({
      phoneNumber:telNumber
    }).catch((e) => {
      console.log(e)
    })
  },
  onReady: function () {  //生命周期函数--监听页面初次渲染完成
  },
  onShow: function () { //生命周期函数--监听页面显示
  },
  onHide: function () { //生命周期函数--监听页面隐藏
  },
  onPullDownRefresh: function () { //页面相关事件处理函数--监听用户下拉动作
  },
  onReachBottom: function () {  //页面上拉触底事件的处理函数
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '朗思租客端',
      path:'../../../pagesB/pages/forward_info/forward_info?LY=ZK&dsn='+dsn,
      imageUrl:'../../../static/images/tenantQR.jpg',
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