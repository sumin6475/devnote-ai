// DevNote 다크 테마 — CodeMirror 6용 (indigo 기반)

import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// 에디터 외관 테마
const editorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0F172A',
      color: '#E2E8F0',
      fontSize: '13px',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    },
    '.cm-content': {
      caretColor: '#818CF8',
      padding: '12px 0',
      lineHeight: '1.7',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#818CF8',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(99, 102, 241, 0.2) !important',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(99, 102, 241, 0.06)',
    },
    '.cm-gutters': {
      backgroundColor: '#0F172A',
      color: '#475569',
      border: 'none',
      borderRight: '1px solid rgba(148, 163, 184, 0.06)',
      fontSize: '12px',
      minWidth: '40px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(99, 102, 241, 0.06)',
      color: '#94A3B8',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      color: '#818CF8',
      border: 'none',
    },
    '.cm-tooltip': {
      backgroundColor: '#1E293B',
      border: '1px solid rgba(148, 163, 184, 0.12)',
      color: '#E2E8F0',
    },
    '.cm-panels': {
      backgroundColor: '#0F172A',
      color: '#E2E8F0',
    },
    '.cm-searchMatch': {
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      outline: '1px solid rgba(245, 158, 11, 0.4)',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: 'rgba(245, 158, 11, 0.35)',
    },
    // placeholder 스타일
    '.cm-placeholder': {
      color: '#475569',
      fontStyle: 'italic',
    },
  },
  { dark: true }
);

// 구문 하이라이트 색상
const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#C084FC' },
  { tag: tags.operator, color: '#94A3B8' },
  { tag: tags.special(tags.variableName), color: '#60A5FA' },
  { tag: tags.typeName, color: '#F472B6' },
  { tag: tags.atom, color: '#F59E0B' },
  { tag: tags.number, color: '#F59E0B' },
  { tag: tags.bool, color: '#F59E0B' },
  { tag: tags.definition(tags.variableName), color: '#60A5FA' },
  { tag: tags.string, color: '#34D399' },
  { tag: tags.special(tags.string), color: '#34D399' },
  { tag: tags.comment, color: '#64748B', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#E2E8F0' },
  { tag: tags.function(tags.variableName), color: '#60A5FA' },
  { tag: tags.className, color: '#F472B6' },
  { tag: tags.propertyName, color: '#93C5FD' },
  { tag: tags.tagName, color: '#F472B6' },
  { tag: tags.attributeName, color: '#C084FC' },
  { tag: tags.attributeValue, color: '#34D399' },
  { tag: tags.regexp, color: '#FB923C' },
  { tag: tags.escape, color: '#FB923C' },
  { tag: tags.meta, color: '#64748B' },
  { tag: tags.invalid, color: '#EF4444' },
  { tag: tags.punctuation, color: '#94A3B8' },
  { tag: tags.bracket, color: '#94A3B8' },
]);

// 테마 + 하이라이트 합쳐서 export
export const devnoteTheme = [editorTheme, syntaxHighlighting(highlightStyle)];
