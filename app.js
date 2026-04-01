// app.js
App({
  onLaunch() {
    // 初始化全局数据
    this.initGlobalData()
  },

  // 初始化全局数据
  initGlobalData() {
    // 从本地存储获取数据
    const userInfo = wx.getStorageSync('userInfo')
    const remainingTimes = wx.getStorageSync('remainingTimes')
    
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
    
    // 默认2次免费次数
    this.globalData.remainingTimes = remainingTimes !== '' ? remainingTimes : 2
  },

  // 获取剩余可用次数
  getRemainingTimes() {
    return this.globalData.remainingTimes
  },

  // 消耗一次次数
  useOnce() {
    if (this.globalData.remainingTimes > 0) {
      this.globalData.remainingTimes--
      wx.setStorageSync('remainingTimes', this.globalData.remainingTimes)
      return true
    }
    return false
  },

  // 增加次数
  addTimes(count) {
    this.globalData.remainingTimes += count
    wx.setStorageSync('remainingTimes', this.globalData.remainingTimes)
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  globalData: {
    userInfo: null,
    remainingTimes: 2,
    isLoggedIn: false
  }
})
