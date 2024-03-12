var SdDJ = "";//开始时间
var EdDJ = "";//结束时间
var dsn = "";//水表设备号
var czlx = "";//操作类型
var mysl = 20; //每页数量
var page_total = 0; //总页数
var jlQJ = [];  //记录数组
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  data: {  //页面的初始数据
    winWidth: 0,
    winHeight: 0,
    detail_master:false, 
    detail_djDate:true, 
    currentYJ: "jintian",
    yclxIndex: 0,
    servicelist:[],
    yclx:[{code:'ALL',othername:'全部'},{code:'01',othername:'通水'},{code:'02',othername:'断水'}]
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    dsn = options.dsn;
    apiUrl = app.globalData.apiUrl;
    //获取当前设备的宽高
    wx.getSystemInfo({ 
      success: function( res ) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    //that.get_yclx();  //获取异常类型
    that.initDate();//初始化日期
    that.czjl_list(dsn,czlx,SdDJ,EdDJ);  //获取操作记录
  },
  get_yclx:function () { //获取异常类型
    let _this = this;
    var _data = {ac: 'get_dropDownCode',otherid:'IB_bjxm'};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var yclx = res.data.rows;
        _this.setData({
          yclx:yclx
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  initDate: function (e) {  //初始化日期
    if(!SdDJ){
      const date = new Date(); //获取当前时间
      let y = date.getFullYear();  //年
      let m = date.getMonth()+1; //月
      let d = date.getDate();  //日
      if(m < 10){ m = '0'+ m }
      if(d < 10){ d = '0'+ d }
      var dd = new Date();
      dd.setDate(dd.getDate() -7);
      var y_last = dd.getFullYear();
      var m_last = dd.getMonth() + 1;
      var d_last = dd.getDate();
      if( m_last < 10){ m_last = '0'+m_last; }
      if( d_last < 10){ d_last = '0'+d_last; }
      SdDJ = y_last+'-'+m_last+'-'+d_last; //拼接时间如2022-01-02
      EdDJ = y+'-'+m+'-'+d;  //拼接时间如2022-01-02
    }
    this.setData({
      djks: SdDJ,
      djjs: EdDJ,
      SdateDJ: SdDJ,
      EdateDJ: EdDJ,
    })
  },
  czjl_list:function (dsn,czlx,SdDJ,EdDJ) { //获取操作记录
    let _this = this;
    jlQJ = [];  //初始化记录数组
    _this.setData({
      servicelist:[]
    })
    this.setData({
      page:1
    })
    const page = this.data.page;
    var _data = {ac: 'get_operation',"dsn":dsn,"czlx":czlx,"SdDJ":SdDJ,"EdDJ":EdDJ};
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
          jlQJ = units;
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
              "id":units[i].id,
              "dsn":units[i].dsn,
              "date":units[i].czsj,
              "du":units[i].operation_type,
            })
          }        
        }
        setTimeout(()=>{
          _this.setData({
            servicelist:newlist
          })
        },100)
      },
      fail(res) {
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      },
    });  
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
      var units = jlQJ;
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
            "id":units[i].id,
            "dsn":units[i].dsn,
            "date":units[i].czsj,
            "du":units[i].operation_type,
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
  bindLXChange: function(e) {  //异常类型事件
    var that = this
    this.setData({
      yclxIndex: e.detail.value
    })
    let czlx = this.data.yclx[e.detail.value].othername;
    that.czjl_list(dsn,czlx,SdDJ,EdDJ);  //获取操作记录
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
    this.czjl_list(dsn,czlx,SdDJ,EdDJ);  //获取操作记录
  },
   //日期切换逻辑
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
    that.getDate_dj(ts);//获取日期
  },
  getDate_dj:function (ts) { //获取日期
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
  onShow: function () {  //生命周期函数--监听页面显示

  }
})