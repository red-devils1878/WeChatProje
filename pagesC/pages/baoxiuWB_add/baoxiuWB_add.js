var orderNo= "";  //工单编号
var userid= ""; //登录人
var app = getApp();
var apiUrl = app.globalData.apiUrl_LS;   //获取api地址
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
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
    unitIndex: 0,
    sblxIndex: 0,
    jjcdIndex: 0,
    orderNo2: '',
    imgs:[],
    showView:false,
    img_qty:0,
    imgUrlArr: [],//需要传给后台的图片数组
    countNum :6, //上传数量
    Starttime: '',
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    choose_year: '',
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
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
    userid = app.globalData.userid;  
    that.get_sblx();  //获取设备类型
    that.get_sjd();  //获取上门时间段
    that.get_jjcd();  //获取紧急程度
  },
  get_sblx:function () { //获取设备类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_equip'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          console.log("getunits success:",res); 
          var sblxs = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              sblx:sblxs
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
  get_sjd:function () { //获取时间段
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_update'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          console.log("getunits success:",res); 
          var sjds = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              unit:sjds
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
  get_jjcd:function () { //获取紧急程度
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'Pro_jjcd'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var jjcd = res.data.rows;
        setTimeout(()=>{
            _this.setData({
                jjcd:jjcd
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
  bindSBChange: function(e) {  //设备类型改变事件
    this.setData({
      sblxIndex: e.detail.value
    })
  },
  bindSJDChange: function(e) {  //时间段改变事件
    this.setData({
      unitIndex: e.detail.value
    })
  },
  bindDateChange: function(e) {  //上门时间
    this.setData({
      date: e.detail.value
    })
  },
  jjcdChange: function(e) {  //紧急程度改变事件
    this.setData({
      jjcdIndex: e.detail.value
    })
  },
  startDateChange: function(e) {  //接保时间
    this.setData({
      Sdate: e.detail.value
    })
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
  // 上传图片
  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    if (imgs.length >= 6) {
      that.setData({
        lenMore: 1
      });
      setTimeout(function () {
        that.setData({
          lenMore: 0
        });
      }, 2500);
      wx.showToast({
        icon:'none',
        title: '最多只能选择6张图片',
      })
      return false;
    }
    wx.chooseImage({
      count: that.data.countNum, // 默认3
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var imgs = that.data.imgs;
        var imgUrlArr = that.data.imgUrlArr;
        for (var i = 0; i < tempFilePaths.length; i++) {
          if (imgs.length >= 6) {
            that.setData({
              imgs: imgs,
              imgUrlArr: imgUrlArr,
            });
            return false;
          } else {
            imgs.push(tempFilePaths[i]);
            var item = tempFilePaths[i];
          }
        }
        that.setData({
          imgs: imgs,
          imgUrlArr: imgUrlArr,
          countNum: 6 - imgs.length
        });
        if(imgs.length>=6){
          that.setData({
            showView: true
          });
        }
      }
    });
  },
  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var imgUrlArr = this.data.imgUrlArr;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    imgUrlArr.splice(index, 1)
    var imgsLen = imgs.length;
    this.setData({
      imgs: imgs,
      imgUrlArr: imgUrlArr,
      countNum: 6 - imgsLen
    });
    if(imgsLen>=6){
      this.setData({
        showView: true
      });
    }
    else{
      this.setData({
        showView: false
      });   
    }
  },
  previewImage: function(e){
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imgs;
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  },
  uploadImg :function(orderNo){
    var that = this;
    let i = 0;
    let length = this.data.imgs.length;
    that.upLoadPhoto(orderNo,i,length);
  },
  upLoadPhoto :function(orderNo,i,length){  //上传图片至服务器
    var that = this;
    var _data = {ac: "Upload","tbName":"IB_workOrder","zd":"orderNo","keyV":orderNo};
    wx.uploadFile({
      formData:_data,
      url: apiUrl,
      header: { "Content-Type": "multipart/form-data" },
      filePath: this.data.imgs[i],
      name: 'file',
      success: function (res) {
        console.log("返回结果："+res)
      },
      fail: function (res) {
        console.log("上传失败，请稍后重试");
      },
      complete(){
        i++;
        if(i == length){
          console.log("上传成功");
        }
        else{
          that.upLoadPhoto(orderNo,i,length);
        }
      } 
    })
  },
  formSubmit: function (e){  //保存数据
    var ld = e.detail.value.ld;
    var room = e.detail.value.room;
    var whlx = e.detail.value.sblx;
    var name = e.detail.value.name;
    var tel = e.detail.value.tel;
    var yjsmsj = e.detail.value.yjsmsj;
    var jbsj = e.detail.value.startDate;
    if(!jbsj){
      wx.showToast({
        title: '接保时间不能为空!',
        icon: "none",
      })
      return;
    }
    if(!yjsmsj){
      wx.showToast({
        title: '预计上门时间不能为空!',
        icon: "none",
      })
      return;
    }
    else{
      yjsmsj = yjsmsj+':00';    
    }
    var sjd = e.detail.value.sjd;
    if(!sjd){
      sjd = "";
    }
    if(!ld || !room){
      wx.showToast({
        title: '楼栋，房号不能为空',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    var jjcd = e.detail.value.jjcd;
    var wtms = e.detail.value.wtms;
    var gdlx = "1002";
    var djly = "维保";
    var that = this;
    var _data = {ac: 'workOrderWB_save',"userid":userid,"gdlx":gdlx,"djly":djly,"whlx":whlx,"name":name,"tel":tel,"yjsmsj":yjsmsj,"sjd":sjd,"jjcd":jjcd,"wtms":wtms,"ld":ld,"room":room,"jbsj":jbsj};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: res.data.msg,
          icon: "success",
          duration: 1000
        })
        var dh = res.data.orderNo;
        if(!!dh){
          orderNo = dh;
          that.setData({
            orderNo2:dh
          })
        }
        let length = that.data.imgs.length;
        if(length>0){
          that.uploadImg(orderNo);//上传照片
          setTimeout(function() {
            wx.navigateBack({
              delta: 1,
            })
          }, 2000) 
        }else{
          wx.navigateBack({
            delta: 1,
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
  onShow: function () {  //生命周期函数--监听页面显示
  }
})