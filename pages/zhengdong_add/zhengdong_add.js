// pages/zhengdong_add/zhengdong_add.js
var util = require('../../utils/util.js');
var ldmc = ""  //楼栋名称
var mph = ""  //门牌号
var dis = ""
var userid= "";  //登录人的工号
var houseNo = ""; //房源编号
var sfCode= "zj";  //省份编号
var cityCode= "hangzhou";  //城市编号
var zcs = 1 //总层数
var fjs = 1 //每层房间数
var qslc = 1 //起始楼层
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
    multiIndex: [1, 1, 1],
    bindTap:"getBack", //返回上一页
    title:'新增整栋',
    master:false,  //主档
    detail_floor:true, //楼层
    rules:['133','149','153','173','177','180','181','189','190','191','193','199','130','131','132','145','155','156','166','167','171','175','176','185','186','196','134','135','136','137','138','139','144','147','148','150','151','152','157','158','159','172','178','182','183','184','187','188','195','197','198'],
    index_zc: 0,  //初始化下拉框下标
    index_fj: 0,  //初始化下拉框下标
    index_qs: 0,  //初始化下拉框下标
    fymxList:  [{}],  //房源明细列表
    lcVal:[], //所有input的内容(所在楼层)
    fhVal:[], //所有input的内容(房间数)
    disableT2:'',
    checked:'',
    ck:'',
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
   that.get_EbasicOther();  //获取数据字典
   that.setRoomList(1,1,1); //初始化房间列表
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
        },10)
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
          },10)
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
        },10)
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
        },10)
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
          },10)
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
          },100)
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
  get_EbasicOther:function () { //获取数据字典
    let _this = this;
    var _data = {ac: 'get_picker',"otherid":"IB_floor"};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            newlist.push(
              units[i].code
            )
          }
          setTimeout(()=>{
            _this.setData({
              sjzd_list:newlist
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
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindCXChange: function(e) {  //朝向事件
    this.setData({
        cxIndex: e.detail.value
    })
  },
  valueChange: function(e) {   //楼栋名称值改变事件
    ldmc = e.detail.value;
    if(!!ldmc){
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
  pickerChangeZC: function(e) {
    //zcs = (e.detail.value)*1+1;
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index_zc: e.detail.value
    })
    zcs = this.data.sjzd_list[e.detail.value];
    this.setRoomList(zcs,fjs,qslc); //动态设置生成房间
  },
  pickerChangeQS: function(e) {
    this.setData({
      index_qs: e.detail.value
    })
    qslc = this.data.sjzd_list[e.detail.value];
    this.setRoomList(zcs,fjs,qslc); //动态设置生成房间
  },
  pickerChangeFJ: function(e) {
    this.setData({
      index_fj: e.detail.value
    })
    fjs = this.data.sjzd_list[e.detail.value];
    this.updRoomList(fjs); //动态设置生成房间
  },
  setRoomList: function(zcs,fjs,qslc) {
    var that = this;
    const {fymxList} = this.data   //简写变量书写
    let len = this.data.fymxList.length;
    /*先循环清空列表*/
    for(var i = 0;i < len;i++){
      var oldFHVal=this.data.fhVal;  //所有的input值
      var oldLCVal=this.data.lcVal;  //所有的input值
      oldFHVal.splice(len-i-1,1);    //view删除了对应的input值也要删掉
      oldLCVal.splice(len-i-1,1);    //view删除了对应的input值也要删掉
      fymxList.splice(len-i-1, 1)
      //更新列表
      that.setData({
        fymxList,
        fhVal: oldFHVal,
        lcVal: oldLCVal,
      })
    }
    /*循环插入列表*/
    for(var j = 0;j < zcs;j++){
      fymxList.splice(j, 0, {})
      /*自动生成房号*/
      var oldVal_lc=this.data.lcVal;
      oldVal_lc[j]=(j*1+qslc*1);//修改对应索引值的内容
      var oldVal_fh=this.data.fhVal;
      oldVal_fh[j]=(fjs);//修改对应索引值的内容
      this.setData({
        fhVal:oldVal_fh,
        lcVal:oldVal_lc,
      })
      //更新列表
      that.setData({
        fymxList,
        fhVal:oldVal_fh,
        lcVal:oldVal_lc,
      })
    }
  },
  updRoomList: function(fjs) {
    var that = this;
    let len = this.data.fymxList.length;
    /*先循环清空列表*/
    for(var i = 0;i < len;i++){
      var oldFHVal=this.data.fhVal;  //所有的input值
      oldFHVal.splice(len-i-1,1);    //view删除了对应的input值也要删掉
      //更新列表
      that.setData({
        fhVal: oldFHVal,
      })
    }
    /*循环插入列表*/
    for(var j = 0;j < zcs;j++){
      /*自动生成房号*/
      var oldVal_fh=this.data.fhVal;
      oldVal_fh[j]=(fjs);//修改对应索引值的内容
      this.setData({
        fhVal:oldVal_fh
      })
      //更新列表
      that.setData({
        fhVal:oldVal_fh
      })
    }
  },
  //获取input的值
  LCvalueChange:function(e){
    var nowIdx_lc=e.currentTarget.dataset.idx;//获取当前索引
    var val_lc=e.detail.value;//获取输入的值
    var oldVal_lc=this.data.lcVal;
    oldVal_lc[nowIdx_lc]=val_lc;//修改对应索引值的内容
    this.setData({
      lcVal:oldVal_lc
    })
  },
  //获取input的值
  FHvalueChange:function(e){
    var nowIdx_fh=e.currentTarget.dataset.idx;//获取当前索引
    var val_fh=e.detail.value;//获取输入的值
    var oldVal_fh=this.data.fhVal;
    oldVal_fh[nowIdx_fh]=val_fh;//修改对应索引值的内容
    this.setData({
      fhVal:oldVal_fh
    })
  },
  getBack: function(e) {  //返回上一页
    wx.navigateBack({
      delta: 1,
    })
  },
  next: function(e) {  //第二页
    this.setData({
      master:true,  //主档
      detail_floor:false, //楼层
      bindTap:"showMaster",
      title:'楼层信息',
    })
  },
  three: function(e) {  //第三页
    this.setData({
      master:true,  //主档
      detail_floor:true, //楼层
      bindTap:"next",
      title:'完善信息',
    })
  },
  showMaster: function(e) {  //第一页
    this.setData({
      master:false,  //主档
      detail_floor:true, //楼层
      bindTap:"getBack",
      title:'新增整栋',
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
  bindCheckBox: function(e) {  //第一页
    let val = e.detail.value;
    if(val.length>0){
      this.setData({
        checked:true,
        ck:'xz',
     })
    }else{
      this.setData({
        checked:false,
        ck:'',
     })
    }
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
    var mcfjs = e.detail.value.mcfjs;
    var fhqz = e.detail.value.fhqz;
    var ck = that.data.ck;
    var yg = that.data.yg;
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
    if(!fymc){ 
      wx.showToast({
        title: '房源名称必填',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else if(!mph){
      mph = "";
    }
    else if(!szlc){
      szlc = "1";
    }
    else if(!zlc){
      zlc = "1";
    }
    else if(!mcfjs){
      mcfjs = "1";
    }
    var eValue = e.detail.value;
    var mapValue = util.objToStrMap(eValue); //将value对象转为map
    var fhlist = that.data.fymxList;
    var mx_fh = "";
    var mx_lc = "";
    for(var j = 1;j <= fhlist.length;j++){
      var lc_j = "lc" + j;
      var fh_j = "fh" + j;
      var lc = mapValue.get(lc_j);
      var fh = mapValue.get(fh_j);
      if(!lc){ lc=1 }
      if(!fh){ fh=1 }
      mx_lc += lc + "|";
      mx_fh += fh + "|";
    }
    that.setData({
      disableT2:"readonly"
    })
    wx.showToast({
      title: '房源生成中',
      icon: "loading",
      duration: 40000
    })
    var _data = {ac: 'zhengdong_save',"userid":userid,"fdxm":fdxm,"fddh":fddh,"fdsfz":fdsfz,"sq":sq,"sf":sf,"city":city,"qx":qx,"street":street,"village":village,"fymc":fymc,"dyh":dyh,"mph":mph,"szlc":szlc,"zlc":zlc,"mcfjs":mcfjs,"lcList":mx_lc,"fhList":mx_fh,"fhqz":fhqz,"ck":ck,"yg":yg};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=='1'){
            houseNo = res.data.houseNo;
            wx.hideToast();
            //setTimeout(()=>{
            that.setData({
              ifName: true,    //显示弹出框
            });
          //},100)
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
        url: '../../pagesB/pages/batchRoom_list/batchRoom_list?houseNo='+houseNo
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