
var util = require('../../../utils/util.js');
var hid= "";   //房间id
var maxIndex=0;
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    kmlxIndex: 0,
    index:0,
    inputList:  [{
    }],
    lsh : "",
    kmlxVal:[], //所有input的内容(名称)
    kssjVal:[],//所有input的内容(证件号)
    jssjVal:[],
    kmcsVal:[],
    ksrqVal:[],
    jsrqVal:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    hid = options.hid;
    apiUrl = app.globalData.apiUrl;
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
          that.setData( {
              winWidth: res.windowWidth,
              winHeight: res.windowHeight
          });
      }
    });
    this.get_kmlxType();  //获取开门类型
    this.get_kssj();  //获取开始时间
    this.get_jssj();  //获取结束时间
    this.get_openSetting(hid);  //获取房间开门设置
  },
  get_kmlxType:function () { //获取开门类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_kmlx'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          _this.setData({
            kmlx:units
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_kssj:function () { //获取开始时间
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'day_hour'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          _this.setData({
              kssj:units
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_jssj:function () { //获取结束时间
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'day_hour'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          _this.setData({
              jssj:units
          })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_openSetting:function (hid) { //获取开门设置
    let _this = this;
    var _data = {ac: 'room_openSetting',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const unit = [];
          const lx = [];
          const ks = [];
          const js = [];
          const cs = [];
          const ksrq = [];
          const jsrq = [];
          const unitN = [{}];
          var units = res.data.rows;
          var len = units.length;
          if(units.length > 0){
            maxIndex = len;  
            for (var i = 0; i < units.length; i++) {
              unit.push({
                "index":i,
                "lsh":units[i].hidDD3,
                "kmlxIndex":units[i].kmlx_index
              });
              lx.push(  
                units[i].kmlx_index,
              );
              ks.push(   
                units[i].kssj
              );
              js.push(   
                units[i].jssj,
              );
              cs.push(     
                units[i].kmcs
              );
              ksrq.push(   
                units[i].ksrq2,
              );
              jsrq.push(     
                units[i].jsrq2
              );
            }
            setTimeout(()=>{
              _this.setData({
                inputList:unit,
                kmlxVal:lx,
                kssjVal:ks,
                jssjVal:js,
                kmcsVal:cs,
                ksrqVal:ksrq,
                jsrqVal:jsrq,
                "maxIndex":maxIndex
              })
            },10)
          }         
          else{
            var oldkmlxVal2=_this.data.kmlxVal;
            var oldkssjVal2=_this.data.kssjVal;
            var oldjssjVal2=_this.data.jssjVal;
            oldkmlxVal2[0]="0";//修改对应索引值的内容
            oldkssjVal2[0]="0";//修改对应索引值的内容
            oldjssjVal2[0]="0";//修改对应索引值的内容
            //更新列表
            setTimeout(()=>{
              _this.setData({
                inputList:unitN,
                "maxIndex":0,
                kmlxVal:oldkmlxVal2,
                kssjVal:oldkssjVal2,
                jssjVal:oldjssjVal2
              })
            },10)
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
  bindLXChange: function(e) {  //开门类型改变事件
    var nowIdx_km=e.currentTarget.dataset.idx;//获取当前索引
    var oldkmlxVal=this.data.kmlxVal;
    oldkmlxVal[nowIdx_km]=e.detail.value;//修改对应索引值的内容
    this.setData({
      kmlxVal:oldkmlxVal
    })
  },
  bindStartChange: function(e) {  //开始时间改变事件
    var nowIdx_ks=e.currentTarget.dataset.idx;//获取当前索引
    var oldkssjVal=this.data.kssjVal;
    oldkssjVal[nowIdx_ks]=e.detail.value;//修改对应索引值的内容
    this.setData({
      kssjVal:oldkssjVal
    })
  },
  bindEndChange: function(e) {  //结束时间改变事件
    var nowIdx_js=e.currentTarget.dataset.idx;//获取当前索引
    var oldjssjVal=this.data.jssjVal;
    oldjssjVal[nowIdx_js]=e.detail.value;//修改对应索引值的内容
    this.setData({
      jssjVal:oldjssjVal
    })
  },
  startDateChange: function(e) {  //开始日期
    var nowIdx_ksrq=e.currentTarget.dataset.idx;//获取当前索引
    var val_ksrq=e.detail.value;
    var oldVal_ksrq=this.data.ksrqVal;
    oldVal_ksrq[nowIdx_ksrq]=val_ksrq;//修改对应索引值的内容
    this.setData({
      ksrqVal:oldVal_ksrq
    })
  },
  endDateChange: function(e) {  //结束日期
    var nowIdx_jsrq=e.currentTarget.dataset.idx;//获取当前索引
    var val_jsrq=e.detail.value;
    var oldVal_jsrq=this.data.jsrqVal;
    oldVal_jsrq[nowIdx_jsrq]=val_jsrq;//修改对应索引值的内容
    this.setData({
      jsrqVal:oldVal_jsrq
    })
  },
  //增加按钮
  addmore(e) {
    const {inputList} = this.data  //简写变量书写
    const {dataset: {index}} = e.currentTarget
    let len = this.data.inputList.length;
    //splice方法来添加对象
    //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
    inputList.splice(index, 0, {})
    var oldkmlxVal=this.data.kmlxVal;
    var oldksVal=this.data.kssjVal;
    var oldjsVal=this.data.jssjVal;
    oldkmlxVal[len]="0";//修改对应索引值的内容
    oldksVal[len]="0";//修改对应索引值的内容
    oldjsVal[len]="0";//修改对应索引值的内容
    //更新列表
    this.setData({
      inputList,
      "maxIndex":index,
      kmlxVal:oldkmlxVal,
      kssjVal:oldksVal,
      jssjVal:oldjsVal
    })
  },
  //删除按钮
  delmore(e) {
   var that = this;
   let id3 = e.currentTarget.dataset.key;
   const {inputList} = this.data   //简写变量书写
   const {dataset: {index}} = e.currentTarget
   var oldkmcsVal=this.data.kmcsVal;  //所有的input值
   oldkmcsVal.splice(index-1,1);       //view删除了对应的input值也要删掉
   var oldlxVal=this.data.kmlxVal;
   oldlxVal.splice(index-1,1);
   var oldksVal=this.data.kssjVal;
   oldksVal.splice(index-1,1);
   var oldjsVal=this.data.jssjVal;
   oldjsVal.splice(index-1,1);
   var oldksrqVal=this.data.ksrqVal;
   oldksrqVal.splice(index-1,1);
   var oldjsrqVal=this.data.jsrqVal;
   oldjsrqVal.splice(index-1,1);
   //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
   console.log("删除的下标："+index);
   inputList.splice(index-1, 1)
   //更新列表
   that.setData({
     inputList,
     kmcsVal: oldkmcsVal,
     kmlxVal: oldlxVal,
     kssjVal: oldksVal,
     jssjVal: oldjsVal,
     ksrqVal: oldksrqVal,
     jsrqVal: oldjsrqVal
   })
    this.openSetting_del(id3);
  },
  openSetting_del: function (id3){  //删除开门设置
    var _data = {ac: 'roomOpenSetting_del',"id3":id3};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          console.log("getunits success:",res); 
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
  kmcsInputVal:function(e){
    var nowIdx_cs=e.currentTarget.dataset.idx;//获取当前索引
    var val_cs=e.detail.value;//获取输入的值
    var oldVal_cs=this.data.kmcsVal;
    oldVal_cs[nowIdx_cs]=val_cs;//修改对应索引值的内容
    this.setData({
      kmcsVal:oldVal_cs
    })
  },
  formSubmit: function (e){  //保存数据
    var that = this;
    var eValue = e.detail.value;
    var mapValue = util.objToStrMap(eValue); //将value对象转为map
    //var mapValue = objToStrMap(eValue); //将value对象转为map
    //获取list,此处的目的为获取list的长度,并通过循环拼接需要取出的names列表
    var list = that.data.inputList;
    var mx_lsh = "";
    var mx_lx = "";
    var mx_ks = "";
    var mx_js = "";
    var mx_cs = "";
    var mx_ksrq = "";
    var mx_jsrq = "";
    for(var i = 1;i <= list.length;i++){
      var lsh_i = "lsh" + i;
      var lx_i = "kmlxType" + i;
      var ks_i = "kssjType" + i;
      var js_i = "jssjType" + i;
      var cs_i = "kmcs" + i;
      var ksrq_i = "startDate" + i;
      var jsrq_i = "endDate" + i;
      var lsh = mapValue.get(lsh_i);
      var lx = mapValue.get(lx_i);
      var ks = mapValue.get(ks_i);
      var js = mapValue.get(js_i);
      var cs = mapValue.get(cs_i);
      var ksrq = mapValue.get(ksrq_i);
      var jsrq = mapValue.get(jsrq_i);
      if(!lsh){ lsh = "";}
      if(!lx){ lx = "01";}
      if(!cs){ cs = 0;}
      mx_lsh += lsh + "|";
      mx_lx += lx + "|";
      mx_ks += ks + "|";
      mx_js += js + "|";
      mx_cs += cs + "|";
      mx_ksrq += ksrq + "|";
      mx_jsrq += jsrq + "|";
    }
    var _data = {ac: 'roomOpenSetting_save',"hid":hid,"lshList":mx_lsh,"lxList":mx_lx,"ksList":mx_ks,"jsList":mx_js,"csList":mx_cs,"Sdate":mx_ksrq,"Edate":mx_jsrq};
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