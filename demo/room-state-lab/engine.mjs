/** Independent synthetic demonstration — not MIYTO production source,
 * not a live audio service, not a load test.
 * Pure transitions. No wall clock, I/O, random values or shared mutable state.
 */
export const LEVELS = Object.freeze(['L1', 'L2', 'L3']);
export const STAGES = Object.freeze(['Silent · observe', 'Silent · prepare', 'Silent · rehearse', 'Discussion']);
export const SESSION_MINUTES = 40;

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

export function stageOf(room) {
  return room.elapsed === SESSION_MINUTES ? 'Complete' : STAGES[Math.floor(room.elapsed / 10)];
}

export function createState() {
  return { minute: 0, nextParticipant: 1, nextRoom: 1, participants: [], queue: [], rooms: [], events: [] };
}

function record(state, text) {
  state.events.unshift({ minute: state.minute, text });
  state.events = state.events.slice(0, 30);
}

function add(state, level) {
  requireCondition(LEVELS.includes(level), 'Choose L1, L2 or L3.');
  requireCondition(state.participants.length < 24, 'This small demo is limited to 24 synthetic participants.');
  const serial = state.nextParticipant++;
  const id = `p-${String(serial).padStart(3, '0')}`;
  state.participants.push({ id, label: `Demo ${String(serial).padStart(2, '0')}`, level, status: 'waiting', roomId: null, minutes: 0 });
  state.queue.push(id);
  record(state, `${id} joined the ${level} queue.`);
}

function match(state) {
  // Exact level only. Oldest compatible pair wins, scanning the queue from front.
  while (true) {
    let pair;
    for (let i = 0; i < state.queue.length && !pair; i++) {
      const first = state.participants.find(p => p.id === state.queue[i]);
      const secondId = state.queue.slice(i + 1).find(id => state.participants.find(p => p.id === id).level === first.level);
      if (secondId) pair = [first.id, secondId];
    }
    if (!pair) return;
    const id = `r-${String(state.nextRoom++).padStart(2, '0')}`;
    const level = state.participants.find(p => p.id === pair[0]).level;
    state.rooms.push({ id, level, members: pair, elapsed: 0 });
    state.queue = state.queue.filter(id => !pair.includes(id));
    for (const p of state.participants.filter(p => pair.includes(p.id))) {
      p.status = 'in-room';
      p.roomId = id;
    }
    record(state, `${id} opened for ${pair.join(' + ')} at ${level}.`);
  }
}

export function assertState(state) {
  requireCondition(Number.isSafeInteger(state.minute) && state.minute >= 0, 'Invalid virtual clock.');
  requireCondition(Number.isSafeInteger(state.nextParticipant) && state.nextParticipant === state.participants.length + 1, 'Invalid participant sequence.');
  requireCondition(Number.isSafeInteger(state.nextRoom) && state.nextRoom === state.rooms.length + 1, 'Invalid room sequence.');
  const people = new Map(state.participants.map(p => [p.id, p]));
  const rooms = new Map(state.rooms.map(r => [r.id, r]));
  requireCondition(people.size === state.participants.length && people.size <= 24, 'Participant IDs must be unique; maximum 24.');
  requireCondition(rooms.size === state.rooms.length, 'Room IDs must be unique.');
  requireCondition(new Set(state.queue).size === state.queue.length, 'Duplicate queue entry.');
  requireCondition(state.queue.every(id => people.get(id)?.status === 'waiting'), 'Queue must contain waiting participants only.');
  const assigned = new Set();
  for (const room of state.rooms) {
    requireCondition(room.members.length === 2 && new Set(room.members).size === 2, 'A room must contain exactly two distinct seats.');
    requireCondition(LEVELS.includes(room.level), 'Invalid room level.');
    requireCondition(Number.isInteger(room.elapsed) && room.elapsed >= 0 && room.elapsed <= SESSION_MINUTES && room.elapsed <= state.minute, 'Invalid room time.');
    for (const id of room.members) {
      const p = people.get(id);
      requireCondition(p && p.roomId === room.id && p.level === room.level && !assigned.has(id), 'Invalid room membership or level.');
      requireCondition(room.elapsed < SESSION_MINUTES ? ['in-room', 'left'].includes(p.status) : ['finished', 'left'].includes(p.status), 'Room lifecycle mismatch.');
      assigned.add(id);
    }
  }
  for (const p of state.participants) {
    const serial = state.participants.indexOf(p) + 1;
    requireCondition(p.id === `p-${String(serial).padStart(3, '0')}` && p.label === `Demo ${String(serial).padStart(2, '0')}`, 'Participant identity must be synthetic and sequential.');
    requireCondition(LEVELS.includes(p.level) && ['waiting', 'in-room', 'left', 'finished'].includes(p.status), 'Invalid participant.');
    requireCondition(Number.isInteger(p.minutes) && p.minutes >= 0 && p.minutes <= (rooms.get(p.roomId)?.elapsed ?? 0), 'Invalid attendance.');
    requireCondition((p.status === 'waiting') === state.queue.includes(p.id), 'Waiting queue mismatch.');
    requireCondition(p.roomId === null ? ['waiting', 'left'].includes(p.status) : assigned.has(p.id), 'Participant room mismatch.');
  }
  return true;
}

/** Reject invalid transitions without modifying the input snapshot. */
export function transition(previous, action) {
  assertState(previous);
  const state = structuredClone(previous);
  requireCondition(action && typeof action.type === 'string', 'An action type is required.');
  switch (action.type) {
    case 'add':
      add(state, action.level);
      break;
    case 'match':
      match(state);
      break;
    case 'tick': {
      const count = action.minutes;
      requireCondition(Number.isInteger(count) && count >= 1 && count <= 120, 'Advance by 1 to 120 whole minutes.');
      requireCondition(Number.isSafeInteger(state.minute + count), 'Virtual clock overflow.');
      for (let step = 0; step < count; step++) {
        for (const room of state.rooms.filter(r => r.elapsed < SESSION_MINUTES)) {
          const before = stageOf(room);
          for (const id of room.members) {
            const p = state.participants.find(p => p.id === id);
            if (p.status === 'in-room') p.minutes++;
          }
          room.elapsed++;
          if (room.elapsed === SESSION_MINUTES) {
            for (const p of state.participants.filter(p => room.members.includes(p.id) && p.status === 'in-room')) p.status = 'finished';
          }
          if (stageOf(room) !== before) {
            // Boundary timestamps refer to the end of this simulated minute.
            state.events.unshift({ minute: state.minute + 1, text: `${room.id}: ${stageOf(room)}.` });
            state.events = state.events.slice(0, 30);
          }
        }
        state.minute++;
      }
      record(state, `Clock advanced by ${count} simulated minute${count === 1 ? '' : 's'}.`);
      break;
    }
    case 'leave': {
      const p = state.participants.find(p => p.id === action.id);
      requireCondition(p && ['waiting', 'in-room'].includes(p.status), 'Only a waiting or active participant can leave.');
      p.status = 'left';
      state.queue = state.queue.filter(id => id !== p.id);
      record(state, `${p.id} left; attendance paused.`);
      break;
    }
    case 'rejoin': {
      const p = state.participants.find(p => p.id === action.id);
      requireCondition(p?.status === 'left', 'Only a participant who left can rejoin.');
      if (p.roomId) {
        requireCondition(state.rooms.find(r => r.id === p.roomId).elapsed < SESSION_MINUTES, 'This room is complete; rejoin is closed.');
        p.status = 'in-room';
      } else {
        p.status = 'waiting';
        state.queue.push(p.id);
      }
      record(state, `${p.id} rejoined ${p.roomId ?? 'the queue'}.`);
      break;
    }
    default:
      throw new Error('Unknown action.');
  }
  assertState(state);
  return state;
}

export function createScenario() {
  let state = createState();
  for (const level of ['L1', 'L1', 'L2', 'L2', 'L3', 'L3', 'L1']) state = transition(state, { type: 'add', level });
  return transition(state, { type: 'match' });
}
