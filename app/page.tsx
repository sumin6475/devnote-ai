'use client';

// 홈 화면 — Bolt 스타일: indigo glow + gradient title + premium input

import { useState, useEffect } from 'react';
import QuickInput from '@/components/QuickInput';
import RecentNotes from '@/components/RecentNotes';
import type { Note, Project } from '@/lib/types';

const HomePage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, projectsRes] = await Promise.all([
          fetch('/api/notes'),
          fetch('/api/projects'),
        ]);

        const notesData = await notesRes.json();
        if (notesData.success) setNotes(notesData.data);

        const projectsData = await projectsRes.json();
        if (projectsData.success) setProjects(projectsData.data);
      } catch (err) {
        console.error('fetch 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickSave = async (rawContent: string, projectId: string | null) => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noteType: 'quick',
        rawContent,
        projectId,
        skillTags: [],
        topicTags: [],
        category: '',
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const newNote: Note = data.data;
    setNotes((prev) => [newNote, ...prev]);

    // 비동기 AI 분석
    try {
      const aiRes = await fetch('/api/ai/analyze-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent }),
      });
      const aiData = await aiRes.json();
      if (!aiData.success) throw new Error(aiData.error);

      const updateRes = await fetch(`/api/notes/${newNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: aiData.data.problem,
          solution: aiData.data.solution,
          understanding: aiData.data.understanding,
          whatIBuilt: aiData.data.whatIBuilt,
          learnings: aiData.data.learnings,
          skillTags: aiData.data.skillTags,
          topicTags: aiData.data.topicTags,
          category: aiData.data.category,
        }),
      });
      const updateData = await updateRes.json();
      if (updateData.success) {
        setNotes((prev) => prev.map((n) => (n.id === newNote.id ? updateData.data : n)));
      }
    } catch (err) {
      console.error('Quick Note AI 분석 실패:', err);
    }
  };

  const handleCreateProject = async (name: string): Promise<Project> => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setProjects((prev) => [data.data, ...prev]);
    return data.data;
  };

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center overflow-y-auto relative"
      style={{ background: '#0f0f12' }}
    >
      {/* Indigo glow 배경 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 30%, transparent 60%)',
        }}
      />

      {loading ? (
        <div style={{ color: '#475569' }}>Loading...</div>
      ) : (
        <div className="relative z-10 flex flex-col items-center w-full max-w-[600px] px-6">
          {/* 타이틀 */}
          <h1
            className="text-[28px] font-bold tracking-[-0.02em] mb-2 text-center"
            style={{ color: '#F8FAFC' }}
          >
            What did you{' '}
            <span
              className="italic"
              style={{
                background: 'linear-gradient(180deg, #818CF8, #A5B4FC)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              learn
            </span>
            {' '}today?
          </h1>
          <p className="text-[14px] mb-8" style={{ color: '#64748B' }}>
            Capture it before it fades
          </p>

          {/* Quick Input */}
          <QuickInput
            projects={projects}
            onSave={handleQuickSave}
            onCreateProject={handleCreateProject}
          />

          {/* Recent Notes */}
          <RecentNotes notes={notes} projects={projects} />
        </div>
      )}
    </main>
  );
};

export default HomePage;
