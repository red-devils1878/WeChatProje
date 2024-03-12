// pages/contract_list/contract_list.js
function initSubMenuDisplay() { 
    return ['hidden', 'hidden', 'hidden'];
  }
  var initSubMenuHighLight = [
    ['','','','',''],
    ['',''],
    ['','']
  ];
  var search= "";  //搜索内容
  var htzt="";     //合同状态
  var qyfs= "";    //签约方式
  var czlx= "";    //出租类型
  var userid= "";  //登陆人工号
  var mysl = 15; //每页数量
  var page_total = 0; //总页数
  var fyQJ = [];  //房源数组
  var app = getApp();
  var apiUrl = "";   //获取api地址
  Page({
  
    data: {  //页面的初始数据
      subMenuDisplay:initSubMenuDisplay(),
      showsearch:true,   //显示搜索按钮
      searchtext:'',  //搜索文字
      filterdata:{},  //筛选条件数据
      showfilter:false, //是否显示下拉筛选
      showfilterindex:null, //显示哪个筛选类目
      room_list:[], //服务集市列表
      scrolltop:null, //滚动位置
      page: 0  //分页
    },
  
    onLoad: function (options) {  //生命周期函数--监听页面加载
      var that = this;
      search = "";
      apiUrl = app.globalData.apiUrl;
      userid = app.globalData.userid;   //登陆人工号
      //userid = "gly5387";   //登陆人工号
      //获取当前设备的宽高
      wx.getSystemInfo( {
          success: function( res ) {
              that.setData( {
                  winWidth: res.windowWidth,
                  winHeight: res.windowHeight,
              });
          }
      });
      this.get_htzt();  //获取合同状态
      this.get_qyfs();  //获取签约方式
      this.get_czlx();  //获取出租类型
      this.get_contractList(userid,htzt,qyfs,czlx,search); //合同列表
    },
    get_htzt:function () { //获取合同状态
      let _this = this;
      let otherid = "IB_htState";  //合同状态
      var _data = {ac: 'get_dropDownCode',"otherid":otherid};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            const htztlist = [];
            var units = res.data.rows;
            for (var i = 0; i < units.length; i++) {
              htztlist.push({
                "i":i,
                "codeZT":units[i].code,
                "othernameZT":units[i].othername
              })
            }
            setTimeout(()=>{
              _this.setData({
                htzt_list:htztlist
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
    get_qyfs:function () { //获取签约方式
      let _this = this;
      let otherid = "IB_qylx";  //签约方式
      var _data = {ac: 'get_dropDownCode',"otherid":otherid};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            const qyfslist = [];
            var units = res.data.rows;
            for (var i = 0; i < units.length; i++) {
              qyfslist.push({
                "i":i,
                "codeFS":units[i].code,
                "othernameFS":units[i].othername
              })
            }
            setTimeout(()=>{
              _this.setData({
                qyfs_list:qyfslist
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
    get_czlx:function () { //获取出租类型
      let _this = this;
      let otherid = "IB_houseType";
      var _data = {ac: 'get_dropDownCode',"otherid":otherid};
      wx.request({
        url: apiUrl,
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            const czlxlist = [];
            var units = res.data.rows;
            for (var i = 0; i < units.length; i++) {
              czlxlist.push({
                "i":i,
                "codeLX":units[i].code,
                "othernameLX":units[i].othername
              })
            }
            setTimeout(()=>{
              _this.setData({
                czlx_list:czlxlist
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
    get_contractList:function (userid,htzt,qyfs,czlx,search) { //合同列表
      let _this = this;
      fyQJ = [];  //初始化房源数组
      _this.setData({
        servicelist:[]
      })
      this.setData({
        page:1
      })
      const page = this.data.page;
      var tips = "加载中...";
      wx.showLoading({
       title: tips,
      })
      var _data = {ac: 'contract_list',"userid":userid,"htzt":htzt,"qyfs":qyfs,"czlx":czlx,"search":search};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
            wx.hideLoading();          
            const newlist = [];
            var units = res.data.rows;
            var qty_total = units.length; //总条数
            if(qty_total > 0){
              fyQJ = units;
              page_total = Math.ceil(qty_total/mysl);  //总页数
              var qty = 0;
              if(qty_total > page*mysl){
                qty = page*mysl;
              }
              else{
                qty = qty_total;
              }
              for (var i = (page-1)*mysl; i < qty; i++) {
                newlist.push({
                  "id":units[i].contractNo,
                  "hid":units[i].roomId,
                  "houseName":units[i].houseName,
                  "htzt_name":units[i].htzt_name,
                  "tenantName":units[i].tenantName,
                  "rzzq":units[i].rzzq,
                  "cz_state":units[i].ht_status,
                })
              }              
            }
            setTimeout(()=>{
              _this.setData({
                servicelist:newlist
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
      this.get_contractList(userid,htzt,qyfs,czlx,search);
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
    onPullDownRefresh:function(){ //下拉刷新
      /*
      this.setData({
        page:0,
        room_list:[]
      })
      this.get_contractList(userid,htzt,qyfs,czlx,search);
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
      if(Ttype=='HTZT'){  //合同状态
        htzt = code
      }else if(Ttype=='QYFS'){  //签约方式
        qyfs = code
      }
      else if(Ttype=='CZlx'){  //出租类型
        czlx = code
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
      this.get_contractList(userid,htzt,qyfs,czlx,search);
    },
    bindJump: function (e) {
      let hth = e.currentTarget.dataset.key;
      wx.navigateTo({
        url: '../../pagesB/pages/rzxq_info/rzxq_info?contractNo='+hth
      }) 
    },
    scrollLoading: function() {
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
                "id":units[i].contractNo,
                "hid":units[i].roomId,
                "houseName":units[i].houseName,
                "htzt_name":units[i].htzt_name,
                "tenantName":units[i].tenantName,
                "rzzq":units[i].rzzq,
                "cz_state":units[i].ht_status,
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
    onShow: function () {  //生命周期函数--监听页面显示
    }
  })