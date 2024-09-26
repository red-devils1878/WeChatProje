var search= "";  //搜索内容
var app = getApp();
var apiUrl = "";   //获取api地址
var apiYC = "";   //获取门锁api地址(远程)
var BLE = require('../../../utils/BLE.js');  //蓝牙操作文档
var com = require('../../../utils/commom.js');  //公共js
var newPwd = "" //新密码
var dsn= "";  //设备号
var userid= "";  //登陆人工号
var hid= "";  //hid
var ptlx= "";  //ptlx
Page({
  
  data: {
    showsearch:true,   //显示搜索按钮
    searchtext:'',  //搜索文字
    showfilter:false, //是否显示下拉筛选
    showfilterindex:null, //显示哪个筛选类目
    servicelist:[], //服务集市列表
    scrolltop:null, //滚动位置
    page: 0,  //分页
    ifName: false
  },
  onLoad: function (options) {  //生命周期函数--监听页面加载
    var that = this;
    dsn = options.dsn;
    apiUrl = app.globalData.apiUrl;   //获取api地址
    apiYC = app.globalData.apiYC;     //获取门锁api地址(远程)
    userid = app.globalData.userid;   //登陆人工号


    newPwd = ""; //密码设置成空
    wx.getSystemInfo( {   //获取当前设备的宽高
      success: function( res ) {
        that.setData( {
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
          fxmc:""
        });
      }
    });
    this.get_mssj(dsn,search); //获取门锁数据

  /*调用一次定位*/
  wx.getLocation({
    type: 'gcj02',
    success (res) {
      console.log(res)
    }
  })
  },
  get_mssj:function (dsn,search) { //获取门锁数据
    let _this = this;
    _this.setData({
      servicelist:[]
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var _data = {ac: 'mssj_list',"dsn":dsn,"search":search};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          const newlist = [];
          var units = res.data.rows;
          if(units.length > 0){
            var sbmc = units[0].equip_name;
            for (var i = 0; i < units.length; i++) {
              newlist.push({
                "id":units[i].id,
                "hid":units[i].hid,
                "equip_no":units[i].equip_no,
                "yhbh":units[i].yhbh,
                "kslxmc":units[i].kslxmc,
                "lx":units[i].lx,
                "ly":units[i].channel_name,
                "ztmc":units[i].ztmc,
                "yxsj":units[i].kssj+'--'+units[i].jssj
              })
            } 
          }
          setTimeout(()=>{
            _this.setData({
              servicelist:newlist,
              sbmc:sbmc
            })
          },1000)
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
    this.get_mssj(dsn,search); //获取门锁数据
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
    //this.get_mssj(dsn,search); //获取门锁数据
  },
  onPullDownRefresh:function(){ //下拉刷新
    this.setData({
      page:0,
      servicelist:[]
    })
    this.get_mssj(dsn,search); //获取门锁数据
    setTimeout(()=>{
      wx.stopPullDownRefresh()
    },1000)
  },
  pwdAdd:function(e){  //下发授权
    let ljzt = BLE.authState();//连接状态
    console.log("连接状态："+ljzt);
    if(ljzt){
      wx.navigateTo({
        url: '/pages/xfsq_add/xfsq_add?dsn='+dsn
      })
    }
    else{
      wx.showToast({
        title: '请先连接门锁',
        icon: 'error',
        duration: 1000
      });       
    }
  },
  // 删除
  delList: function(e){
    let ljzt = BLE.authState();//连接状态
    let that = this;
    let id = e.currentTarget.dataset.key;  // 当前流水号
    //if(ljzt){
    var _data = {ac: "mssj_info","id":id};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          hid = units[0].hid
          ptlx = units[0].ptlx
          let id = units[0].id
          let yhbh = units[0].yhbh
          let dsn = units[0].equip_no
          let lx = units[0].lx //01指纹，02卡片，03密码
          let pwd_old = units[0].password //密码
          that.password_del(yhbh,lx,dsn,pwd_old); //删除密码         
        }          
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });
  //}
  /*
  else{
    wx.showToast({
      title: '请先连接门锁',
      icon: 'error',
      duration: 1000
    });    
  }  */
  },
  // 冻结
  frozen: function(e){
    let ljzt = BLE.authState();//连接状态
    let that = this;
    let id = e.currentTarget.dataset.key;  // 当前流水号
    if(ljzt){
    var _data = {ac: "mssj_info","id":id};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let id = units[0].id
          let yhbh = units[0].yhbh
          let dsn = units[0].equip_no
          let lx = units[0].lx //01指纹，02卡片，03密码
          let pwd_old = units[0].password //密码
          that.password_frozen(yhbh,lx,dsn,pwd_old); //冻结          
        }          
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  }
  else{
    wx.showToast({
      title: '请先连接门锁',
      icon: 'error',
      duration: 1000
    });  
  }
  },
    // 解冻
  unfreeze: function(e){
    let ljzt = BLE.authState();//连接状态
    let that = this;
    let id = e.currentTarget.dataset.key;  // 当前流水号
    if(ljzt){
    var _data = {ac: "mssj_info","id":id};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
        if(units.length > 0){
          let id = units[0].id
          let yhbh = units[0].yhbh
          let dsn = units[0].equip_no
          let lx = units[0].lx //01指纹，02卡片，03密码
          let pwd_old = units[0].password //密码
          that.password_unfreeze(yhbh,lx,dsn,pwd_old); //解冻         
        }          
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  }
  else{
    wx.showToast({
      title: '请先连接门锁',
      icon: 'error',
      duration: 1000
    });  
  }
  },
  password_del:function(yhbh,lx,dsn,pwd_old){  //删除密码
    var that = this;
    let ljzt = false;//连接状态
    ljzt = BLE.authState();//连接状态
    if(!ljzt){
      wx.showToast({
        title: '请先连接门锁',
        icon: 'error',
        duration: 1000
      });  
      return false;  
    }
    var cmd = "";
    wx.showToast({
      title: '删除中...',
      icon: "loading",
      duration: 5000
    })
    if(ljzt){
      var _data = {ac: 'GetNextNo'};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          if(res.data.status=="1"){
            var autoNo = res.data.autoNo;
            var hexyhbh = com.ex10hex(yhbh,2); //十进制转成十六进制
            if(lx=='01'){  //01指纹
              cmd = autoNo+'AA5505001C0201'+hexyhbh+'CC';
            }else if(lx=='03'){ //03密码
              cmd = autoNo+'AA5505001C0203'+hexyhbh+'CC';
            }
            //console.log("删除密码加密前cmd:"+cmd);
            com.get_encryption(dsn,cmd,function(res){  //获取加密
              //console.log("加密内码:"+res.errCode2);
              if(res.errCode2=='1001'){
                let cmd = res.cmd;
                let cmdT = autoNo+cmd;
                BLE.sendCommand(cmdT,function(res){  //写入数据
                  //console.log("删除返回结果:"+res);
                  if(res.errCode==0){
                    that.del_Rh_yhb(dsn,yhbh,lx,'del');//删除门锁用户
                    if(lx=='01'){  //01指纹
                      that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                    }else if(lx=='03'){ //03密码
                      that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                    }
                  }
                  else{
                    wx.hideToast();  //关闭提示框
                    wx.showToast({
                      title: '删除失败',
                      icon: "error",
                      duration: 1000
                    })     
                  }
                });
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
    }
    else{  //没链接蓝牙
      var _dataYC = { ac: "deletepassword", partnerid: ptlx, deviceid: dsn, passwordid: yhbh, channel: "21",extracode:hid};
      wx.request({
        url: apiYC,  //api地址
        data: _dataYC,
        header: {'content-type': 'application/x-www-form-urlencoded'},
        method: "POST",
        async:false,  //同步
        success(res) {
          if(res.data.state == true){
            that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
            wx.showToast({
              title: '删除用户成功',
              icon: "success",
              duration: 1000
            })
            setTimeout(()=>{
             wx.navigateBack({
               delta: 1,
             }) 
            },1000)
          }
          else{
            wx.showToast({
              title: '删除用户失败',
              icon: "error",
              duration: 1000
            })          
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
  updList:function(e){  //修改密码
    let ljzt = BLE.authState();//连接状态
    if(ljzt){
      var that = this;
      let id = e.currentTarget.dataset.key;  // 当前流水号
      let kmlx = e.currentTarget.dataset.kmlx;  // 开门类型，01：指纹，02卡片，03密码
      if(kmlx=='01'){  //指纹
        var _data = {ac: "mssj_info","id":id};
        wx.request({
          url: apiUrl,  //api地址
          data: _data,
          header: {'Content-Type': 'application/json'},
          method: "get",
          success(res) {
            var units = res.data.rows;
            if(units.length > 0){
              let id = units[0].id
              let yhbh = units[0].yhbh
              let dsn = units[0].equip_no
              let bdate = units[0].bdate
              let edate = units[0].edate
              let lx = units[0].lx //01指纹，02卡片，03密码
              let pwd_old = units[0].password //密码
              that.password_upd(yhbh,lx,dsn,'',bdate,edate,pwd_old); //修改指纹             
            }          
          },
          fail(res) {
            console.log("getunits fail:",res);
          },
          complete(){
          }
        });  
      }
      else if(kmlx=='03'){
        this.setData( {
          ifName: true,    //显示弹出框
          yhbhid:id
        }); 
      }
    }
    else{
	    wx.showToast({
        title: '请先连接门锁',
        icon: 'error',
        duration: 1000
      });  
    }
  },
  setValue: function(e) {   //密码值改变事件
    newPwd = e.detail.value;
  },
  cancel: function (e) {  //取消
    newPwd = "";
    this.setData( {
      ifName: false,    //隐藏弹出框
      fxmc:""
    }); 
  },
  confirm: function (e) {  //确定
    if(!newPwd || newPwd.length != 6){
      wx.showToast({
        title: '请输入6位数字！',
        icon: 'none'
      })
    }
    else{
      let that = this;
      let id = e.currentTarget.dataset.key;  // 当前流水号
      var _data = {ac: "mssj_info","id":id};
      wx.request({
        url: apiUrl,  //api地址
        data: _data,
        header: {'Content-Type': 'application/json'},
        method: "get",
        success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            let id = units[0].id
            let yhbh = units[0].yhbh
            let dsn = units[0].equip_no
            let lx = units[0].lx //01指纹，02卡片，03密码
            let bdate = units[0].bdate
            let edate = units[0].edate
            let pwd_old = units[0].password //密码
            that.password_upd(yhbh,lx,dsn,newPwd,bdate,edate,pwd_old); //修改密码
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
  password_add:function(dsn,newPwd,bdate,edate){  //新增密码
    var that = this;
    var cmd = "";
    var _data = {ac: 'GetNextNo'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          var autoNo = res.data.autoNo;
          cmd = autoNo+'AA55170019020000'+newPwd+'FFFFFF'+bdate+edate+'CC';  
          //console.log("加密前:"+cmd);
          com.get_encryption(dsn,cmd,function(res){  //获取加密
            //console.log("加密内码:"+res.errCode2);
            if(res.errCode2=='1001'){
              let cmd = res.cmd;
              //console.log("加密cmd:"+cmd);
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                //console.log(res);
                var hexV = res.res;
                if(res.errCode==0){
                  var hexV2 = hexV.slice(-8+hexV.length,-4+hexV.length);
                  var yhbh = com.ex16hex(hexV2);
                  if(yhbh < 10){
                    yhbh = '00'+yhbh
                  }
                  else if(yhbh >= 10 && yhbh < 100){
                    yhbh = '0'+yhbh
                  }
                  else{
                    yhbh = yhbh
                  }
                  that.insert_Rh_yhb(dsn,'03',yhbh,newPwd,bdate,edate);//插入门锁用户表
                  that.insertLog_LS(userid,'',dsn,'下发','普通用户('+yhbh+')',newPwd,'朗思管理端');
                }
                else{
                  wx.hideToast();  //关闭提示框
                  wx.showToast({
                    title: '修改密码失败',
                    icon: "error",
                    duration: 1000
                  })     
                }
              });
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
  },
  del_Rh_yhb: function (dsn,yhbh,lx,czlx){  //删除门锁用户
    var that = this;
    var _data = {ac: 'yhb_del',"yhbh":yhbh,"dsn":dsn,"lx":lx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.hideToast();  //关闭提示框
          if(czlx=="del"){
            wx.showToast({
              title: '删除成功',
              icon: "success",
              duration: 1000
            })
          }
          setTimeout(()=>{
            that.get_mssj(dsn,search); //获取门锁数据
          },1000)
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  zhiwen_add:function(dsn,bdate,edate){  //新增指纹
    var that = this;
    var cmd = "";
    var _data = {ac: 'GetNextNo'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          var autoNo = res.data.autoNo;
          cmd = autoNo+'AA5511001A020000'+bdate+edate+'CC';     
          com.get_encryption(dsn,cmd,function(res){  //获取加密
            //console.log("加密内码:"+res.errCode2);
            if(res.errCode2=='1001'){
              let cmd = res.cmd;
              //console.log("加密cmd:"+cmd);
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                //console.log(res);
                var hexV = res.res;
                if(res.errCode==0){
                  var hexV2 = hexV.slice(-8+hexV.length,-4+hexV.length);
                  var yhbh = com.ex16hex(hexV2);
                  if(yhbh < 10){
                    yhbh = '00'+yhbh
                  }
                  else if(yhbh >= 10 && yhbh < 100){
                    yhbh = '0'+yhbh
                  }
                  else{
                    yhbh = yhbh
                  }
                  that.insert_Rh_yhb(dsn,'01',yhbh,'',bdate,edate);//插入门锁用户表
                  that.insertLog_LS(userid,'',dsn,'下发','指纹('+yhbh+')','','朗思管理端');
                }
                else{
                  wx.hideToast();  //关闭提示框
                  wx.showToast({
                    title: '修改指纹失败',
                    icon: "error",
                    duration: 1000
                  })     
                }
              });
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
  },
  insert_Rh_yhb: function (dsn,lx,yhbh,newPwd,Stime,Etime){  //插入门锁用户表
    var that = this;
    var yhlx = "02";    //用户类型
    var channel = "21"; //下发来源
    var remark = "";  
    if(!Stime){ Stime = "000000000000"}
    if(!Etime){ Etime = "991230180000"}
    var _data = {ac: 'yhb_save',"yhbh":yhbh,"lx":lx,"yhlx":yhlx,"dsn":dsn,"Pwd":newPwd,"Stime":Stime,"Etime":Etime,"channel":channel,"remark":remark};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.hideToast();  //关闭提示框
          wx.showToast({
            title: '修改密码成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            that.get_mssj(dsn,search); //获取门锁数据
          },1000)
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
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
      success(res) {
        console.log("getunits success:",res);
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });    
  },
  password_frozen:function(yhbh,lx,dsn,pwd_old){  //冻结用户
    var that = this;
    var cmd = "";
    wx.showToast({
      title: '冻结中...',
      icon: "loading",
      duration: 5000
    })
    var _data = {ac: 'GetNextNo'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          var autoNo = res.data.autoNo;
          let yhbhEnd = yhbh.slice(-2); //截取2位用户编号，如12
          var hexyhbh = com.str2hex(yhbhEnd); //冻结转换用户编号
          if(lx=='01'){  //01指纹
            cmd = autoNo+'AA551100300101'+hexyhbh+'CC';
          }else if(lx=='03'){ //03密码
            cmd = autoNo+'AA551100300301'+hexyhbh+'CC';
          }
          com.get_encryption(dsn,cmd,function(res){  //获取加密
            if(res.errCode2=='1001'){
              let cmd = res.cmd;
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                //console.log("冻结写入成功:"+res);
                if(res.errCode==0){
                  that.frozen_Rh_yhb(dsn,yhbh,'8',lx);//冻结用户
                  if(lx=='01'){  //01指纹
                    that.insertLog_LS(userid,'',dsn,'冻结','指纹('+yhbh+')','','朗思管理端');
                  }else if(lx=='03'){ //03密码
                    that.insertLog_LS(userid,'',dsn,'冻结','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                  }   
                }
                else{
                  wx.hideToast();  //关闭提示框
                  wx.showToast({
                    title: '冻结失败',
                    icon: "error",
                    duration: 1000
                  })     
                }
              });
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
  },
  frozen_Rh_yhb: function (dsn,yhbh,zt,lx){  //冻结用户
    var that = this;
    var _data = {ac: 'yhb_frozen',"yhbh":yhbh,"dsn":dsn,"zt":zt,"lx":lx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.hideToast();  //关闭提示框
          wx.showToast({
            title: '冻结成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            that.get_mssj(dsn,search); //获取门锁数据
          },1000)     
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  password_unfreeze:function(yhbh,lx,dsn,pwd_old){  //解冻用户
    var that = this;
    var cmd = "";
    wx.showToast({
      title: '解冻中...',
      icon: "loading",
      duration: 5000
    })
    var _data = {ac: 'GetNextNo'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          var autoNo = res.data.autoNo;
          let yhbhEnd = yhbh.slice(-2); //截取2位用户编号，如12
          var hexyhbh = com.str2hex(yhbhEnd); //冻结转换用户编号
          if(lx=='01'){  //01指纹
            cmd = autoNo+'AA551100300100'+hexyhbh+'CC';
          }else if(lx=='03'){ //03密码
            cmd = autoNo+'AA551100300300'+hexyhbh+'CC';
          }
          com.get_encryption(dsn,cmd,function(res){  //获取加密
            if(res.errCode2=='1001'){
              let cmd = res.cmd;
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                //console.log("解冻写入成功:"+res);
                if(res.errCode==0){
                  that.unfreeze_Rh_yhb(dsn,yhbh,'1',lx);//解冻用户
                  if(lx=='01'){  //01指纹
                    that.insertLog_LS(userid,'',dsn,'解冻','指纹('+yhbh+')','','朗思管理端');
                  }else if(lx=='03'){ //03密码
                    that.insertLog_LS(userid,'',dsn,'解冻','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                  }
                }
                else{
                  wx.hideToast();  //关闭提示框
                  wx.showToast({
                    title: '解冻失败',
                    icon: "error",
                    duration: 1000
                  })     
                }
              });
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
  },
  unfreeze_Rh_yhb: function (dsn,yhbh,zt,lx){  //解冻用户
    var that = this;
    var _data = {ac: 'yhb_frozen',"yhbh":yhbh,"dsn":dsn,"zt":zt,"lx":lx};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          wx.hideToast();  //关闭提示框
          wx.showToast({
            title: '解冻成功',
            icon: "success",
            duration: 1000
          })
          setTimeout(()=>{
            that.get_mssj(dsn,search); //获取门锁数据
          },1000)     
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });   
  },
  password_upd:function(yhbh,lx,dsn,newPwd,bdate,edate,pwd_old){  //修改密码
    var that = this;
    var cmd = "";
    wx.showToast({
      title: '密码修改中...',
      icon: "loading",
      duration: 5000
    })
    var _data = {ac: 'GetNextNo'};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status=="1"){
          var autoNo = res.data.autoNo;
          var hexyhbh = com.ex10hex(yhbh,2); //十进制转成十六进制
          if(lx=='01'){  //01指纹
            cmd = autoNo+'AA5505001C0201'+hexyhbh+'CC';
          }else if(lx=='03'){ //03密码
            cmd = autoNo+'AA5505001C0203'+hexyhbh+'CC';
          }
          //console.log("删除密码加密前cmd:"+cmd);
          com.get_encryption(dsn,cmd,function(res){  //获取加密
            //console.log("加密内码:"+res.errCode2);
            if(res.errCode2=='1001'){
              let cmd = res.cmd;
              let cmdT = autoNo+cmd;
              BLE.sendCommand(cmdT,function(res){  //写入数据
                if(res.errCode==0){
                  that.del_Rh_yhb(dsn,yhbh,lx,'upd');//删除门锁用户
                  if(lx=='01'){  //01指纹
                    that.insertLog_LS(userid,'',dsn,'删除','指纹('+yhbh+')','','朗思管理端');
                    that.zhiwen_add(dsn,bdate,edate); //新增指纹
                  }else if(lx=='03'){ //03密码
                    that.insertLog_LS(userid,'',dsn,'删除','普通用户('+yhbh+')',pwd_old,'朗思管理端');
                    that.password_add(dsn,newPwd,bdate,edate); //新增密码
                    setTimeout(()=>{
                      newPwd = "";
                      that.setData( {
                        ifName: false,    //隐藏弹出框
                        fxmc:""
                      });
                    },1000)
                  }
                }
                else{
                  wx.hideToast();  //关闭提示框
                  wx.showToast({
                    title: '删除失败',
                    icon: "error",
                    duration: 1000
                  })     
                }
              });
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
  },
  onShow: function () { //生命周期函数--监听页面显示
    this.get_mssj(dsn,search); //获取门锁数据
  }
})