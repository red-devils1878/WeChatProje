var item = ""; //项目
var hid = ""  //房间id
var sblx = ""; //设备类型
var app = getApp();
var apiUrl = app.globalData.apiUrl_LS;   //获取api地址
Page({
  data: {  //页面的初始数据
    hiddenYB:true, //显示隐藏
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    item = options.item;
    hid = options.hid;
    sblx = options.sblx;
    that.get_roomSB(item,hid,sblx); //获取房间设备
  },
  get_roomSB:function (item,hid,sblx) { //获取设备详情
    let _this = this;
    var _data = {ac: 'get_roomSB',"item":item,"hid":hid,"sblx":sblx};
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
          _this.setData({
            hid:units[0].hid,
            dsn:units[0].equip_no,
            mc:units[0].equip_name,    
            wgh:units[0].wgh,
            hiddenYB:false,
            imageUrl:imageUrl,
          })
        }
        else{
          _this.setData({
            dsn:"",
            mc:"",    
            wgh:"",
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
  //扫码网关号
  scanCodeWG: function(e) {
    var that = this;
    wx.scanCode({
      success (res) {
        //console.log("扫描结果："+decodeURIComponent(res.result));
        let re = decodeURIComponent(res.result);
        let resu = re;
        that.setData({
          result_wg:resu
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
          var _data = {ac: 'Unbind_sb',"item":item,"hid":hid,"sblx":sblx,"dsn":dsn};
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
                  that.get_roomSB(item,hid,sblx); //获取房间设备
                },1000)
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
    var dsn = e.detail.value.dsn;
    var wg = e.detail.value.wg;
    var imei = e.detail.value.imei;
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
      var _data = {ac: 'bindLock_save',"item":item,"hid":hid,"dsn":dsn,"sblx":sblx,"wg":wg,"imei":imei};
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
  onShow: function () {  //生命周期函数--监听页面显示

  }
})