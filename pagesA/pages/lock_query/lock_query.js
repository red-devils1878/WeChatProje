var search= "";  //搜索内容
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档(新锁)
var app = getApp();
Page({

  data: {  //页面的初始数据
    search:"",
    winWidth: 0,
    winHeight: 0,
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    //获取当前设备的宽高
    wx.getSystemInfo( {
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
    /*
    that.get_myLockList(userid,houseNo,lc,search); //获取门锁设备
    setTimeout(()=>{
      that.scanBle();
    },2000)*/
  },
  goToTop:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  jupLock:function(e){  //门锁操作页面
    let sbid = e.currentTarget.dataset.key;
    wx.navigateTo({
      url: '../../../pagesA/pages/lock_test/lock_test?sbid='+sbid
    })
  },
  submitSearch:function(){  //提交搜索
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
                    if( dev.localName != null && (dev.localName.indexOf("LS-A4") != -1 || dev.localName.indexOf("LS-501") != -1 || dev.localName.indexOf("LS-FFFFFFFFFFFFFFF") != -1 || dev.localName.indexOf("CF100") != -1 || dev.localName.indexOf("H1") != -1)){
                      let _sn = dev.localName.replace("LS-","");
                      var _mac = dev.deviceId; 
                      var _RSSI = dev.RSSI; 
                      //新增代码开始     
                      /*           
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
                      */                       
                      //新增代码结束                           
                      dev.name = _sn.slice(-4);                 
                      dev.mac = _mac;
                      dev.sn = _sn;
                      dev.RSSI = _RSSI;
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