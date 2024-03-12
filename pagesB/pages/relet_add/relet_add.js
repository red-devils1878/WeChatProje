var util = require('../../../utils/util.js');
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档
var com = require('../../../utils/commom.js');  //公共js
var contractNo = "" //合同号
var ts = "";
var maxIndex=0;
var FYmaxIndex=0;
var userid= "";  //登陆人工号
var Sd = "";//开始时间
var Ed = "";//结束时间
var fkfsY = "2";//付款方式押
var depositT = 0;//租金
var cycleQJ = []; //出租时长数组
var lxrgxQJ = []; //关系数组
var zfsjQJ = []; 
var fkfsQJ = []; 
var zjdwQJ = []; 
var zklyQJ = []; 
var htlxQJ = []; 
var dsn= "";  //设备号
var lylx= "";  //设备来源
var ptlx= "hongqi";
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
var index_del = 0;  //新下标(删除)
var index_add = 0;  //新下标(下发)
var PID = "";  //附件id
Page({

  data: {  //页面的初始数据
    servicelist:[], //服务集市列表
    unitIndex: 0,
    cycleIndex: 0,
    zklyIndex: 0,
    htNo:'',
    winWidth: 0,
    winHeight: 0,
    remark:'',
    index:0,
    maxIndex:0,
    master:false,  //主档
    detail_fymx:true, //费用明细
    fylxIndex: 0,
    FYmaxIndex:0,
    fymxList:  [{}],  //费用明细列表
    fyVal:[], //所有input的内容(费用名称)
    jeVal:[], //所有input的内容(金额)
    navH:0,
    bindTap:"getBack", //返回上一页
    title:'续租合同',
    multiIndex: [0, 0],
    fkfsIndex: [2, 2],
    detail_more:true, //更多信息
    detail_bz:true, //备注
    detail_jjlxr:true, //紧急联系人
    detail_qyxx:true, //签约信息
    lxrgxIndex: 0, //紧急联系人
    htlxIndex: 0, //合同类型
    cheack:false,
    yj_dis: true,  //押金只读
    showMB:true, //幕布
    AllPwdlist:[],  //所有密码和指纹
    pwdlist:[],  //密码
    second: 30, //倒计时20秒
    c:"",//定时器
    imgs:[],
    showView:false,
    img_qty:0
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    var that = this;
    contractNo = options.contractNo;
    //contractNo = "Cont2302170706" //合同号
    ts = "ts";
    apiUrl = app.globalData.apiUrl;
    apiNC = app.globalData.apiNC;
    userid = app.globalData.userid;   //登陆人工号
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
    this.get_zfsj(ts);  //获取支付时间
    this.get_fkfs();  //获取付款方式
    this.get_rentUnit();  //获取租金单位
    this.get_rentCycle();  //获取收租周期
    this.get_fylx();  //获取费用类型
    this.get_zkly();  //获取租客来源
    this.get_jjlxrlx();  //获取紧急联系人类型
    this.get_htlx();  //合同类型
    this.contract_info(contractNo);  //获取续租信息   
  },
  tapRZ: function(e) {
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let  hth= e.currentTarget.dataset.key;
    let  remark= e.currentTarget.dataset.val;
    let url = "";
    if( index == '1' ){
      _this.setData({
        master:true,  //主档
        detail_fymx:false, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_qyxx:true, //签约信息
        bindTap:"showMaster",
        title:'费用明细',
     })
     _this.show_fymx();  //显示
    } else if(index == '6') {
      _this.setData({
        master:true,  //主档
        detail_fymx:true, //费用明细
        detail_more:false, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_qyxx:true, //签约信息
        bindTap:"showMaster",
        title:'入住人',
     })
    }  else if(index == '2') {
      _this.setData({
        master:true,  //主档
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:false, //备注
        detail_jjlxr:true, //紧急联系人
        detail_qyxx:true, //签约信息
        bindTap:"showMaster",
        title:'备注',
     })
    } else if(index == '3') {
      url = '../../../pagesB/pages/roommate/roommate?hth='+hth;
    }else if(index == '4') {
      _this.setData({
        master:true,  //主档
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:false, //紧急联系人
        detail_qyxx:true, //签约信息
        bindTap:"showMaster",
        title:'紧急联系人',
     })
    } else if(index == '5') {
      _this.setData({
        master:true,  //主档
        detail_fymx:true, //费用明细
        detail_more:true, //更多信息
        detail_bz:true, //备注
        detail_jjlxr:true, //紧急联系人
        detail_qyxx:false, //签约信息
        bindTap:"showMaster",
        title:'签约信息',
     })
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
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
              unit:units
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
          },10)
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
          },10)
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
          zklyQJ = units;
          setTimeout(()=>{
            _this.setData({
              zkly:units
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
          },10)
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
          },10)
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
          },10)
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
          htlxQJ = units;
          setTimeout(()=>{
            _this.setData({
              htlx:units
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
  startDateChange: function(e) {  //开始时间
    Sd = e.detail.value;
    this.setData({
      Sdate: e.detail.value
    })
  },
  endDateChange: function(e) {  //结束时间
    let Ed2 = e.detail.value;
    let Sdate=new Date(Sd);
    let Edate=new Date(Ed2);
    if(Sdate > Edate){
      wx.showToast({
        title: "结束日期不能早于起租日期",
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
      detail_fymx:true, //费用明细
      detail_more:true, //更多信息
      detail_bz:true, //备注
      detail_jjlxr:true, //紧急联系人
      detail_qyxx:true, //签约信息
      bindTap:"getBack",
      title:'续租合同',
   })
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
    //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
    fymxList.splice(index-1, 1)
    //更新列表
    that.setData({
      fymxList,
      jeVal: oldJEVal,
      fyVal: oldFYVal,
    })
  },
  //隐藏费用明细列表
  hiddenFY:function (){
    var _this = this;
    _this.setData({
      master:false,  //主档
      detail_tzr:true, //同住人
      detail_fymx:true, //费用明细
      title:'续租合同'
   })
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
      detail_qyxx:true, //签约信息
      title:'续租合同'
   })
  },
  set_yj:function(fkfsY,depositT){  //计算押金
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
  contract_info:function (contractNo) { //获取续租详情
    let _this = this;
    var _data = {ac: 'checkIn_info',"contractNo":contractNo};
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
          Ed = units[0].outTime2;
          let check1 = "";
          let check3 = "";
          let check6 = "";
          let check12 = "";
          if(zqnx=="1001"){ check1 = "true"; }
          else if(zqnx=="1002"){ check3 = "true"; }
          else if(zqnx=="1003"){ check6 = "true"; }
          else if(zqnx=="1004"){ check12 = "true"; }
          let fileid = units[0].fileid;
          _this.get_Photo(fileid);  //获取照片
          _this.setData({
            hid:units[0].roomId,
            houseName:units[0].houseName,   
            Sdate:units[0].inTime2,
            Edate:units[0].outTime2,
            rent:units[0].deposit_total,
            deposit:units[0].deposit,
            QYdate:units[0].contractTime2,
            lxrxm:units[0].urgent,
            tel_lxr:units[0].mobileNumber,
            check1:check1,
            check3:check3,
            check6:check6,
            check12:check12,
            htNo:units[0].contractNo,
            cWater_price:units[0].cWater_price,
            ele_price:units[0].ele_price,
            sbds:units[0].sbds,
            dbds:units[0].dbds,
          })
          setTimeout(()=>{
            _this.setData({
              cycleIndex:_this.get_indexYW(cycleQJ,units[0].rentType),
              lxrgxIndex:_this.get_indexYW(lxrgxQJ,units[0].relationship), 
              unitIndex:_this.get_indexYW(zjdwQJ,units[0].rent_unit),  
              zklyIndex:_this.get_indexYW(zklyQJ,units[0].tenantSource), 
              htlxIndex:_this.get_indexYW(htlxQJ,units[0].contractType),          
              fkfsIndex:_this.get_indexTwo(fkfsQJ,units[0].fkfs_F,units[0].fkfs_Y),
              multiIndex:_this.get_indexTwo(zfsjQJ,units[0].tqlx,units[0].days),
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
  //合同预览
  htyl:function(){
    wx.navigateTo({
      url: '../../../pagesB/pages/report_zk/report_zk?djly=htyl&contractNo='+contractNo
    })
  },
  formSubmit: function (e){  //保存数据
    var that = this;
    var hid = e.detail.value.hid;
    var remark = e.detail.value.remark;
    var Edate = e.detail.value.endDate;
    var yj = e.detail.value.yj;
    var rent = e.detail.value.rent;
    var cycle = e.detail.value.cycle;
    //var zfsj = e.detail.value.zfsj;
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
    var lxrgx = e.detail.value.lxrgx;
    var lxrxm = e.detail.value.lxrxm;
    var lxrTel = e.detail.value.tel_lxr;
    var supplement = e.detail.value.supplement;
    var qyr = e.detail.value.qyr;
    var qyDate = e.detail.value.qyDate;
    var htlx = e.detail.value.htlx;
    var isIn = e.detail.value.isIn;
    var sfdj = e.detail.value.cWater_price;
    var dfdj = e.detail.value.ele_price;
    var sbds = e.detail.value.sbds;
    var dbds = e.detail.value.dbds;
    if(!sbds){ sbds = 0; }
    if(!dbds){ dbds = 0; }
    if(!sfdj){ sfdj = 0; }
    if(!dfdj){ dfdj = 0; }   
    if(!yj){ yj=0 }
    var eValue = e.detail.value;
    var mapValue = util.objToStrMap(eValue); //将value对象转为map
    var fylist = that.data.fymxList;
    var mx_szlx = "";
    var mx_fymc = "";
    var mx_je = "";
    for(var j = 1;j <= fylist.length;j++){
      var fymc_j = "fymc" + j;
      var je_j = "je" + j;
      var Ffymc = mapValue.get(fymc_j);
      var Fje = mapValue.get(je_j);
      var Fszlx = "in";
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
    that.setData({
      Erent_date2:Edate,
    })
    var _data = {ac: 'relet_add',"contractNo":contractNo,"userid":userid,"hid":hid,"remark":remark,"Edate":Edate,"yj":yj,"rent":rent,"cycle":cycle,"szlxList":mx_szlx,"fymcList":mx_fymc,"jeList":mx_je,"tqlx":tqlx,"days":days,"fkfs_F":fkfs_F,"fkfs_Y":fkfs_Y,"ydlx":ydlx,"hthNo":hthNo,"zkly":zkly,"lxrgx":lxrgx,"lxrxm":lxrxm,"lxrTel":lxrTel,"supplement":supplement,"qyr":qyr,"qyDate":qyDate,"htlx":htlx,"isIn":isIn,"sfdj":sfdj,"dfdj":dfdj,"sbds":sbds,"dbds":dbds};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=='1'){
          /* 
          wx.showToast({
            title: '保存成功',
            icon: "success",
            duration: 1000
          })*/   
          /*
            setTimeout(()=>{         
              //that.setData({
                //ifName: true,    //显示弹出框
              //});
              wx.navigateTo({
                url: '../../../pagesB/pages/zdyl_list/zdyl_list?contractNo='+contractNo
              })
            },100)
          */
         that.get_macToMS(hid); //获取门锁
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
    this.setData({
      sbds:sbminimum
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
    this.setData({
      dbds:dbminimum
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
  get_macToMS:function(hid){
    let _this = this;
    var _data = {ac: 'get_macToMS',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          dsn = units[0].equip_no;
          lylx = units[0].lx;
          _this.get_mssjToPwd(); //获取门锁的所有密码用户
          _this.mssj_listXZ(dsn,lylx);  //获取门锁数据      
        }
        else{
          wx.navigateTo({
            url: '../../../pagesB/pages/zdyl_list/zdyl_list?contractNo='+contractNo
          })
        }
      },
      fail(res) {
      },
     complete(){
     }
    }); 
  },
  get_mssjToPwd:function () { //获取门锁的所有密码用户
    let _this = this;
    var _data = {ac: 'get_mssjToPwd',"dsn":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          _this.setData({
            pwdlist:units
          })
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  mssj_listXZ: function(dsn,lylx) { //获取门锁数据
    var that = this;
    var _data = {ac: 'mssj_list',"dsn":dsn,"search":""};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let ljzt = false;//连接状态
          if(lylx=="1"){
            ljzt = BLE.authState();//连接状态
          }
          else if(lylx=="2"){
            ljzt = BLE_new.connectionState();//连接状态  
          }
          that.setData({
            showMB:false,  //显示幕布
            AllPwdlist:units,
            second: 60,  //初始化成40秒
          })
          that.countdown(); //调用计时器
          if(lylx == "1"){  //旧锁
            wx.showToast({
              title: '旧锁远程删除方法',
              icon: 'none'
            })
            that.setData({
              showMB:true,  //隐藏幕布
            })   
          }
          else if(lylx == "2"){  //新锁
            wx.showLoading({
              title: '密码删除中...',
            })
            if(ljzt){  //蓝牙连接中
              setTimeout(function () { 
                index_del = 0;  //初始化成0
                index_add = 0;  //初始化成0
                that.BLEXZpassword_delN(0); //续租前删除密码(蓝牙删除)
              },1000);  
            }
            else{
              com.get_Connection(dsn,function(res){
                let conStatus = res;
                console.log("网关蓝牙连接返回："+conStatus);
                if(!conStatus){
                  wx.hideLoading();  //关闭提示框
                  that.setData({
                    showMB:true,  //显示幕布
                  })              
                  return;
                } 
                setTimeout(function () {
                  index_del = 0;  //初始化成0
                  index_add = 0;  //初始化成0  
                  that.XZpassword_delN(0); //续租前删除密码   
                },1000);          
              });
            }
          }else if(lylx == "5" || lylx == "6" || lylx == "20" || lylx == "21"){  //国民NB锁或同欣433
            wx.showLoading({
              title: '密码删除中...',
            })
            if(ljzt){  //蓝牙连接中
              /*
              setTimeout(function () {  
                index_del = 0;  //初始化成0
                index_add = 0;  //初始化成0
                that.BLEXZpassword_delGM(0); //续租前删除密码(蓝牙删除)
              },1000);
              */
            }
            else{  
              index_del = 0;  //初始化成0
              index_add = 0;  //初始化成0
              that.XZpassword_delGM(0); //续租前删除密码(国民)                           
            }
          }
        }
        else{  //没有密码直接跳转到账单
          wx.navigateTo({
            url: '../../../pagesB/pages/zdyl_list/zdyl_list?contractNo='+contractNo
          })
        }
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
  XZpassword_delN: function(ind) {
    var that = this;
    let AllPwdlist = this.data.AllPwdlist;
    let yhbh = AllPwdlist[ind].yhbh;
    let lx = AllPwdlist[ind].lx;
    let pwd_old = AllPwdlist[ind].password;
    let yhlx = AllPwdlist[ind].yhlx;
    var _dataNC = "";
    var del_fz = "";
    if(yhlx=="03"){  //离线密码
      //del_fz = "delete_offline_password";
      //_dataNC = '{ac: "delete_offline_password","deviceid":"'+dsn+'","password":"'+pwd_old+'","channel":"21"}'
      index_del+=1//删除下标加一
      that.XZpassword_delN(index_del); //执行删除
    }
    else{
      del_fz = "deletepassword";
      _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
    }
    wx.request({
      url: apiNC+del_fz,  //api地址
      data: _dataNC,
      header: {'content-type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: '删除失败',
            icon: "none",
            duration: 1000
          })
        }
        else{
          if(res.data.code == '0' || res.data.code == '40009'){
            if(lx=='01'){  //指纹
              that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
            }
            else if(lx=='03'){ //密码
              that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');               
            }               
            if(index_del==((AllPwdlist.length)*1-1)){
              wx.hideLoading();  //关闭提示框
              setTimeout(function () {
                wx.showLoading({
                  title: '密码下发中...',
                })
                that.password_insertN(0);  //下发密码 
              },1000);           
            }else{
              index_del+=1//删除下标加一
              that.XZpassword_delN(index_del); //执行删除
            }
          }
          else if(res.data.code=='10010' || res.data.code=='-1'){                       
            that.XZpassword_delN(index_del); //执行删除
          }
          else{
            console.log("code:"+res.data.code+">>msg:"+res.data.msg);
            wx.hideLoading();  //关闭提示框
            wx.showToast({
              title: '删除失败',
              icon: "error",
              duration: 1000
            })          
          }     
        }
      },
      fail(res) {
        wx.showToast({
          title: '删除失败',
          icon: "error",
          duration: 1000
        })
      },
      complete(){
        //wx.hideLoading();  //关闭提示框
      }
    });
  },
  password_insertN:function (index_add) {   //下发密码
    var that = this;
    let pwdlist = this.data.pwdlist;
    var useType = "02"; //普通用户
    let Stime = pwdlist[index_add].kssj;
    var Etime = that.data.Erent_date2;
    let newPwd = pwdlist[index_add].password;
    let renterid = pwdlist[index_add].renterid;
    let kslx = pwdlist[index_add].lx;
    let yhlx = pwdlist[index_add].yhlx;
    if(!Stime){
      Stime = '1900-01-01 00:00:00';
    }
    else{
      Stime = Stime+':00';
    }
    if(!Etime){
      Etime = '2999-12-30 23:59:00';
    }
    else{
      Etime = Etime+' 23:59:00';
    }
    let jk = "";//接口    
    var _dataNC = "";
    if(yhlx=="03"){  //离线密码
      index_add+=1//下发下标加一
      that.password_insertN(index_add);
    }
    else{
      jk = 'lockauth';
      _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","password":"'+newPwd+'","usertype":"'+useType+'","begindate":"'+Stime+'","enddate":"'+Etime+'","lx":"03","channel":"21"}'
    }
    wx.request({
      url: apiNC+jk,  //api地址
      data: _dataNC,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: '失败',
            icon: "none",
            duration: 1000
          })
        }
        else{
          if(res.data.code=='0'){
            console.log("返回的code:"+res.data.code);
            that.insertLog_LS(userid,'',dsn,'下发','普通用户',newPwd,'朗思管理端');
            that.update_pwdRenter(dsn,newPwd,renterid,kslx);  //更新密码所有人
            if(index_add==pwdlist.length-1){
              com.break_link(dsn); //断开连接
              clearInterval(that.data.c);//清除定时器
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //隐藏幕布
              })
              wx.navigateTo({
                url: '../../../pagesB/pages/zdyl_list/zdyl_list?contractNo='+contractNo
              })             
            }else{
              index_add+=1//下发下标加一
              setTimeout(function () {
                that.password_insertN(index_add);
              },2000);  
            }
          }
          else if(res.data.code=='10010'){               
            that.password_insertN(index_add);//再次执行
          }
          else{
            clearInterval(that.data.c);//清除定时器
            wx.hideLoading();  //关闭提示框
            that.setData({
              showMB:true,  //隐藏幕布
            })           
            wx.showToast({
              title: '新增用户失败',
              icon: "error",
              duration: 1000
            })                              
          }
        }        
      },
      fail(res) {
        wx.showToast({
          title: '新增用户失败',
          icon: "error",
          duration: 1000
        })
      },
      complete(){
      }
    });
  },
  BLEXZpassword_delN: function(ind) {
    var that = this;
    let AllPwdlist = this.data.AllPwdlist;
    let yhbh = AllPwdlist[ind].yhbh;
    let lx = AllPwdlist[ind].lx;
    let pwd_old = AllPwdlist[ind].password;
    var xfbs_del='下发中';
    var hardwareNumber = parseInt(yhbh, 10);  //用户编号
    var unlockModeEnum = 1;
    if(lx=='01'){  //指纹
      unlockModeEnum = 3; //代表密码，3代表指纹
    }
    else if(lx=='03'){ //密码
      unlockModeEnum = 1;
    }    
    var _data2 = {
      "deviceSn":dsn,
      "cmd":"0302",
      "syncNo":"0",
      "cloudUnlockBO":{
      "unlockModeEnum":unlockModeEnum,
      "registerStatusEnum":"START",
      "effectiveNum":0,
      "memberTypeEnum":"NORMAL", //NORMAL是普通用户，ADMIN是管理员
      "hardwareNumber":hardwareNumber,
      "menberId":2, //2是普通用户，1是管理员
      "isOpenCycle":0,
      "loopType":"LOOP_NOT",
      "loopFlag":"00000000",
      "password":'',
      "startTime":'',
      "endTime":''
      }
    };
    wx.request({
      url: apiNC+'cloud_function',
      data: _data2,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      dataType: 'application/json',
      async:false,  //同步                            
      success(res) {
        let _res = JSON.parse(res.data);                  
        var cmd2 = _res.data; 
        BLE_new.sendCommand(cmd2,function(res){
          if(res.errCode==0){
            var _data4 = {"deviceSn":dsn,"data":res.data};
            wx.request({
              url: apiNC+'cloud_function_parse',
              data: _data4,
              header: {'Content-Type': 'application/json'},
              method: "POST",
              dataType: 'application/json',
              async:false,  //同步           
              success(res) {
                let _res = JSON.parse(res.data);
                if( _res.code == 0 ){
                  console.log("删除下发标识："+xfbs_del);
                  if(xfbs_del =='已完成'){
                    return;
                  }
                  else{
                    xfbs_del='已完成';
                    that.del_Rh_yhb(dsn,yhbh,lx);//删除门锁用户
                    if(lx=='01'){  //指纹
                      that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                    }
                    else if(lx=='03'){ //密码
                      that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                    }
                    if(index_del==AllPwdlist.length-1){
                      wx.hideLoading();  //关闭提示框
                      setTimeout(function () {
                        wx.showLoading({
                          title: '密码下发中...',
                        })
                        that.BLEpassword_insertN(0);  //下发密码 
                      },1000);           
                    }else{
                      index_del+=1//删除下标加一
                      that.BLEXZpassword_delN(index_del); //执行删除
                    }
                  }                      
                }
                else{       
                  wx.showToast({
                    title: '删除用户失败',
                    icon: "error",
                    duration: 1000
                  })
                  xfbs_del='已完成';
                  console.log(_res.code+'——>>'+_res.msg);                    
                }
              },
              fail(res) {  
                xfbs_del='已完成';
              },
              complete(){
              }
            });                    
          }
        });     
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  BLEpassword_insertN:function (index_add) {   //下发密码
    var that = this;
    let pwdlist = this.data.pwdlist;
    var useType = "02"; //普通用户
    let Stime = pwdlist[index_add].kssj;
    var Etime = that.data.Erent_date2;
    let newPwd = pwdlist[index_add].password;
    let renterid = pwdlist[index_add].renterid;
    let kslx = pwdlist[index_add].lx;
    var Stime_BLE = "";
    var Etime_BLE = "";
    if(!Stime){
      Stime = '1900-01-01 00:00:00';
      Stime_BLE = "1900-01-01 00:00";  //新锁蓝牙开门时间
    }
    else{
      Stime_BLE = Stime; //新锁蓝牙开门时间
      Stime = Stime+':00';
    }
    if(!Etime){
      Etime = '2999-12-30 23:59:00';
      Etime_BLE = "2999-12-30 23:59";  //新锁蓝牙开门时间
    }
    else{
      Etime_BLE = Etime+' 23:59'; //新锁蓝牙开门时间
      Etime = Etime+' 23:59:00';
    }
    var Stime_b = Stime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
    var Etime_b = Etime.replace(/:/g, "").replace(/-/g,"").replace(" ",""); //替换符号
    var Stime_b = Stime_b.substr(2,12); //截取字符串如20211231173000截取成211231173000
    var Etime_b = Etime_b.substr(2,12);
    var _data2 = {
      "deviceSn":dsn,
      "cmd":"0301",
      "syncNo":"0",
      "cloudUnlockBO":{
       "unlockModeEnum":1,
       "registerStatusEnum":"START",
       "effectiveNum":0,
       "memberTypeEnum":"NORMAL", //NORMAL是普通用户，ADMIN是管理员
       "hardwareNumber":0,
       "menberId":2, //2是普通用户，1是管理员
       "isOpenCycle":0,
       "loopType":"LOOP_NOT",
       "loopFlag":"00000000",
       "password":newPwd,
       "startTime":Stime_BLE,
       "endTime":Etime_BLE
       }
      };
      wx.request({
        url: apiNC+'cloud_function',
        data: _data2,
        header: {'Content-Type': 'application/json'},
        method: "POST",
        dataType: 'application/json',
        async:false,  //同步                            
        success(res) {
          let _res = JSON.parse(res.data);                  
          var cmd2 = _res.data; 
          //第二次写入指令
          BLE_new.sendCommand(cmd2,function(res){
            if(res.errCode==0){
              var _data4 = {"deviceSn":dsn,"data":res.data};
              wx.request({
                url: apiNC+'cloud_function_parse',
                data: _data4,
                header: {'Content-Type': 'application/json'},
                method: "POST",
                dataType: 'application/json',
                async:false,  //同步           
                success(res) {
                  let _res = JSON.parse(res.data);
                  if( _res.code == 0 ){                                                         
                    var yhbh = _res.data.hardwareNumber;
                    if(yhbh < 10){
                      yhbh = '00'+yhbh
                    }
                    else{
                      yhbh = '0'+yhbh
                    }
                    if(xfbs=='已完成'){
                      return;
                    }
                    else{
                      xfbs='已完成';
                      that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                      that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,Stime_b,Etime_b);//插入门锁用户表
                      that.update_pwdRenter(dsn,newPwd,renterid,kslx);  //更新密码所有人
                    }
                    if(index_add==pwdlist.length-1){
                      clearInterval(that.data.c);//清除定时器
                      wx.hideLoading();  //关闭提示框
                      that.setData({
                        showMB:true,  //隐藏幕布
                      })
                      wx.navigateTo({
                        url: '../../../pagesB/pages/zdyl_list/zdyl_list?contractNo='+contractNo
                      })
                    }else{
                      index_add+=1//下发下标加一
                      setTimeout(function () {
                        that.BLEpassword_insertN(index_add);
                      },2000);  
                    }
                  }
                  else{   
                    xfbs='已完成';              
                    wx.showToast({
                      title: '新增用户失败',
                      icon: "error",
                      duration: 1000
                    })
                    console.log(res.data.code+'——>>'+res.data.msg);                    
                  }
                },
                fail(res) {
                  xfbs='已完成';
                },
                complete(){
                }
              });                    
            }
          }); 
        },
        fail(res) {
          xfbs='已完成';
          //console.log("getunits fail:",res);
        },
        complete(){
        }
      });
  },
  XZpassword_delGM: function(ind) {
    var that = this;
    let AllPwdlist = this.data.AllPwdlist;
    let yhbh = AllPwdlist[ind].yhbh;
    let lx = AllPwdlist[ind].lx;
    let pwd_old = AllPwdlist[ind].password;
    let yhlx = AllPwdlist[ind].yhlx;
    let jk = "";//接口    
    var _dataNC = "";
    if(yhlx=="03"){  //离线密码
      /*
      if(lylx == "5" || lylx == "6"){  //国民锁
        jk = 'gm_delete_offline_password';
        _dataNC = '{ac: "gm_delete_offline_password","deviceid":"'+dsn+'","password":"'+pwd_old+'","channel":"21"}'
      }else if(lylx == "20" || lylx == "21"){  //同欣锁
        jk = 'tx_delete_offline_password';
        _dataNC = '{ac: "tx_delete_offline_password","deviceid":"'+dsn+'","password":"'+pwd_old+'","channel":"21"}'
      }
      */
     index_del+=1//删除下标加一
     that.XZpassword_delGM(index_del); //执行删除
    }
    else{
      if(lylx == "5" || lylx == "6"){
        jk = 'gm_del_user';
      }else if(lylx == "20" || lylx == "21"){
        jk = 'tx_del_user';
      }
      _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
    } 
    wx.request({
      url: apiNC+jk,  //api地址
      data: _dataNC,
      header: {'content-type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: '删除失败',
            icon: "none",
            duration: 1000
          })
        }
        else{
          if(res.data.code == '0'){
            if(lx=='01'){  //指纹
              that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
            }
            else if(lx=='03'){ //密码
              that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
            } 
            if(index_del==((AllPwdlist.length)*1-1)){
              wx.hideLoading();  //关闭提示框
              setTimeout(function () {
                wx.showLoading({
                  title: '密码下发中...',
                })
                that.password_insertGM(0);  //下发密码 
              },1000);           
            }else{
              index_del+=1//删除下标加一
              that.XZpassword_delGM(index_del); //执行删除
            }            
          }
          else{
            console.log("code:"+res.data.code+">>msg:"+res.data.msg);
            wx.showToast({
              title: '删除失败',
              icon: "error",
              duration: 1000
            })        
          }    
        }
      },
      fail(res) {
        wx.showToast({
          title: '删除失败',
          icon: "error",
          duration: 1000
        })
      },
      complete(){
        //wx.hideLoading();  //关闭提示框
      }
    });
  },
  password_insertGM:function (index_add) {   //下发密码
    var that = this;
    let pwdlist = this.data.AllPwdlist;
    var useType = "02"; //普通用户
    let Stime = pwdlist[index_add].kssj;
    var Etime = that.data.Erent_date2;
    let newPwd = pwdlist[index_add].password;
    let userdata = pwdlist[index_add].userdata;
    let renterid = pwdlist[index_add].renterid;
    let kslx = pwdlist[index_add].lx;
    let yhlx = pwdlist[index_add].yhlx;
    if(!Stime){
      Stime = '1900-01-01 00:00:00';
    }
    else{
      Stime = Stime+':00';
    }
    if(!Etime){
      Etime = '2999-12-30 23:59:00';
    }
    else{
      Etime = Etime+' 23:59:00';
    }
    var _dataNC = '';
    let jk = ""; //接口
    if(yhlx=="03"){  //离线密码
      index_add+=1//下发下标加一
      that.password_insertGM(index_add); 
    }
    else{
      if(lylx == "5" || lylx == "6"){
        jk = 'gm_add_user';
      }else if(lylx == "20" || lylx == "21"){
        jk = 'tx_add_user';
      }
      if(kslx=="01"){ //指纹
        _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","userdata":"'+userdata+'","usertype":"'+useType+'","begindate":"'+Stime+'","enddate":"'+Etime+'","type":"01","channel":"21"}'
      }
      else if(kslx=="03"){ //密码
        _dataNC = '{ac: "lockauth","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","password":"'+newPwd+'","usertype":"'+useType+'","begindate":"'+Stime+'","enddate":"'+Etime+'","type":"03","channel":"21"}'
      }
    }
    wx.request({
      url: apiNC+jk,  //api地址
      data: _dataNC,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          console.log("失败");
        }
        else{
          if(res.data.code=='0'){
            if(kslx=='01'){  //指纹
              that.insertLog_LS(userid,'',dsn,'下发','指纹','','朗思管理端');
              that.update_pwdRenter(dsn,'',renterid,kslx);  //更新指纹所有人
            }
            else if(kslx=='03'){ //密码
              that.insertLog_LS(userid,'',dsn,'下发','普通用户',newPwd,'朗思管理端');
              that.update_pwdRenter(dsn,newPwd,renterid,kslx);  //更新密码所有人
            }
            if(index_add==pwdlist.length-1){
              clearInterval(that.data.c);//清除定时器
              wx.hideLoading();  //关闭提示框
              that.setData({
                showMB:true,  //隐藏幕布
              })
              wx.navigateTo({
                url: '../../../pagesB/pages/zdyl_list/zdyl_list?contractNo='+contractNo
              })
            }else{
              index_add+=1//下发下标加一
              setTimeout(function () {
                that.password_insertGM(index_add);
              },100);  
            }
          }
          else{         
            wx.showToast({
              title: '新增用户失败',
              icon: "error",
              duration: 1000
            })                              
          }
        }        
      },
      fail(res) {
        wx.showToast({
          title: '新增用户失败',
          icon: "error",
          duration: 1000
        })
      },
      complete(){
      }
    });
  },
  countdown: function () {
    var that = this;
    let second = that.data.second;
    clearInterval(this.data.c);//清除定时器
    that.data.c = setInterval(() => {//启动倒计时
      if(second == 0){
        clearInterval(this.data.c);//清除定时器
        wx.hideLoading();  //关闭提示框  
        that.setData({
          showMB:true,  //隐藏幕布
        });
        return;
      }
      else{
        second = second - 1;
      }
      that.setData({
        second: second
      });
    }, 1000);
  },
  del_Rh_yhb: function (dsn,yhbh,lx){  //删除门锁用户
    var that = this;
    var _data = {ac: 'yhb_del',"yhbh":yhbh,"dsn":dsn,"lx":lx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
 //插入下发日志
 insertLog_LS:function(wx_id,hid,sbh,czlx,Pwd_type,Pwd,xfly){
  var _data = {ac: 'operateLog_save',"wx_id":wx_id,"hid":hid,"sbh":sbh,"czlx":czlx,"Pwd_type":Pwd_type,"Pwd":Pwd,"xfly":xfly};
  wx.request({
    url: apiUrl,  //api地址
    data: _data,
    header: {'Content-Type': 'application/json'},
    method: "get",
    async:false,  //同步
    success(res) {
    },
    fail(res) {
      console.log("getunits fail:",res);
    },
    complete(){
    }
  });    
  },
 //更新密码所有人
 update_pwdRenter:function(dsn,newPwd,renterid,kslx){
  if(!newPwd){
    newPwd = "";
  }
  var _data = {ac: 'update_pwdRenter',"dsn":dsn,"newPwd":newPwd,"renterid":renterid,"kslx":kslx};
  wx.request({
    url: apiUrl,  //api地址
    data: _data,
    header: {'Content-Type': 'application/json'},
    method: "get",
    async:false,  //同步
    success(res) {
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
        if(qty >= 12) {
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
    if (imgs.length >= 12) {
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
          var _data = {"ac": "Upload","tbName":"IB_contract","zd":"contractNo","keyV":contractNo};
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
  onShow: function () { //生命周期函数--监听页面显示
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
      //path:'/pages/forward_info/forward_info?LY=ZK&dsn='+dsn,
      //imageUrl:'/static/images/tenantQR.jpg',
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