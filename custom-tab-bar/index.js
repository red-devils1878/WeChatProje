Component({
  data: {
    selected: 0,
    color: "#000000",
    roleId: '',
    selectedColor: "#5677FC",
    allList: [{
      //管理账户
      list1: [{
        pagePath: "/pages/home/home",
        iconPath: "/static/images/tabbar/shouye1.jpg",
        selectedIconPath: "/static/images/tabbar/shouye2.jpg",
        text: "首页"
      }, {
        pagePath: "/pages/room_list2/room_list2",
        iconPath: "/static/images/tabbar/house1.jpg",
        selectedIconPath: "/static/images/tabbar/house2.jpg",
        text: "房源"
      }, {
        pagePath: "/pages/my/my",
        iconPath: "/static/images/tabbar/me1.jpg",
        selectedIconPath: "/static/images/tabbar/me2.jpg",
        text: "我的",
      }],
      //样品管理
      list2: [{
        pagePath: "/pages/homeYS/homeYS",
        iconPath: "/static/images/tabbar/shouye1.jpg",
        selectedIconPath: "/static/images/tabbar/shouye2.jpg",
        text: "首页"
      }, {
        pagePath: "/pages/my/my",
        iconPath: "/static/images/tabbar/me1.jpg",
        selectedIconPath: "/static/images/tabbar/me2.jpg",
        text: "我的",
      }],
      //旧项目运营
      list3: [{
        pagePath: "/pages/homeYY/homeYY",
        iconPath: "/static/images/tabbar/shouye1.jpg",
        selectedIconPath: "/static/images/tabbar/shouye2.jpg",
        text: "首页"
      }, {
        pagePath: "/pages/my/my",
        iconPath: "/static/images/tabbar/me1.jpg",
        selectedIconPath: "/static/images/tabbar/me2.jpg",
        text: "我的",
      }],   
    }],
    list: []
  },
  ready(){  //组件在视图层布局完成后执行
   let that = this;
   const roleId = wx.getStorageSync('job');
   let QZ = wx.getStorageSync('QZ');  //前缀
   if(QZ=="jianxin" || QZ=="anju" || QZ=="jinyuan" || QZ=="iot"){  //嘉福、安居
    that.setData({
      list: this.data.allList[0].list3
    })
   }
   else{
     //console.log("顺序1");
     //console.log("真机调试："+roleId);
     if (roleId == "样品管理员" || roleId == "安装" || roleId == "维保") {  //样品管理员、安装
      that.setData({
        list: this.data.allList[0].list2
      })
     }else{  //管理员
     //console.log("管理员："+this.data.allList[0].list1);
      that.setData({
        list: this.data.allList[0].list1
      })
    }
  }
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    }
  },
})
  