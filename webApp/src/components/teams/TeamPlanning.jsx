// src/components/teams/TeamPlanning.jsx
import React, { useState, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { MEETINGS, TODAY_EVENTS } from '../../data/mockData';
import { getTeamMembers, getTaches, createTache, updateTache, getCalendrierTasks, getDeadlines, deleteTache } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';

/**
 * TeamPlanning  — Planning tab: Kanban board, meetings, calendar, right sidebar.
 *
 * Props:
 *   team  – team object with equipeId, nomEquipe, etc.
 */
export default function TeamPlanning({ team }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [creating, setCreating] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [todayDeadlines, setTodayDeadlines] = useState([]);
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState(null);

  // Map task status to column state
  const getTaskStatus = (t) => {
    const raw = (t.status || '').trim().toLowerCase();
    const normalized = raw.replace(/\s+/g, '_');
    if (normalized === 'termine' || normalized === 'done') return 'done';
    if (normalized === 'en_cours' || normalized === 'doing') return 'doing';
    return 'todo';
  };

  useEffect(() => {
    if (!team?.equipeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      getTeamMembers(team.equipeId)
        .then(data => {
          const transformed = (data || []).map(m => {
            const name = [m.prenom, m.nom].filter(Boolean).join(' ') || m.pseudo || 'Unknown';
            return {
              id: m.cip,
              name,
              initials: m.pseudo?.substring(0, 2).toUpperCase() || '?',
              role: m.role || 'Member',
              gradient: gradientForCip(m.cip),
              status: m.status || 'offline',
            };
          });
          setMembers(transformed);
        })
        .catch(err => console.error('Failed to load team members:', err)),
      getTaches(team.equipeId)
        .then(data => {
          const transformed = (data || []).map(t => ({
            id: t.id,
            text: t.nomTache,
            status: getTaskStatus(t),
            assignee: {
              initials: initialsFromUser({ cip: t.cip, pseudo: t.cip }),
              gradient: gradientForCip(t.cip),
            },
            priority: t.status === 'termine' ? 'done' :
                     t.status === 'urgent' ? 'high' :
                     t.status === 'important' ? 'med' : 'low',
            originalStatus: t.status,
          }));
          setTasks(transformed);
        })
        .catch(err => console.error('Failed to load tasks:', err)),
      getDeadlines(team.equipeId)
        .then(data => {
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const deadlines = (data || [])
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
        })
        .catch(err => console.error('Failed to load deadlines:', err)),
    ]).finally(() => setLoading(false));
  }, [team?.equipeId]);

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
      const data = await getTaches(team.equipeId);
      const transformed = (data || []).map(t => ({
        id: t.id,
        text: t.nomTache,
        status: getTaskStatus(t),
        assignee: {
          initials: initialsFromUser({ cip: t.cip, pseudo: t.cip }),
          gradient: gradientForCip(t.cip),
        },
        priority: t.status === 'termine' ? 'done' :
                 t.status === 'urgent' ? 'high' :
                 t.status === 'important' ? 'med' : 'low',
        originalStatus: t.status,
      }));
      setTasks(transformed);
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
    <div className="planning-layout">
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
                <h3>📝 Todo</h3>
                <span className="kanban-count">{columns.todo.length}</span>
              </div>
              <div className="kanban-tasks">
                {columns.todo.map(task => (
                  <div
                    key={task.id}
                    className="kanban-card"
                    draggable
                    onDragStart={() => handleDragStart(task)}
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
                    <div className="kanban-task-meta">
                      <Avatar
                        initials={task.assignee.initials}
                        gradient={task.assignee.gradient}
                        size="sm"
                      />
                      <PriorityTag priority={task.priority} />
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
                    ➕ New task
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
                <h3>⚙️ Doing</h3>
                <span className="kanban-count">{columns.doing.length}</span>
              </div>
              <div className="kanban-tasks">
                {columns.doing.map(task => (
                  <div
                    key={task.id}
                    className="kanban-card"
                    draggable
                    onDragStart={() => handleDragStart(task)}
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
                    <div className="kanban-task-meta">
                      <Avatar
                        initials={task.assignee.initials}
                        gradient={task.assignee.gradient}
                        size="sm"
                      />
                      <PriorityTag priority={task.priority} />
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
                <h3>✅ Done</h3>
                <span className="kanban-count">{columns.done.length}</span>
              </div>
              <div className="kanban-tasks">
                {columns.done.map(task => (
                  <div
                    key={task.id}
                    className="kanban-card done"
                    draggable
                    onDragStart={() => handleDragStart(task)}
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
                    <div className="kanban-task-meta">
                      <Avatar
                        initials={task.assignee.initials}
                        gradient={task.assignee.gradient}
                        size="sm"
                      />
                      <PriorityTag priority={task.priority} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming meetings */}
        <section aria-labelledby="meetings-heading">
          <div className="plan-section-header">
            <div className="plan-section-title" id="meetings-heading">Upcoming Meetings</div>
            <button className="plan-add-btn" aria-label="Schedule a meeting">➕ Schedule</button>
          </div>
          <ul className="meeting-list" aria-label="Upcoming meetings">
            {MEETINGS.map(m => (
              <li
                key={m.id}
                className="meeting-item"
                style={{ borderLeftColor: m.color }}
              >
                <div className="meeting-time-block">
                  <div className="meeting-time" style={{ color: m.color }}>{m.time}</div>
                  <div className="meeting-dur">{m.duration}</div>
                </div>
                <div className="meeting-info">
                  <div className="meeting-name">{m.name}</div>
                  <div className="meeting-when">{m.when}</div>
                </div>
                <div className="attendee-stack" aria-label="Attendees">
                  {m.attendees.map((a, i) => (
                    <Avatar key={i} initials={a.initials} gradient={a.gradient} size="sm" />
                  ))}
                </div>
              </li>
            ))}
          </ul>
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
          {loading ? (
            <div className="loading-spinner" style={{ margin: '10px 0' }} />
          ) : members.length === 0 ? (
            <div className="panel-section">No members</div>
          ) : (
            members.map(m => (
              <div key={m.id} className="member-row">
                <Avatar initials={m.initials} gradient={m.gradient} size="sm" status={m.status} dotSize="sm" />
                <div className="member-info">
                  <div className="member-name">{m.name}</div>
                  <div className="member-role">{m.role}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="ps-divider" />

        {/* Today's events */}
        <div>
          <div className="ps-section-title">Today's Events</div>
          {TODAY_EVENTS.map(ev => (
            <div
              key={ev.id}
              className="event-card"
              style={{ background: ev.bg, borderColor: ev.border }}
            >
              <div className="event-time" style={{ color: ev.color }}>{ev.time}</div>
              <div className="event-name">{ev.name}</div>
            </div>
          ))}
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
     </div>
   );
 }

// ── PriorityTag ──────────────────────────────────────────────────────────────
function PriorityTag({ priority }) {
  const map = {
    high: { label: 'High', cls: 'priority-high' },
    med:  { label: 'Med',  cls: 'priority-med'  },
    low:  { label: 'Low',  cls: 'priority-low'  },
    done: { label: 'Done', cls: 'priority-done' },
  };
  const { label, cls } = map[priority] || map.low;
  return <span className={`priority-tag ${cls}`}>{label}</span>;
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
