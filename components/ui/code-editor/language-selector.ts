// 언어 선택 + 자동 감지 — CodeMirror 6 extension 반환

import type { Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';

export type SupportedLanguage = 'javascript' | 'typescript' | 'html' | 'css' | 'python' | 'json';

export const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'python', label: 'Python' },
  { value: 'json', label: 'JSON' },
];

// 언어 문자열 → CodeMirror extension
export function getLanguageExtension(lang: SupportedLanguage): Extension {
  switch (lang) {
    case 'javascript':
      return javascript({ jsx: true });
    case 'typescript':
      return javascript({ jsx: true, typescript: true });
    case 'html':
      return html();
    case 'css':
      return css();
    case 'python':
      return python();
    case 'json':
      return json();
    default:
      return javascript({ jsx: true });
  }
}

// 코드 내용 기반 언어 자동 감지
export function detectLanguage(code: string): SupportedLanguage {
  const trimmed = code.trim();
  if (!trimmed) return 'javascript';

  const firstLine = trimmed.split('\n')[0].trim();

  // HTML 감지
  if (firstLine.startsWith('<!DOCTYPE') || firstLine.startsWith('<html') || firstLine.startsWith('<div')) {
    return 'html';
  }

  // JSON 감지
  if ((firstLine.startsWith('{') || firstLine.startsWith('[')) && trimmed.endsWith('}') || trimmed.endsWith(']')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch { /* not json */ }
  }

  // Python 감지
  if (/^(def |class |import |from |if __name__|print\()/.test(firstLine)) {
    return 'python';
  }

  // CSS 감지
  if (/^[.#@][\w-]/.test(firstLine) && trimmed.includes('{') && trimmed.includes(':')) {
    return 'css';
  }

  // TypeScript 감지
  if (/\b(interface |type |enum |: string|: number|: boolean|<[A-Z]\w*>)/.test(trimmed)) {
    return 'typescript';
  }

  return 'javascript';
}
