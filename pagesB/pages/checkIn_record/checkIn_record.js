
function initSubMenuDisplay() { 
  return ['hidden', 'hidden', 'hidden'];
}
var initSubMenuHighLight = [
  ['','','','',''],
  ['',''],
  ['','']
];
var search= "";  //搜索内容
var sq="";     //社区
var rzzt= "";    //入住状态
var czlx= "";    //出租类型
var userid= "";  //登陆人工号
var SdDJ = "";//开始时间
var EdDJ = "";//结束时间
var mysl = 10; //每页数量
var page_total = 0; //总页数
var fyQJ = [];  //房源数组
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  data: {  //页面的初始数据
    subMenuDisplay:initSubMenuDisplay(),
    showsearch:true,   //显示搜索按钮
    searchtext:'',  //搜索文字
    filterdata:{},  //筛选条件数据
    showfilter:false, //是否显示下拉筛选
    showfilterindex:null, //显示哪个筛选类目
    room_list:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    detail_master:false, 
    detail_djDate:true, //查询待缴日期
    djks:'',
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    search = "";
    SdDJ = "";//开始时间
    EdDJ = "";//结束时间
    //获取当前设备的宽高
    wx.getSystemInfo( {
        success: function( res ) {
            that.setData( {
              winWidth: res.windowWidth,
              winHeight: res.windowHeight,
            });
        }
    });
    apiUrl = app.globalData.apiUrl; 
    userid = app.globalData.userid;   //登陆人工号
    //userid = "gly5387";   //登陆人工号
    //this.initDate();//初始化日期
    this.get_houseBelong();  //获取分组
    this.get_rzzt();  //获取入住状态
    this.get_czlx();  //获取出租类型
    this.get_checkInRrcord(userid,sq,rzzt,czlx,search,SdDJ,EdDJ); //入住记录
  },
  get_houseBelong:function () { //获取分组
      let _this = this;
      var _data = {ac: 'get_houseBelong'};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            const newlist = [];
            var units = res.data.rows;
            for (var i = 0; i < units.length; i++) {
              newlist.push({
                "i":i,
                "sid":units[i].sid,
                "sname":units[i].sname
              })
            }
            setTimeout(()=>{
              _this.setData({
                fz_list:newlist
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
  get_rzzt:function () { //获取入住状态
    let _this = this;
    let otherid = "IB_rzzt";  //入住状态
    var _data = {ac: 'get_dropDownCode',"otherid":otherid};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const rzztlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
              rzztlist.push({
              "i":i,
              "code":units[i].code,
              "othername":units[i].othername
            })
          }
          setTimeout(()=>{
            _this.setData({
              rzzt_list:rzztlist
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
  get_czlx:function () { //获取出租类型
    let _this = this;
    let otherid = "IB_houseType";
    var _data = {ac: 'get_dropDownCode',"otherid":otherid};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const czlxlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            czlxlist.push({
              "i":i,
              "codeLX":units[i].code,
              "othernameLX":units[i].othername
            })
          }
          setTimeout(()=>{
            _this.setData({
              czlx_list:czlxlist
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
  get_checkInRrcord:function (userid,sq,rzzt,czlx,search,Sd,Ed) { //合同列表
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
    var _data = {ac: 'checkIn_record',"userid":userid,"sq":sq,"rzzt":rzzt,"czlx":czlx,"search":search,"Sd":Sd,"Ed":Ed};
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
              let ks = (units[i].rzsj);
              let js = (units[i].tzsj);
              ks = ks.replace('0:00:00','').replace('/','-').replace('/','-');
              js = js.replace('0:00:00','').replace('/','-').replace('/','-');
              newlist.push({
                "id":units[i].no,
                "hid":units[i].hid,
                "houseName":units[i].roomname,
                "rzzt":units[i].zz,
                "tenantName":units[i].name,
                "rzzq":ks+'至'+js,
                "sf":units[i].rlx,
                "fd":units[i].fdm,
                "fdxx":(units[i].fdm=='') ? '':units[i].fdm+' | '+units[i].fdh,
                "ts":(units[i].zz=='离开') ? '已离开' : units[i].ts < 0 ? '已超时' :'剩' +units[i].ts+'天',
                "tsStype":(units[i].zz=='离开') ? 'span_ts1' : units[i].ts < 0 ? 'span_ts3' :'span_ts2',
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
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      showsearch:1,
      searchtext:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    search = this.data.searchtext;
    this.get_checkInRrcord(userid,sq,rzzt,czlx,search,SdDJ,EdDJ);
  },
  hideFilter: function(){ //关闭筛选面板
    this.setData({
      showfilter: false,
      showfilterindex: null
    })
  },
  goToTop:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  onPullDownRefresh:function(){ //下拉刷新
    /*
    this.setData({
      page:0,
      room_list:[]
    })
    this.get_checkInRrcord(userid,sq,rzzt,czlx,search,SdDJ,EdDJ);
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },1000)
    */
  },
  tapMainMenu: function(e) {        //获取当前显示的一级菜单标识
    var index = parseInt(e.currentTarget.dataset.index); //生成数组，全为hidden的，只对当前的进行显示
    var newSubMenuDisplay = initSubMenuDisplay();//如果目前是显示则隐藏，反之显示。同时要隐藏其他的菜单
    if(this.data.subMenuDisplay[index] == 'hidden') {
      newSubMenuDisplay[index] = 'show';
    } else {
      newSubMenuDisplay[index] = 'hidden';
    }        // 设置为新的数组
    this.setData({
      subMenuDisplay: newSubMenuDisplay
    });
  },
  tapSubMenu: function(e) {     // 隐藏所有一级菜单
    this.setData({
      subMenuDisplay: initSubMenuDisplay()
    });        
    // 处理二级菜单，首先获取当前显示的二级菜单标识
    var indexArray = e.currentTarget.dataset.index.split('-');        // 初始化状态
    var Ttype = e.currentTarget.dataset.type;  
    var code = e.currentTarget.dataset.code;
    if(Ttype=='SQ'){  //社区
      sq = code
    }else if(Ttype=='rzzt'){  //入住状态
      rzzt = code
    }
    else if(Ttype=='CZlx'){  //出租类型
      czlx = code
    }
    for (var i = 0; i < initSubMenuHighLight.length; i++) {  
       // 如果点中的是一级菜单，则先清空状态，即非高亮模式，然后再高亮点中的二级菜单；
        if (indexArray[0] == i) {                
          for (var j = 0; j < initSubMenuHighLight[i].length; j++) {   // 实现清空
              initSubMenuHighLight[i][j] = '';
            }
        }
    }
    // 与一级菜单不同，这里不需要判断当前状态，只需要点击就给class赋予highlight即可
    initSubMenuHighLight[indexArray[0]][indexArray[1]] = 'highlight';        // 设置为新的数组
    this.setData({
      subMenuHighLight: initSubMenuHighLight
    });
    this.get_checkInRrcord(userid,sq,rzzt,czlx,search,SdDJ,EdDJ);
  },
openLock: function (e) {
    let hid = e.currentTarget.dataset.hid;
    var _data = {ac: 'get_macToMS',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let equip_no = units[0].equip_no;
          wx.navigateTo({
            url: '../../../pages/openLock_list/openLock_list?mac='+equip_no
          })
        }
        else{
          wx.showToast({
            title: '没有绑定的智能锁',
            icon: "none",
            duration: 1000
          })
        }
    },
    fail(res) {
      console.log("getunits fail:",res);
      wx.showToast({
        title: '没有绑定的智能锁',
        icon: "none",
        duration: 500
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
        SdDJ = y+'-'+m+'-'+d;  //拼接时间如2022-01-02
        EdDJ = y+'-'+m+'-'+d;  //拼接时间如2022-01-02
      }
      this.setData({
        djks: SdDJ,
        djjs: EdDJ,
        SdateDJ: SdDJ,
        EdateDJ: EdDJ,
      })
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
qkDJ: function(e) {  //清空
  this.setData({
    //detail_master: false,
    //detail_djDate: true,
    //djks: "",
    //djjs: "",
    SdateDJ: "",
    EdateDJ: "",
    currentDJ: "",
  })
  SdDJ = "";
  EdDJ = "";
  //this.get_checkInRrcord(userid,sq,rzzt,czlx,search,SdDJ,EdDJ);
},
sureDJ: function(e) {  //确定
  this.setData({
    detail_master: false,
    detail_djDate: true,
    djks: SdDJ,
    djjs: EdDJ,
  })
  this.get_checkInRrcord(userid,sq,rzzt,czlx,search,SdDJ,EdDJ);
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
// 页面上拉触底事件的处理函数 
scrollLoading: function() {
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
          let ks = (units[i].rzsj);
          let js = (units[i].tzsj);
          ks = ks.replace('0:00:00','').replace('/','-').replace('/','-');
          js = js.replace('0:00:00','').replace('/','-').replace('/','-');
          newlist.push({
            "id":units[i].no,
            "hid":units[i].hid,
            "houseName":units[i].roomname,
            "rzzt":units[i].zz,
            "tenantName":units[i].name,
            "rzzq":ks+'至'+js,
            "sf":units[i].rlx,
            "fd":units[i].fdm,
            "fdxx":(units[i].fdm=='') ? '':units[i].fdm+' | '+units[i].fdh,
            "ts":(units[i].zz=='离开') ? '已离开' : units[i].ts < 0 ? '已超时' :'剩' +units[i].ts+'天',
            "tsStype":(units[i].zz=='离开') ? 'span_ts1' : units[i].ts < 0 ? 'span_ts3' :'span_ts2',
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
onShow: function () {  //生命周期函数--监听页面显示
}
})