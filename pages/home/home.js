
var app = getApp();
var apiUrl = "";   //获取api地址
var userid = ""; //工号
var job= "";  //登陆角色
var QZ= "";  //前缀
Page({
  data: {
  },
  onLoad: function(options) {
    var that = this;
    apiUrl = app.globalData.apiUrl;
    userid = app.globalData.userid;
    job = app.globalData.job;    //登陆角色
    QZ = app.globalData.QZ;    //前缀
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
   if( !userid || !QZ){
    wx.redirectTo({
      url: '/pages/auth/auth'
    })
   }
   else{
    if(QZ=="jianxin" || QZ=="anju" || QZ=="jinyuan" || QZ=="iot"){
      wx.switchTab({
        url: '/pages/homeYY/homeYY',
      })
    }
    else{
      if(job=="样品管理员" || job=="安装" || job=="维保"){  //样品管理员
        wx.switchTab({
          url: '/pages/homeYS/homeYS',
        })
      }
      else{
        wx.switchTab({
          url: '/pages/home/home',
        })     
      }
    }
   }
   setTimeout(()=>{
    that.setData({
      yhid:userid,
    })
   },20);
   /*调用一次定位*/
    /*
   wx.getLocation({
    type: 'gcj02',
    success (res) {
      console.log(res)
    }
   })
   */
  },
  onShow: function() {
    let emp_no = app.globalData.userid;
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    if(!!emp_no){
      this.getHome_data(emp_no); //获取首页统计数据
      this.Judge_loginGJ(emp_no);  //判断用户是否有权登陆
    }
  },
  tapEvent: function(e) {
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let url = "";
    if (index == '01') {  //办理入住
      url = '/pages/checkIn_list/checkIn_list';
    } else if ( index == '02' ) {  //入住人
      //url = '/pages/tenant_list/tenant_list';
      url = '/pages/rzr_list/rzr_list';
    }else if( index == '03' ){  //合同管理
      url = '/pages/contract_list/contract_list';
    }else if( index == '04' ){  //报修流程
      url = '/pages/workOrder_list/workOrder_list';
    }else if ( index == '14' ) {  //低电量锁
      //url = '/pages/ddms_list/ddms_list';
      url = '../../pagesA/pages/cx_mrdl/cx_mrdl';
    }else if ( index == '15' ) {  //我的门锁
      url = '/pages/myLock_list/myLock_list';
    }else if ( index == '16' ) {  //账单查询
      url = '/pages/zjdj_list/zjdj_list';
    }else if ( index == '17' ) {  //水表读数
      url = '/pages/myDevice_list/myDevice_list';
    }else if ( index == '18' ) {  //入住记录
      url = '../../pagesB/pages/checkIn_record/checkIn_record';
    }else if ( index == '19' ) {  //电表读数
      url = '/pages/myDeviceDB_list/myDeviceDB_list';
    }else if ( index == '20' || index == '31' ) {  //长期未开门
      url = '/pages/cqwkm_list/cqwkm_list';
    }else if ( index == '32' ) {  //账单代缴
      url = '/pages/zjdj_list/zjdj_list';
    }else if ( index == '33' ) {  //未完服务
      url = '/pages/workOrder_list/workOrder_list';
    }else if ( index == '30' ) {  //电费不足
      url = '/pages/dfbz_list/dfbz_list?userid='+userid; 
    }else if ( index == '21' ) {  //预约看房
      //url = '/pages/yykf_list/yykf_list';
      url = '../../pagesA/pages/gateway_list/gateway_list';
    }else if ( index == '22' ) {  //添加记账
      url = '../../pagesB/pages/account_add/account_add';
    }else if ( index == '23' ) {  //批量下发
      url = '/pages/plxf_info/plxf_info';
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
    if ( index == '11' ) {  //新增房源
        let fjzt = "";
        wx.reLaunch({
          url: '/pages/room_list2/room_list2?fjzt='+fjzt,
        })
    }
    else if ( index == '12' ) {  //空房管理
      let fjzt = "kf";
      wx.reLaunch({
        url: '/pages/room_list2/room_list2?fjzt='+fjzt,
      })
    }
    else if ( index == '13' ) {  //即将到期
        let fjzt = "jjdq";
        wx.reLaunch({
          url: '/pages/room_list2/room_list2?fjzt='+fjzt,
        })
    }
  },
  getHome_data:function (emp_no) { //获取首页统计数据
    let _this = this;
    var _data = {ac: 'getHome_data',"userid":emp_no};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          _this.setData({
            rzl:units[0].rzl+'%',
            jrrz:units[0].jrrz,
            jrtf:units[0].jrtf,
            fjs:units[0].fjs,
            kfs:units[0].kfs,
            sbgz:units[0].sbgz,
            zddj:units[0].zddj,
            fw:units[0].fw,
            dfbz:units[0].dfbz,
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
  Judge_loginGJ:function (emp_no) { //判断用户是否有权登陆
    let _this = this;
    var _data = {ac: 'Judge_loginGJ',"userid":emp_no};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
        }
        else{
          wx.showModal({    
            title: '提示',    
            showCancel: false,    
            content: '请联系管理员授权',    
            success: function (res) {
              let _userid = "";
              wx.setStorageSync("userid", _userid);
              app.globalData.userid = _userid;
              wx.redirectTo({
                url: '/pages/auth/auth'
              })
            }
          })
          return false;
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  }
})