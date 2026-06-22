// src/components/teams/TeamPlanning.jsx
import React, { useState, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { MEETINGS, CALENDAR, TODAY_EVENTS } from '../../data/mockData';
import { getTeamMembers, getTaches, createTache, updateTache } from '../../services/api';
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

  // Map task status to column state
  const getTaskStatus = (t) => {
    const status = t.status?.toLowerCase() || '';
    if (status === 'termine' || status === 'done') return 'done';
    if (status === 'en_cours' || status === 'doing') return 'doing';
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

        {/* Mini Calendar */}
        <section aria-labelledby="calendar-heading">
          <div className="plan-section-header">
            <div className="plan-section-title" id="calendar-heading">Calendar</div>
          </div>
          <MiniCalendar />
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
function MiniCalendar() {
  const { month, grid, today, eventDays } = CALENDAR;
  const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="mini-calendar">
      <div className="cal-header">
        <button className="cal-nav" aria-label="Previous month">‹</button>
        <div className="cal-month">{month}</div>
        <button className="cal-nav" aria-label="Next month">›</button>
      </div>
      <div className="cal-grid" role="grid" aria-label={month}>
        {/* Day name headers */}
        {DAY_NAMES.map(d => (
          <div key={d} className="cal-day-name" role="columnheader">{d}</div>
        ))}
        {/* Days */}
        {grid.map((day, i) => {
          if (day === null) {
            return <div key={`pad-${i}`} className="cal-day other-month" aria-hidden="true" />;
          }
          const isToday   = day === today;
          const hasEvent  = eventDays.includes(day);
          return (
            <div
              key={day}
              role="gridcell"
              className={[
                'cal-day',
                isToday  ? 'today'     : '',
                hasEvent ? 'has-event' : '',
              ].join(' ')}
              aria-label={`${day}${hasEvent ? ', has event' : ''}${isToday ? ', today' : ''}`}
              aria-current={isToday ? 'date' : undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
