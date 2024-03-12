// pages/checkIn_add/checkIn_add.js
var util = require('../../../utils/util.js');
var hid= "";  //房间id
var dis = ""
var contractNo = "" //合同号
var fullName = ""  //姓名
var telephone = ""  //联系电话
var dsn= "";  //门锁设备号
var reserveNo = "" //预定单号
var ts = "";
var maxIndex=0;
var FYmaxIndex=0;
var userid= "";  //登陆人工号
var Sd = "";//开始时间
var Ed = "";//结束时间
var fkfsY = "2";//付款方式押
var depositT = 0;//租金
var yd_n = "" //预定编号(新)
var cardQJ = [];  //证件类型数组
var cardQJT = [];  //证件类型数组(同住人)
var cycleQJ = []; //出租时长数组
var sexQJ = []; //性别数组
var gjQJ = [];  //国籍数组
var zyQJ = [];  //职业数组
var lxrgxQJ = []; //关系数组
var zfsjQJ = []; 
var fkfsQJ = []; 
var zjdwQJ = []; 
var zjlxindex = 0;
var cardNo2 = ""; //证件号
var signing = "1002";  //签约方式,1002纸质合同
var dbsbh= "";  //电表设备号
var sbsbh= "";  //水表设备号
var dbly= "";  //电表来源
var sbly= "";  //水表来源
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var aiotAPI = app.globalData.aiotAPI;   //水电表指令的api
var apiDB = app.globalData.apiDB;   //电表指令api
Page({

  data: {  //页面的初始数据
    servicelist:[], //服务集市列表
    disableT:'',
    unitIndex: 0,
    cycleIndex: 0,
    zklyIndex: 0,
    szrqIndex: 0,
    sexIndex: 0,
    cardIndex: 0,
    cardTIndex: 0,
    htNo:'',
    winWidth: 0,
    winHeight: 0,
    remark:'',
    index:0,
    maxIndex:0,
    master:false,  //主档
    detail_tzr:true, //同住人
    detail_fymx:true, //费用明细
    inputList:  [{}],  //同住人列表
    fylxIndex: 0,
    FYmaxIndex:0,
    fymxList:  [{}],  //费用明细列表
    inputVal:[], //所有input的内容(名称)
    telVal:[],   //所有input的内容(电话)
    cardNoVal:[],//所有input的内容(证件号)
    ctVal:[], //所有input的内容(证件类型)
    sexVal:[], //所有input的内容(性别)
    gxVal:[],  //(同住人关系)
    qxVal:[],  //(开门权限)
    fyVal:[], //所有input的内容(费用名称)
    jeVal:[], //所有input的内容(金额)
    srVal:['true','true','true','true','true','true','true','true','true','true','true','true','true','true','true'],
    zcVal:['','','','','','','','','','','','','','',''],
    navH:0,
    bindTap:"getBack", //返回上一页
    title:'办理入住',
    multiIndex: [0, 0],
    fkfsIndex: [2, 2],
    detail_more:true, //更多信息
    detail_bz:true, //备注
    detail_jjlxr:true, //紧急联系人
    detail_wyjg:true, //物业交割
    detail_qyxx:true, //签约信息
    detail_wpjg:true, //房间物品交割
    detail_sdds:true, //水电读数
    gjIndex: 0, //国籍
    zyIndex: 0, //职业
    lxrgxIndex: 0, //紧急联系人
    htlxIndex: 0, //合同类型
    sz1:"",
    sz2:"",
    cheackQYFS:false,
    cheack:false,
    yj_dis: true,  //押金只读
    mydata:'',
    rules:['133','149','153','173','177','180','181','189','190','191','193','199','130','131','132','145','155','156','166','167','171','175','176','185','186','196','134','135','136','137','138','139','144','147','148','150','151','152','157','158','159','172','178','182','183','184','187','188','195','197','198'],
    imgs:[],
    showView:false,
    img_qty:0,
    imgUrlArr: [],//需要传给后台的图片数组
    countNum:12, //上传数量
    max:250   //最大输入
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    var that = this;
    fullName = ""  //姓名
    telephone = ""  //联系电话
    cardNo2 = ""  //证件号
    contractNo = "" //合同号
    reserveNo = "" //预定单号
    hid = options.hid;
    //hid = "10043";
    reserveNo = options.reserveNo;
    if(!reserveNo){
      reserveNo = "";
    }
    ts = "ts";
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
    apiUrl = app.globalData.apiUrl;   //获取api地址
    userid = app.globalData.userid;   //登陆人工号
    if(!!hid){
      this.house_info(hid); //获取房间详情
    } 
    this.get_zfsj(ts);  //获取支付时间
    this.get_fkfs();  //获取付款方式
    this.get_rentUnit();  //获取租金单位
    this.get_rentCycle();  //获取收租周期
    this.get_szrq();  //获取收租日期
    this.get_sex();  //获取性别
    this.get_cardType();  //获取证件类型
    this.get_cardTType();  //获取证件类型(同住人)
    this.get_sexType();  //获取性别(同住人)
    this.get_fylx();  //获取费用类型
    this.get_zkly();  //获取租客来源
    this.get_gj();  //获取国籍
    this.get_zhiye();  //获取职业
    this.get_jjlxrlx();  //获取紧急联系人类型
    this.get_htlx();  //合同类型
    this.get_goodsInfo();  //获取交割物品(房间)
    this.get_goodsInfoGQ();  //获取交割物品(公区)
    this.get_fjsb();  //水电煤房间设备
    this.get_gqsb();  //水电煤公区设备
    this.get_gxT();  //获取关系(同住人)
    this.get_qxT();  //获取开门权限(同住人)
    this.setData({
      hid:hid
   })
    if(!!reserveNo){
     this.reserve_info(reserveNo);  //获取预定信息   
    } 
  },
  tapRZ: function(e) {
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let  hth= e.currentTarget.dataset.key;
    let  remark= e.currentTarget.dataset.val;
    let url = "";
    if (index == '1') {
      wx.showToast({
        title: '功能开发中~',
        icon: "none",
        duration: 500
      })
    } else if ( index == '2' ) {
      _this.setData({
        master:true,  //主档
        detail_tzr:false, //同住人
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_wyjg:true, //物业交割
        detail_qyxx:true, //签约信息
        detail_wpjg:true, //房间物品交割
        detail_sdds:true, //水电读数        
        bindTap:"TZRshowMaster",
        title:'同住信息',
     })
     _this.show_tzr();  //显示同住人
    } else if( index == '3' ){
      var app = getApp();
      app.globalData.blrz_remark=remark;
      url = '../../../pagesB/pages/remark_edit/remark_edit';
    }else if( index == '4' ){
      if(contractNo==""){
        wx.showToast({
          title: '请先保存',
          icon: 'none',
          duration: 1000//持续的时间 
        }) 
      }
      else{
        url = '../../../pagesB/pages/account_add/account_add?hth='+hth;
      }
    } else if( index == '5' ){
      _this.setData({
        master:true,  //主档
        detail_tzr:true, //同住人
        detail_fymx:false, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_wyjg:true, //物业交割
        detail_qyxx:true, //签约信息
        detail_wpjg:true, //房间物品交割
        detail_sdds:true, //水电读数
        bindTap:"showMaster",
        title:'费用明细',
     })
     _this.show_fymx();  //显示
    } else if(index == '6') {
      _this.setData({
        master:true,  //主档
        detail_tzr:true, //同住人
        detail_fymx:true, //费用明细
        detail_more:false, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_wyjg:true, //物业交割
        detail_qyxx:true, //签约信息
        detail_wpjg:true, //房间物品交割
        detail_sdds:true, //水电读数
        bindTap:"showMaster",
        title:'更多信息',
     })
    } else if(index == '7') {
      _this.setData({
        master:true,  //主档
        detail_tzr:true, //同住人
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_wyjg:false, //物业交割
        detail_qyxx:true, //签约信息
        detail_wpjg:true, //房间物品交割
        detail_sdds:true, //水电读数
        bindTap:"showMaster",
        title:'物业交割',
     })
    } else if(index == '8') {
      _this.setData({
        master:true,  //主档
        detail_tzr:true, //同住人
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:false, //备注
        detail_jjlxr:true, //紧急联系人
        detail_wyjg:true, //物业交割
        detail_qyxx:true, //签约信息
        detail_wpjg:true, //房间物品交割
        detail_sdds:true, //水电读数
        bindTap:"showMaster",
        title:'备注',
     })
    } else if(index == '9') {
      _this.setData({
        master:true,  //主档
        detail_tzr:true, //同住人
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:false, //紧急联系人
        detail_wyjg:true, //物业交割
        detail_qyxx:true, //签约信息
        detail_wpjg:true, //房间物品交割
        detail_sdds:true, //水电读数
        bindTap:"showMaster",
        title:'紧急联系人',
     })
    } else if(index == '10') {
      _this.setData({
        master:true,  //主档
        detail_tzr:true, //同住人
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_wyjg:true, //物业交割
        detail_qyxx:false, //签约信息
        detail_wpjg:true, //房间物品交割
        detail_sdds:true, //水电读数
        bindTap:"showMaster",
        title:'签约信息',
     })
    } else if(index == '11') {
      _this.setData({
        master:true,  //主档
        detail_tzr:true, //同住人
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_wyjg:true, //物业交割
        detail_qyxx:true, //签约信息
        detail_wpjg:false, //房间物品交割
        detail_sdds:true, //水电读数
        bindTap:"showWYJG",
        title:'房间物品交割',
     })
    } else if(index == '12') {
      _this.setData({
        master:true,  //主档
        detail_tzr:true, //同住人
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_wyjg:true, //物业交割
        detail_qyxx:true, //签约信息
        detail_wpjg:true, //房间物品交割
        detail_sdds:false, //水电读数
        bindTap:"showWYJG",
        title:'水电煤读数',
     })
    } 
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  house_info:function (hid) { //获取房间信息
    let _this = this;
    var _data = {ac: 'house_info',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            var rent_unit = units[0].rent_unit;
            dsn = units[0].equip_no;
            Sd = units[0].Sdate;
            Ed = units[0].Edate;
            depositT = units[0].rent;
            dbsbh = units[0].dbNo;
            sbsbh = units[0].sbNo;
            if(!rent_unit){ rent_unit='1001' }
              _this.setData({
                houseName:units[0].houseName+'-'+units[0].roomNo,
                Sdate:units[0].Sdate,
                Edate:units[0].Edate,
                rent:units[0].rent,
                deposit:units[0].rent,
                unitIndex:_this.get_indexYW(zjdwQJ,rent_unit),                 
                QYdate:units[0].Sdate,
                JGdate:units[0].Sdate,
                check12:true,
                ele_price:units[0].ele_price,
                cWater_price:units[0].cWater_price,
              })
              if(!!sbsbh){
                _this.get_sbInfo(sbsbh,"sb");
              }
              if(!!dbsbh){
                _this.get_dbInfo(dbsbh,"db");
              }
          }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  nameChange: function(e) {   //姓名改变事件
    fullName = e.detail.value;
    if(!!telephone && !!fullName && !!cardNo2){
      dis = "1"
    }else{
      dis = ""
    }
    this.setData({
       disableT:dis
    })
  },
  telChange: function(e) {   //姓名改变事件
    telephone = e.detail.value;
    if(telephone.length!=11){
      wx.showToast({
        title: "手机号长度应为11位",
        icon: 'none',
        duration: 1000
      })
      telephone = "";
      this.setData({
        tel:"",
        disableT:"",
        zktel:"",
      })
      return false;
    }
    let top3=telephone.substring(0,3)
     for(let t of this.data.rules){
     if(t==top3){
      if(!!telephone && !!fullName && !!cardNo2){
        dis = "1"
      }else{
        dis = ""
      }
      this.setData({
        disableT:dis,
        zktel:telephone
      })
      let dh = this.data.zktel;
      let sfzh = this.data.zksfz;
      if(!!dh && !!sfzh){
        this.judgeZK(dh,sfzh);
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
      tel:"",
      disableT:"",
      zktel:"",
    })
  },
  cardNoChange: function(e) {   //证件号改变事件
    cardNo2 = e.detail.value;
    if(cardQJ[zjlxindex].code=="1001"){
      var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      if(reg.test(cardNo2)==false){
        wx.showToast({
          title: "请输入正确的身份证",
          icon: 'none',
          duration: 1000
        })
        cardNo2 = "";
        this.setData({
          disableT:"",
          cardNo:"",
          zksfz:""
        })
        return false;
    }
    else{
      if(!!telephone && !!fullName && !!cardNo2){
        dis = "1"
      }else{
        dis = ""
      }
      this.setData({
        disableT:dis,
        zksfz:cardNo2
      })
      let dh = this.data.zktel;
      let sfzh = this.data.zksfz;
      if(!!dh && !!sfzh){
        this.judgeZK(dh,sfzh);
      }
    }
  }
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
          zjdwQJ = units;
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
  get_rentCycle:function () { //获取收租周期
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_rentCycle'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          cycleQJ = units;
          setTimeout(()=>{
            _this.setData({
              cycle:units
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
  get_szrq:function () { //获取收租日期
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_yssj'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              szrq:units
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
  get_sex:function () { //获取性别
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'sex'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          sexQJ = units;
          setTimeout(()=>{
            _this.setData({
              sex:_this.data.servicelist.concat(units)
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
  get_cardType:function () { //获取证件类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_zjlx'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          cardQJ = units;
          setTimeout(()=>{
            _this.setData({
              card:_this.data.servicelist.concat(units)
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
  get_cardTType:function () { //获取证件类型(同住人)
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_zjlx'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          cardQJT = units;
          setTimeout(()=>{
            _this.setData({
              cardT:units
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
  get_sexType:function () { //获取性别(同住人)
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'sex'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              sexT:units
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
  get_fylx:function () { //获取费用类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_fylx'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              fylx:units
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
  get_zkly:function () { //获取租客来源
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_zkly'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              zkly:units
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
  get_zfsj:function (ts) { //获取支付时间
    let _this = this;
    var _data = {ac: 'get_zfsj',"ts":ts};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          zfsjQJ = units;
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
  get_fkfs:function () { //获取付款方式
    let _this = this;
    var _data = {ac: 'get_fkfs'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          fkfsQJ = units;
          setTimeout(()=>{
            _this.setData({
              fkfsArray:units
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
  get_gj:function () { //获取国籍
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_country'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          gjQJ = units;
          setTimeout(()=>{
            _this.setData({
              gj:units
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
  get_zhiye:function () { //获取职业
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'ly_industry'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          zyQJ = units;
          setTimeout(()=>{
            _this.setData({
              zy:units
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
  get_jjlxrlx:function () { //获取紧急联系人类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_relation'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          lxrgxQJ = units;
          setTimeout(()=>{
            _this.setData({
              lxrgx:units
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
  get_htlx:function () { //获取合同类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_qylx'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              htlx:units
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
  get_goodsInfo:function () { //获取交割物品(房间)
    let _this = this;
    let wz = "房间";
    var _data = {ac: 'IB_goodsInfo',"wz":wz};
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
              "i":i,
              "gid":units[i].goodsNo,
              "gname":units[i].goodsName,
              "num":0,
            })
          }
          setTimeout(()=>{
            _this.setData({
              wpList:newlist
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
  get_goodsInfoGQ:function () { //获取交割物品(公区)
    let _this = this;
    let wz = "公区";
    var _data = {ac: 'IB_goodsInfo',"wz":wz};
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
              "i":i,
              "gid":units[i].goodsNo,
              "gname":units[i].goodsName,
              "num":0,
            })
          }
          setTimeout(()=>{
            _this.setData({
              gqList:newlist
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
  get_fjsb:function () { //水电煤房间设备
    let _this = this;
    let lx = "fj";
    var _data = {ac: 'get_fjsb',"lx":lx};
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
              "i":i,
              "code":units[i].code,
              "othername":units[i].othername
            })
          }
          setTimeout(()=>{
            _this.setData({
              roomdata:newlist
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
  get_gqsb:function () { //水电煤公区设备
    let _this = this;
    let lx = "gq";
    var _data = {ac: 'get_fjsb',"lx":lx};
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
              "i":i,
              "code":units[i].code,
              "othername":units[i].othername
            })
          }
          setTimeout(()=>{
            _this.setData({
              publicdata:newlist
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
  get_gxT:function () { //获取关系(同住人)
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_relation'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        setTimeout(()=>{
          _this.setData({
            gxT:units
          })
        },100)
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  get_qxT:function () { //获取开门权限(同住人)
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_kmqx'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        setTimeout(()=>{
          _this.setData({
            qxT:units
          })
        },100)
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  bindfylxChange: function(e) {  //费用类型改变事件
    var nowIdx_fy=e.currentTarget.dataset.idx;//获取当前索引
    var oldFYVal=this.data.fyVal;
    oldFYVal[nowIdx_fy]=e.detail.value;//修改对应索引值的内容
    this.setData({
      //fylxIndex: e.detail.value
      fyVal:oldFYVal
    })
  },
  bindPickerChange: function(e) {  //租金单位改变事件
    this.setData({
      unitIndex: e.detail.value
    })
  },
  bindCycleChange: function(e) {  //收租周期改变事件
    this.setData({
      cycleIndex: e.detail.value
    })
  },
  bindszrqChange: function(e) {  //收租周期改变事件
    this.setData({
      szrqIndex: e.detail.value
    })
  },
  bindSexChange: function(e) {  //性别改变事件
    this.setData({
      sexIndex: e.detail.value
    })
  },
  bindCardChange: function(e) {  //证件类型改变事件
    zjlxindex = e.detail.value;
    this.setData({
      cardIndex: e.detail.value
    })
    if(cardQJ[zjlxindex].code=="1001"){
      var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      if(reg.test(cardNo2)==false){
        wx.showToast({
          title: "请输入正确的身份证",
          icon: 'none',
          duration: 1000
        })
        this.setData({
          cardNo:""
        })
        return false;
      }
    }
  },
  bindCardTChange: function(e) {  //证件类型改变事件(同住人)
    var nowIdx_ct=e.currentTarget.dataset.idx;//获取当前索引
    var oldCTVal=this.data.ctVal;
    oldCTVal[nowIdx_ct]=e.detail.value;//修改对应索引值的内容
    this.setData({
      //cardTIndex: e.detail.value
      ctVal:oldCTVal
    })
    let ctValT = this.data.ctVal;
    let zjlxT = cardQJT[ctValT[nowIdx_ct]].code;  //获取同住人证件类型
    var cardNoValT=this.data.cardNoVal;
    let cardNoT = cardNoValT[nowIdx_ct];
    if(zjlxT=="1001"){
      var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      if(reg.test(cardNoT)==false){
        wx.showToast({
          title: "请输入正确的身份证",
          icon: 'none',
          duration: 1000
        })
        cardNoValT[nowIdx_ct]="";//修改对应索引值的内容
        this.setData({
          cardNoVal:cardNoValT,
          tzrsfz:""
        })
        return false;
      }
    }
  },
  bindSexTChange: function(e) {  //性别改变事件(同住人)
    var nowIdx_sex=e.currentTarget.dataset.idx;//获取当前索引
    var oldSexVal=this.data.sexVal;
    oldSexVal[nowIdx_sex]=e.detail.value;//修改对应索引值的内容
    this.setData({
      sexVal:oldSexVal
    })
  },
  bindzklyChange: function(e) {  //租客来源改变事件
    this.setData({
      zklyIndex: e.detail.value
    })
  },
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let zfsj = e.detail.value[0];
    if(zfsj==0){
      ts = "ts";
    }
    else{
      ts = "gd";
    }
    this.get_zfsj(ts);  //获取支付时间
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    if(e.detail.column==0){
      var zflx = e.detail.value;
      if(zflx==0){
        ts = "ts";
      }
      else{
        ts = "gd";
      }
    }
    this.get_zfsj(ts);  //获取支付时间
  },
  bindFKFSPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    fkfsY = e.detail.value[1];
    if(fkfsY=='0'){
      this.setData({
        yj_dis: ""
      })
    }
    else{
      this.setData({
        yj_dis: true
      })
    }
    this.set_yj(fkfsY,depositT);  //计算押金
    this.setData({
      fkfsIndex: e.detail.value
    })   
  },
  bindGJChange: function(e) {  //国籍事件
    this.setData({
      gjIndex: e.detail.value
    })
  },
  bindZYChange: function(e) {  //职业事件
    this.setData({
      zyIndex: e.detail.value
    })
  },
  bindJJLXRChange: function(e) {  //紧急联系人类型事件
    this.setData({
      lxrgxIndex: e.detail.value
    })
  },
  bindHTLXChange: function(e) {  //合同类型事件
    this.setData({
      htlxIndex: e.detail.value
    })
  },
  bindGXTChange: function(e) {  //关系改变事件(同住人)
    var nowIdx_gx=e.currentTarget.dataset.idx;//获取当前索引
    var oldGXVal=this.data.gxVal;
    oldGXVal[nowIdx_gx]=e.detail.value;//修改对应索引值的内容
    this.setData({
      gxVal:oldGXVal
    })
  },
  bindQXTChange: function(e) {  //权限改变事件(同住人)
    var nowIdx_qx=e.currentTarget.dataset.idx;//获取当前索引
    var oldQXVal=this.data.qxVal;
    oldQXVal[nowIdx_qx]=e.detail.value;//修改对应索引值的内容
    this.setData({
      qxVal:oldQXVal
    })
  },
  startDateChange: function(e) {  //开始时间
    /* 
    Sd = e.detail.value;
    this.setData({
      Sdate: e.detail.value
    })
    */
   let Sd2 = e.detail.value;
   let Sdate=new Date(Sd2);
   let Edate=new Date(Ed);
   if(Sdate > Edate){
     wx.showToast({
       title: "起始时间不能大于终止时间",
       icon: 'none',
       duration: 1000
     })
     this.setData({
       Sdate: Sd
     })
     return false;
   }
   else{
    Sd = e.detail.value;
    this.setData({
      Sdate: e.detail.value
    })
   }
  },
  endDateChange: function(e) {  //结束时间
    let Ed2 = e.detail.value;
    let Sdate=new Date(Sd);
    let Edate=new Date(Ed2);
    if(Sdate > Edate){
      wx.showToast({
        title: "起始时间不能大于终止时间",
        icon: 'none',
        duration: 1000
      })
      this.setData({
        Edate: Ed
      })
      return false;
    }
    else{
      Ed = e.detail.value;
      this.setData({
        Edate: e.detail.value
      })
    }
  },
  bindDateChange: function(e) {  //收租日期
    this.setData({
      date: e.detail.value
    })
  },
  qyDateChange: function(e) {  //签约时间
    this.setData({
      QYdate: e.detail.value
    })
  },
   //合同时间类型
  radioChangeSJ:function(e){
    var val_sj=e.detail.value;//获取输入的值
    if(!Sd){
      const date = new Date(); //获取当前时间
      let y = date.getFullYear();  //年
      let m = date.getMonth()+1; //月
      let d = date.getDate();  //日
      if(m < 10){ m = '0'+ m }
      if(d < 10){ d = '0'+ d }
      Sd = y+'-'+m+'-'+d;  //拼接时间如2022-01-02
    }
    if(!val_sj){
      val_sj=12
    }
    let _this = this;
    var _data = {ac: 'get_endDate',"val_sj":val_sj,"Sd":Sd};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          Ed = units[0].Edate;
          setTimeout(()=>{
            _this.setData({
              Edate:units[0].Edate
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
  getBack: function(e) {  //返回上一页
    maxIndex =  0;    //最大下标初始化成0
    FYmaxIndex =  0;  //最大下标初始化成0
    wx.navigateBack({
      delta: 1,
    })
  },
  showMaster: function(e) {  //显示主档
    this.setData({
      master:false,  //主档
      detail_tzr:true, //同住人
      detail_fymx:true, //费用明细
      detail_more:true, //更多信息
      detail_bz:true, //备注
      detail_jjlxr:true, //紧急联系人
      detail_wyjg:true, //物业交割
      detail_qyxx:true, //签约信息
      detail_wpjg:true, //房间物品交割
      detail_sdds:true, //水电读数
      bindTap:"getBack",
      title:'办理入住',
   })
  },
  TZRshowMaster: function(e) {  //显示主档
    let lenT=this.data.inputList.length;  //同住人数组长度
    var save_flag = "1"; //1为可以保存，0不能保存
    for(var i =0;i < lenT;i++){
      var name_i = this.data.inputVal[i];
      var zjh_i = this.data.cardNoVal[i];
      if(!!name_i && !zjh_i){
        wx.showToast({
          title: '同住人'+(i+1)+'证件号不能为空',
          icon: "none",
          duration: 1000
        })
        save_flag = "0";
        break;
      }
    }
    if(save_flag=="1"){
      this.setData({
        master:false,  //主档
        detail_tzr:true, //同住人
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_wyjg:true, //物业交割
        detail_qyxx:true, //签约信息
        detail_wpjg:true, //房间物品交割
        detail_sdds:true, //水电读数
        bindTap:"getBack",
        title:'办理入住',
     })
    }
  },
  showWYJG: function(e) {  //显示物业交割
    this.setData({
      master:true,  //主档
      detail_tzr:true, //同住人
      detail_fymx:true, //费用明细
      detail_more:true, //更多信息
      detail_bz:true, //备注
      detail_jjlxr:true, //紧急联系人
      detail_wyjg:false, //物业交割
      detail_qyxx:true, //签约信息
      detail_wpjg:true, //房间物品交割
      detail_sdds:true, //水电读数
      bindTap:"showMaster",
      title:'物业交割',
   })
  },
  show_tzr:function () { //显示同住人
    console.log("同住人最大下标:"+maxIndex);
    if(maxIndex==0){
      let _this = this;
      const unitN = [{}];
      var newCTVal=this.data.ctVal;
      var newSexVal=this.data.sexVal;
      var newGXVal=this.data.gxVal;
      var newQXVal=this.data.qxVal;
      newCTVal[0]="0";//修改对应索引值的内容
      newSexVal[0]="0";//修改对应索引值的内容
      newGXVal[0]="0";
      newQXVal[0]="0";
      _this.setData({
        inputList:unitN,
        "maxIndex":maxIndex,
        ctVal:newCTVal,
        sexVal:newSexVal,
        gxVal:newGXVal,
        qxVal:newQXVal,
      })
    }
  },
  //增加按钮
  addmore(e) { 
    const {inputList} = this.data  //简写变量书写
    const {dataset: {index}} = e.currentTarget
    let lenT=this.data.inputList.length;  //同住人数组长度
    var oldTzjh=this.data.cardNoVal[lenT-1];
    if(!oldTzjh && lenT>0){
      wx.showToast({
        title: '同住人证件号不能为空',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else{
      let len = this.data.inputList.length;
      console.log("下标："+index);
      //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
      inputList.splice(index, 0, {})
      maxIndex = index;
      console.log("最大值："+maxIndex);
      var oldCTVal=this.data.ctVal;
      var oldSexVal=this.data.sexVal;
      var oldGXVal=this.data.gxVal;
      var oldQXVal=this.data.qxVal;
      oldCTVal[len]="0";//修改对应索引值的内容
      oldSexVal[len]="0";//修改对应索引值的内容
      oldGXVal[len]="0";
      oldQXVal[len]="0";
      //更新列表
      this.setData({
        inputList,
        "maxIndex":index,
        ctVal:oldCTVal,
        sexVal:oldSexVal,
        gxVal:oldGXVal,
        qxVal:oldQXVal,
      })
    }
  },
  //删除按钮
  delmore(e) {
    var that = this;
    const {inputList} = this.data   //简写变量书写
    const {dataset: {index}} = e.currentTarget
    var oldInputVal=this.data.inputVal;  //所有的input值
    oldInputVal.splice(index-1,1);       //view删除了对应的input值也要删掉
    var oldTelVal=this.data.telVal;
    oldTelVal.splice(index-1,1);
    var oldCardVal=this.data.cardNoVal;
    oldCardVal.splice(index-1,1);
    var oldCTVal=this.data.ctVal;
    oldCTVal.splice(index-1,1);
    var oldSexVal=this.data.sexVal;
    oldSexVal.splice(index-1,1);
    var oldGXVal=this.data.gxVal;
    oldGXVal.splice(index-1,1);
    var oldQXVal=this.data.qxVal;
    oldQXVal.splice(index-1,1);
    //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
    console.log("删除的下标："+index);
    inputList.splice(index-1, 1)
    //更新列表
    that.setData({
      inputList,
      inputVal: oldInputVal,
      telVal: oldTelVal,
      cardNoVal: oldCardVal,
      ctVal: oldCTVal,
      sexVal: oldSexVal,
      gxVal: oldGXVal,
      qxVal: oldQXVal,
    })
  },
  //隐藏同住人列表
  hiddenTZR:function (){
    var _this = this;
    let lenT=this.data.inputList.length;  //同住人数组长度
    var save_flag = "1"; //1为可以保存，0不能保存
    for(var i =0;i < lenT;i++){
      var name_i = _this.data.inputVal[i];
      var zjh_i = _this.data.cardNoVal[i];
      if(!!name_i && !zjh_i){
        wx.showToast({
          title: '同住人'+(i+1)+'证件号不能为空',
          icon: "none",
          duration: 1000
        })
        save_flag = "0";
        break;
      }
    }
    if(save_flag=="1"){
      _this.setData({
        master:false,  //主档
        detail_tzr:true, //同住人
        detail_fymx:true, //费用明细
        title:'办理入住'
     })
    }
  },
  show_fymx:function () { //显示费用明细
    console.log("其他费用最大下标:"+FYmaxIndex);
    if(FYmaxIndex==0){
      let _this = this;
      const unitN = [{}];
      var newfyVal=this.data.fyVal;
      newfyVal[0]="0";//修改对应索引值的内容
      _this.setData({
        fymxList:unitN,
        "FYmaxIndex":FYmaxIndex,
        fyVal:newfyVal
      })
    }
  },
  //添加费用按钮
  FYaddmore(e) { 
    const {fymxList} = this.data  //简写变量书写
    const {dataset: {index}} = e.currentTarget
    let len = this.data.fymxList.length;
    console.log("下标："+index);
    //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
    fymxList.splice(index, 0, {})
    FYmaxIndex = index;
    console.log("最大值："+FYmaxIndex);
    var oldFYVal=this.data.fyVal;
    oldFYVal[len]="0";//修改对应索引值的内容
    //更新列表
    this.setData({
      fymxList,
      "FYmaxIndex":FYmaxIndex,
      fyVal:oldFYVal
    })
  },
  //删除按钮
  FYdelmore(e) {
    var that = this;
    const {fymxList} = this.data   //简写变量书写
    const {dataset: {index}} = e.currentTarget
    var oldJEVal=this.data.jeVal;  //所有的input值
    oldJEVal.splice(index-1,1);    //view删除了对应的input值也要删掉
    var oldFYVal=this.data.fyVal;
    oldFYVal.splice(index-1,1);
    var oldSRVal=this.data.srVal;
    var oldZCVal=this.data.zcVal;
    oldSRVal.splice(index-1,1);
    oldZCVal.splice(index-1,1);
    //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
    fymxList.splice(index-1, 1)
    //更新列表
    that.setData({
      fymxList,
      jeVal: oldJEVal,
      fyVal: oldFYVal,
      srVal: oldSRVal,
      zcVal: oldZCVal,
    })
  },
  //隐藏费用明细列表
  hiddenFY:function (){
    var _this = this;
    _this.setData({
      master:false,  //主档
      detail_tzr:true, //同住人
      detail_fymx:true, //费用明细
      title:'办理入住'
   })
  },
  //获取input的值
  nameInputVal:function(e){
    var nowIdx_n=e.currentTarget.dataset.idx;//获取当前索引
    var val_n=e.detail.value;//获取输入的值
    var oldVal_n=this.data.inputVal;
    oldVal_n[nowIdx_n]=val_n;//修改对应索引值的内容
    this.setData({
        inputVal:oldVal_n
    })
  },
  //获取input的值
  telInputVal:function(e){
    /*
    var nowIdx_t=e.currentTarget.dataset.idx;//获取当前索引
    var val_t=e.detail.value;//获取输入的值
    var oldVal_t=this.data.telVal;
    oldVal_t[nowIdx_t]=val_t;//修改对应索引值的内容
    this.setData({
      telVal:oldVal_t
    })
    */
   let telephone = e.detail.value;
   var nowIdx_t=e.currentTarget.dataset.idx;//获取当前索引
   var val_t=e.detail.value;
   var oldVal_t=this.data.telVal;
   if(val_t.length!=11){
     wx.showToast({
       title: "手机号长度应为11位",
       icon: 'none',
       duration: 1000
     })
     val_t = "";
     oldVal_t[nowIdx_t]="";//修改对应索引值的内容
     this.setData({
        telVal:oldVal_t,
        tzrtel:""
     })
     return false;
   }
    let top3=val_t.substring(0,3)
    for(let t of this.data.rules){
    if(t==top3){
     this.setData({
       tzrtel:val_t
     })
     let dh = this.data.tzrtel;
     //let sfzh = this.data.tzrsfz;
     let sfzh = this.data.cardNoVal[nowIdx_t];
     if(!!dh && !!sfzh){
      this.judgeTZR(dh,sfzh,nowIdx_t);
     }
     return;
    }
   }
   wx.showToast({
     title: "请输入正确的手机号",
     icon: 'none',
     duration: 1000
   })
   oldVal_t[nowIdx_t]="";//修改对应索引值的内容
   this.setData({
     tzrtel:"",
     telVal:oldVal_t,
   })
  },
  //获取input的值
  cardNoInputVal:function(e){
    var nowIdx_c=e.currentTarget.dataset.idx;//获取当前索引
    var val_c=e.detail.value;//获取输入的值
    var oldVal_c=this.data.cardNoVal;
    let ctValT = this.data.ctVal;
    let zjlxT = cardQJT[ctValT[nowIdx_c]].code;  //获取同住人证件类型
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if(reg.test(val_c)==false && zjlxT=="1001"){
      wx.showToast({
        title: "请输入正确的身份证",
        icon: 'none',
        duration: 1000
      })
      oldVal_c[nowIdx_c]="";//修改对应索引值的内容
      this.setData({
        cardNoVal:oldVal_c,
        tzrsfz:""
      })
      return false;
    }
    else{
      oldVal_c[nowIdx_c]=val_c;//修改对应索引值的内容
      this.setData({
        cardNoVal:oldVal_c,
        tzrsfz:val_c
      })
      let dh = this.data.tzrtel;
      //let dh = this.data.telVal[nowIdx_c];
      let sfzh = this.data.tzrsfz;
      if(!!dh && !!sfzh){
        this.judgeTZR(dh,sfzh,nowIdx_c);
      }
    }
  },
  //获取input的值
  jeInputVal:function(e){
    var nowIdx_je=e.currentTarget.dataset.idx;//获取当前索引
    var val_je=e.detail.value;//获取输入的值
    var oldVal_je=this.data.jeVal;
    oldVal_je[nowIdx_je]=val_je;//修改对应索引值的内容
    this.setData({
      jeVal:oldVal_je
    })
  },
  //获取input的值
  radioChange:function(e){
    var nowIdx_szlx=e.currentTarget.dataset.idx;//获取当前索引
    var val_szlx=e.detail.value;//获取输入的值
    var oldVal_sr=this.data.srVal;
    var oldVal_zc=this.data.zcVal;
    if(val_szlx=='in'){
      oldVal_sr[nowIdx_szlx]='true';//修改对应索引值的内容
      oldVal_zc[nowIdx_szlx]='';//修改对应索引值的内容
    }
    else{
      oldVal_sr[nowIdx_szlx]='';//修改对应索引值的内容
      oldVal_zc[nowIdx_szlx]='true';//修改对应索引值的内容   
    }
    this.setData({
      srVal:oldVal_sr,
      zcVal:oldVal_zc
    })
  },
  numjs(e){
    let index1=e.currentTarget.dataset.index;
    let a=this.data.wpList[index1].num+1;
    this.setData({
     ['wpList['+index1+'].num']:a
    })
  },
  numjsj(e){
    let index1=e.currentTarget.dataset.index
    let a=this.data.wpList[index1].num-1;
    if(a<0){
      return;
    }
     this.setData({
      ['wpList['+index1+'].num']:a
     })
  },
  numchange(e){
    let newnum=parseInt(e.detail.value);
    let index1=e.currentTarget.dataset.index;
    console.log(newnum);
    this.setData({
      ['wpList['+index1+'].num']:newnum
    })
  },
  numjsGQ(e){
    let index1=e.currentTarget.dataset.index;
    let a=this.data.gqList[index1].num+1;
    this.setData({
     ['gqList['+index1+'].num']:a
    })
  },
  numjsjGQ(e){
    let index1=e.currentTarget.dataset.index
    let a=this.data.gqList[index1].num-1;
    if(a<0){
      return;
    }
     this.setData({
      ['gqList['+index1+'].num']:a
     })
  },
  numchangeGQ(e){
    let newnum=parseInt(e.detail.value);
    let index1=e.currentTarget.dataset.index;
    console.log(newnum);
    this.setData({
      ['gqList['+index1+'].num']:newnum
    })
  },
  minchange:function(e){
    //let newminimum=parseInt(e.detail.value);
    var newminimum;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      newminimum = e.detail.value;
    } else {
      wx.showToast({
        title: '读数有误，请重新输入',
        icon: "none",
        duration: 1000
      })
      newminimum = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    let index1=e.currentTarget.dataset.index;
    this.setData({
      ['roomdata['+index1+'].minimum']:newminimum
    })
  },
  minchange1:function(e){
    //let newminimum=parseInt(e.detail.value);
    var newminimum;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      newminimum = e.detail.value;
    } else {
      wx.showToast({
        title: '读数有误，请重新输入',
        icon: "none",
        duration: 1000
      })
      newminimum = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    let index1=e.currentTarget.dataset.index;
    this.setData({
      ['publicdata['+index1+'].minimum']:newminimum
      })
  },
  changeTime:function(e){
    this.setData({
      JGdate: e.detail.value,
      cheack:false
    })
  },
  checkcheackQYLX:function(){
    //var QYLX=e.detail.value;
    if(this.data.cheackQYFS){
      this.setData({
        cheackQYFS:false
      })
      signing = "1002"; //设置成纸质合同
    }else{
      this.setData({
        cheackQYFS:true
      })
      signing = "1001"; //设置成电子合同
    }
    console.log("签约方式："+signing);
  },
  checkcheack:function(){
    if(this.data.cheack){
      this.setData({
        cheack:false
      })
    }else{
      this.setData({
        cheack:true
      })
    }
 },
  //隐藏更多信息
  hiddenMore:function (){
    var _this = this;
    _this.setData({
      master:false,  //主档
      detail_tzr:true, //同住人
      detail_fymx:true, //费用明细   
      detail_more:true, //更多信息
      detail_bz:true, //备注
      detail_jjlxr:true, //紧急联系人
      detail_wyjg:true, //物业交割
      detail_qyxx:true, //签约信息
      detail_wpjg:true, //房间物品交割
      detail_sdds:true, //水电煤读数
      title:'办理入住'
   })
  },
  set_yj:function(fkfsY,depositT){  //选择房源
    let num = 1;
    if(fkfsY=='1'){ num = 0;}
    else if(fkfsY=='2'){ num = 1;}
    else if(fkfsY=='3'){ num = 2;}
    else if(fkfsY=='4'){ num = 3;}
    if(fkfsY!='0'){  //不是自定义押金
      this.setData({
        deposit:depositT*num
      })
    }
  },
  rentChange: function(e) {   //租金改变事件
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      depositT = e.detail.value;
    } else {
      wx.showToast({
        title: '租金只留2位小数',
        icon: "none",
        duration: 1000
      })
      depositT = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      rent:depositT
    })
    this.set_yj(fkfsY,depositT);  //计算押金
  },
  tapYD:function(e){  //选择预定
    wx.navigateTo({
      url: '../../../pagesB/pages/ydDlg_list/ydDlg_list'
    })
  },
  reserve_info:function (reserveNo) { //获取预定详情
    let _this = this;
    var _data = {ac: 'reserve_info',"reserveNo":reserveNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let zqnx = units[0].zqnx;
          depositT = units[0].deposit_total;
          Sd = units[0].inTime2;
          fullName = units[0].tenantName;
          telephone = units[0].tenantTel;
          let check1 = "";
          let check3 = "";
          let check6 = "";
          let check12 = "";
          if(zqnx=="1001"){ check1 = "true"; }
          else if(zqnx=="1002"){ check3 = "true"; }
          else if(zqnx=="1003"){ check6 = "true"; }
          else if(zqnx=="1004"){ check12 = "true"; }
          zjlxindex = _this.get_indexYW(cardQJ,units[0].credentialsType);
          cardNo2 = units[0].credentialsNo; //证件号
          _this.setData({
            ydNo:units[0].reserveNo,
            hid:units[0].roomId,
            houseName:units[0].houseName,       
            name:units[0].tenantName,
            tel:units[0].tenantTel,
            cardIndex:_this.get_indexYW(cardQJ,units[0].credentialsType),  //获取一维数组下标
            cardNo:units[0].credentialsNo,
            Sdate:units[0].inTime2,
            Edate:units[0].outTime2,
            cycleIndex:_this.get_indexYW(cycleQJ,units[0].rentType),  //获取一维数组下标
            rent:units[0].deposit_total,
            deposit:units[0].deposit,
            QYdate:units[0].yjqysj2,
            //sexIndex:units[0].sex_index,
            //gjIndex:units[0].gj_index,
            //zyIndex:units[0].zy_index,
            sexIndex:_this.get_indexYW(sexQJ,units[0].sex),
            gjIndex:_this.get_indexYW(gjQJ,units[0].tenantCountry),
            zyIndex:_this.get_indexYW(zyQJ,units[0].Occupation),
            gzdw:units[0].companyName,
            lxrgxIndex:_this.get_indexYW(lxrgxQJ,units[0].relationship),  
            lxrxm:units[0].urgent,
            tel_lxr:units[0].mobileNumber,
            check1:check1,
            check3:check3,
            check6:check6,
            check12:check12,
            fkfsIndex:_this.get_indexTwo(fkfsQJ,units[0].fkfs_F,units[0].fkfs_Y),
            multiIndex:_this.get_indexTwo(zfsjQJ,units[0].tqlx,units[0].days),
            disableT:"1"
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
  //获取一维数组下标
  get_indexYW:function(arrayName,code){
    let arrtofor=arrayName;
    for (let index = 0; index < arrtofor.length; index++) {
      if(arrtofor[index].code==code){
        return index;
      }
    }
  },
  //获取二维数组下标
  get_indexTwo:function(array,code1,code2){
    let arrtofor1=array;
    for (let i = 0; i < arrtofor1[0].length; i++) {
      for (let j = 0; j < arrtofor1[1].length; j++) {
        if(arrtofor1[0][i].code==code1&&arrtofor1[1][j].code==code2){
          return [i,j];
        }
      } 
    }
  },
  judgeZK:function (tel,CardNo) { //判断租客电话是否被占用
    let _this = this;
    if(!tel){
      tel = 'tel';
    }
    if(!CardNo){
      CardNo = 'CardNo';
    }
    var _data = {ac: 'judgeZK_tel',"tel":tel,"CardNo":CardNo};
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
              disableT:"",
              tel:"",
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
  judgeTZR:function (tel,CardNo,nowIdx_t) { //判断租客电话是否被占用
    let _this = this;
    if(!tel){
      tel = 'tel';
    }
    if(!CardNo){
      CardNo = 'CardNo';
    }
    var _data = {ac: 'judgeZK_tel',"tel":tel,"CardNo":CardNo};
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
          var oldVal_t2=_this.data.telVal;
          oldVal_t2[nowIdx_t]="";
          setTimeout(function () {
            _this.setData({
              telVal:oldVal_t2
            })
          }, 1000);
        }
        else{
          var oldVal_t2=_this.data.telVal;
          oldVal_t2[nowIdx_t]=tel;
          _this.setData({
            telVal:oldVal_t2
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
  get_sbInfo:function (dsn,LX) { //获取水表详情
    let _this = this;
    var _data = {ac: 'get_deviceInfo',"dsn":dsn,"LX":LX};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          sbly = units[0].ptlx;
          if(sbly=="fd"){
            _this.get_sbds(dsn); ////获取水表底数
          }
        }
      },
      fail(res) {
      },
      complete(){
      }
    });
  },
  get_dbInfo:function (dsn,LX) { //获取电表详情
    let _this = this;
    var _data = {ac: 'get_deviceInfo',"dsn":dsn,"LX":LX};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          dbly = units[0].ptlx;
          let lylx = units[0].lx;
          let ptlx = units[0].ptlx;
          let collectorSn = units[0].collectorSn;
          if(dbly=="fd"){
            _this.get_dbds(dsn); ////获取电表底数
          }
          if(lylx=="3"){
            _this.QC_meterReading(dsn,ptlx,collectorSn); //获取电表底数
          }
        }
      },
      fail(res) {
      },
      complete(){
      }
    });
  },
  get_sbds:function(devid){  //获取水表底数
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
        let sbpower = _res.Data[0].Expand.allpower; //水表底数
        let index_sb = 0;
        that.setData({
          sbds:sbpower,
          //['roomdata['+index_sb+'].minimum']:sbpower,
        })
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
  get_dbds:function(devid){  //获取电表底数
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
        let dbpower = _res.Data[0].Expand.allpower; //电表底数
        let index_db =1;
        that.setData({
          dbds:dbpower,
          //['roomdata['+index_db+'].minimum']:dbpower,
        })
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
  QC_meterReading:function(dbsbh,ptlx,collectorSn){  //QC查询读数
    var that = this;
    let jk = ""; //接口
    if(ptlx == "485"){  //485
      jk = '/qc/am/485/read';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/read';
    }else if(ptlx == "4G"){  //4G
      jk = '/qc/am/4g/read';
    }
    var _data = '{"comAddr":"'+dbsbh+'","concentratorAddr":"'+collectorSn+'"}'
    wx.request({
     url: apiDB+jk,  //水电表指令的api
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(!!_res.success){
        var totalEnergy = _res.data[0].totalEnergy;
        var dqds = ""+totalEnergy*1;
        let index_db =1;
        that.setData({
          dbds:dqds,
          //['roomdata['+index_db+'].minimum']:dqds,
        })
      }
     },
     fail(res) {
     },
     complete(){
     }
   });
  },
  formSubmit: function (e){  //保存数据
    var that = this;
    var hid = e.detail.value.hid;
    var name = e.detail.value.name;
    var tel = e.detail.value.tel;
    var cardNo = e.detail.value.cardNo;
    var remark = e.detail.value.remark;
    var Sdate = e.detail.value.startDate;
    var Edate = e.detail.value.endDate;
    var yj = e.detail.value.yj;
    var rent = e.detail.value.rent;
    var rent_unit = e.detail.value.rent_unit;
    var szDate = e.detail.value.szDate;
    var szrq = e.detail.value.szrq;
    var sex = e.detail.value.sex;
    var cardType = e.detail.value.cardType;
    var cycle = e.detail.value.cycle;

    //var zfsj = e.detail.value.zfsj;
    //var zfsj = [1001,1002];
    var fkfs = e.detail.value.fkfs;
    //var tqlx = zfsj.substring(zfsj.indexOf("[")+1,zfsj.indexOf(","));
    //var days = zfsj.substring(zfsj.indexOf(",")+1,zfsj.indexOf("]"));
    var tqlx = "1001";
    var days = "1002";
    var fkfs_F = fkfs.substring(fkfs.indexOf("[")+1,fkfs.indexOf(","));
    var fkfs_Y = fkfs.substring(fkfs.indexOf(",")+1,fkfs.indexOf("]"));
    var ydlx = e.detail.value.ydlx;
    var hthNo = e.detail.value.hthNo;
    var zkly = e.detail.value.zkly;
    var isIn = e.detail.value.isIn;
    var gj = e.detail.value.gj;
    var zy = e.detail.value.zy;
    var gzdw = e.detail.value.gzdw;
    var lxrgx = e.detail.value.lxrgx;
    var lxrxm = e.detail.value.lxrxm;
    var lxrTel = e.detail.value.tel_lxr;
    var supplement = e.detail.value.supplement;
    var qyr = e.detail.value.qyr;
    var qyDate = e.detail.value.qyDate;
    var htlx = e.detail.value.htlx;
    var jgDate = e.detail.value.jgDate;
    var jgdz = e.detail.value.jgdz;
    var sfdj = e.detail.value.cWater_price;
    var dfdj = e.detail.value.ele_price;
    var sbds = e.detail.value.sbds;
    var dbds = e.detail.value.dbds;
    if(!sbds){ sbds = 0; }
    if(!dbds){ dbds = 0; }
    if(!sfdj){ sfdj = 0; }
    if(!dfdj){ dfdj = 0; }
    let szi1="";
    let szi2="";
    let fjV_total=0;
    for(let a of this.data.wpList){
      szi1+=a.gid+"|"
      szi2+=a.num+'|'
      fjV_total+=a.num*1
    }
    let gqN="";
    let gqV="";
    let gqV_total=0;
    for(let c of this.data.gqList){
      gqN+=c.gid+"|"
      gqV+=c.num+'|'
      gqV_total+=c.num*1
    }
    
    let fjsb="";
    let fjds="";
    let fjds_total=0;
    for(let b of this.data.roomdata){
      fjsb+=b.othername+"|"
      if(!b.minimum){
        fjds+=0+"|"
      }
      else{
        fjds+=b.minimum+"|"
        fjds_total+=b.minimum*1
      }
    }
    let gqsb="";
    let gqds="";
    let gqds_total=0;
    for(let c of this.data.publicdata){
      gqsb+=c.othername+"|"
      if(!c.minimum){
        gqds+=0+"|"
      }
      else{
        gqds+=c.minimum+"|"
        gqds_total+=c.minimum*1
      }
    }
    let jgTotal = fjV_total+gqV_total+fjds_total+gqds_total;
    if(!yj){ yj=0 }
    //if(!rent){ rent=0 }
    if(!szDate){ szDate = "" }
    if(!szrq){ szrq=1 }
    var eValue = e.detail.value;
    var mapValue = util.objToStrMap(eValue); //将value对象转为map
    var list = that.data.inputList;
    var fylist = that.data.fymxList;
    var mx_name = "";
    var mx_tel = "";
    var mx_zjlx = "";
    var mx_zjh = "";
    var mx_szlx = "";
    var mx_fymc = "";
    var mx_je = "";
    var mx_sex = "";
    var mx_gx = "";
    var mx_qx = "";
    for(var i = 1;i <= list.length;i++){
      var name_i = "name" + i;
      var tel_i = "tel" + i;
      var cardType_i = "cardType" + i;
      var cardNo_i = "cardNo" + i;
      var sex_i = "sexType" + i;
      var gx_i = "gxType" + i;
      var qx_i = "qxType" + i;

      var Tname = mapValue.get(name_i);
      var Ttel = mapValue.get(tel_i);
      var TcardType = mapValue.get(cardType_i);
      var TcardNo = mapValue.get(cardNo_i);
      var Tsex = mapValue.get(sex_i);
      var Tgx = mapValue.get(gx_i);
      var Tqx = mapValue.get(qx_i);
      if(!TcardType || TcardType==null){
        TcardType = "";
      }
      if(!Tsex || Tsex==null){
        Tsex = "M";
      }
      if(!Tgx || Tgx==null){
        Tgx = "1008";
      }
      if(!Tqx || Tqx==null){
        Tqx = "1001";
      }
      if(!Tname){
        Tname = ""
      }
      if(!TcardNo){
        TcardNo = ""
      }
      mx_name += Tname + "|";
      mx_tel += Ttel + "|";
      mx_zjlx += TcardType + "|";
      mx_zjh += TcardNo + "|";
      mx_sex += Tsex + "|";
      mx_gx += Tgx + "|";
      mx_qx += Tqx + "|";
    }
    for(var j = 1;j <= fylist.length;j++){
      var szlx_j = "szlx" + j;
      var fymc_j = "fymc" + j;
      var je_j = "je" + j;
      var Fszlx = mapValue.get(szlx_j);
      var Ffymc = mapValue.get(fymc_j);
      var Fje = mapValue.get(je_j);
      if(!Fszlx){
        Fszlx = "in";
      }
      if(!Ffymc){
        Ffymc = "";
      }
      mx_szlx += Fszlx + "|";
      mx_fymc += Ffymc + "|";
      mx_je += Fje + "|";
    }
    if(!rent){ 
      wx.showToast({
        title: '租金不能为空',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else if(!tel){
      wx.showToast({
        title: '联系方式不能为空',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else if(!cardNo){
      wx.showToast({
        title: '证件号码不能为空',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else if(!Sdate){
      wx.showToast({
        title: '开始时间不能为空',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    else if(!Edate){
      wx.showToast({
        title: '结束时间不能为空',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    var _data = {ac: 'checkIn_add',"contractNo":contractNo,"userid":userid,"hid":hid,"name":name,"tel":tel,"cardNo":cardNo,"remark":remark,"Sdate":Sdate,"Edate":Edate,"yj":yj,"rent":rent,"rent_unit":rent_unit,"szDate":szDate,"szrq":szrq,"cycle":cycle,"sex":sex,"cardType":cardType,"nameList":mx_name,"telList":mx_tel,"cardTypeList":mx_zjlx,"cardNoList":mx_zjh,"sexList":mx_sex,"szlxList":mx_szlx,"fymcList":mx_fymc,"jeList":mx_je,"reserveNo":reserveNo,"tqlx":tqlx,"days":days,"fkfs_F":fkfs_F,"fkfs_Y":fkfs_Y,"ydlx":ydlx,"hthNo":hthNo,"zkly":zkly,"isIn":isIn,"gj":gj,"zy":zy,"gzdw":gzdw,"lxrgx":lxrgx,"lxrxm":lxrxm,"lxrTel":lxrTel,"supplement":supplement,"qyr":qyr,"qyDate":qyDate,"htlx":htlx,"gid":szi1,"gnum":szi2,"GQgid":gqN,"GQgnum":gqV,"fjsb":fjsb,"fjds":fjds,"gqsb":gqsb,"gqds":gqds,"jgDate":jgDate,"jgTotal":jgTotal,"gxList":mx_gx,"qxList":mx_qx,"signing":signing,"jgdz":jgdz,"sfdj":sfdj,"dfdj":dfdj,"sbds":sbds,"dbds":dbds};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=='1'){
          if(!!dbsbh && dbly=="fd"){
            that.stayroom(dbsbh,name,tel,Sdate,Edate,'db');//调用水电表入住
          }
          if(!!sbsbh && sbly=="fd"){
            that.stayroom(sbsbh,name,tel,Sdate,Edate,'sb');//调用水电表入住
          }
          var hth = res.data.contractNo;
          contractNo = res.data.contractNo;
            that.setData({
              htNo:hth
            })
            let length = that.data.imgs.length;
            if(length>0){
              that.uploadImg(contractNo);//上传照片    
            }      
            setTimeout(()=>{
              /*
              that.setData({
                ifName: true,    //显示弹出框
              });*/
              wx.navigateTo({
                url: '../../../pagesB/pages/zdyl_list/zdyl_list?contractNo='+contractNo
              })
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
  cancel: function (e) {  //取消
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    }); 
    setTimeout(function() {
      wx.navigateBack({
        delta: 1,
      })
    }, 1000)
  },
  confirm: function (e) {  //确定
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    }); 
    setTimeout(function() {
      wx.navigateBack({
        delta: 1,
      })
    }, 1000)
  },
  sbdschange:function(e){
    var sbminimum;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      sbminimum = e.detail.value;
    } else {
      wx.showToast({
        title: '读数只留2位小数',
        icon: "none",
        duration: 1000
      })
      sbminimum = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    let index_sb2 =0;
    this.setData({
      sbds:sbminimum,
      ['roomdata['+index_sb2+'].minimum']:sbminimum,
    })
  },
  dbdschange:function(e){
    var dbminimum;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      dbminimum = e.detail.value;
    } else {
      wx.showToast({
        title: '读数只留2位小数',
        icon: "none",
        duration: 1000
      })
      dbminimum = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    let index_db2 =1;
    this.setData({
      dbds:dbminimum,
      ['roomdata['+index_db2+'].minimum']:dbminimum,
    })
  },
  cWaterChange:function(e){
    var sfminimum;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      sfminimum = e.detail.value;
    } else {
      wx.showToast({
        title: '水费只留2位小数',
        icon: "none",
        duration: 1000
      })
      sfminimum = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      cWater_price:sfminimum
    })
  },
  eleChange:function(e){
    var dfminimum;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      dfminimum = e.detail.value;
    } else {
      wx.showToast({
        title: '水费只留2位小数',
        icon: "none",
        duration: 1000
      })
      dfminimum = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      ele_price:dfminimum
    })
  },
  stayroom: function(sdsbh,name,phone,Indate,Outdate,sblx) {  //办理入住
    let staymode = 0;
    let jk = "";
    if(sblx=="sb"){
      jk = 'wm/stayroom';
    }
    else if(sblx=="db"){
      jk = 'em/stayroom';
    }
    var _data = '{ac: "stayroom","deviceId":"'+sdsbh+'","name":"'+name+'","phone":"'+phone+'","checkindate":"'+Indate+'","checkoutdate":"'+Outdate+'","staymode":"'+staymode+'"}'
    wx.request({
     url: aiotAPI+jk,  //水电表指令的api
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(_res.Code == 0 ){
        console.log("水电表入住成功");
      }
      else{
        console.log("水电表入住失败");
      }
     },
     fail(res) {
     },
     complete(){
     }
   });
  },
  // 上传图片
  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    if (imgs.length >= 12) {
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
        title: '最多只能选择12张图片',
      })
      return false;
    }
    wx.chooseImage({
      count: that.data.countNum, // 默认12
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var imgs = that.data.imgs;
        var imgUrlArr = that.data.imgUrlArr;
        for (var i = 0; i < tempFilePaths.length; i++) {
          if (imgs.length >= 12) {
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
          countNum: 12 - imgs.length
        });
        if(imgs.length>=12){
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
      countNum: 12 - imgsLen
    });
    if(imgsLen>=12){
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
  uploadImg :function(contractNo){
    var that = this;
    let i = 0;
    let length = this.data.imgs.length;
    that.upLoadPhoto(contractNo,i,length);
  },
  upLoadPhoto :function(contractNo,i,length){  //上传图片至服务器
    var that = this;
    var _data = {ac: "Upload","tbName":"IB_contract","zd":"contractNo","keyV":contractNo};
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
          that.upLoadPhoto(contractNo,i,length);
        }
      } 
    })
  },
  onShow: function () { //生命周期函数--监听页面显示
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    let yd_n = currPage.data.mydata.yd;
    if(!!yd_n){
      reserveNo = yd_n;
      this.reserve_info(reserveNo);  //获取预定信息
      this.setData({
        ydNo: reserveNo
      })
    }
    /*
    if(!!reserveNo){
      this.reserve_info(reserveNo);  //获取预定信息
      this.setData({
        ydNo: reserveNo
      })
    }*/
    /*
    var app = getApp();
    var remark_new=app.globalData.blrz_remark; 
    this.setData({
      remark:remark_new
   })
   */
  },
  onHide: function () { //生命周期函数--监听页面隐藏
  },
  onUnload: function () { //生命周期函数--监听页面卸载
  },
  onPullDownRefresh: function () { //页面相关事件处理函数--监听用户下拉动作
  },
  onReachBottom: function () { //页面上拉触底事件的处理函数
  },
  onShareAppMessage: function () { //用户点击右上角分享
    return {
      //title: '朗思租客端',
      //path:'../../../pagesB/pages/forward_info/forward_info?LY=ZK&dsn='+dsn,
      //imageUrl:'../../../static/images/tenantQR.jpg',
      path: '../../../pagesB/pages/rztx_info/rztx_info?contractNo='+contractNo,
      success: function (res) {
        console.log("分享成功",res);// 分享成功
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        })
      },
      fail: function (res) {
        console.log("分享失败",res);// 转发失败
      }
    }
  }
})