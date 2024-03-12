// pages/account_add/account_add.js
var contractNo= "";  //合同号
var contractNo_n = "" //合同号(新)
var fymc = "0"  //费用
var zdje = ""  //账单金额
var zdrq = ""  //账单日期
var dis = ""
var Sd = "";//开始时间
var Ed = "";//结束时间
var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    winWidth: 0,
    winHeight: 0,
    disableT:'',
    gender: "",
    zflxIndex: 0,
    fylxIndex: 0,
    zffsIndex: 0,
    skyhIndex: 0,
    detail_zhxx:true, //账户信息
    mydata:''
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    fymc = "0"  //费用
    zdje = ""  //账单金额
    zdrq = ""  //账单日期
    contractNo = "";
    apiUrl = app.globalData.apiUrl; 
    userid = app.globalData.userid;   //登陆人工号
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    this.get_kssj();
    this.get_fylx();  //获取费用类型
    this.get_zflx();  //获取支付类型
    this.get_zffs();  //获取支付方式
    this.get_skyh();  //获取收款银行
  },
  contract_info:function (contractNo) { //获取房间信息
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
          _this.setData({
            houseName:units[0].houseName+'.'+units[0].tenantName+'.'+units[0].htzt_name
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
      zdrq = Sd;
      this.setData({
        Sdate: Sd,
        date: Sd,
        Edate: Sd,
      })
    }
    if(!Ed){
      Ed = Ed
    }
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
      },
      complete(){
      }
    });  
  },
  get_zflx:function () { //获取支付类型
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_ysTtype'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              zflx:units
            })
          },10)
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  get_zffs:function () { //获取支付方式
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_zflx'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              zffs:units
            })
          },10)
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  get_skyh:function () { //获取收款银行
    let _this = this;
    var _data = {ac: 'get_picker',otherid:'IB_BankList'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              skyh:units
            })
          },10)
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  radioChange:function(e) {
    let gender = e.detail.value;    //获取单选框中的值
    this.setData({  //把值赋值给 data 中的数据
      // gender:gender
      gender
    })
  },
  bindDateChange: function(e) {  //提醒日期
    zdrq = e.detail.value;
    if(!!fymc && !!zdje && !!zdrq){
      dis = "1"
    }else{
      dis = ""
    }
    this.setData({
      disableT:dis,
      date: e.detail.value
    })
  },
  bindfylxChange: function(e) {  //费用类型改变事件
    fymc = e.detail.value;
    this.setData({
      fylxIndex: e.detail.value
    })
    if(!!fymc && !!zdje && !!zdrq){
      dis = "1"
    }else{
      dis = ""
    }
    this.setData({
       disableT:dis
    })
  },
  jeChange: function(e) {   //账单金额改变事件
    zdje = e.detail.value;
    if(!!fymc && !!zdje && !!zdrq){
      dis = "1"
    }else{
      dis = ""
    }
    this.setData({
       disableT:dis
    })
  },
  bindzflxChange: function(e) {  //结算时间改变事件
    let zdlx = e.detail.value;
    let dlzdS = true;
    if(zdlx=="1"){
      dlzdS = false;
    }
    else{
      dlzdS = true;
    }
    this.setData({
      zflxIndex: e.detail.value,
      detail_zhxx: dlzdS,
    })
  },
  bindzffsChange: function(e) {  //支付方式改变事件
    this.setData({
      zffsIndex: e.detail.value
    })
  },
  bindskyhChange: function(e) {  //收款账户改变事件
    this.setData({
      skyhIndex: e.detail.value
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
  tapHT:function(e){  //选择合同
    wx.navigateTo({
      url: '../../../pagesB/pages/htDlg_list/htDlg_list'
    })
  },
  formSubmit: function (e){  //添加记账
    var szlx = e.detail.value.szlx;
    var fymc = e.detail.value.fymc;
    var je = e.detail.value.je;
    var jzDate = e.detail.value.jzDate;
    var contractNo = e.detail.value.htNo;
    var zflx = e.detail.value.zflx;
    var sDate = e.detail.value.startDate;
    var eDate = e.detail.value.endDate;
    var zffs = e.detail.value.zffs;
    var skr = e.detail.value.skr;
    var skzh = e.detail.value.skzh;
    var skyh = e.detail.value.skyh;
    var remark = e.detail.value.remark;
    if(!je){ je=0 }
    if(!jzDate){ jzDate = "" }
    var _data = {ac: 'account_add',"userid":userid,"contractNo":contractNo,"szlx":szlx,"fymc":fymc,"je":je,"jzDate":jzDate,"zflx":zflx,"sDate":sDate,"eDate":eDate,"zffs":zffs,"skr":skr,"skzh":skzh,"skyh":skyh,"remark":remark};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        wx.showToast({
          title: '添加成功',
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
        wx.showToast({
          title: '添加失败',
          icon: "none"
        })
      },
      complete(){
      }
    });   
  },
  onShow: function () {  //生命周期函数--监听页面显示
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    let contractNo_n = currPage.data.mydata.ht;
    if(!!contractNo_n){
      contractNo = contractNo_n;
    }
    if(!!contractNo){
      this.contract_info(contractNo);  //获取房源名称
      this.setData({
        htNo: contractNo
      })
    }
  }
})