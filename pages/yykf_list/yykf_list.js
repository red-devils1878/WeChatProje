var gjzt= "";  //跟进状态
var search= "";  //搜索内容
var tabV = 0;
var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = "";   //获取api地址

Page({

  data: {   //页面的初始数据
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    showsearch:true,   //显示搜索按钮
    searchtext:'',  //搜索文字
    showfilter:false, //是否显示下拉筛选
    showfilterindex:null, //显示哪个筛选类目
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    total_wcl: 0,  //未处理总数
    total_clz: 0,  //处理中总数
    total_gqz: 0,  //挂起中总数
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    userid = app.globalData.userid;   //登陆人工号
    gjzt= "待处理";  //跟进状态
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    that.get_yykfList(gjzt,search,userid);  //预约看房列表
    that.get_total(search,userid);  //总数
  },
  //  tab切换逻辑
  swichNav: function( e ) {
    var that = this;
    if( this.data.currentTab === e.target.dataset.current ) {
        return false;
    } else {
        var tabV = e.target.dataset.current;
        if(tabV=="0"){
          gjzt = "待处理"
        }else if(tabV=="1"){
          gjzt = "进行中"
        }else if(tabV=="2"){
          gjzt = "挂起中"
        }else if(tabV=="3"){
          gjzt = "已完成"
        }
        this.get_yykfList(gjzt,search,userid);
        that.setData( {
            currentTab: e.target.dataset.current
        })
    }
  },
  bindChange: function( e ) {
    var that = this;
    tabV = e.detail.current;
    that.setData( { 
      currentTab: e.detail.current 
    });
    if(tabV=="0"){
      gjzt = "待处理"
    }else if(tabV=="1"){
      gjzt = "进行中"
    }else if(tabV=="2"){
      gjzt = "挂起中"
    }else if(tabV=="3"){
      gjzt = "已完成"
    }
    that.get_yykfList(gjzt,search,userid);
  },
  jumpInfo: function( e ) {
    let yydh = e.currentTarget.dataset.key;
    wx.navigateTo({
      url: '../../pagesB/pages/yykf_info/yykf_info?yyNo='+yydh
    })
  },
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      showsearch:1,
      searchtext:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    search = this.data.searchtext;
    this.get_yykfList(gjzt,search,userid);
    this.get_total(search,userid);  //总数
  },
  hideFilter: function(){ //关闭筛选面板
    this.setData({
      showfilter: false,
      showfilterindex: null
    })
  },
  get_yykfList:function (gjzt,search,userid) { //看房列表
    let _this = this;
    _this.setData({
      servicelist:[]
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'yykf_list',"gjzt":gjzt,"search":search,"userid":userid};
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
              "id":units[i].yyNo,
              "houseName":units[i].houseName,
              "name":units[i].name,
              "tel":units[i].tel,
              "yyDate2":units[i].yyDate2,
              "sjd_name":units[i].sjd_name,
              "demand":units[i].demand,
              "gjzt":units[i].gjzt_name,
              "smsj":units[i].yjsmsj,
            })
          }
          setTimeout(()=>{
            _this.setData({
              servicelist:newlist
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
  get_total:function (search,userid) { //获取总数
    let _this = this;
    var _data = {ac: 'yykf_total',"search":search,"userid":userid};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          var dcl_total = units[0].dcl_total;
          var jxz_total = units[0].jxz_total;
          var gqz_total = units[0].gqz_total;
          _this.setData({
            total_wcl:'('+dcl_total+')',
            total_clz:'('+jxz_total+')',
            total_gqz:'('+gqz_total+')'
          })
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
    if(this.data.hasMoreData){
      this.get_yykfList(gjzt,search,userid);
    }
    else{
      wx.showToast({
        title: '没有更过数据',
        icon: 'none'
      })
    }
  },
  onShow: function () {  //生命周期函数--监听页面显示
    var that = this;
    that.get_yykfList(gjzt,search,userid);  //预约看房列表
    that.get_total(search,userid);  //总数
  },
})