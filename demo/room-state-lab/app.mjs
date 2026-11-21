import { createScenario, transition, stageOf, SESSION_MINUTES } from './engine.mjs';

let state = createScenario();
const byId = id => document.getElementById(id);
const time = minute => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
const statusLabel = { waiting: 'Waiting', 'in-room': 'Present', left: 'Away', finished: 'Finished' };

function element(tag, className, text) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
}

function personButton(person, context) {
  const room = state.rooms.find(room => room.id === person.roomId);
  if (person.status === 'finished' || (person.status === 'left' && room?.elapsed === SESSION_MINUTES)) {
    return element('span', 'seat-status', 'Closed');
  }
  const action = person.status === 'left' ? 'rejoin' : 'leave';
  const button = element('button', '', action === 'leave' ? 'Leave' : 'Rejoin');
  button.type = 'button';
  button.dataset.action = action;
  button.dataset.id = person.id;
  button.dataset.key = `${context}-${person.id}`;
  button.setAttribute('aria-label', `${button.textContent}: ${person.label}, ${person.roomId ?? 'waiting queue'}`);
  return button;
}

function renderRoom(room) {
  const complete = room.elapsed === SESSION_MINUTES;
  const card = element('article', `room-card${complete ? ' completed' : ''}`);
  card.setAttribute('aria-labelledby', `${room.id}-title`);
  const top = element('div', 'room-top');
  const title = element('h3', '', `Room ${room.id.slice(2)}`);
  title.id = `${room.id}-title`;
  top.append(title, element('span', 'level-pill', room.level));
  const stage = element('div', 'room-stage');
  const stageLabel = element('div', 'stage-label');
  stageLabel.append(element('strong', '', stageOf(room)), element('span', '', `${room.elapsed} / 40 min`));
  const track = element('div', 'progress-track');
  track.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 4; i++) {
    const segment = element('div', 'progress-segment');
    const fill = element('span', 'progress-fill');
    fill.style.width = `${Math.max(0, Math.min(10, room.elapsed - i * 10)) * 10}%`;
    segment.append(fill);
    track.append(segment);
  }
  const remaining = complete ? 'Session ended · ledger retained' : `${10 - room.elapsed % 10} min until ${room.elapsed < 30 ? 'next stage' : 'completion'}`;
  stage.append(stageLabel, track, element('p', 'room-caption', remaining));
  const seats = element('ul', 'seats');
  for (const id of room.members) {
    const person = state.participants.find(p => p.id === id);
    const seat = element('li', `seat${person.status === 'left' ? ' is-away' : ''}`);
    const avatar = element('span', 'avatar', person.label.slice(-2));
    avatar.setAttribute('aria-hidden', 'true');
    const detail = element('div', 'seat-detail');
    detail.append(element('strong', '', person.label), element('small', '', `${statusLabel[person.status]} · ${person.minutes} min attended`));
    seat.append(avatar, detail, personButton(person, 'room'));
    seats.append(seat);
  }
  const present = room.members.filter(id => state.participants.find(p => p.id === id).status === 'in-room').length;
  const footer = element('div', 'room-footer');
  footer.append(element('span', '', complete ? 'Complete' : `${present} / 2 present`), element('span', '', 'Synthetic session'));
  card.append(top, stage, seats, footer);
  return card;
}

function queuePerson(person, context) {
  const item = element('li');
  item.append(element('span', 'queue-person', person.label), element('span', 'level-pill', person.level), personButton(person, context));
  return item;
}

function render() {
  // Rebuilding small views preserves focus on the same participant control.
  const focusKey = document.activeElement?.dataset.key;
  const focusId = document.activeElement?.dataset.id;
  byId('clock').textContent = time(state.minute);
  byId('active-rooms').textContent = state.rooms.filter(r => r.elapsed < SESSION_MINUTES).length;
  byId('present-count').textContent = state.participants.filter(p => p.status === 'in-room').length;
  byId('queue-count').textContent = state.queue.length;
  byId('total-minutes').textContent = state.participants.reduce((sum, p) => sum + p.minutes, 0);
  byId('rooms').replaceChildren(...state.rooms.map(renderRoom));
  const queue = state.queue.map(id => state.participants.find(p => p.id === id));
  byId('queue').replaceChildren(...(queue.length ? queue.map(p => queuePerson(p, 'queue')) : [element('li', 'empty', 'No one waiting. Add a fake participant to explore matching.')]));
  byId('capacity').textContent = `${state.participants.length} / 24 synthetic participants. Matching is manual.`;
  byId('add-button').disabled = state.participants.length >= 24;
  const away = state.participants.filter(p => p.status === 'left' && p.roomId === null);
  const awayPanel = byId('away-panel');
  awayPanel.replaceChildren();
  if (away.length) {
    const list = element('ul', 'queue-list');
    list.append(...away.map(p => queuePerson(p, 'away')));
    awayPanel.append(element('h3', 'away-heading', 'Left the queue'), list);
  }
  byId('attendance').replaceChildren(...state.participants.map(p => {
    const row = element('tr');
    const status = element('td');
    const dot = element('span', `state-dot ${p.status}`);
    dot.setAttribute('aria-hidden', 'true');
    status.append(dot, document.createTextNode(statusLabel[p.status]));
    row.append(element('td', '', p.label), element('td', '', p.level), status, element('td', 'numeric', String(p.minutes)));
    return row;
  }));
  byId('events').replaceChildren(...state.events.map(event => {
    const item = element('li');
    // This is an elapsed duration, not a wall-clock <time> value.
    item.append(element('span', 'event-time', time(event.minute)), element('p', '', event.text));
    return item;
  }));
  if (focusKey) {
    const controls = [...document.querySelectorAll('[data-key]')];
    const next = controls.find(control => control.dataset.key === focusKey)
      ?? controls.find(control => control.dataset.id === focusId);
    if (next) next.focus({ preventScroll: true });
    else if (focusKey.startsWith('queue-')) document.querySelector('[data-action="match"]').focus({ preventScroll: true });
    else document.querySelector('[data-action="tick"]').focus({ preventScroll: true });
  }
}

function announce(message, error = false) {
  byId('notice').textContent = message;
  byId('notice').classList.toggle('error', error);
}

function apply(action) {
  try {
    const oldRooms = state.rooms.length;
    state = transition(state, action);
    render();
    const messages = {
      add: `${state.participants.at(-1).label} added to the ${action.level} queue. Use Match to create a pair.`,
      match: state.rooms.length === oldRooms ? 'No compatible pair. Add another participant at the same level.' : `${state.rooms.length - oldRooms} new room(s) opened. Their clocks start at zero.`,
      tick: `Advanced ${action.minutes} simulated minute(s). Virtual clock ${time(state.minute)}. Attendance ledger updated.`,
      leave: 'Participant left. Attendance paused; a room seat stays reserved.',
      rejoin: 'Participant rejoined. Attendance resumes from the next simulated minute.'
    };
    announce(messages[action.type]);
  } catch (error) {
    announce(error.message, true);
  }
}

document.querySelector('main').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const type = button.dataset.action;
  if (type === 'reset') {
    state = createScenario();
    render();
    announce('Scenario reset. Clock and attendance cleared; three rooms and one waiting participant.');
    return;
  }
  apply({ type, id: button.dataset.id, minutes: Number(button.dataset.minutes) });
});

byId('add-form').addEventListener('submit', event => {
  event.preventDefault();
  apply({ type: 'add', level: byId('level').value });
});

render();
