var hid= "";  //房间id
var dsn= "";  //设备号
var app = getApp();
var apiUrl = "";   //获取api地址
Page({
  data: {
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
    //hid = "10313"; //房间id
    hid = options.hid;
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
    this.get_macToMS(hid); //获取房间门锁
    this.get_tzrList(hid); //获取同住人列表
  },
  get_macToMS:function (hid) { //获取房间门锁
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
          dsn = units[0].equip_no
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_tzrList:function (hid) { //获取同住人列表
    let _this = this;
    var _data = {ac: 'get_userList',"hid":hid};
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
  tjsq:function(e){  //添加授权
    var that = this;
    let renterNo = e.currentTarget.dataset.key;  // 员工工号
    if(!!dsn){
      wx.navigateTo({
        url: '../../pagesA/pages/xfsq_add/xfsq_add?renterNo='+renterNo+'&dsn='+dsn
      })
    }
    else{
      wx.showToast({
        title: '请先添加门锁！',
        icon: 'error',
        duration: 1000
      });           
    }
  },
  ckqx:function(e){  //查看权限
    var that = this;
    let renterNo = e.currentTarget.dataset.key;  // 员工工号
    if(!!dsn){
      wx.navigateTo({
        url: '../../pagesA/pages/msyhZK_list/msyhZK_list?renterNo='+renterNo+'&dsn='+dsn
      })
    }
    else{
      wx.showToast({
        title: '请先添加门锁！',
        icon: 'error',
        duration: 1000
      });           
    }
  },
  onPullDownRefresh:function(){ //下拉刷新
    this.setData({
      page:0,
      servicelist:[]
    })
    this.get_tzrList(hid); //获取同住人列表
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },1000)
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
        arr = arr.concat(that.data.servicelist[i].hidD.split(','));
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
    for (let i = 0, lenI = servicelist.length; i < lenI; ++i) {
        servicelist[i].checked = false
      for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (servicelist[i].hidD === values[j]) {
          servicelist[i].checked = true
          break
        }
      }
    }
    let qty = values.length;
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
        title: '请选择要回收的钥匙',
        icon: "none",
        duration: 1000
      })
      return false;
    }
    wx.showModal({
      title: '钥匙回收',
      content: '确认回收？',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          for(let i = 0; i < hidD_length; i++){
            mx_hidD += hidD[i] + "|";
          }
         var _data = {ac: 'judge_userPwd',"hid":hid,"hidD":mx_hidD};
         wx.request({
           url: apiUrl,  //api地址
           data: _data,
           header: {'Content-Type': 'application/json'},
           method: "get",
           async: false,
           success(res) {
             var units = res.data.rows;
             if(units.length > 0){         
              wx.showToast({
                title: '请先删除客户的权限再点击回收',
                icon: "none",
                duration: 1000
              })
             }
             else{
              var _data2 = {ac: 'yshs_save',"hid":hid,"mx_hidD":mx_hidD};
              wx.request({
                url: apiUrl,  //api地址
                data: _data2,
                header: {'Content-Type': 'application/json'},
                method: "get",
                async: false,
                success(res) {
                  if(res.data.status=='1'){
                    wx.showToast({
                      title: '回收成功',
                      icon: "success",
                      duration: 1000
                    })
                    setTimeout(()=>{
                        wx.navigateBack({
                        delta: 1,
                      }) 
                    },1000)
                  }
                },
                fail(res) {
                  console.log("getunits fail:",res);
                },
                complete(){
                }
              });
             }
           },
           fail(res) {
           },
           complete(){
           }
         });  
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
})