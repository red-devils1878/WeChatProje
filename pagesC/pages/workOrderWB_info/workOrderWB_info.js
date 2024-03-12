var orderNo= "";  //工单编号
var userid= "";  //登陆人工号
var hid= "";  //房源编号
var dsn= "";  //设备号
var djzt2= "";  //单据状态
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
    currentTab: 0,
    recordList:[],
    showView:false,
    imgs:[],
    showView2:false,
    img_qty:0,
    Starttime: '',
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
    choose_year: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    userid = app.globalData.userid;   //登陆人工号
    that.workOrder_info(orderNo);  //获取工单详情
    that.workOrder_record(orderNo);  //获取更近记录
    that.get_workPhoto(orderNo);  //获取照片
  },
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
    if(tabV=='1'){  //账单信息
      that.workOrder_info(orderNo);  //获取工单详情
      that.workOrder_record(orderNo);  //获取更近记录
      that.get_workPhoto(orderNo);  //获取照片
    }
  },
  bindChange: function( e ) {
    var that = this;
    that.setData( { 
      currentTab: e.detail.current 
    });
  },
  wgsjChange: function(e) {  //完工时间
    this.setData({
      wgsj: e.detail.value
    })
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
          console.log("getunits success:",res); 
          var units = res.data.rows;
          if(units.length > 0){
            let djzt = units[0].dj_state;
            djzt2 = units[0].dj_state;
            hid = units[0].roomId;
            dsn = units[0].dsn;
            if(djzt=="1005"){
              _this.setData({
                showView:true,
              })
            }
            _this.setData({
              orderNo:units[0].orderNo,
              houseName:units[0].houseName,
              gdlx:units[0].gdlx_name,
              sqsj:units[0].cre_da2,
              smsj:units[0].smsj+'  '+units[0].sjd_name,
              lxr:units[0].xclxr,
              lxdh:units[0].xc_tel,
              wtms:units[0].wtms,
              pwd:units[0].pwd,
              yjsmsj:units[0].yjsmsj,
              Starttime:units[0].yjsmsj,
              zt_name:units[0].djzt_name,
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
  workOrder_record:function (orderNo) { //获取更近记录
    let _this = this;
    var _data = {ac: 'workOrder_record',"orderNo":orderNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          console.log("getunits success:",res); 
          const newlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            newlist.push({
              "id":units[i].id,
              "name":'【'+units[i].dj_state+'】',
              "time":units[i].updateDate,
              "event":units[i].record
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
  get_workPhoto:function (orderNo) { //获取工单照片
    let _this = this;
    var _data = {ac: 'get_workPhoto',"orderNo":orderNo};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        console.log("getunits success:",res); 
        var units = res.data.rows;
        var qty = units.length;
        _this.setData({
          imgs:units,
          img_qty: qty
        })
        if(qty >= 6) {
          _this.setData({
            showView2: true
          });
        }
        else{
          _this.setData({
            showView2: false
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
  formSubmit: function (e){  //保存工作记录
    var that = this;
    var gzjl = e.detail.value.remark2;
    var _data = {ac: 'work_order_upstate',"orderNo":orderNo,"userid":userid,"gzjl":gzjl};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.showToast({
            title: '保存成功',
            icon: "success",
            duration: 1000
          }) 
          setTimeout(()=>{
            that.workOrder_record(orderNo);  //获取更近记录   
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
  wg: function (e){  //完工
    this.setData({
      ifName2:true,  //显示
    });
  },
  tapEvent: function(e) {
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let url = "";
    if (index == '01') {  //联系客户
      let telNumber = _this.data.lxdh;
      wx.makePhoneCall({
        phoneNumber:telNumber
      }).catch((e) => {
        console.log(e)
      })
    }else if ( index == '02' ) {  //填写结果
      url = '../../../pagesC/pages/work_result/work_result?orderNo='+orderNo;
    }else if ( index == '03' ) {  //拍照上传
      url = '../../../pagesC/pages/work_photos/work_photos?orderNo='+orderNo;
    }else if ( index == '04' ) {  //记录配件
      url = '../../../pagesC/pages/work_parts/work_parts?orderNo='+orderNo;
    }else if ( index == '05' ) {  //修改预定时间
      if(djzt2=="1005"){
        wx.showToast({
          title: '已完成，不能改',
          icon: "error",
          duration: 1000
        })  
      }
      else{
        _this.setData({
          ifName:true,  //显示
        }); 
      }
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  cancel: function (e) {  //返回
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    }); 
  },
  confirm: function (e) { //完善房间
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    });
    let sj = that.data.Starttime;
    that.update_yjsmsj(sj); //修改预计上门时间
  },
  cancelWG: function (e) {  //返回
    let that = this;
    that.setData({
      ifName2: false,    //隐藏弹出框
    }); 
  },
  confirmWG: function (e) {
    let that = this;
    that.setData({
      ifName2: false,    //隐藏弹出框
    });
    let wgsj = that.data.wgsj;
    let djState = "1005";  //完工
    var _data = {ac: 'orderState_update',"orderNo":orderNo,"userid":userid,"djState":djState,"wgsj":wgsj};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.rows=="1"){
          wx.showToast({
            title: '保存成功',
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
  //修改预计上门时间
  update_yjsmsj:function(sj){
    var _data = {ac: 'update_yjsmsj',"sj":sj,"orderNo":orderNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '修改成功',
          icon: "success",
          duration: 1000
        })          
      },
      fail(res) {
        
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
  onUnload: function () {  //生命周期函数--监听页面卸载
  },
  onShow: function () {  //生命周期函数--监听页面显示
  }
})