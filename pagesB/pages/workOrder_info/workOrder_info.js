var orderNo= "";  //工单编号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    recordList:[],
    imgs:[],
    showView:false,
    img_qty:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    apiUrl = app.globalData.apiUrl;
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
    that.workOrder_info(orderNo);  //获取工单详情
    that.workOrder_record(orderNo);  //获取更近记录
    that.get_workPhoto(orderNo);  //获取照片
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
              orderNo:units[0].orderNo,
              houseName:units[0].houseName,
              gdlx:units[0].gdlx_name,
              sqsj:units[0].cre_da2,
              smsj:units[0].smsj+'  '+units[0].sjd_name,
              lxr:units[0].xclxr,
              lxdh:units[0].xc_tel,
              wtms:units[0].wtms,
              dj_state:units[0].dj_state,
              orderType:units[0].order_type,
              xmlx:(units[0].order_type=='1002') ? '报修项目':'保洁项目',
              xmmc:(units[0].order_type=='1002') ? units[0].sblx_name:units[0].bjxm_name,
            })
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
          },500)
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
  onShow: function () {  //生命周期函数--监听页面显示
  }
})