function initSubMenuDisplay() { 
    return ['hidden', 'hidden', 'hidden'];
  }
  var initSubMenuHighLight = [
    ['','','','',''],
    ['',''],
    ['','','']
  ];
  var fylx= "";  //房源类型
  var fz="";     //分组
  var xq= "";    //小区
  var fjzt= "";  //房间状态
  var hid= "";  //房间id
  var cczt = "" //出租状态
  var contractNo= "";  //合同号
  var equip_no= "";  //设备号
  var userid= "";  //登陆人工号
  var houseNo = "";//房源编号
  var floor = "";//楼层
  var fjName = "" //房间名称
  var fjNameF = "" //楼层
  var mysl = 6; //每页5层
  var page_total = 0; //总页数
  var fyQJ = [];  //房源数组
  var app = getApp();
  var apiUrl = "";   //获取api地址
  var search= "";  //搜索内容
  var lcQJ = [];  //楼层数组
  Page({
    data: {
      actionSheetHidden:true,
      actionSheetHidden_add:true,
      subMenuDisplay:initSubMenuDisplay(),
      navH:0,
      winWidth: 0,
      winHeight: 0,
      currentTab: 0,
      servicelist:[], //服务集市列表
      scrolltop:null, //滚动位置
      page: 0,  //分页
      fjztmc:'全部',
      room_list:[], 
      detail_search:true, //搜索框
      searchtext:'',  //搜索文字
      showHight: 0,
      lcIndex: 0,
      myslT: 6,  //每页6层
      leftId: "left0",
      rightId: "right0",
      lifeActiveNum: 0,
      heightArr: [],
      bottomLift: app.globalData.bottomLift, //苹果X及以上机型的底部安全区域高度
    },
    onLoad: function (options) {  //生命周期函数--监听页面加载
      var that = this;
      apiUrl = app.globalData.apiUrl;
      userid = app.globalData.userid;   //登陆人工号
      fjzt = options.fjzt;
      fylx = "1"; //初始化成整套
      if(!fjzt){
        fjzt=""
      }
      if(fjzt=="kf"){
        that.setData( {
          fjztmc: '空房'
        });
      }
      else if(fjzt=="jjdq"){
        that.setData( {
          fjztmc: '即将到期'
        });
      }
      //获取当前设备的宽高
      wx.getSystemInfo( { 
        success: function( res ) {
          that.data.navH = res.statusBarHeight+45;  //导航高度
          that.setData( {
            winWidth: res.windowWidth,
            winHeight: res.windowHeight,
            navH: res.statusBarHeight+45,
            fjmc:"",
          });
        }
      });
     this.get_houseBelong();  //获取分组
     this.get_fjzt();         //获取房态
     this.get_houseName(fylx);    //获取房源
     this.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
     this.get_roomList(userid,fylx,fz,xq,fjzt,search);
    },
    //  tab切换逻辑
    swichNav: function( e ) {
      var that = this;
      if( this.data.currentTab === e.target.dataset.current ) {
        return false;
      } else {
        var tabV = e.target.dataset.current;
        this.setData({
          subMenuDisplay: initSubMenuDisplay()
        });      
        if(tabV=="0"){
          fylx = "1";
          //mysl = 6;
          this.get_houseName(fylx);    //获取房源
          this.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
          this.get_roomList(userid,fylx,fz,xq,fjzt,search);
        }else if(tabV=="1"){
          fylx = "3";
          //mysl = 6;
          this.get_houseName(fylx);    //获取房源
          this.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
          this.get_roomList(userid,fylx,fz,xq,fjzt,search);
        }else if(tabV=="2"){
          fylx = "2";
          //mysl = 2;
          this.setData({
            room_list:[],
            roomTotal:0
          })
          this.get_houseName(fylx);    //获取房源
          if(!!xq && xq!="ALL"){
            this.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
            this.get_roomList(userid,fylx,fz,xq,fjzt,search);
          }
        }
        that.setData( {
          currentTab: e.target.dataset.current
        })
      }
    },
    bindChange: function( e ) {
      var that = this;
      var tabV = e.detail.current;
      that.setData( { 
        currentTab: e.detail.current 
      });
      if(tabV=="0"){
        fylx = "1";
        //mysl = 6;
        this.get_houseName(fylx);    //获取房源
        that.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
        that.get_roomList(userid,fylx,fz,xq,fjzt,search);
      }else if(tabV=="1"){
        fylx = "3";
        //mysl = 6;
        this.get_houseName(fylx);    //获取房源
        that.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
        that.get_roomList(userid,fylx,fz,xq,fjzt,search);
      }else if(tabV=="2"){
        fylx = "2";
        //mysl = 2;
        this.setData({
          room_list:[],
          roomTotal:0
        })
        this.get_houseName(fylx);    //获取房源
        if(!!xq && xq!="ALL"){
          this.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
          this.get_roomList(userid,fylx,fz,xq,fjzt,search);
        }
      }
    },
    get_houseBelong:function () { //获取分组
      let _this = this;
      var _data = {ac: 'get_houseBelong'};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            const newlist = [];
            var units = res.data.rows;
            for (var i = 0; i < units.length; i++) {
              newlist.push({
                "i":i,
                "sid":units[i].sid,
                "sname":units[i].sname
              })
            }
            setTimeout(()=>{
              _this.setData({
                fz_list:newlist
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
    get_fjzt:function () { //获取房态
      let _this = this;
      var _data = {ac: 'get_fjzt'};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            const ftlist = [];
            var units = res.data.rows;
            for (var i = 0; i < units.length; i++) {
              ftlist.push({
                "i":i,
                "code":units[i].code,
                "othername":units[i].othername
              })
            }
            setTimeout(()=>{
              _this.setData({
                ft_list:ftlist
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
    get_houseName:function (fylx) { //获取房源名称
      let _this = this;
      var _data = {ac: 'get_houseNameTofylx',"userid":userid,"fylx":fylx};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            const xqlist = [];
            var units = res.data.rows;
            for (var i = 0; i < units.length; i++) {
              xqlist.push({
                "i":i,
                "rid":units[i].houseNo,
                "rname":units[i].houseName
              })
            }
            setTimeout(()=>{
              _this.setData({
                xq_list:xqlist
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
    get_roomTotal:function (userid,fylx,fz,xq,fjzt,search) { //获取房间总数
      let _this = this;
      if(fylx==""){ fylx = "1" }
      var _data = {ac: 'get_roomTotal',"userid":userid,"fylx":fylx,"fz":fz,"xq":xq,"fjzt":fjzt,"search":search};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        async:false,  //同步    
        success(res) {
          var units = res.data.rows;
          var total = 0;
          if(units.length > 0){
            total = units[0].roomTotal;
          }
          _this.setData({
            roomTotal:total
          })
          if(fylx=="2" && units[0].roomTotal >= 18){
            //mysl = 2;
            _this.setData({
              myslT:2
            })
          }
          else{
            _this.setData({
              myslT:6
            })
            //mysl = 6;
          }
          let total2 = _this.data.myslT;
          console.log("总页数量"+total2);
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
    },
    get_roomList:function (userid,fylx,fz,xq,fjzt,search) { //获取房间列表
      if(fylx==""){ fylx = "1" }
      if(fylx == "2" && (xq=="ALL" || xq=="")){
        wx.showToast({
          title: '整栋的要选具体楼栋',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
      let _this = this;
      fyQJ = [];  //初始化房源数组
      _this.setData({
        room_list:[]
      })
      this.setData({
        page:1
      })
      const page = this.data.page;
      var tips = "加载中...";
      wx.showLoading({
       title: tips,
      })
      let total = _this.data.myslT;
      //console.log("每页数量"+total);  
      var _data = {ac: 'get_roomList',"userid":userid,"fylx":fylx,"fz":fz,"xq":xq,"fjzt":fjzt,"search":search};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        async:false,  //同步    
        success(res) {
          wx.hideLoading();
          const fylist = [];
          var units = res.data.rows;
          var floor_total = units.length; //总层数
          if(floor_total > 0){
            fyQJ = units;
            page_total = Math.ceil(floor_total/mysl);  //总页数
            var qty = 0;
            if(floor_total > page*mysl){
              qty = page*mysl;
            }
            else{
              qty = floor_total;
            }
            /*
            for (var i = (page-1)*mysl; i < qty; i++) {
              fylist.push({
                "houseNo":units[i].houseNo,
                "floor":units[i].floor,
                "houseName":units[i].houseName,
                "roomList":units[i].roomList
              })
            }
            */
          }
          setTimeout(()=>{
            _this.setData({
              //room_list:fylist,
              room_list:units,
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
    goToTop:function(){ //回到顶部
      this.setData({
        scrolltop:0
      })
    },
  scrollLoading:function(){ //滚动加载
    //this.get_roomList(userid,fylx,fz,xq,fjzt,search);
    this.loadMoreData();
  },
  loadMoreData: function () {
    var _this = this
    var currentPage = _this.data.page; // 获取当前页码
    currentPage += 1; // 加载当前页面的下一页数据
    if(currentPage > page_total){
      wx.showToast({
        title: '没有更过数据',
        icon: 'none'
      })
    }
    else{
      var tips = "加载中...";
      wx.showLoading({
        title: tips,
      })
      setTimeout(()=>{
        wx.hideLoading();
      },500)
      const fylist = [];
      var units = fyQJ;
      var floor_total = units.length; //总层数
      if(floor_total > 0){
        var qty = 0;
        if(floor_total > currentPage*mysl){
          qty = currentPage*mysl;
        }
        else{
          qty = floor_total;
        }
        for (var i = (currentPage-1)*mysl; i < qty; i++) {
          fylist.push({
            "houseNo":units[i].houseNo,
            "floor":units[i].floor,
            "houseName":units[i].houseName,
            "roomList":units[i].roomList
          })
        }               
      }
      setTimeout(()=>{
        _this.setData({
          room_list:_this.data.room_list.concat(fylist),
          page: currentPage
        })
      },10)
    }
  },
  inputSearch:function(e){  //输入搜索文字
    this.setData({
      searchtext:e.detail.value
    })
    search = e.detail.value;
    this.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
    this.get_roomList(userid,fylx,fz,xq,fjzt,search);
  },
  showSrarch: function(e){  //显示隐藏搜索框
    if(this.data.detail_search){
      this.setData({
        detail_search:false,
        showHight: 50,
      })
    }else{
      this.setData({
        detail_search:true,
        showHight: 0,
      })
    }
  },
  addFY: function( e ){  //新建房源
    let url = "";
    var LX = "1";
    if(!!fylx){
      LX = fylx;  //房源类型
    }
    if(LX == '1'){
      url = '/pages/zhengtao_add/zhengtao_add';
    }else if(LX == '3'){
      url = '/pages/hezu_add/hezu_add';
    }else if(LX == '2'){
      url = '/pages/zhengdong_add/zhengdong_add';
    }
    if( !!url ){
      wx.navigateTo({
        url: url
      })
    }
  },
    tapMainMenu: function(e) {        //获取当前显示的一级菜单标识
      var index = parseInt(e.currentTarget.dataset.index); //生成数组，全为hidden的，只对当前的进行显示
      var newSubMenuDisplay = initSubMenuDisplay();//如果目前是显示则隐藏，反之显示。同时要隐藏其他的菜单
      if(this.data.subMenuDisplay[index] == 'hidden') {
          newSubMenuDisplay[index] = 'show';
      } else {
          newSubMenuDisplay[index] = 'hidden';
      }        // 设置为新的数组
      this.setData({
        subMenuDisplay: newSubMenuDisplay
      });
    },
    tapSubMenu: function(e) {     // 隐藏所有一级菜单
      this.setData({
        subMenuDisplay: initSubMenuDisplay()
      });     
      // 处理二级菜单，首先获取当前显示的二级菜单标识
      var indexArray = e.currentTarget.dataset.index.split('-');        // 初始化状态
      var Ttype = e.currentTarget.dataset.type;  
      var code = e.currentTarget.dataset.code;
      if(Ttype=='FZ'){
        fz = code
      }else if(Ttype=='XQ'){
        xq = code
      }else if(Ttype=='FT'){
        fjzt = code;
        this.getOthername(fjzt);
      }
      for (var i = 0; i < initSubMenuHighLight.length; i++) {  
         // 如果点中的是一级菜单，则先清空状态，即非高亮模式，然后再高亮点中的二级菜单；
          if (indexArray[0] == i) {                
            for (var j = 0; j < initSubMenuHighLight[i].length; j++) {   // 实现清空
                initSubMenuHighLight[i][j] = '';
              }
          }
      }        
      // 与一级菜单不同，这里不需要判断当前状态，只需要点击就给class赋予highlight即可
      initSubMenuHighLight[indexArray[0]][indexArray[1]] = 'highlight';        // 设置为新的数组
      this.setData({
          subMenuHighLight: initSubMenuHighLight
      });
      this.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
      this.get_roomList(userid,fylx,fz,xq,fjzt,search);
    },
    showControl: function (e) {  //点击房源底部弹出操作
       hid =e.currentTarget.id;
       cczt = e.currentTarget.dataset.cz;
       const czlist = [];
       if(cczt=='1001'){
        czlist.push(
          {bindtap:'Menu1',txt:'入住详情'},
          {bindtap:'Menu2',txt:'房间详情'},
          {bindtap:'Menu3',txt:'开门记录'},
          {bindtap:'Menu4',txt:'智能设备'},
          //{bindtap:'Menu5',txt:'删除房间'},
          {bindtap:'Menu6',txt:'编辑房间'},
          {bindtap:'Menu9',txt:'添加同住人'},
          {bindtap:'Menu8',txt:'取消'},
        )
       }
       else{
        czlist.push(
          {bindtap:'Menu7',txt:'办理入住'},
          {bindtap:'Menu2',txt:'房间详情'},
          {bindtap:'Menu3',txt:'开门记录'},
          {bindtap:'Menu4',txt:'智能设备'},
          {bindtap:'Menu5',txt:'删除房间'},
          {bindtap:'Menu6',txt:'编辑房间'},
          {bindtap:'Menu10',txt:'简单入住'},
          {bindtap:'Menu8',txt:'取消'},
        )
       }
       this.setData({
        actionSheetItems:this.data.servicelist.concat(czlist),
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    actionSheetbindchange:function(){  //底部上弹
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    bindMenu1:function(){  //入住详情
      let that = this;
      var _data = {ac: 'get_contractNo',"hid":hid};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            var units = res.data.rows;
            contractNo = units[0].contractNo;
            wx.navigateTo({
              url: '../../pagesB/pages/rzxq_info/rzxq_info?contractNo='+contractNo
            })
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    bindMenu2:function(){  //房间详情
      wx.navigateTo({
        url: '../../pagesB/pages/room_info/room_info?hid='+hid
      }),
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    bindMenu3:function(){  //开门记录
      let that = this;
      var _data = {ac: 'get_macToMS',"hid":hid};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            var units = res.data.rows;
            if(units.length > 0){
              equip_no = units[0].equip_no;
              wx.navigateTo({
                url: '/pages/openLock_list/openLock_list?mac='+equip_no
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
            duration: 1000
          })
        },
        complete(){
        }
      });  
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    bindMenu4:function(){  //智能设备
      wx.navigateTo({
        url: '/pages/device_list/device_list?hid='+hid
      }),
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    bindMenu5:function(e){  //删除房间
      let that =this;
      let delType = "fj";
      wx.showModal({
        title: '删除房间',
        content: '确认删除？',
        success: function (res) {
          if (res.confirm) {//这里是点击了确定以后
            var _data = {ac: 'judge_device',"houseNo":"","floor":"","hid":hid,"LX":delType};
            wx.request({
              url: apiUrl,
              data: _data,
              header: {'Content-Type': 'application/json'},
              method: "get",
              success(res) {
                var units = res.data.rows;
                if(units.length > 0){
                  wx.showToast({
                    title: '请先解绑设备再删除!',
                    icon: "none",
                    duration: 1000
                  });
                }
                else{
                  var _data = {ac: 'room_del',"userid":userid,"hid":hid};
                  wx.request({
                    url: apiUrl,
                    data: _data,
                    header: {'Content-Type': 'application/json'},
                    method: "get",
                    success(res) {
                        console.log("getunits success:",res); 
                        wx.showToast({
                          title: '删除成功',
                          icon: "success",
                          duration: 500//持续的时间
                        });
                        setTimeout(()=>{
                          that.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
                          that.get_roomList(userid,fylx,fz,xq,fjzt,search);
                        },1000)
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
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    bindMenu6:function(){  //编辑房间
      wx.navigateTo({
        //url: '../../pagesB/pages/room_update/room_update?hid='+hid
        url: '../../pagesB/pages/room_next/room_next?hid='+hid
      }),
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    bindMenu7:function(){  //办理入住
      wx.navigateTo({
        url: '../../pagesB/pages/checkIn_add/checkIn_add?hid='+hid
      }),
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    bindMenu9:function(){  //添加同住人
      wx.navigateTo({
        url: '../../pagesB/pages/roomUser_add/roomUser_add?hid='+hid
      }),
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    bindMenu10:function(){  //简单入住
      wx.navigateTo({
        url: '../../pagesA/pages/jdrz_add/jdrz_add?hid='+hid
      }),
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    bindMenu8:function(){  //取消
      this.setData({
        actionSheetHidden:!this.data.actionSheetHidden
      })
    },
    onReady: function () {  //生命周期函数--监听页面初次渲染完成
    },
    onShow: function () { //生命周期函数--监听页面显示
      let emp_no = app.globalData.userid;
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
          selected: 1
        })
      }
      if(fylx!="2"){
        this.get_roomTotal(userid,fylx,fz,xq,fjzt,search);  
        this.get_roomList(userid,fylx,fz,xq,fjzt,search);
      }else{
        if(!!xq && xq!="ALL"){
          this.get_roomTotal(userid,fylx,fz,xq,fjzt,search);  
          this.get_roomList(userid,fylx,fz,xq,fjzt,search);
        }
        let myid = "1";  //初始化到最顶层
        this.setData({
          lifeActiveNum: myid,
          leftId: "left" + myid,
          rightId: "right" + myid
        })
      } 
      if(!!emp_no){
        this.Judge_loginGJ(emp_no);  //判断用户是否有权登陆
      }
    },
    getOthername:function (fjzt) { //获取房间状态中文名
      let _this = this;
      var _data = {ac: 'get_Othername',"code":fjzt};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            _this.setData({
              fjztmc:units[0].othername,
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
    addRoom: function (e) {  //点击房源底部弹出操作
      var that = this;
      houseNo = e.currentTarget.dataset.h;
      floor = e.currentTarget.dataset.f;
      var roomNo = "";
      var floorMax = "";
      that.get_houseFloor(houseNo);  //获取楼栋的楼层
      that.setData({
        lcIndex:that.get_indexYW(lcQJ,floor),//获取一维数组下标
      })
      var _data = {ac: 'get_roomNo',"houseNo":houseNo,"floor":floor};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        async:false,  //同步   
        success(res) {
          if(res.data.status=="1"){
            roomNo = res.data.roomNo;
            fjName = res.data.roomNo;
            floorMax = parseInt(res.data.floorMax)+1;
            fjNameF = parseInt(res.data.floorMax)+1;
          }
          that.setData({
            fjmc:roomNo,
            szlc:floorMax,
          })  
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
      const czlist_add = [];
      if(fylx=="2"){
        czlist_add.push(
          {bindtap:'AddF',txt:'新增楼层'},
          {bindtap:'Add1',txt:'新增房间'},
          {bindtap:'DelF',txt:'删除整层'},
          {bindtap:'PZFJ',txt:'配置房间'},
          {bindtap:'SCLD',txt:'删除楼栋'},
          {bindtap:'QX',txt:'取消'},     
        )
      }
      else if(fylx=="3"){
        czlist_add.push(
          {bindtap:'Add1',txt:'新增房间'},
          {bindtap:'Edit',txt:'完善房间'},
          {bindtap:'SCFY',txt:'删除房源'},
          {bindtap:'QX',txt:'取消'}, 
        )
      }
      this.setData({
        actionSheetItems_add:this.data.servicelist.concat(czlist_add),
        actionSheetHidden_add:!this.data.actionSheetHidden_add,
        floor:floor
      })    
    },
    actionSheetbindchange_add:function(){  //底部上弹
      this.setData({
       actionSheetHidden_add:!this.data.actionSheetHidden_add
      })
    },
    get_houseFloor:function (houseNo) { //获取楼栋的楼层
      let _this = this;
      var _data = {ac: 'get_houseFloor',"houseNo":houseNo};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        async:false,  //同步   
        success(res) {
          var units = res.data.rows;
          lcQJ = units;
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
  //获取一维数组下标
  get_indexYW:function(arrayName,code){
    let arrtofor=arrayName;
    for (let index = 0; index < arrtofor.length; index++) {
      if(arrtofor[index].code==code){
        return index;
      }
    }
  },
  bindFloorChange: function(e) {
    this.setData({
      lcIndex: e.detail.value,
      fjmc:""
    })
    fjName = "";
    floor = this.data.lc[e.detail.value].code;
    //console.log("选择的楼层："+floor);
  },
  bindPZFJ:function(){  //配置房间
      wx.navigateTo({
        url: '../../pagesB/pages/batchRoom_list/batchRoom_list?houseNo='+houseNo
      }),
      this.setData({
        actionSheetHidden_add:!this.data.actionSheetHidden_add
      })
    },
    bindEdit:function(){  //完善房间
      wx.navigateTo({
        url: '../../pagesB/pages/publishRoom_list/publishRoom_list?houseNo='+houseNo
      }),
      this.setData({
        actionSheetHidden_add:!this.data.actionSheetHidden_add
      })
    },
    bindAdd1:function(){  //新增房间
      this.setData({
        ifName: true,    //显示弹出框
        ifNameF: false,    //隐藏弹出框
        actionSheetHidden_add:!this.data.actionSheetHidden_add
      })
    },
    bindAddF:function(){  //新增楼层
      this.setData({
        ifName: false,    //隐藏弹出框
        ifNameF: true,    //显示弹出框
        actionSheetHidden_add:!this.data.actionSheetHidden_add
      })
    },
    bindQX:function(){  //取消
      this.setData({
        actionSheetHidden_add:!this.data.actionSheetHidden_add
      })
    },
    setValue: function(e) {   //楼栋名称值改变事件
      fjName = e.detail.value;
    },
    cancel: function (e) {  //取消
      fjName = "";
      this.setData({
        ifName: false,    //隐藏弹出框
        fjmc:""
      }); 
    },
    confirm: function (e) {  //确定
      var that = this;
      var LY = "管家";
      //console.log("最终楼层："+floor);
      if(!fjName){
        wx.showToast({
          title: '房号不能为空',
          icon: "none",
          duration: 1000
        })
        return false;
      }      
      if(!floor){
        wx.showToast({
          title: '楼层不能为空',
          icon: "none",
          duration: 1000
        })
        return false;
      }
      var _data = {ac: 'room_save',"houseNo":houseNo,"floor":floor,"fjName":fjName,"userid":userid,"LY":LY};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          wx.showToast({
            title: '新增成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            fjName = "";
            that.setData( {
              ifName: false,    //隐藏弹出框
              fjmc:""
            });
            that.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
            that.get_roomList(userid,fylx,fz,xq,fjzt,search);
          },500)
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      }); 
    },
    setValueF: function(e) {  //楼层事件
      this.setData({
        szlc:e.detail.value
      }); 
    },
    setValueR: function(e) {  //房间事件
      this.setData({
        mcfjs:e.detail.value
      }); 
    },
    cancelF: function (e) {  //取消
      this.setData({
        ifNameF: false,    //隐藏弹出框
        szlc:"",
        mcfjs:""
      }); 
    },
    confirmF: function (e) {  //确定
      var that = this;
      var LY = "管家";
      let szlc = that.data.szlc;
      let mcfjs = that.data.mcfjs;
      if(!szlc){szlc = 0;}
      if(!mcfjs){mcfjs = 0;}
      if(szlc<=0 || szlc>100){
        wx.showToast({
          title: '楼层必须在1~100内',
          icon: "none",
          duration: 1000
        })
        return false;
      }
      if(mcfjs<=0 || mcfjs>200){
        wx.showToast({
          title: '房间数必须在1~200内',
          icon: "none",
          duration: 1000
        })
        return false;
      } 
      var _data = {ac: 'floor_save',"houseNo":houseNo,"fjNameF":szlc,"userid":userid,"LY":LY,"mcfjs":mcfjs};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          wx.showToast({
            title: '新增成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            fjNameF = "";
            that.setData( {
              ifNameF: false,    //隐藏弹出框
              szlc:"",
              mcfjs:"",
            });
            that.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
            that.get_roomList(userid,fylx,fz,xq,fjzt,search);
          },500)
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      }); 
    },
    bindDelF: function () {  //删除整层
      let that =this;
      let floorNo = this.data.floor;
      let delType = "lc";
      this.setData({
        actionSheetHidden_add:!this.data.actionSheetHidden_add,
      })
      wx.showModal({
        title: '删除整层',
        content: '确认删除？',
        success: function (res) {
          if (res.confirm) {//这里是点击了确定以后
            var _data = {ac: 'judge_device',"houseNo":houseNo,"floor":floorNo,"hid":"","LX":delType};
            wx.request({
              url: apiUrl,
              data: _data,
              header: {'Content-Type': 'application/json'},
              method: "get",
              success(res) {
                var units = res.data.rows;
                if(units.length > 0){
                  wx.showToast({
                    title: '请先解绑设备再删除!',
                    icon: "none",
                    duration: 1000
                  });
                }
                else{
                  var _data = {ac: 'floor_del',"userid":userid,"houseNo":houseNo,"floorNo":floorNo};
                  wx.request({
                    url: apiUrl,
                    data: _data,
                    header: {'Content-Type': 'application/json'},
                    method: "get",
                    success(res) {
                      if(res.data.status=='1'){
                        wx.showToast({
                          title: '删除成功',
                          icon: "success",
                          duration: 500
                        });
                        setTimeout(()=>{
                          that.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
                          that.get_roomList(userid,fylx,fz,xq,fjzt,search);
                        },1000)
                      }
                      else if(res.data.status=='2'){
                        wx.showToast({
                          title: '有在租房间，不能删除整层',
                          icon: "none",
                          duration: 1000
                        });
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
    },
    bindSCLD: function () {  //删除楼栋
      let that =this;
      that.house_del();  //删除房源
    },
    bindSCFY: function () {  //删除房源
      let that =this;
      that.house_del();
    },
    house_del: function () {  //删除房源
      let that =this;
      let delType ="ld"; //楼栋
      this.setData({
        actionSheetHidden_add:!this.data.actionSheetHidden_add,
      })
      wx.showModal({
        title: '删除房源',
        content: '确认删除房源？',
        success: function (res) {
          if (res.confirm) {//这里是点击了确定以后
            var _data = {ac: 'judge_device',"houseNo":houseNo,"floor":"","hid":"","LX":delType};
            wx.request({
              url: apiUrl,
              data: _data,
              header: {'Content-Type': 'application/json'},
              method: "get",
              success(res) {
                var units = res.data.rows;
                if(units.length > 0){
                  wx.showToast({
                    title: '请先解绑设备再删除!',
                    icon: "none",
                    duration: 1000
                  });
                }
                else{
                  var _data = {ac: 'house_del',"userid":userid,"houseNo":houseNo};
                  wx.request({
                    url: apiUrl,
                    data: _data,
                    header: {'Content-Type': 'application/json'},
                    method: "get",
                    success(res) {
                      if(res.data.status=='1'){
                        wx.showToast({
                          title: '删除成功',
                          icon: "success",
                          duration: 500
                        });
                        setTimeout(()=>{
                          that.get_roomTotal(userid,fylx,fz,xq,fjzt,search);
                          that.get_roomList(userid,fylx,fz,xq,fjzt,search);
                        },1000)
                      }
                      else if(res.data.status=='2'){
                        wx.showToast({
                          title: '有在租房间，不能删除房源',
                          icon: "none",
                          duration: 1000
                        });
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
    },
    leftClick(e) {
      this.setData({
        lifeActiveNum: e.target.dataset.myid,
        leftId: "left" + e.target.dataset.myid,
        rightId: "right" + e.target.dataset.myid
      })
    },
    onReady() {
      let _this = this
      setTimeout(() => {
        let initArr = [0]; //初始数组
        let initNum = 0; //初始数值
        const query = wx.createSelectorQuery()
        query.selectAll('.rightblock').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
          console.log(res[0]);
          res[0].map(val => {
            initNum += val.height; //实现高度的累加
            initArr.push(initNum) //初始数值加进数组中
          })
          console.log(initArr); //拿到每一个height  存起来
          _this.setData({
            heightArr: initArr
          })
        })
      }, 300)
    },
    // 右边滚动事件
    rightScrollTop(e){
      var that = this;
      let st=e.detail.scrollTop;
      let myarr=this.data.heightArr;
      for(let i=0;i<myarr.length;i++){
        if(st>=myarr[i]&&st<myarr[i+1]-50){
          let f = that.data.room_list[i].floor;
          this.setData({
            leftId:"left"+f,
            lifeActiveNum:f
          })
          return;
        }
      }
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
    },
    onHide: function () {  //生命周期函数--监听页面隐藏
    },
    onUnload: function () {  //生命周期函数--监听页面卸载
    },
    onPullDownRefresh: function () { //页面相关事件处理函数--监听用户下拉动作
    },
    onReachBottom: function () { //页面上拉触底事件的处理函数
    }
  })