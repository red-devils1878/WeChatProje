// pages/ddms_list/ddms_list.js
function initSubMenuDisplay() { 
    return ['hidden', 'hidden'];
  }
  var initSubMenuHighLight = [
    ['','','','',''],
    ['','']
  ];
  var search= "";  //搜索内容
  var fz="";     //分组
  var xq= "";    //小区
  var mslx = "门锁低电";    //异常类型
  var total_dj=0;  //总笔数
  var userid= "";  //登陆人工号
  var mysl = 20; //每页数量
  var page_total = 0; //总页数
  var fyQJ = [];  //房源数组
  var app = getApp();
  var apiUrl = "";   //获取api地址
  Page({
  
    data: {
      subMenuDisplay:initSubMenuDisplay(),
      showsearch:true,   //显示搜索按钮
      searchtext:'',  //搜索文字
      filterdata:{},  //筛选条件数据
      showfilter:false, //是否显示下拉筛选
      showfilterindex:null, //显示哪个筛选类目
      servicelist:[], //服务集市列表
      scrolltop:null, //滚动位置
      page: 0  //分页
    },
    onLoad: function (options) {  //生命周期函数--监听页面加载
      var that = this;
      search = "";
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
      this.get_houseName();  //获取房源类型
      this.get_ddmsList(userid,fz,xq,mslx,search); //获取门锁设备
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
    get_houseName:function () { //获取房源类型
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
    get_ddmsList:function (userid,fz,xq,mslx,search) { //门锁列表
      let _this = this;
      fyQJ = [];  //初始化房源数组
      _this.setData({
        servicelist:[],
        total_dj:0
      })
      this.setData({
        page:1
      })
      const page = this.data.page;
      var tips = "加载中...";
      wx.showLoading({
       title: tips,
      })
      var _data = {ac: 'doorLock_list',"userid":userid,"fz":fz,"xq":xq,"mslx":mslx,"search":search};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            wx.hideLoading(); 
            const newlist = [];
            var units = res.data.rows;
            total_dj = units.length;
            if(!total_dj){
              total_dj = 0;
            }
            if(total_dj > 0){
              fyQJ = units;
              page_total = Math.ceil(total_dj/mysl);  //总页数
              var qty = 0;
              if(total_dj > page*mysl){
                qty = page*mysl;
              }
              else{
                qty = total_dj;
              }
              for (var i = (page-1)*mysl; i < qty; i++) {
                newlist.push({
                  "id":units[i].equip_no,
                  "name":units[i].mc,
                  "imgurl":"/static/images/my/02.png",
                  "imgurl2":"/static/images/my/dianchi2.png",
                  "dl":units[i].dcdl
                })
              }              
            }
            setTimeout(()=>{
              _this.setData({
                servicelist:newlist,
                total_dj:total_dj
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
    inputSearch:function(e){  //输入搜索文字
      this.setData({
        showsearch:1,
        searchtext:e.detail.value
      })
    },
    submitSearch:function(){  //提交搜索
      search = this.data.searchtext;
      this.get_ddmsList(userid,fz,xq,mslx,search);  //门锁列表
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
          const newlist = [];
          var units = fyQJ;
          var qty_total = units.length; //总条数
          if(qty_total > 0){
            var qty = 0;
            if(qty_total > currentPage*mysl){
              qty = currentPage*mysl;
            }
            else{
              qty = qty_total;
            }
            for (var i = (currentPage-1)*mysl; i < qty; i++) {
              newlist.push({
                "id":units[i].equip_no,
                "name":units[i].mc,
                "imgurl":"/static/images/my/02.png",
                "imgurl2":"/static/images/my/dianchi2.png",
                "dl":units[i].dcdl
              })
            }               
          }
          setTimeout(()=>{
            _this.setData({
              servicelist:_this.data.servicelist.concat(newlist),
              page: currentPage
            })
          },10)
      }
    },
    onPullDownRefresh:function(){ //下拉刷新
      /*
      this.setData({
        page:0,
        servicelist:[]
      })
      this.get_ddmsList(userid,fz,xq,mslx,search); 
      setTimeout(()=>{
        wx.stopPullDownRefresh()
      },1000)
      */
    },
    deviceAdd:function(e){  //新增设备
      wx.navigateTo({
        url: '../../../pagesA/pages/device_addSB/device_addSB'
      })
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
      }else if(Ttype=='SB'){
        sblx = code
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
      this.get_ddmsList(userid,fz,xq,mslx,search); 
    },
    onShow: function () {  //生命周期函数--监听页面显示
    }
  })