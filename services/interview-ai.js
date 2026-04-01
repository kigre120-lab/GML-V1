/**
 * AI服务模块 - 面试对话
 * 接入DeepSeek API进行智能面试
 */

/**
 * 面试对话API封装
 */
class InterviewAIService {
  constructor() {
    this.conversationHistory = []
    this.position = ''
    this.questionCount = 0
  }

  /**
   * 初始化面试会话
   * @param {string} position - 面试岗位
   * @param {string} jd - 职位描述（可选）
   */
  initInterview(position, jd = '') {
    this.position = position
    this.questionCount = 0
    this.conversationHistory = [
      {
        role: 'system',
        content: this._buildSystemPrompt(position, jd)
      }
    ]
  }

  /**
   * 构建系统提示词（智能岗位适配）
   */
  _buildSystemPrompt(position, jd) {
    // 判断岗位类型
    const techPositions = ['Java', 'Go', 'Python', '前端', '测试', '算法', '大数据', '运维', '后端']
    const productPositions = ['产品经理', 'UI', 'UX', '交互设计']
    const operationPositions = ['运营', '用户运营', '内容运营', '电商运营', '市场', '人力资源', '数据分析师']
    
    const isTech = techPositions.some(p => position.includes(p))
    const isProduct = productPositions.some(p => position.includes(p))
    const isOperation = operationPositions.some(p => position.includes(p))
    
    let framework = ''
    let focusArea = ''
    
    if (isTech) {
      framework = `【技术岗面试框架】
1. 自我介绍与背景了解
2. 技术基础深度考察（原理、源码、底层机制）
3. 项目经验深挖（技术选型、难点、优化）
4. 系统设计/架构能力
5. 工程实践与团队协作`
      focusArea = '技术原理、源码理解、性能优化、架构设计'
    } else if (isProduct) {
      framework = `【产品岗面试框架】
1. 自我介绍与产品经历
2. 产品思维与需求分析能力
3. 项目复盘与数据驱动
4. 用户研究与竞品分析
5. 跨部门协作与沟通`
      focusArea = '需求洞察、用户研究、数据思维、商业逻辑'
    } else {
      framework = `【运营岗面试框架】
1. 自我介绍与运营经历
2. 数据分析与增长策略
3. 活动策划与执行复盘
4. 用户洞察与内容能力
5. 跨部门协作与抗压`
      focusArea = '数据分析、活动策划、用户增长、内容创作'
    }

    let prompt = `你是${position}资深面试官，在大厂有8年面试经验。

${framework}

【核心原则】
- 每轮只问一个具体问题
- 针对回答追问细节，挖掘真实能力
- 使用STAR法则验证："具体做了什么？结果如何？"
- 评价简洁(15字内)，问题具体(明确场景)

【追问技巧】
- 深挖细节："这个项目的核心难点是什么？你如何解决的？"
- 质疑验证："如果预算减半，你会怎么调整策略？"
- 场景假设："遇到用户投诉激增，你的处理流程是什么？"
- 数据验证："提升了多少？如何归因？"

现在开始面试，先让候选人自我介绍。`

    if (jd) {
      prompt += `\n\n【岗位重点】${jd.substring(0, 300)}`
    }

    return prompt
  }

  /**
   * 发送用户回答并获取AI响应
   * @param {string} userAnswer - 用户回答
   * @returns {Promise<{content: string, questionCount: number}>}
   */
  async sendMessage(userAnswer) {
    this.questionCount++
    
    // 添加用户消息到历史
    this.conversationHistory.push({
      role: 'user',
      content: userAnswer
    })

    try {
      // 调用后端API
      const response = await this._callBackendAPI()
      
      // 添加AI回复到历史
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      })

      return {
        content: response,
        questionCount: this.questionCount
      }
    } catch (error) {
      console.error('AI调用失败:', error)
      return this._getFallbackResponse()
    }
  }

  /**
   * 调用后端API（腾讯云函数）
   */
  async _callBackendAPI() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://1412613722-havm9js1z3.ap-guangzhou.tencentscf.com',
        method: 'POST',
        data: {
          history: this.conversationHistory
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            resolve(res.data.content)
          } else {
            reject(new Error(res.data.message || 'API调用失败'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 降级处理：预设回复
   */
  _getFallbackResponse() {
    const fallbackQuestions = [
      '请介绍一下你最近参与的一个项目，你在其中承担了什么角色？',
      '你认为在这个岗位上，最重要的技能是什么？',
      '请描述一下你遇到过的一个技术难题，你是如何解决的？',
      '你如何看待团队合作？请举例说明。',
      '你对未来的职业发展有什么规划？'
    ]
    
    const index = this.questionCount % fallbackQuestions.length
    return {
      content: fallbackQuestions[index],
      questionCount: this.questionCount
    }
  }

  /**
   * 结束面试，生成总结
   */
  async finishInterview() {
    const summaryPrompt = '面试结束。请对这位候选人的整体表现做一个简短的评价总结（100字以内）。'
    
    this.conversationHistory.push({
      role: 'user',
      content: summaryPrompt
    })

    try {
      const response = await this._callBackendAPI()
      return {
        summary: response,
        totalQuestions: this.questionCount
      }
    } catch (error) {
      return {
        summary: '面试结束，感谢参与！',
        totalQuestions: this.questionCount
      }
    }
  }
}

module.exports = new InterviewAIService()
