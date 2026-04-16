// AI 자동 태그 생성 프롬프트 — 2레이어 태그 (Skill Tags + Topic Tags)
// 시스템 프롬프트 + 노트 타입별 유저 메시지 빌더

export const ANALYZE_SYSTEM_PROMPT = `You are an AI that analyzes developer learning notes and generates structured metadata.

## Rules
1. ALWAYS respond in English, regardless of the input language.
2. Skill Tags: select ONLY from the canonical list below. If the note content does not clearly relate to any skill in the list, return an empty array. Do NOT force a match.
3. Topic Tags: generate 3~5 specific, searchable keywords in kebab-case that describe what this note is concretely about.
   - If a list of "Existing Topic Tags" is provided in the user message, PREFER reusing tags from that list when they match the note's concept.
   - Match semantically, not just by exact string (e.g., if existing list has "og-tag", reuse it instead of creating "open-graph-tag").
   - Only create a new tag if no existing tag fits the concept well.
   - Always use kebab-case for new tags (e.g., "react-hooks", not "React Hooks" or "react_hooks").
4. Category: use format "Domain > Area > Specific" (e.g., "Frontend > Web Standards > Open Graph").

## Canonical Skill Tag List (for skillTags field ONLY)

Tier 1 — Core AI Engineering:
- LLM API integration
- Prompt engineering
- Structured outputs
- Function calling
- RAG pipeline
- Embeddings
- Vector database
- Python
- SQL

Tier 2 — Differentiators:
- Agent / multi-agent
- MCP
- Fine-tuning
- Evaluation
- MLOps

Foundation:
- WebSocket / real-time
- Docker
- Cloud deployment
- Git

## Response Format (JSON only, no markdown fences, no extra text)
{
  "skillTags": ["only from canonical list above, or empty array"],
  "topicTags": ["free-form", "specific", "keywords"],
  "category": "Domain > Area > Specific"
}`;

// 노트 데이터를 받아 유저 메시지 문자열로 변환
type AnalyzeInput = {
  noteType: 'debug' | 'learning' | 'quick';
  rawContent?: string;
  problem?: string;
  solution?: string;
  understanding?: string;
  whatIBuilt?: string;
  learnings?: string[];
  source?: string;
  codeSnippet?: string;
};

// 기존 topic_tags 목록을 프롬프트 상단에 주입하는 헬퍼
const buildExistingTagsBlock = (existingTags?: string[]): string => {
  if (!existingTags || existingTags.length === 0) return '';
  // 너무 많으면 토큰 낭비 → 최대 80개로 제한
  const capped = existingTags.slice(0, 80);
  return `Existing Topic Tags (reuse when possible):\n${capped.join(', ')}\n\n`;
};

export const buildUserMessage = (input: AnalyzeInput, existingTopicTags?: string[]): string => {
  const tagBlock = buildExistingTagsBlock(existingTopicTags);

  // Quick 노트: rawContent 원문을 그대로 전달
  if (input.noteType === 'quick') {
    return tagBlock + [
      'Note Type: Quick',
      `Content: ${input.rawContent ?? input.problem ?? ''}`,
      input.codeSnippet ? `Code:\n${input.codeSnippet}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (input.noteType === 'debug') {
    return tagBlock + [
      'Note Type: Debug',
      `Problem: ${input.problem}`,
      `Solution: ${input.solution}`,
      `Understanding: ${input.understanding}`,
      input.codeSnippet ? `Code:\n${input.codeSnippet}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return tagBlock + [
    'Note Type: Learning',
    `What I Built: ${input.whatIBuilt}`,
    `What I Learned:\n${(input.learnings ?? []).map((l, i) => `${i + 1}. ${l}`).join('\n')}`,
    `Source: ${input.source || 'N/A'}`,
    input.codeSnippet ? `Code:\n${input.codeSnippet}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};
