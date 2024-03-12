var mac= "";  //设备号
var search= "";  //搜索内容
var SdDJ = "";//开始时间
var EdDJ = "";//结束时间
var mysl = 20; //每页数量
var page_total = 0; //总页数
var fyQJ = [];  //房源数组
var app = getApp();
var apiUrl = "";   //获取api地址
var apiNC = "";     //获取门锁api地址(新锁)
var BLE_new = require('../../utils/BLE_new.js');  //蓝牙操作文档(新锁)
var lylx= "";  //供应商类型
var ljzt= false;  //连接状态
var bleN= "";  //蓝牙号
var ptlx= "hongqi";  //平台类型
Page({
  data: {
    showsearch:true,   //显示搜索按钮
    searchtext:'',  //搜索文字
    filterdata:{},  //筛选条件数据
    showfilter:false, //是否显示下拉筛选
    showfilterindex:null, //显示哪个筛选类目
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    detail_master:false, 
    detail_djDate:true, //查询待缴日期
    currentDJ: "jintian",
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    mac = options.mac;
    var that = this;
    apiUrl = app.globalData.apiUrl;
    apiNC = app.globalData.apiNC;
    //获取当前设备的宽高
    wx.getSystemInfo( { 
        success: function( res ) {
            that.setData( {
              winWidth: res.windowWidth,
              winHeight: res.windowHeight,
            });
        }
    });
    that.initDate();//初始化日期
    that.get_mcToMS(mac); //获取设备号
    //this.get_kmjl(mac,search,SdDJ,EdDJ); //获取开门记录
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
  get_mcToMS:function (dsn) { //获取设备号
    let _this = this;
    var _data = {ac: 'get_mcToMS',"dsn":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          lylx = units[0].lx,
          bleN = units[0].bleName;
        }
      },
      fail(res) {
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
     //this.get_kmjl(mac,search,SdDJ,EdDJ); //获取开门记录
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
  get_kmjl:function (mac,search,SdDJ,EdDJ) { //获取开门记录
    let _this = this;
    fyQJ = [];  //初始化房源数组
    _this.setData({
      servicelist:[]
    })
    this.setData({
        page:1
      })
      const page = this.data.page;
      /*
      var tips = "加载中...";
      wx.showLoading({
       title: tips,
      })*/
    var _data = {ac: 'get_openLock',"mac":mac,"search":search,"SdDJ":SdDJ,"EdDJ":EdDJ};
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
                  "id":units[i].mac,
                  "name":units[i].yh,
                  "kmlx":units[i].kmlx,
                  "kmrq":units[i].kmrq
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
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      showsearch:1,
      searchtext:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    var that = this;
    console.log(this.data.searchtext);
    search = this.data.searchtext;
    var tips = "加载中...";
    wx.showLoading({
     title: tips,
    })
    if(lylx=="1"){ //旧锁
      wx.hideLoading();
      that.get_kmjl(mac,search,SdDJ,EdDJ); //获取开门记录
    }
    else if(lylx=="2"){ //新锁
      ljzt = BLE_new.connectionState();//连接状态
      if(ljzt){  //连接中
        that.upload_record(mac,1); //上报日志
      }
      else{  //未连接
        console.log("连接状态："+ljzt);
        var Stime = SdDJ+' 00:00:00';
        var Etime = EdDJ+' 23:59:00';
        that.open_record(mac,Stime,Etime); //获取开门记录   
      }
    }else if(lylx=="5" || lylx=="6" || lylx=="20" || lylx=="21"){
      wx.hideLoading();
      that.get_kmjl(mac,search,SdDJ,EdDJ); //获取开门记录       
    }
  },
  upload_record:function (mac,index) {  //上报日志
    var that = this;
    var xfbs = "下发中";
    var Stime = SdDJ+' 00:00:00';
    var Etime = EdDJ+' 23:59:00';
    var _data1 = {"deviceSn":mac,"cmd":'0205',"syncNo":''};
    //第一次请求指令
    wx.request({
      url: apiNC+'cloud_function',  //api地址
      data: _data1,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      dataType: 'application/json',
      async:false,  //同步
      success(res) {
        let _res = JSON.parse(res.data);
        let cmd =_res.data;
        var cmdId = 0;
        BLE_new.sendCommand(cmd,function(res){
          if(res.errCode==0){
            setTimeout(function(){
              var _data3 = {"deviceSn":mac,"data":res.data};
              //结果请求解析
              wx.request({
              url: apiNC+'cloud_function_parse',
              data: _data3,
              header: {'Content-Type': 'application/json'},
              method: "POST",
              dataType: 'application/json',
              async:false,  //同步
              success(res) {
                let _res = JSON.parse(res.data);
                if(_res.code == 0 ){
                  if(xfbs=='已完成'){
                    return;
                  }
                  else {
                    if( index == _res.data ) {
                      console.log("操作成功0205");
                      xfbs='已完成';
                      that.open_record(mac,Stime,Etime); //获取开门记录
                    }else{
                      index += 1;
                      that.upload_record(mac,index);
                    }
                  }
                }                      
              },
              fail(res) {
                //console.log("getunits fail:",res);
              },
              complete(){
              }
              });
            },50);
          }
          else{
            wx.showToast({
              title: '操作失败',
              icon: "none",
              duration: 1000
            })
          }
        });
    },
    fail(res) {
    },
    complete(){
    }
    });
  },
  open_record:function (mac,Stime,Etime) {  //获取开门记录
    var that = this;
    var tips = "加载中...";
    wx.showLoading({
     title: tips,
    })
    var _data1 = {"deviceSn":mac,"beginTime":Stime,"endTime":Etime,"pageNo":1,"pageSize":1000};
    wx.request({
      url: apiNC+'open_record',  //api地址
      data: _data1,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      dataType: 'application/json',
      async:false,  //同步
      success(res) {
        let _res = JSON.parse(res.data);
        let units = _res.data.list;
        if(!units){
          wx.hideLoading();
          wx.showToast({
            title: _res.msg,
            icon: "none",
            duration: 1000
          })
          return false;
        }
        if(units.length > 0){
          for (var i = 0; i < units.length; i++){
            var j = 0;
            setTimeout(function () {
            that.insert_OpenRecord(units[j].openId,units[j].openLockType,units[j].openLockTime,units[j].createTime,units[j].keyAlias,units[j].deviceSn,units[j].hardwareId);
            j++    
            }, i * 50);                                 
          }
          setTimeout(function () {
            that.get_kmjl(mac,search,SdDJ,EdDJ); 
          }, units.length * 50+100);
        }
        else{
          wx.hideLoading();
          wx.showToast({
            title: '没数据',
            icon: "none",
            duration: 1000
          })
        }
      },
      fail(res) {
        wx.hideLoading();  
      },
      complete(){
      }
    });
  },
  //新锁插入开门日志
  insert_OpenRecord:function(openId,openLockType,openLockTime,createTime,keyAlias,deviceSn,hardwareId){
    var keyAlias = keyAlias;
    if(keyAlias*1 > 0)
    {
      keyAlias = "动态"+keyAlias.substr(4,1)+"号";
    }
    if(hardwareId==null){
      hardwareId = "";
    }    
    var _data = {ac: 'insert_OpenRecord',"openId":openId,"openLockType":openLockType,"openLockTime":openLockTime,"createTime":createTime,"keyAlias":keyAlias,"deviceSn":deviceSn,"hardwareId":hardwareId};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
      },
      fail(res) {
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
                "id":units[i].mac,
                "name":units[i].yh,
                "kmlx":units[i].kmlx,
                "kmrq":units[i].kmrq
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
})