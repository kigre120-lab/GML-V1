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
   * 构建系统提示词
   */
  _buildSystemPrompt(position, jd) {
    let prompt = `你是一位资深的${position}面试官，正在对候选人进行模拟面试。

面试规则：
1. 每次只问一个问题，等待候选人回答
2. 根据回答质量给予简短评价（1-2句话，不要过于冗长）
3. 然后提出下一个相关问题
4. 问题要专业、有深度，符合该岗位的实际面试场景
5. 不要一次性问多个问题
6. 保持友好专业的面试官人设
7. 如果候选人的回答很简短或偏离主题，可以追问或引导

面试范围：
- 专业技能相关
- 项目经验深入
- 问题解决能力
- 技术原理理解
- 实际应用场景`

    if (jd) {
      prompt += `\n\n职位要求参考：\n${jd}`
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
   * 调用后端API
   */
  async _callBackendAPI() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://gml-v1-ddke.vercel.app/api/chat',
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
