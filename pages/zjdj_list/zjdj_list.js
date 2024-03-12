// pages/zjdj_list/zjdj_list.js
var search= "";  //搜索内容
var tabV = 0;
var total_dj=0;  //待交总笔数
var total_yj=0;  //已交总笔数
var userid= "";  //登陆人工号
var fidd = "";//账单父id
var tabVLX = 0;
var zdlx = "收款";
var SdDJ = "";//开始时间
var EdDJ = "";//结束时间
var SdYJ = "";//开始时间
var EdYJ = "";//结束时间
var app = getApp();
var apiUrl = "";   //获取api地址
Page({
  data: {
    winWidth: 0,
    winHeight: 0,
    currentTabLX: 0,
    currentTab: 0,
    showsearch:true,   //显示搜索按钮
    searchtext:'',  //搜索文字
    showfilter:false, //是否显示下拉筛选
    showfilterindex:null, //显示哪个筛选类目
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    detail_master:false, 
    detail_djDate:true, //查询待缴日期
    detail_yjDate:true, //查询待缴日期
    currentYJ: "jintian",
    currentDJ: "jintian",
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
          winHeight: res.windowHeight
        });
      }
    });
    that.initDate();//初始化日期
    that.zjdj_list(userid,search,zdlx,SdDJ,EdDJ);
  },
   //tab切换逻辑
   swichNavLX: function( e ) {
    var that = this;
    tabVLX = e.target.dataset.current;
    if( this.data.currentTabLX === e.target.dataset.current ) {
        return false;
    } else {
        that.setData( {
          currentTabLX: e.target.dataset.current
        })
    }
    if(tabVLX=='0'){  //收款
      zdlx = "收款";
      if(tabV=='0'){ //待交
        that.zjdj_list(userid,search,zdlx,SdDJ,EdDJ);
      }
      else if(tabV=='1'){ //已交
        that.yijiao_list(userid,search,zdlx,SdYJ,EdYJ); 
      }
    }
    else if(tabVLX=='1'){ //付款
      zdlx = "付款";
      if(tabV=='0'){ //待交
        that.zjdj_list(userid,search,zdlx,SdDJ,EdDJ);
      }
      else if(tabV=='1'){ //已交
        that.yijiao_list(userid,search,zdlx,SdYJ,EdYJ); 
      }
    }
  },
   //tab切换逻辑
   swichNav: function( e ) {
    var that = this;
    tabV = e.target.dataset.current;
    if( this.data.currentTab === e.target.dataset.current ) {
        return false;
    } else {
        that.setData( {
            currentTab: e.target.dataset.current
        })
    }
    if(tabV=='0'){  //待交账单
      that.zjdj_list(userid,search,zdlx,SdDJ,EdDJ);
    }
    else if(tabV=='1'){ //已交账单
      that.yijiao_list(userid,search,zdlx,SdYJ,EdYJ); 
    }
  },
  bindChange: function( e ) {
    var that = this;
    tabV = e.detail.current;
    that.setData( { 
      currentTab: e.detail.current 
    });
    if(tabV=='1'){ //已交账单
      that.yijiao_list(userid,search,zdlx,SdYJ,EdYJ); 
    }
  },
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      showsearch:1,
      searchtext:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    search = this.data.searchtext;
    if(tabV=='0'){  //待交账单
      this.zjdj_list(userid,search,zdlx,SdDJ,EdDJ);
    }
    else if(tabV=='1'){ //已交账单
      this.yijiao_list(userid,search,zdlx,SdYJ,EdYJ); 
    }
  },
  hideFilter: function(){ //关闭筛选面板
    this.setData({
      showfilter: false,
      showfilterindex: null
    })
  },
  zjdj_list:function (userid,search,zdlx,SdDJ,EdDJ) { //待交账单
    let _this = this;
    _this.setData({
      zddjlist:[],
      total_dj:'('+0+')'
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'zjdj_list',"userid":userid,"search":search,"zdlx":zdlx,"SdDJ":SdDJ,"EdDJ":EdDJ};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          total_dj = units.length;
          if(!total_dj){
            total_dj = 0;
          }
          for (var i = 0; i < units.length; i++) {
            newlist.push({
              "id":units[i].id,
              "htid":units[i].htid,
              "roomNo":units[i].roomNo,
              "yssj2":'应交日期：'+units[i].yssj2,
              "syts":(units[i].ts >= 0) ? '剩'+units[i].ts+'天':'逾期'+Math.abs(units[i].ts)+'天',
              "zk":'租客：'+units[i].tenantName,
              "tel":units[i].tel,
              "je":units[i].periods_num+':'+(units[i].zdje-units[i].ysje)+'元',
              "zdlx":units[i].zdlx,
              "ts":units[i].ts,
            })
          } 
          setTimeout(()=>{
            _this.setData({
              zddjlist:newlist,
              total_dj:'('+total_dj+')'
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
  yijiao_list:function (userid,search,zdlx,SdYJ,EdYJ) { //已交账单
    let _this = this;
    _this.setData({
      yijiaolist:[],
      total_yj:'('+0+')'
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'yijiao_list',"userid":userid,"search":search,"zdlx":zdlx,"Sdate":SdYJ,"Edate":EdYJ};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          total_yj = units.length;
          if(!total_yj){
            total_yj = 0;
          }
          for (var i = 0; i < units.length; i++) {
            newlist.push({
              "id":units[i].id,
              "fylx":units[i].fylx_name,
              "rzrq":'入账日期：'+units[i].rzrq2,
              "je":(units[i].lx=='收款') ? "+"+units[i].lsje:"-"+units[i].lsje,
              "zk":'租客：'+units[i].roomname+'.'+units[i].tenantName
            })
          } 
          setTimeout(()=>{
            _this.setData({
              yijiaolist:newlist,
              total_yj:'('+total_yj+')'
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
  goToTopDJ:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  goToTopYJ:function(){ //回到顶部
      this.setData({
        scrolltop:0
    })
  },
  scrollLoadingDJ:function(){ //滚动加载
    if(this.data.hasMoreData){
      this.zjdj_list(userid,search,zdlx,SdDJ,EdDJ);
    }
    else{
      wx.showToast({
        title: '没有更过数据',
        icon: 'none'
      })
    }
  },
  scrollLoadingYJ:function(){ //滚动加载
    if(this.data.hasMoreData){
      this.yijiao_list(userid,search,zdlx,SdYJ,EdYJ); 
    }
    else{
      wx.showToast({
        title: '没有更过数据',
        icon: 'none'
      })
    }
  },
  ysz: function (e) {  //已收租
    let fid = e.currentTarget.dataset.key;
    let szlx = e.currentTarget.dataset.lx;
    if(szlx=="收款"){
      wx.navigateTo({
        url: '../../pagesB/pages/rent_detail/rent_detail?fid='+fid
      })
    }
    else if(szlx=="付款"){
      wx.navigateTo({
        url: '../../pagesB/pages/rent_detailFK/rent_detailFK?fid='+fid
      })
    }
  },
  jztx: function (e) {  //交租提醒
    fidd = e.currentTarget.dataset.key;
  },
  initDate: function (e) {  //初始化日期
    if(!SdDJ){
      const date = new Date(); //获取当前时间
      let y = date.getFullYear();  //年
      let m = date.getMonth()+1; //月
      let d = date.getDate();  //日
      if(m < 10){ m = '0'+ m }
      if(d < 10){ d = '0'+ d }
      SdDJ = y+'-'+m+'-'+d;  //拼接时间如2022-01-02
      EdDJ = y+'-'+m+'-'+d;  //拼接时间如2022-01-02
      SdYJ = y+'-'+m+'-'+d;  //拼接时间如2022-01-02
      EdYJ = y+'-'+m+'-'+d;  //拼接时间如2022-01-02
    }
    this.setData({
      djks: SdDJ,
      djjs: EdDJ,
      SdateDJ: SdDJ,
      EdateDJ: EdDJ,
      yjks: SdYJ,
      yjjs: EdYJ,
      SdateYJ: SdYJ,
      EdateYJ: EdYJ,
    })
  },
  startDateChangeDJ: function(e) {  //开始时间
   let SdDJ2 = e.detail.value;
   let SdateDJ=new Date(SdDJ2);
   let EdateDJ=new Date(EdDJ);
   if(SdateDJ > EdateDJ){
     wx.showToast({
       title: "起始时间不能大于终止时间",
       icon: 'none',
       duration: 1000
     })
     this.setData({
      SdateDJ: SdDJ
     })
     return false;
   }
   else{
    SdDJ = e.detail.value;
    this.setData({
      SdateDJ: e.detail.value,
      currentDJ: ''
    })
   }
  },
  endDateChangeDJ: function(e) {  //结束时间
    let EdDJ2 = e.detail.value;
    let SdateDJ=new Date(SdDJ);
    let EdateDJ=new Date(EdDJ2);
    if(SdateDJ > EdateDJ){
      wx.showToast({
        title: "起始时间不能大于终止时间",
        icon: 'none',
        duration: 1000
      })
      this.setData({
        EdateDJ: EdDJ
      })
      return false;
    }
    else{
      EdDJ = e.detail.value;
      this.setData({
        EdateDJ: e.detail.value,
        currentDJ: ''
      })
    }
  },
  showDJdate: function(e) {
    this.setData({
      detail_master: true,
      detail_djDate: false
    })
  },
  cancelDJ: function(e) {  //取消
    this.setData({
      detail_master: false,
      detail_djDate: true
    })  
  },
  sureDJ: function(e) {  //确定
    this.setData({
      detail_master: false,
      detail_djDate: true,
      djks: SdDJ,
      djjs: EdDJ,
    })
    this.zjdj_list(userid,search,zdlx,SdDJ,EdDJ);
  },
   //日期切换逻辑(待缴)
   swichDJ: function( e ) {
    var that = this;
    let ts = e.target.dataset.djsjqx;
    if( this.data.currentDJ === e.target.dataset.djsjqx ) {
        return false;
    } else {
        that.setData( {
          currentDJ: e.target.dataset.djsjqx
        })
    }
    that.getDate_dj(ts);//获取待缴日期
  },
  getDate_dj:function (ts) { //获取待缴日期
    let that = this;
    var _data = {ac: 'IB_getDate',"ts":ts};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          SdDJ = units[0].sDate;
          EdDJ = units[0].eDate;
          that.setData({
            SdateDJ:SdDJ,
            EdateDJ:EdDJ
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

  startDateChangeYJ: function(e) {  //开始时间
    let SdYJ2 = e.detail.value;
    let SdateYJ=new Date(SdYJ2);
    let EdateYJ=new Date(EdYJ);
    if(SdateYJ > EdateYJ){
      wx.showToast({
        title: "起始时间不能大于终止时间",
        icon: 'none',
        duration: 1000
      })
      this.setData({
       SdateYJ: SdYJ
      })
      return false;
    }
    else{
     SdYJ = e.detail.value;
     this.setData({
       SdateYJ: e.detail.value,
       currentYJ: ''
     })
    }
   },
   endDateChangeYJ: function(e) {  //结束时间
     let EdYJ2 = e.detail.value;
     let SdateYJ=new Date(SdYJ);
     let EdateYJ=new Date(EdYJ2);
     if(SdateYJ > EdateYJ){
       wx.showToast({
         title: "起始时间不能大于终止时间",
         icon: 'none',
         duration: 1000
       })
       this.setData({
         EdateYJ: EdYJ
       })
       return false;
     }
     else{
       EdYJ = e.detail.value;
       this.setData({
         EdateYJ: e.detail.value,
         currentYJ: ''
       })
     }
   },
   showYJdate: function(e) {
     this.setData({
       detail_master: true,
       detail_yjDate: false
     })
   },
   cancelYJ: function(e) {  //取消
     this.setData({
       detail_master: false,
       detail_yjDate: true
     })  
   },
   sureYJ: function(e) {  //确定
     this.setData({
       detail_master: false,
       detail_yjDate: true,
       yjks: SdYJ,
       yjjs: EdYJ,
     })
     this.yijiao_list(userid,search,zdlx,SdYJ,EdYJ);
   },

   //日期切换逻辑(已交)
   swichYJ: function( e ) {
    var that = this;
    let ts = e.target.dataset.yjsjqx;
    if( this.data.currentYJ === e.target.dataset.yjsjqx ) {
        return false;
    } else {
        that.setData( {
          currentYJ: e.target.dataset.yjsjqx
        })
    }
    that.getDate_yj(ts);//获取待缴日期
  },
   getDate_yj:function (ts) { //获取已交日期
    let that = this;
    var _data = {ac: 'IB_getDate',"ts":ts};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          SdYJ = units[0].sDate;
          EdYJ = units[0].eDate;
          that.setData({
            SdateYJ:SdYJ,
            EdateYJ:EdYJ
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '账单明细',
      path: '/pages/jztx_info/jztx_info?fid='+fidd,
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
  },
  onShow: function () {  //生命周期函数--监听页面显示
  },
  onPullDownRefresh: function () {  //页面相关事件处理函数--监听用户下拉动作
  }
})