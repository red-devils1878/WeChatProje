var contractNo= "";  //房间id
var fymc = "0";  //费用
var zdje = "";  //账单金额
var txrq = "";  //提醒日期
var dis = "";
var Sd = "";//开始时间
var Ed = "";//结束时间
var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    disableT:'',
    gender: "",
    fylxIndex: 0,
    zdlxIndex: 1,
    detail_dlzd:false, //独立账单
    detail_zqzd:true, //周期账单
    items:[]
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    fymc = "0"  //费用
    zdje = ""  //账单金额
    txrq = ""  //提醒日期
    contractNo = options.contractNo;
    //contractNo = "Cont2204060041";
    apiUrl = app.globalData.apiUrl; 
    userid = app.globalData.userid;   //登陆人工号
    this.get_fylx();  //获取费用类型
    this.get_zdlx();  //获取账单类型
    this.get_kssj();
    this.get_zqzd(contractNo);  //获取周期账单
  },
  get_zqzd:function (contractNo) { //获取周期账单
    let _this = this;
    var _data = {ac: 'get_mqzd',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        _this.setData({
          items:units
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_kssj: function(e) {
    if(!Sd){
      const date = new Date(); //获取当前时间
      let y = date.getFullYear();  //年
      let m = date.getMonth()+1; //月
      let d = date.getDate();  //日
      let y2 = date.getFullYear()+1; //年
      if(m < 10){ m = '0'+ m }
      if(d < 10){ d = '0'+ d }
      Sd = y+'-'+m+'-'+d;  //拼接时间如2022-01-02
      Ed = y2+'-'+m+'-'+d; //拼接时间如2023-01-02
      txrq = Sd;
      this.setData({
        Sdate: Sd,
        date: Sd
      })
    }
    if(!Ed){
      Ed = Ed
    }
  },
  radioChange:function(e) {
    let gender = e.detail.value;    //获取单选框中的值
    this.setData({  //把值赋值给 data 中的数据
      // gender:gender
      gender
    })
  },
  bindDateChange: function(e) {  //提醒日期
    txrq = e.detail.value;
    if(!!fymc && !!zdje && !!txrq){
      dis = "1"
    }else{
      dis = ""
    }
    this.setData({
      disableT:dis,
      date: e.detail.value
    })
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
  get_zdlx:function () { //获取账单类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_zqdl'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        setTimeout(()=>{
          _this.setData({
            zdlx:units
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
    fymc = e.detail.value;
    this.setData({
      fylxIndex: e.detail.value
    })
    if(!!fymc && !!zdje && !!txrq){
      dis = "1"
    }else{
      dis = ""
    }
    this.setData({
       disableT:dis
    })
  },
  bindzdlxChange: function(e) {  //账单类型改变事件
    let zdlx = e.detail.value;
    let dlzdS = false;
    let zqzdS = true;
    if(zdlx=="1"){
      dlzdS = false;
      zqzdS = true;
    }
    else{
      dlzdS = true;
      zqzdS = false;
    }
    this.setData({
      zdlxIndex: e.detail.value,
      detail_dlzd: dlzdS,
      detail_zqzd: zqzdS
    })
  },
  jeChange: function(e) {   //账单金额改变事件
    zdje = e.detail.value;
    if(!!fymc && !!zdje && !!txrq){
      dis = "1"
    }else{
      dis = ""
    }
    this.setData({
       disableT:dis
    })
  },
  startDateChange: function(e) {  //开始日期
    let Sd2 = e.detail.value;
    let Sdate=new Date(Sd2);
    let Edate=new Date(Ed);
    if(Sdate > Edate){
      wx.showToast({
        title: "起始时间不能大于终止时间",
        icon: 'none',
        duration: 1000
      })
      Sd = Ed;  //结束时间给开始时间
      this.setData({
        Sdate: Ed
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
  endDateChange: function(e) {  //结束日期
    let Ed2 = e.detail.value;
    let Sdate=new Date(Sd);
    let Edate=new Date(Ed2);
    if(Sdate > Edate){
      wx.showToast({
        title: "起始时间不能大于终止时间",
        icon: 'none',
        duration: 1000
      })
      Ed = Sd;  //开始时间给结束时间
      this.setData({
        Edate: Sd
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
  checkboxChange: function(e) {
    let items = this.data.items
    let values = e.detail.value
    for (var i = 0, lenI = items.length; i < lenI; i++) {
      items[i].checked = false;
      if (items[i].id == values[values.length-1]) {
        items[i].checked = true;
      }else{
        items[i].checked = false;
      }
    }
    this.setData({
      items:items
    })
  },  
  formSubmit: function (e){  //生成提醒
    //var szlx = e.detail.value.szlx;
    var szlx = "in";
    var fymc = e.detail.value.fymc;
    var je = e.detail.value.je;
    var txDate = e.detail.value.txDate;
    var zdlx = e.detail.value.zdlx;
    var Sdate = e.detail.value.startDate;
    var Edate = e.detail.value.endDate;
    var zqzd = e.detail.value.zqzd;
    zqzd = zqzd[0];
    if(!zqzd){ zqzd = "" }
    if(!je){ je=0 }
    if(!txDate){ txDate = txrq }
    if(!Sdate){ Sdate = Sd }
    if(!Edate){ Edate = Sdate }
    if(!zqzd && zdlx=="zq"){
      wx.showToast({
        title: '请勾选周期账单',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    var _data = {ac: 'zdtx_add',"userid":userid,"contractNo":contractNo,"szlx":szlx,"fymc":fymc,"je":je,"txDate":txDate,"zdlx":zdlx,"Sdate":Sdate,"Edate":Edate,"zqzd":zqzd};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '生成成功',
          icon: "success",
          duration: 500
        })
        setTimeout(()=>{
          wx.navigateBack({
            delta: 1,
        }) 
        },1000)
      },
      fail(res) {
        console.log("getunits fail:",res);
        wx.showToast({
          title: '保存失败',
          icon: "none"
        })
      },
      complete(){
      }
    });   
  },
  onShow: function () {  //生命周期函数--监听页面显示
  }
})