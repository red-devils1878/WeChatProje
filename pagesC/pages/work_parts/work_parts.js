
var util = require('../../../utils/util.js');
var orderNo= "";   //工单号
var maxIndex=0;
var djzt= "";  //单据状态
var app = getApp();
var apiUrl = app.globalData.apiUrl_LS;   //获取api地址
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
    mydata : "",
    lsh : "",
    inputVal:[], //所有input的内容(名称)
    qtyVal:[],   //所有input的内容(电话)
    prdNoVal:[],//所有input的内容(证件号)
    djIndex:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    orderNo = options.orderNo;
    //orderNo = "ON2302130131";
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    this.workOrder_info(orderNo);  //获取工单详情
    this.work_prdList(orderNo);  //获取工单物料
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
          djzt = units[0].dj_state;
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  work_prdList:function (orderNo) { //获取工单物料
    let _this = this;
    var _data = {ac: 'work_prdList',"orderNo":orderNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const unit = [];
          const name = [];
          const qty = [];
          const prdNo = [];
          const unitN = [{}];
          var units = res.data.rows;
          var len = units.length;
          if(units.length > 0){
            maxIndex = len;  
            for (var i = 0; i < units.length; i++) {
              unit.push({
                "index":i,
                "lsh":units[i].id2,
                "name":units[i].goodsName,
                "qty":units[i].qty,
                "prdNo":units[i].goodsNo,
              });
              name.push(   
                units[i].goodsName
              );
              qty.push(   
                units[i].qty,
              );
              prdNo.push(     
                units[i].goodsNo
              );
            }
            setTimeout(()=>{
              _this.setData({
                inputList:unit,
                inputVal:name,
                qtyVal:qty,
                prdNoVal:prdNo,
                "maxIndex":maxIndex,
              })
            },100)
          }         
          else{
            //更新列表
            setTimeout(()=>{
              _this.setData({
                inputList:unitN,
                "maxIndex":0,
              })
            },100)
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
  //增加按钮
  addmore(e) {
    if(djzt=="1005"){
      wx.showToast({
        title: '已完工，不能添加',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    const {inputList} = this.data  //简写变量书写
    const {dataset: {index}} = e.currentTarget
    let len = this.data.inputList.length;
    //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
    inputList.splice(index, 0, {
        prdNo: "",
        lsh: "",
        name: "",
        qty: ""
    })
      //更新列表
    this.setData({
      inputList,
      "maxIndex":index,
    })
  },
  //删除按钮
  delmore(e) {
   var that = this;
   if(djzt=="1005"){
    wx.showToast({
      title: '已完工，不能删除',
      icon: "none",
      duration: 1000
    })
    return false;
  }
   let id2 = e.currentTarget.dataset.key;
   const {inputList} = this.data   //简写变量书写
   const {dataset: {index}} = e.currentTarget
   var oldInputVal=this.data.inputVal;  //所有的input值
   oldInputVal.splice(index-1,1);       //view删除了对应的input值也要删掉
   var oldQtyVal=this.data.qtyVal;
   oldQtyVal.splice(index-1,1);
   var oldPrdVal=this.data.prdNoVal;
   oldPrdVal.splice(index-1,1);
   //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
   console.log("删除的下标："+index);
   inputList.splice(index-1, 1)
   //更新列表
   that.setData({
     inputList,
     inputVal: oldInputVal,
     qtyVal: oldQtyVal,
     prdNoVal: oldPrdVal,
   })
    this.workPrd_del(id2);
  },
  workPrd_del: function (id2){  //删除物料
    var _data = {ac: 'workPrd_del',"id2":id2,"orderNo":orderNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '删除成功',
          icon: "none",
          duration: 1000
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
    var nowIdx_t=e.currentTarget.dataset.idx;//获取当前索引
    var val_t=e.detail.value;//获取输入的值
    var oldVal_t=this.data.qtyVal;
    oldVal_t[nowIdx_t]=val_t;//修改对应索引值的内容
    this.setData({
        qtyVal:oldVal_t
    })
  },
  tapList: function(e) {   //根据标识跳转页面
    let nowIdx_dq=e.currentTarget.dataset.idx;//获取当前索引
    this.setData({
       djIndex:nowIdx_dq
    })
    wx.navigateTo({
      url: '../../../pagesC/pages/prd_list/prd_list'
    })
  },
  //获取分组名称
  get_prdName: function(prdNo) { 
    let _this = this;
    var _data = {ac: 'get_prdName',"prdNo":prdNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        console.log("getunits success:",res); 
        var units = res.data.rows;
        var prd_name = units[0].prd_name;
        let djIndex = _this.data.djIndex;
        var val_n=prd_name;//获取输入的值
        var oldVal_n=_this.data.inputVal;
        oldVal_n[djIndex]=val_n;//修改对应索引值的内容
        _this.setData({
           inputVal:oldVal_n
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
    var that = this;
    if(djzt=="1005"){
      wx.showToast({
        title: '已完工，不能保存',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    var eValue = e.detail.value;
    var mapValue = util.objToStrMap(eValue); //将value对象转为map
    //var mapValue = objToStrMap(eValue); //将value对象转为map
    //获取list,此处的目的为获取list的长度,并通过循环拼接需要取出的names列表
    var list = that.data.inputList;
    var mx_lsh = "";
    var mx_name = "";
    var mx_qty = "";
    var mx_prd = "";
    for(var i = 1;i <= list.length;i++){
      var lsh_i = "lsh" + i;
      var name_i = "name" + i;
      var qty_i = "qty" + i;
      var prd_i = "prd" + i;
      var lsh = mapValue.get(lsh_i);
      var name = mapValue.get(name_i);
      var qty = mapValue.get(qty_i);
      var prd = mapValue.get(prd_i);
      if(!name){
        name = ""
      }
      if(!prd){
        prd = ""
      }
      if(!qty){
        qty = 1
      }
      mx_lsh += lsh + "|";
      mx_name += name + "|";
      mx_qty += qty + "|";
      mx_prd += prd + "|";
    }
    var _data = {ac: 'workPrd_save',"orderNo":orderNo,"lshList":mx_lsh,"nameList":mx_name,"qtyList":mx_qty,"prdList":mx_prd};
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
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    let fzNo_n = currPage.data.mydata.fz;
    let djIndex = this.data.djIndex;
    if(!!fzNo_n){
        var Pval_n=fzNo_n;//获取输入的值
        var oldVal_p=this.data.prdNoVal;
        oldVal_p[djIndex]=Pval_n;//修改对应索引值的内容
        this.setData({
            prdNoVal:oldVal_p
        })
      //fzNo = fzNo_n;
      this.get_prdName(fzNo_n);  //获取分组名称
    }
    /*
    if(!!fzNo){
      this.get_fzName(fzNo);  //获取分组名称
      this.setData({
        fz: fzNo
      })
    }*/
  },
  onHide: function () {  //生命周期函数--监听页面隐藏
  },
})