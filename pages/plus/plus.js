// pages/plus/plus.js
const app = getApp()

Page({
  data: {
    remainingTimes: 2,
    userInfo: null,
    showQrcodeModal: false,
    selectedPackage: 5,
    isPurchasing: false
  },

  onLoad() {
    this.setData({
      remainingTimes: app.globalData.remainingTimes,
      userInfo: app.globalData.userInfo
    })
  },

  onShow() {
    // 每次显示时同步次数
    this.setData({
      remainingTimes: app.globalData.remainingTimes
    })
  },

  // 选择套餐
  selectPackage(e) {
    const id = parseInt(e.currentTarget.dataset.id, 10)
    
    // 如果正在购买中，忽略点击
    if (this.data.isPurchasing) return
    
    // 获取套餐信息
    const packages = {
      1: { price: 4.9, name: '单次' },
      5: { price: 19.9, name: '5次' },
      10: { price: 29.9, name: '10次' }
    }
    
    const pkg = packages[id]
    if (!pkg) return
    
    this.setData({ selectedPackage: id })
    
    wx.showModal({
      title: '确认购买',
      content: `确定购买${pkg.name}通用次数包，支付¥${pkg.price}？`,
      success: (res) => {
        if (res.confirm) {
          this.purchasePackage(id, pkg.price)
        }
      }
    })
  },

  // 购买套餐
  purchasePackage(count, price) {
    // 确保count是数字
    count = parseInt(count, 10)
    
    this.setData({ isPurchasing: true })
    wx.showLoading({ title: '支付中...', mask: true })
    
    // 模拟支付（实际项目中需要调用微信支付API）
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新次数（确保数字运算）
      const currentTimes = parseInt(app.globalData.remainingTimes, 10) || 0
      const newTimes = currentTimes + count
      
      app.globalData.remainingTimes = newTimes
      wx.setStorageSync('remainingTimes', newTimes)
      
      this.setData({
        remainingTimes: newTimes,
        isPurchasing: false
      })
      
      wx.showToast({
        title: '购买成功',
        icon: 'success'
      })
    }, 1500)
  },

  // 预约面试官
  bookInterview() {
    wx.showModal({
      title: '预约1V1模拟面试',
      content: '请添加客服微信进行预约，我们将为您匹配最适合的面试官。',
      confirmText: '复制客服微信',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'AI_Interview_2024',
            success: () => {
              wx.showToast({
                title: '已复制客服微信',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  // 邀请好友
  inviteFriend() {
    wx.showModal({
      title: '邀请好友',
      content: '分享小程序给好友，好友完成首次面试后，双方各得1次免费次数。',
      confirmText: '立即分享',
      success: (res) => {
        if (res.confirm) {
          wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage']
          })
        }
      }
    })
  },

  // 显示二维码弹窗
  showQrcodeModal() {
    this.setData({ showQrcodeModal: true })
  },

  // 隐藏二维码弹窗
  hideQrcodeModal() {
    this.setData({ showQrcodeModal: false })
  },

  // 点击遮罩关闭弹窗
  onModalMaskTap() {
    this.hideQrcodeModal()
  },

  preventTouchMove() {},

  // 分享
  onShareAppMessage() {
    return {
      title: 'AI面试助手 - 让面试更简单',
      path: '/pages/interview/interview'
    }
  }
})
