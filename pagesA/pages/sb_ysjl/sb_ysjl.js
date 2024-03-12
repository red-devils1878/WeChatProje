var SdDJ = "";//开始时间
var EdDJ = "";//结束时间
var dsn = "";//水表设备号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  data: {  //页面的初始数据
    winWidth: 0,
    winHeight: 0,
    detail_master:false, 
    detail_djDate:true, //查询待缴日期
    currentDJ: "jintian",
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    dsn = options.dsn;
    //dsn = "869060036414807";
    apiUrl = app.globalData.apiUrl;
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
    that.get_UsageQuery(dsn,'sb',SdDJ,EdDJ);  //用水记录
  },
  get_UsageQuery:function (dsn,LX,SdDJ,EdDJ) { //用水记录
    let _this = this;
    _this.setData({
      servicelist:[]
    })
    var _data = {ac: 'get_UsageQuery',"dsn":dsn,"LX":LX,"Sdate":SdDJ,"Edate":EdDJ};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        const newlist = [];
        var units = res.data.rows;
        if(units.length > 0){
          for (var i = 0; i < units.length; i++) {
            newlist.push({
              "id":i*1+1,
              "mac":units[i].mac,
              "date":(units[i].useDate).replace('0:00:00','').replace('/','-').replace('/','-'),
              "qty":units[i].qty,
              "dqds":units[i].dqds,
            })
          }
          _this.setData({
            servicelist:newlist
          })
        }
        else{
          wx.showToast({
            title: "没有数据",
            icon: 'none',
            duration: 1000
          })
        }
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
    this.get_UsageQuery(dsn,'sb',SdDJ,EdDJ);  //用水记录
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
  onShow: function () {  //生命周期函数--监听页面显示

  }
})