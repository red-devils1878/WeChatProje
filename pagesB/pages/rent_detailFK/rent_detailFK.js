// pages/rent_detailFK/rent_detailFK.js
var fid = "";
var Yd = "";
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  data: {  //页面的初始数据
    actionSheetHidden:true,
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    yfklist:[], //已付款
    hiden_yfk:true, //隐藏已付款
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl; 
    fid = options.fid;
    //fid = "HTMX22051004218";
    //获取当前设备的宽高
    wx.getSystemInfo( { 
        success: function( res ) {
            that.setData( {
              winWidth: res.windowWidth,
              winHeight: res.windowHeight
            });
        }
    });
    that.syzd_info(fid);  //获取账单详情
    that.rent_detail(fid);  //获取账单明细
    that.yfk_list(fid);  //获取已付款
  },
  syzd_info:function (fid) { //获取账单详情
    let _this = this;
    var _data = {ac: 'syzd_info',"id":fid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            Yd = units[0].yssj2;
            _this.setData({
              id:units[0].id,
              contractNo:units[0].hth,
              xstje:'- '+units[0].xstje,
              zy:units[0].periods_num+'.'+units[0].tenantName,
              roomNo:units[0].roomNo,
              zdje:units[0].zdje,
              ysje:units[0].ysje,
              yssj:units[0].yssj2,
              jqzt:units[0].jqzt,
              Sdate:units[0].yssj2,
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
  rent_detail:function (fid) { //获取账单明细
    let _this = this;
    var _data = {ac: 'rent_detail',"fid":fid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            newlist.push({
              "fid":units[i].fid,
              "id":units[i].id,
              "fylx_name":units[i].fylx_name,
              "xstje":(units[i].lx=='收款') ? "+"+units[i].receivable:"-"+units[i].receivable,
              "yssj2":units[i].start2+'--'+units[i].end2
            })
          } 
          setTimeout(()=>{
            _this.setData({
              servicelist:newlist
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
  yfk_list:function (fid) { //获取已付款
    let _this = this;
    var _data = {ac: 'yfk_list',"fid":fid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          if(units.length > 0){
            _this.setData({
              hiden_yfk:false
            })            
            for (var i = 0; i < units.length; i++) {
              newlist.push({
                "djbh":units[i].djbh,
                "cjsj":units[i].cre_da,
                "skfs":units[i].sffs_name,
                "fkmx":units[i].ysje,
                "spzt":units[i].zt_name
              })
            }
          }
          setTimeout(()=>{
            _this.setData({
              yfklist:newlist
            })
          },10)
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  goToTopZD:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  scrollLoadingZD:function(){ //滚动加载
    /* 
    if(this.data.hasMoreData){
      this.rent_detail(fid);
    }
    else{
      wx.showToast({
        title: '没有更过数据',
        icon: 'none'
      })
    }
    */
  },
  JumpHT: function(e) { //跳转到合同
    let hth = e.currentTarget.dataset.key;
    wx.navigateTo({
      url: '../../../pagesB/pages/rzxq_info/rzxq_info?contractNo='+hth
    })
  },
  tapFK: function (e) {  //付款
    let id = e.currentTarget.dataset.key;
    wx.navigateTo({
      url: '../../../pagesB/pages/fk_add/fk_add?fid='+id
    })
  },
  tapMore: function (e) {  //显示更多
    let id = e.currentTarget.dataset.key;
    let jq = e.currentTarget.dataset.jq;
    const czlist = [];
    if(jq=="1"){
      czlist.push(
        {bindtap:'Menu1',txt:'账单改期'},
        {bindtap:'Menu2',txt:'作废账单'},
      )
    }
    else if (jq=="2"){
      czlist.push(
        {bindtap:'Menu1',txt:'账单改期'},
      )
    }
    this.setData({
     actionSheetItems:czlist,
     actionSheetHidden:!this.data.actionSheetHidden
   })
  },
  actionSheetbindchange:function(){  //底部上弹
    this.setData({
      actionSheetHidden:!this.data.actionSheetHidden
    })
  },
  bindMenu1:function(){  //账单改期
    let that = this;
    that.setData({
      ifName: true,    //显示弹出框
    }); 
    this.setData({
      actionSheetHidden:!this.data.actionSheetHidden
    })
  },
  bindMenu2:function(){  //作废账单
    wx.showToast({
      title: '开发中...',
      icon: 'none'
    })
    this.setData({
      actionSheetHidden:!this.data.actionSheetHidden
    })
  },
  cancel: function (e) {
    let that = this;
    that.setData({
      ifName: false,
    }); 
  },
  confirm: function (e) {
    let that = this;
    that.update_yssj(fid,Yd); //更新发送时间
    that.setData({
      ifName: false,
    }); 
  },
  startDateChange: function(e) {
    Yd = e.detail.value;
    this.setData({
      Sdate: e.detail.value
    })
  },
  update_yssj: function(fid,Yd) { 
    let _this = this;
    if(!Yd){
      wx.showToast({
        title: '应付日期不能为空',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    var _data = {ac: 'update_yssj',"fid":fid,"Yd":Yd};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.showToast({
            title: '修改日期成功',
            icon: "none",
            duration: 1000
          })
          _this.syzd_info(fid);  //获取账单详情
        }
      },
      fail(res) {
      },
      complete(){
      }
    });   
  },
  onPullDownRefresh:function(){ //下拉刷新

  },
  onShow: function () {  //生命周期函数--监听页面显示
  }
})