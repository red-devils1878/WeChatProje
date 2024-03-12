var tzNo= "";  //退租单号
var tzyyQJ = []; //退租原因数组
var Sd = "";//开始时间
var Ed = "";//结束时间
var Td = "";//退租时间
var dsn = "";//门锁设备号
var userid= "";  //登陆人工号
var hid= "";  //房间id
var dbsbh = "";//电表设备号
var sbsbh = "";//水表设备号
var dbly= "";  //电表来源
var sbly= "";  //水表来源
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var aiotAPI = app.globalData.aiotAPI;   //水电表指令的api
Page({
  data: {
    winWidth: 0,
    winHeight: 0,
    tzyyIndex: 0,
    img_qty:0,
    ytsf:0,  //应退水费
    ytdf:0,   //应退电费
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    tzNo = options.tzNo;
    //tzNo = "TZSP2204110007";
    //获取当前设备的宽高
    wx.getSystemInfo({
      success: function( res ) {
        that.setData( {
            winWidth: res.windowWidth,
            winHeight: res.windowHeight
        });
      }
    });
    apiUrl = app.globalData.apiUrl; 
    userid = app.globalData.userid;   //登陆人工号
    this.get_tzyy();  //获取退租原因
    this.tzsp_info(tzNo); //获取退租详情
    this.get_tzspPhoto(tzNo);  //获取照片
  },
  tzsp_info:function (tzNo) { //获取退租详情
    let _this = this;
    var _data = {ac: 'tzsp_info',"tzNo":tzNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        Sd = units[0].inTime2;  //开始时间
        Ed = units[0].outTime2;  //结束时间
        Td = units[0].tzTime2;   //退租时间
        dsn = units[0].dsn;   //设备号
        hid = units[0].roomId;   //房间id
        dbsbh = units[0].dbNo;   //电表设备号
        sbsbh = units[0].sbNo;   //水表设备号
        _this.setData({
          tzNo:units[0].tzNo,
          Tdate:units[0].tzTime2,
          sqr:units[0].applyName,
          ytje:units[0].amount_qtfk,
          kcje:units[0].amount_qtsk,
          jgje:units[0].amount,
          jzje:units[0].amount_lsjz,
          zje:units[0].amount_total,
        })
        setTimeout(()=>{
          _this.setData({
            tzyyIndex:_this.get_indexYW(tzyyQJ,units[0].tzType),//获取一维数组下标
          })
        },100)
        _this.get_sbInfo(sbsbh,'sb');  //获取水表详情
        _this.get_sbInfo(dbsbh,'db');  //获取电表详情
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_amount:function (tzNo) { //获取各项金额
    let _this = this;
    var _data = {ac: 'tzsp_info',"tzNo":tzNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        _this.setData({
          ytje:units[0].amount_qtfk,
          kcje:units[0].amount_qtsk,
          jgje:units[0].amount,
          jzje:units[0].amount_lsjz,
          zje:units[0].amount_total,
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_tzyy:function () { //获取退租原因
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_tzyy'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          tzyyQJ = units;
          setTimeout(()=>{
            _this.setData({
              tzyy:units
            })
          },10)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  tapEvent: function(e) {
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let url = "";
    if (index == '1') {   //应退金额
      url = '../../../pagesB/pages/checkOut_yt/checkOut_yt?tzNo='+tzNo;
    } else if ( index == '2' ) {  //扣除金额
      url = '../../../pagesB/pages/checkOut_ys/checkOut_ys?tzNo='+tzNo;
    }else if( index == '3' ){  //物品交割
      url = '../../../pagesB/pages/checkOut_wpjg/checkOut_wpjg?tzNo='+tzNo;
    }else if( index == '4' ){  //退租备注
      url = '../../../pagesB/pages/checkOut_remark/checkOut_remark?tzNo='+tzNo;
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  bindTZChange: function(e) {
    this.setData({
      tzyyIndex: e.detail.value
    })
  },
  tDateChange: function(e) {  //退租时间
    let Td2 = e.detail.value;
    let Tdate=new Date(Td2);
    let Sdate=new Date(Sd);
    let Edate=new Date(Ed);
    if(Sdate > Tdate){
      wx.showToast({
        title: "退租日期不能早于起租日期",
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    else if(Tdate > Edate){
      wx.showToast({
        title: "退租日期不能晚于结束日期",
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    else{
      this.setData({
        Tdate: e.detail.value
      })
      let Td3 = e.detail.value;
       this.tzTime_update(tzNo,Td3); //更新退租时间
    }
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
    if (imgs.length >= 3) {
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
          var _data = {"ac": "Upload","tbName":"IB_tzsp","zd":"tzNo","keyV":tzNo};
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
                that.get_tzspPhoto(tzNo);  //获取照片
              },10)
            }        
          })
      }
    });
  },
  get_tzspPhoto:function (tzNo) { //获取退租照片
    let _this = this;
    var _data = {ac: 'get_tzspPhoto',"tzNo":tzNo};
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
        if(qty >= 3) {
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
            that.get_tzspPhoto(tzNo);  //获取照片
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
  tzTime_update: function (tzNo,Td3){  //更新退租时间
    var that = this;
    var _data = {ac: 'tzTime_update',"tzNo":tzNo,"tzTime":Td3};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          setTimeout(()=>{
            that.tzsp_info(tzNo);  //获取退租详情
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
  formSubmit: function (e){  //保存数据
    var that = this;
    var tzyy = e.detail.value.tzyy;
    var sqr = e.detail.value.sqr;
    if(!!dbsbh && dbly=="fd"){
      that.checkOut_db(dbsbh); //电表退租
    }
    if(!!sbsbh && sbly=="fd"){
      that.checkOut_sb(sbsbh); //水表退租
    }
    that.checkOut_update(tzNo,tzyy,sqr); 
  },
  checkOut_update:function (tzNo,tzyy,sqr) { //退租
    var _data = {ac: 'tzsp_update',"tzNo":tzNo,"tzyy":tzyy,"sqr":sqr,"userid":userid};
    wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          wx.showToast({
            title: '退租成功',
            icon: "success",
            duration: 1000//持续的时间
          });
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
  checkOut_db: function(dbsbh) {  //退租电表
    var _data = '{ac: "confirmrecederoom","deviceId":"'+dbsbh+'"}'
    wx.request({
     url: aiotAPI+'em/confirmrecederoom',  //水电表指令的api
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(_res.Code == 0 ){
        console.log("电表退租成功");
      }
      else{
        console.log("电表退租失败");
      }
     },
     fail(res) {
     },
     complete(){
     }
   });
  },
  checkOut_sb: function(sbsbh) {  //退租水表
    var _data = '{ac: "confirmrecederoom","deviceId":"'+sbsbh+'"}'
    wx.request({
     url: aiotAPI+'wm/confirmrecederoom',  //水电表指令的api
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(_res.Code == 0 ){
        console.log("水表退租成功");
      }
      else{
        console.log("水表退租失败");
      }
     },
     fail(res) {
     },
     complete(){
     }
   });
  },
  get_sbInfo:function (dsn,LX) { //获取水电表详情
    let _this = this;
    var _data = {ac: 'get_deviceInfo',"dsn":dsn,"LX":LX};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步  
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          if(LX=="sb"){
            sbly = units[0].ptlx;
            if(sbly=="fd"){
              _this.get_sysf(dsn); //获取剩余水费
            }
          }
          else if(LX=="db"){
            dbly = units[0].ptlx;
            if(dbly=="fd"){
              _this.get_sydf(dsn); ////获取剩余电费
            }
          }
        }
      },
      fail(res) {
      },
      complete(){
      }
    });
  },
  get_sysf:function(devid){  //获取剩余水费
    var that = this;
    var _data = '{ac: "read","deviceId":"'+devid+'"}'
    wx.request({
     url: aiotAPI+'wm/read',  //水电表指令的api
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(_res.Code == 0 ){
        let sysl = _res.Data[0].Expand.surplus; //剩余水量
        that.get_sfje(devid,'sb',sysl); //计算剩余金额
      }
      else{
        console.log("水表抄表失败");
      }
     },
     fail(res) {
     },
     complete(){
     }
   });
  },
  get_sydf:function(devid){  //获取剩余电费
    var that = this;
    var _data = '{ac: "read","deviceId":"'+devid+'"}'
    wx.request({
     url: aiotAPI+'em/read',  //水电表指令的api
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(_res.Code == 0 ){
        let sysl = _res.Data[0].Expand.surplus; //剩余电量
        that.get_dfje(devid,'db',sysl); //计算剩余金额
      }
      else{
        console.log("电表抄表失败");
      }
     },
     fail(res) {
     },
     complete(){
     }
   });
  },
  get_sfje:function (sbh,sblx,sysl) { //计算剩余金额
    let _this = this;
    var _data = {ac: 'get_energyPrice',"sbh":sbh,"sblx":sblx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let price = units[0].price;
          let sysf = (price*sysl).toFixed(2);
          _this.setData({
            ytsf:sysf,
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
  get_dfje:function (sbh,sblx,sysl) { //计算剩余金额
    let _this = this;
    var _data = {ac: 'get_energyPrice',"sbh":sbh,"sblx":sblx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      async:false,  //同步
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let price = units[0].price;
          let sydf = (price*sysl).toFixed(2);
          _this.setData({
            ytdf:sydf,
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
  onShow: function () { //生命周期函数--监听页面显示
    this.get_amount(tzNo); //获取各项金额
  }
})