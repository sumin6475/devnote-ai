'use client';

// 홈 화면 — Quick Note 입력 + 최근 노트 카드

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

  // Quick Note 저장 → DB 저장 + 비동기 AI 분석
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
        relatedConcepts: [],
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
          relatedConcepts: aiData.data.relatedConcepts,
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

  // 프로젝트 생성
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
    <main className="flex-1 flex flex-col items-center justify-center overflow-y-auto" style={{ background: '#0b1120' }}>
      {loading ? (
        <div style={{ color: '#475569' }}>Loading...</div>
      ) : (
        <>
          <h1
            className="text-[20px] font-semibold tracking-[-0.02em] mb-8"
            style={{ color: '#F8FAFC' }}
          >
            What did you learn today?
          </h1>

          <QuickInput
            projects={projects}
            onSave={handleQuickSave}
            onCreateProject={handleCreateProject}
          />

          <RecentNotes notes={notes} projects={projects} />
        </>
      )}
    </main>
  );
};

export default HomePage;
