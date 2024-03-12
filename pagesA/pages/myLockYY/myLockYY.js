var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var com = require('../../../utils/commom.js');  //公共js
let app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiHost = app.globalData.apiHost;   //获取api地址
var dsn= "";  //设备号
var userid= "";  //登陆人工号
var newPwd = "" //新密码
Page({
  data: {
    cmdText:"",
    ljzt:"", //连接状态
    ifName: false,
    showMB:true, //幕布
    second: 20, //倒计时20秒
    c:"",//定时器
  },
  onLoad: function (options) {
    let that = this;
    dsn = options.dsn;
    //dsn = "501A102106013906";
    newPwd = ""; //密码设置成空
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiHost = app.globalData.apiHost;   //获取api地址
    userid = app.globalData.userid;   //登陆人工号
    this.get_mcToMS(dsn); //获取设备号
    BLE.openBLEConnection(dsn,function(res){
      console.log(res)
      if(res.errCode=='0'){
          that.setData({
          ljzt:'连接成功',
        })
        that.timeService(); //授时
      }
      else{
          that.setData({
          ljzt:'连接失败',
        })    
      }
    });
  },
  get_mcToMS:function (dsn) { //获取设备号
    let _this = this;
    var _data = {ac: 'get_mcToMS',"dsn":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          dsn = units[0].equip_no,
          _this.setData({
            hid:units[0].hid,
            dsn:units[0].equip_no,
            sbmc:units[0].equip_name
          })
        }
        else{
          wx.showToast({
            title: '请先添加没锁！',
            icon: 'error',
            duration: 1000
          });           
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  tapEvent: function(e) {
    let _this = this;
    var that = this;
    let index = e.currentTarget.dataset.index;
    let url = "";
    let ljzt = BLE.authState();//连接状态
    if (index == '01') {  //蓝牙开门
      if(ljzt){
      var cmd = "";
      var _data = {ac: 'GetNextNo'};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          if(res.data.status=="1"){
            var autoNo = res.data.autoNo;
            cmd = autoNo+'AA5503003901'+'CC';
            com.get_encryption(dsn,cmd,function(res){  //获取加密(蓝牙开门)
              if(res.errCode2=='1001'){
                let cmd = res.cmd;
                let cmdT = autoNo+cmd;
                BLE.sendCommand(cmdT,function(res){  //写入数据
                  //console.log("操作成功返回:"+res);
                  if(res.errCode==0){
                   setTimeout(()=>{
                    wx.showToast({
                      title: '操作成功',
                      icon: "success",
                      duration: 1000
                    })    
                  },1000)
                  }
                  else{
                    wx.showToast({
                      title: '操作失败',
                      icon: "error",
                      duration: 1000
                    })     
                  }
                });
              }
            });            
          }
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });
      }
      else{
        wx.showToast({
          title: '请先连接门锁',
          icon: 'error',
          duration: 1000
        });       
      }
    }
    else if (index == '02') { //管理
      wx.navigateTo({
        url: '../../../pagesA/pages/mssj_list/mssj_list?dsn='+dsn
      })
    } else if ( index == '03' ) { //授时
      that.timeService(); //授时
      if(ljzt){
        that.setData({
          second: 20,  //初始化成20秒
          showMB:false,  //隐藏幕布
        }); 
        that.countdown(); //调用计时器            
        that.timeService(); //授时
      }
      else{
        wx.showToast({
          title: '请先连接门锁',
          icon: 'error',
          duration: 1000
        });           
      }
    }else if( index == '04' ){ //一次性密码
      wx.request({
         //url: app.globalData.apiHost + 'otpBle',
         url: apiHost + 'otpBle',
         data: {"deviceid":dsn},
         method: "get",
         success(res) {
            var otp = res.data.data.otp;
            wx.showModal({
               title: '注：一次性密码，有效期10分钟',
                showCancel: false,
                cancelText:'关闭',
                cancelColor:'red',
                confirmText:'返回',
                confirmColor:'#47a86c',
                content: res.data.data.otp.substr(0,4) + '  ' + res.data.data.otp.substr(4,4),
                success: function(res) {
                }
            })
            that.insertLog_LS(userid,'',dsn,'下发','一次性密码',otp,'朗思管家端');
        }
      });
    }else if( index == '05' ){ //新增用户
      /*
      if(ljzt){
        wx.navigateTo({
          url: '/pages/pwd_add/pwd_add?dsn='+dsn
        })
      }
      else{
        wx.showToast({
          title: '请先连接门锁',
          icon: 'error',
          duration: 1000
        });       
      }
      */
     wx.navigateTo({
      url: '/pages/pwd_add/pwd_add?dsn='+dsn
     })
    }else if( index == '06' ){ //新增指纹
      if(ljzt){
        wx.navigateTo({
          url: '../../../pagesA/pages/zhiwen_add/zhiwen_add?dsn='+dsn
        })
      }
      else{
        wx.showToast({
          title: '请先连接门锁',
          icon: 'error',
          duration: 1000
        });       
      }
    }else if( index == '07' ){ //解绑
      var _data = {ac: 'Unbound_device',"sbh":dsn};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            wx.showToast({
              title: '解绑成功',
              icon: "success",
              duration: 1000//持续的时间
            })
            setTimeout(()=>{
              wx.navigateBack({
                delta: 1,
              })  
            },1500)
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });
    }else if(index == '08' ){//开门记录
      that.Lock_operationLog(dsn); //获取门锁日志
      wx.showToast({
        title: '加载中',
        icon: "loading",
        duration: 5000
      })
      setTimeout(()=>{
        wx.hideToast();
        wx.navigateTo({
          url: '../../../pages/openLock_list/openLock_list?mac='+dsn
        })
      },4000)
    }else if(index == '09' ){  //管理密码
      if(ljzt){
        this.setData( {
          ifName: true,    //显示弹出框
        }); 
        let Num = that.MathRand(); //随机生成8位数密码
        newPwd = Num;
        this.setData({
          fxmc:Num
        }); 
      }
      else{
        wx.showToast({
          title: '请先连接门锁',
          icon: 'error',
          duration: 1000
        });       
      }
    }else if( index == '10' ){ //门锁信息
      wx.navigateTo({
        url: '../../../pages/ms_info/ms_info?dsn='+dsn
      })
    }
  },
  back: function() { //返回首页
    BLE.closeBLEConnection();
    wx.switchTab({
       url: '../../../pages/homeYY/homeYY',
    })
  },
  linkBLE: function() {  //重新连接
    var that = this;
    that.setData({
      ljzt:'',
    })
    BLE.openBLEConnection(dsn,function(res){
      console.log(res)
      if(res.errCode=='0'){
          that.setData({
          ljzt:'连接成功',
        })
        that.timeService(); //授时
      }
      else{
          that.setData({
          ljzt:'连接失败',
        })    
      }
    });
  },
  UnlinkBLE: function () {  //断开连接
    var that = this;
    that.setData({
      ljzt:'',
    })
    BLE.closeBLEConnection();
  },
  timeService: function() {  //授时
    var that = this;
    const date = new Date(); //获取当前时间
    let y = date.getFullYear();  //年
    let m = date.getMonth()+1; //月
    let d = date.getDate();  //日
    let h = date.getHours(); //时
    let mi = date.getMinutes(); //分
    let s = date.getSeconds(); //秒
    if(m < 10){ m = '0'+ m }
    if(d < 10){ d = '0'+ d }
    if(h < 10){ h = '0'+ h }
    if(mi < 10){ mi = '0'+ mi }
    if(s < 10){ s = '0'+ s }
    var Dtime = y.toString()+m.toString()+d.toString()+h.toString()+mi.toString()+s.toString();
    var timeT = Dtime.substr(2,12); //截取成220102001334
    var cmd = "";
    var _data = {ac: 'GetNextNo'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          var autoNo = res.data.autoNo;
          cmd = autoNo+'AA55080014'+timeT+'CC';
          com.get_encryption(dsn,cmd,function(res){  //获取加密(授时)
            if(res.errCode2=='1001'){
              let cmd = res.cmd;
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                if(res.errCode==0){
                  wx.showToast({
                    title: '授时成功',
                    icon: "success",
                    duration: 1000
                  })
                }
                else{
                  wx.showToast({
                    title: '授时失败',
                    icon: "error",
                    duration: 1000
                  })     
                }
              });
            }
          });            
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  getDeviceId:function(){
    var deviceid = app.globalData.deviceId;
    if( deviceid != app.globalData.mac ){
      deviceid = app.globalData.mac
    }
    return deviceid;
  },
  onUnload: function () {  //生命周期函数--监听页面卸载
    BLE.closeBLEConnection();
  },
  //插入下发日志
  insertLog_LS:function(wx_id,hid,sbh,czlx,Pwd_type,Pwd,xfly){
    var _data = {ac: 'operateLog_save',"wx_id":wx_id,"hid":hid,"sbh":sbh,"czlx":czlx,"Pwd_type":Pwd_type,"Pwd":Pwd,"xfly":xfly};
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
  //获取门锁日志
  Lock_operationLog:function(dsn){
    var that = this;
    var cmd = "";
    var _data = {ac: 'GetNextNo'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          var autoNo = res.data.autoNo;
          cmd = autoNo+'AA55020035'+'CC';
          com.get_encryption(dsn,cmd,function(res){  //获取加密(门锁日志)
            if(res.errCode2=='1001'){
              let cmd = res.cmd;
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                if(res.errCode==0){
                  that.analyse_LockLog(dsn,res.res); //拆解门锁日志
                }
                else{
                  wx.showToast({
                    title: '操作失败',
                    icon: "error",
                    duration: 1000
                  })     
                }
              });
            }
          });            
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  //拆解门锁日志
  analyse_LockLog:function(dsn,val){
    var that = this;
    var strArr = [];
    var n = 1000;
    for (var i = 0, l = val.length; i < l/n; i++) {
    var a = val.slice(n*i, n*(i+1));
    strArr.push(a);
    }
    for (var j = 0; j < strArr.length; j++) {
      var k = 0;
      setTimeout(function () {
        that.insert_LockLog(dsn,strArr[k]); //插入门锁日志 
        k++    
      }, j * 200);                             
    }
  },
  //插入门锁日志
  insert_LockLog:function(dsn,val){
    //console.log("分解日志:"+val);
    var _data = {ac: 'insert_LockLog',"dsn":dsn,"val":val};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        //console.log("getunits success:",res);
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  MathRand: function() { //生成密码
    var Num="";
    for(var i=0;i < 100;i++){
      for(var i=0;i < 8;i++)
      {
        var chr = Math.floor(Math.random()*10);
        //首个字母为0时，替换为6
        if( i == 0 && chr == 0 ){
          chr = 8;
        }
        Num+=chr;
      }
      break; 
    }
    return Num;
  },
  setValue: function(e) {   //密码值改变事件
    newPwd = e.detail.value;
  },
  cancel: function (e) {  //取消
    newPwd = "";
    this.setData( {
      ifName: false,    //隐藏弹出框
      fxmc:""
    }); 
  },
  confirm: function (e) {  //确定
    if(!newPwd || newPwd.length != 8){
      wx.showToast({
        title: '请输入8位数字！',
        icon: 'none'
      })
    }
    else{
      var that = this;
      //let bdate = "000000000000";
      //let edate = "991230120000";
      var cmd = "";
      that.setData( {
        ifName: false,    //隐藏弹出框
        fxmc:""
      });
      wx.showToast({
        title: '密码修改中...',
        icon: "loading",
        duration: 5000
      })
      var _data = {ac: 'GetNextNo'};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          if(res.data.status=="1"){
            var autoNo = res.data.autoNo;
            cmd = autoNo+'AA550B001901FFFF'+newPwd+'FFFFCC';
            com.get_encryption(dsn,cmd,function(res){  //获取加密
              if(res.errCode2=='1001'){
                let cmd = res.cmd;
                let cmdT = autoNo+cmd;
                BLE.sendCommand(cmdT,function(res){  //写入数据
                  if(res.errCode==0){  
                    that.update_managePwd(dsn,newPwd);//修改管理密码
                  }
                  else{
                    wx.hideToast();  //关闭提示框
                    wx.showToast({
                      title: '修改密码失败',
                      icon: "error",
                      duration: 1000
                    })     
                  }
                });
              }
            });       
          }
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
    }
  },
  update_managePwd: function (dsn,pwd){  //删除门锁用户
    var that = this;
    var _data = {ac: 'update_managePwd',"dsn":dsn,"pwd":pwd};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          newPwd = "";
          wx.hideToast();  //关闭提示框
          wx.showToast({
            title: '修改成功',
            icon: "success",
            duration: 1000
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
  countdown: function () {
    let that = this;
    let second = that.data.second;
    clearInterval(this.data.c)//清除定时器
    that.data.c = setInterval(() => {//启动倒计时
      if(second == 0){
        clearInterval(this.data.c)//清除定时器
        wx.hideLoading();  //关闭提示框
        that.setData({
          showMB:true,  //隐藏幕布
        });
        let ljState = false;
        if(lylx=="1"){
          ljState = BLE.authState();
        }
        if(!ljState){
          BLE.closeBLEConnection();  //断开连接
        }
        return;
      }
      else{
        second = second - 1;
      }
      that.setData({
        second: second
      });
    }, 1000);
  },
})