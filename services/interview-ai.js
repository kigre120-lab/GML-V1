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
   * 构建系统提示词（专业面试官版）
   */
  _buildSystemPrompt(position, jd) {
    let prompt = `你是${position}资深面试官，有10年大厂面试经验。

【面试框架】按顺序推进，每轮只问一题：
1. 自我介绍与背景
2. 技术基础深度考察
3. 项目经验深挖
4. 系统设计/场景题
5. 软技能与团队协作

【提问原则】
- 针对候选人回答追问细节："你提到的XX，具体是怎么实现的？"
- 挖掘深度："为什么选择X方案而不是Y？有什么trade-off？"
- 质疑验证："如果流量翻10倍，你的方案会有什么问题？"
- 控制字数：评价控制在20字内，问题控制在30字内

【回复格式】
简短评价(1句) + 下一题(1个具体问题)

现在开始面试，先让候选人自我介绍。`

    if (jd) {
      prompt += `\n\n【岗位要求】${jd.substring(0, 300)}`
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
