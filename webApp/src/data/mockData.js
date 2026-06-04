// ─── Avatar gradient map ─────────────────────────────────────────
export const GRADIENTS = {
  SR: 'linear-gradient(135deg, #7c6af7, #a78bfa)',
  JD: 'linear-gradient(135deg, #f093fb, #f5576c)',
  AK: 'linear-gradient(135deg, #43e97b, #38f9d7)',
  PL: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  TM: 'linear-gradient(135deg, #667eea, #764ba2)',
  P:  'linear-gradient(135deg, #7c6af7, #a78bfa)',
  D:  'linear-gradient(135deg, #43e97b, #38f9d7)',
  E:  'linear-gradient(135deg, #f59e0b, #ef4444)',
};

// ─── Current user ────────────────────────────────────────────────
export const ME = { id: 'jd', name: 'Jamie D.', initials: 'JD', gradient: GRADIENTS.JD };

// ─── Friends list ────────────────────────────────────────────────
export const FRIENDS = [
  { id: 'sr', name: 'Sara R.',  initials: 'SR', status: 'online',  sub: 'Active now',     gradient: GRADIENTS.SR, unread: 3 },
  { id: 'tm', name: 'Tom M.',   initials: 'TM', status: 'away',    sub: 'Away · 2h ago',  gradient: GRADIENTS.TM },
  { id: 'ak', name: 'Alex K.',  initials: 'AK', status: 'online',  sub: 'Active now',     gradient: GRADIENTS.AK },
  { id: 'pl', name: 'Priya L.', initials: 'PL', status: 'offline', sub: 'Offline',        gradient: GRADIENTS.PL },
];

// ─── Friend search suggestions ───────────────────────────────────
export const SUGGESTIONS = [
  { id: 'jh', name: 'Jamie Hernandez', email: 'jamie.h@company.com', initials: 'JH', gradient: GRADIENTS.TM },
  { id: 'jw', name: 'Jamie Wilson',    email: 'jwilson@studio.io',   initials: 'JW', gradient: GRADIENTS.JD },
];

// ─── Messages (Sara conversation) ────────────────────────────────
export const MESSAGES_SR = [
  {
    id: 1, from: 'sr', day: 'Yesterday',
    bubbles: [
      { type: 'text', content: 'Hey! Did you check out those mockups I sent over?' },
    ],
    time: '2:14 PM',
  },
  {
    id: 2, from: 'jd', day: null,
    bubbles: [
      { type: 'text', content: "Yeah! Really love the direction. Here's my sketch for the home screen:" },
      { type: 'image', filename: 'home_screen_v2.png' },
    ],
    time: '2:19 PM',
  },
  {
    id: 3, from: 'sr', day: null,
    bubbles: [
      { type: 'text', content: 'Ooh nice! I recorded a quick walkthrough too — have a look 👇' },
      { type: 'video', filename: 'walkthrough_demo.mp4', duration: '0:42' },
    ],
    time: '2:22 PM',
  },
  {
    id: 4, from: 'jd', day: 'Today',
    bubbles: [
      { type: 'text', content: 'Just watched it — love the transition on the team tab 🔥 Let\'s sync this afternoon' },
    ],
    time: '9:04 AM',
  },
  {
    id: 5, from: 'sr', day: null,
    bubbles: [
      { type: 'text', content: 'Sounds good! 3pm works?' },
    ],
    time: '9:06 AM',
  },
];

// ─── Teams ───────────────────────────────────────────────────────
export const TEAMS = [
  { id: 'product',     name: 'Product',     memberCount: 5, initials: 'P', gradient: GRADIENTS.P, unread: 2 },
  { id: 'design',      name: 'Design',      memberCount: 3, initials: 'D', gradient: GRADIENTS.D },
  { id: 'engineering', name: 'Engineering', memberCount: 8, initials: 'E', gradient: GRADIENTS.E },
];

// ─── Team members (Product team) ─────────────────────────────────
export const TEAM_MEMBERS = [
  { id: 'jd', name: 'Jamie D.', initials: 'JD', role: 'Owner',  gradient: GRADIENTS.JD, status: 'online'  },
  { id: 'sr', name: 'Sara R.',  initials: 'SR', role: 'Member', gradient: GRADIENTS.SR, status: 'online'  },
  { id: 'ak', name: 'Alex K.',  initials: 'AK', role: 'Member', gradient: GRADIENTS.AK, status: 'online'  },
  { id: 'pl', name: 'Priya L.', initials: 'PL', role: 'Member', gradient: GRADIENTS.PL, status: 'away'    },
  { id: 'tm', name: 'Tom M.',   initials: 'TM', role: 'Member', gradient: GRADIENTS.TM, status: 'offline' },
];

// ─── Tasks ───────────────────────────────────────────────────────
export const TASKS = [
  {
    id: 1, done: true,
    text: 'Set up design system tokens',
    assignee: { initials: 'SR', gradient: GRADIENTS.SR },
    priority: 'done',
  },
  {
    id: 2, done: false,
    text: 'Finalize onboarding flow',
    assignee: { initials: 'JD', gradient: GRADIENTS.JD },
    priority: 'high',
  },
  {
    id: 3, done: false,
    text: 'Write API documentation',
    assignee: { initials: 'AK', gradient: GRADIENTS.AK },
    priority: 'med',
  },
  {
    id: 4, done: false,
    text: 'User testing — prototype v3',
    assignee: { initials: 'PL', gradient: GRADIENTS.PL },
    priority: 'low',
  },
];

// ─── Meetings ────────────────────────────────────────────────────
export const MEETINGS = [
  {
    id: 1,
    time: '10:00', duration: '30 min',
    name: 'Sprint review',
    when: 'Today · All team',
    color: '#7c6af7',
    attendees: [
      { initials: 'SR', gradient: GRADIENTS.SR },
      { initials: 'JD', gradient: GRADIENTS.JD },
      { initials: 'AK', gradient: GRADIENTS.AK },
    ],
  },
  {
    id: 2,
    time: '15:00', duration: '1 hr',
    name: 'Roadmap planning',
    when: 'Tomorrow · Product + Design',
    color: '#f59e0b',
    attendees: [
      { initials: 'JD', gradient: GRADIENTS.JD },
      { initials: 'SR', gradient: GRADIENTS.SR },
    ],
  },
];

// ─── Calendar (May 2026) ─────────────────────────────────────────
export const CALENDAR = {
  month: 'May 2026',
  // Days in the grid: null = padding from prev month, number = day
  // May 2026 starts on Friday (index 4, Mon=0)
  grid: [
    null, null, null, null, 1, 2, 3,
    4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31,
  ],
  today: 29,
  eventDays: [2, 6, 9, 15, 20, 24, 29],
};

// ─── Today's events (sidebar) ────────────────────────────────────
export const TODAY_EVENTS = [
  { id: 1, time: '10:00 – 10:30', name: 'Sprint review',    color: '#7c6af7', bg: 'rgba(124,106,247,0.08)', border: 'rgba(124,106,247,0.2)'  },
  { id: 2, time: '15:00 – 16:00', name: 'Roadmap planning', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)'  },
];
