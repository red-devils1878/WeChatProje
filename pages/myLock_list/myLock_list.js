var search= "";  //搜索内容
var lc= "";  //楼层
var houseNo= "";  //楼栋
var userid= "";  //登陆人工号
var QZ= "";
var BLE = require('../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../utils/BLE_new.js');  //蓝牙操作文档(新锁)
var app = getApp();
var apiUrl = "";   //获取api地址
Page({

  data: {  //页面的初始数据
    lc:'',
    search:"",
    winWidth: 0,
    winHeight: 0,
    fyIndex: 0,
    total: 0,
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    userid = app.globalData.userid;   //登陆人工号
    QZ = app.globalData.QZ; 
    //获取当前设备的宽高
    wx.getSystemInfo( {
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
    that.get_house(); //获取房源
    /*
    that.get_myLockList(userid,houseNo,lc,search); //获取门锁设备
    setTimeout(()=>{
      that.scanBle();
    },2000)*/
  },
  get_house:function () { //获取房源
    let _this = this;
    var _data = {ac: 'get_houseName',"userid":userid};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var fy = res.data.rows;   
          _this.setData({
            fy:fy
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_myLockList:function (userid,houseNo,lc,search) { //门锁列表
    let _this = this;
    _this.setData({
      servicelist:[],
      total:0
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = "";
    if(QZ == "jianxin" || QZ == "anju" || QZ == "jinyuan" || QZ == "iot"){
      _data = {ac: 'myLock_list',"userid":userid,"houseNo":houseNo,"lc":lc,"search":search};
    } 
    else{
      _data = {ac: 'myLockGJ_list',"userid":userid,"houseNo":houseNo,"lc":lc,"search":search};   
    }
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          let total = units.length;
          if(!total){
            total = 0;
          }
          for (var i = 0; i < units.length; i++) {
            newlist.push({
              "id":units[i].dsn,
              "name":units[i].mc,
              "imgurl":"/static/images/my/02.png",
              "imgurl2":units[i].yjlx=='门锁低电' ? "/static/images/my/dianchi2.png":"/static/images/my/dianchi.png",
              "dl":units[i].dcdl,
              "bleName":units[i].bleName,
              "find":"",
              "singVal":units[i].singVal,
            })
          } 
          setTimeout(()=>{
            _this.setData({
              servicelist:newlist,
              total:total
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
  bindFYChange: function(e) {
    this.setData({
      fyIndex: e.detail.value
    })
    houseNo = this.data.fy[e.detail.value].houseNo;
  },
  goToTop:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  inputLC:function(e){
    this.setData({
      lc:e.detail.value
    })
  },
  inputsbh:function(e){
    this.setData({
      search:e.detail.value
    })
  },
  jupLock:function(e){  //门锁操作页面
    let dsn = e.currentTarget.dataset.key;
    if(QZ == "jianxin" || QZ == "anju" || QZ == "jinyuan" || QZ == "iot"){
      wx.navigateTo({
        url: '../../pagesA/pages/myLockYY/myLockYY?dsn='+dsn
      })
    }
    else{
      wx.navigateTo({
        url: '../../pagesA/pages/myLock/myLock?dsn='+dsn
      })
    }
  },
  submitSearch:function(){  //提交搜索
    lc = this.data.lc;
    search = this.data.search;
    this.get_myLockList(userid,houseNo,lc,search); //获取门锁设备
    BLE_new.closeBLEConnection(); //蓝牙断开连接
    setTimeout(()=>{
      this.scanBle();  //搜索门锁
    },2000)
  },
  scanBle: function() {
    var _this = this
    _this.setData({
      scanDevices: []
    })
    //初始化
    wx.openBluetoothAdapter({
      success: function(res) {
        //扫描设备
        wx.startBluetoothDevicesDiscovery({
          services: [],
          success: function(res) {
            wx.onBluetoothDeviceFound(function(obj) {
              var temp = _this.data.scanDevices
              if (obj.devices[0].name) {
                obj.devices.map(dev => {
                  let pDev = temp.find((it) => {
                    return it.deviceId == dev.deviceId
                  })
                  if (!pDev) {
                    const _deviceId = dev.deviceId;              
                    if( dev.localName != null && (dev.localName.indexOf("LS-A4") != -1 || dev.localName.indexOf("LS-501") != -1 || dev.localName.indexOf("LS-FFFFFFFFFFFFFFF") != -1 || dev.localName.indexOf("CF100") != -1)){
                      let _sn = dev.localName.replace("LS-","");
                      var _mac = dev.deviceId; 
                      //新增代码开始                
                      for (var j = 0; j < _this.data.servicelist.length; j++){
                        var sbh2 = _this.data.servicelist[j].id;
                        var sbh = sbh2.replace(/:/g, "");
                        var bleN = _this.data.servicelist[j].bleName;
                        if(sbh==_sn || bleN==_sn){
                        var servicelist = _this.data.servicelist;
                        servicelist[j].find="找到"
                        _this.setData({                
                          servicelist
                        })
                        }
                      }                         
                      //新增代码结束                           
                      dev.name = _sn.slice(-4);                 
                      dev.mac = _mac;
                      dev.sn = _sn;
                      temp.push(dev);            
                    }
                  }
                })
              }
              _this.setData({
                scanDevices: temp
              })
            })
          },
          fail: (res) => {
            wx.hideLoading()
            wx.showToast({
              title: '扫描失败',
              icon: 'success',
              duration: 2000
            })
            //扫描失败
          },
          complete: function(res) {
            //扫描完成
          }
        })
      },
      fail: function(res) {
        wx.showToast({
          title: '请打开蓝牙',
          icon: 'error',
          duration: 1000
        })
      },
      complete: function(res) {
        // 初始化完成
      }
    })
  },
  onShow: function () {  //生命周期函数--监听页面显示
   //this.get_myLockList(userid,houseNo,lc,search); 
   BLE_new.closeBLEConnection();
   /*
   setTimeout(()=>{
     this.scanBle();  //搜索门锁
   },2000)
   */
  }
})