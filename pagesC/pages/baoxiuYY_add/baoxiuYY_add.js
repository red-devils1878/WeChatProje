var orderNo= "";  //工单编号
var LoginID= ""; //登录账号
var userid= ""; //登录人工号
var app = getApp();
var apiUrl = app.globalData.apiUrl_LS;  //获取api地址
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
    countNum :3 //上传数量
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
    LoginID = app.globalData.LoginID;   //登陆账号
    that.get_userid(LoginID);  //获取登录人工号
    that.get_sblx();  //获取设备类型
    that.get_sjd();  //获取上门时间段
    that.get_jjcd();  //获取紧急程度
  },
  get_userid:function (LoginID) { //获取登录人工号
    let _this = this;
    var _data = {ac: 'get_userid',"LoginID":LoginID};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
           userid = units[0].emp_no;
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
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
  // 上传图片
  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    if (imgs.length >= 3) {
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
        title: '最多只能选择3张图片',
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
          if (imgs.length >= 3) {
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
          countNum: 3 - imgs.length
        });
        if(imgs.length>=3){
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
      countNum: 3 - imgsLen
    });
    if(imgsLen>=3){
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
    var jbsj = "";
    if(!yjsmsj){ 
      wx.showToast({
        title: '期望上门时间不能为空',
        icon: "none",
        duration: 1000
      })
      return false;
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
    var djly = "运营";
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