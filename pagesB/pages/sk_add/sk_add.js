var fid = "" //账单头档id
var zdmx = [] //账单明细
var userid= "";  //登陆人工号
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  data: {
    winWidth: 0,
    winHeight: 0,
    zffsIndex: 0,
    master:false,
    detail_zf:true,
    navH:0,
    bindTap:"getBack", //返回上一页
    title:'收款',
  },
  onLoad: function (options) {
    var that = this;
    apiUrl = app.globalData.apiUrl;  
    userid = app.globalData.userid;   //登陆人工号
    fid = options.fid;
    //fid = "HTMX22042103361";
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
    this.get_skmx(fid);  //获取收款明细
    this.get_zffs();  //获取支付方式
    this.get_kssj();
    this.syzd_info(fid);  //获取账单详情
  },
  get_skmx:function (fid) { //获取收款明细
    let _this = this;
    var _data = {ac: 'sfk_detail',"fid":fid};
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
              "id":units[i].htid,
              "fylx_name":units[i].fylx_name,
              "bcys":units[i].bcysje,
              "bczf":units[i].bcysje,
            })
          }
          zdmx = newlist;
          setTimeout(()=>{
            _this.setData({
              ysdata:newlist
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
  get_kssj: function(e) {
    const date = new Date(); //获取当前时间
    let y = date.getFullYear();  //年
    let m = date.getMonth()+1; //月
    let d = date.getDate();  //日
    if(m < 10){ m = '0'+ m }
    if(d < 10){ d = '0'+ d }
    let Sd = y+'-'+m+'-'+d;  //拼接时间如2022-01-02
    this.setData({
      SKdate: Sd
    })
  },
  syzd_info:function (fid) { //获取账单详情
    let _this = this;
    var _data = {ac: 'syzd_info',"id":fid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          _this.setData({
            ysje:units[0].xstje,
            hthNo:units[0].hth,
          })
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  bindzffsChange: function(e) {  //支付方式改变事件
    this.setData({
      zffsIndex: e.detail.value
    })
  },
  bindDateChange: function(e) {  //收款日期
    this.setData({
      SKdate: e.detail.value
    })
  },
  minchange:function(e){
    var newminimum;
    let index1=e.currentTarget.dataset.index;
    let dclV = zdmx[index1*1].bcys;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      newminimum = e.detail.value;
      if(newminimum*1 > dclV*1){
        wx.showToast({
          title: '实际金额必须小于待处理金额',
          icon: "none",
          duration: 1000
        })
        newminimum = dclV;
      }
    } else {
      wx.showToast({
        title: '读数有误，请重新输入',
        icon: "none",
        duration: 1000
      })
      newminimum = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      ['ysdata['+index1+'].bczf']:newminimum
    })
    this.get_amount();//统计总金额
  },
  get_amount:function(e){
    let amount=0;
    for(let len of this.data.ysdata){
      if(!len.bczf){
        amount+=0*1;
      }
      else{
        amount+=len.bczf*1
      }
    }
    this.setData({
      ysje:amount
    })
  },
  showZF: function(e) {
    let _this = this;
    _this.setData({
      master:true,  //主档
      detail_zf:false, //支付页面
      bindTap:"showMaster",
      title:'支付',
   })
  },
  getBack: function(e) {  //返回上一页
    wx.navigateBack({
      delta: 1,
    })
  },
  showMaster: function(e) {
    let _this = this;
    _this.setData({
      master:false,  //主档
      detail_zf:true, //支付页面
      bindTap:"getBack",
      title:'收款',
   })
  },
  formSubmit: function (e){  //保存数据
    var that = this;
    var hth = e.detail.value.hthNo;
    var ysje = e.detail.value.ysje;
    var SKdate = e.detail.value.SKdate;
    var zffs = e.detail.value.zffs;
    var remark = e.detail.value.remark;
    var zflx = e.detail.value.zflx;
    let htid="";
    let zfje="";
    for(let b of this.data.ysdata){
      htid+=b.id+"|"
      if(!b.bczf){
        zfje+=0+"|"
      }
      else{
        zfje+=b.bczf+"|"
      }
    }
    /*if(!zflx){
      wx.showToast({
        title: '请选择支付方式',
        icon: "none",
        duration: 1000
      })
      return false;
    }*/
    var _data = {ac: 'skd_add',"contractNo":hth,"userid":userid,"ysje":ysje,"SKdate":SKdate,"zffs":zffs,"htid":htid,"zfje":zfje,"remark":remark};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=='1'){
          wx.showToast({
            title: '保存成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 2,
            })   
          }, 1500);
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  onShow: function () {  //生命周期函数--监听页面显示

  }
})