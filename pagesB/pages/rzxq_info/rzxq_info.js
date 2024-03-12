var contractNo= "";  //合同号
var remark = "";
var userid= "";  //登陆人工号
var hid = "";
var fileid = "";
var dsn = "";  //设备号
var lylx = ""; //来源类型
var ptlx= "hongqi";  //平台类型
var htzt = ""; //合同状态
var fjzt = ""; //房间状态
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
var apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var BLE_new = require('../../../utils/BLE_new.js');  //蓝牙操作文档
var com = require('../../../utils/commom.js');  //公共js
var index_del = 0;  //新下标(删除)
var index_add = 0;  //新下标(下发)
Page({
  data: {
    actionSheetHidden:true,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    showMB:true, //幕布
    AllPwdlist:[],  //所有密码和指纹
    pwdlist:[],  //密码
    second: 30, //倒计时20秒
    c:""//定时器
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiNC = app.globalData.apiNC;     //获取门锁api地址(新锁)
    userid = app.globalData.userid;   //登陆人工号
    contractNo = options.contractNo;
    //contractNo = "Cont2204080050";
    //获取当前设备的宽高
    wx.getSystemInfo( { 
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    that.checkIn_info(contractNo);  //获取入住详情
    that.checkIn_tzr(contractNo);  //获取同住人
  },
   //  tab切换逻辑
   swichNav: function( e ) {
    var that = this;
    var tabV = e.target.dataset.current;
    if( this.data.currentTab === e.target.dataset.current ) {
      return false;
    } else {
      that.setData( {
        currentTab: e.target.dataset.current
      })
    }
    if(tabV=='1'){  //账单信息
      that.get_zdxx(contractNo); 
    }
    else if(tabV=='2'){ //账单提醒
      that.get_zdtx(contractNo); 
      that.get_zdtxYWC(contractNo); 
    }
  },
  bindChange: function( e ) {
  var that = this;
  that.setData( { 
    currentTab: e.detail.current 
  });
  },
  checkIn_info:function (contractNo) { //获取入住详情
    let _this = this;
    var _data = {ac: 'checkIn_info',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          remark = units[0].remark;
          hid = units[0].roomId;
          dsn = units[0].equip_no;
          fileid = units[0].fileid;
          htzt = units[0].ht_status;
          _this.setData({
            contractNo:units[0].contractNo,
            hid:units[0].roomId,
            houseName:units[0].houseName,
            czzt_name:units[0].htzt_name,
            tenantNo:units[0].tenantNo,
            tenantName:units[0].tenantName,
            tel:units[0].tenantTel,
            cardNo:units[0].credentialsNo,
            rzzq:units[0].rzzq,
            deposit:units[0].deposit,
            rent:units[0].deposit_total,
            rent_unit:units[0].rentUnit_name,
            szDate:units[0].yssj_name,
            szzq:units[0].szzq_name,
            remark:units[0].remark,
            ht_status:units[0].ht_status,
            fkfs:units[0].fkfsF_name+units[0].fkfsY_name,
            sbds:units[0].sbds,
            dbds:units[0].dbds,
          })
          _this.house_info(hid);  //获取房间信息
          _this.get_Photo(fileid);  //获取照片
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  checkIn_tzr:function (contractNo) { //获取同住人
    let _this = this;
    var _data = {ac: 'checkIn_tzr',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
          setTimeout(()=>{
            _this.setData({
              tzrlist:_this.data.servicelist.concat(units)
            })
          },1000)
      },
      fail(res) {
        console.log("getunits fail:",res);
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      },
      complete(){
      }
    });  
  },
  get_zdxx:function (contractNo) { //获取账单信息
    let _this = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'checkIn_zdxx',"contractNo":contractNo};
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
              "id":units[i].id,
              "fylx_name":units[i].fylx_name,
              //"xstje":(units[i].lx=='收款') ? "+"+units[i].lsje:"-"+units[i].lsje,
              "xstje":units[i].je,
              "yssj2":'入账时间：'+units[i].rzrq2,
              "ch":units[i].ch,
            })
          } 
          setTimeout(()=>{
            _this.setData({
              zdxxlist:_this.data.servicelist.concat(newlist)
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
  get_zdtx:function (contractNo) { //获取账单提醒
    let _this = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'checkIn_zdtx',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const txlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            txlist.push({
              "id":units[i].id,
              "fylx":units[i].periods_num,
              "zdje":(units[i].jqzt2=='已结清') ? units[i].zdje:(units[i].zdlx=='收款') ? "+"+units[i].xstje:"-"+units[i].xstje,
              "txsj2":"应付日："+units[i].yssj2,
              "ts":(units[i].ts=='') ? '已完成':(units[i].ts >= 0) ? units[i].ts+'天后':'逾期'+Math.abs(units[i].ts)+'天',
              "zdlx":units[i].zdlx,
            })
          } 
          setTimeout(()=>{
            _this.setData({
              zdtxlist:_this.data.servicelist.concat(txlist)
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
  get_zdtxYWC:function (contractNo) { //获取已完成账单
    let _this = this;
    var _data = {ac: 'checkIn_zdtxYWC',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const txlist = [];
          var units = res.data.rows;
          for (var i = 0; i < units.length; i++) {
            txlist.push({
              "id":units[i].id,
              "fylx":units[i].periods_num,
              "zdje":(units[i].jqzt2=='已结清') ? units[i].zdje:(units[i].zdlx=='收款') ? "+"+units[i].xstje:"-"+units[i].xstje,
              "txsj2":"应付日："+units[i].yssj2,
              "zdlx":units[i].zdlx,
            })
          } 
          setTimeout(()=>{
            _this.setData({
              ywczdlist:txlist
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
  house_info:function () { //获取房间信息
    let _this = this;
    var _data = {ac: 'house_info',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          fjzt = units[0].cz_state;
          _this.setData({
            Srent_date:units[0].Srent_date,
            Erent_date2:units[0].Erent_date2,
          })
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  get_Photo:function (PID) { //获取照片
    let _this = this;
    var _data = {ac: 'get_Photo',"PID":PID};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        var qty = 0;
        if(units.length > 0){
          qty = units.length;
        }
        _this.setData({
          img_qty: qty
        })
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  goToTopZD:function(){ //回到顶部
  this.setData({
    scrolltop:0
  })
  },
  goToTopTX:function(){ //回到顶部
    this.setData({
      scrolltop:0
    })
  },
  scrollLoadingZD:function(){ //滚动加载
  if(this.data.hasMoreData){
    this.get_zdxx(contractNo);
  }
  },
  scrollLoadingTX:function(){ //滚动加载
    if(this.data.hasMoreData){
      this.get_zdtx(contractNo);
      this.get_zdtxYWC(contractNo); 
    }
  },
  onPullDownRefresh:function(){ //下拉刷新
  this.setData({
    page:0,
    servicelist:[]
  })
  this.get_zdxx(contractNo);
  setTimeout(()=>{
    wx.stopPullDownRefresh()
  },1000)
  },
  tapInfo: function(e) {   //根据标识跳转页面
  let _this = this;
  let index = e.currentTarget.dataset.index;
  let url = "";
  var hth = e.currentTarget.dataset.key;
  var roomId = e.currentTarget.dataset.roomid;
  if (index == '1') {  //入住人信息
    url = '../../../pagesB/pages/rzr_info/rzr_info?contractNo='+hth;
  } else if ( index == '2' ) { //同住人信息
    url = '../../../pagesB/pages/roommate/roommate?hth='+hth;
  }else if( index == '3' ){ //备注
    var app = getApp();
    app.globalData.rzxq_remark=remark;
    url = '../../../pagesB/pages/rzxq_updateRemark/rzxq_updateRemark?contractNo='+hth;
  }
  else if( index == '4' ){ //开门密码
    _this.get_dsn(roomId,'密码'); //获取门锁设备号
  }
  else if( index == '5' ){ //IC卡
    _this.get_dsn(roomId,'卡片'); //获取门锁设备号
  }
  else if( index == '6' ){ //指纹
    _this.get_dsn(roomId,'指纹'); //获取门锁设备号
  }else if( index == '7' ){ //合同扫描件
    url = '../../../pagesB/pages/contractPhotos/contractPhotos?contractNo='+hth;
  }
  if( !!url ){
    wx.navigateTo({
      url: url
    })
  }
  },
  get_dsn:function (roomId,LX) { //获取门锁设备号
    let _this = this;
    var _data = {ac: 'get_macToMS',"hid":roomId};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          dsn = units[0].equip_no;
          wx.navigateTo({
            url: '../../../pagesA/pages/msyh_list/msyh_list?dsn='+dsn+'&LX='+LX
          })
        }
        else{
          wx.showToast({
            title: '请先添加没锁！',
            icon: 'none',
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
  },
  callTel: function(e) { //拨打电话
    let telNumber = e.currentTarget.dataset.tel;
    wx.makePhoneCall({
      phoneNumber:telNumber
    }).catch((e) => {
      console.log(e)
    })
  },
  tapXZ: function(e) { //续租
    var contractNo = e.currentTarget.dataset.key;
    let _this = this;
    if((htzt=='1003' || htzt=='1005') && fjzt!="1002"){  //在租中
      wx.showToast({
        title: '该房间处于在租中，不能续租',
        icon: 'none',
        duration: 1000
      }); 
    }
    else{
      _this.insert_htToXZ(contractNo,userid); //生成续租
    }
    /* 
    var _data = {ac: 'yqzd_list',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          wx.showToast({
            title: '有逾期账单，不能续租',
            icon: 'none',
            duration: 1000
          }); 
        }
        else{
          _this.insert_htToXZ(contractNo,userid); //生成续租
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });*/
  },
  get_mssjToPwd:function () { //获取门锁的所有密码用户
    let _this = this;
    var _data = {ac: 'get_mssjToPwd',"dsn":dsn};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          _this.setData({
            pwdlist:units
          })
        }
      },
      fail(res) {
      },
      complete(){
      }
    });  
  },
  insert_htToXZ:function(contractNo,userid){  //生成续租
    let that = this;
    var _data = {ac: 'insert_htToXZ',"contractNo":contractNo,"userid":userid};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var contractNo_new = res.data.contractNo;
        wx.redirectTo({
          url: '../../../pagesB/pages/relet_add/relet_add?contractNo='+contractNo_new
        })     
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  },
  tapTZ: function(e) { //退房
    var contractNo = e.currentTarget.dataset.key;
    let _this = this;
    const czlist = [];
    var _data = {ac: 'yqzd_list',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          _this.setData({
            qty:units[0].qty,
            xstje:units[0].xstje
          })
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    }); 
    czlist.push(
      {bindtap:'Menu1',txt:'退租，并结账(推荐)'},
      {bindtap:'Menu2',txt:'先退房，再结账'},
    )
    this.setData({
      actionSheetItems:this.data.servicelist.concat(czlist),
      actionSheetHidden:!this.data.actionSheetHidden
    })
    /*
    var _data = {ac: 'yqzd_list',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          wx.showToast({
            title: '有逾期账单，不能退租',
            icon: 'none',
            duration: 1000
          }); 
        }
        else{
          wx.navigateTo({
            //url: '../../../pagesB/pages/checkOut_info/checkOut_info?LY=ZD&contractNo='+contractNo
            url: '../../../pagesB/pages/checkOut_add/checkOut_add?tzNo='+tzNo
          })     
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    }); 
    */ 
  },
  bindMenu1:function(){  //退房并结账
    let that = this;
    var _data = {ac: 'get_macToMS',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          dsn = units[0].equip_no;
          lylx = units[0].lx;
          that.mssj_list(dsn,lylx);  //获取门锁数据       
        }
        else{
          that.insert_tzsp(); //生成退租         
        }
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
  bindMenu2:function(){  //退房再结账
    let that = this;
    var _data = {ac: 'get_macToMS',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          dsn = units[0].equip_no;
          lylx = units[0].lx;
          that.mssj_list(dsn,lylx);  //获取门锁数据       
        }
        else{
          that.insert_tzsp(); //生成退租         
        }
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
  actionSheetbindchange:function(){  //底部上弹
    this.setData({
      actionSheetHidden:!this.data.actionSheetHidden
    })
  },
  tapFQ: function(e) { //发起签约
    let that = this;
    setTimeout(()=>{
      that.setData({
        ifName: true,    //显示弹出框
      }); 
    },100) 
  },
  zdtxAdd: function(e) { //添加账单提醒
  var contractNo = e.currentTarget.dataset.key;
  wx.navigateTo({
    url: '../../../pagesB/pages/zdtx_add/zdtx_add?contractNo='+contractNo
  })
  },
  cancelQY: function (e) {  //发起取消
    let that = this;
    that.setData({
      ifName: false,    //隐藏弹出框
    }); 
  },
  confirmQY: function (e) {  //发起确定
    let that = this;
    that.update_sentTime(contractNo); //更新发送时间
    that.setData({
      ifName: false,    //隐藏弹出框
    }); 
  },
  update_sentTime:function (contractNo) { //更新发送时间
    var _data = {ac: 'update_sentTime',"contractNo":contractNo};
    wx.request({
      url: apiUrl,
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  tapDel: function(e) { //删除
    let hthNo = e.currentTarget.dataset.key;
    wx.showModal({
      title: '提示',
      content: '删除合同后，合同信息以及账单记录都将被删除',
      success: function (res) {
        if (res.confirm) {
          var _data = {ac: 'contract_del',"contractNo":hthNo};
          wx.request({
            url: apiUrl,  //api地址
            data: _data,
            header: {'Content-Type': 'application/json'},
            method: "get",
            success(res) {     
              if(res.data.status=="1"){
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 1000
                });           
                setTimeout(function() {
                  wx.navigateBack({
                    delta: 1,
                  })
                }, 1000)
              }
              else if(res.data.status=="2"){
                wx.showToast({
                  title: '在租合同不能删除',
                  icon: 'none',
                  duration: 1000
                });    
              }               
            },
            fail(res) {
            },
            complete(){
            }
          });            
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  zdmx: function (e) {  //账单明细
    let fid = e.currentTarget.dataset.key;
    let zdlx = e.currentTarget.dataset.lx;
    if(zdlx=="收款"){
      wx.navigateTo({
        url: '../../../pagesB/pages/rent_detail/rent_detail?fid='+fid
      })
    }
    else if(zdlx=="付款"){
      wx.navigateTo({
        url: '../../../pagesB/pages/rent_detailFK/rent_detailFK?fid='+fid
      })
    }
  },
  mssj_list: function(dsn,lylx) { //获取门锁数据
    var that = this;
    var _data = {ac: 'mssj_list',"dsn":dsn,"search":""};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let ljzt = false;//连接状态
          if(lylx=="1"){
            ljzt = BLE.authState();//连接状态
          }
          else if(lylx=="2"){
            ljzt = BLE_new.connectionState();//连接状态  
          }
          that.setData({
            showMB:false,  //显示幕布
            second: 60,  //初始化成40秒
          })
          that.countdown(); //调用计时器
          if(lylx == "1"){  //旧锁
            wx.showToast({
              title: '旧锁远程删除方法',
              icon: 'none'
            })
            that.setData({
              showMB:true,  //隐藏幕布
            })   
          }
          else if(lylx == "2"){  //新锁
            wx.showLoading({
              title: '密码删除中...',
            })
            if(ljzt){  //蓝牙连接中
              for (var i = 0; i < units.length; i++) {
                var j = 0;            
                setTimeout(function () {  
                  that.BLEpassword_delN(units[j].yhbh,units[j].lx,units[j].equip_no,units[j].password); //删除密码 
                  j++    
                }, i * 2000);                                 
              }
              setTimeout(function () {
                wx.hideLoading();  //关闭提示框
                that.checkOut_save(dsn);  
              }, units.length * 2000+2000);   
            }
            else{
              com.get_Connection(dsn,function(res){
                let conStatus = res;
                console.log("网关蓝牙连接返回："+conStatus);
                if(!conStatus){
                  wx.hideLoading();  //关闭提示框
                  that.setData({
                    showMB:true,  //显示幕布
                  })              
                  return;
                }
                for (var i = 0; i < units.length; i++) {
                  var j = 0;            
                  setTimeout(function () {  
                    that.password_delN(units[j].yhbh,units[j].lx,units[j].equip_no,units[j].password,units[j].yhlx); //删除密码 
                    j++    
                  }, i * 5000);                                 
                }
                setTimeout(function () {
                  wx.hideLoading();  //关闭提示框
                  that.checkOut_save(dsn);  
                }, units.length * 5000+2000);     
              });
            }    
          }
          else if(lylx == "5" || lylx == "6" || lylx == "20" || lylx == "21"){  //国民NB锁或同欣433
            wx.showLoading({
              title: '密码删除中...',
            })
            var sj = 4000; //1000代表1秒
            if(lylx == "5" || lylx == "6"){
              sj = 500;   //0.5秒
            }
            else{ 
              sj = 4000;   //4秒
            }
            if(ljzt){  //蓝牙连接中
              for (var i = 0; i < units.length; i++) {
                var j = 0;            
                setTimeout(function () {  
                  that.BLEpassword_delGM(units[j].yhbh,units[j].lx,units[j].equip_no,units[j].password); //删除密码 
                  j++    
                }, i * sj);                                 
              }
              setTimeout(function () {
                wx.hideLoading();  //关闭提示框
                that.checkOut_save(dsn);  
              }, units.length * sj+1000);   
            }
            else{
              for (var i = 0; i < units.length; i++) {
                var j = 0;            
                setTimeout(function () {  
                  that.password_delGM(units[j].yhbh,units[j].lx,units[j].equip_no,units[j].password,units[j].yhlx); //删除密码 
                  j++    
                }, i * sj);                                 
              }
              setTimeout(function () {
                wx.hideLoading();  //关闭提示框
                that.checkOut_save(dsn);  
              }, units.length * sj+1000);
            }    
          }
        }
        else{  //没有密码直接生成退租
          that.insert_tzsp(); //生成退租
        }
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
  password_delN: function(yhbh,lx,dsn,pwd_old,yhlx) {
    var that = this;
    var _dataNC = "";
    var del_fz = "";
    if(yhlx=="03"){  //离线密码
      _dataNC = '{ac: "delete_offline_password","deviceid":"'+dsn+'","password":"'+pwd_old+'","channel":"21"}'
      del_fz = "delete_offline_password";
    }
    else{
      _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
      del_fz = "deletepassword";
    }
    wx.request({
      url: apiNC+del_fz,  //api地址
      data: _dataNC,
      header: {'content-type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: '删除失败',
            icon: "none",
            duration: 1000
          })
        }
        else{
          if(res.data.code == '0' || res.data.code == '40009'){
            if(lx=='01'){  //指纹
              that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
            }
            else if(lx=='03'){ //密码
              if(yhlx=="03"){  //离线密码
                that.insertLog_LS(userid,'',dsn,'删除','离线密码('+yhbh+')',pwd_old,'朗思管理端');
              }
              else{
                that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');   
              }
            } 
          }
          else{
            console.log("code:"+res.data.code+">>msg:"+res.data.msg);      
          }     
        }
      },
      fail(res) {
      },
      complete(){
        //wx.hideLoading();  //关闭提示框
      }
    });
  },
  password_delGM: function(yhbh,lx,dsn,pwd_old,yhlx) {
    var that = this;
    let jk = "";//接口    
    var _dataNC = "";
    if(yhlx=="03"){  //离线密码
      if(lylx == "5" || lylx == "6"){  //国民锁
        jk = 'gm_delete_offline_password';
        _dataNC = '{ac: "gm_delete_offline_password","deviceid":"'+dsn+'","password":"'+pwd_old+'","channel":"21"}'
      }else if(lylx == "20" || lylx == "21"){  //同欣锁
        jk = 'tx_delete_offline_password';
        _dataNC = '{ac: "tx_delete_offline_password","deviceid":"'+dsn+'","password":"'+pwd_old+'","channel":"21"}'
      }
    }
    else{
      if(lylx == "5" || lylx == "6"){
        jk = 'gm_del_user';
      }else if(lylx == "20" || lylx == "21"){
        jk = 'tx_del_user';
      }
      _dataNC = '{ac: "deletepassword","partnerid":"'+ptlx+'","deviceid":"'+dsn+'","passwordid":"'+yhbh+'","lx":"'+lx+'","channel":"21"}'
    }
    wx.request({
      url: apiNC+jk,  //api地址
      data: _dataNC,
      header: {'content-type': 'application/json'},
      method: "POST",
      async:false,  //同步
      success(res) {
        if(res==""){
          wx.showToast({
            title: '删除失败',
            icon: "none",
            duration: 1000
          })
        }
        else{
          if(res.data.code == '0'){
            if(lx=='01'){  //指纹
              that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
            }
            else if(lx=='02'){ //卡片
              that.insertLog_LS(userid,'',dsn,'删除','卡片('+yhbh+')',pwd_old,'朗思管理端');
            }  
            else if(lx=='03'){ //密码
              if(yhlx=="03"){ 
                that.insertLog_LS(userid,'',dsn,'删除','离线密码('+yhbh+')',pwd_old,'朗思管理端');
              }
              else{
                that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');   
              }
            } 
          }
          else{
            console.log("code:"+res.data.code+">>msg:"+res.data.msg);      
          }     
        }
      },
      fail(res) {
      },
      complete(){
        //wx.hideLoading();  //关闭提示框
      }
    });
  },
  checkOut_save:function (dsn) { //退租
    var that = this;
    var _data = {ac: 'mssj_list',"dsn":dsn,"search":""};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          that.setData({
            showMB:true,  //隐藏幕布
          })
          /*
          wx.showToast({
            title: '密码没有清空完，请再点击退房',
            icon: 'error',
            duration: 1000
          });  
          */
         wx.showModal({
          title: '退租',
          content: '密码没清空完，是否强制退租？',
          cancelText:'删除密码',
          confirmText:'强制退租',
          success: function (res) {
            if (res.confirm) {//这里是点击了确定以后
              //console.log('用户点击确定')
              that.insert_tzsp(); //生成退租
            }
            else if(res.cancel) {//这里是点击了取消以后
              //console.log('用户点击取消')
              that.mssj_list(dsn,lylx);  //获取门锁数据     
            }
          }
        })      
        }
        else{
          that.insert_tzsp(); //生成退租       
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
 //生成退租
 insert_tzsp:function(){
  var that = this;
  var _data = {ac: 'insert_tzsp',"contractNo":contractNo,"userid":userid};
  wx.request({
    url: apiUrl,
    data: _data,
    header: {'Content-Type': 'application/json'},
    method: "get",
    success(res) {
      var tzNo = res.data.tzNo;
      that.setData({
        showMB:true,  //隐藏幕布
      })
      wx.redirectTo({
        url: '../../../pagesB/pages/checkOut_add/checkOut_add?tzNo='+tzNo
      })       
    },
    fail(res) {
      that.setData({
        showMB:true,  //隐藏幕布
      })     
    },
    complete(){
    }
  }); 
 },
 //插入下发日志
 insertLog_LS:function(wx_id,hid,sbh,czlx,Pwd_type,Pwd,xfly){
  var _data = {ac: 'operateLog_save',"wx_id":wx_id,"hid":hid,"sbh":sbh,"czlx":czlx,"Pwd_type":Pwd_type,"Pwd":Pwd,"xfly":xfly};
  wx.request({
    url: apiUrl,  //api地址
    data: _data,
    header: {'Content-Type': 'application/json'},
    method: "get",
    async:false,  //同步
    success(res) {
    },
    fail(res) {
      console.log("getunits fail:",res);
    },
    complete(){
    }
  });    
  },
  countdown: function () {
    var that = this;
    let second = that.data.second;
    clearInterval(this.data.c);//清除定时器
    that.data.c = setInterval(() => {//启动倒计时
      if(second == 0){
        clearInterval(this.data.c);//清除定时器
        wx.hideLoading();  //关闭提示框  
        that.setData({
          showMB:true,  //隐藏幕布
        });
        return;
      }
      else{
        second = second - 1;
      }
      that.setData({
        second: second
      });
    }, 1000);
  },
  BLEpassword_delN: function(yhbh,lx,dsn,pwd_old) {
    var that = this;
    var xfbs_del='下发中';
    var hardwareNumber = parseInt(yhbh, 10);  //用户编号
    var unlockModeEnum = 1;
    if(lx=='01'){  //指纹
      unlockModeEnum = 3; //代表密码，3代表指纹
    }
    else if(lx=='03'){ //密码
      unlockModeEnum = 1;
    }    
    var _data2 = {
      "deviceSn":dsn,
      "cmd":"0302",
      "syncNo":"0",
      "cloudUnlockBO":{
      "unlockModeEnum":unlockModeEnum,
      "registerStatusEnum":"START",
      "effectiveNum":0,
      "memberTypeEnum":"NORMAL", //NORMAL是普通用户，ADMIN是管理员
      "hardwareNumber":hardwareNumber,
      "menberId":2, //2是普通用户，1是管理员
      "isOpenCycle":0,
      "loopType":"LOOP_NOT",
      "loopFlag":"00000000",
      "password":'',
      "startTime":'',
      "endTime":''
      }
    };
    wx.request({
      url: apiNC+'cloud_function',
      data: _data2,
      header: {'Content-Type': 'application/json'},
      method: "POST",
      dataType: 'application/json',
      async:false,  //同步                            
      success(res) {
        let _res = JSON.parse(res.data);                  
        var cmd2 = _res.data; 
        BLE_new.sendCommand(cmd2,function(res){
          if(res.errCode==0){
            var _data4 = {"deviceSn":dsn,"data":res.data};
            wx.request({
              url: apiNC+'cloud_function_parse',
              data: _data4,
              header: {'Content-Type': 'application/json'},
              method: "POST",
              dataType: 'application/json',
              async:false,  //同步           
              success(res) {
                let _res = JSON.parse(res.data);
                if( _res.code == 0 ){
                  console.log("删除下发标识："+xfbs_del);
                  if(xfbs_del =='已完成'){
                    return;
                  }
                  else{
                    xfbs_del='已完成';
                    that.del_Rh_yhb(dsn,yhbh,lx);//删除门锁用户
                    if(lx=='01'){  //指纹
                      that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                    }
                    else if(lx=='03'){ //密码
                      that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                    }
                  }                      
                }
                else{       
                  wx.showToast({
                    title: '删除用户失败',
                    icon: "error",
                    duration: 1000
                  })
                  xfbs_del='已完成';
                  console.log(_res.code+'——>>'+_res.msg);                    
                }
              },
              fail(res) {  
                xfbs_del='已完成';
              },
              complete(){
              }
            });                    
          }
        });     
      },
      fail(res) {
      },
      complete(){
      }
    });     
  },
  del_Rh_yhb: function (dsn,yhbh,lx){  //删除门锁用户
    var that = this;
    var _data = {ac: 'yhb_del',"yhbh":yhbh,"dsn":dsn,"lx":lx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
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
     if(!!contractNo){
      this.checkIn_info(contractNo);  //获取入住详情
      this.checkIn_tzr(contractNo);  //获取同住人
      this.get_zdtx(contractNo);  //获取账单提醒
      this.get_zdtxYWC(contractNo);  //获取已完成账单
      this.get_zdxx(contractNo);  //获取账单信息
     }
  },
  onHide: function () { //生命周期函数--监听页面隐藏
  },
  onReachBottom: function () { //页面上拉触底事件的处理函数
  },
  onShareAppMessage: function () { //用户点击右上角分享
    return {
      path: '../../../pagesB/pages/rztx_info/rztx_info?contractNo='+contractNo,
      success: function (res) {
        console.log("分享成功",res);// 分享成功
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        })
      },
      fail: function (res) {
        console.log("分享失败",res);// 转发失败
      }
    }
  }
})