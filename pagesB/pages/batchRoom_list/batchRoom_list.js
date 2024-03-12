var houseNo= "";  //房源编号
var hid= "";  //房间id
var userid= "";  //登陆人工号
var fjName = "" //房间名称
var floorNo = "" //楼层
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({
    data: {
    winWidth: 0,
    winHeight: 0,
    leftId: "left0",
    rightId: "right0",
    lifeActiveNum: 0,
    heightArr: [],
    checked: false,
    select_all: false,
    batchIds:[]
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    houseNo = options.houseNo;
    //houseNo = "FN2207070161";
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
    that.house_list(userid,houseNo);
  },
  house_list:function (userid,houseNo) { //获取房间列表
    let _this = this;
    var _data = {ac: 'roomList',"userid":userid,"houseNo":houseNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows; 
        const newlist = [];
          setTimeout(()=>{
            _this.setData({
            menuArr:units
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
        let f = that.data.menuArr[i].floor;
        this.setData({
          leftId:"left"+f,
          lifeActiveNum:f
        })
        return;
      }
    }
  },
  checked: function(e) {   //单选按钮，选中和取消
    var that = this;
    let floor = e.currentTarget.dataset.floor;
    let index = "";
    var oldCheckArr = this.data.menuArr; 
    for (let i = 0; i < that.data.menuArr.length; i++) {
      if (that.data.menuArr[i].floor == floor){
        index = i;
        break;
      }
    }
    var check = that.data.menuArr[index].checked;
    //console.log("下标值："+index);
    if (check) {
    this.data.checked = false;
    } else {
    this.data.checked = true;
    }
    oldCheckArr[index].checked = this.data.checked;
    this.setData({
      //"checked": this.data.checked,
      menuArr:oldCheckArr
    });
    this.selectall(index);
  }, 
  //全选与反全选
  selectall: function (index) {
    var that = this;
    var arr = [];   //存放选中id的数组
    for (let i = 0; i < that.data.menuArr[index].roomList.length; i++) {
      //that.data.menuArr[index].roomList[i].checked = (!that.data.select_all)
      that.data.menuArr[index].roomList[i].checked = that.data.menuArr[index].checked;
      if (that.data.menuArr[index].roomList[i].checked == true){
        // 全选获取选中的值
        arr = arr.concat(that.data.menuArr[index].roomList[i].hid.split(','));
      }
    }
    that.setData({
      menuArr: that.data.menuArr,
      select_all: (!that.data.select_all),
      batchIds:arr
    })
  },
  checkboxChange: function(e) {
    var that = this;
    //console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    let floor = e.currentTarget.dataset.floor;
    let index = "";
    for (let i = 0; i < that.data.menuArr.length; i++) {
      if (that.data.menuArr[i].floor == floor){
        index = i;
        break;
      }
    }
    const items = that.data.menuArr[index].roomList
    const values = e.detail.value
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
      items[i].checked = false
      for (let j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (items[i].hid === values[j]) {
          items[i].checked = true
          break
        }
      }
    }
    that.setData({
      items:items
    })
  },
  addRoom: function (e){ //添加房间
   var that = this;
   floorNo = e.currentTarget.dataset.floorno;
   var roomNo = "";
   var _data = {ac: 'get_roomNo',"houseNo":houseNo,"floor":floorNo};
   wx.request({
     url: apiUrl,  //api地址
     data: _data,
     header: {'Content-Type': 'application/json'},
     method: "get",
     success(res) {
        if(res.data.status=="1"){
          roomNo = res.data.roomNo;
          fjName = res.data.roomNo;
        }
        that.setData({
          ifName: true,
          floorNo:floorNo,
          fjmc:roomNo,
        })  
     },
     fail(res) {
       console.log("getunits fail:",res);
     },
     complete(){
     }
   });  
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
    var _data = {ac: 'room_save',"houseNo":houseNo,"floor":floorNo,"fjName":fjName,"userid":userid,"LY":LY};
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
          that.house_list(userid,houseNo);
        },10)
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    }); 
  },
  goback: function (e){  //返回列表
    wx.switchTab({
      url: '../../../pages/room_list2/room_list2'
    })
  },
  jumpPZ: function (e){  //跳转到配置页面
    var that = this;
    var arr = []; 
    var arrName = []; 
    let items = that.data.menuArr;
    for (let i = 0; i < items.length; i++) {
       let listRoom = items[i].roomList;
       for(let j = 0; j < listRoom.length; j++){
        if(listRoom[j].checked == true){
          arr = arr.concat(listRoom[j].hid.split(','));
          arrName = arrName.concat(listRoom[j].roomNo.split(','));
        }
      }
    }
    console.log("最终选中的值:"+arr);
    console.log("最终选中的房间:"+arrName);
    if(arr.length==0){
      wx.showToast({
        title: '请选择房间',
        icon: "none",
        duration: 1000
      })
    }
    else{
      wx.navigateTo({
        url: '../../../pagesB/pages/configureRoom/configureRoom?houseNo='+houseNo+'&roomNo='+arrName+'&yxfj='+arr
      })
    }
  },
  del: function (e){  //删除被选中房间
    var that = this;
    var arr = []; 
    var arrName = []; 
    let items = that.data.menuArr;
    for (let i = 0; i < items.length; i++) {
       let listRoom = items[i].roomList;
       for(let j = 0; j < listRoom.length; j++){
        if(listRoom[j].checked == true){
          arr = arr.concat(listRoom[j].hid.split(','));
          arrName = arrName.concat(listRoom[j].roomNo.split(','));
        }
      }
    }
    if(arr.length==0){
      wx.showToast({
        title: '请选择房间',
        icon: "none",
        duration: 1000
      })
    }
    else{
      wx.showModal({
        title: '删除房间',
        content: '确认删除选中的房间？',
        success: function (res) {
          if (res.confirm) { //这里是点击了确定以后
            var _data = {ac: 'batch_del',"houseNo":houseNo,"yxfj":arr};
            wx.request({
              url: apiUrl,
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
                    that.house_list(userid,houseNo);
                },500)
              },
              fail(res) {
                console.log("getunits fail:",res);
              },
              complete(){
              }
            });
          } else {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  onShow: function () {  //生命周期函数--监听页面显示
    var that = this;
    that.house_list(userid,houseNo);
  }
})