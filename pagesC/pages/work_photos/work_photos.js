var orderNo = "";  //工单号
var PID = "";  //附件id
var app = getApp();
var apiUrl = app.globalData.apiUrl_LS;   //获取api地址
Page({
  data: {   //页面的初始数据
    imgs:[],
    showView:false,
    img_qty:0
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    orderNo = options.orderNo;
    this.workOrder_info(orderNo); //获取工单详情
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
        if(units.length > 0){
            let fileid = units[0].fileid;
            _this.get_Photo(fileid);  //获取照片
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  get_Photo:function (PID) { //获取照片
    let _this = this;
    var _data = {ac: 'get_Photo',"PID":PID};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var qty = 0;
        if(units.length > 0){
           qty = units.length;
        }
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
          //console.log("图片路径-->"+tempFilePaths);
          var _data = {"ac": "Upload","tbName":"IB_workOrder","zd":"orderNo","keyV":orderNo};
          //console.log("_data-->"+_data);
          wx.uploadFile({
            url: apiUrl, 
            filePath: tempFilePaths[0],
            header: { "Content-Type": "multipart/form-data" },
            name: 'file',
            formData: _data,
            success: function (da) {
              console.log("上传成功：-->"+da);
              let _res = JSON.parse(da.data);                  
              let rows = _res.rows; 
              PID = rows[0].PID;             
              wx.hideLoading();
              wx.showToast({
                title: "图片上传成功",
                icon: 'success',
                duration: 1000
              })
              setTimeout(()=>{
                that.get_Photo(PID);
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
            that.get_Photo(PID);
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