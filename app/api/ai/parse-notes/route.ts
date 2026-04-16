// POST /api/ai/parse-notes — 텍스트 덩어리 → 개별 학습 노트 분리

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PARSE_NOTES_SYSTEM_PROMPT } from '@/lib/prompts/parse-notes';
import { fetchExistingTopicTags } from '@/lib/existingTags';

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { rawText } = await request.json();

    if (!rawText?.trim()) {
      return NextResponse.json(
        { success: false, error: 'rawText is required' },
        { status: 400 }
      );
    }

    // 5000자 제한
    const trimmed = rawText.slice(0, 5000);

    // 기존 topic tags를 프롬프트에 prepend
    const existingTopicTags = await fetchExistingTopicTags();
    const tagBlock = existingTopicTags.length > 0
      ? `Existing Topic Tags (reuse when possible, kebab-case):\n${existingTopicTags.slice(0, 80).join(', ')}\n\n---\n\n`
      : '';

    const message = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0,
      system: PARSE_NOTES_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: tagBlock + trimmed }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude API');
    }

    // JSON 파싱 — 마크다운 코드 펜스 제거
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonText);
    const notes = (parsed.notes ?? []).slice(0, 10); // 최대 10개

    return NextResponse.json({
      success: true,
      data: { notes },
    });
  } catch (err: unknown) {
    console.error('Parse notes failed:', err);
    const message = err instanceof Error ? err.message : 'AI analysis error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
