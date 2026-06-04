// src/components/teams/TeamPlanning.jsx
import React, { useState, useEffect } from 'react';
import { Avatar } from '../shared/Avatar';
import { MEETINGS, CALENDAR, TODAY_EVENTS } from '../../data/mockData';
import { getTeamMembers, getTaches, createTache } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { gradientForCip, initialsFromUser } from '../../utils/gradient';

/**
 * TeamPlanning  — Planning tab: tasks, upcoming meetings, calendar, right sidebar.
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
            done: t.status === 'termine' || t.status === 'done',
            text: t.nomTache,
            assignee: {
              initials: initialsFromUser({ cip: t.cip, pseudo: t.cip }),
              gradient: gradientForCip(t.cip),
            },
            priority: t.status === 'termine' ? 'done' :
                     t.status === 'urgent' ? 'high' :
                     t.status === 'important' ? 'med' : 'low',
          }));
          setTasks(transformed);
        })
        .catch(err => console.error('Failed to load tasks:', err)),
    ]).finally(() => setLoading(false));
  }, [team?.equipeId]);

  function toggleTask(id) {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, done: !t.done, priority: !t.done ? 'done' : 'med' } : t)
    );
  }

  async function handleCreateTask() {
    if (!newTaskName.trim() || !team?.equipeId || !user?.cip) return;
    setCreating(true);
    try {
      await createTache({
        nomTache: newTaskName.trim(),
        equipeId: team.equipeId,
        cip: user.cip,
        status: 'en_cours',
      });
      setNewTaskName('');
      setShowTaskForm(false);
      const data = await getTaches(team.equipeId);
      const transformed = (data || []).map(t => ({
        id: t.id,
        done: t.status === 'termine' || t.status === 'done',
        text: t.nomTache,
        assignee: {
          initials: initialsFromUser({ cip: t.cip, pseudo: t.cip }),
          gradient: gradientForCip(t.cip),
        },
        priority: t.status === 'termine' ? 'done' :
                 t.status === 'urgent' ? 'high' :
                 t.status === 'important' ? 'med' : 'low',
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

  return (
    <div className="planning-layout">
      {/* ── Main scrollable area ── */}
      <div className="planning-main">

        {/* Tasks */}
        <section aria-labelledby="tasks-heading">
          <div className="plan-section-header">
            <div className="plan-section-title" id="tasks-heading">Tasks</div>
            <button className="plan-add-btn" aria-label="Create new task" onClick={() => setShowTaskForm(true)}>➕ New task</button>
          </div>
          <ul className="task-list" aria-label="Task list">
            {tasks.map(task => (
              <li key={task.id} className="task-item">
                <button
                  className={`task-check ${task.done ? 'done' : ''}`}
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
                  aria-pressed={task.done}
                >
                  {task.done && '✓'}
                </button>
                <span className={`task-text ${task.done ? 'done' : ''}`}>{task.text}</span>
                <div className="task-meta">
                  <Avatar
                    initials={task.assignee.initials}
                    gradient={task.assignee.gradient}
                    size="sm"
                  />
                  <PriorityTag priority={task.priority} />
                </div>
              </li>
            ))}
          </ul>

          {showTaskForm && (
            <form className="task-create-form" onSubmit={e => { e.preventDefault(); handleCreateTask(); }}>
              <input
                className="task-create-input"
                type="text"
                placeholder="Task name..."
                value={newTaskName}
                onChange={e => setNewTaskName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                aria-label="New task name"
              />
              <div className="task-create-actions">
                <button
                  type="submit"
                  className="task-create-btn"
                  disabled={!newTaskName.trim() || creating}
                  style={{ opacity: (!newTaskName.trim() || creating) ? 0.5 : 1 }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  className="task-create-cancel"
                  onClick={() => { setShowTaskForm(false); setNewTaskName(''); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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
            <span className="stat-label">Tasks open</span>
            <span className="stat-value">{tasks.filter(t => !t.done).length}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Completed</span>
            <span className="stat-value green">{tasks.filter(t => t.done).length}</span>
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
