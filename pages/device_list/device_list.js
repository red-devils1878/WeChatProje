var hid= "";    //房间id
var app = getApp();
var apiUrl = "";   //获取api地址
Page({
  data: {
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0  //分页
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
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
    that.get_deviceList(hid); //获取门锁设备
  },
  get_deviceList:function (hid) { //门锁列表
    let _this = this;
    _this.setData({
      servicelist:[],
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
          var imgurl = "";
          var sbtype = units[i].equip_type;
          switch(sbtype){
            case 'ms':
              imgurl="/static/images/my/ms.png";
              break;
            case 'sb':
              imgurl="/static/images/my/sb.png";
              break;
            case 'db':
              imgurl="/static/images/my/db.png";
              break;
            case 'wg':
              imgurl="/static/images/my/wg.png";
              break;
            default:
              imgurl="";
          }
          newlist.push({
            "id":units[i].equip_no,
            "name":units[i].equip_name,
            "imgurl":imgurl,
            "imgurl2":sbtype=='ms' ? "/static/images/my/dianchi.png":"",
            "dl":sbtype=='ms' ? units[i].msdl:"",
            "sblx":sbtype,
          })
        } 
        setTimeout(()=>{
            _this.setData({
              servicelist:newlist,
            })
        },10)
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
  jupLock:function(e){  //门锁操作页面
    let dsn = e.currentTarget.dataset.key;
    let sblx = e.currentTarget.dataset.sblx;
    if(sblx=="db"){
      wx.navigateTo({
        url: '../../pagesA/pages/db_operate/db_operate?dsn='+dsn
      })
    }
    else if(sblx=="sb"){
      wx.navigateTo({
        url: '../../pagesA/pages/sb_operate/sb_operate?dsn='+dsn
      })
    }
    else if(sblx=="ms"){   //门锁
      wx.navigateTo({
        url: '../../pagesA/pages/myLock/myLock?dsn='+dsn
      })
    }
  },
  onShow: function () {  //生命周期函数--监听页面显示
  }
})