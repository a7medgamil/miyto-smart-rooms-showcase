import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, createScenario, transition, assertState, stageOf } from '../engine.mjs';

const act = (state, type, fields = {}) => transition(state, { type, ...fields });
const tick = (state, minutes) => act(state, 'tick', { minutes });
const add = (state, level) => act(state, 'add', { level });
const person = (state, id = 'p-001') => state.participants.find(p => p.id === id);
function pair() {
  return act(add(add(createState(), 'L1'), 'L1'), 'match');
}
function deepFreeze(value) {
  Object.freeze(value);
  for (const child of Object.values(value)) if (child && typeof child === 'object') deepFreeze(child);
  return value;
}

test('empty state has a zero virtual clock and valid invariants', () => {
  assert.deepEqual(createState(), { minute: 0, nextParticipant: 1, nextRoom: 1, participants: [], queue: [], rooms: [], events: [] });
  assertState(createState());
});

test('scenario is deterministic, fake-only and has three exact-level pairs plus a queue', () => {
  const state = createScenario();
  assert.deepEqual(state, createScenario());
  assert.equal(state.rooms.length, 3);
  assert.deepEqual(state.queue, ['p-007']);
  assert.deepEqual(state.participants.map(p => p.label), ['Demo 01', 'Demo 02', 'Demo 03', 'Demo 04', 'Demo 05', 'Demo 06', 'Demo 07']);
  for (const room of state.rooms) {
    assert.equal(room.members.length, 2);
    assert.ok(room.members.every(id => person(state, id).level === room.level));
  }
});

test('transitions accept deeply frozen input and preserve all earlier snapshots', () => {
  const state = deepFreeze(createScenario());
  const before = JSON.stringify(state);
  const next = tick(state, 12);
  assert.equal(JSON.stringify(state), before);
  assert.notEqual(next.rooms[0], state.rooms[0]);
  assert.equal(person(state).minutes, 0);
  assert.equal(person(next).minutes, 12);
});

test('incompatible levels remain waiting; matching chooses oldest compatible pair', () => {
  let state = createState();
  for (const level of ['L1', 'L2', 'L2', 'L1', 'L1']) state = add(state, level);
  state = act(state, 'match');
  assert.deepEqual(state.rooms.map(r => r.members), [['p-001', 'p-004'], ['p-002', 'p-003']]);
  assert.deepEqual(state.queue, ['p-005']);
  assert.deepEqual(act(state, 'match'), state);
});

test('one participant per level cannot form a room', () => {
  let state = createState();
  for (const level of ['L1', 'L2', 'L3']) state = add(state, level);
  assert.equal(act(state, 'match').rooms.length, 0);
});

test('matching is explicit; adding never silently creates a room', () => {
  const state = add(add(createState(), 'L1'), 'L1');
  assert.equal(state.rooms.length, 0);
  assert.equal(state.queue.length, 2);
  assert.equal(act(state, 'match').rooms.length, 1);
});

test('24-participant ceiling and invalid levels reject without input mutation', () => {
  let state = createState();
  for (let i = 0; i < 24; i++) state = add(state, 'L1');
  const before = structuredClone(state);
  assert.throws(() => add(state, 'L1'), /limited to 24/);
  for (const level of ['L4', '', null, undefined, 1]) assert.throws(() => add(state, level), /Choose/);
  assert.deepEqual(state, before);
});

test('silent stage boundaries are precisely 10, 20 and 30; discussion ends at 40', () => {
  for (const [elapsed, stage] of [[0, 'Silent · observe'], [9, 'Silent · observe'], [10, 'Silent · prepare'], [19, 'Silent · prepare'], [20, 'Silent · rehearse'], [29, 'Silent · rehearse'], [30, 'Discussion'], [39, 'Discussion'], [40, 'Complete']]) {
    const state = elapsed === 0 ? pair() : tick(pair(), elapsed);
    assert.equal(stageOf(state.rooms[0]), stage, `minute ${elapsed}`);
    assert.equal(person(state).minutes, elapsed);
  }
});

test('completion closes attendance and retains final ledger even as global clock advances', () => {
  const state = tick(pair(), 70);
  assert.equal(state.minute, 70);
  assert.equal(state.rooms[0].elapsed, 40);
  assert.equal(person(state).status, 'finished');
  assert.equal(person(state).minutes, 40);
  assert.equal(person(tick(state, 10)).minutes, 40);
});

test('waiting time earns zero minutes and a new room clock starts at zero', () => {
  let state = tick(add(createState(), 'L1'), 25);
  assert.equal(person(state).minutes, 0);
  state = act(add(state, 'L1'), 'match');
  assert.equal(state.minute, 25);
  assert.equal(state.rooms[0].elapsed, 0);
  assert.equal(person(tick(state, 1)).minutes, 1);
});

test('leaving pauses only the absent attendee; rejoining never backfills minutes', () => {
  let state = tick(pair(), 7);
  state = act(state, 'leave', { id: 'p-001' });
  state = tick(state, 6);
  assert.equal(person(state).minutes, 7);
  assert.equal(person(state, 'p-002').minutes, 13);
  assert.equal(state.rooms[0].elapsed, 13);
  state = act(state, 'rejoin', { id: 'p-001' });
  assert.equal(person(state).minutes, 7);
  state = tick(state, 2);
  assert.equal(person(state).minutes, 9);
  assert.equal(person(state, 'p-002').minutes, 15);
});

test('both absent keeps the room clock moving with no attendance accrual', () => {
  let state = pair();
  for (const id of ['p-001', 'p-002']) state = act(state, 'leave', { id });
  state = tick(state, 10);
  assert.equal(state.rooms[0].elapsed, 10);
  assert.ok(state.participants.every(p => p.minutes === 0));
});

test('a left seat stays reserved and cannot be filled by waiting participants', () => {
  let state = act(pair(), 'leave', { id: 'p-001' });
  state = add(state, 'L1');
  state = act(state, 'match');
  assert.equal(state.rooms.length, 1);
  assert.deepEqual(state.rooms[0].members, ['p-001', 'p-002']);
  assert.deepEqual(state.queue, ['p-003']);
});

test('queue leave and rejoin goes to the back with no attendance', () => {
  let state = add(add(createState(), 'L1'), 'L1');
  state = act(state, 'leave', { id: 'p-001' });
  assert.deepEqual(state.queue, ['p-002']);
  state = act(tick(state, 3), 'rejoin', { id: 'p-001' });
  assert.deepEqual(state.queue, ['p-002', 'p-001']);
  assert.equal(person(state).minutes, 0);
});

test('concurrent rooms progress independently from their creation minute', () => {
  let state = tick(pair(), 15);
  state = act(add(add(state, 'L2'), 'L2'), 'match');
  state = tick(state, 30);
  assert.deepEqual(state.rooms.map(r => r.elapsed), [40, 30]);
  assert.equal(person(state).minutes, 40);
  assert.equal(person(state, 'p-003').minutes, 30);
  assert.equal(stageOf(state.rooms[1]), 'Discussion');
});

test('absence through completion cannot rejoin a closed room', () => {
  const state = tick(act(pair(), 'leave', { id: 'p-001' }), 40);
  assert.equal(person(state).status, 'left');
  assert.equal(person(state).minutes, 0);
  assert.throws(() => act(state, 'rejoin', { id: 'p-001' }), /complete/);
  assert.throws(() => act(state, 'leave', { id: 'p-002' }), /Only/);
});

test('invalid lifecycle actions and unknown participants are rejected atomically', () => {
  const state = pair();
  const before = structuredClone(state);
  assert.throws(() => act(state, 'rejoin', { id: 'p-001' }), /Only/);
  assert.throws(() => act(state, 'leave', { id: 'missing' }), /Only/);
  assert.throws(() => act(state, 'rejoin', { id: 'missing' }), /Only/);
  const left = act(state, 'leave', { id: 'p-001' });
  assert.throws(() => act(left, 'leave', { id: 'p-001' }), /Only/);
  assert.throws(() => act(state, 'teleport'), /Unknown/);
  assert.throws(() => transition(state, null), /required/);
  assert.deepEqual(state, before);
});

test('fractional, negative, missing, nonfinite and excessive ticks are rejected', () => {
  const state = pair();
  for (const minutes of [0, -1, 1.5, NaN, Infinity, '10', undefined, 121]) {
    assert.throws(() => tick(state, minutes), /whole minutes/);
  }
  const high = { ...createState(), minute: Number.MAX_SAFE_INTEGER };
  assert.throws(() => tick(high, 1), /overflow/);
  assert.equal(state.minute, 0);
});

test('fake clock: repeated single-minute ticks equal a batch for room and attendance state', () => {
  const start = pair();
  let repeated = start;
  for (let i = 0; i < 35; i++) repeated = tick(repeated, 1);
  const batch = tick(start, 35);
  assert.equal(repeated.minute, batch.minute);
  assert.deepEqual(repeated.participants, batch.participants);
  assert.deepEqual(repeated.rooms, batch.rooms);
  assert.equal(start.minute, 0);
});

test('invariant validator rejects duplicate people, queue entries, excess seats and mixed levels', () => {
  const cases = [
    state => state.participants.push({ ...state.participants[0] }),
    state => { state.queue = ['p-001', 'p-001']; },
    state => state.rooms[0].members.push('p-003'),
    state => { state.participants[0].level = 'L2'; },
    state => { state.participants[0].minutes = -1; },
    state => { state.participants[0].roomId = 'missing'; },
    state => { state.rooms[0].elapsed = 41; },
    state => { state.minute = 0.5; },
    state => { state.participants[0].label = 'Unrecognized identity'; }
  ];
  for (const corrupt of cases) {
    const state = createScenario();
    corrupt(state);
    assert.throws(() => assertState(state));
  }
});

test('deterministic mixed-action sequence preserves invariants and seat limit after every step', () => {
  let state = createScenario();
  const actions = [
    { type: 'tick', minutes: 9 }, { type: 'leave', id: 'p-003' },
    { type: 'add', level: 'L1' }, { type: 'match' }, { type: 'tick', minutes: 11 },
    { type: 'rejoin', id: 'p-003' }, { type: 'tick', minutes: 20 },
    { type: 'tick', minutes: 9 }
  ];
  for (const action of actions) {
    state = transition(state, action);
    assertState(state);
    assert.ok(state.rooms.every(r => r.members.length <= 2));
  }
  assert.equal(person(state, 'p-003').minutes, 29);
  assert.equal(person(state, 'p-007').minutes, 40);
});

test('event log is bounded and stage boundaries use simulated timestamps', () => {
  const state = tick(pair(), 40);
  assert.deepEqual(state.events.slice(1, 5).map(e => e.minute), [40, 30, 20, 10]);
  let busy = state;
  for (let i = 0; i < 40; i++) busy = tick(busy, 1);
  assert.equal(busy.events.length, 30);
  assert.equal(busy.events[0].minute, 80);
});
