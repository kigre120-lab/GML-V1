// pages/history/history.js
const app = getApp()

Page({
  data: {
    remainingTimes: 2,
    showPayModal: false,
    
    // 面试记录列表（默认为空）
    interviewList: [],
    
    // 需要强化的问列表（默认为空）
    questionList: []
  },

  onLoad() {
    this.setData({
      remainingTimes: app.globalData.remainingTimes
    })
    
    // 加载面试记录
    this.loadInterviewHistory()
  },

  onShow() {
    this.setData({
      remainingTimes: app.globalData.remainingTimes
    })
    
    // 每次显示时刷新数据
    this.loadInterviewHistory()
    this.loadBookmarkedQuestions()
  },

  // 加载面试历史记录
  loadInterviewHistory() {
    // 从本地存储获取面试记录（实际项目中应该从服务器获取）
    const history = wx.getStorageSync('interview_history') || []
    this.setData({ interviewList: history })
  },

  // 加载收藏的问题
  loadBookmarkedQuestions() {
    // 从本地存储获取收藏的问题
    const questions = wx.getStorageSync('bookmarked_questions') || []
    this.setData({ questionList: questions })
  },

  // 新建面试
  startNewInterview() {
    if (this.data.remainingTimes <= 0) {
      this.setData({ showPayModal: true })
      return
    }
    
    wx.switchTab({
      url: '/pages/interview/interview'
    })
  },

  // 继续面试
  continueInterview(e) {
    const id = e.currentTarget.dataset.id
    // 保存当前面试ID到全局
    app.globalData.currentInterviewId = id
    wx.switchTab({
      url: '/pages/interview/interview'
    })
  },

  // 查看面试详情
  viewInterviewDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '查看面试详情',
      icon: 'none'
    })
  },

  // 切换收藏状态
  toggleBookmark(e) {
    const id = e.currentTarget.dataset.id
    const questionList = this.data.questionList.filter(item => item.id !== id)
    
    this.setData({ questionList })
    wx.setStorageSync('bookmarked_questions', questionList)
    
    wx.showToast({
      title: '已取消收藏',
      icon: 'none'
    })
  },

  // 查看全部问题
  viewAllQuestions() {
    wx.showToast({
      title: '查看全部问题',
      icon: 'none'
    })
  },

  // 关闭付费弹窗
  closePayModal() {
    this.setData({ showPayModal: false })
  },

  // 跳转加经验页
  goToPlus() {
    this.setData({ showPayModal: false })
    wx.switchTab({
      url: '/pages/plus/plus'
    })
  },

  preventTouchMove() {}
})
