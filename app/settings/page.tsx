'use client';

// Settings 페이지 — Profile + AI Chat Tone + Language + Default Project

import { useState, useEffect } from 'react';
import { MessageCircle, BookOpen, Code, Check } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import type { Project } from '@/lib/types';

type ChatTone = 'conversational' | 'textbook' | 'code-first';
type ResponseLang = 'ko' | 'en';

const TONE_OPTIONS: { key: ChatTone; icon: typeof MessageCircle; label: string; desc: string }[] = [
  { key: 'conversational', icon: MessageCircle, label: 'Conversational', desc: 'Explains with analogies, examples, and why it matters.' },
  { key: 'textbook', icon: BookOpen, label: 'Textbook', desc: 'Definition → example → summary. Clear and systematic.' },
  { key: 'code-first', icon: Code, label: 'Code-first', desc: 'Shows code first, explains briefly after. Minimal text.' },
];

const SettingsPage = () => {
  const [nickname, setNickname] = useState('');
  const [chatTone, setChatTone] = useState<ChatTone>('conversational');
  const [responseLanguage, setResponseLanguage] = useState<ResponseLang>('ko');
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, projectsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/projects'),
        ]);

        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          const s = settingsData.data;
          setNickname(s.nickname || '');
          setChatTone(s.chatTone);
          setResponseLanguage(s.responseLanguage);
          setDefaultProjectId(s.defaultProjectId);
        }

        const projectsData = await projectsRes.json();
        if (projectsData.success) setProjects(projectsData.data);
      } catch (err) {
        console.error('Settings fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim() || null,
          chatTone,
          responseLanguage,
          defaultProjectId,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Settings save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center" style={{ background: '#0b1120', color: '#475569' }}>
        Loading...
      </main>
    );
  }

  return (
    <main className="flex-1 h-screen overflow-y-auto" style={{ background: '#0b1120' }}>
      <div className="max-w-[580px] mx-auto px-8 py-8">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] mb-8" style={{ color: '#F8FAFC' }}>
          Settings
        </h1>

        {/* Profile */}
        <SettingsSection title="Profile">
          <label className="text-[12px] uppercase tracking-[0.05em] block mb-2" style={{ color: '#94A3B8' }}>
            Name / Nickname
          </label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your name or nickname"
            className="w-full outline-none text-[14px]"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: 10,
              padding: '12px 14px',
              color: '#F1F5F9',
              fontFamily: 'inherit',
            }}
          />
        </SettingsSection>

        {/* AI Chat */}
        <SettingsSection title="AI Chat">
          {/* Tone Selector */}
          <label className="text-[12px] uppercase tracking-[0.05em] block mb-3" style={{ color: '#94A3B8' }}>
            Explanation Style
          </label>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {TONE_OPTIONS.map((opt) => {
              const selected = chatTone === opt.key;
              const IconComp = opt.icon;
              return (
                <button
                  key={opt.key}
                  onClick={() => setChatTone(opt.key)}
                  className="flex flex-col items-center text-center rounded-xl p-4 cursor-pointer border-none"
                  style={{
                    background: selected ? 'rgba(99,102,241,0.1)' : 'rgba(39,39,42,0.4)',
                    border: selected ? '1.5px solid rgba(99,102,241,0.5)' : '1.5px solid rgba(63,63,70,0.5)',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <IconComp style={{ width: 20, height: 20, color: selected ? '#A5B4FC' : '#71717A', marginBottom: 8 }} />
                  <span className="text-[13px] font-medium mb-1" style={{ color: selected ? '#F1F5F9' : '#A1A1AA' }}>
                    {opt.label}
                  </span>
                  <span className="text-[11px] leading-[1.4]" style={{ color: '#71717A' }}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Language */}
          <label className="text-[12px] uppercase tracking-[0.05em] block mb-2" style={{ color: '#94A3B8' }}>
            Response Language
          </label>
          <select
            value={responseLanguage}
            onChange={(e) => setResponseLanguage(e.target.value as ResponseLang)}
            className="outline-none text-[14px] cursor-pointer"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#F1F5F9',
              fontFamily: 'inherit',
              width: '100%',
            }}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </SettingsSection>

        {/* Notes */}
        <SettingsSection title="Notes">
          <label className="text-[12px] uppercase tracking-[0.05em] block mb-2" style={{ color: '#94A3B8' }}>
            Default Project
          </label>
          <select
            value={defaultProjectId || ''}
            onChange={(e) => setDefaultProjectId(e.target.value || null)}
            className="outline-none text-[14px] cursor-pointer"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#F1F5F9',
              fontFamily: 'inherit',
              width: '100%',
            }}
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </SettingsSection>

        {/* Save */}
        <div className="mt-8 flex justify-end">
          <GlassButton
            size="default"
            contentClassName="flex items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : saving ? (
              'Saving...'
            ) : (
              'Save Changes'
            )}
          </GlassButton>
        </div>
      </div>
    </main>
  );
};

// 섹션 래퍼
const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div
    className="rounded-xl p-5 mb-5"
    style={{
      background: 'rgba(39,39,42,0.4)',
      border: '1px solid rgba(63,63,70,0.5)',
    }}
  >
    <div className="text-[13px] font-semibold uppercase tracking-[0.06em] mb-4" style={{ color: '#D4D4D8' }}>
      {title}
    </div>
    {children}
  </div>
);

export default SettingsPage;
