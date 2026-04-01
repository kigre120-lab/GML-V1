// pages/interview/interview.js
const app = getApp()

Page({
  data: {
    // 授权弹窗
    showAuthModal: false,
    
    // 面试模式
    showPositionArea: false,
    showJdArea: false,
    isInterviewing: false,
    interviewMode: '', // 'position' 或 'jd'
    interviewFinished: false, // 面试是否结束
    
    // 岗位数据
    currentPosition: '',
    techPositions: ['Java后端开发', 'Go后端开发', 'Python后端开发', '前端开发', '测试开发工程师', '算法工程师', '大数据开发工程师', '运维工程师'],
    productPositions: ['产品经理', 'UI/UX设计师', '交互设计师'],
    operationPositions: ['运营岗', '用户运营', '内容运营', '电商运营', '市场岗'],
    otherPositions: ['人力资源HR', '数据分析师'],
    
    // JD内容
    jdContent: '',
    
    // 面试数据
    questionCount: 0,
    maxQuestion: 50,
    messages: [],
    currentQuestion: '',
    scrollToView: '',
    isAiTyping: false, // AI是否正在输入
    
    // 输入相关
    isVoiceMode: false,
    inputText: '',
    isRecording: false,
    
    // 付费弹窗
    showPayModal: false,
    remainingTimes: 2
  },

  onLoad() {
    // 检查是否已授权
    const isAuthed = wx.getStorageSync('wechat_auth')
    if (!isAuthed) {
      this.setData({ showAuthModal: true })
    }
    
    // 获取剩余次数
    this.setData({
      remainingTimes: app.globalData.remainingTimes
    })
  },

  onShow() {
    // 每次显示页面时同步次数
    this.setData({
      remainingTimes: app.globalData.remainingTimes
    })
  },

  // 授权相关
  confirmAuth() {
    wx.setStorageSync('wechat_auth', 'true')
    this.setData({ showAuthModal: false })
  },

  refuseAuth() {
    wx.setStorageSync('wechat_auth', 'false')
    this.setData({ showAuthModal: false })
    wx.showToast({
      title: '你拒绝了授权',
      icon: 'none'
    })
  },

  // 显示岗位选择
  showPositionSelect() {
    this.setData({
      interviewMode: 'position',
      showPositionArea: true,
      showJdArea: false
    })
  },

  // 显示JD输入
  showJdInput() {
    this.setData({
      interviewMode: 'jd',
      showJdArea: true,
      showPositionArea: false
    })
  },

  // 选择岗位
  selectPosition(e) {
    const position = e.currentTarget.dataset.position
    this.setData({ currentPosition: position })
  },

  // JD输入
  onJdInput(e) {
    this.setData({ jdContent: e.detail.value })
  },

  // 开始岗位面试
  startInterview() {
    if (!this.data.currentPosition) {
      wx.showToast({
        title: '请先选择面试岗位',
        icon: 'none'
      })
      return
    }
    
    // 检查次数
    if (this.data.remainingTimes <= 0) {
      this.setData({ showPayModal: true })
      return
    }
    
    // 消耗次数
    if (app.useOnce()) {
      this.setData({ remainingTimes: app.globalData.remainingTimes })
    }
    
    // 更新标题
    wx.setNavigationBarTitle({
      title: this.data.currentPosition
    })
    
    // 初始化聊天界面
    this.initChat()
  },

  // 开始JD面试
  startJdInterview() {
    if (!this.data.jdContent.trim()) {
      wx.showToast({
        title: '请输入职位描述',
        icon: 'none'
      })
      return
    }
    
    // 检查次数
    if (this.data.remainingTimes <= 0) {
      this.setData({ showPayModal: true })
      return
    }
    
    // 消耗次数
    if (app.useOnce()) {
      this.setData({ remainingTimes: app.globalData.remainingTimes })
    }
    
    // 更新标题
    wx.setNavigationBarTitle({
      title: 'JD针对性面试'
    })
    
    // 初始化聊天界面
    this.initChat()
  },

  // 初始化聊天界面
  initChat() {
    const positionText = this.data.interviewMode === 'position' 
      ? this.data.currentPosition 
      : 'JD针对性'
    
    this.setData({
      isInterviewing: true,
      interviewFinished: false,
      messages: [{
        id: 0,
        type: 'ai',
        content: `你好，我是你的AI面试助手，现在开始${positionText}岗位的模拟面试。我将逐一提问，请认真作答。`
      }],
      questionCount: 0,
      isAiTyping: false
    })
    
    // 延迟生成第一道题
    setTimeout(() => {
      this.generateQuestion()
    }, 1200)
  },

  // 生成问题
  generateQuestion() {
    // 如果已结束，不再生成
    if (this.data.interviewFinished) return
    
    // 添加打字指示器
    this.setData({ isAiTyping: true })
    
    const typingMsg = {
      id: 'typing',
      type: 'typing'
    }
    
    const messages = [...this.data.messages, typingMsg]
    this.setData({ 
      messages,
      scrollToView: 'msg-bottom'
    })
    
    // 模拟AI生成问题（随机延迟1-2秒）
    const delay = 1000 + Math.random() * 1000
    
    setTimeout(() => {
      const questions = [
        '请简单介绍一下你自己，包括你的技术背景和项目经验。',
        '请描述一个你遇到过的技术难题，以及你是如何解决的？',
        '你对微服务架构有什么理解？它的优缺点是什么？',
        '请解释一下什么是RESTful API？它有哪些设计原则？',
        '在高并发场景下，你会如何设计系统架构？',
        '请谈谈你对数据库索引的理解，如何优化查询性能？',
        '描述一下你项目中使用过的设计模式及其应用场景。',
        '如何保证接口的安全性？有哪些常见的防护措施？',
        '请解释分布式事务的实现方案和适用场景。',
        '你如何看待代码质量？有哪些提高代码质量的实践？'
      ]
      
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
      
      // 移除打字指示器，添加真实问题
      const newMessages = this.data.messages.filter(m => m.type !== 'typing')
      newMessages.push({
        id: Date.now(),
        type: 'ai',
        content: randomQuestion
      })
      
      this.setData({
        messages: newMessages,
        currentQuestion: randomQuestion,
        questionCount: this.data.questionCount + 1,
        scrollToView: 'msg-bottom',
        isAiTyping: false
      })
    }, delay)
  },

  // 切换输入模式
  toggleInputMode() {
    this.setData({
      isVoiceMode: !this.data.isVoiceMode
    })
  },

  // 输入框变化
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    })
  },

  // 发送消息
  sendMessage() {
    if (!this.data.inputText.trim()) {
      return
    }
    
    if (this.data.isAiTyping) {
      wx.showToast({
        title: 'AI正在思考中...',
        icon: 'none'
      })
      return
    }
    
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: this.data.inputText
    }
    
    const messages = [...this.data.messages, userMessage]
    
    this.setData({
      messages,
      inputText: '',
      scrollToView: 'msg-bottom'
    })
    
    // 检查是否达到最大题数
    if (this.data.questionCount >= this.data.maxQuestion) {
      setTimeout(() => {
        this.finishInterview()
      }, 500)
      return
    }
    
    // AI确认收到回答后生成下一题
    setTimeout(() => {
      this.generateQuestion()
    }, 800)
  },

  // 开始录音
  startRecording() {
    this.setData({ isRecording: true })
    wx.showToast({
      title: '正在录音...',
      icon: 'none',
      duration: 60000
    })
  },

  // 停止录音
  stopRecording() {
    this.setData({ isRecording: false })
    wx.hideToast()
    
    // 模拟语音识别结果
    wx.showModal({
      title: '提示',
      content: '语音识别功能需要接入语音识别API',
      showCancel: false
    })
  },

  // 结束面试
  finishInterview() {
    const finishMsg = {
      id: Date.now(),
      type: 'ai',
      content: '面试已结束！你已完成所有问题，感谢你的参与。你可以查看历史记录了解详细评分。'
    }
    
    const messages = [...this.data.messages, finishMsg]
    
    this.setData({ 
      messages,
      interviewFinished: true,
      scrollToView: 'msg-bottom'
    })
    
    // 保存面试记录到历史
    this.saveInterviewHistory()
  },

  // 保存面试记录到历史
  saveInterviewHistory() {
    const positionText = this.data.interviewMode === 'position' 
      ? this.data.currentPosition 
      : 'JD针对性面试'
    
    // 计算得分（模拟60-95之间的随机分数）
    const score = 60 + Math.floor(Math.random() * 35)
    
    // 创建面试记录
    const record = {
      id: Date.now(),
      title: positionText + '面试',
      status: 'finished',
      score: score,
      answered: this.data.questionCount,
      total: this.data.maxQuestion,
      statusClass: score >= 80 ? 'success' : (score >= 60 ? 'warning' : 'danger'),
      date: this.formatDate(new Date())
    }
    
    // 获取现有记录
    const history = wx.getStorageSync('interview_history') || []
    
    // 添加新记录到开头
    history.unshift(record)
    
    // 最多保留20条记录
    const newHistory = history.slice(0, 20)
    
    // 保存到本地存储
    wx.setStorageSync('interview_history', newHistory)
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 退出面试（返回初始页）
  exitInterview() {
    const content = this.data.questionCount > 0 
      ? '确定要退出当前面试吗？已回答的问题将保存到历史记录。'
      : '确定要退出当前面试吗？'
    
    wx.showModal({
      title: '确认退出',
      content: content,
      success: (res) => {
        if (res.confirm) {
          // 如果已回答问题，保存记录
          if (this.data.questionCount > 0 && !this.data.interviewFinished) {
            this.saveOngoingInterview()
          }
          this.resetInterview()
        }
      }
    })
  },

  // 保存进行中的面试
  saveOngoingInterview() {
    const positionText = this.data.interviewMode === 'position' 
      ? this.data.currentPosition 
      : 'JD针对性面试'
    
    const record = {
      id: Date.now(),
      title: positionText + '面试',
      status: 'ongoing',
      score: null,
      answered: this.data.questionCount,
      total: this.data.maxQuestion,
      statusClass: 'primary',
      date: this.formatDate(new Date())
    }
    
    const history = wx.getStorageSync('interview_history') || []
    history.unshift(record)
    wx.setStorageSync('interview_history', history.slice(0, 20))
  },

  // 重置面试状态
  resetInterview() {
    this.setData({
      isInterviewing: false,
      interviewFinished: false,
      messages: [],
      questionCount: 0,
      currentPosition: '',
      jdContent: '',
      showPositionArea: false,
      showJdArea: false,
      inputText: '',
      isAiTyping: false
    })
    
    // 恢复标题
    wx.setNavigationBarTitle({
      title: 'AI面试助手'
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
