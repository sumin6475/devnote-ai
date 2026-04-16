// Quick Note AI 분석 — 비구조화 텍스트 → 구조화 + 메타데이터

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ANALYZE_QUICK_SYSTEM_PROMPT, buildQuickUserMessage } from '@/lib/prompts/analyze-quick';
import { fetchExistingTopicTags } from '@/lib/existingTags';

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawContent } = body;

    if (!rawContent?.trim()) {
      return NextResponse.json(
        { success: false, error: 'rawContent is required' },
        { status: 400 }
      );
    }

    const existingTopicTags = await fetchExistingTopicTags();
    const userMessage = buildQuickUserMessage(rawContent, existingTopicTags);

    const message = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      temperature: 0,
      system: ANALYZE_QUICK_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
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

    return NextResponse.json({
      success: true,
      data: {
        suggestedType: parsed.suggestedType ?? 'learning',
        problem: parsed.problem ?? null,
        solution: parsed.solution ?? null,
        understanding: parsed.understanding ?? null,
        whatIBuilt: parsed.whatIBuilt ?? null,
        learnings: parsed.learnings ?? null,
        skillTags: parsed.skillTags ?? [],
        topicTags: parsed.topicTags ?? [],
        category: parsed.category ?? '',
      },
    });
  } catch (err: unknown) {
    console.error('Quick note AI analysis failed:', err);
    const message = err instanceof Error ? err.message : 'AI analysis error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
