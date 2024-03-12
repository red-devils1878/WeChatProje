// pages/checkIn_list/checkIn_list.js
function initSubMenuDisplay() { 
    return ['hidden', 'hidden', 'hidden'];
  }
  var initSubMenuHighLight = [
    ['','','','',''],
    ['',''],
    ['','','']
  ];
  var fylx="";     //房源类型
  var search= "";  //搜索内容
  var fz="";     //分组
  var xq= "";    //房源类型
  var fy= "";  //房源名称
  var czzt = '1002';
  var hid= "";  //房间id
  var userid= "";  //登陆人工号
  var mysl = 6; //每页8层
  var page_total = 0; //总页数
  var fyQJ = [];  //房源数组
  var app = getApp();
  var apiUrl = "";   //获取api地址
  Page({
    data: { //页面的初始数据
      subMenuDisplay:initSubMenuDisplay(),
      showsearch:true,   //显示搜索按钮
      searchtext:'',  //搜索文字
      filterdata:{},  //筛选条件数据
      showfilter:false, //是否显示下拉筛选
      showfilterindex:null, //显示哪个筛选类目
      room_list:[], //服务集市列表
      scrolltop:null, //滚动位置
      page: 0,  //分页
      leftId: "left0",
      rightId: "right0",
      lifeActiveNum: 0,
      heightArr: [],
    },
  
    onLoad: function (options) {  //生命周期函数--监听页面加载
      var that = this;
      fylx = ""; //初始化成整套
      apiUrl = app.globalData.apiUrl; 
      userid = app.globalData.userid;   //登陆人工号
      //获取当前设备的宽高
      wx.getSystemInfo( {
        success: function( res ) {
          that.setData( {
            winWidth: res.windowWidth,
            winHeight: res.windowHeight,
          });
        }
      });
      this.get_houseBelong();  //获取分组
      this.get_houseType();  //获取房源类型
      this.get_houseName(fylx);    //获取房源
      //this.get_showingsList(userid,fz,xq,search,czzt,fy); //获取房间
      //this.get_roomTotal(userid,fz,xq,search,czzt,fy); //获取房间总数
    },
    get_houseBelong:function () { //获取分组
      let _this = this;
      var _data = {ac: 'get_houseBelong'};
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
                "sid":units[i].sid,
                "sname":units[i].sname
              })
            }
            setTimeout(()=>{
              _this.setData({
                fz_list:newlist
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
    get_houseType:function () { //获取房源名称
      let _this = this;
      let otherid = "IB_houseType";
      var _data = {ac: 'get_dropDownCode',"otherid":otherid};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            const xqlist = [];
            var units = res.data.rows;
            for (var i = 0; i < units.length; i++) {
              xqlist.push({
                "i":i,
                "rid":units[i].code,
                "rname":units[i].othername
              })
            }
            setTimeout(()=>{
              _this.setData({
                xq_list:xqlist
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
    get_houseName:function (fylx) { //获取房源名称
      let _this = this;
      //var _data = {ac: 'get_houseName',"userid":userid};
      var _data = {ac: 'get_houseNameTofylx',"userid":userid,"fylx":fylx};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          const houselist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            houselist.push({
              "i":i,
              "rid":units[i].houseNo,
              "rname":units[i].houseName
            })
          }
          setTimeout(()=>{
            _this.setData({
              fy_list:houselist
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
    get_showingsList:function (userid,fz,xq,search,czzt,fy) { //获取房间列表
      if(xq==""){ xq = "1" }
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
      var _data = {ac: 'get_roomListN',"userid":userid,"fz":fz,"xq":xq,"search":search,"czzt":czzt,"fy":fy};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
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
          },10)
        },
        fail(res) {
          console.log("getunits fail:",res);
        },
        complete(){
        }
      });  
    },
    get_roomTotal:function (userid,fz,xq,search,czzt,fy) { //获取房间总数
      let _this = this;
      var _data = {ac: 'get_roomNewTotal',"userid":userid,"fz":fz,"xq":xq,"search":search,"czzt":czzt,"fy":fy};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          var units = res.data.rows;
          var total = units[0].roomTotal;
            _this.setData({
            total_dj:total
          })
        },
        fail(res) {
          console.log("getunits fail:",res);
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
      this.get_showingsList(userid,fz,xq,search,czzt,fy);  //房间列表
      this.get_roomTotal(userid,fz,xq,search,czzt,fy);  //房间总数
    },
    hideFilter: function(){ //关闭筛选面板
      this.setData({
        showfilter: false,
        showfilterindex: null
      })
    },
    goToTop:function(){ //回到顶部
      this.setData({
        scrolltop:0
      })
    },
    scrollLoading:function(){ //滚动加载
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
    onPullDownRefresh:function(){ //下拉刷新
      /*
      this.setData({
        page:0,
        room_list:[]
      })
      this.get_showingsList(userid,fz,xq,search,czzt,fy); 
      this.get_roomTotal(userid,fz,xq,search,czzt,fy);  //房间总数
      setTimeout(()=>{
        wx.stopPullDownRefresh()
      },1000)
    */
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
        fz = code;
      }else if(Ttype=='XQ'){
        xq = code;
        fylx = code;
        this.get_houseName(fylx);    //获取房源
      }else if(Ttype=='FY'){
        fy = code;
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
      if((fylx=="2" || fylx=="ALL" || fylx=="") && (fy=="ALL" || fy=="")){
        wx.showToast({
          title: '整栋的要选具体楼栋',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
      else{
        this.get_showingsList(userid,fz,xq,search,czzt,fy); 
        this.get_roomTotal(userid,fz,xq,search,czzt,fy);  //房间总数 
      }
    },
    bindJump: function (e) {  //跳转到办理入住
      hid =e.currentTarget.id;
      wx.navigateTo({
        url: '../../pagesB/pages/checkIn_add/checkIn_add?hid='+hid
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
    onShow: function () {  //生命周期函数--监听页面显示
      //this.get_showingsList(userid,fz,xq,search,czzt,fy); //获取房间
      //this.get_roomTotal(userid,fz,xq,search,czzt,fy); //获取房间总数
    }
  })