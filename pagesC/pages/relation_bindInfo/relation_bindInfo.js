var hid3 = ""  //位置id
var houseNo = ""  //房源编号
var lc= "";  //楼层
var collectorNo = ""; //采集器编号
var cjqlx = ""; //采集器类型
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiSB = app.globalData.apiSB;   //水表指令api
var apiDB = app.globalData.apiDB;   //电表指令api
Page({
  data: {  //页面的初始数据
    hiddenYB:true, //显示隐藏
    sblx:"水表",
    servicelist:[],
    notRelationlist:[],
    showIndex:null,//打开弹窗的对应下标
    height:'',//屏幕高度
    winWidth: 0,
    winHeight: 0,
    showMB:true, //幕布
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;
    var lx = "水表";
    hid3 = options.hid3;
    collectorNo = options.collectorNo;
    cjqlx = options.cjqlx;
    if(cjqlx=="sb"){
      lx = "水表";
    }
    else if(cjqlx=="db"){
      lx = "电表";
    }
    that.setData({
      sblx:lx,
    })
    that.get_Collector(hid3,cjqlx); //获取已绑采集器
    that.get_collector_device(collectorNo,cjqlx); //获取已关联的设备
    //获取当前设备的宽高
    wx.getSystemInfo( {
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });
  },
  get_Collector:function (hid3,cjqlx) { //获取已绑采集器
    let _this = this;
    var _data = {ac: 'AZ_get_Collector',"hid3":hid3,"cjqlx":cjqlx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var imageUrl = "../../../static/images/my/wg.png";        
        if(units.length > 0){
          houseNo = units[0].houseNo,
          _this.setData({
            hid3:units[0].hid3,
            collectorNo:units[0].equip_no,
            mc:units[0].houseName+units[0].locationName,
            imageUrl:imageUrl,
          })
        }
        else{
          houseNo = "",
          _this.setData({
            collectorNo:"",
            mc:"",    
            imageUrl:"",
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
  get_collector_device:function (collectorNo,cjqlx) { //获取已关联的设备
    let _this = this;
    _this.setData({
      servicelist:[],
    })
    var _data = {ac: 'get_collector_device',"collectorNo":collectorNo,"cjqlx":cjqlx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        const newlist = [];
        var units = res.data.rows;
        var imageUrl = "../../../static/images/my/sb.png";
        if(cjqlx=="sb"){
          imageUrl = "../../../static/images/my/sb.png";
        }
        else if(cjqlx=="db"){
          imageUrl = "../../../static/images/my/db.png";
        }
        for (var i = 0; i < units.length; i++) {
          newlist.push({
            "id":units[i].deviceSn,
            "name":units[i].houseName+units[i].roomNo,
            "sbNo":units[i].deviceSn,
            "collectorSn":units[i].collectorSn,
            "lylx":units[i].lx,
            "ptlx":units[i].ptlx,
            "imageUrl":imageUrl,
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
  get_notRelation_device:function (houseNo,lc,cjqlx) { //获取未关联的设备
    let _this = this;
    _this.setData({
      notRelationlist:[],
    })
    var _data = {ac: 'get_notRelation_device',"houseNo":houseNo,"lc":lc,"cjqlx":cjqlx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        const newlist = [];
        var units = res.data.rows;
        var imageUrl = "../../../static/images/my/sb.png";
        if(cjqlx=="sb"){
          imageUrl = "../../../static/images/my/sb.png";
        }
        else if(cjqlx=="db"){
          imageUrl = "../../../static/images/my/db.png";
        }
        for (var i = 0; i < units.length; i++) {
          newlist.push({
            "id":units[i].equip_no,
            "name":units[i].houseName+units[i].roomNo,
            "sbNo":units[i].equip_no,
            "lylx":units[i].lx,
            "ptlx":units[i].ptlx,
            "imageUrl":imageUrl,
          })
        } 
        setTimeout(()=>{
          _this.setData({
            notRelationlist:newlist,
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
  unRelation:function(e){  //解除关联
    var that = this;
    let deviceSn = e.currentTarget.dataset.key;
    let collectorNo = e.currentTarget.dataset.collectorno;
    let lylx = e.currentTarget.dataset.lylx;
    let ptlx = e.currentTarget.dataset.ptlx;
    wx.showModal({
      title: '解除关联',
      content: '确认解除关联？',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
         if(cjqlx=="sb"){ //水表
          if(lylx=="3"){ //卓正
            if(ptlx=="M-BUS"){
              that.ZZ_unRelation_collector(collectorNo,deviceSn,ptlx);  //解除关联
            }
            else if(ptlx=="LORA"){
              that.ZZ_unRelation_collector(collectorNo,deviceSn,ptlx);
            }
          }
        }
        else if(cjqlx=="db"){ //电表
          if(lylx=="3"){ //启程
            if(ptlx=="485"){
              that.QC_unRelation_collector(collectorNo,deviceSn,ptlx);  //解除关联
            }
            else if(ptlx=="LORA"){
              that.QC_unRelation_collector(collectorNo,deviceSn,ptlx);
            }
          }
        }
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
  relation:function(e){  //保存关联
    var that = this;
    let deviceSn = e.currentTarget.dataset.key;
    let lylx = e.currentTarget.dataset.lylx;
    let ptlx = e.currentTarget.dataset.ptlx;
    if(cjqlx=="sb"){ //水表
      if(lylx=="3"){ //卓正
        if(ptlx=="M-BUS"){
          that.ZZ_relation_collector(collectorNo,deviceSn,ptlx); //水表关联
        }
        else if(ptlx=="LORA"){
          that.ZZ_relation_collector(collectorNo,deviceSn,ptlx);
        }
        else if(ptlx=="4G" || ptlx=="NB"){
          wx.showToast({
            title: '4G或NB水表不用关联采集器',
            icon: "none",
            duration: 2000
          })
        }
      }
    }
    else if(cjqlx=="db"){ //电表
      if(lylx=="3"){ //启程
        if(ptlx=="485"){
          that.QC_relation_collector(collectorNo,deviceSn,ptlx); //电表关联
        }
        else if(ptlx=="LORA"){
          that.QC_relation_collector(collectorNo,deviceSn,ptlx);
        }
        else if(ptlx=="4G"){
          wx.showToast({
            title: '4G电表不用关联采集器',
            icon: "none",
            duration: 2000
          })
        }
      }
    }
  },
  inputLC:function(e){
    this.setData({
      lc:e.detail.value
    })
  },
  submitSearch:function(){  //提交搜索
    var that = this;
    lc = this.data.lc;
    if(!lc){
      wx.showToast({
        title: '请选择楼层',
        icon: "none",
        duration: 1000
      })
    }
    else{
      this.setData({
        showIndex:3
      })
      that.get_notRelation_device(houseNo,lc,cjqlx); //获取未关联的设备
    }
  },
  //关闭弹窗
  closePopup(){
    this.setData({
      showIndex:null
    })
  },
  ZZ_relation_collector:function(collectorNo,deviceSn,ptlx){  //ZZ水表关联采集器
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '关联中...',
    })
    let jk = ""; //接口
    if(ptlx == "M-BUS"){  //M-BUS
      jk = '/zz/wm/mbus/set/addSubmeter/'+collectorNo+'/'+deviceSn+'';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/zz/wm/lora/set/addSubmeter/'+collectorNo+'/'+deviceSn+'';
    }
    wx.request({
     url: apiSB+jk,  //水表指令的api
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(!!_res.success){
        that.setData({
          showMB:true,  //显示幕布
        })  
        wx.hideLoading();  //关闭提示框
        wx.showToast({
          title: '关联成功',
          icon: "success",
          duration: 1000
        });
        setTimeout(()=>{
          that.get_notRelation_device(houseNo,lc,cjqlx); //获取未关联的设备
          that.get_collector_device(collectorNo,cjqlx); //获取已关联的设备
        },1000)
      }
      else{
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.showToast({
          title: '关联失败',
          icon: "error",
          duration: 1000
        })
      }
     },
     fail(res) {
     },
     complete(){
      that.setData({
        showMB:true,  //显示幕布
      })
      wx.hideLoading();  //关闭提示框
     }
   });
  },
  ZZ_unRelation_collector:function(collectorNo,deviceSn,ptlx){  //ZZ水表解除关联
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '解除关联中...',
    })
    let jk = ""; //接口
    if(ptlx == "M-BUS"){  //M-BUS
      jk = '/zz/wm/mbus/set/removeSubmeter/'+collectorNo+'/'+deviceSn+'';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/zz/wm/lora/set/removeSubmeter/'+collectorNo+'/'+deviceSn+'';
    }
    wx.request({
     url: apiSB+jk,  //水表指令的api
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(!!_res.success){
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.hideLoading();  //关闭提示框
        wx.showToast({
          title: '解绑关联成功',
          icon: "success",
          duration: 1000
        });
        setTimeout(()=>{
          that.get_collector_device(collectorNo,cjqlx); //获取已关联的设备
        },1000)
      }
      else{
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.showToast({
          title: '解除失败',
          icon: "error",
          duration: 1000
        })
      }
     },
     fail(res) {
     },
     complete(){
      that.setData({
        showMB:true,  //显示幕布
      })
      wx.hideLoading();  //关闭提示框
     }
   });
  },
  QC_relation_collector:function(collectorNo,deviceSn,ptlx){  //QC电表关联采集器
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '关联中...',
    })
    let jk = ""; //接口
    if(ptlx == "485"){  //485
      jk = '/qc/am/485/addSubmeter';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/addSubmeter';
    }
    var _data = '{"comAddr":"'+deviceSn+'","concentratorAddr":"'+collectorNo+'"}'
    wx.request({
     url: apiDB+jk,  //电表指令的api
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(!!_res.success){
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.hideLoading();  //关闭提示框
        wx.showToast({
          title: '关联成功',
          icon: "success",
          duration: 1000
        });
        setTimeout(()=>{
          that.get_notRelation_device(houseNo,lc,cjqlx); //获取未关联的设备
          that.get_collector_device(collectorNo,cjqlx); //获取已关联的设备
        },1000)
      }
      else{
        that.setData({
          showMB:true,  //显示幕布
        })
        console.log(_res.message);
        wx.showToast({
          title: '关联失败',
          icon: "error",
          duration: 1000
        })
      }
     },
     fail(res) {
     },
     complete(){
      that.setData({
        showMB:true,  //显示幕布
      })
      wx.hideLoading();  //关闭提示框
     }
   });
  },
  QC_unRelation_collector:function(collectorNo,deviceSn,ptlx){  //QC电表解除关联
    var that = this;
    that.setData({
      showMB:false,  //显示幕布
    })
    wx.showLoading({
      title: '解除关联中...',
    })
    let jk = ""; //接口
    if(ptlx == "485"){  //485
      jk = '/qc/am/485/removeSubmeter';
    }else if(ptlx == "LORA"){  //LORA
      jk = '/qc/am/lora/removeSubmeter';
    }
    var _data = '{"comAddr":"'+deviceSn+'","concentratorAddr":"'+collectorNo+'"}'
    wx.request({
     url: apiDB+jk,  //电表指令的api
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "POST",
     dataType: 'application/json',
     async:false,  //同步 
     success(res) {
      let _res = JSON.parse(res.data);
      if(!!_res.success){
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.hideLoading();  //关闭提示框
        wx.showToast({
          title: '解绑关联成功',
          icon: "success",
          duration: 1000
        });
        setTimeout(()=>{
          that.get_collector_device(collectorNo,cjqlx); //获取已关联的设备
        },1000)
      }
      else{
        that.setData({
          showMB:true,  //显示幕布
        })
        wx.showToast({
          title: '解除失败',
          icon: "error",
          duration: 1000
        })
      }
     },
     fail(res) {
     },
     complete(){
      that.setData({
        showMB:true,  //显示幕布
      })
      wx.hideLoading();  //关闭提示框
     }
   });
  },
  onShow: function () {  //生命周期函数--监听页面显示

  }
})