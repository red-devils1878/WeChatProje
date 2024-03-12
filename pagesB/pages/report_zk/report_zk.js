// pages/report_zk/report_zk.js
var contractNo = "";//合同号
var hid = "";//房源id
var app = getApp();
var apiUrl = app.globalData.apiUrl;   //获取api地址
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData:[], 
    qtfyData:[], 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    apiUrl = app.globalData.apiUrl;
    contractNo = options.contractNo;
    //contractNo = "Cont2210250534";
    let djly = options.djly;
    //获取当前设备的宽高
    wx.getSystemInfo({ 
      success: function( res ) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    that.setData({
      djly: djly,
    });
    that.get_contract(contractNo);  //获取合同信息
    that.contract_Report2(contractNo);  //获取合同账单明细
    that.contract_Report3(contractNo);  //获取其他费用明细
  },
  get_contract:function (contractNo) { //获取合同信息
    let _this = this;
    var _data = {ac: 'contract_Report1',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
          var units = res.data.rows;
          if(units.length > 0){
            hid = units[0].roomId;
            let inTime2 = (units[0].inTime);
            let outTime2 = (units[0].outTime);
            inTime2 = inTime2.replace('0:00:00','').replace('/','-').replace('/','-');
            outTime2 = outTime2.replace('0:00:00','').replace('/','-').replace('/','-');
            _this.setData({
              contractNo:units[0].contractNo,
              hid:units[0].roomId,
              houseName:units[0].text2+units[0].text3,
              tenantName:units[0].tenantName,
              tel:units[0].tenantTel,
              cardNo:units[0].credentialsNo,
              zjlx_name:units[0].text4,
              deposit:units[0].deposit,
              rent:units[0].deposit_total,
              jf:units[0].jf_name,
              start_y:inTime2.substring(0,4),
              start_m:inTime2.substring(5,7),
              start_d:inTime2.substring(8,10),
              end_y:outTime2.substring(0,4),
              end_m:outTime2.substring(5,7),
              end_d:outTime2.substring(8,10),
              inTime2:inTime2,
              outTime2:outTime2,
              fkfsF_name:units[0].fkfs_name,
              dxje_zj:units[0].dxje_zj,
              dxje_yj:units[0].text1,
              tqsksj:units[0].tqsksj,
              amount_first:units[0].amount_first,
              supplement:(units[0].supplement=='') ? "无":units[0].supplement,
            })
            _this.get_roomInfo(hid);//获取房间信息
          }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  contract_Report2:function (contractNo) { //获取合同账单明细
    let _this = this;
    var _data = {ac: 'contract_Report2',"contractNo":contractNo};
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
              "zhangqi":units[i].zhangqi,
              "periods_num":units[i].periods_num,
              "zdxq":units[i].fylx_name+units[i].zdje,
              "yssj2":units[i].yssj2,
            })
          } 
          setTimeout(()=>{
            _this.setData({
              listData:newlist
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
  contract_Report3:function (contractNo) { //获取其他费用明细
    let _this = this;
    var _data = {ac: 'contract_Report3',"contractNo":contractNo};
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
              "id":units[i].id3,
              "sort":i+1,
              "fylx_name":units[i].fylx_name,
              "amount":units[i].amount_d3,
              "dxje_qtfy":units[i].dxje_qtfy,
            })
          }
          setTimeout(()=>{
            _this.setData({
              qtfyData:newlist
            })
          },10)
      },
      fail(res) {
        console.log("加载数据失败");
      },
      complete(){
      }
    });  
  },
  get_roomInfo:function (hid) { //获取房间信息
    let _this = this;
    var _data = {ac: 'house_info',"hid":hid};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        var units = res.data.rows;
          _this.setData({
          area:units[0].roomArea,
          address:units[0].address
        })
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  qrqy: function (e) { //确认签约
    let _this = this;
    wx.showModal({
      title: '',
      content: '是否确认签约？',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          _this.update_qysj(contractNo);//更新签约时间
        } else {//这里是点击了取消以后
          console.log('用户点击取消')
        }
      }
    })
  },
  update_qysj:function (contractNo) { //更新签约时间
    var _data = {ac: 'update_qysj',"contractNo":contractNo};
    wx.request({
      url: apiUrl,  //api地址
      data: _data,
      header: {'Content-Type': 'application/json'},
      method: "get",
      success(res) {
        if(res.data.status =='1'){
          wx.showToast({
            title: '签约成功',
            icon: 'success',
            duration: 1000
          })
          setTimeout(function() {
            wx.navigateBack({
              delta: 1,
            }) 
          }, 1000)
        }
      },
      fail(res) {
        console.log("getunits fail:",res);
      },
      complete(){
      }
    });  
  },
  onShow: function () { // 生命周期函数--监听页面显示

  }
})