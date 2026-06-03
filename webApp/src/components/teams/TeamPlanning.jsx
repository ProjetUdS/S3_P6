// src/components/teams/TeamPlanning.jsx
import React, { useState } from 'react';
import { Avatar } from '../shared/Avatar';
import { TASKS, MEETINGS, CALENDAR, TODAY_EVENTS, TEAM_MEMBERS } from '../../data/mockData';

/**
 * TeamPlanning  — Planning tab: tasks, upcoming meetings, calendar, right sidebar.
 *
 * Props:
 *   team  – team object (not used heavily here but passed for context)
 */
export default function TeamPlanning({ team: _team }) {
  const [tasks, setTasks] = useState(TASKS);

  function toggleTask(id) {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, done: !t.done, priority: !t.done ? 'done' : 'med' } : t)
    );
  }

  return (
    <div className="planning-layout">
      {/* ── Main scrollable area ── */}
      <div className="planning-main">

        {/* Tasks */}
        <section aria-labelledby="tasks-heading">
          <div className="plan-section-header">
            <div className="plan-section-title" id="tasks-heading">Tasks</div>
            <button className="plan-add-btn" aria-label="Create new task">➕ New task</button>
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
          {TEAM_MEMBERS.map(m => (
            <div key={m.id} className="member-row">
              <Avatar initials={m.initials} gradient={m.gradient} size="sm" status={m.status} dotSize="sm" />
              <div className="member-info">
                <div className="member-name">{m.name}</div>
                <div className="member-role">{m.role}</div>
              </div>
            </div>
          ))}
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
            <span className="stat-value">3</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Completed</span>
            <span className="stat-value green">1</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Meetings today</span>
            <span className="stat-value">2</span>
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
