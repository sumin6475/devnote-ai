'use client';

// CodeMirror 6 기반 코드 에디터 — 실시간 구문 하이라이트 + 라인 넘버 + Prettier 포맷

import { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView, keymap, placeholder as cmPlaceholder, lineNumbers } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap } from '@codemirror/search';
import { bracketMatching, indentOnInput, foldGutter } from '@codemirror/language';
import { devnoteTheme } from './codemirror-theme';
import {
  type SupportedLanguage,
  LANGUAGE_OPTIONS,
  getLanguageExtension,
  detectLanguage,
} from './language-selector';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  placeholder?: string;
  showFormatButton?: boolean;
  showLanguageSelector?: boolean;
  showLineNumbers?: boolean;
}

const CodeEditor = ({
  value,
  onChange,
  language,
  onLanguageChange,
  readOnly = false,
  minHeight = '160px',
  maxHeight,
  placeholder = 'Paste your code here...',
  showFormatButton = true,
  showLanguageSelector = true,
  showLineNumbers = true,
}: CodeEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const langCompartment = useRef(new Compartment());
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(language ?? 'javascript');
  const [formatting, setFormatting] = useState(false);
  // 내부 업데이트 중 onChange 재진입 방지
  const isInternalUpdate = useRef(false);

  // 언어 자동 감지 (초기값 + 언어 prop 없을 때)
  useEffect(() => {
    if (!language && value.trim()) {
      const detected = detectLanguage(value);
      setCurrentLang(detected);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // language prop 변경 시 동기화
  useEffect(() => {
    if (language) setCurrentLang(language);
  }, [language]);

  // EditorView 생성 (마운트 시 1회)
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isInternalUpdate.current) {
        onChange(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        ...(showLineNumbers ? [lineNumbers()] : []),
        history(),
        foldGutter(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        devnoteTheme,
        langCompartment.current.of(getLanguageExtension(currentLang)),
        updateListener,
        cmPlaceholder(placeholder),
        EditorView.lineWrapping,
        EditorState.readOnly.of(readOnly),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...closeBracketsKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 외부 value 변경 시 에디터에 동기화
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      isInternalUpdate.current = true;
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
      isInternalUpdate.current = false;
    }
  }, [value]);

  // 언어 변경 시 extension 교체
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: langCompartment.current.reconfigure(getLanguageExtension(currentLang)),
    });
  }, [currentLang]);

  // 언어 변경 핸들러
  const handleLangChange = useCallback(
    (lang: SupportedLanguage) => {
      setCurrentLang(lang);
      onLanguageChange?.(lang);
    },
    [onLanguageChange]
  );

  // Prettier 포맷 (dynamic import로 필요 시에만 로딩)
  const handleFormat = useCallback(async () => {
    if (formatting || readOnly || !value.trim()) return;
    // Python은 Prettier 미지원
    if (currentLang === 'python') return;

    setFormatting(true);
    try {
      const prettier = await import('prettier/standalone');
      const babel = await import('prettier/plugins/babel');
      const estree = await import('prettier/plugins/estree');

      // 언어별 parser + plugin 매핑
      let parser = 'babel';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plugins: any[] = [estree, babel];

      if (currentLang === 'typescript') {
        const tsPlugin = await import('prettier/plugins/typescript');
        parser = 'typescript';
        plugins.push(tsPlugin);
      } else if (currentLang === 'html') {
        const htmlPlugin = await import('prettier/plugins/html');
        parser = 'html';
        plugins.push(htmlPlugin);
      } else if (currentLang === 'css') {
        const cssPlugin = await import('prettier/plugins/postcss');
        parser = 'css';
        plugins.push(cssPlugin);
      } else if (currentLang === 'json') {
        parser = 'json';
      }

      const formatted = await prettier.format(value, {
        parser,
        plugins,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        printWidth: 80,
      });

      onChange(formatted.trimEnd());
    } catch {
      // 구문 에러 등 → 조용히 무시
    } finally {
      setFormatting(false);
    }
  }, [value, currentLang, formatting, readOnly, onChange]);

  const canFormat = !readOnly && currentLang !== 'python' && value.trim().length > 0;

  return (
    <div
      className="rounded-[10px] overflow-hidden"
      style={{
        background: '#0F172A',
        border: '1px solid rgba(148, 163, 184, 0.12)',
      }}
    >
      {/* 상단 바: 언어 선택 + 포맷 버튼 */}
      {(showLanguageSelector || showFormatButton) && (
        <div
          className="flex items-center justify-between px-3 py-[6px]"
          style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}
        >
          {/* 언어 선택 */}
          {showLanguageSelector ? (
            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value as SupportedLanguage)}
              disabled={readOnly}
              className="text-[12px] rounded-[6px] outline-none cursor-pointer"
              style={{
                background: 'transparent',
                color: '#94A3B8',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                padding: '3px 8px',
                fontFamily: 'inherit',
              }}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: '#1E293B' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <div />
          )}

          {/* 포맷 버튼 */}
          {showFormatButton && canFormat && (
            <button
              onClick={handleFormat}
              disabled={formatting}
              className="flex items-center gap-[4px] text-[12px] rounded-[6px] cursor-pointer border-none hover:opacity-80"
              style={{
                background: 'transparent',
                color: '#94A3B8',
                padding: '3px 8px',
                fontFamily: 'inherit',
                transition: 'opacity 0.15s',
              }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{'{ }'}</span>
              {formatting ? 'Formatting...' : 'Format'}
            </button>
          )}
        </div>
      )}

      {/* CodeMirror 마운트 포인트 */}
      <div ref={containerRef} className="overflow-auto" style={{ minHeight, maxHeight: maxHeight ?? undefined }} />
    </div>
  );
};

export default CodeEditor;
