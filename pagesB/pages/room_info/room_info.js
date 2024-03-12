var hid= "";  //房间id
var contractNo= "";  //合同号
var equip_no= "";  //设备号
var sbNo= "";  //水表号
var dbNo= "";  //电表号
var app = getApp();
var zt = ""; //出租状态
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
  data: {
    winWidth: 0,
    winHeight: 0,
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    detail_user:true, //用户列表
    detail_sb:true,
    arrow_sb: 'arrow_bottom',
    sblist:[],
  },
  onLoad: function (options) { //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    hid = options.hid;
    //hid = "10313";
    /**
     * 获取当前设备的宽高
    */
    wx.getSystemInfo( {
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    this.house_info(hid); //获取房间详情
    this.get_userList(hid); //获取房间用户列表
    this.get_sbList(hid); //获取房间设备列表
  },
  house_info:function (hid) { //修改房间信息
    let _this = this;
    var _data = {ac: 'house_info',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        zt = units[0].cz_state;
        equip_no = units[0].equip_no;
        sbNo = units[0].sbNo;
        dbNo = units[0].dbNo;
        _this.setData({
          hid:units[0].hid,
          fjzp:units[0].fjzp,
          ft_name:units[0].fjzt_name,
          ssmd:units[0].ssmd,
          fangxing:units[0].fangxing,
          zj:units[0].rent+units[0].unit_name,
          area:units[0].roomArea,
          address:units[0].address,
          czzt:units[0].cz_state
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  get_userList:function (hid) { //获取房间用户列表
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
        var showFlag = true;
        if(units.length > 0){
          showFlag = false;
        }
        setTimeout(()=>{
          _this.setData({
            servicelist:units,
            detail_user:showFlag,
          })
        },10)
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  get_sbList:function (hid) { //获取房间设备列表
    let _this = this;
    _this.setData({
      sblist:[]
    })
    var _data = {ac: 'deviceSD_list',"hid":hid};
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
            "dsn":units[i].equip_no,
            "sbmc":units[i].equip_name,
            "sblx":units[i].equip_type
          })
        }
        setTimeout(()=>{
          _this.setData({
            sblist:newlist
          })
        },100)
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
  tapEvent: function(e) {
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let url = "";
    if (index == '1') {   //入住信息
        url = '../../../pages/rzjl_list/rzjl_list?hid='+hid;
    } else if ( index == '2' ) {  //开门记录
      _this.get_kmjl(hid);
    }else if( index == '3' ){  //水电煤
      url = '../../../pagesB/pages/energy_list/energy_list?hid='+hid;
    }else if( index == '4' ){  //房间照片
      url = '../../../pagesB/pages/roomPhotos/roomPhotos?hid='+hid;
    }else if( index == '5' ){  //智能锁
      /* 
      url = '../../../pagesB/pages/device_add/device_add?hid='+hid;
      */
     let arrow_sb="arrow_bottom";
     let sb=!this.data.detail_sb;
     if(sb){
      arrow_sb = "arrow_bottom";
     }
     else{
      arrow_sb = "arrow_top";
     }
     _this.setData({
      detail_sb:sb,
      arrow_sb:arrow_sb
     })   
    }else if( index == '6' ){  //房屋配置
      url = '../../../pagesB/pages/fwpz/fwpz?hid='+hid;
    }else if( index == '7' ){  //房间描述
      url = '../../../pagesB/pages/roomDescription/roomDescription?hid='+hid;
    }else if( index == '8' ){  //开门设置
      url = '../../../pagesB/pages/openSetting/openSetting?hid='+hid;
    }else if( index == '9' ){  //办理入住
      wx.showToast({
        title: '功能开发中...',
        icon: "none",
        duration: 1000
      })
    }else if( index == '10' ){  //钥匙回收
      url = '../../../pages/yshs_list/yshs_list?hid='+hid;
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  tapSB: function(e) {  //设备
    let _this = this;
    let sblx = e.currentTarget.dataset.sblx;
    let sbh = e.currentTarget.dataset.key;
    let url = "";
    if (sblx == 'sb') {  //水表
      url = '../../../pagesA/pages/sb_operate/sb_operate?dsn='+sbh;
    }else if ( sblx == 'db' ) {  //电表
      url = '../../../pagesA/pages/db_operate/db_operate?dsn='+sbh;
    }else if ( sblx == 'ms' ) {  //门锁
      url = '../../../pagesA/pages/myLock/myLock?dsn='+sbh;
    }else if ( sblx == 'wg' ) {  //网关
      url = '../../../pagesA/pages/wg_operate/wg_operate?dsn='+sbh;
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
  get_kmjl:function(hid){  //开门记录
    var _data = {ac: 'get_macToMS',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          equip_no = units[0].equip_no;
          wx.navigateTo({
            url: '../../../pages/openLock_list/openLock_list?mac='+equip_no
          })
        }
        else{
          wx.showToast({
            title: '没有绑定的智能锁',
            icon: "none",
            duration: 1000
          })
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
        wx.showToast({
          title: '没有绑定的智能锁',
          icon: "none",
          duration: 500
        })
      },
      complete(){
      }
    });
  },
  tapBLRZ: function(e) {  //办理入住
    wx.navigateTo({
      url: '../../../pagesB/pages/checkIn_add/checkIn_add?hid='+hid
    })
  },
  tapEdit: function(e) {  //编辑房间
    wx.navigateTo({
      url: '../../../pagesB/pages/room_update/room_update?hid='+hid
    })
  },
  tapFX: function(e) {  //分享
    wx.navigateTo({
      url: '../../../pagesB/pages/owner_list/owner_list'
    })
  },
  tapDel: function(e) {  //删除房间
    if(zt=="1001"){
      wx.showToast({
        title: '在租中不能删除',
        icon: "error",
        duration: 1000//持续的时间
      });
    }
    else{
      if(!!equip_no || !!sbNo || !!dbNo){
        wx.showToast({
          title: '请先解绑设备再删除!',
          icon: "none",
          duration: 1000
        });
      }
      else{
        wx.showModal({
          title: '删除房间',
          content: '确认删除？',
          success: function (res) {
            if (res.confirm) {//这里是点击了确定以后
              var _data = {ac: 'room_del',"hid":hid};
              wx.request({
                url: apiUrl,  //api地址
                data: _data,
                header: {'Content-Type': 'application/json'},
                method: "get",
                success(res) {
                    wx.showToast({
                      title: '删除成功',
                      icon: "success",
                      duration: 500//持续的时间
                    });
                    setTimeout(()=>{
                      wx.navigateBack({   //返回上一页
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
            } else {//这里是点击了取消以后
              console.log('用户点击取消')
            }
          }
         })
      }
    }
  },
  tapRZXQ: function(e) {  //入住详情
    let that = this;
    var _data = {ac: 'get_contractNo',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          contractNo = units[0].contractNo;
          wx.navigateTo({
            url: '../../../pagesB/pages/rzxq_info/rzxq_info?contractNo='+contractNo
          })
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
  onShow: function () {  //生命周期函数--监听页面显示
    this.house_info(hid); //获取房间详情
    this.get_userList(hid); //获取房间用户列表
  },
  onHide: function () { //生命周期函数--监听页面隐藏
  },
})