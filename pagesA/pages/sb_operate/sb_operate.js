var dsn= "";  //设备号
var sbName = "" //设备名称
var hid= "";  //房间id
var lylx= "";  //供应商类型
var ptlx= "";  //通讯类型
var collectorSn= "";  //采集器编号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var aiotAPI = app.globalData.aiotAPI; //获取水电api地址
var apiSB = app.globalData.apiSB;   //水表指令api
Page({

  data: {  //页面的初始数据
    winWidth: 0,
    winHeight: 0,
    detail_jbxx:true,
    detail_ys:true,
    ifName: false,
    arrow_jbxx: 'arrow_bottom',
    arrow_ys: 'arrow_bottom',
    showMB:true, //幕布
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    dsn = options.dsn;
    apiUrl = app.globalData.apiUrl;   //获取api地址
    aiotAPI = app.globalData.aiotAPI; //获取水电api地址
    //获取当前设备的宽高
    wx.getSystemInfo({ 
      success: function( res ) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    that.get_msInfo(dsn,'sb');  //获取设备详情
    that.waterMeter_info(dsn);  //获取水表详情
  },
  waterMeter_info:function (dsn) { //获取水表详情
    var _data = {ac: 'waterMeter_info',"mac":dsn};
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
          let zxtbsj = (units[0].readDate);
          //hx = hx.replace('/','-').replace('/','-');
          ks = ks.replace('0:00:00','').replace('/','-').replace('/','-');
          js = js.replace('0:00:00','').replace('/','-').replace('/','-');
          zxtbsj = zxtbsj.replace('/','-').replace('/','-');
          lylx = units[0].lx;
          ptlx = units[0].ptlx;
          _this.setData({
            dsn:units[0].mac,
            mc:units[0].mc,    
            bdwg:(units[0].collectorSn=='') ? '无':units[0].collectorSn,
            zt:(units[0].online=='1') ? '在线':'离线',        
            hx:hx,
            ks:ks,
            js:js,
            zxsbsj:zxtbsj,
            dqys:units[0].forwardValue+'吨',
            pxds:units[0].forwardValue+'吨',
            sbdl:units[0].batteryVoltage,
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
  tapSB: function(e) {  //水表
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
    }else if ( index == '2' ) {  //屏显读数
      let arrow_ys="arrow_bottom";
      let ys=!this.data.detail_ys;
      if(ys){
        arrow_ys = "arrow_bottom";
      }
      else{
        arrow_ys = "arrow_top";
      }
      _this.setData({
        detail_ys:ys,
        arrow_ys:arrow_ys
      })    
    }else if ( index == '3' ) {  //操作记录
      url = '../../../pagesA/pages/sb_czjl/sb_czjl?dsn='+dsn;
    }else if ( index == '4' ) {  //异常记录
      url = '../../../pagesA/pages/sb_ycjl/sb_ycjl?dsn='+dsn;
    }else if ( index == '5' ) {  //替换设备
      //url = '../../../pagesA/pages/sb_thsb/sb_thsb?dsn='+dsn;
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
      url = '../../../pagesA/pages/sb_ysjl/sb_ysjl?dsn='+dsn;
    }else if ( index == '8' ) {  //获取读数
      if(lylx=="2"){ //蜂电
        if(ptlx=="fd"){
          _this.get_sbRead(dsn);  //查看水表信息
        }
      }
      else if(lylx=="3"){ //卓正
        if(ptlx=="M-BUS"){
          _this.ZZ_meterReading(dsn,ptlx);
        }
        else if(ptlx=="LORA"){
          _this.ZZ_meterReading(dsn,ptlx);
        }
        else if(ptlx=="4G" || ptlx=="NB"){
          that.ZZ_meterReading(dsn,ptlx);
        }
      }
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  tapYS: function(e) {  //用水
    let that = this;
    let index = e.currentTarget.dataset.index;
    let sbsbh = e.currentTarget.dataset.key;
    let url = "";
    if (index == '1') {  //充值水量
      if(lylx=="2"){ //蜂电
        url = '../../../pagesA/pages/czsfXX_info/czsfXX_info?hid='+hid+'&dsn='+sbsbh;
      }
      else{
        wx.showToast({
          title: '不支持此功能',
          icon: "none",
          duration: 1000
        })
      }
      /*
      wx.showToast({
        title: '功能开发中~',
        icon: "none",
        duration: 500
      })
      */
    }else if ( index == '2' ) {  //查看充值记录
      let sblx = 'sb'; //水表
      url = '../../../pagesA/pages/db_chongzhijilu/db_chongzhijilu?sblx='+sblx+'&dsn='+sbsbh;
    }else if ( index == '3' ) {  //水量清零
      that.reset(sbsbh);
    }else if ( index == '4' ) {  //查看用水记录
      url = '../../../pagesA/pages/sb_ysjl/sb_ysjl?dsn='+sbsbh;
    }else if ( index == '5' ) {  //房间通水
      //that.power_on(sbsbh);       
      wx.showToast({
        title: '功能开发中~',
        icon: "none",
        duration: 500
      })  
    }else if ( index == '6' ) {  //房间断水
      //that.power_off(sbsbh);     
      wx.showToast({
        title: '功能开发中~',
        icon: "none",
        duration: 500
      })  
    }else if ( index == '7' ) {  //房间用水配置
      //url = '../../../pagesA/pages/db_fjydpz/db_fjydpz?dsn='+sbsbh;
      wx.showToast({
        title: '功能开发中~',
        icon: "none",
        duration: 500
      })
    }else if ( index == '8' ) {  //智能抄表
      if(lylx=="2"){ //蜂电
        if(ptlx=="fd"){
          that.get_sbRead(sbsbh);  //查看剩余水量
        }
      }
      else if(lylx=="3"){ //卓正
        if(ptlx=="M-BUS"){
          that.ZZ_meterReading(sbsbh,ptlx);
        }
        else if(ptlx=="LORA"){
          that.ZZ_meterReading(sbsbh,ptlx);
        }
        else if(ptlx=="4G" || ptlx=="NB"){
          that.ZZ_meterReading(sbsbh,ptlx);
        }
      }
    }else if ( index == '9' ) {  //获取采集器下所有数据
      if(lylx=="2"){ //蜂电
        wx.showToast({
          title: '不支持查询',
          icon: "none",
          duration: 2000
        })
      }
      else if(lylx=="3"){ //卓正
        if(ptlx=="M-BUS"){
          that.ZZ_collector_Reading(sbsbh,ptlx);
        }
        else if(ptlx=="LORA"){
          that.ZZ_collector_Reading(sbsbh,ptlx);
        }
        else if(ptlx=="4G" || ptlx=="NB"){
          wx.showToast({
            title: '不支持查询',
            icon: "none",
            duration: 2000
          })
        }
      }
    }else if ( index == '10' ) {  //请求集中器版本信息
      if(lylx!="3"){ //蜂电
        wx.showToast({
          title: '不支持查询',
          icon: "none",
          duration: 2000
        })
      }
      else if(lylx=="3"){ //卓正
        if(ptlx=="M-BUS"){
          that.ZZ_collector_version(ptlx);
        }
        else if(ptlx=="LORA"){
          that.ZZ_collector_version(ptlx);
        }
        else if(ptlx=="4G" || ptlx=="NB"){
          wx.showToast({
            title: '不支持查询',
            icon: "none",
            duration: 2000
          })
        }
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
    let LX = "sb";
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
          that.get_msInfo(dsn,'sb');  //获取设备详情       
        },1000)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    }); 
  },
  get_sbRead:function(devid){  //查看水表信息
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '读数获取中...',
    })  
    var _data = '{ac: "read","deviceId":"'+devid+'"}'
    wx.request({
     url: aiotAPI+'wm/read',
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
        //console.log("底数:"+_res.Data[0].Expand.allpower);
        wx.showToast({
          title: '抄表成功，请点击基本信息查看',
          icon: "none",
          duration: 2000
      })
      that.get_msInfo(dsn,'sb');  //获取设备详情
      }
      else{
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.showToast({
          title: '获取失败',
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
  power_on: function(sbsbh) {  //房间通水
    var that = this;
    wx.showModal({
      title: '房间通水',
      content: '通水后，可以通过系统断水',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          var _data = '{ac: "switchon","deviceId":"'+sbsbh+'"}'
          wx.request({
           url: aiotAPI+'wm/switchon',  //水电表指令的api
           data: _data,
           header: {'Content-Type': 'application/json'},
           method: "POST",
           dataType: 'application/json',
           async:false,  //同步 
           success(res) {
            let _res = JSON.parse(res.data);
            if(_res.Code == 0 ){
              that.insertLog_sb(userid,'',sbsbh,'水表','通水','朗思管理端'); //插入日志
              wx.showToast({
                title: '通水成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_msInfo(sbsbh,'sb');  //获取设备详情       
              },1000)
            }
            else{
              wx.showToast({
                title: _res.Message,
                icon: "error",
                duration: 1000
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
  power_off: function(sbsbh) {  //房间断水
    var that = this;
    wx.showModal({
      title: '房间断水',
      content: '断水后，可以通过系统通水',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          var _data = '{ac: "switchoff","deviceId":"'+sbsbh+'"}'
          wx.request({
           url: aiotAPI+'wm/switchoff',  //水电表指令的api
           data: _data,
           header: {'Content-Type': 'application/json'},
           method: "POST",
           dataType: 'application/json',
           async:false,  //同步 
           success(res) {
            let _res = JSON.parse(res.data);
            if(_res.Code == 0 ){
              that.insertLog_sb(userid,'',sbsbh,'水表','断水','朗思管家端'); //插入日志
              wx.showToast({
                title: '断水成功',
                icon: "success",
                duration: 1000
              })
              setTimeout(()=>{
                that.get_msInfo(sbsbh,'sb');  //获取设备详情       
              },1000)
            }
            else{
              wx.showToast({
                title: _res.Message,
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
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  ZZ_meterReading:function(sbsbh,ptlx){  //ZZ查询读数
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '读数获取中...',
    })  
    let jk = ""; //接口
    if(ptlx == "M-BUS"){  //M-BUS
      jk = '/zz/wm/mbus/request/meterData/'+collectorSn+'/'+sbsbh+'';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/zz/wm/lora/request/meterData/'+collectorSn+'/'+sbsbh+'';
    }else if(ptlx == "4G" || ptlx == "NB"){  //4G或NB
      jk = '/zz/wm/4g/request/meterData/'+sbsbh+'';
    }
    //var _data = '{"meterAddress":"'+sbsbh+'","terminalAddress":"'+collectorSn+'"}'
    wx.request({
     url: apiSB+jk,  //水表指令的api
     //data: _data,
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
        var totalEnergy = "";
        if(ptlx == "4G" || ptlx == "NB"){
          totalEnergy = _res.data.allPower;
        }
        else if(ptlx == "M-BUS" || ptlx == "LORA"){
          totalEnergy = _res.data.dataList[0].data;
        }
        var dqds = ""+totalEnergy*1;
        console.log("水表当前读数——>>："+dqds);
        var title = "水表当前读数";
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
  ZZ_collector_Reading:function(sbsbh,ptlx){  //ZZ获取采集器下所有数据
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '读数获取中...',
    })  
    let jk = ""; //接口
    if(ptlx == "M-BUS"){  //M-BUS
      jk = '/zz/wm/mbus/request/meterData/all/'+collectorSn+'';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/zz/wm/lora/request/meterData/all/'+collectorSn+'';
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
        wx.hideLoading();  //关闭提示框
        that.setData({
          showMB:true,  //显示幕布
        })
         var dqds = "";
        for(var i = 0;i<_res.data.dataList.length;i++){
          if(sbsbh == _res.data.dataList[i].meterAddress){
            var totalEnergy = _res.data.dataList[i].data;
            dqds = ""+totalEnergy*1;            
          }
        }
        console.log("水表当前读数——>>："+dqds);
        var title = "水表当前读数";
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
  ZZ_collector_version:function(ptlx){  //ZZ请求集中器版本信息
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '版本获取中...',
    })  
    let jk = ""; //接口
    if(ptlx == "M-BUS"){  //M-BUS
      jk = '/zz/wm/mbus/request/version/'+collectorSn+'';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/zz/wm/lora/request/version/'+collectorSn+'';
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
        wx.hideLoading();  //关闭提示框
        that.setData({
          showMB:true,  //显示幕布
        })
        var Version = _res.data.softwareVersion;
        console.log("采集器当前版本——>>："+Version);
        var title = "采集器版本";
        wx.showModal({
          title: title,
          showCancel: false,
          cancelText:'关闭',
          cancelColor:'red',
          confirmText:'返回',
          confirmColor:'#47a86c',
          content:Version,
          success: function(res) {
          }
        })
      }
      else{
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.showToast({
          title: '获取失败',
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
  insertLog_sb:function(userid,hid,sbh,sblx,czlx,xfly){
    var _data = {ac: 'SBoperateLog_save',"userid":userid,"hid":hid,"sbh":sbh,"sblx":sblx,"czlx":czlx,"xfly":xfly};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        console.log("getunits success:",res);
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