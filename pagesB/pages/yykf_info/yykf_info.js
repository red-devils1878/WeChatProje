var yyNo= "";  //合同号
var userid= "";  //登陆人工号
var jjcdQJ = []; 
var rwztQJ = []; 
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
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
  data: {
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    recordList:[],
    stuRecord: '', // 跟进记录
    jjcdIndex: 0,
    rwztIndex: 0,
    Starttime: '',
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    choose_year: '',
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl; 
    userid = app.globalData.userid;   //登陆人工号
    yyNo = options.yyNo;
    //yyNo = "YY2204270037";
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    //设置默认的年份
    this.setData({
        choose_year: this.data.multiArray[0][0]
    });
    that.get_jjcd();  //获取紧急程度
    that.get_rwzt();  //获取任务状态
    that.yykf_info(yyNo);  //获取预约看房详情
    that.yykf_record(yyNo);  //获取跟进记录
  },
  get_jjcd:function () { //获取紧急程度
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'Pro_jjcd'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        jjcdQJ = units;
        setTimeout(()=>{
            _this.setData({
              jjcd:units
            })
        },1000)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_rwzt:function () { //获取任务状态
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_yyState'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        rwztQJ = units;
        setTimeout(()=>{
            _this.setData({
              rwzt:units
            })
        },1000)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
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
    let smsj = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    this.setData({
      Starttime: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
    })
    this.yyState_update(userid,yyNo,smsj,'yjsm');
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
    }
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
  jjcdChange: function(e) {  //紧急程度改变事件
    let that = this;
    let jjcd = jjcdQJ[e.detail.value].code;
    this.setData({
      jjcdIndex: e.detail.value
    })
    that.yyState_update(userid,yyNo,jjcd,'jjcd');
  },
  rwztChange: function(e) {  //任务状态改变事件
    let that = this;
    let yyState = rwztQJ[e.detail.value].code;
    this.setData({
       rwztIndex: e.detail.value
    })
    that.yyState_update(userid,yyNo,yyState,'rwzt');
  },
  //获取一维数组下标
  get_indexYW:function(arrayName,code){
    let arrtofor=arrayName;
    for (let index = 0; index < arrtofor.length; index++) {
      if(arrtofor[index].code==code){
        return index;
      }
    }
  },
   //  tab切换逻辑
   swichNav: function( e ) {
    var that = this;
    var tabV = e.target.dataset.current;
    if( this.data.currentTab === e.target.dataset.current ) {
      return false;
    } else {
      that.setData( {
        currentTab: e.target.dataset.current
      })
    }
    if(tabV=='0'){  //预约详情
      that.yykf_info(yyNo); 
    }
    else if(tabV=='1'){ //操作记录
      that.yykf_record(yyNo); 
    }
  },
  bindChange: function( e ) {
  var that = this;
  that.setData( { 
    currentTab: e.detail.current 
  });
  },
  yykf_info:function (yyNo) { //获取预约看房详情
    let _this = this;
    var _data = {ac: 'yykf_info',"yyNo":yyNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            _this.setData({
              yyNo:units[0].yyNo,
              hid:units[0].roomId,
              houseName:units[0].houseName,
              name:units[0].name,
              tel:units[0].tel,
              yyDate:units[0].yyDate2+'   '+units[0].sjd_name,
              demand:units[0].demand,
              yy_state:units[0].yy_state,
              djzt_name:units[0].djzt_name,
              jjcdIndex:_this.get_indexYW(jjcdQJ,units[0].jjcd),
              rwztIndex:_this.get_indexYW(rwztQJ,units[0].yy_state),
              Starttime:units[0].yjsmsj,
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
  yykf_record:function (yyNo) { //获取追踪记录
    let _this = this;
    var _data = {ac: 'yykf_record',"yyNo":yyNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            newlist.push({
              "id":units[i].id,
              "name":'【'+units[i].yy_state+'】',
              "time":units[i].updatadate,
              "event":units[i].nr
            })
          } 
          setTimeout(()=>{
            _this.setData({
              recordList:newlist
            })
          },1000)
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
  callTel: function(e) { //拨打电话
    let telNumber = e.currentTarget.dataset.tel;
    wx.makePhoneCall({
      phoneNumber:telNumber
    }).catch((e) => {
      console.log(e)
    })
  },
  tapGJ: function (e) {  //跟进
    this.setData( {
      ifName: true    //显示弹出框
    }); 
  },
  cancel: function (e) {  //取消
    this.setData( {
      ifName: false,    //隐藏弹出框
    }); 
  },
  /*
  jxz: function (e) {  //进行中
    let that = this;
    let yyState = "1002";
    that.yyState_update(userid,yyNo,yyState,'rwzt');
  },
  gqz: function (e) {  //挂起中
    let that = this;
    let yyState = "1003";
    that.yyState_update(userid,yyNo,yyState,'rwzt');
  },
  ywc: function (e) {  //已完成
    let that = this;
    let yyState = "1004";
    that.yyState_update(userid,yyNo,yyState,'rwzt');
  },
  */
  bindFormSubmit: function (e){
    var gjjl = e.detail.value.stuRecord;
    let _this = this;
    var _data = {ac: 'insert_record',"userid":userid,"yyNo":yyNo,"gjjl":gjjl};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.showToast({
            title: '跟进成功',
            icon: "none",
            duration: 1000
          })
          _this.setData({
            ifName: false,
          }); 
          setTimeout(()=>{
            _this.yykf_info(yyNo);  //获取预约看房详情
            _this.yykf_record(yyNo);  //获取跟进记录
          },1000)
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  yyState_update: function (userid,yyNo,yyState,gxzd){
    let _this = this;
    var _data = {ac: 'yyState_update',"userid":userid,"yyNo":yyNo,"yyState":yyState,"gxzd":gxzd};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.showToast({
            title: '修改成功',
            icon: "none",
            duration: 1000
          })
          setTimeout(()=>{
            _this.yykf_record(yyNo);  //获取跟进记录
          },1000)
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  onReady: function () {  //生命周期函数--监听页面初次渲染完成
  },
  onShow: function () {  //生命周期函数--监听页面显示

  },
  onHide: function () { //生命周期函数--监听页面隐藏
  },
  onReachBottom: function () { //页面上拉触底事件的处理函数
  }
})