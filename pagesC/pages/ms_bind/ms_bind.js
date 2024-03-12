var app = getApp();
var apiUrl = app.globalData.apiUrl_LS;   //获取api地址
var item = "aj";//项目
var houseNo = "";//房源
var floor = "";//楼层
Page({
    data: {  //页面的初始数据
      winWidth: 0,
      winHeight: 0,
      xmIndex: 0,
      ldIndex: 0,
      lcIndex: 0,
    },

    onLoad: function (options) {  //生命周期函数--监听页面加载
      var that = this;
      //获取当前设备的宽高
      wx.getSystemInfo( { 
        success: function( res ) {
          that.setData( {
            winWidth: res.windowWidth,
            winHeight: res.windowHeight
          });
        }
      });
      this.get_wbxm();  //获取维保项目
    },
    get_wbxm:function () { //获取维保项目
      let _this = this;
      var _data = {ac: 'get_picker',otherid:'IB_wbxm'};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              xm:units
            })
          },100)
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
    },
    bindXMChange: function(e) {  //项目改变事件
      var that = this; 
      this.setData({
        xmIndex: e.detail.value,
        ldIndex: 0,
        lcIndex: 0     
      })
      item = this.data.xm[e.detail.value].code;
      that.get_houseList(item); //获取楼栋
      setTimeout(function () {
        let len = that.data.ld.length;
        if(len >0){
          houseNo = that.data.ld[0].code;
        }
        that.get_floor(item,houseNo); //获取楼层
      }, 500);
      setTimeout(function () {
        let len = that.data.lc.length;
        if(len >0){
          let lc = that.data.lc[0].code;
          that.get_room(item,houseNo,lc); //获取楼层
        }
      }, 1000);
    },
    bindLDChange: function(e) {  //楼栋事件
      var that = this; 
      this.setData({
        ldIndex: e.detail.value,
        lcIndex: 0
      })
      houseNo = this.data.ld[e.detail.value].code;
      that.get_floor(item,houseNo); //获取楼层
      setTimeout(function () {
        let len = that.data.lc.length;
        if(len >0){
          let lc = that.data.lc[0].code;
          that.get_room(item,houseNo,lc); //获取楼层
        }
      }, 500);
    },
    bindLCChange: function(e) {  //楼层事件
      var that = this; 
      this.setData({
        lcIndex: e.detail.value
      })
      floor = this.data.lc[e.detail.value].code;
      that.get_room(item,houseNo,floor); //获取房间
    },
    get_houseList:function (item) { //获取楼栋
      let _this = this;
      var _data = {ac: 'get_houseList',"item":item};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              ld:units
            })
          },100)
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
    },
    get_floor:function (item,houseNo) { //获取楼层
      let _this = this;
      var _data = {ac: 'get_floor',"item":item,"houseNo":houseNo};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              lc:units
            })
          },100)
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
    },
    get_room:function (item,houseNo,floor) { //获取房间
      let _this = this;
      var _data = {ac: 'get_room',"item":item,"houseNo":houseNo,"floor":floor};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          const fylist = [];
          var units = res.data.rows;
          var room_total = units.length; //总房间数
          if(room_total > 0){
            for (var i = 0; i < room_total; i++) {
              fylist.push({
                "hid":units[i].hid,
                "roomNo":units[i].roomNo,
                "msNo":units[i].equip_no,
                "sbNo":units[i].sbNo,
                "dbNo":units[i].dbNo,
              })
            }   
          }
          setTimeout(()=>{
            _this.setData({
              room_list:fylist
            })
          },100)
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
    },
    jumpBind: function(e) {   //跳转页面
      var hid = e.currentTarget.dataset.key;
      let sblx = "ms"; //门锁
      wx.navigateTo({
        url:  '../../../pagesC/pages/ms_bindInfo/ms_bindInfo?item='+item+'&hid='+hid+'&sblx='+sblx
      }) 
    },
    onShow: function () {  //生命周期函数--监听页面显示
      this.get_room(item,houseNo,floor); //获取房间
    }
})