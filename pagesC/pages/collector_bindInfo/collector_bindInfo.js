var hid3 = ""  //位置id
var cjqlx = ""; //采集器类型
var app = getApp();
var apiUrl = app.globalData.apiUrl_LS;   //获取api地址
var apiSB = app.globalData.apiSB;   //水表指令api
var apiDB = app.globalData.apiDB;   //电表指令api
Page({
  data: {  //页面的初始数据
    hiddenYB:true, //显示隐藏
    ptlxIndex: 0,
    txlxIndex: 0,
    showMB:true, //幕布
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl_LS;
    hid3 = options.hid3;
    cjqlx = options.cjqlx;
    if(cjqlx=="sb"){  //水表
      that.get_ptlx("SDI_sb_lx");
    }else if(cjqlx=="db"){  //电表
      that.get_ptlx("SDI_db_lx");
    }
    that.get_txlx(); //获取通讯类型
    that.get_Collector(hid3,cjqlx); //获取已绑采集器
  },
  get_ptlx:function (gys) { //获取平台类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:gys};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        _this.setData({
          ptlx:units
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_txlx:function () { //获取通讯类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'SDI_ptfl'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        _this.setData({
          txlx:units
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_Collector:function (hid3,cjqlx) { //获取已绑采集器
    let _this = this;
    var _data = {ac: 'AZ_get_Collector',"hid3":hid3,"cjqlx":cjqlx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var imageUrl = "../../../static/images/my/wg.png";        
        if(units.length > 0){
          _this.setData({
            hid3:units[0].hid3,
            collectorNo:units[0].equip_no,
            mc:units[0].houseName+units[0].locationName,    
            hiddenYB:false,
            lylx:units[0].ptlx, //供应商
            txlx2:units[0].txlx, //通讯类型
            imageUrl:imageUrl,
          })
        }
        else{
          _this.setData({
            collectorNo:"",
            mc:"",    
            hiddenYB:true,
            lylx:"",
            imageUrl:"",
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
  bindptlxChange: function(e) {  //平台类型改变事件
    this.setData({
      ptlxIndex: e.detail.value
    })
  },
  bindtxlxChange: function(e) {  //通讯类型改变事件
    this.setData({
      txlxIndex: e.detail.value
    })
  },
  //扫码
  scanCode: function(e) {
    var that = this;
    wx.scanCode({
      success (res) {
        //console.log("扫描结果："+decodeURIComponent(res.result));
        let re = decodeURIComponent(res.result);
        let resu = re;
        that.setData({
          result:resu
        })
      }
    })
  },
  Unbind:function(e){  //解绑设备
    var that = this;
    let hid3 = e.currentTarget.dataset.hid3;
    let collectorNo = e.currentTarget.dataset.collectorno;
    let lylx = e.currentTarget.dataset.lylx;
    let txlx = e.currentTarget.dataset.txlx;
    wx.showModal({
      title: '解绑采集器',
      content: '确认解绑？',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          var _data = {ac: 'get_collector_device',"collectorNo":collectorNo,"cjqlx":cjqlx};
          wx.request({
            url: apiUrl,  //api地址
            data: _data,
            header: {'Content-Type': 'application/json'},
            method: "get",
            success(res) {
              var units = res.data.rows;
              if(units.length > 0){
                if(cjqlx=="sb"){ //水表
                  if(lylx=="ZZ"){ //卓正
                    that.ZZ_unRelation_collectorALL(collectorNo);  //ZZ水表解除关联          
                  }
                }
                else if(cjqlx=="db"){ //电表
                  if(lylx=="QC"){ //启程
                    that.QC_unRelation_collectorALL(collectorNo,txlx); //QC电表解除关联           
                  }        
                }
              }
              else{
                that.Unbind_collector(collectorNo);  //解绑采集器
              }
            },
            fail(res) {
              console.log("getunits fail:",res);
            },
            complete(){
            }
          });
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
  formSubmit: function (e){  //绑定
    var that = this;
    var collectorNo = e.detail.value.collectorNo;
    var ptlx = e.detail.value.ptlx;
    var txlx = e.detail.value.txlx;
    var oldDsn = that.data.collectorNo;
    if(!!oldDsn){
      wx.showToast({
        title: '该位置已有设备，请先解绑!',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if(!collectorNo){
      wx.showToast({
        title: '采集器编号不能为空',
        icon: 'error',
        duration: 1000
      })
      return;
    }
    else{
      var _data = {ac: 'AZ_bindCollector_save',"hid3":hid3,"collectorNo":collectorNo,"cjqlx":cjqlx,"ptlx":ptlx,"txlx":txlx};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          let _msg = res.data.msg;
          wx.showToast({
            title: _msg,
            icon: 'success',
            duration: 1000
          })
          setTimeout(()=>{
            if(res.data.status=="1"){
              wx.navigateBack({
                delta: 1,
              }) 
            }
          },1000)
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });
    }
  },
  ZZ_unRelation_collectorALL:function(collectorNo){  //ZZ水表解除关联
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '解除关联中...',
    })
    let jk = '/zz/wm/mbus/set/removeAll/'+collectorNo+''; //接口
    wx.request({
     url: apiSB+jk,  //水表指令的api
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(!!_res.success){
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.hideLoading();  //关闭提示框
        that.Unbind_collector(collectorNo);  //解绑采集器
      }
      else{
        that.setData({
          showMB:true,  //显示幕布
        })  
        wx.showToast({
          title: '解除失败',
          icon: "error",
          duration: 1000
        })
      }
     },
     fail(res) {
     },
     complete(){
      that.setData({
        showMB:true,  //显示幕布
      })
      wx.hideLoading();  //关闭提示框
     }
   });
  },
  QC_unRelation_collectorALL:function(collectorNo,txlx){  //QC电表解除关联
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '解除关联中...',
    })
    let jk = ""; //接口
    if(txlx == "485"){  //485
      jk = '/qc/am/485/removeAll/'+collectorNo+''; //接口
    }else if(txlx == "LORA"){  //LORA
      jk = '/qc/am/lora/removeAll/'+collectorNo+''; //接口
    }
    wx.request({
     url: apiDB+jk,  //电表指令的api
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(!!_res.success){
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.hideLoading();  //关闭提示框
        that.Unbind_collector(collectorNo);  //解绑采集器
      }
      else{
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.showToast({
          title: '解除失败',
          icon: "error",
          duration: 1000
        })
      }
     },
     fail(res) {
     },
     complete(){
      that.setData({
        showMB:true,  //显示幕布
      })
      wx.hideLoading();  //关闭提示框
     }
   });
  },
  Unbind_collector:function(collectorNo){  //解绑采集器
    var that = this;
    var _data = {ac: 'AZ_Unbind_Collector',"hid3":hid3,"cjqlx":cjqlx,"collectorNo":collectorNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.showToast({
            title: '解绑成功',
            icon: "success",
            duration: 1000
          });
          setTimeout(()=>{
            that.get_Collector(hid3,cjqlx); //获取已绑采集器
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
  onShow: function () {  //生命周期函数--监听页面显示

  }
})