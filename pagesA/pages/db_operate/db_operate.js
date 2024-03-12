var dsn= "";  //设备号
var sbName = "" //设备名称
var userid= "";  //登陆人工号
var hid= "";  //房间id
var lylx= "";  //供应商类型
var ptlx= "";  //通讯类型
var ffms= "";  //付费模式
var collectorSn= "";  //采集器编号
var price= "1";  //电费单价
var app = getApp();
var apiUrl = "";   //获取api地址
var aiotAPI = "";   //水电表指令的api
var apiDB = app.globalData.apiDB;   //电表指令api
Page({

  data: {  //页面的初始数据
    winWidth: 0,
    winHeight: 0,
    detail_jbxx:true,
    detail_yd:true,
    ifName: false,
    arrow_jbxx: 'arrow_bottom',
    arrow_yd: 'arrow_bottom',
    showMB:true, //幕布
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    dsn = options.dsn;
    apiUrl = app.globalData.apiUrl;   //获取api地址
    aiotAPI = app.globalData.aiotAPI;   //水电表指令的api
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
    that.get_msInfo(dsn,'db');  //获取设备详情
    that.ammeter_info(dsn);  //获取电表详情
    that.get_energyPrice(dsn,'db'); 
  },
  ammeter_info:function (dsn) { //获取电表详情
    var _data = {ac: 'ammeter_info',"mac":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          hid = units[0].hid;
          collectorSn = units[0].collectorSn;
        }
      },
      fail(res) {
      },
      complete(){
      }
    });
  },
  get_msInfo:function (dsn,LX) { //获取设备详情
    let _this = this;
    var _data = {ac: 'get_deviceInfo',"dsn":dsn,"LX":LX};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let hx = (units[0].collectorSn=='') ? '':units[0].bdsj;
          let ks = (units[0].guarantee_state);
          let js = (units[0].guarantee_end);
          let tbsj = (units[0].lasttime);
          //hx = hx.replace('/','-').replace('/','-');
          ks = ks.replace('0:00:00','').replace('/','-').replace('/','-');
          js = js.replace('0:00:00','').replace('/','-').replace('/','-');
          tbsj = tbsj.replace('/','-').replace('/','-');
          lylx = units[0].lx;
          ptlx = units[0].ptlx;
          ffms = units[0].payment_mode;
          _this.setData({
            dsn:units[0].mac,
            mc:units[0].mc,    
            bdwg:(units[0].collectorSn=='') ? '无':units[0].collectorSn,
            zt:(units[0].online=='1') ? '在线':'离线',      
            hx:hx,
            ks:ks,
            js:js,
            zxsbsj:tbsj,
            dqyd:units[0].allpower+'度',
            dbzt:(units[0].value=='1') ? '合闸':'拉闸',
            tzyz:(units[0].allpower*1+units[0].surplus*1)+'度',
            tzed:'0度',
            zdgl:units[0].voltage,
            pxds:units[0].allpower+'度',
            uuid:units[0].uuid,
            sydl:units[0].surplus,
            paymentMode:units[0].payment_mode,
            ptlx:units[0].ptlx,
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
  tapDB: function(e) {  //电表
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let dsn = e.currentTarget.dataset.key;
    let url = "";
    if (index == '1') {  //基本信息
      let arrow_jbxx="arrow_bottom";
      let jbxx=!this.data.detail_jbxx;
      if(jbxx){
        arrow_jbxx = "arrow_bottom";
      }
      else{
        arrow_jbxx = "arrow_top";
      }
      _this.setData({
        detail_jbxx:jbxx,
        arrow_jbxx:arrow_jbxx
      })
    }else if ( index == '2' ) {  //用电
      //url = '/pages/db_pxds/db_pxds?dsn='+dsn;
      let arrow_yd="arrow_bottom";
      let yd=!this.data.detail_yd;
      if(yd){
        arrow_yd = "arrow_bottom";
      }
      else{
        arrow_yd = "arrow_top";
      }
      _this.setData({
        detail_yd:yd,
        arrow_yd:arrow_yd
      })    
    }else if ( index == '3' ) {  //操作记录
      url = '../../../pagesA/pages/db_czjl/db_czjl?dsn='+dsn;
    }else if ( index == '4' ) {  //异常记录
      url = '../../../pagesA/pages/db_ycjl/db_ycjl?dsn='+dsn;
    }else if ( index == '5' ) {  //替换设备
      //url = '../../../pagesA/pages/db_thsb/db_thsb?dsn='+dsn;
      wx.showToast({
        title: '功能开发中~',
        icon: "none",
        duration: 500
      })
    }else if ( index == '6' ) {  //删除设备
      wx.showToast({
        title: '功能开发中~',
        icon: "none",
        duration: 500
      })
    }else if ( index == '7' ) {  //读数上报
      url = '../../../pagesA/pages/db_ydjl/db_ydjl?dsn='+dsn;
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  tapYD: function(e) {  //用电
    let that = this;
    let index = e.currentTarget.dataset.index;
    let dbsbh = e.currentTarget.dataset.key;
    let url = "";
    if (index == '1') {  //充值电量
      url = '../../../pagesA/pages/czdf_info/czdf_info?hid='+hid+'&dsn='+dbsbh;  
      /*
      wx.showToast({
        title: '功能开发中~',
        icon: "none",
        duration: 500
      })
      */
    }else if ( index == '2' ) {  //查看充值记录
      let sblx = 'db'; //电表
      url = '../../../pagesA/pages/db_chongzhijilu/db_chongzhijilu?sblx='+sblx+'&dsn='+dbsbh;
    }else if ( index == '3' ) {  //电量清零
      if(ptlx=="fd"){
        that.reset(dbsbh);
      }
      else{
        if(lylx=="3"){ //启程
          if(ffms=="1"){  //1代表预付费，2代表后付费
            that.QC_reset(dbsbh,ptlx);
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
            title: '其他厂商电表',
            icon: "none",
            duration: 2000
          })  
        }
      }
    }else if ( index == '4' ) {  //查看用电记录
      url = '../../../pagesA/pages/db_ydjl/db_ydjl?dsn='+dbsbh;
    }else if ( index == '5' ) {  //房间通电
      if(lylx=="2"){ //蜂电
        if(ptlx=="fd"){
          that.power_on(dbsbh);
        }
      }
      else if(lylx=="3"){ //启程
        that.QC_power_on(dbsbh,ptlx);
      }
    }else if ( index == '6' ) {  //房间断电
      if(lylx=="2"){ //蜂电
        if(ptlx=="fd"){
          that.power_off(dbsbh);
        }
      }
      else if(lylx=="3"){ //启程
        that.QC_power_off(dbsbh,ptlx);
      }
    }else if ( index == '7' ) {  //房间用电配置
      url = '../../../pagesA/pages/db_fjydpz/db_fjydpz?dsn='+dbsbh;
    }else if ( index == '8' ) {  //智能抄表
      if(lylx=="2"){ //蜂电
        if(ptlx=="fd"){
          that.get_sydl(dbsbh);  //查看剩余电量
        }
      }
      else if(lylx=="3"){ //启程
        that.QC_meterReading(dbsbh,ptlx);
      }
    }else if ( index == '9' ) {  //保电操作
      if(lylx=="3"){ //启程
        if(ffms=="1"){
          that.QC_preserve(dbsbh,ptlx);
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
          title: '该电表不支持此功能',
          icon: "none",
          duration: 2000
        })
      }
    }else if ( index == '10' ) {  //解除保电
      if(lylx=="3"){ //启程
        if(ffms=="1"){
          that.QC_relesePreserve(dbsbh,ptlx);
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
          title: '该电表不支持此功能',
          icon: "none",
          duration: 2000
        })
      }
    }else if ( index == '11' ) {  //切到预付费
      if(lylx=="3"){ //启程
        that.QC_prepaid(dbsbh,ptlx);
      }
      else{
        wx.showToast({
          title: '该电表不支持此功能',
          icon: "none",
          duration: 2000
        })
      }
    }else if ( index == '12' ) {  //切到后付费
      if(lylx=="3"){ //启程
        that.QC_postpaid(dbsbh,ptlx);
      }
      else{
        wx.showToast({
          title: '该电表不支持此功能',
          icon: "none",
          duration: 2000
        })
      }
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  setValue: function(e) {   //楼栋名称值改变事件
    sbName = e.detail.value;
  },
  updateMC: function(e) {  //修改名称
    this.setData( {
      ifName: true    //显示弹出框
    }); 
  },
  cancel: function (e) {  //取消
    sbName = "";
    this.setData( {
      ifName: false,    //隐藏弹出框
      sbmc:""
    }); 
  },
  confirm: function (e) {  //确定
    var that = this;
    let LX = "db";
    var _data = {ac: 'update_deviceName',"dsn":dsn,"LX":LX,"name":sbName};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '保存成功',
          icon: "success",
          duration: 1000
        })
        setTimeout(()=>{
          sbName = "";
          that.setData( {
            ifName: false,    //隐藏弹出框
            sbmc:""
          });
          that.get_msInfo(dsn,'db');  //获取设备详情       
        },1000)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    }); 
  },
  reset: function(dbsbh) {  //电量清零
    wx.showModal({
      title: '剩余电量清零',
      content: '是否要清零剩余电量',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          /* 
          var _data = {ac: 'reset_db',"mac":dbsbh};
          wx.request({
            url: apiUrl,
            data: _data,
            header: {'Content-Type': 'application/json'},
            method: "get",
            success(res) {
              wx.showToast({
                title: '清零成功',
                icon: "success",
                duration: 500//持续的时间
              });
            },
            fail(res) {
              console.log("getunits fail:",res);
            },
            complete(){
            }
          });*/
          wx.showToast({
            title: '功能开发中...',
            icon: "none",
            duration: 1000
          });
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  power_on: function(dbsbh) {  //485房间通电
    var that = this;
    wx.showModal({
      title: '房间通电',
      content: '通电后，可以通过系统断电',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          var _data = '{ac: "switchon","deviceId":"'+dbsbh+'"}'
          wx.request({
           url: aiotAPI+'em/switchon',  //水电表指令的api
           data: _data,
           header: {'Content-Type': 'application/json'},
           method: "POST",
           dataType: 'application/json',
           async:false,  //同步 
           success(res) {
            let _res = JSON.parse(res.data);
            if(_res.Code == 0 ){
              that.insertLog_sb(userid,'',dbsbh,'电表','通电','朗思管理端'); //插入日志
              wx.showToast({
                title: '通电成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_msInfo(dbsbh,'db');  //获取设备详情       
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
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  power_off: function(dbsbh) {  //房间断电
    var that = this;
    wx.showModal({
      title: '房间断电',
      content: '断电后，可以通过系统通电',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          var _data = '{ac: "switchoff","deviceId":"'+dbsbh+'"}'
          wx.request({
           url: aiotAPI+'em/switchoff',  //水电表指令的api
           data: _data,
           header: {'Content-Type': 'application/json'},
           method: "POST",
           dataType: 'application/json',
           async:false,  //同步 
           success(res) {
            let _res = JSON.parse(res.data);
            if(_res.Code == 0 ){
              that.insertLog_sb(userid,'',dbsbh,'电表','断电','朗思管理端'); //插入日志
              wx.showToast({
                title: '断电成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_msInfo(dbsbh,'db');  //获取设备详情       
              },1000)
            }
            else{
              wx.showToast({
                title: _res.Message,
                icon: "none",
                duration: 2000
              })
            }
           },
           fail(res) {
           },
           complete(){
           }
         });
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  get_sydl:function(devid){  //查看剩余电量
   var that = this;
   that.setData({
      showMB:false,  //显示幕布
   })
   wx.showLoading({
      title: '读数获取中...',
   })  
   var _data = '{ac: "read","deviceId":"'+devid+'"}'
   wx.request({
    url: aiotAPI+'em/read',  //水电表指令的api
    data: _data,
    header: {'Content-Type': 'application/json'},
    method: "POST",
    dataType: 'application/json',
    async:false,  //同步 
    success(res) {
     let _res = JSON.parse(res.data);
     if(_res.Code == 0 ){
      that.setData({
        showMB:true,  //显示幕布
      })  
       console.log("Uuid:"+_res.Data[0].Uuid);
       let uuid = _res.Data[0].Uuid;
       //console.log("底数:"+_res.Data[0].Expand.allpower);
       wx.showToast({
         title: '抄表成功，请点击基本信息查看',
         icon: "none",
         duration: 2000
       })
       that.get_msInfo(dsn,'db');  //获取设备详情
     }
     else{
       that.setData({
        showMB:true,  //显示幕布
       })  
       wx.showToast({
         title: '抄表失败',
         icon: "error",
         duration: 1000
       })
     }
    },
    fail(res) {
    },
    complete(){
    }
  });
  },
  QC_meterReading:function(dbsbh,ptlx){  //QC查询读数
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '读数获取中...',
    })  
    let jk = ""; //接口
    if(ptlx == "485"){  //485
      jk = '/qc/am/485/read';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/read';
    }else if(ptlx == "4G"){  //4G
      jk = '/qc/am/4g/read';
    }
    var _data = '{"comAddr":"'+dbsbh+'","concentratorAddr":"'+collectorSn+'"}'
    wx.request({
     url: apiDB+jk,  //水电表指令的api
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(!!_res.success){
        wx.hideLoading();  //关闭提示框
        that.setData({
          showMB:true,  //显示幕布
        })
        var totalEnergy = _res.data[0].totalEnergy;
        var dqds = ""+totalEnergy*1;
        console.log("电表当前读数——>>："+dqds);
        var title = "电表当前读数";
        wx.showModal({
          title: title,
          showCancel: false,
          cancelText:'关闭',
          cancelColor:'red',
          confirmText:'返回',
          confirmColor:'#47a86c',
          content:dqds,
          success: function(res) {
          }
        })
      }
      else{
        that.setData({
          showMB:true,  //显示幕布
        })
        console.log(_res.message);
        wx.showToast({
          title: '抄表失败',
          icon: "error",
          duration: 1000
        })
      }
     },
     fail(res) {
     },
     complete(){
      wx.hideLoading();  //关闭提示框
      that.setData({
        showMB:true,  //显示幕布
      })
     }
   });
  },
  QC_power_on: function(dbsbh,ptlx) {  //房间通电
    var that = this;
    let jk = ""; //接口
    if(ptlx == "485"){  //485
      jk = '/qc/am/485/postpaid/switchOn';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/postpaid/switchOn';
    }else if(ptlx == "4G"){  //4G
      jk = '/qc/am/4g/postpaid/switchOn';
    }
    wx.showModal({
      title: '房间通电',
      content: '通电后，可以通过系统断电',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          var _data = '{"comAddr":"'+dbsbh+'","concentratorAddr":"'+collectorSn+'"}'
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
              that.insertLog_sb(userid,'',dbsbh,'电表','通电','朗思管理端'); //插入日志
              wx.showToast({
                title: '通电成功',
                icon: "success",
                duration: 2000
              })
              setTimeout(()=>{
                that.get_msInfo(dbsbh,'db');  //获取设备详情       
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
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  QC_power_off: function(dbsbh,ptlx) {  //房间断电
    var that = this;
    let jk = ""; //接口
    if(ptlx == "485"){  //485
      jk = '/qc/am/485/postpaid/switchOff';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/postpaid/switchOff';
    }else if(ptlx == "4G"){  //4G
      jk = '/qc/am/4g/postpaid/switchOff';
    }
    wx.showModal({
      title: '房间断电',
      content: '断电后，可以通过系统通电',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          var _data = '{"comAddr":"'+dbsbh+'","concentratorAddr":"'+collectorSn+'"}'
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
              that.insertLog_sb(userid,'',dbsbh,'电表','断电','朗思管理端'); //插入日志
              wx.showToast({
                title: '断电成功',
                icon: "success",
                duration: 2000
              })
              setTimeout(()=>{
                that.get_msInfo(dbsbh,'db');  //获取设备详情       
              },1000)
            }
            else{
              wx.showToast({
                title: "断电失败",
                icon: "none",
                duration: 2000
              })
              console.log('失败原因——>>'+_res.message);
            }
           },
           fail(res) {
           },
           complete(){
           }
         });
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  QC_reset: function(dbsbh,ptlx) {  //电量清零
    var that = this;
    let jk = ""; //接口
    let _data = ""; //参数
    if(ptlx == "4G"){  //4G
      jk = '/qc/am/4g/prepaid/clearRecharge';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/prepaid/clearRecharge';
    }else if(ptlx == "485"){  //485
      jk = '/qc/am/485/prepaid/clearRecharge';
    }
    _data = '{"comAddr":"'+dbsbh+'","concentratorAddr":"'+collectorSn+'"}'
    wx.showModal({
      title: '剩余电量清零',
      content: '是否要清零剩余电量',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后        
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
              that.insertLog_sb(userid,'',dbsbh,'电表','电量清零','朗思管理端'); //插入日志
              wx.showToast({
                title: '电量清零成功',
                icon: "success",
                duration: 2000
              })
              setTimeout(()=>{
                that.get_msInfo(dbsbh,'db');  //获取设备详情       
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
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  QC_preserve: function(dbsbh,ptlx) {  //保电
    var that = this;
    let jk = ""; //接口
    let _data = ""; //参数
    if(ptlx == "4G"){  //4G
      jk = '/qc/am/4g/prepaid/powerPreserve';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/prepaid/powerPreserve';
    }else if(ptlx == "485"){  //485
      jk = '/qc/am/485/prepaid/powerPreserve';
    }
    _data = '{"comAddr":"'+dbsbh+'","concentratorAddr":"'+collectorSn+'"}'
    wx.showModal({
      title: '设置保电',
      content: '是否确认设置保电',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后        
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
              that.insertLog_sb(userid,'',dbsbh,'电表','设置保电','朗思管理端'); //插入日志
              wx.showToast({
                title: '设置成功',
                icon: "success",
                duration: 2000
              })
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
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  QC_relesePreserve: function(dbsbh,ptlx) {  //解除保电
    var that = this;
    let jk = ""; //接口
    let _data = ""; //参数
    if(ptlx == "4G"){  //4G
      jk = '/qc/am/4g/prepaid/relesePowerPreserve';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/prepaid/relesePowerPreserve';
    }else if(ptlx == "485"){  //485
      jk = '/qc/am/485/prepaid/relesePowerPreserve';
    }
    _data = '{"comAddr":"'+dbsbh+'","concentratorAddr":"'+collectorSn+'"}'
    wx.showModal({
      title: '解除保电',
      content: '是否确认解除保电',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后        
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
              that.insertLog_sb(userid,'',dbsbh,'电表','解除保电','朗思管理端'); //插入日志
              wx.showToast({
                title: '解除成功',
                icon: "success",
                duration: 2000
              })
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
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  QC_prepaid: function(dbsbh,ptlx) {  //切到预付费
    var that = this;
    let jk = ""; //接口
    let _data = ""; //参数
    if(ptlx == "4G"){  //4G
      jk = '/qc/am/4g/switchPaymentMode';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/switchPaymentMode';
    }else if(ptlx == "485"){  //485
      jk = '/qc/am/485/switchPaymentMode';
    }
    _data = '{"comAddr":"'+dbsbh+'","concentratorAddr":"'+collectorSn+'","type":0}'
    wx.showModal({
      title: '切到预付费',
      content: '是否确认切到预付费',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后        
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
              that.insertLog_sb(userid,'',dbsbh,'电表','切到预付费','朗思管理端'); //插入日志
              that.get_msInfo(dbsbh,'db');  //获取设备详情
              wx.showToast({
                title: '切换成功',
                icon: "success",
                duration: 2000
              })
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
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  QC_postpaid: function(dbsbh,ptlx) {  //切到后付费
    var that = this;
    let jk = ""; //接口
    let _data = ""; //参数
    let sydl = that.data.sydl; //剩余电量
    let amount = (sydl*price).toFixed(2);
    let title = "";
    if(ptlx == "4G"){  //4G
      jk = '/qc/am/4g/switchPaymentMode';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/switchPaymentMode';
    }else if(ptlx == "485"){  //485
      jk = '/qc/am/485/switchPaymentMode';
    }
    if(amount>0){
      title = '您当前需要退还租客'+amount+'元';
    }
    else
    {
      let amount2 = Math.abs(amount);
      title = '您当前需要向租客收取'+amount2+'元';
    }
    _data = '{"comAddr":"'+dbsbh+'","concentratorAddr":"'+collectorSn+'","type":1}'
    wx.showModal({
      title: title,
      content: '是否确认切到后付费',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后        
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
              that.insertLog_sb(userid,'',dbsbh,'电表','切到后付费','朗思管理端'); //插入日志
              that.get_msInfo(dbsbh,'db');  //获取设备详情
              wx.showToast({
                title: '切换成功',
                icon: "success",
                duration: 2000
              })
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
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  get_energyPrice:function (sbh,sblx) { //获取电费单价
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
          price = units[0].price;
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  insertLog_sb:function(userid,hid,sbh,sblx,czlx,xfly){
    var _data = {ac: 'SBoperateLog_save',"userid":userid,"hid":hid,"sbh":sbh,"sblx":sblx,"czlx":czlx,"xfly":xfly};
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
    let that = this;
    that.get_msInfo(dsn,'db');  //获取设备详情
  }
})