var app = getApp();
var apiUrl = "";   //获取api地址
var aiotAPI = "";   //水电表指令的api
var apiSB = app.globalData.apiSB;   //水表指令api
var dsn = ""; //设备号
var hid = ""; //房间id
var ptlx = ""; //通讯方式
var lylx= "";  //供应商类型
var userid= "";  //登陆人工号
var openid= "";  //微信id
var collectorSn= "";  //采集器编号
var sydl= 0; //剩余度数
Page({
    data: {  //页面的初始数据
      winWidth: 0,
      winHeight: 0,
      amount: 0,
    },
    onLoad: function (options) {  //生命周期函数--监听页面加载
      var that = this;
      hid = options.hid;
      dsn = options.dsn;
      apiUrl = app.globalData.apiUrl;   //获取api地址
      aiotAPI = app.globalData.aiotAPI;   //水电表指令的api
      openid = app.globalData.openid;   //微信id
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
      that.house_info(hid);  //获取房间详情
      that.waterMeter_info(dsn);  //获取水表详情
    },
    house_info:function (hid) { //获取房间详情
      let _this = this;
      var _data = {ac: 'house_info',"hid":hid};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            _this.setData({
              skf:units[0].ssmd,
              houseName:units[0].houseName+'.'+units[0].roomNo,
              price:units[0].cWater_price,
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
    waterMeter_info:function (mac) { //获取水表详情
      let _this = this;
      var _data = {ac: 'waterMeter_info',"mac":mac};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            ptlx = units[0].ptlx;
            lylx = units[0].lx;
            collectorSn = units[0].collectorSn;
            sydl = units[0].surplus;     
            _this.setData({
              sxds:units[0].surplus,
              dqds:units[0].allpower,
              sydl:units[0].surplus,
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
    swichJE: function(e) { //选择金额
      var that = this;
      let czje = e.target.dataset.je;
      that.setData({
        amount: czje
      })
    },
    jeChange: function(e) {   //输入金额
      var that = this;
      let inputValue = e.detail.value;
      that.setData({
        amount: inputValue
      })
    },
    bindPay:function(e){  //支付
      var that = this;
      let je = this.data.amount;
      if(je > 0){
        console.log("金额:"+je);
        if(ptlx =="fd"){
          that.get_energyPrice(dsn,'sb',je); //获取电费单价
        }
        else{
          wx.showToast({
            title: '不支持此功能',
            icon: "none",
            duration: 2000
          })
        }
      }
      else{
        wx.showToast({
          title: '充值金额必须大于0',
          icon: "none",
          duration: 1000
        })       
      }
    },
    get_energyPrice:function (sbh,sblx,je) { //获取电费单价
      let _this = this;
      var _data = {ac: 'get_energyPrice',"sbh":sbh,"sblx":sblx};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        async:false,  //同步
        success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            let price = units[0].price;
            let value = Math.round((je/price)*100); //充值水量
            console.log("计算水量："+value);
            setTimeout(()=>{
              _this.chongzhi_sl(dsn,value,je,price);  //水表充值
            },100)
          }
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
    },
    chongzhi_sl:function(devid,value,je,price){  //水表充值
      var that = this;
      let surplus = sydl*1+(value/100).toFixed(2);  //充后剩余度数
      var _data = '{ac: "threshold","deviceId":"'+devid+'","value":"'+value+'"}'
      wx.request({
       url: aiotAPI+'wm/threshold',  //水电表指令的api
       data: _data,
       header: {'Content-Type': 'application/json'},
       method: "POST",
       dataType: 'application/json',
       async:false,  //同步 
       success(res) {
        let _res = JSON.parse(res.data);
        if(_res.Code == 0 ){
          let rePower = (value/100).toFixed(2);
          that.insert_RechargeLog(userid,dsn,rePower,je,price,'朗思管家端','线下充值','水表',surplus);
          wx.showToast({
            title: '充值成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            wx.navigateBack({
              delta: 1,
            }) 
          },1000)
        }
        else{
          wx.showToast({
            title: _res.Message,
            icon: "none",
            duration: 2000
          })
          console.log(_res.Code+'——>>'+_res.Message);
        }
       },
       fail(res) {
       },
       complete(){
       }
     });
    },
  //插入充值日志
  insert_RechargeLog:function(userid,sbh,value,je,price,czly,czlx,sblx,surplus){
    var _data = {ac: 'insert_RechargeLog',"userid":userid,"sbh":sbh,"value":value,"je":je,"price":price,"czly":czly,"czlx":czlx,"sblx":sblx,"surplus":surplus};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
      },
      fail(res) {
      },
      complete(){
      }
    });
  },
  onShow: function () {  //生命周期函数--监听页面显示

  },
})