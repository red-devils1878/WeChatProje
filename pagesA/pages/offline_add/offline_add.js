var dsn= "";  //设备号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
var com = require('../../../utils/commom.js');  //公共js
var userid= "";  //登陆人工号
var ptlx= "hongqi";  //平台类型
var lylx= "1";  //供应商类型
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
for (let i = 0; i < 1; i++) {
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
    //multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    //endIndex: [1,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),0],
    endIndex: [1,date.getMonth(),date.getDate()-1,date.getHours(),0],
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
    //设置默认的年份
    this.setData({
    choose_year: this.data.multiArray[0][0]
    });
    this.get_mcToMS(dsn); //获取门锁信息
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
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
    });  
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
    var Stime = e.detail.value.start_time;
    var Etime = e.detail.value.end_time;
    if(!Stime || !Etime){
      wx.showToast({
        title: '日期不能为空!',
        icon: "none",
      })
      return;
    }
    var ks = Stime.replace(/-/g, "/");
    var js = Etime.replace(/-/g, "/");
    var sTime = new Date(ks);  //开始时间
    var eTime = new Date(js);  //结束时间
    var hous_xc  = parseInt((eTime.getTime() - sTime.getTime()) / parseInt(1000 * 3600));
    var kssj = Stime+':00';
    var jssj = Etime+':00';
    var _dataNC = "";
    var jk = ""; //接口
    if(lylx == "2"){  //福州锁
      if(hous_xc < 1){
        wx.showToast({
          title: '开始时间和结束时间至少要差1个小时',
          icon: "none",
          duration: 1000
        }) 
        return false;
      }
      else{
        var _dataS = {ac: 'get_offlineFlag',"dsn":dsn,"kssj":kssj,"jssj":jssj};
        wx.request({
          url: apiUrl,  //api地址
          data: _dataS,
          header: {'Content-Type': 'application/json'},
          method: "get",
          async:false,  //同步
          success(res) {
            let xfzt = res.data.xfzt;
            if(xfzt=="已下发"){
              wx.showToast({
                title: '该时间段已下发过，请选择别的时间段',
                icon: "none",
                duration: 1500
              }) 
              return false;
            }
            else{
              jk = 'add_offline_password';
              _dataNC = '{ac: "add_offline_password","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","begindate":"'+Stime+'","enddate":"'+Etime+'"}'
              that.generate_pwd(jk,_dataNC,lylx,kssj,jssj);
            }
          },
          fail(res) {
          },
        });
      }
    }
    else if(lylx == "5" || lylx == "6"){  //国民锁
 
    }
    else if(lylx == "20" || lylx == "21"){  //同欣锁
      /*
      jk = 'tx_add_offline_password';
      _dataNC = '{ac: "tx_add_offline_password","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","begindate":"'+kssj+'","enddate":"'+jssj+'"}'
      that.generate_pwd(jk,_dataNC,lylx,kssj,jssj);
      */
      if(hous_xc < 1){
        wx.showToast({
          title: '开始时间和结束时间至少要差1个小时',
          icon: "none",
          duration: 1000
        }) 
        return false;
      }
      else{
        var _dataS = {ac: 'get_offlineFlag',"dsn":dsn,"kssj":kssj,"jssj":jssj};
        wx.request({
          url: apiUrl,  //api地址
          data: _dataS,
          header: {'Content-Type': 'application/json'},
          method: "get",
          async:false,  //同步
          success(res) {
            let xfzt = res.data.xfzt;
            if(xfzt=="已下发"){
              wx.showToast({
                title: '该时间段已下发过，请选择别的时间段',
                icon: "none",
                duration: 1500
              }) 
              return false;
            }
            else{
              jk = 'tx_add_offline_password';
              _dataNC = '{ac: "tx_add_offline_password","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","begindate":"'+kssj+'","enddate":"'+jssj+'"}'
              that.generate_pwd(jk,_dataNC,lylx,kssj,jssj);
            }
          },
          fail(res) {
          },
        });
      }
    }
  },
  generate_pwd: function(jk,_dataNC,lylx,kssj,jssj) {
    let that = this;
    wx.request({
      url: apiNC+jk,  //api地址
      data: _dataNC,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: '失败',
            icon: "none",
            duration: 1000
          })  
        }
        else {
          if(res.data.code=='0'){
            var otp= "";
            var result_opt = "";
            var title = "注：离线密码，有效期24小时";
            if(lylx=="2"){
              otp = res.data.data.password;
              title = "注：离线密码，有效期24小时";          
              result_opt = otp.substr(0,4) + '  ' + otp.substr(4,4)+ '  ' + otp.substr(8,4);
            }
            else if(lylx=="5" || lylx=="6"){
              otp = res.data.data.password;
              result_opt = otp.substr(0,4) + '  ' + otp.substr(4,4)+ '  ' + otp.substr(8,4);
              title = "注：离线密码，有效期24小时";     
            }else if(lylx=="20" || lylx=="21"){
              otp = res.data.result.password;
              result_opt = otp.substr(0,4) + '  ' + otp.substr(4,4)+ '  ' + otp.substr(8,4);
              title = "注：离线密码，有效期24小时";     
            }
            wx.showModal({
              title: title,
              showCancel: false,
              cancelText:'关闭',
              cancelColor:'red',
              confirmText:'返回',
              confirmColor:'#47a86c',
              content: result_opt,
              success: function(res) {
              }
            })
            if(lylx=="2"){
              that.insert_offlineLog(dsn,kssj,jssj,otp);  //插入离线日志
            }
            else if(lylx=="20" || lylx=="21"){
              that.insert_offlineLog(dsn,kssj,jssj,otp);  //插入离线日志
            }
            that.insertLog_LS(userid,'',dsn,'下发','离线密码',otp,'朗思管家端');
          }
          else{
            var title = "";
            if(lylx=="2"){
              title = res.data.msg;
            }
            else{
              title = res.data.message;
            }
            wx.showToast({
              title: title,
              icon: "none",
              duration: 1000
            })                  
          }
        }
      }
    });
  },
 //插入离线日志
 insert_offlineLog:function(dsn,kssj,jssj,Pwd){
  var _data = {ac: 'offlineLog_save',"dsn":dsn,"kssj":kssj,"jssj":jssj,"Pwd":Pwd};
  wx.request({
    url: apiUrl,  //api地址
    data: _data,
    header: {'Content-Type': 'application/json'},
    method: "get",
    async:false,  //同步
    success(res) {
    },
    fail(res) {
    },
    complete(){
    }
  });    
  },
  //插入下发日志
  insertLog_LS:function(wx_id,hid,sbh,czlx,Pwd_type,Pwd,xfly){
    let renterNo = "";
    var _data = {ac: 'operateLog_save',"wx_id":wx_id,"hid":hid,"sbh":sbh,"czlx":czlx,"Pwd_type":Pwd_type,"Pwd":Pwd,"xfly":xfly,"renterNo":renterNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      async:false,  //同步    
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
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