var hid= "";  //房间id
var fzNo_n = "" //分组流水号(新)
var fzNo = "" //分组流水号
var fxNo_n = "" //房型流水号(新)
var fxNo = "" //房型流水号
var userid= "";  //登录账号
var cxQJ = [];  //朝向数组
var lxQJ = [];  //类型数组
var czztQJ = [];  //类型数组
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    fz:'',
    fx:'',
    mydata:'',
    servicelist:[], //服务集市列表
    multiIndex: [1, 1, 1],
    unitIndex: 0,
    ftIndex: 0,
    cxIndex: 0,
    lxIndex: 0,
    czztIndex: 0
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    userid = app.globalData.userid;   //登陆人工号
    hid = options.hid;
    wx.getSystemInfo( {
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    this.get_fangxing();  //获取房型
    this.get_rentUnit();  //获取租金单位
    this.get_fjzt();  //获取房态
    this.get_cx();  //获取朝向
    this.get_lx();  //获取类型
    this.get_czzt();  //获取类型
    this.house_info(hid); //获取房间详情
  },
  house_info:function (hid) { //修改房间信息
    let _this = this;
    var _data = {ac: 'house_info',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          var CountS = units[0].CountS;
          var CountT = units[0].CountT;
          var CountW = units[0].CountW;
          var unit_index = units[0].unit_index;
          var fjzt_index = units[0].fjzt_index;
          if(CountS==""){ 
            CountS = 1; 
          }else {
            CountS = CountS*1;
          }
          if(CountT==""){ 
            CountT = 1; 
          }else {
            CountT = CountT*1;
          }
          if(CountW==""){ CountW = 1; }
          else {
            CountW = CountW*1;
          }
          if(unit_index==""){ unit_index = 0; }
          if(fjzt_index==""){ fjzt_index = 0; }
            _this.setData({
              hid:units[0].hid,
              roomNo:units[0].roomNo,
              fz:units[0].houseBelong,
              sname:units[0].ssmd,
              multiIndex:[CountS,CountT,CountW],
              rent:units[0].rent,
              unitIndex:unit_index,
              area:units[0].roomArea,
              address:units[0].address,
              fx:units[0].huxing,
              fname:units[0].fangxing,
              ftIndex:fjzt_index,
              fjzp:units[0].fjzp,
              cxIndex:_this.get_indexYW(cxQJ,units[0].orientation),
              lxIndex:_this.get_indexYW(lxQJ,units[0].fjlx),
              czztIndex:_this.get_indexYW(czztQJ,units[0].cz_state),
              contractNo:units[0].contractNo,
            })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_fangxing:function () { //获取房型
    let _this = this;
    var _data = {ac: 'get_fangxing'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              multiArray:_this.data.servicelist.concat(units)
            })
          },100)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_rentUnit:function () { //获取租金单位
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_rentUnit'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              unit:_this.data.servicelist.concat(units)
            })
          },100)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_fjzt:function () { //获取房态
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_fjzt'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              ft:units
            })
          },100)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_cx:function () { //获取朝向
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_chaoxiang'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          cxQJ = units;
          setTimeout(()=>{
            _this.setData({
              cx:units
            })
          },100)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_lx:function () { //获取类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_fjType'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          lxQJ = units;
          setTimeout(()=>{
            _this.setData({
              lx:units
            })
          },100)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_czzt:function () { //获取出租状态
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_czzt'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        czztQJ = units;
        setTimeout(()=>{
          _this.setData({
            czzt:units
          })
        },100)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  bindPickerChange: function(e) {
    this.setData({
      unitIndex: e.detail.value
    })
    let rent_unit = this.data.unit[e.detail.value].code;
  },
  bindFTChange: function(e) {
    this.setData({
      ftIndex: e.detail.value
    })
  },
  bindCXChange: function(e) {
    this.setData({
      cxIndex: e.detail.value
    })
  },
  bindLXChange: function(e) {
    this.setData({
      lxIndex: e.detail.value
    })
  },
  bindCZZTChange: function(e) {
    this.setData({
      czztIndex: e.detail.value
    })
  },
  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  tapFZ: function(e) {   //跳转页面
    let _this = this;
    let url = "";
    url = '../../../pagesB/pages/fenzu_list/fenzu_list';
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  tapFX: function(e) {   //跳转页面
    let _this = this;
    let url = "";
    url = '../../../pagesB/pages/fxDlg_list/fxDlg_list';
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  //获取分组名称
  get_fzName: function(fzNo) { 
    let _this = this;
    var _data = {ac: 'get_fzName',"fzNo":fzNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var sname = units[0].sname;
          _this.setData({
            sname:sname
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
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
  //获取房型名称
  get_fxName: function(fxNo) { 
    let _this = this;
    var _data = {ac: 'get_fxName',"fxNo":fxNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var fname = units[0].fname;
          _this.setData({
            fname:fname
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  tapEvent: function(e) {
    let index = e.currentTarget.dataset.index;
    let url = "";
    if( index == '1' ){  //房间照片
      url = '../../../pagesB/pages/roomPhotos/roomPhotos?hid='+hid;
    }else if( index == '2' ){  //房屋配置
      url = '../../../pagesB/pages/fwpz/fwpz?hid='+hid;
    }else if( index == '3' ){  //房间描述
      url = '../../../pagesB/pages/roomDescription/roomDescription?hid='+hid;
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  formSubmit: function (e){  //保存数据
    var roomNo = e.detail.value.roomNo;
    var fd = e.detail.value.fd;
    var fangxing = e.detail.value.fangxing;
    var rent = e.detail.value.rent;
    var unit = e.detail.value.rent_unit;
    var fjzt = e.detail.value.fjzt;
    var area = e.detail.value.area;
    var address = e.detail.value.address;
    var cx = e.detail.value.cx;
    var lx = e.detail.value.lx;
    var cz_state = e.detail.value.czzt;
    var hth = this.data.contractNo;
    if(!!hth && cz_state!="1001"){
      wx.showToast({
        title: '已出租的不能改出租状态',
        icon: "none",
        duration: 2000
      })
      return false;
    }
    var _data = {ac: 'room_update',"userid":userid,"hid":hid,"roomNo":roomNo,"fd":fd,"fangxing":fangxing,"rent":rent,"unit":unit,"area":area,"address":address,"fjzt":fjzt,"cx":cx,"lx":lx,"cz_state":cz_state};
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
        }),
        setTimeout(function () {
            wx.navigateBack({
                delta: 1,
            })   
        }, 1000);
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  get_fjzp:function (hid) { //获取房间照片数
    let _this = this;
    var _data = {ac: 'house_info',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        _this.setData({
          fjzp:units[0].fjzp
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  updateDZ: function (e) {  //修改地址
    this.setData( {
      ifName: true,    //显示弹出框
      xdz: this.data.address,
    }); 
  },
  cancel: function (e) {  //取消
    this.setData({
      ifName: false,  //隐藏弹出框
    }); 
  },
  bindFormSubmit: function (e){
    var newAddress = e.detail.value.stuRecord;
    let _this = this;
    _this.setData({
      ifName: false,
      address: newAddress,
    });
  },
  onShow: function () { //生命周期函数--监听页面显示
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    let fzNo_n = currPage.data.mydata.fz;
    let fxNo_n = currPage.data.mydata.fx;
    if(!!fzNo_n){
      fzNo = fzNo_n;
    }
    if(!!fxNo_n){
      fxNo = fxNo_n;  //带回来的值不为空，把值赋给字段
    }
    if(!!fzNo){
      this.get_fzName(fzNo);  //获取分组名称
      this.setData({
        fz: fzNo
      })
    }
    if(!!fxNo){
      this.get_fxName(fxNo);  //获取房型名称
      this.setData({
        fx: fxNo
      })
    }
    this.get_fjzp(hid);  //获取房间照片数
  }
})