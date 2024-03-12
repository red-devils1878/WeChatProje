var ldmc = ""  //楼栋名称
var mph = ""  //门牌号
var dis = ""
var userid= "";  //登录人的工号
var houseNo = ""; //房源编号
var sfCode= "zj";  //省份编号
var cityCode= "hangzhou";  //城市编号
var gyNo_n = "" //员工号(新)
var gyNo = "" //员工号
var app = getApp();
var apiUrl = "";   //获取api地址
Page({

  data: {  //页面的初始数据
    navH:0,
    winWidth: 0,
    winHeight: 0,
    disableT:'',
    servicelist:[], //服务集市列表
    sqIndex: 0,
    sfIndex: 6,
    cityIndex: 0,
    qxIndex: 0,
    cxIndex: 0,
    multiIndex: [2, 1, 1],
    bindTap:"getBack", //返回上一页
    title:'新增合租',
    master:false,  //主档
    detail_fx:true, //房型
    rules:['133','149','153','173','177','180','181','189','190','191','193','199','130','131','132','145','155','156','166','167','171','175','176','185','186','196','134','135','136','137','138','139','144','147','148','150','151','152','157','158','159','172','178','182','183','184','187','188','195','197','198'],
    fjs: 2,
    mydata : "",
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    userid = app.globalData.userid;   //登陆人工号
    mph = "";
    ldmc = "";
   //获取当前设备的宽高
   wx.getSystemInfo( { 
    success: function( res ) {
      that.setData( {
         winWidth: res.windowWidth,
         winHeight: res.windowHeight,
         navH:res.statusBarHeight+45          
      });
    }
   });
   that.get_fwpzList(); //房屋配置列表
   that.get_sqList(); //获取社区
   that.get_sfList(); //省份
   that.get_cityList(sfCode); //城市
   that.get_qxList(cityCode); //区县
   that.get_cxList(); //朝向
   that.get_fangxing(); //获取房型
   that.get_gyName(userid); //获取员工名称
  },
  get_sqList:function () { //获取社区
    let _this = this;
    var _data = {ac: 'get_houseBelong_list'};
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
            "code":units[i].sid,
            "othername":units[i].sname
          })
        }
        setTimeout(()=>{
          _this.setData({
            sq:newlist
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
  get_sfList:function () { //省份
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'cn_province'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              sf:units
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
  get_cityList:function (sfCode) { //获取城市
    let _this = this;
    var _data = {ac: 'get_cityList',"sfCode":sfCode};
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
            "code":units[i].code,
            "othername":units[i].othername
          })
        }
        setTimeout(()=>{
            _this.setData({
              city:newlist
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
  get_qxList:function (cityCode) { //获取区县
    let _this = this;
    var _data = {ac: 'get_regionList',"cityCode":cityCode};
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
            "code":units[i].code,
            "othername":units[i].othername
          })
        }
        setTimeout(()=>{
            _this.setData({
              qx:newlist
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
  get_cxList:function () { //朝向
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_chaoxiang'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
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
              multiArray:units
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
  get_fwpzList:function () { //房屋配置列表
    let _this = this;
    var _data = {ac: 'get_fwpzList'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              servicelist:units
            })
          },100)
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
  bindSQChange: function(e) {  //社区事件
    this.setData({
      sqIndex: e.detail.value
    })
  },
  bindSFChange: function(e) {  //省份事件
    var that = this; 
    this.setData({
      sfIndex: e.detail.value,
      cityIndex: 0,
      qxIndex: 0     
    })
    sfCode = this.data.sf[e.detail.value].code;
    that.get_cityList(sfCode); //城市
    setTimeout(function () {
      let len = that.data.city.length;
      let city = "";  
      if(len >0){
        city = that.data.city[0].code;
      }
      that.get_qxList(city); //区县
    }, 500);
  },
  bindCityChange: function(e) {  //城市事件
    var that = this; 
    this.setData({
      cityIndex: e.detail.value,
      qxIndex: 0
    })
    cityCode = this.data.city[e.detail.value].code;
    that.get_qxList(cityCode); //区县
  },
  bindQXChange: function(e) {  //区县事件
    this.setData({
      qxIndex: e.detail.value
    })
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let zfjs = e.detail.value[0];
    this.setData({
      multiIndex: e.detail.value,
      fjs:zfjs
    })
  },
  bindCXChange: function(e) {  //朝向事件
    this.setData({
        cxIndex: e.detail.value
    })
  },
  valueChange: function(e) {   //楼栋名称值改变事件
    ldmc = e.detail.value;
    if(!!mph && !!ldmc){
      dis = "1"
    }else{
      dis = ""
    }
    this.setData({
       disableT:dis
    })
  },
  mphChange: function(e) {   //门牌号改变事件
    mph = e.detail.value;
    if(!!mph && !!ldmc){
      dis = "1"
    }else{
      dis = ""
    }
    this.setData({
       disableT:dis
    })
  },
  telChange: function(e) {   //电话改变事件
    let telephone = e.detail.value;
    if(telephone.length!=11){
      wx.showToast({
        title: "手机号长度应为11位",
        icon: 'none',
        duration: 1000
      })
      telephone = "";
      this.setData({
        tel_fd:"",
        fangdtel:""
      })
      return false;
    }
    let top3=telephone.substring(0,3)
     for(let t of this.data.rules){
     if(t==top3){
      this.setData({
        fangdtel:telephone
      })
      let dh = this.data.fangdtel;
      let sfzh = this.data.fangdsfz;
      if(!!dh && !!sfzh){
        this.judgeFD(dh,sfzh);
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
      tel_fd:"",
      fangdtel:""
    })
  },
  cardNoChange: function(e) {   //证件号改变事件
    let cardNo2 = e.detail.value;
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if(reg.test(cardNo2)==false){
      wx.showToast({
        title: "请输入正确的身份证",
        icon: 'none',
        duration: 1000
      })
      this.setData({
        cardNo:"",
        fangdsfz:""
      })
      return false;
    }
    else{
      this.setData({
        fangdsfz:cardNo2
      })
      let dh = this.data.fangdtel;
      let sfzh = this.data.fangdsfz;
      if(!!dh && !!sfzh){
        this.judgeFD(dh,sfzh);
      }
    }
  },
  getBack: function(e) {  //返回上一页
    wx.navigateBack({
      delta: 1,
    })
  },
  next: function(e) {  //下一步
    this.setData({
      master:true,  //主档
      detail_fx:false, //房型
      bindTap:"showMaster",
      title:'完善信息',
    })
  },
  showMaster: function(e) {  //显示主档
    this.setData({
      master:false,  //主档
      detail_fx:true, //房型
      bindTap:"getBack",
      title:'新增合租',
   })
  },
  syb: function(e) {  //上一步
    this.setData({
      master:false,  //主档
      detail_fx:true, //房型
      bindTap:"getBack",
      title:'新增合租',
   })
  },
  judgeFD:function (tel,CardNo) { //判断房东电话是否被占用
    let _this = this;
    if(!tel){
      tel = 'tel';
    }
    if(!CardNo){
      CardNo = 'CardNo';
    }
    var _data = {ac: 'judgeFD_tel',"tel":tel,"CardNo":CardNo};
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
              tel_fd:"",
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
  areaChange:function(e){
    var newmj;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      newmj = e.detail.value;
    } else {
      wx.showToast({
        title: '面积有误，请重新输入',
        icon: "none",
        duration: 1000
      })
      newmj = "";
    }
    this.setData({
      mj:newmj
    })
  },
  rentChange:function(e){
    var newjg;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      newjg = e.detail.value;
    } else {
      wx.showToast({
        title: '价格有误，请重新输入',
        icon: "none",
        duration: 1000
      })
      newjg = "";
    }
    this.setData({
      jg:newjg
    })
  },
  szlcChange:function(e){
    var newszlc;
    newszlc = e.detail.value;
    let zlc =  this.data.total_lc;
    if(zlc!=""){
      if(newszlc*1 > zlc*1){
        wx.showToast({
          title: '总楼层要大于所在楼层',
          icon: "none",
          duration: 1000
        })
        newszlc = "";
      }
    }
    this.setData({
      lc_dq:newszlc
    })
  },
  zlcChange:function(e){
    var newzlc;
    newzlc = e.detail.value;
    let czlc =  this.data.lc_dq;
    if(czlc*1 > newzlc*1){
      wx.showToast({
        title: '总楼层要大于所在楼层',
        icon: "none",
        duration: 1000
      })
      newzlc = "";
    }
    this.setData({
      total_lc:newzlc
    })
  },
  tapList: function(e) {   //根据标识跳转页面
    let job = "";
    wx.navigateTo({
      url: '../../pagesB/pages/emp_list/emp_list?job='+job
    })
  },
  //获取员工名称
  get_gyName: function(gyNo) { 
    let _this = this;
    var _data = {ac: 'get_bemp',"userid":gyNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var emp_name = units[0].emp_name;
        var emp_no = units[0].emp_no;
          _this.setData({
            emp_name:emp_name,
            yg: emp_no
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  formSubmit: function (e){  //保存数据
    let that = this;
    var fdxm = e.detail.value.xm_fd;
    var fddh = e.detail.value.tel_fd;
    var fdsfz = e.detail.value.cardNo_fd;
    var sq = e.detail.value.sq;
    var sf = e.detail.value.sf;
    var city = e.detail.value.city;
    var qx = e.detail.value.qx;
    var street = e.detail.value.street;
    var village = e.detail.value.village;
    var fymc = e.detail.value.fymc;
    var dyh = e.detail.value.dyh;
    var mph = e.detail.value.mph;
    var szlc = e.detail.value.szlc;
    var zlc = e.detail.value.zlc;
    var fangxing = e.detail.value.fangxing;
    var cx = e.detail.value.cx;
    var area = e.detail.value.area;
    var rent = e.detail.value.rent;
    var sb = e.detail.value.sb;
    var yg = e.detail.value.yg;
    /*
    if(!fdxm || !fddh || !fdsfz){ 
      wx.showToast({
        title: '房东信息必填',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    */
   if(!!fdxm && !fdsfz){ 
    wx.showToast({
      title: '房东身份证号必填',
      icon: "none",
      duration: 1000
    })
    return false;
  }
    if(!fymc || !mph){ 
      wx.showToast({
        title: '房源名称，门牌号必填',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else if(!szlc || !zlc){ 
      wx.showToast({
        title: '楼层必填',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else if(!rent || rent<=0){ 
      wx.showToast({
        title: '租金必须大于0',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else if(!area || area<=0){ 
      wx.showToast({
        title: '面积必须大于0',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    var mx_sb = "";
    var sb_length = sb.length;
    for(let i = 0; i < sb_length; i++){
      if(i==sb_length-1){
        mx_sb += sb[i];
      }
      else{
        mx_sb += sb[i] + ",";
      }
    }
    var _data = {ac: 'hezu_save',"userid":userid,"fdxm":fdxm,"fddh":fddh,"fdsfz":fdsfz,"sq":sq,"sf":sf,"city":city,"qx":qx,"street":street,"village":village,"fymc":fymc,"dyh":dyh,"mph":mph,"szlc":szlc,"zlc":zlc,"fangxing":fangxing,"cx":cx,"area":area,"rent":rent,"mx_sb":mx_sb,"yg":yg};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=='1'){
          houseNo = res.data.houseNo;   
          setTimeout(()=>{
            that.setData({
              ifName: true,    //显示弹出框
            });
          },100)
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  cancel: function (e) {  //返回
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    }); 
    setTimeout(function () {
      wx.navigateBack({
        delta: 1,
      })   
    }, 100);
  },
  confirm: function (e) { //完善房间
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    }); 
    setTimeout(function() {
      wx.redirectTo({
        url: '../../pagesB/pages/publishRoom_list/publishRoom_list?houseNo='+houseNo
      })
    }, 100)
  },
  onShow: function () {  //生命周期函数--监听页面显示
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    let gyNo_n = currPage.data.mydata.gy;
    if(!!gyNo_n){
      gyNo = gyNo_n;
    }
    if(!!gyNo){
      this.get_gyName(gyNo);  //获取员工名称
      this.setData({
        yg: gyNo
      })
    }
  }
})