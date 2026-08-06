// src/components/teams/TeamPlanning.jsx
import React, { useState, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';

import { getTeamMembers, getTaches, createTache, updateTache, getCalendrierTasks, getDeadlines, deleteTache, getAssignees, removeTeamMember } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';
import { useAvatarUrl } from '../../hooks/useAvatarUrl';
import EditTaskModal from './EditTaskModal';
import { useTaskWebSocket } from '../../hooks/useTaskWebSocket';
import InviteMemberModal from './InviteMemberModal';
import AssigneesModal from './AssigneesModal';

import todoIcon from '../../assets/icons/todo.png';
import unknownPersonIcon from '../../assets/icons/unknownPerson.png';
import addIcon from '../../assets/icons/add.png';
import workingIcon from '../../assets/icons/gears.png';
import completedIcon from '../../assets/icons/check-mark.png'


function AssigneeAvatar({ assignee, size = 'sm', style }) {
  const { avatarUrl } = useAvatarUrl(assignee.cip);
  return (
    <Avatar
      initials={assignee.initials}
      gradient={assignee.gradient}
      size={size}
      src={avatarUrl}
      alt={assignee.initials}
      style={style}
    />
  );
}

function MemberAvatar({ member, size = 'sm', status, dotSize }) {
  const { avatarUrl } = useAvatarUrl(member.id || member.cip);
  return (
    <Avatar
      initials={member.initials}
      gradient={member.gradient}
      size={size}
      status={status}
      dotSize={dotSize}
      src={avatarUrl}
      alt={member.name || member.initials}
    />
  );
}

export default function TeamPlanning({ team, showPlanningInfo }) {
  const { user, token } = useAuth();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [creating, setCreating] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [todayDeadlines, setTodayDeadlines] = useState([]);
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [assigningTask, setAssigningTask] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeError, setRemoveError] = useState('');

  const isCurrentUserAdmin = user?.cip === team?.administrateurCip || members.some(m => m.id === user?.cip && m.status === 'Admin');

  async function handleRemoveMember(memberCip) {
    setRemoveError('');
    try {
      await removeTeamMember(team.equipeId, memberCip);
      if (memberCip === user?.cip) {
        window.dispatchEvent(new CustomEvent('team-left', { detail: { equipeId: team.equipeId } }));
      } else {
        await fetchMembers();
      }
    } catch (err) {
      console.error('Failed to remove team member:', err);
      setRemoveError(err.response?.data || err.message || 'Failed to remove member');
    } finally {
      setMemberToRemove(null);
    }
  }

  // Map task status to column state
  const getTaskStatus = (t) => {
    const raw = (t.status || '').trim().toLowerCase();
    const normalized = raw.replace(/\s+/g, '_');
    if (normalized === 'termine' || normalized === 'done') return 'done';
    if (normalized === 'en_cours' || normalized === 'doing') return 'doing';
    return 'todo';
  };

  const fetchMembers = async () => {
    if (!team?.equipeId) return;
    try {
      const data = await getTeamMembers(team.equipeId);
      const transformed = (data || []).map(m => {
        const name = [m.prenom, m.nom].filter(Boolean).join(' ') || m.pseudo || 'Unknown';
        return {
          id: m.cip,
          name,
          initials: m.pseudo?.substring(0, 2).toUpperCase() || '?',
          role: m.role || 'Member',
          gradient: gradientForCip(m.cip),
          status: m.status, // "Admin" or other status values from backend
        };
      });
      setMembers(transformed);
    } catch (err) {
      console.error('Failed to load team members:', err);
    }
  };

  const fetchTasks = async () => {
    if (!team?.equipeId) return;
    try {
      const data = await getTaches(team.equipeId);

      const tasksWithAssignees = await Promise.all((data || []).map(async t => {
        let assigneeCips = [];
        try {
          assigneeCips = await getAssignees(t.id);
        } catch (e) {
          console.error(`Failed to fetch assignees for task ${t.id}`, e);
        }

        const assignees = assigneeCips.map(cip => ({
          cip,
          initials: initialsFromUser({ cip, pseudo: cip }),
          gradient: gradientForCip(cip),
        }));

        return {
          id: t.id,
          text: t.nomTache,
          status: getTaskStatus(t),
          assignees,
          originalStatus: t.status,
        };
      }));

      setTasks(tasksWithAssignees);

      const dData = await getDeadlines(team.equipeId);
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const deadlines = (dData || [])
        .filter(t => {
          const fin = new Date(t.dateFin);
          const finStr = `${fin.getFullYear()}-${String(fin.getMonth() + 1).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}`;
          return finStr === todayStr;
        })
        .map(t => ({
          id: t.id,
          nomTache: t.nomTache,
          status: getTaskStatus(t),
          dateFin: new Date(t.dateFin),
        }));
      setTodayDeadlines(deadlines);
    } catch (err) {
      console.error('Failed to fetch tasks/deadlines:', err);
    }
  };

  useEffect(() => {
    if (!team?.equipeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      fetchMembers(),
      fetchTasks(),
    ]).finally(() => setLoading(false));
  }, [team?.equipeId]);

  useEffect(() => {
    const handleMembersChanged = (e) => {
      if (team?.equipeId && e.detail?.equipeId === team.equipeId) {
        fetchMembers();
      }
    };
    window.addEventListener('team-members-changed', handleMembersChanged);
    return () => window.removeEventListener('team-members-changed', handleMembersChanged);
  }, [team?.equipeId]);

    useTaskWebSocket(team?.equipeId, token, fetchTasks);

  async function handleCreateTask() {
    if (!newTaskName.trim() || !team?.equipeId || !user?.cip) return;
    setCreating(true);
    try {
      await createTache({
        nomTache: newTaskName.trim(),
        equipeId: team.equipeId,
        cip: user.cip,
        status: 'todo',
      });
      setNewTaskName('');
      setShowTaskForm(false);
      await fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setCreating(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateTask(); }
    if (e.key === 'Escape') { setShowTaskForm(false); setNewTaskName(''); }
  }

  function handleDragStart(task) {
    setDraggedTask(task);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  async function handleDrop(targetStatus) {
    if (!draggedTask || draggedTask.status === targetStatus) {
      setDraggedTask(null);
      return;
    }

    // Update task status locally first
    setTasks(prev => prev.map(t =>
      t.id === draggedTask.id ? { ...t, status: targetStatus } : t
    ));

    // Update status mapping for API
    const statusMap = {
      'todo': 'todo',
      'doing': 'en_cours',
      'done': 'termine',
    };

    try {
      await updateTache(draggedTask.id, { status: statusMap[targetStatus] });
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Revert on error
      setTasks(prev => prev.map(t =>
        t.id === draggedTask.id ? draggedTask : t
      ));
    }

    setDraggedTask(null);
  }

  async function handleDeleteTask(taskId) {
    try {
      await deleteTache(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setTodayDeadlines(prev => prev.filter(d => d.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setDeleteConfirmTaskId(null);
    }
  }

  const columns = {
    todo: tasks.filter(t => t.status === 'todo'),
    doing: tasks.filter(t => t.status === 'doing'),
    done: tasks.filter(t => t.status === 'done'),
  };

  return (
    <div className={`planning-layout ${showPlanningInfo ? 'info-open' : ''}`}>
      {/* ── Main scrollable area ── */}
      <div className="planning-main">

        {/* Kanban Board */}
        <section aria-labelledby="kanban-heading">
          <div className="plan-section-header">
            <div className="plan-section-title" id="kanban-heading">Board</div>
          </div>
          <div className="kanban-board">
            {/* Todo Column */}
            <div
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('todo')}
            >
              <div className="kanban-column-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src={todoIcon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                      Todo
                  </h3>
                <span className="kanban-count">{columns.todo.length}</span>
              </div>
              <div className="kanban-tasks">
                {columns.todo.map(task => (
                  <div
                    key={task.id}
                    className="kanban-card"
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => setEditingTaskId(task.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <button
                      className="kanban-delete-btn"
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmTaskId(task.id); }}
                      aria-label="Delete task"
                      title="Delete task"
                    >
                      ×
                    </button>
                    <span className="kanban-task-text">{task.text}</span>
                    <div className="kanban-task-meta" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                      <div
                        className="attendee-stack"
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigningTask({ id: task.id, text: task.text });
                        }}
                      >
                        {task.assignees && task.assignees.length > 0 ? (
                          task.assignees.map((assignee, idx) => (
                            <AssigneeAvatar
                              key={assignee.cip}
                              assignee={assignee}
                              size="sm"
                              style={{
                                marginLeft: idx > 0 ? '-8px' : '0',
                                border: '2px solid var(--bg-primary)',
                                zIndex: 10 - idx
                              }}
                            />
                          ))
                        ) : (
                          <div
                            className="avatar avatar-sm"
                            style={{
                              background: 'var(--bg-secondary)',
                              border: '1.5px dashed var(--border)',
                              color: 'var(--text-tertiary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 'normal'
                            }}
                            title="Aucun assigné"
                          >
                            <img src={unknownPersonIcon} alt="Inconnu" style={{ width: '20px', height: '20px', objectFit: 'contain' }}/>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {showTaskForm && (
                  <form className="kanban-task-form" onSubmit={e => { e.preventDefault(); handleCreateTask(); }}>
                    <input
                      className="kanban-task-input"
                      type="text"
                      placeholder="Task name..."
                      value={newTaskName}
                      onChange={e => setNewTaskName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      aria-label="New task name"
                    />
                    <div className="kanban-task-actions">
                      <button
                        type="submit"
                        className="kanban-task-btn"
                        disabled={!newTaskName.trim() || creating}
                      >
                        {creating ? 'Creating...' : 'Create'}
                      </button>
                      <button
                        type="button"
                        className="kanban-task-cancel"
                        onClick={() => { setShowTaskForm(false); setNewTaskName(''); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                {!showTaskForm && (
                  <button
                    className="kanban-add-btn"
                    onClick={() => setShowTaskForm(true)}
                    aria-label="Create new task"
                  >
                      <img src={addIcon} alt="Add" style={{ width: '10px', height: '10px', objectFit: 'contain' }}/>
                      New task
                  </button>
                )}
              </div>
            </div>

            {/* Doing Column */}
            <div
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('doing')}
            >
              <div className="kanban-column-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src={workingIcon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                    Doing</h3>
                <span className="kanban-count">{columns.doing.length}</span>
              </div>
              <div className="kanban-tasks">
                {columns.doing.map(task => (
                  <div
                    key={task.id}
                    className="kanban-card"
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => setEditingTaskId(task.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <button
                      className="kanban-delete-btn"
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmTaskId(task.id); }}
                      aria-label="Delete task"
                      title="Delete task"
                    >
                      ×
                    </button>
                    <span className="kanban-task-text">{task.text}</span>
                    <div className="kanban-task-meta" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
<div
                        className="attendee-stack"
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigningTask({ id: task.id, text: task.text });
                        }}
                      >
                        {task.assignees && task.assignees.length > 0 ? (
                          task.assignees.map((assignee, idx) => (
                            <AssigneeAvatar
                              key={assignee.cip}
                              assignee={assignee}
                              size="sm"
                              style={{
                                marginLeft: idx > 0 ? '-8px' : '0',
                                border: '2px solid var(--bg-primary)',
                                zIndex: 10 - idx
                              }}
                            />
                          ))
                        ) : (
                          <div
                            className="avatar avatar-sm"
                            style={{
                              background: 'var(--bg-secondary)',
                              border: '1.5px dashed var(--border)',
                              color: 'var(--text-tertiary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 'normal'
                            }}
                            title="Aucun assigné"
                          >
                                <img src={unknownPersonIcon} alt="Inconnu" style={{ width: '20px', height: '20px', objectFit: 'contain' }}/>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Done Column */}
            <div
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('done')}
            >
              <div className="kanban-column-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src={completedIcon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }}/>
                    Done</h3>
                <span className="kanban-count">{columns.done.length}</span>
              </div>
              <div className="kanban-tasks">
                {columns.done.map(task => (
                  <div
                    key={task.id}
                    className="kanban-card done"
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => setEditingTaskId(task.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <button
                      className="kanban-delete-btn"
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmTaskId(task.id); }}
                      aria-label="Delete task"
                      title="Delete task"
                    >
                      ×
                    </button>
                    <span className="kanban-task-text">{task.text}</span>
                    <div className="kanban-task-meta" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                      <div
                        className="attendee-stack"
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigningTask({ id: task.id, text: task.text });
                        }}
                      >
                        {task.assignees && task.assignees.length > 0 ? (
                          task.assignees.map((assignee, idx) => (
                            <AssigneeAvatar
                              key={assignee.cip}
                              assignee={assignee}
                              size="sm"
                              style={{
                                marginLeft: idx > 0 ? '-8px' : '0',
                                border: '2px solid var(--bg-primary)',
                                zIndex: 10 - idx
                              }}
                            />
                          ))
                        ) : (
                          <div
                            className="avatar avatar-sm"
                            style={{
                              background: 'var(--bg-secondary)',
                              border: '1.5px dashed var(--border)',
                              color: 'var(--text-tertiary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 'normal'
                            }}
                            title="Aucun assigné"
                          >
                              <img src={unknownPersonIcon} alt="Inconnu" style={{ width: '20px', height: '20px', objectFit: 'contain' }}/>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Today's Deadlines */}
        <section aria-labelledby="deadlines-heading">
          <div className="plan-section-header">
            <div className="plan-section-title" id="deadlines-heading">Today's Deadlines</div>
          </div>
          {todayDeadlines.length === 0 ? (
            <div className="deadlines-empty">None</div>
          ) : (
            <ul className="deadline-list" aria-label="Today's deadlines">
              {todayDeadlines.map(d => (
                <li
                  key={d.id}
                  className="deadline-item"
                >
                  <span className="deadline-item-name">{d.nomTache}</span>
                  <span className="deadline-item-status">
                    {d.status || 'todo'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Mini Calendar */}
        <section aria-labelledby="calendar-heading">
          <div className="plan-section-header">
            <div className="plan-section-title" id="calendar-heading">Calendar</div>
          </div>
          <MiniCalendar equipeId={team.equipeId} />
        </section>
      </div>

      {/* ── Right sidebar ── */}
      <aside className="planning-sidebar" aria-label="Team info">
        {/* Team members */}
        <div>
          <div className="ps-section-title">Team Members</div>
          <button
            onClick={() => setShowInviteModal(true)}
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--blue-bg)';
              e.currentTarget.style.borderColor = 'var(--blue)';
              e.currentTarget.style.color = 'var(--blue)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
              <img src={addIcon} alt="Add" style={{ width: '10px', height: '10px', objectFit: 'contain' }}/>
              Inviter un membre
          </button>

          {loading ? (
            <div className="loading-spinner" style={{ margin: '10px 0' }} />
          ) : members.length === 0 ? (
            <div className="panel-section">No members</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Admins Category */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Admins ({members.filter(m => m.status === 'Admin').length})
                </div>
                {members.filter(m => m.status === 'Admin').map(m => (
                  <div key={m.id} className="member-row" style={{ marginBottom: '6px' }}>
                    <MemberAvatar member={m} size="sm" status={m.status === 'Admin' ? 'offline' : (m.status || 'offline')} dotSize="sm" />
                    <div className="member-info">
                      <div className="member-name">{m.name}</div>
                      <div className="member-role">Admin</div>
                    </div>
                    {(isCurrentUserAdmin || m.id === user?.cip) && (
                      <button
                        className="member-remove-btn"
                        onClick={(e) => { e.stopPropagation(); setMemberToRemove(m); }}
                        title={m.id === user?.cip ? "Leave team" : "Remove member"}
                        aria-label={m.id === user?.cip ? "Leave team" : "Remove member"}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                {members.filter(m => m.status === 'Admin').length === 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic', paddingLeft: '4px' }}>Aucun administrateur</div>
                )}
              </div>

              {/* Members Category */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  Membres ({members.filter(m => m.status !== 'Admin').length})
                </div>
                {members.filter(m => m.status !== 'Admin').map(m => (
                  <div key={m.id} className="member-row" style={{ marginBottom: '6px' }}>
                    <MemberAvatar member={m} size="sm" status={m.status === 'Admin' ? 'offline' : (m.status || 'offline')} dotSize="sm" />
                    <div className="member-info">
                      <div className="member-name">{m.name}</div>
                      <div className="member-role">{m.role}</div>
                    </div>
                    {(isCurrentUserAdmin || m.id === user?.cip) && (
                      <button
                        className="member-remove-btn"
                        onClick={(e) => { e.stopPropagation(); setMemberToRemove(m); }}
                        title={m.id === user?.cip ? "Leave team" : "Remove member"}
                        aria-label={m.id === user?.cip ? "Leave team" : "Remove member"}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                {members.filter(m => m.status !== 'Admin').length === 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic', paddingLeft: '4px' }}>Aucun membre</div>
                )}
              </div>
            </div>
          )}
        </div>



        <div className="ps-divider" />

        {/* Quick stats */}
         <div>
           <div className="ps-section-title">Quick Stats</div>
           <div className="stat-row">
             <span className="stat-label">To Do</span>
             <span className="stat-value">{columns.todo.length}</span>
           </div>
           <div className="stat-row">
             <span className="stat-label">In Progress</span>
             <span className="stat-value">{columns.doing.length}</span>
           </div>
           <div className="stat-row">
             <span className="stat-label">Completed</span>
             <span className="stat-value green">{columns.done.length}</span>
           </div>
           <div className="stat-row">
             <span className="stat-label">Total members</span>
             <span className="stat-value">{members.length}</span>
           </div>
         </div>
       </aside>

       {/* Delete task confirmation modal */}
       {deleteConfirmTaskId && (
         <div className="modal-overlay" onClick={() => setDeleteConfirmTaskId(null)}>
           <div className="modal" onClick={e => e.stopPropagation()}>
             <div className="modal-title">Delete task</div>
             <div className="modal-subtitle">Are you sure you want to delete this task? This action cannot be undone.</div>
             <div className="modal-actions">
               <button className="btn-cancel" onClick={() => setDeleteConfirmTaskId(null)}>Cancel</button>
               <button className="btn-primary" style={{ background: '#ef4444' }} onClick={() => handleDeleteTask(deleteConfirmTaskId)}>Delete</button>
             </div>
           </div>
         </div>
       )}

       {/* Remove member confirmation modal */}
       {memberToRemove && (
         <div className="modal-overlay" onClick={() => setMemberToRemove(null)}>
           <div className="modal" onClick={e => e.stopPropagation()}>
             <div className="modal-title">
               {memberToRemove.id === user?.cip ? "Leave team" : "Remove member"}
             </div>
             <div className="modal-subtitle">
               {memberToRemove.id === user?.cip
                 ? "Are you sure you want to leave the team?"
                 : `Are you sure you want to remove ${memberToRemove.name} from the team?`}
             </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => { setMemberToRemove(null); setRemoveError(''); }}>Cancel</button>
                <button className="btn-primary" style={{ background: '#ef4444' }} onClick={() => handleRemoveMember(memberToRemove.id)}>
                  {memberToRemove.id === user?.cip ? "Leave" : "Remove"}
                </button>
              </div>
              {removeError && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{removeError}</div>}
           </div>
         </div>
       )}

        {/* Edit task modal */}
        {editingTaskId && (
          <EditTaskModal
            taskId={editingTaskId}
            onClose={() => setEditingTaskId(null)}
            onUpdated={fetchTasks}
          />
        )}

        {/* Invite member modal */}
        {showInviteModal && (
          <InviteMemberModal
            equipeId={team.equipeId}
            existingMemberCips={members.map(m => m.id)}
            onClose={() => setShowInviteModal(false)}
            onAdded={fetchMembers}
          />
        )}

        {/* Assignees management modal */}
        {assigningTask && (
          <AssigneesModal
            taskId={assigningTask.id}
            taskName={assigningTask.text}
            teamMembers={members}
            onClose={() => setAssigningTask(null)}
            onUpdated={fetchTasks}
          />
        )}
      </div>
    );
  }

// ── MiniCalendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ equipeId }) {
  const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const [viewDate, setViewDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [tasks, setTasks] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!equipeId) {
      setLoading(false);
      setTasks([]);
      return;
    }

    setLoading(true);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const dateMin = new Date(year, month, 1);
    const dateMax = new Date(year, month + 1, 0);

    const minStr = formatDate(dateMin);
    const maxStr = formatDate(dateMax);

    getCalendrierTasks(equipeId, minStr, maxStr)
      .then(data => {
        const transformed = (data || []).map(t => ({
          id: t.id,
          nomTache: t.nomTache,
          dateDebut: new Date(t.dateDebut),
          dateFin: new Date(t.dateFin),
          status: t.status,
        }));
        setTasks(transformed);
      })
      .catch(err => console.error('Failed to load calendar tasks:', err))
      .finally(() => setLoading(false));
  }, [equipeId, viewDate]);

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthLabel = `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();

  // Generate calendar grid for the current month
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday=0 format: JS getDay() has Sun=0, we want Mon=0
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build grid: null = padding, number = day
  const grid = [];
  for (let i = 0; i < startOffset; i++) {
    grid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(d);
  }

  // Build a map: day -> list of tasks active on that day
  const tasksByDay = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d);
    dayDate.setHours(0, 0, 0, 0);
    const dayTasks = tasks.filter(t => {
      const debut = new Date(t.dateDebut);
      debut.setHours(0, 0, 0, 0);
      const fin = new Date(t.dateFin);
      fin.setHours(0, 0, 0, 0);
      return dayDate >= debut && dayDate <= fin;
    });
    if (dayTasks.length > 0) {
      tasksByDay[d] = dayTasks;
    }
  }

  function goToPrevMonth() {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function truncate(str, maxLen) {
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
  }

  return (
    <div className="mini-calendar">
      {loading && (
        <div className="cal-loading" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
          Loading...
        </div>
      )}
      {!loading && (
        <>
          <div className="cal-header">
            <button className="cal-nav" onClick={goToPrevMonth} aria-label="Previous month">‹</button>
            <div className="cal-month">{monthLabel}</div>
            <button className="cal-nav" onClick={goToNextMonth} aria-label="Next month">›</button>
          </div>
          <div className="cal-grid" role="grid" aria-label={monthLabel}>
            {DAY_NAMES.map(d => (
              <div key={d} className="cal-day-name" role="columnheader">{d}</div>
            ))}
            {grid.map((day, i) => {
              if (day === null) {
                return <div key={`pad-${i}`} className="cal-day other-month" aria-hidden="true" />;
              }
              const isToday = (year === today.getFullYear() && month === todayMonth && day === todayDay);
              const dayTasks = tasksByDay[day] || [];
              const hasTasks = dayTasks.length > 0;

              return (
                <div
                  key={day}
                  role="gridcell"
                  className={[
                    'cal-day',
                    'cal-day-cell',
                    isToday ? 'today' : '',
                    hasTasks ? 'has-tasks' : '',
                  ].join(' ')}
                  aria-label={`${day}${hasTasks ? `, ${dayTasks.length} tasks` : ''}${isToday ? ', today' : ''}`}
                  aria-current={isToday ? 'date' : undefined}
                  onMouseEnter={() => hasTasks && setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {hasTasks && hoveredDay === day && (
                    <div className="cal-tooltip">
                      {dayTasks.map(t => (
                        <div key={t.id} className="cal-tooltip-item">
                          <span className="cal-tooltip-dot" />
                          <span>{t.nomTache}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="cal-day-number">{day}</span>
                  {hasTasks && (
                    <div className="cal-task-list">
                      <div className="cal-task-item cal-task-first">
                        {truncate(dayTasks[0].nomTache, 12)}
                      </div>
                      {dayTasks.length > 1 && (
                        <div className="cal-task-more">
                          +{dayTasks.length - 1}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>


        </>
      )}
    </div>
  );
}
