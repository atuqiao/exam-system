Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#07c160",
    list: [
      {
        pagePath: "/pages/exams/exams",
        iconPath: "/static/tabbar/exam.png",
        selectedIconPath: "/static/tabbar/exam-active.png",
        text: "试卷"
      },
      {
        pagePath: "/pages/mock/mock",
        iconPath: "/static/tabbar/mock.png",
        selectedIconPath: "/static/tabbar/mock-active.png",
        text: "模考"
      },
      {
        pagePath: "/pages/profile/profile",
        iconPath: "/static/tabbar/profile.png",
        selectedIconPath: "/static/tabbar/profile-active.png",
        text: "我的"
      }
    ]
  },

  lifetimes: {
    attached() {
      // 组件加载时获取当前页面路径
      this.updateSelected()
    }
  },

  pageLifetimes: {
    show() {
      // 页面显示时更新选中状态
      this.updateSelected()
    }
  },

  methods: {
    updateSelected() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]

      if (!currentPage || !currentPage.route) return

      const currentRoute = currentPage.route

      // 根据当前页面路径更新选中状态
      const selected = this.data.list.findIndex(item => {
        return item.pagePath === `/${currentRoute}` || item.pagePath === currentRoute
      })

      if (selected !== -1 && selected !== this.data.selected) {
        this.setData({ selected })
      }
    },

    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      const index = data.index;

      // 更新选中状态
      this.setData({ selected: index });

      wx.switchTab({
        url
      });
    }
  }
});
