function initSubMenuDisplay() { 
  return ['hidden'];
}
var initSubMenuHighLight = [
  ['','','','','']
];
var gjzt= "";  //跟进状态
var search= "";  //搜索内容
var tabV = 0;
var userid= "";  //登陆人工号
var gdh = "";  //工单号
var mysl = 20; //每页数量
var page_total = 0; //总页数
var fyQJ = [];  //数组
var app = getApp();
var apiUrl = "";   //获取api地址
var jjcd= "";  //紧急程度
var rqlx= "";  //日期类型
var Sdate= "";  //开始时间
var Edate= "";  //结束日期
Page({

  data: {   //页面的初始数据
    subMenuDisplay:initSubMenuDisplay(),
    navH:0,
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
    mydata : "",
    detail_search:true, //搜索框
    showHight: 140,
    sxzt: '筛选',
    sxTop:280,
    showMB:true, //幕布
    mbTop:770,
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    userid = app.globalData.userid;   //登陆人工号
    gjzt= "未处理";  //跟进状态
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.data.navH = res.statusBarHeight+45;  //导航高度
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          navH: res.statusBarHeight+45,
        });
      }
    });
    that.get_workOrderList(gjzt,search,userid,jjcd,rqlx,Sdate,Edate);  //工单列表
    that.get_wclzs('未处理',search,userid,jjcd,rqlx,Sdate,Edate);  //未处理总数
    that.get_clzzs('处理中',search,userid,jjcd,rqlx,Sdate,Edate);  //处理中总数
  },
  //  tab切换逻辑
  swichNav: function( e ) {
    var that = this;
    if( this.data.currentTab === e.target.dataset.current ) {
      return false;
    } else {
        var tabV = e.target.dataset.current;
        if(tabV=="0"){
          gjzt = "未处理"
        }else if(tabV=="1"){
          gjzt = "处理中"
        }else if(tabV=="2"){
          gjzt = "已完成"
        }
        this.get_workOrderList(gjzt,search,userid,jjcd,rqlx,Sdate,Edate);  //工单列表
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
      gjzt = "未处理"
    }else if(tabV=="1"){
      gjzt = "处理中"
    }else if(tabV=="2"){
      gjzt = "已完成"
    }
    that.get_workOrderList(gjzt,search,userid,jjcd,rqlx,Sdate,Edate);  //工单列表
  },
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      showsearch:1,
      searchtext:e.detail.value
    })
    search = e.detail.value;
    this.get_workOrderList(gjzt,search,userid,jjcd,rqlx,Sdate,Edate);
    this.get_wclzs('未处理',search,userid,jjcd,rqlx,Sdate,Edate);  //未处理总数
    this.get_clzzs('处理中',search,userid,jjcd,rqlx,Sdate,Edate);  //处理中总数
  },
  /*
  submitSearch:function(){  //提交搜索
    search = this.data.searchtext;
    this.get_workOrderList(gjzt,search,userid,jjcd,rqlx,Sdate,Edate);
    this.get_wclzs('未处理',search,userid,jjcd,rqlx,Sdate,Edate);  //未处理总数
    this.get_clzzs('处理中',search,userid,jjcd,rqlx,Sdate,Edate);  //处理中总数
  },
  */
  hideFilter: function(){ //关闭筛选面板
    this.setData({
      showfilter: false,
      showfilterindex: null
    })
  },
  get_workOrderList:function (gjzt,search,userid,jjcd,rqlx,Sdate,Edate) { //工单管理
    let _this = this;
    fyQJ = [];  //初始化房源数组
    _this.setData({
      servicelist:[]
    })
    this.setData({
      page:1
    })
    const page = this.data.page;
    var tips = "加载中...";
    wx.showLoading({
     title: tips,
    })
    var _data = {ac: 'workOrder_list',"gjzt":gjzt,"search":search,"userid":userid,"jjcd":jjcd,"rqlx":rqlx,"Sdate":Sdate,"Edate":Edate};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          wx.hideLoading();  
          const newlist = [];
          var units = res.data.rows;
          var qty_total = units.length; //总条数
          if(qty_total > 0){
            fyQJ = units;
            page_total = Math.ceil(qty_total/mysl);  //总页数
            var qty = 0;
            if(qty_total > page*mysl){
              qty = page*mysl;
            }
            else{
              qty = qty_total;
            }
            for (var i = (page-1)*mysl; i < qty; i++) {
              newlist.push({
                "id":units[i].orderNo,
                "roomNo":units[i].houseName,
                "lxr":units[i].xclxr,
                "tel":units[i].xc_tel,
                "smsj":units[i].smsj,
                "sjd":units[i].sjd_name,
                "wtms":units[i].wtms,
                "dsn":units[i].dsn,
                "djzt_name":units[i].djzt_name,
                "yjsmsj":units[i].yjsmsj,        
              })
            }              
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
  get_wclzs:function (gjzt,search,userid,jjcd,rqlx,Sdate,Edate) { //未处理总数
    let _this = this;
    var _data = {ac: 'workOrder_list',"gjzt":gjzt,"search":search,"userid":userid,"jjcd":jjcd,"rqlx":rqlx,"Sdate":Sdate,"Edate":Edate};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var wcl_total = units.length; //总条数
        if(!wcl_total){
          wcl_total = 0;
        }
        else{
          wcl_total = wcl_total;
        }
        _this.setData({
          total_wcl:'('+wcl_total+')'
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_clzzs:function (gjzt,search,userid,jjcd,rqlx,Sdate,Edate) { //处理中总数
    let _this = this;
    var _data = {ac: 'workOrder_list',"gjzt":gjzt,"search":search,"userid":userid,"jjcd":jjcd,"rqlx":rqlx,"Sdate":Sdate,"Edate":Edate};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var clz_total = units.length; //总条数
        if(!clz_total){
          clz_total = 0;
        }
        else{
          clz_total = clz_total;
        }
        _this.setData({
          total_clz:'('+clz_total+')'
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  getBack: function(e) {  //返回上一页
    wx.navigateBack({
      delta: 1,
    })
  },
  callTel: function(e) { //拨打电话
    let telNumber = e.currentTarget.dataset.tel;
    wx.makePhoneCall({
      phoneNumber:telNumber
    }).catch((e) => {
      console.log(e)
    })
  },
  goToTop:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  scrollLoading:function(){ //滚动加载
    this.loadMoreData();
  },
  loadMoreData: function () {
    var _this = this
    var currentPage = _this.data.page; // 获取当前页码
    currentPage += 1; // 加载当前页面的下一页数据
    if(currentPage > page_total){
      wx.showToast({
        title: '没有更过数据',
        icon: 'none'
      })
    }
    else{
      var tips = "加载中...";
      wx.showLoading({
        title: tips,
      })
      setTimeout(()=>{
        wx.hideLoading();
      },500)
      const newlist = [];
      var units = fyQJ;
      var qty_total = units.length; //总条数
      if(qty_total > 0){
        var qty = 0;
        if(qty_total > currentPage*mysl){
          qty = currentPage*mysl;
        }
        else{
          qty = qty_total;
        }
        for (var i = (currentPage-1)*mysl; i < qty; i++) {
          newlist.push({
            "id":units[i].orderNo,
            "roomNo":units[i].houseName,
            "lxr":units[i].xclxr,
            "tel":units[i].xc_tel,
            "smsj":units[i].smsj,
            "sjd":units[i].sjd_name,
            "wtms":units[i].wtms,
            "dsn":units[i].dsn,
            "djzt_name":units[i].djzt_name,
            "yjsmsj":units[i].yjsmsj,                
          })
        }               
      }
      setTimeout(()=>{
        _this.setData({
          servicelist:_this.data.servicelist.concat(newlist),
          page: currentPage
        })
      },10)
    }
  },
  gdxq: function(e) { //工单详情
    var orderNo = e.currentTarget.dataset.key;
    wx.navigateTo({
      url: '../../pagesB/pages/workOrder_info/workOrder_info?orderNo='+orderNo
    })
  },
  ywc: function(e) { //已完成
    var orderNo = e.currentTarget.dataset.key;
    var that = this;
    that.orderState_update(userid,orderNo,"1005");
  },
  pd: function(e) { //派单
    var that = this;
    gdh = e.currentTarget.dataset.key;
    //var dsn = e.currentTarget.dataset.dsn;
    //that.orderState_update(userid,gdh,"1002");
    let job = "维保";
    wx.navigateTo({
      url: '../../pagesB/pages/emp_list/emp_list?job='+job
    })
  },
  orderState_update: function(czy,orderNo,djState) { //更新状态
    var that = this;
    let wgsj = "";
    var _data = {ac: 'orderState_update',"userid":czy,"orderNo":orderNo,"djState":djState,"wgsj":wgsj};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units=="1"){
          wx.showToast({
            title: '修改成功',
            icon: "success",
            duration: 1000
          }),
          setTimeout(()=>{
            that.get_workOrderList(gjzt,search,userid,jjcd,rqlx,Sdate,Edate); //工单列表
            that.get_wclzs('未处理',search,userid,jjcd,rqlx,Sdate,Edate);  //未处理总数
            that.get_clzzs('处理中',search,userid,jjcd,rqlx,Sdate,Edate);  //处理中总数
          },1000)
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  showSrarch: function(e){  //显示隐藏搜索框
    if(this.data.detail_search){
      this.setData({
        detail_search:false,
        showHight: 190,
        sxTop: 370,
        mbTop: 860,
      })
    }else{
      this.setData({
        detail_search:true,
        showHight: 140,
        sxTop: 280,
        mbTop: 770,
      })
    }
  },
  tapMainMenu: function(e) {        //获取当前显示的一级菜单标识
    var index = parseInt(e.currentTarget.dataset.index); //生成数组，全为hidden的，只对当前的进行显示
    var newSubMenuDisplay = initSubMenuDisplay();//如果目前是显示则隐藏，反之显示。同时要隐藏其他的菜单
    var showMB = true;
    if(this.data.subMenuDisplay[index] == 'hidden') {
      newSubMenuDisplay[index] = 'show';
      showMB = false;
    } else {
      newSubMenuDisplay[index] = 'hidden';
      showMB = true;
    }   // 设置为新的数组
    this.setData({
      subMenuDisplay: newSubMenuDisplay,
      showMB:showMB,  //显示幕布
    });
  },
  //紧急程度切换逻辑
  swichJJ: function( e ) {
    var that = this;
    let jjcd = e.target.dataset.jjcd;
    if( this.data.currentJJ === e.target.dataset.jjcd ) {
      //return false;
      that.setData( {
        currentJJ: "",
      })
      let rqlx = that.data.currentRQ;
      if(!rqlx){
        that.setData( {
          sxzt:'筛选'
        })
      } 
    } else {
      that.setData( {
        currentJJ: e.target.dataset.jjcd,
        sxzt:'已筛选'
      })
    }
  },
  //日期切换逻辑
  swichRQ: function( e ) {
    var that = this;
    let rq = e.target.dataset.rq;
    if( this.data.currentRQ === e.target.dataset.rq ) {
      //return false;
      that.setData( {
        currentRQ: "",
        Sdate:"",
        Edate:"",
      })
      let jjcd = that.data.currentJJ;
      if(!jjcd){
        that.setData( {
          sxzt:'筛选'
        })
      }   
    } else { 
      var tp = Date.parse(new Date());
      var date = new Date(tp);
      var Y = date.getFullYear();
      var M = date.getMonth()+1;
      var D = date.getDate();
      if(M<10){
        M = '0'+M
      }
      if(D<10){
        D = '0'+D
      }
      var dates =Y+'-'+M+'-'+D;
      that.setData( {
        currentRQ: e.target.dataset.rq,
        sxzt:'已筛选',
        Sdate:dates,
        Edate:dates,
      })
    }
  },
  //重置
  cz: function( e ) {
    var that = this;
    that.setData( {
      currentJJ: "",
      currentRQ: "",
      Sdate: "",
      Edate: "",
      sxzt: "筛选",
    })
    //清空全局变量
    jjcd= "";  //紧急程度
    rqlx= "";  //日期类型
    Sdate= "";  //开始时间
    Edate= "";  //结束日期
  },
  //确定
  qd: function( e ) {
    var that = this;
    jjcd = that.data.currentJJ;
    rqlx = that.data.currentRQ;
    Sdate = that.data.Sdate;
    Edate = that.data.Edate;
    if(!jjcd){ jjcd = ""; }
    if(!rqlx){ rqlx = ""; }
    if(!Sdate){ Sdate = ""; }
    if(!Edate){ Edate = ""; }
    that.get_workOrderList(gjzt,search,userid,jjcd,rqlx,Sdate,Edate); //工单列表
    that.get_wclzs('未处理',search,userid,jjcd,rqlx,Sdate,Edate);  //未处理总数
    that.get_clzzs('处理中',search,userid,jjcd,rqlx,Sdate,Edate);  //处理中总数
    var newSubMenuDisplay = initSubMenuDisplay();
    newSubMenuDisplay[0] = 'hidden';
    this.setData({
      subMenuDisplay: newSubMenuDisplay,
      showMB: true,
    });
  },
  startDateChange: function(e) {  //开始时间
    this.setData({
      Sdate: e.detail.value
    })
  },
  endDateChange: function(e) {  //结束时间
    this.setData({
      Edate: e.detail.value
    })
  },
  onShow: function () {  //生命周期函数--监听页面显示
    var that = this;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var fzNo_n = "";
    fzNo_n = currPage.data.mydata.gy;
    if(!!fzNo_n){
      let fzNo = fzNo_n;
      that.orderState_update(fzNo,gdh,"1002");
      currPage.data.mydata.gy = "";
    }
    this.get_workOrderList(gjzt,search,userid,jjcd,rqlx,Sdate,Edate); //工单列表
    this.get_wclzs('未处理',search,userid,jjcd,rqlx,Sdate,Edate);  //未处理总数
    this.get_clzzs('处理中',search,userid,jjcd,rqlx,Sdate,Edate);  //处理中总数 
  },
  onShareAppMessage: function() {
    //console.log("工单号："+gdh);
    return {
      title: '朗思服务端',
      path:'../../pagesB/pages/forward_info/forward_info?LY=FW&dsn='+gdh,
      imageUrl:'../../static/images/serverQR.jpg',
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