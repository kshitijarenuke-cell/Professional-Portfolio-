import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, uploadFile } from '../../api/client';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate, onDelete }) => {
  const { triggerAdminAction, showToast } = useAuth();
  // MongoDB returns _id; fall back gracefully so we never hit /api/projects/undefined
  const projectId = (project as any)._id ?? project.id;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [technologies, setTechnologies] = useState<string[]>(project.technologies || []);
  const [techInput, setTechInput] = useState('');
  const [githubUrl, setGithubUrl] = useState(project.githubUrl || '');
  const [liveUrl, setLiveUrl] = useState(project.liveUrl || '');
  const [imageUrl, setImageUrl] = useState(project.imageUrl || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(project.imageUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = () => {
    triggerAdminAction(() => {
      setIsEditing(true);
    });
  };

  const handleDeleteClick = () => {
    triggerAdminAction(() => {
      setIsDeleting(true);
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTitle(project.title);
    setDescription(project.description);
    setTechnologies(project.technologies || []);
    setGithubUrl(project.githubUrl || '');
    setLiveUrl(project.liveUrl || '');
    setImageUrl(project.imageUrl || '');
    setImageFile(null);
    setImagePreview(project.imageUrl || '');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  const handleAddTag = () => {
    const tag = techInput.replace(',', '').trim();
    if (tag && !technologies.includes(tag)) {
      setTechnologies([...technologies, tag]);
      setTechInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTechnologies(technologies.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      showToast('✗ Title and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImg = imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadFile(imageFile);
        if (uploadedUrl) finalImg = uploadedUrl;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        technologies,
        githubUrl: githubUrl.trim(),
        liveUrl: liveUrl.trim(),
        imageUrl: finalImg,
      };

      const res = await api.put<{ success: boolean; data: Project }>(`/projects/${projectId}`, payload);
      if (res.data.success) {
        onUpdate(res.data.data);
        setIsEditing(false);
        showToast('✓ Project updated successfully');
      } else {
        showToast('✗ Update failed');
      }
    } catch (e) {
      console.error(e);
      showToast('✗ Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await api.delete<{ success: boolean }>(`/projects/${projectId}`);
      if (res.data.success) {
        onDelete(projectId);
        setIsDeleting(false);
        showToast('✓ Project deleted');
      } else {
        showToast('✗ Delete failed');
      }
    } catch (e) {
      showToast('✗ Failed to delete project');
    }
  };

  return (
    <div className={`sp-card ${isEditing ? 'editing' : ''}`} data-id={projectId}>
      {/* Single Project Image Area */}
      <div className="sp-card-img-wrap relative group/img">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '22px 22px 0 0', display: 'block' }}
          />
        ) : (
          <div className="sp-img-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span>No image uploaded</span>
          </div>
        )}

        {/* Image Action overlay in Edit mode */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity">
            <label className="px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 text-white text-xs font-semibold cursor-pointer border border-cyan-400/40 inline-flex items-center gap-1.5 shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Change Image
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
            </label>
            {imagePreview && (
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold cursor-pointer border border-red-400/40 inline-flex items-center gap-1.5 shadow-lg"
                onClick={handleRemoveImage}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Action Hover Buttons */}
      {!isEditing && (
        <div className="sp-card-actions">
          <button className="sp-action-btn edit-btn" type="button" title="Edit Project" onClick={handleEditClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="sp-action-btn del delete-btn" type="button" title="Delete Project" onClick={handleDeleteClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      )}

      {/* VIEW MODE Container */}
      {!isEditing && (
        <div className="sp-card-view-container">
          <div className="sp-card-body">
            <div className="sp-card-title">{project.title}</div>
            <div className="sp-card-desc">{project.description}</div>
            <div className="sp-chips">
              {project.technologies?.map((tech, i) => (
                <span key={i} className="sp-chip">
                  {tech}
                </span>
              ))}
            </div>
            <div className="sp-card-links">
              <a href={project.githubUrl || '#'} className="sp-link" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </a>
              <a href={project.liveUrl || '#'} className="sp-link" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Live Demo
              </a>
            </div>
          </div>

          {/* Delete confirmation overlay */}
          {isDeleting && (
            <div className="sp-delete-confirm visible">
              <div className="sp-dc-text">Are you sure you want to delete this project?</div>
              <div className="sp-dc-btns">
                <button type="button" className="sp-dc-no" onClick={() => setIsDeleting(false)}>
                  Cancel
                </button>
                <button type="button" className="sp-dc-yes" onClick={handleConfirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDIT MODE Form — expands directly below the top image inside the same card */}
      {isEditing && (
        <form className="sp-card-edit-container" style={{ display: 'block', opacity: 1, padding: '1rem 1.25rem 1.25rem' }} onSubmit={(e) => e.preventDefault()}>
          <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center justify-between">
            <span>✏️ Edit Project Details</span>
          </div>

          <div className="sp-field mb-3">
            <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Project Title</label>
            <input type="text" className="sp-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project Title" />
          </div>

          <div className="sp-field mb-3">
            <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Description</label>
            <textarea className="sp-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project description..." />
          </div>

          <div className="sp-field mb-3">
            <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Technologies</label>
            <div className="sp-tags-input-wrap card-edit-tags-wrap">
              {technologies.map((t, idx) => (
                <span key={idx} className="sp-tag-pill">
                  {t}{' '}
                  <button type="button" onClick={() => handleRemoveTag(t)}>
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="sp-tags-input"
                placeholder="Add tech, press Enter..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
            </div>
            <div className="sp-tags-hint">Press Enter or comma to add tech</div>
          </div>

          <div className="sp-field mb-3">
            <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">GitHub URL</label>
            <input type="text" className="sp-input" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
          </div>

          <div className="sp-field mb-4">
            <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Live Demo URL</label>
            <input type="text" className="sp-input" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="sp-edit-actions">
            <button type="button" className="sp-cancel-btn" onClick={handleCancelEdit}>
              Cancel
            </button>
            <button
              type="button"
              className={`sp-save-btn ${isSubmitting ? 'submitting' : ''}`}
              onClick={handleSave}
              disabled={isSubmitting}
            >
              <svg className="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
