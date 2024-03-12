
var util = require('../../../utils/util.js');
var tzNo= "";   //退租编号
var maxIndex=0;
var fylxQJ = []; //费用类型数组
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    index:0,
    inputList:  [{
    }],
    lsh : "",
    inputVal:[], //所有input的内容(名称)
    fyVal:[],
    qtyVal:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    apiUrl = app.globalData.apiUrl; 
    tzNo = options.tzNo;
    //tzNo = "TZSP2204110007";
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
          that.setData( {
            winWidth: res.windowWidth,
            winHeight: res.windowHeight
          });
      }
    });
    this.get_fyType();  //获取费用类型
    this.checkOut_wpjg(tzNo);  //获取物品交割
  },
  get_fyType:function () { //获取费用类型
    let _this = this;
    var _data = {ac: 'get_goods'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        fylxQJ = units;
        setTimeout(()=>{
          _this.setData({
            fy:units
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
  checkOut_wpjg:function (tzNo) { //获取物品交割
    let _this = this;
    var _data = {ac: 'checkOut_jgmx',"tzNo":tzNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const unit = [];
          const je = [];
          const fylx = [];
          const qty = [];
          const unitN = [{}];
          var units = res.data.rows;
          var len = units.length;
          if(units.length > 0){
            maxIndex = len;  
            for (var i = 0; i < units.length; i++) {
              unit.push({
                "index":i,
                "lsh":units[i].id3,
                "je":units[i].amount,
              });
              je.push(   
                units[i].amount
              );
              qty.push(   
                units[i].qty
              );
              fylx.push(  
                _this.get_indexYW(fylxQJ,units[i].goodsNo), 
              );
            }
            setTimeout(()=>{
              _this.setData({
                inputList:unit,
                inputVal:je,
                fyVal:fylx,
                qtyVal:qty,
                "maxIndex":maxIndex
              })
            },1000)
          }         
          else{
            var oldFYVal2=_this.data.fyVal;
            oldFYVal2[0]="0";//修改对应索引值的内容
            //更新列表
            setTimeout(()=>{
              _this.setData({
                inputList:unitN,
                "maxIndex":0,
                fyVal:oldFYVal2
              })
            },1000)
          }
      },
      fail(res) {
        console.log("getunits fail:",res);
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      },
      complete(){
      }
    });  
  },
  bindFYLXChange: function(e) {  //费用类型改变事件
    var nowIdx_fy=e.currentTarget.dataset.idx;//获取当前索引
    var oldFYVal=this.data.fyVal;
    oldFYVal[nowIdx_fy]=e.detail.value;//修改对应索引值的内容
    this.setData({
      fyVal:oldFYVal
    })
  },
  //增加按钮
  addmore(e) {
    const {inputList} = this.data  //简写变量书写
    const {dataset: {index}} = e.currentTarget
    let len = this.data.inputList.length;
    //splice方法来添加对象
    //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
    inputList.splice(index, 0, {
      lsh: "",
      je: "",
      qty: ""
    })
    var oldFYVal=this.data.fyVal;
    oldFYVal[len]="0";//修改对应索引值的内容
    //更新列表
    this.setData({
      inputList,
      "maxIndex":index,
      fyVal:oldFYVal
    })
  },
  //删除按钮
  delmore(e) {
   var that = this;
   let id3 = e.currentTarget.dataset.key;
   const {inputList} = this.data   //简写变量书写
   const {dataset: {index}} = e.currentTarget
   var oldInputVal=this.data.inputVal;  //所有的input值
   oldInputVal.splice(index-1,1);       //view删除了对应的input值也要删掉
   var oldFYVal=this.data.fyVal;
   oldFYVal.splice(index-1,1);
   var oldQTYVal=this.data.qtyVal;
   oldQTYVal.splice(index-1,1);
   //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
   console.log("删除的下标："+index);
   inputList.splice(index-1, 1)
   //更新列表
   that.setData({
     inputList,
     inputVal: oldInputVal,
     fyVal: oldFYVal,
     qtyVal: oldQTYVal
   })
    this.wpjg_del(id3);
  },
  wpjg_del: function (id3){  //删除交割金额
    var _data = {ac: 'wpjg_del',"id3":id3};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          wx.showToast({
            title: '删除成功',
            icon: "none"
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
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
  qtyInputVal:function(e){
    var nowIdx_qty=e.currentTarget.dataset.idx;//获取当前索引
    var val_qty=e.detail.value;//获取输入的值
    var oldVal_qty=this.data.qtyVal;
    oldVal_qty[nowIdx_qty]=val_qty;//修改对应索引值的内容
    this.setData({
      qtyVal:oldVal_qty
    })
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
  formSubmit: function (e){  //保存数据
    var that = this;
    var eValue = e.detail.value;
    var mapValue = util.objToStrMap(eValue); //将value对象转为map
    //获取list,此处的目的为获取list的长度,并通过循环拼接需要取出的names列表
    var list = that.data.inputList;
    var mx_lsh = "";
    var mx_fylx = "";
    var mx_je = "";
    var mx_qty = "";
    for(var i = 1;i <= list.length;i++){
      var lsh_i = "lsh" + i;
      var fyType_i = "fyType" + i;
      var je_i = "je" + i;
      var qty_i = "qty" + i;
      var lsh = mapValue.get(lsh_i);
      var fyType = mapValue.get(fyType_i);
      var je = mapValue.get(je_i);
      var qty = mapValue.get(qty_i);
      mx_lsh += lsh + "|";
      mx_fylx += fyType + "|";
      mx_je += je + "|";
      mx_qty += qty + "|";
    }
    var _data = {ac: 'wpjg_save',"tzNo":tzNo,"lshList":mx_lsh,"fylxList":mx_fylx,"jeList":mx_je,"qtyList":mx_qty};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '保存成功',
          icon: "success",
          duration: 1000
        })
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
  onReady: function () {  //生命周期函数--监听页面初次渲染完成
  },
  onShow: function () { //生命周期函数--监听页面显示
  },
  onHide: function () {  //生命周期函数--监听页面隐藏
  },
})