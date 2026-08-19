import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import type { Project } from '../../types';
import { ProjectCard } from './ProjectCard';

export const Projects: React.FC = () => {
  const { isAdmin, triggerAdminAction, showToast } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  const fetchProjects = async () => {
    try {
      const res = await api.get<Project[]>('/projects');
      if (res.data) setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('[Projects fetch error]', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get<{ projectView?: 'grid' | 'list' }>('/admin/settings');
      if (res.data?.projectView) setViewLayout(res.data.projectView);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchSettings();
  }, []);

  const handleAddProject = () => {
    triggerAdminAction(async () => {
      try {
        const res = await api.post<{ success: boolean; data: Project }>('/projects', {
          title: 'New Project',
          description: 'Describe your project here.',
          technologies: ['React'],
          githubUrl: '#',
          liveUrl: '#',
        });
        if (res.data.success) {
          setProjects((prev) => [...prev, res.data.data]);
          showToast('✓ New project created');
        } else {
          showToast('✗ Failed to create project');
        }
      } catch (e) {
        showToast('✗ Failed to create project');
      }
    });
  };

  const handleChangeLayout = async (layout: 'grid' | 'list') => {
    setViewLayout(layout);
    if (isAdmin) {
      try {
        await api.put('/admin/settings', { projectView: layout });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <section id="projects">
      {/* Section Header */}
      <div className="sp-header">
        <div className="sp-eyebrow">MY WORK</div>
        <h2 className="sp-title">
          SELECTED <span>PROJECTS</span>
        </h2>
        <p className="sp-subtitle">
          A collection of projects I've designed and developed to solve real-world problems.
        </p>
      </div>

      {/* Admin Topbar (Add Project + Grid/List Toggle) */}
      <div className="sp-topbar admin-only" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
          <button className="sp-add-btn" type="button" onClick={handleAddProject}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Project
          </button>

          {/* View Mode Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="sp-action-btn"
              type="button"
              style={{
                borderRadius: 8,
                width: 34,
                height: 34,
                background: viewLayout === 'grid' ? 'rgba(139,92,246,0.15)' : 'transparent',
                borderColor: viewLayout === 'grid' ? 'rgba(139,92,246,0.4)' : 'transparent',
                color: viewLayout === 'grid' ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              }}
              title="Grid View"
              onClick={() => handleChangeLayout('grid')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>

            <button
              className="sp-action-btn"
              type="button"
              style={{
                borderRadius: 8,
                width: 34,
                height: 34,
                background: viewLayout === 'list' ? 'rgba(139,92,246,0.15)' : 'transparent',
                borderColor: viewLayout === 'list' ? 'rgba(139,92,246,0.4)' : 'transparent',
                color: viewLayout === 'list' ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              }}
              title="List View"
              onClick={() => handleChangeLayout('list')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <circle cx="3" cy="6" r="1" />
                <circle cx="3" cy="12" r="1" />
                <circle cx="3" cy="18" r="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="sp-layout-wrapper">
        <div className={`sp-grid ${viewLayout === 'list' ? 'list-layout' : ''}`}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={handleUpdateProject}
              onDelete={handleDeleteProject}
            />
          ))}
          {projects.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">No projects found in database</div>
          )}
        </div>
      </div>
    </section>
  );
};
