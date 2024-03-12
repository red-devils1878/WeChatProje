var orderNo= "";  //工单编号
var sblxQJ = []; 
var jjcdQJ = []; 
var sjdQJ = []; 
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
    imgs:[],
    showView:false,
    img_qty:0,
    Starttime: '',
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    choose_year: '',
  },

  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    orderNo = options.orderNo;
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
    that.get_sblx();  //获取设备类型
    that.get_sjd();  //获取上门时间段
    that.get_jjcd();  //获取紧急程度
    that.workOrder_info(orderNo);  //获取工单详情
    that.get_workPhoto(orderNo);  //获取照片
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
        var sblxs = res.data.rows;
        sblxQJ = sblxs;
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
          sjdQJ = sjds;
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
  workOrder_info:function (orderNo) { //获取工单详情
    let _this = this;
    var _data = {ac: 'workOrder_info',"orderNo":orderNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        _this.setData({
            orderNo2:units[0].orderNo,
            houseName:units[0].houseName,
            ld:units[0].buildName,
            room:units[0].roomName,
            sblxIndex:_this.get_indexYW(sblxQJ,units[0].sb_type),
            jjcdIndex:_this.get_indexYW(jjcdQJ,units[0].myd),
            unitIndex:_this.get_indexYW(sjdQJ,units[0].time_slot),
            name:units[0].xclxr,
            tel:units[0].xc_tel,
            Starttime:units[0].kgsj,
            //date:units[0].yjsmsj,
            wtms:units[0].wtms  
        })
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
  //获取一维数组下标
  get_indexYW:function(arrayName,code){
    let arrtofor=arrayName;
    for (let index = 0; index < arrtofor.length; index++) {
      if(arrtofor[index].code==code){
        return index;
      }
    }
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
      return false;
    }
    wx.chooseImage({
      // count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var imgs = that.data.imgs;
          console.log("图片路径-->"+tempFilePaths);
          var _data = {"ac": "Upload","tbName":"IB_workOrder","zd":"orderNo","keyV":orderNo};
          console.log("_data-->"+_data);
          wx.uploadFile({
            url: apiUrl, 
            filePath: tempFilePaths[0],
            header: { "Content-Type": "multipart/form-data" },
            name: 'file',
            formData: _data,
            success: function (da) {
            console.log("上传成功：-->"+da);
              wx.hideLoading();
              wx.showToast({
                title: "图片上传成功",
                icon: 'success',
                duration: 1000
              })
              setTimeout(()=>{
                that.get_workPhoto(orderNo);  //获取照片
              },10)
            }        
          })
      }
    });
  },
  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    var fileid = e.currentTarget.dataset.key;
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs
    });
    this.image_del(fileid); //删除照片
  },
  image_del: function (fileid){  //删除照片
    var that = this;
    var _data = {ac: 'image_del',"fileid":fileid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.showToast({
            title: '删除成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            that.get_workPhoto(orderNo);  //获取照片
          },10)
        }
    },
    fail(res) {
      console.log("getunits fail:",res);
    },
    complete(){
    }
  });   
  },
  previewImage: function(e){
    var index = e.currentTarget.dataset.index; //获取当前图片的下标
    var imgs = this.data.imgs;
    var dataArray = [];
    for(var i = 0; i < imgs.length; i++){
      dataArray[i] = imgs[i].url;
    }
    wx.previewImage({
      current: dataArray[index],   //当前显示图片
      urls: dataArray
    })
  },
  formSubmit: function (e){  //保存数据
    var gdh= e.detail.value.orderNo;
    var ld = e.detail.value.ld;
    var room = e.detail.value.room;
    var whlx = e.detail.value.sblx;
    var name = e.detail.value.name;
    var tel = e.detail.value.tel;
    var smsj = e.detail.value.start_time;
    if(!smsj){
      wx.showToast({
        title: '预计上门时间不能为空!',
        icon: "none",
      })
      return;
    }
    else{
        smsj = smsj;    
    }
    var sjd = e.detail.value.sjd;
    if(!sjd){
        sjd = "1";
    }
    var jjcd = e.detail.value.jjcd;
    var wtms = e.detail.value.wtms;
    if(!ld || !room){
        wx.showToast({
          title: '楼栋，房号不能为空',
          icon: "none",
          duration: 1000
        })
        return false;
    }
    var gdlx = "1002";  //报修工单
    var djly = "维保";
    var that = this;
    var _data = {ac: 'workOrderWB_update',"orderNo":gdh,"gdlx":gdlx,"djly":djly,"whlx":whlx,"name":name,"tel":tel,"smsj":smsj,"sjd":sjd,"wtms":wtms,"ld":ld,"room":room,"jjcd":jjcd};
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
        setTimeout(function() {
          wx.navigateBack({
            delta: 1,
          })
        }, 1000)  
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  get_workPhoto:function (orderNo) { //获取工单照片
    let _this = this;
    var _data = {ac: 'get_workPhoto',"orderNo":orderNo};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var qty = units.length;
        _this.setData({
          imgs:units,
          img_qty: qty
        })
        if(qty >= 6) {
          _this.setData({
            showView: true
          });
        }
        else{
          _this.setData({
            showView: false
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
  onShow: function () {  //生命周期函数--监听页面显示
  }
})