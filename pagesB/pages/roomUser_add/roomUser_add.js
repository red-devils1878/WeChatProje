
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var userid= "";  //登陆人工号
var hid = "";//房间id
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
var telephone = ""  //联系电话
var cardNo2 = ""; //证件号
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
    rules:['133','149','153','173','177','180','181','189','190','191','193','199','130','131','132','145','155','156','166','167','171','175','176','185','186','196','134','135','136','137','138','139','144','147','148','150','151','152','157','158','159','172','178','182','183','184','187','188','195','197','198'],
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    hid = options.hid; //房间id
    apiUrl = app.globalData.apiUrl;
    userid = app.globalData.userid;   //登陆人工号
    telephone = ""  //联系电话
    cardNo2 = ""  //证件号
    //设置默认的年份
    this.setData({
    choose_year: this.data.multiArray[0][0]
    });
    this.get_htrq(hid); //获取合同有效期
  },
  get_htrq:function (hid) { //获取合同有效期
    let _this = this;
    var _data = {ac: 'get_htzq',"hid":hid};
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
  telChange: function(e) {   //姓名改变事件
    telephone = e.detail.value;
    if(telephone.length!=11){
      wx.showToast({
        title: "手机号长度应为11位",
        icon: 'none',
        duration: 1000
      })
      telephone = "";
      this.setData({
        tel:"",
        zktel:"",
      })
      return false;
    }
    let top3=telephone.substring(0,3)
     for(let t of this.data.rules){
     if(t==top3){
      this.setData({
        zktel:telephone
      })
      let dh = this.data.zktel;
      let sfzh = this.data.zksfz;
      if(!!dh && !!sfzh){
        this.judgeZK(dh,sfzh);
      }
      return;
     }
    }
    wx.showToast({
      title: "请输入正确的手机号",
      icon: 'none',
      duration: 1000
    })
    this.setData({
      tel:"",
      zktel:"",
    })
  },
  cardNoChange: function(e) {   //证件号改变事件
    cardNo2 = e.detail.value;
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if(reg.test(cardNo2)==false){
      wx.showToast({
        title: "请输入正确的身份证",
        icon: 'none',
        duration: 1000
      })
      cardNo2 = "";
      this.setData({
        cardNo:"",
        zksfz:""
      })
      return false;
    }
    else{
      this.setData({
        zksfz:cardNo2
      })
      let dh = this.data.zktel;
      let sfzh = this.data.zksfz;
      if(!!dh && !!sfzh){
        this.judgeZK(dh,sfzh);
      }
    }
  },
  judgeZK:function (tel,CardNo) { //判断租客电话是否被占用
    let _this = this;
    if(!tel){
      tel = 'tel';
    }
    if(!CardNo){
      CardNo = 'CardNo';
    }
    var _data = {ac: 'judgeZK_tel',"tel":tel,"CardNo":CardNo};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          wx.showToast({
            title: '该电话已被占用，请换号码！',
            icon: 'none',
            duration: 1000
          });
          setTimeout(function () {
            _this.setData({
              tel:"",
            })
          }, 1000);
        }
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
    var name = e.detail.value.name;
    var tel = e.detail.value.tel;
    var cardNo = e.detail.value.cardNo;
    var Stime = e.detail.value.start_time;
    var Etime = e.detail.value.end_time;
    if(!name){
      wx.showToast({
        title: '姓名不能为空!',
        icon: "none",
      })
      return false;
    }
    if(!tel){
      wx.showToast({
        title: '电话不能为空',
        icon: "none",
      })
      return false;
    }
    if(!Stime || !Etime){
      wx.showToast({
        title: '日期不能为空!',
        icon: "none",
      })
      return;
    }
    var _data = {ac: 'roomUser_add',"hid":hid,"name":name,"tel":tel,"cardNo":cardNo,"Stime":Stime,"Etime":Etime};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.showToast({
            title: '添加成功',
            icon: "success",
            duration: 1000//持续的时间
          });
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
  onShow: function () {  //生命周期函数--监听页面显示
  }
})