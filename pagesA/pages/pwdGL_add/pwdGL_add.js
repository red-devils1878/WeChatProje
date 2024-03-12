var dsn= "";  //设备号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档
var com = require('../../../utils/commom.js');  //公共js
var newPwd = ""; //新密码
var userid= "";  //登陆人工号
var ptlx= "hongqi";  //平台类型
var lylx= "1";  //供应商类型
var roomId = "";//房间id
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
//获取年
for (let i = date.getFullYear(); i <= date.getFullYear() + 50; i++) {
  years.push("" + i);
}
//获取月份
for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i);
}
//获取日期
for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days.push("" + i);
}
//获取小时
for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}
//获取分钟
for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i);
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Starttime: '',
    Endtime: '',
    multiArray: [years, months, days, hours, minutes],
    //multiIndex: [0,9, 16, 10, 17],
    multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    endIndex: [1,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    choose_year: '',
    showMB:true, //幕布
    second: 20, //倒计时20秒
    c:'',//定时器
    second_discon: 20, //倒计时20秒
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    dsn = options.dsn; //设备号
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
    userid = app.globalData.userid;   //登陆人工号
    //dsn = "501A102106013906"; //设备号
    //设置默认的年份
    this.setData({
    choose_year: this.data.multiArray[0][0]
    });
    this.get_mcToMS(dsn); //获取门锁信息
    this.get_pwd(); //生成密码
  },
  get_htrq:function (roomId) { //获取合同有效期
    let _this = this;
    var _data = {ac: 'get_htzq',"hid":roomId};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let Sd = units[0].inTime2;
          let Ed = units[0].outTime2;
          if(!Sd){ 
            Sd = ""; 
          }
          else{ 
            Sd = Sd+' 00:00'; 
          }
          if(!Ed){
            Ed = "";
          }
          else{
            Ed = Ed+' 23:59';
          }
          _this.setData({
            Starttime:Sd,
            Endtime:Ed
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
  get_pwd:function () { //生成密码
    let that = this;
    let Num = that.MathRand(); //随机生成6位数密码
    newPwd = Num;
    that.setData({
      pwd:Num
    }); 
  },
  MathRand: function() { //生成密码
    var Num="";
    for(var i=0;i < 100;i++){
      for(var i=0;i < 6;i++)
      {
        var chr = Math.floor(Math.random()*10);
        //首个字母为0时，替换为6
        if( i == 0 && chr == 0 ){
          chr = 6;
        }
        Num+=chr;
      }
      break; 
    }
    return Num;
  },
  get_mcToMS:function (dsn) { //获取没锁信息
    var _that = this;
    var _data = {ac: 'get_mcToMS',"dsn":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          lylx = units[0].lx;
          roomId = units[0].hid;
          _that.get_htrq(roomId); //获取合同有效期
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
    });  
  },
  setValue: function(e) {   //密码值改变事件
    newPwd = e.detail.value;
  },
  //获取开始时间日期
  bindStartPickerChange: function(e) {
  this.setData({
    multiIndex: e.detail.value
  })
  const index = this.data.multiIndex;
  const year = this.data.multiArray[0][index[0]];
  const month = this.data.multiArray[1][index[1]];
  const day = this.data.multiArray[2][index[2]];
  const hour = this.data.multiArray[3][index[3]];
  const minute = this.data.multiArray[4][index[4]];
  // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
  this.setData({
    Starttime: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
  })
  },
  //监听picker的滚动事件
  bindStartPickerColumnChange: function(e) {
  //获取年份
  if (e.detail.column == 0) {
    let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
    console.log(choose_year);
    this.setData({
      choose_year
    })
  }
  //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
  if (e.detail.column == 1) {
    let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
    let temp = [];
    if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
      for (let i = 1; i <= 31; i++) {
        if (i < 10) {
          i = "0" + i;
        }
        temp.push("" + i);
      }
      this.setData({
        ['multiArray[2]']: temp
      });
    } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
      for (let i = 1; i <= 30; i++) {
        if (i < 10) {
          i = "0" + i;
        }
        temp.push("" + i);
      }
      this.setData({
        ['multiArray[2]']: temp
      });
    } else if (num == 2) { //判断2月份天数
      let year = parseInt(this.data.choose_year);
      console.log(year);
      if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
        for (let i = 1; i <= 29; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else {
        for (let i = 1; i <= 28; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      }
    }
    console.log(this.data.multiArray[2]);
  }
  var data = {
    multiArray: this.data.multiArray,
    multiIndex: this.data.multiIndex
  };
  data.multiIndex[e.detail.column] = e.detail.value;
  this.setData(data);
  },
  //获取结束时间日期
  bindEndPickerChange: function(e) {
    this.setData({
      endIndex: e.detail.value
    })
    const Eindex = this.data.endIndex;
    const year = this.data.multiArray[0][Eindex[0]];
    const month = this.data.multiArray[1][Eindex[1]];
    const day = this.data.multiArray[2][Eindex[2]];
    const hour = this.data.multiArray[3][Eindex[3]];
    const minute = this.data.multiArray[4][Eindex[4]];
    // console.log(`${year}-${month}-${day}-${hour}-${minute}`);
    this.setData({
      Endtime: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
    })
  },
  //监听picker的滚动事件(结束日期)
  bindEndPickerColumnChange: function(e) {
    //获取年份
    if (e.detail.column == 0) {
      let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
      console.log(choose_year);
      this.setData({
        choose_year
      })
    }
    //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    if (e.detail.column == 1) {
      let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
      let temp = [];
      if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
        for (let i = 1; i <= 30; i++) {
          if (i < 10) {
            i = "0" + i;
          }
          temp.push("" + i);
        }
        this.setData({
          ['multiArray[2]']: temp
        });
      } else if (num == 2) { //判断2月份天数
        let year = parseInt(this.data.choose_year);
        console.log(year);
        if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
          for (let i = 1; i <= 29; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        } else {
          for (let i = 1; i <= 28; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        }
      }
      console.log(this.data.multiArray[2]);
    }
    var data = {
      multiArray: this.data.multiArray,
      endIndex: this.data.endIndex
    };
    data.endIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
  formSubmit: function (e){  //保存数据
    var that = this;
    let ljzt = false;
    if(lylx == "2"){  //新锁
      ljzt = BLE_new.connectionState();
    }
    console.log("门锁连接状态："+ljzt);
    var Stime = e.detail.value.start_time;
    var Etime = e.detail.value.end_time;
    var newPwd = e.detail.value.pwd;
    if(!Stime || !Etime){
      wx.showToast({
        title: '日期不能为空!',
        icon: "none",
      })
      return;
    }
    else{
      var Stime_BLE = Stime;  //新锁蓝牙开门时间
      var Etime_BLE = Etime;
      Stime = Stime+':00';
      Etime = Etime+':00';
    }
    if(!newPwd || newPwd.length != 6){
      wx.showToast({
        title: '请输入6位数字！',
        icon: 'none'
      })
    }
    else{
      that.setData({
        showMB:false,  //显示幕布
      })
      wx.showLoading({
        title: '下发中...',
      })     
      //蓝牙下发
      if(ljzt){
        var xfbs = "下发中";
        that.setData({
            second: 20,  //初始化成20秒
        });
        that.countdown(); //调用计时器
        var Stime_b = Stime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
        var Etime_b = Etime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
        var Stime_b = Stime_b.substr(2,12); //截取字符串如20211231173000截取成211231173000
        var Etime_b = Etime_b.substr(2,12);
        var _data2 = {
            "deviceSn":dsn,
            "cmd":"0301",
            "syncNo":"0",
            "cloudUnlockBO":{
             "unlockModeEnum":1,
             "registerStatusEnum":"START",
             "effectiveNum":0,
             "memberTypeEnum":"ADMIN", //NORMAL是普通用户，ADMIN是管理员
             "hardwareNumber":0,
             "menberId":1, //2是普通用户，1是管理员
             "isOpenCycle":0,
             "loopType":"LOOP_NOT",
             "loopFlag":"00000000",
             "password":newPwd,
             "startTime":Stime_BLE,
             "endTime":Etime_BLE
             }
        };
        wx.request({
          url: apiNC+'cloud_function',
          data: _data2,
          header: {'Content-Type': 'application/json'},
          method: "POST",
          dataType: 'application/json',
          async:false,  //同步                            
          success(res) {
            let _res = JSON.parse(res.data);                  
            var cmd2 = _res.data; 
            //第二次写入指令
            BLE_new.sendCommand(cmd2,function(res){
              if(res.errCode==0){
                var _data4 = {"deviceSn":dsn,"data":res.data};
                wx.request({
                  url: apiNC+'cloud_function_parse',
                  data: _data4,
                  header: {'Content-Type': 'application/json'},
                  method: "POST",
                  dataType: 'application/json',
                  async:false,  //同步           
                  success(res) {
                    let _res = JSON.parse(res.data);
                    if( _res.code == 0 ){                                                
                      console.log("下发标识："+xfbs);
                      wx.hideLoading();  //关闭提示框  
                      that.setData({
                        showMB:true,  //显示幕布
                      })
                      var yhbh = _res.data.hardwareNumber;
                      if(yhbh < 10){
                        yhbh = '00'+yhbh
                      }
                      else{
                        yhbh = '0'+yhbh
                      }
                      if(xfbs=='已完成'){
                        return;
                      }
                      else{
                        xfbs='已完成';
                        that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                        that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,Stime_b,Etime_b);//插入门锁用户表
                      }
                    }
                    else{   
                      xfbs='已完成';              
                      wx.hideLoading();  //关闭提示框
                      that.setData({
                        showMB:true,  //显示幕布
                      })
                      wx.showToast({
                        title: '新增用户失败',
                        icon: "error",
                        duration: 1000
                      })
                      console.log(res.data.code+'——>>'+res.data.msg);                    
                    }
                  },
                  fail(res) {
                    xfbs='已完成';
                    wx.hideLoading();  //关闭提示框
                    that.setData({
                      showMB:true,  //显示幕布
                    })
                    },
                    complete(){
                    }
                });                    
              }
            }); 
         },
        fail(res) {
            xfbs='已完成';
        },
        complete(){
        }
        });             
      }
      else{
        wx.hideLoading();  //关闭提示框
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.showToast({
            title: '请连接门锁',
            icon: "none",
            duration: 1000
        })
      }
    }
  },
  insert_Rh_yhb: function (dsn,lx,yhbh,newPwd,Stime,Etime){  //插入门锁用户表
    var yhlx = "02";    //用户类型
    var channel = "21"; //下发来源
    var remark = "";
    if(!Stime){ Stime = "000000000000"}
    if(!Etime){ Etime = "991230180000"}
    var _data = {ac: 'yhb_save',"yhbh":yhbh,"lx":lx,"yhlx":yhlx,"dsn":dsn,"Pwd":newPwd,"Stime":Stime,"Etime":Etime,"channel":channel,"remark":remark};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步    
      success(res) {
        if(res.data.status=="1"){
          wx.hideLoading();  //关闭提示框
          wx.showToast({
            title: '新增用户成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            wx.navigateBack({
              delta: 1,
          }) 
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
  //插入下发日志
  insertLog_LS:function(wx_id,hid,sbh,czlx,Pwd_type,Pwd,xfly){
    var _data = {ac: 'operateLog_save',"wx_id":wx_id,"hid":hid,"sbh":sbh,"czlx":czlx,"Pwd_type":Pwd_type,"Pwd":Pwd,"xfly":xfly};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      async:false,  //同步    
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  countdown: function () {
    var that = this;
    let second = that.data.second;
    clearInterval(this.data.c);//清除定时器
    that.data.c = setInterval(() => {//启动倒计时
      if(second == 0){
        clearInterval(this.data.c);//清除定时器
        wx.hideLoading();  //关闭提示框  
        that.setData({
          showMB:true,  //隐藏幕布
        });
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
  countdown_disconnect: function () { //断开的定时器
    var that = this;
    let second_discon = this.data.second_discon;
    clearInterval(this.data.c);//清除旧的定时器
    clearInterval(app.globalData.c_discon);//清除断开的定时器 
    app.globalData.c_discon = setInterval(() => {//启动倒计时
      if(second_discon == 0){
        clearInterval(app.globalData.c_discon);//清除断开的定时器
        app.globalData.c_discon = ""; //设置成空
        com.break_link(dsn); //断开连接
        return;
      }
      else{
        second_discon = second_discon - 1;
      }
      that.setData({
        second_discon: second_discon
      });
    }, 1000);  
  },
  onShow: function () {  //生命周期函数--监听页面显示
  }
})