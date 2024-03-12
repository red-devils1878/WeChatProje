var job= "";  //职务
var search= "";  //搜索内容
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    searchtext:'',  //搜索文字
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    checked: false,  //所属门店
    batchIds: '',    //选中的ids
    qty: 0,
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    job = options.job;
    //获取当前设备的宽高
    wx.getSystemInfo( { 
        success: function( res ) {
            that.setData( {
                winWidth: res.windowWidth,
                winHeight: res.windowHeight,
            });
        }
    });
    this.get_empList(job,search); //获取同住人列表
  },
  get_empList:function (job) { //获取同住人列表
    let _this = this;
    var _data = {ac: 'get_empList',"job":job,"search":search};
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
            servicelist:units,
          })
        },10)
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      showsearch:1,
      searchtext:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    search = this.data.searchtext;
    this.get_empList(job,search); //获取同住人列表
  },
  checked: function(e) {   //单选按钮，选中和取消
    var check = this.data.checked;
    if (check) {
    this.data.checked = false;
    } else {
    this.data.checked = true;
    }
    this.setData({
    "checked": this.data.checked,
    });
    this.selectall();
  }, 
  //全选与反全选
  selectall: function () {
    var that = this;
    var arr = [];   //存放选中id的数组
    for (let i = 0; i < that.data.servicelist.length; i++) {
      that.data.servicelist[i].checked = (!that.data.select_all)
      if (that.data.servicelist[i].checked == true){
        // 全选获取选中的值
        arr = arr.concat(that.data.servicelist[i].emp_no.split(','));
      }
    }
    let qty = arr.length;
    that.setData({
      servicelist: that.data.servicelist,
      select_all: (!that.data.select_all),
      batchIds:arr,
      qty:qty
    })
  },
  checkboxChange: function(e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    const servicelist = this.data.servicelist
    const values = e.detail.value
    if(values.length>1){
      for (var i = 0; i < servicelist.length; i++) {
        if(servicelist[i].emp_no === values[0]){
          servicelist[i].checked = false;
        }
        if(servicelist[i].emp_no === values[1]){
          servicelist[i].checked = true;
        }         
      }
    }
    else{
      for (let i = 0, lenI = servicelist.length; i < lenI; ++i) {
        servicelist[i].checked = false
        for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
          if (servicelist[i].emp_no === values[j]) {
            servicelist[i].checked = true
            break
          }
        }
      }    
    }
   let qty = values.length;
   if(qty>1){
     qty = 1;
   }
   this.setData({
     servicelist:servicelist,
     qty:qty
   })
  },  
  formSubmit: function (e){
    var that = this;
    var mx_hidD = "";
    var hidD = e.detail.value.hidD;
    var hidD_length = hidD.length;
    if(hidD_length < 1){
      wx.showToast({
        title: '请选择员工',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      mydata:{
        gy : hidD[0],
      }
    })
    wx.navigateBack({
      delta: 1,
    })
  }
})