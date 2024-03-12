var hid = ""  //房间id
var sblx = ""; //设备类型
var lylx = ""; //供应商类型
var ptlx = ""; //通讯类型
var collectorSn = ""; //采集器编号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiSB = app.globalData.apiSB;   //水表指令api
var apiDB = app.globalData.apiDB;   //电表指令api
Page({
  data: {  //页面的初始数据
    hiddenYB:true, //显示隐藏
    ptlxIndex: 2,
    txlxIndex: 4,
    showMB:true, //幕布
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl; 
    hid = options.hid;
    sblx = options.sblx;
    if(sblx=="sb"){  //水表
      that.get_ptlx("SDI_sb_lx");
    }else if(sblx=="db"){  //电表
      that.get_ptlx("SDI_db_lx");
    }
    that.get_txlx(); //获取通讯类型
    that.get_roomSB(hid,sblx); //获取房间设备
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
  get_roomSB:function (hid,sblx) { //获取设备详情
    let _this = this;
    var _data = {ac: 'AZ_get_roomSB',"hid":hid,"sblx":sblx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var imageUrl = "";
        if(sblx=="ms"){
          imageUrl = "../../../static/images/my/ms.png";
        }
        else if(sblx=="sb"){
          imageUrl = "../../../static/images/my/sb.png";
        }
        else if(sblx=="db"){
          imageUrl = "../../../static/images/my/db.png";
        }        
        if(units.length > 0){
           lylx = units[0].lylx; //供应商类型
           ptlx = units[0].ptlx; //通讯类型
           collectorSn = units[0].wgh; //采集器编号
          _this.setData({
            hid:units[0].hid,
            dsn:units[0].equip_no,
            mc:units[0].equip_name,    
            hiddenYB:false,
            imageUrl:imageUrl,
          })
        }
        else{
          lylx = "";
          ptlx = "";
          collectorSn = "";
          _this.setData({
            dsn:"",
            mc:"",    
            hiddenYB:true,
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
  //扫码IMEI号
  scanCodeIMEI: function(e) {
    var that = this;
    wx.scanCode({
      success (res) {
        let re = decodeURIComponent(res.result);
        let resu = re;
        that.setData({
          result_imei:resu
        })
      }
    })
  },
  Unbind:function(e){  //解绑设备
    var that = this;
    let hid = e.currentTarget.dataset.hid;
    let dsn = e.currentTarget.dataset.dsn;
    console.log("hid:"+hid);
    console.log("dsn:"+dsn);
    wx.showModal({
      title: '解绑设备',
      content: '确认解绑？',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          if(!collectorSn){  //采集器为空，直接解绑设备
            that.Unbind_sb(dsn); //解绑设备
          }
          else{
            if(sblx=="sb"){ //水表
              if(lylx=="3"){ //卓正
                if(ptlx=="M-BUS"){
                  that.ZZ_unRelation_collector(collectorSn,dsn,ptlx);  //解除关联
                }
                else if(ptlx=="LORA"){
                  that.ZZ_unRelation_collector(collectorSn,dsn,ptlx);
                }
              }
            }
            else if(sblx=="db"){ //电表
              if(lylx=="3"){ //启程
                if(ptlx=="485"){
                  that.QC_unRelation_collector(collectorSn,dsn,ptlx);  //解除关联
                }
                else if(ptlx=="LORA"){
                  that.QC_unRelation_collector(collectorSn,dsn,ptlx);
                }
              }
            }
          }
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
  formSubmit: function (e){  //绑定
    var that = this;
    var dsn = e.detail.value.dsn;
    var txlx = e.detail.value.txlx;
    var ptlx = e.detail.value.ptlx;
    var oldDsn = that.data.dsn;
    if(!!oldDsn){
      wx.showToast({
        title: '该房间已有设备，请先解绑!',
        icon: 'none',
        duration: 1000
      })
      return;
    }
    if(!dsn){
      wx.showToast({
        title: '设备号不能为空',
        icon: 'error',
        duration: 1000
      })
      return;
    }
    else{
      var _data = {ac: 'AZ_bindSB_save',"ptlx":ptlx,"txlx":txlx,"hid":hid,"dsn":dsn,"sblx":sblx};
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
  ZZ_unRelation_collector:function(collectorNo,deviceSn,ptlx){  //ZZ水表解除关联
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '解除关联中...',
    })
    let jk = ""; //接口
    if(ptlx == "M-BUS"){  //M-BUS
      jk = '/zz/wm/mbus/set/removeSubmeter/'+collectorNo+'/'+deviceSn+'';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/zz/wm/lora/set/removeSubmeter/'+collectorNo+'/'+deviceSn+'';
    }
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
        that.Unbind_sb(deviceSn);
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
  QC_unRelation_collector:function(collectorNo,deviceSn,ptlx){  //QC电表解除关联
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '解除关联中...',
    })
    let jk = ""; //接口
    if(ptlx == "485"){  //485
      jk = '/qc/am/485/removeSubmeter';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/removeSubmeter';
    }
    var _data = '{"comAddr":"'+deviceSn+'","concentratorAddr":"'+collectorNo+'"}'
    wx.request({
     url: apiDB+jk,  //电表指令的api
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      that.setData({
        showMB:true,  //显示幕布
      })    
      let _res = JSON.parse(res.data);
      if(!!_res.success){
        wx.hideLoading();  //关闭提示框
        that.Unbind_sb(deviceSn);
      }
      else{
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
  Unbind_sb:function(deviceSn){  //解绑设备
    var that = this;
    var _data = {ac: 'AZ_Unbind_sb',"hid":hid,"sblx":sblx,"dsn":deviceSn};
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
            that.get_roomSB(hid,sblx); //获取房间设备
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