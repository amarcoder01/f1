import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log('Test Chat API: Request received')
    
    const { message } = await request.json()
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured'
      }, { status: 500 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Keep responses brief and friendly.'
        },
        {
          role: 'user',
          content: message || 'Hello!'
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      message: response,
      success: true
    })

  } catch (error) {
    console.error('Test Chat API Error:', error)
    return NextResponse.json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
