var app = getApp();
var apiUrl = "";   //获取api地址
var aiotAPI = "";   //水电表指令的api
var apiDB = app.globalData.apiDB;   //电表指令api
var dsn = ""; //设备号
var hid = ""; //房间id
var ptlx = ""; //通讯方式
var lylx= "";  //供应商类型
var ffms= "";  //付费模式
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
      //dsn = "NL0909798";
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
      that.ammeter_info(dsn);  //获取电表详情
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
              price:units[0].ele_price,
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
    ammeter_info:function (mac) { //获取电表详情
      let _this = this;
      var _data = {ac: 'ammeter_info',"mac":mac};
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
            ffms = units[0].payment_mode;
            collectorSn = units[0].collectorSn;
            sydl = units[0].surplus;
            _this.setData({
              sxds:units[0].afterPower,
              dqds:units[0].allpower,
              //sydl:(units[0].afterPower-units[0].allpower).toFixed(2),
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
      //that.jump_pay();
      let je = this.data.amount;
      if(je > 0){
        console.log("金额:"+je);
        if(ptlx =="fd"){
          that.get_energyPrice(dsn,'db',je); //获取电费单价
        }
        else{
          if(lylx=="3"){ //启程
            if(ffms=="1"){  //代表预付费，2代表后付费
              that.get_energyPrice(dsn,'db',je); //获取电费单价
            }
            else{
              wx.showToast({
                title: '后付费模式不支持此功能',
                icon: "none",
                duration: 2000
              })
            }
          }
          else{
            wx.showToast({
              title: '不支持此功能',
              icon: "none",
              duration: 2000
            })  
          }   
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
            var price = units[0].price;
            var value = 1; //充值电量
            if(ptlx=="fd"){
              value = Math.round((je/price)*100); //充值电量
              console.log("计算电量："+value);
              setTimeout(()=>{
                _this.chongzhi_dl(dsn,value,je,price);  //电表充值
              },100)
            }
            else{
              if(lylx=="3"){
                value = (je/price).toFixed(2); //充值电量
                console.log("计算电量："+value);
                setTimeout(()=>{
                  _this.QC_recharge(dsn,value,je,price,ptlx);  //电表充值
                },100)
              }
              else{
                wx.showToast({
                  title: '其他厂商电表',
                  icon: "none",
                  duration: 2000
                })                
              }
            }
          }
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
    },
    chongzhi_dl:function(devid,value,je,price){  //电表充值
      var that = this;
      let surplus = sydl*1+(value/100).toFixed(2);  //充后剩余度数
      var _data = '{ac: "threshold","deviceId":"'+devid+'","value":"'+value+'"}'
      wx.request({
       url: aiotAPI+'em/threshold',  //水电表指令的api
       data: _data,
       header: {'Content-Type': 'application/json'},
       method: "POST",
       dataType: 'application/json',
       async:false,  //同步 
       success(res) {
        let _res = JSON.parse(res.data);
        if(_res.Code == 0 ){
          let rePower = (value/100).toFixed(2);
          that.update_afterPower(dsn,rePower); //更新电量上限
          that.insert_RechargeLog(userid,dsn,rePower,je,price,'朗思管家端','线下充值','电表',surplus);
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
  //更新电量上限
  update_afterPower:function(sbh,value){
    var _data = {ac: 'update_afterPower',"sbh":sbh,"value":value};
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
  QC_recharge: function(dsn,value,je,price,ptlx) {  //电表充值
    var that = this;
    let jk = ""; //接口
    let _data = ""; //参数
    let surplus = (sydl*1+value*1).toFixed(2);  //充后剩余度数
    if(ptlx == "4G"){  //4G
      jk = '/qc/am/4g/prepaid/recharge';
      _data = '{"comAddr":"'+dsn+'","concentratorAddr":"","rechargeValue":"'+value+'"}'
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/prepaid/recharge';
      _data = '{"comAddr":"'+dsn+'","concentratorAddr":"'+collectorSn+'","rechargeValue":"'+value+'"}'
    }else if(ptlx == "485"){  //485
      jk = '/qc/am/485/prepaid/recharge';
      _data = '{"comAddr":"'+dsn+'","concentratorAddr":"'+collectorSn+'","rechargeValue":"'+value+'"}'
    }
    wx.request({
      url: apiDB+jk,  //电表指令的api
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      dataType: 'application/json',
      async:false,  //同步 
      success(res) {
       let _res = JSON.parse(res.data);
       if(!!_res.success ){
        that.insert_RechargeLog(userid,dsn,value,je,price,'朗思管家端','线下充值','电表',surplus);
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
           title: _res.message,
           icon: "none",
           duration: 2000
         })
         console.log(_res.Code+'——>>'+_res.message);
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
  jump_pay: function (){  //跳转到蜂电支付
    var that = this;
    let uuid = "628dcd540ae10f72e5a23792";
    let je = 0.1;
    let ddh = "42000020230110000003"
    wx.navigateToMiniProgram({
      appId: 'wxa095332490a84354',
      path: '../../../pages/index/index?ACTION=AMMETER_RECHARGE&DeviceCode='+uuid+'&RechargeAmount='+je+'&AgencyOrderNo='+ddh,
 　   extraData: {
        foo: 'bar'
      },
 　   envVersion: 'release',// 打开正式版
      success(res) {
        console.log(res) // 打开成功    
 　　 },
      fail: function (err) {
        console.log(err);
      },
 　　　complete(res){
       // 调用结束  不管成功还是失败都执行
      }
   　  /**
    　　* appId：跳转到的小程序app-id
    　　* path：打开的页面路径，如果为空则打开首页，path 中 ? 后面的部分会成为 query，在小程序的 App.onLaunch、App.onShow 和 Page.onLoad的回调函数中获取query数据
    　　* extraData：需要传递给目标小程序的数据，目标小程序可在 App.onLaunch、App.onShow 中获取到这份数据
    　　* envVersion：要打开的小程序版本，有效值: develop（开发版），trial（体验版），release（正式版），仅在当前小程序为开发版或体验版时此参数有效，如果当前小程序是正式版，则打开的小程序必定是正式版
    　　*/ 
    })
  },
  onShow: function () {  //生命周期函数--监听页面显示

  },
})