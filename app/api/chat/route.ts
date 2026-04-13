// POST /api/chat — Claude API SSE 스트리밍, 설정 기반 동적 프롬프트

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildChatPrompt, type ChatSettings } from '@/lib/prompts/chat';
import { getSupabase } from '@/lib/supabase';

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 유저 설정 조회 (DB 직접)
async function getSettings(): Promise<ChatSettings | null> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('user_settings')
      .select('nickname, chat_tone, response_language')
      .limit(1)
      .single();

    if (!data) return null;
    return {
      nickname: data.nickname,
      chatTone: data.chat_tone,
      responseLanguage: data.response_language,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 설정 조회 + 동적 프롬프트 빌드
    const settings = await getSettings();
    const systemPrompt = buildChatPrompt(settings);

    const recentMessages = messages.slice(-20);

    const stream = claude.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: recentMessages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta') {
              const delta = event.delta;
              if ('text' in delta) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta.text })}\n\n`));
              }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
