var app = getApp();
var apiUrl = "";   //获取api地址
var apiYC = "";     //获取门锁api地址(远程)
var apiNC = "";     //获取门锁api地址(新锁)
var com = require('../../utils/commom.js');  //公共js
var apiTX = app.globalData.apiTX;     //小陈指纹、卡片接口
var newPwd = ""; //新密码
var cardNo = ""; //卡片编号
var userid= "";  //登陆人工号
var ptlx= "hongqi";  //平台类型
var index_add = 0;  //新下标(下发)
var index_del = 0;  //新下标(删除)
var xfcs = 0;  //下发次数
var houseNo = ""; //房源
var floor = ""; //楼层
var room = ""; //房间

var cjqNo_n = "" //采集器(新)
var cjqNo = "" //采集器
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
    multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    endIndex: [1,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    choose_year: '',
    showMB:true, //幕布
    second: 360, //倒计时20秒
    c:'',//定时器
    fyIndex: 0,
    Locklist:[],  //所有门锁
    pwdList:[],  //要删除的密码
    errAddList:"",  //下发失败的房号
    errDelList:"",  //删除失败的房号
    kslxIndex: 0,
    kslx: [{code: 0,othername: '密码'},{code: 1,othername: '卡片'}],
    mydata : "",
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    apiUrl = app.globalData.apiUrl;
    apiYC = app.globalData.apiYC;
    apiNC = app.globalData.apiNC;
    userid = app.globalData.userid;   //登陆人工号
    //设置默认的年份
    this.setData({
    choose_year: this.data.multiArray[0][0]
    });
    this.get_house(); //获取房源
    //this.get_pwd(); //生成密码
  },
  get_house:function () { //获取房源
    let _this = this;
    var _data = {ac: 'get_houseName',"userid":userid};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var fy = res.data.rows;   
          _this.setData({
            fy:fy
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  bindFYChange: function(e) {
    this.setData({
      fyIndex: e.detail.value
    })
    houseNo = this.data.fy[e.detail.value].houseNo;
    this.get_houseInfo(houseNo);  //获取房源
  },
  bindKSChange: function(e) {  //开锁类型改变事件
    this.setData({
      kslxIndex: e.detail.value,
    })
  },
  get_houseInfo:function (houseNo) { //获取房源
    let _this = this;
    var _data = {ac: 'get_house',"houseNo":houseNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          _this.setData({
            lylx:units[0].txfs,
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
  floorChange: function(e) {
    this.setData({
      floorVal: e.detail.value
    })
  },
  roomChange: function(e) {
    this.setData({
      roomVal: e.detail.value
    })
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
    newPwd = e.detail.value.pwd;
    var houseNo = e.detail.value.fy;
    var floor = e.detail.value.floor;
    var room = e.detail.value.room;
    var kslx = e.detail.value.kslx;
    cardNo = e.detail.value.cardNo;
    if(!houseNo || houseNo=='ALL'){
      wx.showToast({
        title: '请选择具体楼栋',
        icon: "none",
      })
      return false;
    }
    if(!floor){
      wx.showToast({
        title: '请选择楼层',
        icon: "none",
      })
      return false;
    }
    if(!Stime || !Etime){
      wx.showToast({
        title: '日期不能为空!',
        icon: "none",
      })
      return false;
    }
    else{
      Stime = Stime+':00';
      Etime = Etime+':00';
    }
    if(kslx=="0"){  //密码
      if(!newPwd || newPwd.length != 6){
        wx.showToast({
          title: '请输入6位数密码！',
          icon: 'none'
        })
        return false;
      }
      else{
        index_add = 0; //初始化为0
        that.get_plxfLock(houseNo,floor,room,newPwd);  //需要下发的门锁
      }
    }
    else{ //卡片
      if(!cardNo){
        wx.showToast({
          title: '卡片编号不能为空！',
          icon: 'none'
        })
        return false;
      }
      else{
        index_add = 0; //初始化为0
        that.get_plxfLock(houseNo,floor,room,cardNo);  //需要下发的门锁
      }
    }
  },
  get_plxfLock:function (houseNo,floor,room,newPwd) { //需要下发的门锁
    var that = this;
    let kslxIndex = that.data.kslxIndex;
    var title = "密码下发中...";
    if(kslxIndex=="0"){
      title = "密码下发中...";
    }else{
      title = "卡片下发中...";
    }
    that.setData({
      Locklist:[],
      errAddList:"",
    })
    var _data = {ac: 'get_plxfLock',"houseNo":houseNo,"floor":floor,"room":room,"pwd":newPwd};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          that.setData({
            showMB:false,  //显示幕布
            Locklist:units,
            second: 360,  //初始化成40秒
          })
          that.countdown(); //调用计时器
          wx.showLoading({
            title: title,
          })
          index_add = 0; //初始化为0
          xfcs = 0;
          setTimeout(function () {
            that.password_insertN(0); //批量下发  
          },1000);                               
        }
        else{
          wx.showToast({
            title: '下发完成',
            icon: 'none',
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
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      },
      complete(){
      }
    });
  },
  password_insertN: function(ind) {
    var that = this;
    let Locklist = this.data.Locklist;
    let kslxIndex = that.data.kslxIndex;
    let dsn = Locklist[ind].dsn;
    let lylx = Locklist[ind].lx;
    //let newPwd = that.data.pwd;
    let useType = "02"; //普通用户
    var yhlx = "03"; //02卡片，03密码
    if(kslxIndex=="0"){
      yhlx = "03";
    }else{
      yhlx = "02"; 
    }
    let Stime = that.data.Starttime;
    let Etime = that.data.Endtime;
    Stime = Stime+':00';
    Etime = Etime+':00';
    var _dataNC = "";
    var _url = "";
    if(lylx=="2"){
      wx.showLoading({
        title: '密码下发中...',
      })
      com.get_Connection(dsn,function(res){
        let conStatus = res;
        console.log("网关蓝牙连接返回："+conStatus);
        var useType = "02"; //普通用户
        var _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","password":"'+newPwd+'","usertype":"'+useType+'","begindate":"'+Stime+'","enddate":"'+Etime+'","lx":"'+yhlx+'","channel":"21"}'
        wx.request({
          url: apiNC+'lockauth',  //api地址
          data: _dataNC,
          header: {'Content-Type': 'application/json'},
          method: "POST",
          async:false,  //同步
          success(res) {
            if(res==""){
              wx.showToast({
                title: '失败',
                icon: "none",
                duration: 2000
              })
            }
            else{
              if(res.data.code=='0'){
                xfcs = 0;
                console.log("返回的code:"+res.data.code);
                com.break_link(dsn); //断开连接
                console.log((Locklist.length*1)-1);
                if(index_add==((Locklist.length*1)-1)){
                  clearInterval(that.data.c);//清除定时器
                  wx.hideLoading();  //关闭提示框
                  that.setData({
                    showMB:true,  //隐藏幕布
                  })
                  let errAddLen = that.data.errAddList;
                  if(!!errAddLen){
                    console.log("下发失败的房号："+errAddLen);
                    wx.showModal({
                      title:'下发失败的房号',
                      showCancel: false,
                      cancelText:'关闭',
                      cancelColor:'red',
                      confirmText:'返回',
                      confirmColor:'#47a86c',
                      content:errAddLen,
                      success: function(res) {
                      }
                    })
                  }
                  else{
                    wx.showToast({
                      title: '下发完成',
                      icon: 'none',
                      duration: 1000
                    })
                    setTimeout(()=>{
                      wx.navigateBack({
                        delta: 1,
                      })
                    },1000)                   
                  }
                }else{
                  var delayed_t = 600;
                  index_add+=1//下发下标加一
                  setTimeout(function () {
                    that.password_insertN(index_add);
                  },delayed_t);  
                }
              }
              else{
                if(res.data.code=='10010' && xfcs < 3){    
                  xfcs+=1//下发次数+1               
                  that.password_insertN(index_add);//再次执行
                }
                else if(res.data.code=='-1' && xfcs < 3 ){  
                  xfcs+=1//下发次数+1           
                  that.password_insertN(index_add);//再次执行
                }
                else{
                  //将失败的插入数组
                  let errorRoomNo = Locklist[index_add].roomNo+',';
                  that.setData({
                    errAddList:that.data.errAddList.concat(errorRoomNo)
                  })                 
                  if(index_add==((Locklist.length*1)-1)){      
                    clearInterval(that.data.c);//清除定时器
                    wx.hideLoading();  //关闭提示框
                    that.setData({
                      showMB:true,  //隐藏幕布
                    })
                    let errAddLen = that.data.errAddList;
                    if(!!errAddLen){
                      console.log("下发失败的房号："+errAddLen);
                      wx.showModal({
                        title:'下发失败的房号',
                        showCancel: false,
                        cancelText:'关闭',
                        cancelColor:'red',
                        confirmText:'返回',
                        confirmColor:'#47a86c',
                        content:errAddLen,
                        success: function(res) {
                        }
                      })
                    }
                    else{
                      wx.showToast({
                        title: '下发完成',
                        icon: 'none',
                        duration: 1000
                      })
                      setTimeout(()=>{
                        wx.navigateBack({
                          delta: 1,
                        })
                      },1000)                    
                    }              
                  }else{      
                    var delayed_t = 600;
                    index_add+=1//下发下标加一
                    setTimeout(function () {
                      that.password_insertN(index_add);
                    },delayed_t);                    
                  }                             
                }
              }
            }        
          },
          fail(res) {
            console.log("getunits fail:",res);
            wx.showToast({
              title: '新增用户失败',
              icon: "error",
              duration: 2000
            })
          },
          complete(){
          }
        });
      });
    }
    else{
      if(lylx=="1"){
        _dataNC = { ac: "lockauth", partnerid: ptlx, deviceid: dsn, password: newPwd, usertype: useType, begindate: Stime, enddate: Etime, channel: "21"};
        _url = apiYC;
      }
      else if(lylx=="5" || lylx=="6"){
        _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","password":"'+newPwd+'","usertype":"'+useType+'","begindate":"'+Stime+'","enddate":"'+Etime+'","lx":"'+yhlx+'","channel":"21"}'
        _url = apiNC+'gm_add_user';
      }
      else if(lylx=="20" || lylx=="21"){
        if(kslxIndex=="0"){  //密码
          _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","password":"'+newPwd+'","usertype":"'+useType+'","begindate":"'+Stime+'","enddate":"'+Etime+'","lx":"'+yhlx+'","channel":"21"}'
        }else{  //卡片
          _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","userdata":"'+cardNo+'","usertype":"'+useType+'","begindate":"'+Stime+'","enddate":"'+Etime+'","lx":"'+yhlx+'","channel":"21"}'
        }     
        _url = apiNC+'tx_add_user';
      }
      wx.request({
        url: _url,  //api地址
        data: _dataNC,
        header: {'content-type': 'application/json'},
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
          else{
            if(res.data.code=='0'){
              xfcs = 0;
              console.log("返回的code:"+res.data.code);
              console.log((Locklist.length*1)-1);
              if(index_add==((Locklist.length)*1-1)){
                clearInterval(that.data.c);//清除定时器
                wx.hideLoading();  //关闭提示框
                that.setData({
                  showMB:true,  //隐藏幕布
                })
                /*
                setTimeout(()=>{
                 that.get_plxfLock(houseNo,floor,room,newPwd);  //需要下发的门锁
                },500)
                */
                let errAddLen = that.data.errAddList;
                if(!!errAddLen){
                  console.log("下发失败的房号："+errAddLen);
                  wx.showModal({
                    title:'下发失败的房号',
                    showCancel: false,
                    cancelText:'关闭',
                    cancelColor:'red',
                    confirmText:'返回',
                    confirmColor:'#47a86c',
                    content:errAddLen,
                    success: function(res) {
                    }
                  })
                }
                else{
                  wx.showToast({
                    title: '下发完成',
                    icon: 'none',
                    duration: 1000
                  })
                  setTimeout(()=>{
                    wx.navigateBack({
                      delta: 1,
                    })
                  },1000)                   
                }
              }else{
                var delayed_t = 600;
                if(lylx=="20" || lylx=="21"){
                  delayed_t = 3000;
                }
                index_add+=1//下发下标加一
                setTimeout(function () {
                  that.password_insertN(index_add);
                },delayed_t);  
              }
            }
            else{
              if(res.data.code=='10010' && xfcs < 3){    
                xfcs+=1//下发次数+1               
                that.password_insertN(index_add);//再次执行
              }
              else if(res.data.code=='-1' && xfcs < 3 ){    
                xfcs+=1//下发次数+1           
                that.password_insertN(index_add);//再次执行
              }
              else{  
                //将失败的插入数组
                let errorRoomNo = Locklist[index_add].roomNo+',';
                that.setData({
                  errAddList:that.data.errAddList.concat(errorRoomNo)
                })
                if(lylx=="5" || lylx=="6" || lylx=="20" || lylx=="21"){
                  console.log("下发失败："+res.data.code+'——>>'+res.data.message); 
                }else{
                  console.log("下发失败："+res.data.code+'——>>'+res.data.msg);  
                }
                if(index_add==((Locklist.length*1)-1)){      
                  clearInterval(that.data.c);//清除定时器
                  wx.hideLoading();  //关闭提示框
                  that.setData({
                    showMB:true,  //隐藏幕布
                  })
                  let errAddLen = that.data.errAddList;
                  if(!!errAddLen){
                    console.log("下发失败的房号："+errAddLen);
                    wx.showModal({
                      title:'下发失败的房号',
                      showCancel: false,
                      cancelText:'关闭',
                      cancelColor:'red',
                      confirmText:'返回',
                      confirmColor:'#47a86c',
                      content:errAddLen,
                      success: function(res) {
                      }
                    })
                  }
                  else{
                    wx.showToast({
                      title: '下发完成',
                      icon: 'none',
                      duration: 1000
                    })
                    setTimeout(()=>{
                      wx.navigateBack({
                        delta: 1,
                      })
                    },1000)                   
                  }
                }
                else{
                  var delayed_t = 600;
                  if(lylx=="20" || lylx=="21"){
                    delayed_t = 3000;
                  }
                  index_add+=1//下发下标加一
                  setTimeout(function () {
                    that.password_insertN(index_add);
                  },delayed_t);   
                }                     
              }
            }
          }
        },
        fail(res) {
          wx.showToast({
            title: '新增失败',
            icon: "error",
            duration: 1000
          })
        },
        complete(){
        }
      });
    }
  },
  //批量删除
  del: function(e) {
    var that = this;
    var floor = that.data.floorVal;
    var room = that.data.roomVal;
    var kslxIndex = that.data.kslxIndex;
    var cardNo = that.data.cardNo;
    if(!room){ room = "";}   
    if(!floor){ floor = "";}
    if(!houseNo || houseNo=='ALL'){
      wx.showToast({
        title: '请选择具体楼栋',
        icon: "none",
      })
      return false;
    }
    if(!floor){
      wx.showToast({
        title: '请选择楼层',
        icon: "none",
      })
      return false;
    }
    if(kslxIndex=="0"){ //密码
      if(!newPwd || newPwd.length != 6){
        wx.showToast({
          title: '请输入6位数密码！',
          icon: 'none'
        })
        return false;
      }
      else{
        index_del = 0; //初始化为0
        that.get_plDelPwd(houseNo,floor,room,newPwd);//获取需要批量删除的门锁
      }
    }
    else{  //卡片
      if(!cardNo){
        wx.showToast({
          title: '卡片编号不能为空！',
          icon: 'none'
        })
        return false;
      }
      else{
        index_del = 0; //初始化为0
        that.get_plDelPwd(houseNo,floor,room,cardNo);//获取需要批量删除的门锁
      }
    }
  },
  get_plDelPwd:function (houseNo,floor,room,newPwd) { //获取需要批量删除的门锁
    var that = this;
    let kslxIndex = that.data.kslxIndex;
    var title = "密码删除中...";
    if(kslxIndex=="0"){
      title = "密码删除中...";
    }else{
      title = "卡片删除中...";
    }
    that.setData({
      pwdList:[],
      errDelList:"",
    })
    var _data = {ac: 'get_plDelPwd',"houseNo":houseNo,"floor":floor,"room":room,"Pwd":newPwd};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          that.setData({
            showMB:false,  //显示幕布
            pwdList:units,
            second: 360,  //初始化成40秒
          })
          that.countdown(); //调用计时器
          wx.showLoading({
            title: title,
          })
          index_del = 0; //初始化为0
          xfcs = 0; //初始化为0
          setTimeout(function () {
            that.password_delN(0); //批量删除
          },1000);                               
        }
        else{
          wx.showToast({
            title: '删除完成',
            icon: 'none',
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
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      },
      complete(){
      }
    });
  },
  password_delN: function(ind) {
    var that = this;
    let pwdList = this.data.pwdList;
    let dsn = pwdList[ind].equip_no;
    let lylx = pwdList[ind].lylx;
    let yhbh = pwdList[ind].yhbh;
    let lx = pwdList[ind].lx;
    let pwd_old = pwdList[ind].password;
    var _dataNC = "";
    var _url = "";
    if(lylx=="2"){
      wx.showLoading({
        title: '密码删除中...',
      })
      com.get_Connection(dsn,function(res){
        let conStatus = res;
        console.log("网关蓝牙连接返回："+conStatus);
        _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
        _url = apiNC+'deletepassword';
        wx.request({
          url: _url,  //api地址
          data: _dataNC,
          header: {'Content-Type': 'application/json'},
          method: "POST",
          async:false,  //同步
          success(res) {
            if(res==""){
              wx.showToast({
                title: '失败',
                icon: "none",
                duration: 2000
              })
            }
            else{
              if(res.data.code=='0'){
                xfcs = 0;
                console.log("返回的code:"+res.data.code);
                com.break_link(dsn); //断开连接
                if(index_del==((pwdList.length)*1-1)){
                  clearInterval(that.data.c);//清除定时器
                  wx.hideLoading();  //关闭提示框
                  that.setData({
                    showMB:true,  //隐藏幕布
                  })
                  /*
                  setTimeout(()=>{
                    that.get_plDelPwd(houseNo,floor,room,newPwd);//获取需要批量删除的门锁  
                  },500)
                  */
                  let errDelLen = that.data.errDelList;
                  if(!!errDelLen){
                    console.log("删除失败的房号："+errDelLen);
                    wx.showModal({
                      title:'删除失败的房号',
                      showCancel: false,
                      cancelText:'关闭',
                      cancelColor:'red',
                      confirmText:'返回',
                      confirmColor:'#47a86c',
                      content:errDelLen,
                      success: function(res) {
                      }
                    })
                  }   
                  else{
                    wx.showToast({
                      title: '删除完成',
                      icon: 'none',
                      duration: 1000
                    })
                    setTimeout(()=>{
                      wx.navigateBack({
                        delta: 1,
                      })
                    },1000)                   
                  }     
                }else{
                  var delayed_d = 600;
                  index_del+=1//删除下标加一
                  setTimeout(function () {
                    that.password_delN(index_del);
                  },delayed_d);  
                }
              }
              else{
                if(res.data.code=='10010' && xfcs < 3){     
                  xfcs+=1//下发次数+1              
                  that.password_delN(index_del);//再次执行
                }
                else if(res.data.code=='-1' && xfcs < 3 ){    
                  xfcs+=1//下发次数+1           
                  that.password_delN(index_del);//再次执行
                }
                else{
                  //将失败的插入数组
                  let delRoomNo = pwdList[index_del].roomNo+',';
                  that.setData({
                    errDelList:that.data.errDelList.concat(delRoomNo)
                  })
                  if(lylx=="5" || lylx=="6" || lylx=="20" || lylx=="21"){
                    console.log("删除失败："+res.data.code+'——>>'+res.data.message); 
                  }else{
                    console.log("删除失败："+res.data.code+'——>>'+res.data.msg);  
                  }
                  if(index_del==((pwdList.length)*1-1)){      
                    clearInterval(that.data.c);//清除定时器
                    wx.hideLoading();  //关闭提示框
                    that.setData({
                      showMB:true,  //隐藏幕布
                    })
                    let errDelLen = that.data.errDelList;
                    if(!!errDelLen){
                      console.log("删除失败的房号："+errDelLen);
                      wx.showModal({
                        title:'删除失败的房号',
                        showCancel: false,
                        cancelText:'关闭',
                        cancelColor:'red',
                        confirmText:'返回',
                        confirmColor:'#47a86c',
                        content:errDelLen,
                        success: function(res) {
                        }
                      })
                    } 
                    else{
                      wx.showToast({
                        title: '删除完成',
                        icon: 'none',
                        duration: 1000
                      })
                      setTimeout(()=>{
                        wx.navigateBack({
                          delta: 1,
                        })
                      },1000)                   
                    }                  
                  }
                  else{
                    var delayed_d = 600;
                    index_del+=1//删除下标加一
                    setTimeout(function () {
                      that.password_delN(index_del);
                    },delayed_d);   
                  }                               
                }
              }
            }        
          },
          fail(res) {
            console.log("getunits fail:",res);
            wx.showToast({
              title: '删除用户失败',
              icon: "error",
              duration: 2000
            })
          },
          complete(){
          }
        });
      });
    }
    else{
      if(lylx=="1"){
        _dataNC = { ac: "deletepassword", partnerid: ptlx, deviceid: dsn, passwordid: yhbh, channel: "21"};
        _url = apiYC;
      }
      else if(lylx=="5" || lylx=="6"){
        _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
        _url = apiNC+'gm_del_user';
      }
      else if(lylx=="20" || lylx=="21"){
        _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
        _url = apiNC+'tx_del_user';
      }
      wx.request({
        url: _url,  //api地址
        data: _dataNC,
        header: {'content-type': 'application/json'},
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
          else{
            if(res.data.code=='0'){
              xfcs = 0;
              console.log("返回的code:"+res.data.code);
              if(index_del==((pwdList.length)*1-1)){
                clearInterval(that.data.c);//清除定时器
                wx.hideLoading();  //关闭提示框
                that.setData({
                  showMB:true,  //隐藏幕布
                })
                /*
                setTimeout(()=>{
                  that.get_plDelPwd(houseNo,floor,room,newPwd);//获取需要批量删除的门锁  
                },500)
                */
                let errDelLen = that.data.errDelList;
                if(!!errDelLen){
                  console.log("删除失败的房号："+errDelLen);
                  wx.showModal({
                    title:'删除失败的房号',
                    showCancel: false,
                    cancelText:'关闭',
                    cancelColor:'red',
                    confirmText:'返回',
                    confirmColor:'#47a86c',
                    content:errDelLen,
                    success: function(res) {
                    }
                  })
                }
                else{
                  wx.showToast({
                    title: '删除完成',
                    icon: 'none',
                    duration: 1000
                  })
                  setTimeout(()=>{
                    wx.navigateBack({
                      delta: 1,
                    })
                  },1000)                   
                }                        
              }else{
                var delayed_d = 600;
                if(lylx=="20" || lylx=="21"){
                  delayed_d = 3000;
                }
                index_del+=1//删除下标加一
                setTimeout(function () {
                  that.password_delN(index_del);
                },delayed_d);  
              }
            }
            else{
              if(res.data.code=='10010' && xfcs < 3){     
                xfcs+=1//下发次数+1              
                that.password_delN(index_del);//再次执行
              }
              else if(res.data.code=='-1' && xfcs < 3 ){    
                xfcs+=1//下发次数+1           
                that.password_delN(index_del);//再次执行
              }
              else{
                //将失败的插入数组
                let delRoomNo = pwdList[index_del].roomNo+',';
                that.setData({
                  errDelList:that.data.errDelList.concat(delRoomNo)
                })
                if(lylx=="5" || lylx=="6" || lylx=="20" || lylx=="21"){
                  console.log("删除失败："+res.data.code+'——>>'+res.data.message); 
                }else{
                  console.log("删除失败："+res.data.code+'——>>'+res.data.msg);  
                }
                if(index_del==((pwdList.length)*1-1)){      
                  clearInterval(that.data.c);//清除定时器
                  wx.hideLoading();  //关闭提示框
                  that.setData({
                    showMB:true,  //隐藏幕布
                  })
                  let errDelLen = that.data.errDelList;
                  if(!!errDelLen){
                    console.log("删除失败的房号："+errDelLen);
                    wx.showModal({
                      title:'删除失败的房号',
                      showCancel: false,
                      cancelText:'关闭',
                      cancelColor:'red',
                      confirmText:'返回',
                      confirmColor:'#47a86c',
                      content:errDelLen,
                      success: function(res) {
                      }
                    })
                  }
                  else{
                    wx.showToast({
                      title: '删除完成',
                      icon: 'none',
                      duration: 1000
                    })
                    setTimeout(()=>{
                      wx.navigateBack({
                        delta: 1,
                      })
                    },1000)                   
                  }                  
                }
                else{
                  var delayed_d = 600;
                  if(lylx=="20" || lylx=="21"){
                    delayed_d = 3000;
                  }
                  index_del+=1//删除下标加一
                  setTimeout(function () {
                    that.password_delN(index_del);
                  },delayed_d);   
                }                               
              }
            }
          }
        },
        fail(res) {
          wx.showToast({
            title: '删除失败',
            icon: "error",
            duration: 1000
          })
        },
        complete(){
        }
      });
    }
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
  tapList: function(e) {   //根据标识跳转页面
    wx.navigateTo({
      url: '../../pagesB/pages/cjq_list/cjq_list'
    })
  },
  getCardNo: function () {  //获取卡号
    var that = this;
    let cjq = that.data.cjq;
    let lylx = that.data.lylx;
    if(lylx=="20" || lylx=="21"){
      if(!cjq){
        wx.showToast({
          title: '请先选择采集器',
          icon: "none",
          duration: 1000
        })
        return;
      }
      else{
        var _dataNC = {act: "langsi_Get_card",eqnumber:cjq}
        wx.request({
          url: apiTX,  //api地址
          data: _dataNC,
          header: {'Content-Type': 'application/json'},
          method: "POST",
          async:false,  //同步
          success(res) {
            if(res==""){
              wx.showToast({
                title: res.data.reason,
                icon: "none",
                duration: 1000
              })
            }
            else{
              let resultCode = res.data.resultCode;
              if(resultCode == "0")
              {
                let cardNo = res.data.data.cardNo;
                that.setData({
                  cardNo: cardNo
                })
              }
              else{
                let reason = res.data.reason;
                wx.showToast({
                  title: reason,
                  icon: "none",
                  duration: 1000
                })
                console.log("resultCode：" + resultCode + '——>' + reason);
              }
            }       
          },
          fail(res) {
            console.log("getunits fail:",res);
          },
          complete(){
          }
        });
      }
    }
    else{
      wx.showToast({
        title: '不支持采集',
        icon: "none",
        duration: 1000
      }) 
      return;   
    }
  },
  onShow: function () {  //生命周期函数--监听页面显示
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    let cjqNo_n = currPage.data.mydata.cjq;
    if(!!cjqNo_n){
      cjqNo = cjqNo_n;
    }
    if(!!cjqNo){
      this.setData({
        cjq: cjqNo
      })
    }
  }
})