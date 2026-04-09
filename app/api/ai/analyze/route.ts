// AI 자동 태그 생성 엔드포인트 — Claude API로 노트 분석 후 태그/카테고리/관련 개념 반환

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ANALYZE_SYSTEM_PROMPT, buildUserMessage } from '@/lib/prompts/analyze';

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 유저 메시지 조립
    const userMessage = buildUserMessage(body);

    // Claude API 호출
    const message = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0,
      system: ANALYZE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    // 응답에서 텍스트 추출
    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Claude API에서 텍스트 응답을 받지 못했습니다');
    }

    // JSON 파싱 — 마크다운 코드 펜스가 포함된 경우 제거
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      data: {
        skillTags: parsed.skillTags ?? [],
        topicTags: parsed.topicTags ?? [],
        category: parsed.category ?? '',
      },
    });
  } catch (err: unknown) {
    console.error('AI 분석 실패:', err);
    const message = err instanceof Error ? err.message : 'AI 분석 중 오류 발생';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
