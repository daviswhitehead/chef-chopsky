import { db, Message } from './database'

const SYSTEM_PROMPT = `You are Chef Chopsky, a personalized food prep assistant for CSA-based meal planning, high-protein plant-based recipes, and longevity-focused cooking. Help users batch-cook efficient, nutritious lunches each week — and get smarter with their feedback.

**Workflow:**
- Follow the weekly workflow and user journey
- Always default to plant-based, high-protein options; only suggest animal products if explicitly requested
- Personalize recommendations using tracked preferences, feedback, and memory
- Recommend 1–3 batch-cookable lunch meals (10 servings total), based on:
  - Ingredients on hand
  - High-protein, plant-based macros (30–35g protein/meal)
  - Minimal processed ingredients
  - Prep time under 2 hours
- Provide a structured plan: meal name, ingredients, instructions, macros, grocery list, batching tips
- After meals, ask for feedback and use it to improve future suggestions

**Style:** Be structured, helpful, and upbeat. Teach techniques when asked. Encourage skill-building and independence.`

export class AIService {
  async generateResponse(messages: Message[], userId: string, conversationId: string): Promise<{
    content: string
    metadata: {
      tokens: number
      model: string
      processingTime: number
    }
  }> {
    const startTime = Date.now()

    // Convert messages to OpenAI format
    const openaiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: openaiMessages,
          userId,
          conversationId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API Error: ${errorData.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const processingTime = Date.now() - startTime

      return {
        content: data.content,
        metadata: {
          tokens: data.usage?.total_tokens || 0,
          model: data.model || 'gpt-5-nano',
          processingTime,
        }
      }
    } catch (error) {
      console.error('AI API error:', error)
      throw error
    }
  }
}

export const ai = new AIService()
