
var util = require('../../../utils/util.js');
var hth= "";   //合同号
var maxIndex=0;
var sexQJ = []; //性别数组
var gxQJ = [];  //关系数组
var qxQJ = [];  //权限数组
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    cardIndex: 0,
    index:0,
    inputList:  [{
    }],
    lsh : "",
    inputVal:[], //所有input的内容(名称)
    telVal:[],   //所有input的内容(电话)
    cardNoVal:[],//所有input的内容(证件号)
    ctVal:[],
    sexVal:[], 
    gxVal:[],  //(同住人关系)
    qxVal:[],  //(开门权限)
    rules:['133','149','153','173','177','180','181','189','190','191','193','199','130','131','132','145','155','156','166','167','171','175','176','185','186','196','134','135','136','137','138','139','144','147','148','150','151','152','157','158','159','172','178','182','183','184','187','188','195','197','198'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    apiUrl = app.globalData.apiUrl; 
    hth = options.hth;
    //hth = "Cont2208310346";
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
          that.setData( {
              winWidth: res.windowWidth,
              winHeight: res.windowHeight
          });
      }
    });
    this.get_cardType();  //获取证件类型
    this.get_sexT();  //获取性别(同住人)
    this.get_gxT();  //获取关系(同住人)
    this.get_qxT();  //获取开门权限(同住人)
    setTimeout(()=>{
      this.checkIn_tzr(hth);  //获取同住人
    },100)
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
          setTimeout(()=>{
            _this.setData({
              card:units
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
  get_sexT:function () { //获取性别(同住人)
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
            sexT:units
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
        gxQJ = units;
        setTimeout(()=>{
          _this.setData({
            gxT:units
          })
        },10)
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
        qxQJ = units;
        setTimeout(()=>{
          _this.setData({
            qxT:units
          })
        },10)
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  checkIn_tzr:function (hth) { //获取同住人
    let _this = this;
    var _data = {ac: 'checkIn_tzr',"contractNo":hth};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const unit = [];
          const name = [];
          const tel = [];
          const cardNo = [];
          const zjlx = [];
          const sex = [];
          const gx = [];
          const qx = [];
          const unitN = [{}];
          var units = res.data.rows;
          var len = units.length;
          if(units.length > 0){
            maxIndex = len;  
            for (var i = 0; i < units.length; i++) {
              unit.push({
                "index":i,
                "lsh":units[i].tzrId,
                "name":units[i].name_d,
                "tel":units[i].tel_d,
                "cardIndex":units[i].zjlx_index, 
                "cardNo":units[i].cardNo_d,
              });
              name.push(   
                units[i].name_d
              );
              tel.push(   
                units[i].tel_d,
              );
              cardNo.push(     
                units[i].cardNo_d
              );
              zjlx.push(  
                units[i].zjlx_index,
              );
              sex.push(
                _this.get_indexYW(sexQJ,units[i].sex_d),
              );
              gx.push(
                _this.get_indexYW(gxQJ,units[i].guanxi),
              );
              qx.push(
                _this.get_indexYW(qxQJ,units[i].management),
              );
            }
            setTimeout(()=>{
              _this.setData({
                inputList:unit,
                inputVal:name,
                telVal:tel,
                cardNoVal:cardNo,
                ctVal:zjlx,
                "maxIndex":maxIndex,
                sexVal:sex,
                gxVal:gx,
                qxVal:qx,
              })
            },100)
          }         
          else{
            var oldCTVal2=_this.data.ctVal;
            oldCTVal2[0]="0";//修改对应索引值的内容
            var oldSexVal2=_this.data.sexVal;
            oldSexVal2[0]="0";
            var oldgxVal2=_this.data.gxVal;
            oldgxVal2[0]="0";
            var oldqxVal2=_this.data.qxVal;
            oldqxVal2[0]="0";

            //更新列表
            setTimeout(()=>{
              _this.setData({
                inputList:unitN,
                "maxIndex":0,
                ctVal:oldCTVal2,
                sexVal:oldSexVal2,
                gxVal:oldgxVal2,
                qxVal:oldqxVal2,
              })
            },100)
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
  //获取一维数组下标
  get_indexYW:function(arrayName,code){
    let arrtofor=arrayName;
    for (let index = 0; index < arrtofor.length; index++) {
      if(arrtofor[index].code==code){
        return index;
      }
    }
  },
  bindCardChange: function(e) {  //证件类型改变事件
    var nowIdx_ct=e.currentTarget.dataset.idx;//获取当前索引
    var oldCTVal=this.data.ctVal;
    oldCTVal[nowIdx_ct]=e.detail.value;//修改对应索引值的内容
    this.setData({
      //cardTIndex: e.detail.value
      ctVal:oldCTVal
    })
  },
  bindSexTChange: function(e) {  //性别改变事件
    var nowIdx_sex=e.currentTarget.dataset.idx;
    var oldSexVal=this.data.sexVal;
    oldSexVal[nowIdx_sex]=e.detail.value;
    this.setData({
      sexVal:oldSexVal
    })
  },
  bindGXTChange: function(e) {  //关系改变事件
    var nowIdx_gx=e.currentTarget.dataset.idx;
    var oldgxVal=this.data.gxVal;
    oldgxVal[nowIdx_gx]=e.detail.value;
    this.setData({
      gxVal:oldgxVal
    })
  },
  bindQXTChange: function(e) {  //权限改变事件
    var nowIdx_qx=e.currentTarget.dataset.idx;
    var oldqxVal=this.data.qxVal;
    oldqxVal[nowIdx_qx]=e.detail.value;
    this.setData({
      qxVal:oldqxVal
    })
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
      //第一个参数是开始的下标，第二个参数是零为添加操作，第三个参数是添加的内容
      inputList.splice(index, 0, {
        cardNo: "",
        lsh: "",
        name: "",
        tel: ""
      })
      var oldCTVal=this.data.ctVal;
      oldCTVal[len]="0";//修改对应索引值的内容
      var oldSexVal=this.data.sexVal;
      oldSexVal[len]="0";
      var oldgxVal=this.data.gxVal;
      oldgxVal[len]="0";
      var oldqxVal=this.data.qxVal;
      oldqxVal[len]="0";
      //更新列表
      this.setData({
        inputList,
        "maxIndex":index,
        ctVal:oldCTVal,
        sexVal:oldSexVal,
        gxVal:oldgxVal,
        qxVal:oldqxVal,
      })
    }
  },
  //删除按钮
  delmore(e) {
   var that = this;
   let rzrId = e.currentTarget.dataset.key;
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
   var oldgxVal=this.data.gxVal;
   oldgxVal.splice(index-1,1);
   var oldqxVal=this.data.qxVal;
   oldqxVal.splice(index-1,1);
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
     gxVal: oldgxVal,
     qxVal: oldqxVal,
   })
    this.roommate_del(rzrId);
  },
  roommate_del: function (rzrId){  //删除同住人
    var _data = {ac: 'roommate_del',"rzrId":rzrId,"contractNo":hth};
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
    /*
    var nowIdx_c=e.currentTarget.dataset.idx;//获取当前索引
    var val_c=e.detail.value;//获取输入的值
    var oldVal_c=this.data.cardNoVal;
    oldVal_c[nowIdx_c]=val_c;//修改对应索引值的内容
    this.setData({
      cardNoVal:oldVal_c
    })
    */
   var nowIdx_c=e.currentTarget.dataset.idx;//获取当前索引
   var val_c=e.detail.value;//获取输入的值
   var oldVal_c=this.data.cardNoVal;
   var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
   if(reg.test(val_c)==false){
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
  formSubmit: function (e){  //保存数据
    var that = this;
    var eValue = e.detail.value;
    var mapValue = util.objToStrMap(eValue); //将value对象转为map
    //var mapValue = objToStrMap(eValue); //将value对象转为map
    //获取list,此处的目的为获取list的长度,并通过循环拼接需要取出的names列表
    var list = that.data.inputList;
    //设置需要接收数据的数组
    //var lshList = [];
    //var nameList = [];
    //var telList = [];
    //var cardTypeList = [];
    //var cardNoList = [];
    var mx_lsh = "";
    var mx_name = "";
    var mx_tel = "";
    var mx_zjlx = "";
    var mx_zjh = "";
    var mx_sex = "";
    var mx_gx = "";
    var mx_qx = "";
    for(var i = 1;i <= list.length;i++){
      var lsh_i = "lsh" + i;
      var name_i = "name" + i;
      var tel_i = "tel" + i;
      var cardType_i = "cardType" + i;
      var cardNo_i = "cardNo" + i;
      var sex_i = "sexType" + i;
      var gx_i = "gxType" + i;
      var qx_i = "qxType" + i;
      var lsh = mapValue.get(lsh_i);
      var name = mapValue.get(name_i);
      var tel = mapValue.get(tel_i);
      var cardType = mapValue.get(cardType_i);
      var cardNo = mapValue.get(cardNo_i);
      var sexType = mapValue.get(sex_i);
      var gxType = mapValue.get(gx_i);
      var qxType = mapValue.get(qx_i);
      //lshList.push(lsh);
      //nameList.push(name);
      //telList.push(tel);
      //cardTypeList.push(cardType);
      //cardNoList.push(cardNo);
      if(!sexType){
        sexType = "M"
      }
      if(!gxType){
        gxType = "1008"
      }
      if(!qxType){
        qxType = "1001"
      }
      if(!name){
        name = ""
      }
      if(!cardNo){
        cardNo = ""
      }
      mx_lsh += lsh + "|";
      mx_name += name + "|";
      mx_tel += tel + "|";
      mx_zjlx += cardType + "|";
      mx_zjh += cardNo + "|";
      mx_sex += sexType + "|";
      mx_gx += gxType + "|";
      mx_qx += qxType + "|";
    }
    var _data = {ac: 'roommate_save',"hth":hth,"lshList":mx_lsh,"nameList":mx_name,"telList":mx_tel,"cardTypeList":mx_zjlx,"cardNoList":mx_zjh,"sexList":mx_sex,"gxList":mx_gx,"qxList":mx_qx};
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