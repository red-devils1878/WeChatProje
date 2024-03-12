var app = getApp();
var apiUrl = "";   //获取api地址
var dsn= "";  //设备号
var userid= "";  //登陆人工号
var mid = "";//明细id
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
    data: {  //页面的初始数据
        Starttime: '',
        Endtime: '',
        multiArray: [years, months, days, hours, minutes],
        multiIndex: [0,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
        endIndex: [1,date.getMonth(),date.getDate()-1,date.getHours(),date.getMinutes()],
        choose_year: '',
        imgs:[],
        showView:false,
        imgUrlArr: [],//需要传给后台的图片数组
        countNum:1, //上传数量
    },
    onLoad: function (options) {  //生命周期函数--监听页面加载
        dsn = options.dsn; //设备号
        apiUrl = app.globalData.apiUrl; 
        userid = app.globalData.userid;   //登陆人工号
        //设置默认的年份
        this.setData({
        choose_year: this.data.multiArray[0][0]
        });
    },
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
    let length = that.data.imgs.length;
    if(length <= 0){
      wx.showToast({
        title: '请先上传图片!',
        icon: "none",
        duration: 1000
      })
      return;
    } 
    if(!Stime || !Etime){
      wx.showToast({
        title: '日期不能为空!',
        icon: "none",
      })
      return;
    }
    else{
      Stime = Stime+':00';
      Etime = Etime+':00';
    }
    var Stime2 = Stime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
    var Etime2 = Etime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
    var Stime2 = Stime2.substr(2,12); //截取字符串如20211231173000截取成211231173000
    var Etime2 = Etime2.substr(2,12);
    var lx = "04";    //人脸
    var yhlx = "02";    //用户类型
    var yhbh = "010";   //用户编号
    var channel = "21"; //下发来源
    if(!Stime2){ Stime2 = "000000000000"}
    if(!Etime2){ Etime2 = "991230180000"}
    var _data = {ac: 'face_add',"yhbh":yhbh,"lx":lx,"yhlx":yhlx,"dsn":dsn,"Pwd":'',"Stime":Stime2,"Etime":Etime2,"channel":channel};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步    
      success(res) {
        if(res.data.status=="1"){
          wx.showToast({
            title: '添加人脸成功',
            icon: "success",
            duration: 1000
          })
          mid = res.data.id;
          let length = that.data.imgs.length;
          if(length>0){
            that.uploadImg(mid);//上传照片    
          } 
        }
        setTimeout(()=>{
          wx.navigateBack({
            delta: 1,
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
  // 上传图片
  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    if (imgs.length >=1) {
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
        title: '最多只能选择1张图片',
      })
      return false;
    }
    wx.chooseImage({
      count: that.data.countNum, // 默认1
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var imgs = that.data.imgs;
        var imgUrlArr = that.data.imgUrlArr;
        for (var i = 0; i < tempFilePaths.length; i++) {
          if (imgs.length >= 1) {
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
          countNum: 1 - imgs.length
        });
        if(imgs.length>=1){
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
      countNum: 1 - imgsLen
    });
    if(imgsLen>=1){
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
  uploadImg :function(mid){
    var that = this;
    let i = 0;
    let length = this.data.imgs.length;
    that.upLoadPhoto(mid,i,length);
  },
  upLoadPhoto :function(id,i,length){  //上传图片至服务器
    var that = this;
    var _data = {ac: "Upload","tbName":"SDI_Rh_yhb","zd":"id","keyV":id};
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
          that.upLoadPhoto(mid,i,length);
        }
      } 
    })
  },
  onShow: function () { //生命周期函数--监听页面显示
  }
})