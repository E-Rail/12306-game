'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────────────────────────────────────
// MAP DATA
// ─────────────────────────────────────────────────────────────────────────────

// Positions loosely based on geography but prioritized for clickability.
// Dense clusters (Shanghai delta, Shandong, Beijing, South) have been spread out.
const CITIES = {
  // Northeast — spread vertically
  HRB: { name: '哈尔滨', en: 'Harbin', x: 653, y: 10 },
  CC: { name: '长春', en: 'Changchun', x: 630, y: 65 },
  SY: { name: '沈阳', en: 'Shenyang', x: 590, y: 125 },
  DL: { name: '大连', en: 'Dalian', x: 660, y: 175 },
  // North — spread Beijing cluster
  BJ: { name: '北京', en: 'Beijing', x: 400, y: 160 },
  TJ: { name: '天津', en: 'Tianjin', x: 445, y: 200 },
  TS: { name: '唐山', en: 'Tangshan', x: 500, y: 145 },
  SJZ: { name: '石家庄', en: 'Shijiazhuang', x: 340, y: 240 },
  HH: { name: '呼和浩特', en: 'Hohhot', x: 270, y: 190 },
  TY: { name: '太原', en: 'Taiyuan', x: 280, y: 250 },
  // East — spread Shandong
  JN: { name: '济南', en: 'Jinan', x: 430, y: 305 },
  WF: { name: '潍坊', en: 'Weifang', x: 500, y: 275 },
  QD: { name: '青岛', en: 'Qingdao', x: 540, y: 320 },
  XZ: { name: '徐州', en: 'Xuzhou', x: 410, y: 400 },
  YC: { name: '盐城', en: 'Yancheng', x: 490, y: 440 },
  // Shanghai delta — spread horizontally and vertically
  HF: { name: '合肥', en: 'Hefei', x: 370, y: 465 },
  NJ: { name: '南京', en: 'Nanjing', x: 420, y: 490 },
  WZ: { name: '无锡', en: 'Wuxi', x: 470, y: 490 },
  SZX: { name: '苏州', en: 'Suzhou', x: 520, y: 515 },
  SH: { name: '上海', en: 'Shanghai', x: 560, y: 550 },
  HZ: { name: '杭州', en: 'Hangzhou', x: 460, y: 570 },
  NB: { name: '宁波', en: 'Ningbo', x: 530, y: 605 },
  // East coast — spread
  WY: { name: '温州', en: 'Wenzhou', x: 490, y: 640 },
  FZ: { name: '福州', en: 'Fuzhou', x: 420, y: 680 },
  NC: { name: '南昌', en: 'Nanchang', x: 400, y: 590 },
  XM: { name: '厦门', en: 'Xiamen', x: 510, y: 710 },
  // Central
  ZZ: { name: '郑州', en: 'Zhengzhou', x: 330, y: 380 },
  XA: { name: '西安', en: "Xi'an", x: 210, y: 370 },
  WH: { name: '武汉', en: 'Wuhan', x: 350, y: 480 },
  CS: { name: '长沙', en: 'Changsha', x: 330, y: 545 },
  // Southwest — spread Chengdu-Chongqing
  CD: { name: '成都', en: 'Chengdu', x: 130, y: 490 },
  CQ: { name: '重庆', en: 'Chongqing', x: 200, y: 540 },
  GY: { name: '贵阳', en: 'Guiyang', x: 170, y: 600 },
  KM: { name: '昆明', en: 'Kunming', x: 100, y: 640 },
  GL: { name: '桂林', en: 'Guilin', x: 260, y: 600 },
  // South — spread Pearl River Delta
  NN: { name: '南宁', en: 'Nanning', x: 190, y: 660 },
  GZ: { name: '广州', en: 'Guangzhou', x: 340, y: 650 },
  SZ: { name: '深圳', en: 'Shenzhen', x: 390, y: 700 },
  HK: { name: '香港', en: 'Hong Kong', x: 340, y: 730 },
  // Northwest
  LZ: { name: '兰州', en: 'Lanzhou', x: 130, y: 320 },
};

const RAW_EDGES = [
  // 京哈高铁 Beijing-Harbin HSR
  ['BJ', 'TS', 150], ['TS', 'SY', 400], ['SY', 'CC', 300], ['CC', 'HRB', 240],
  // 哈大高铁 Harbin-Dalian HSR
  ['SY', 'DL', 397],
  // 京沪高铁 Beijing-Shanghai HSR
  ['BJ', 'TJ', 137], ['TJ', 'JN', 358], ['TJ', 'TS', 120], ['TS', 'JN', 240],
  ['JN', 'WF', 180], ['WF', 'QD', 180], ['JN', 'XZ', 340], ['XZ', 'NJ', 348],
  ['NJ', 'WZ', 180], ['WZ', 'SZX', 40], ['SZX', 'SH', 80], ['NJ', 'SH', 301],
  // 石济高铁 Shijiazhuang-Jinan HSR
  ['SJZ', 'JN', 297],
  // 京广高铁 Beijing-Guangzhou HSR
  ['BJ', 'SJZ', 281], ['SJZ', 'ZZ', 412], ['ZZ', 'WH', 534], ['WH', 'CS', 362],
  ['CS', 'GZ', 707], ['GZ', 'SZ', 140],
  // 广深港高铁 Guangzhou-Shenzhen-Hong Kong HSR
  ['SZ', 'HK', 40],
  // 沪昆高铁 Shanghai-Kunming HSR
  ['SH', 'HZ', 175], ['HZ', 'NC', 578], ['NC', 'CS', 342], ['CS', 'GY', 707], ['GY', 'KM', 639],
  // 沿海高铁 Coastal HSR
  ['HZ', 'NB', 150], ['NB', 'WY', 200], ['WY', 'FZ', 280], ['FZ', 'XM', 296],
  // 徐兰高铁 Xuzhou-Lanzhou HSR
  ['XZ', 'ZZ', 360], ['ZZ', 'XA', 505], ['XA', 'LZ', 676],
  // 西武高铁 Xi'an-Wuhan HSR
  ['XA', 'WH', 657],
  // 成渝高铁 Chengdu-Chongqing HSR
  ['CD', 'CQ', 340],
  // 成贵高铁 Chengdu-Guiyang HSR
  ['CD', 'GY', 650],
  // 渝贵高铁 Chongqing-Guiyang HSR
  ['CQ', 'GY', 345],
  // 贵广高铁 Guiyang-Guilin-Guangzhou HSR
  ['GY', 'GL', 410], ['GL', 'GZ', 447],
  // 渝长 Chongqing-Changsha HSR
  ['CQ', 'CS', 600],
  // 兰新/兰呼 Lanzhou-Hohhot
  ['LZ', 'HH', 680],
  // 京包高铁 Beijing-Hohhot HSR
  ['BJ', 'HH', 484],
  // 石太高铁 Shijiazhuang-Taiyuan HSR
  ['SJZ', 'TY', 220],
  // 大西高铁 Taiyuan-Xi'an HSR
  ['TY', 'XA', 600],
  // 合武高铁 Hefei-Wuhan HSR
  ['HF', 'WH', 350], ['NJ', 'HF', 150],
  // 合福高铁 Hefei-Fuzhou HSR
  ['HF', 'NC', 480], ['NC', 'FZ', 540],
  // 杭温高铁 Hangzhou-Wenzhou HSR
  ['HZ', 'WY', 260],
  // 南广高铁 Nanning-Guangzhou HSR
  ['GZ', 'NN', 587],
  // 南昆高铁 Nanning-Kunming HSR
  ['NN', 'KM', 828],
  // 西成高铁 Xi'an-Chengdu HSR
  ['XA', 'CD', 658],
  // 盐通/徐盐高铁 Yancheng HSR
  ['YC', 'NJ', 200], ['XZ', 'YC', 180],
  // 京九 Shijiazhuang-Xuzhou section
  ['SJZ', 'XZ', 500],
  // 桂林-南宁 Guilin-Nanning
  ['GL', 'NN', 365],
  // 郑济高铁 Zhengzhou-Jinan HSR
  ['ZZ', 'JN', 380],
  // 深厦高铁 Shenzhen-Xiamen HSR (via 潮汕)
  ['SZ', 'XM', 500],
  // 深昌高铁 Shenzhen-Nanchang HSR (via 赣州)
  ['SZ', 'NC', 800],
];

// Deduplicate and build fast lookups
const edgeSet = new Set();
const UNIQUE_EDGES = [];
const edgeMap = new Map();
for (const [a, b, d] of RAW_EDGES) {
  const key = [a, b].sort().join('-');
  if (edgeSet.has(key)) continue;
  edgeSet.add(key);
  UNIQUE_EDGES.push([a, b, d]);
  edgeMap.set(key, d);
}

function getEdgeDistance(a, b) {
  return edgeMap.get([a, b].sort().join('-')) ?? null;
}

function hasEdge(a, b) {
  return edgeMap.has([a, b].sort().join('-'));
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME STATE
// ─────────────────────────────────────────────────────────────────────────────

const CLS = ['business', 'first', 'second'];
const CLS_CAPS = { business: 8, first: 28, second: 80 };
const CLS_PRICES_PER_KM = { business: 1.46, first: 0.73, second: 0.46 };
const CLS_TOTAL = 116; // 8+28+80
const TRAIN_COST_PER_KM_PER_TICK = 1.0;
const MAX_TRAINS_PER_ROUTE = 50;
const MAX_WAITLIST_PER_ROUTE = 200;

let gameState = {
  money: 200000000, revenue: 0, costs: 0,
  tick: 0, day: 1, hour: 6,
  speed: 1, paused: false, score: 0,
  totalBookings: 0, totalCancellations: 0, totalWaitlisted: 0,
};

let playerRoutes = [];
let bookings = {};
let waitlist = [];
let demandMultiplier = 1.0;

// Fast ID counters (avoid crypto.randomUUID)
let trainNum = 0;
let routeNum = 0;
let bidNum = 0;
let lastMs = Date.now() - 1e9;
function nextId(prefix) {
  const ms = Date.now();
  if (ms <= lastMs) lastMs++;
  else lastMs = ms;
  return prefix + lastMs.toString(36) + (bidNum++);
}

// Reverse lookup: trainId → route (avoids scanning all routes on unbook)
const trainRouteIndex = new Map();

function makeSeats() {
  const seats = {};
  for (const cls of CLS) {
    seats[cls] = new Array(CLS_CAPS[cls]);
    for (let i = 0; i < CLS_CAPS[cls]; i++) seats[cls][i] = [0, 0, 0];
  }
  return seats;
}

function calcPrice(distance, cls) {
  return Math.round(distance * CLS_PRICES_PER_KM[cls]);
}

function countAvailable(train, cls) {
  const arr = train.seats[cls];
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (!arr[i][0] && !arr[i][1] && !arr[i][2]) count++;
  }
  return count;
}

function findSeatIdx(train, cls) {
  const arr = train.seats[cls];
  for (let i = 0; i < arr.length; i++) {
    if (!arr[i][0] && !arr[i][1] && !arr[i][2]) return i;
  }
  return -1;
}

function resetTrainSeats(train) {
  for (const cls of CLS) {
    const arr = train.seats[cls];
    for (let i = 0; i < arr.length; i++) { arr[i][0] = 0; arr[i][1] = 0; arr[i][2] = 0; }
  }
}

function calcTripTicks(distance) {
  return Math.max(12, Math.round(distance / 350 * 6));
}

function calcTrainCostPerTick(distance) {
  return Math.round(distance * TRAIN_COST_PER_KM_PER_TICK);
}

function getRouteName(waypoints) {
  let s = '';
  for (let i = 0; i < waypoints.length; i++) {
    if (i > 0) s += ' → ';
    s += CITIES[waypoints[i]]?.en || waypoints[i];
  }
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMAND MODEL
// ─────────────────────────────────────────────────────────────────────────────

const HOURLY_DEMAND = [0.1,0.05,0.03,0.02,0.05,0.15,0.5,0.85,1.0,0.9,0.7,0.6,0.5,0.55,0.6,0.65,0.7,0.85,1.0,0.9,0.7,0.5,0.3,0.15];

const CITY_WEIGHTS = { BJ:10,SH:10,GZ:8,SZ:7,CD:7,WH:6,NJ:6,HZ:5,ZZ:5,CQ:5,TJ:5,SY:4,XA:4,CS:4,JN:3,QD:3,DL:3,KM:3,FZ:3,XM:3,NN:3,GY:2,LZ:2,HH:2,XZ:3,SJZ:4,HF:4,NC:4,TS:3,CC:3,TY:3,WZ:2,SZX:2,NB:3,WY:2,WF:2,YC:2,HRB:4,GL:3,HK:6 };

function getRouteDemand(route) {
  const fromW = CITY_WEIGHTS[route.waypoints[0]] || 3;
  const toW = CITY_WEIGHTS[route.waypoints[route.waypoints.length - 1]] || 3;
  const distF = Math.min(route.distance / 500, 2);
  const wpBonus = 1 + (route.waypoints.length - 2) * 0.15;
  return (fromW + toW) * 0.3 * distF * wpBonus * demandMultiplier * HOURLY_DEMAND[Math.floor(gameState.hour)] || 0.3;
}

// ─────────────────────────────────────────────────────────────────────────────
// WAITLIST HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function addToWaitlist(entry) {
  waitlist.push(entry);
  const route = playerRoutes.find(r => r.id === entry.routeId);
  if (route) route._wl = (route._wl || 0) + 1;
  gameState.totalWaitlisted++;
}

function removeWaitlistByIds(ids) {
  if (ids.size === 0) return;
  waitlist = waitlist.filter(w => !ids.has(w.id));
  // Recount all route waitlists
  for (const r of playerRoutes) r._wl = 0;
  for (const w of waitlist) {
    const r = playerRoutes.find(r => r.id === w.routeId);
    if (r) r._wl = (r._wl || 0) + 1;
  }
}

function clearWaitlistForRoute(routeId) {
  const before = waitlist.length;
  waitlist = waitlist.filter(w => w.routeId !== routeId);
  const route = playerRoutes.find(r => r.id === routeId);
  if (route) route._wl = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO BOOKING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function autoBook() {
  for (let ri = 0; ri < playerRoutes.length; ri++) {
    const route = playerRoutes[ri];
    if (!route.active || route.trains.length === 0) continue;

    const demand = getRouteDemand(route);
    const attempts = (demand * (0.5 + Math.random())) | 0;

    for (let i = 0; i < attempts; i++) {
      const train = route.trains[(Math.random() * route.trains.length) | 0];
      if (!train) continue;

      const r = Math.random();
      const cls = r < 0.03 ? 'business' : r < 0.25 ? 'first' : 'second';
      const price = calcPrice(route.distance, cls);
      const idx = findSeatIdx(train, cls);

      if (idx >= 0) {
        const seat = train.seats[cls][idx];
        seat[0] = 1; seat[1] = 1; seat[2] = 1;

        const bid = nextId('B');
        bookings[bid] = {
          id: bid, routeId: route.id, trainId: train.id,
          cls, seatIdx: idx, price,
        };
        gameState.money += price;
        gameState.revenue += price;
        gameState.totalBookings++;
      } else if ((route._wl || 0) < MAX_WAITLIST_PER_ROUTE) {
        addToWaitlist({
          id: nextId('W'), routeId: route.id, trainId: train.id,
          cls, price,
        });
      }
    }
  }
}

// Returns Set of routeIds that had seats freed
function autoUnbook() {
  const bookingIds = Object.keys(bookings);
  if (bookingIds.length === 0) return new Set();

  const cancelRate = 0.03 + Math.random() * 0.05;
  const maxCancel = Math.max(1, Math.min((bookingIds.length * cancelRate) | 0, 5));

  const routesWithFreedSeats = new Set();

  for (let i = 0; i < maxCancel; i++) {
    const bKeys = Object.keys(bookings);
    if (bKeys.length === 0) break;
    const bid = bKeys[(Math.random() * bKeys.length) | 0];
    const b = bookings[bid];
    if (!b) continue;

    // Fast train lookup via reverse index
    const route = trainRouteIndex.get(b.trainId);
    if (route) {
      const train = route.trains.find(t => t.id === b.trainId);
      if (train) {
        const seat = train.seats[b.cls][b.seatIdx];
        seat[0] = 0; seat[1] = 0; seat[2] = 0;
        routesWithFreedSeats.add(route.id);
      }
    }

    gameState.money -= b.price;
    gameState.revenue -= b.price;
    gameState.totalCancellations++;
    delete bookings[bid];
  }

  return routesWithFreedSeats;
}

function reconcileWaitlist(routeId) {
  const route = playerRoutes.find(r => r.id === routeId);
  if (!route || route.trains.length === 0 || (route._wl || 0) === 0) return;

  const pending = [];
  for (const w of waitlist) {
    if (w.routeId === routeId) pending.push(w);
  }
  if (pending.length === 0) return;

  const fulfilledIds = new Set();
  let fulfilled = 0;

  for (let i = 0; i < pending.length; i++) {
    const w = pending[i];
    if (fulfilledIds.has(w.id)) continue;

    // Find any train with available seat in this class
    let foundTrain = null;
    for (let t = 0; t < route.trains.length; t++) {
      if (countAvailable(route.trains[t], w.cls) > 0) { foundTrain = route.trains[t]; break; }
    }
    if (!foundTrain) break;

    const idx = findSeatIdx(foundTrain, w.cls);
    const seat = foundTrain.seats[w.cls][idx];
    seat[0] = 1; seat[1] = 1; seat[2] = 1;

    const bid = nextId('B');
    bookings[bid] = {
      id: bid, routeId, trainId: foundTrain.id,
      cls: w.cls, seatIdx: idx, price: w.price,
    };
    gameState.money += w.price;
    gameState.revenue += w.price;
    gameState.totalBookings++;
    fulfilledIds.add(w.id);
    fulfilled++;
  }

  if (fulfilled > 0) {
    removeWaitlistByIds(fulfilledIds);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME TICK
// ─────────────────────────────────────────────────────────────────────────────

function gameTick() {
  if (gameState.paused) return;
  gameState.tick++;

  gameState.hour = (gameState.hour + 0.1667) % 24;
  if (gameState.tick % 6 === 0 && Math.floor(gameState.hour) === 0) gameState.day++;

  // Advance trains
  let totalCost = 0;
  for (let ri = 0; ri < playerRoutes.length; ri++) {
    const route = playerRoutes[ri];
    const costPerTrain = calcTrainCostPerTick(route.distance);
    totalCost += route.trains.length * costPerTrain;

    for (let ti = 0; ti < route.trains.length; ti++) {
      const train = route.trains[ti];
      if (!train.tripTicks) train.tripTicks = calcTripTicks(route.distance);
      if (!train.tripProgress) train.tripProgress = 0;
      train.tripProgress++;
      if (train.tripProgress >= train.tripTicks) {
        resetTrainSeats(train);
        train.tripProgress = 0;
      }
    }
  }
  gameState.money -= totalCost;
  gameState.costs += totalCost;

  demandMultiplier = 0.8 + Math.sin(gameState.tick * 0.01) * 0.4 + Math.random() * 0.3;

  // Booking
  autoBook();

  // Unbooking (every 3 ticks)
  if (gameState.tick % 3 === 0) {
    const freedRoutes = autoUnbook();
    // Only reconcile waitlists for routes that freed seats
    for (const rid of freedRoutes) {
      if ((playerRoutes.find(r => r.id === rid)?._wl || 0) > 0) {
        reconcileWaitlist(rid);
      }
    }
  }

  gameState.score = Math.max(0, Math.round(gameState.revenue - gameState.costs * 0.5));
}

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/map', (_req, res) => {
  res.json({ cities: CITIES, possibleEdges: UNIQUE_EDGES });
});

// Rebuild train→route index (call after route changes)
function rebuildTrainIndex() {
  trainRouteIndex.clear();
  for (const route of playerRoutes) {
    for (const train of route.trains) {
      trainRouteIndex.set(train.id, route);
    }
  }
}

// Main state endpoint — single call, no extra fetches needed
app.get('/api/state', (_req, res) => {
  const routeStats = new Array(playerRoutes.length);
  let totalWaitlistCount = 0;

  for (let i = 0; i < playerRoutes.length; i++) {
    const r = playerRoutes[i];
    let totalSeats = 0, totalBooked = 0;
    for (let ti = 0; ti < r.trains.length; ti++) {
      for (const cls of CLS) {
        const arr = r.trains[ti].seats[cls];
        totalSeats += arr.length;
        for (let si = 0; si < arr.length; si++) {
          if (arr[si][0] || arr[si][1] || arr[si][2]) totalBooked++;
        }
      }
    }
    const wl = r._wl || 0;
    totalWaitlistCount += wl;
    routeStats[i] = {
      id: r.id, pairId: r.pairId, waypoints: r.waypoints, distance: r.distance,
      trainCount: r.trains.length, totalSeats, totalBooked,
      occupancy: totalSeats > 0 ? Math.round(totalBooked / totalSeats * 100) : 0,
      waitlist: wl, costPerTick: calcTrainCostPerTick(r.distance),
    };
  }

  res.json({
    game: gameState,
    routes: routeStats,
    totalWaitlist: totalWaitlistCount,
  });
});

app.post('/api/route', (req, res) => {
  const waypoints = req.body.waypoints;
  if (!waypoints || waypoints.length < 2) return res.status(400).json({ error: 'Need at least 2 cities' });

  for (let i = 0; i < waypoints.length - 1; i++) {
    if (!CITIES[waypoints[i]]) return res.status(400).json({ error: `Unknown city: ${waypoints[i]}` });
    if (!hasEdge(waypoints[i], waypoints[i + 1])) {
      return res.status(400).json({ error: `No rail connection: ${CITIES[waypoints[i]].en} → ${CITIES[waypoints[i + 1]].en}` });
    }
  }

  const wpKey = waypoints.join(',');
  const wpKeyRev = [...waypoints].reverse().join(',');
  if (playerRoutes.find(r => r.waypoints.join(',') === wpKey || r.waypoints.join(',') === wpKeyRev)) {
    return res.status(400).json({ error: 'Route already exists' });
  }

  const distance = (() => {
    let total = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const d = getEdgeDistance(waypoints[i], waypoints[i + 1]);
      if (d === null) return null;
      total += d;
    }
    return total;
  })();

  const routeFwd = {
    id: 'R' + routeNum++, waypoints: [...waypoints], distance,
    trains: [], active: true, pairId: null, _wl: 0,
  };
  const routeRev = {
    id: 'R' + routeNum++, waypoints: [...waypoints].reverse(), distance,
    trains: [], active: true, pairId: routeFwd.id, _wl: 0,
  };
  routeFwd.pairId = routeRev.id;
  playerRoutes.push(routeFwd, routeRev);
  rebuildTrainIndex();

  res.json({
    status: 'SUCCESS',
    route: { id: routeFwd.id, waypoints, distance },
    reverseRoute: { id: routeRev.id, waypoints: [...waypoints].reverse(), distance },
  });
});

app.delete('/api/route/:id', (req, res) => {
  const idx = playerRoutes.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Route not found' });

  const route = playerRoutes[idx];
  const pairId = route.pairId;
  const routesToDelete = [route];

  if (pairId) {
    const pairRoute = playerRoutes.find(r => r.id === pairId);
    if (pairRoute) routesToDelete.push(pairRoute);
  }

  for (const rt of routesToDelete) {
    // Remove bookings for this route
    for (const bid of Object.keys(bookings)) {
      const b = bookings[bid];
      if (b && b.routeId === rt.id) {
        gameState.money -= b.price;
        gameState.revenue -= b.price;
        delete bookings[bid];
      }
    }
    clearWaitlistForRoute(rt.id);
    const ri = playerRoutes.indexOf(rt);
    if (ri !== -1) playerRoutes.splice(ri, 1);
  }
  rebuildTrainIndex();
  res.json({ status: 'SUCCESS' });
});

app.post('/api/route/:id/trains', (req, res) => {
  const route = playerRoutes.find(r => r.id === req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });

  const count = Math.max(0, Math.min(MAX_TRAINS_PER_ROUTE, parseInt(req.body.count) || 0));
  const current = route.trains.length;
  const diff = count - current;

  if (diff > 0) {
    const tripTicks = calcTripTicks(route.distance);
    for (let i = 0; i < diff; i++) {
      const train = { id: 'T' + ++trainNum, seats: makeSeats(), tripProgress: 0, tripTicks };
      route.trains.push(train);
      trainRouteIndex.set(train.id, route);
    }
    if (route.pairId) {
      const pairRoute = playerRoutes.find(r => r.id === route.pairId);
      if (pairRoute) {
        for (let i = 0; i < diff; i++) {
          const train = { id: 'T' + ++trainNum, seats: makeSeats(), tripProgress: 0, tripTicks };
          pairRoute.trains.push(train);
          trainRouteIndex.set(train.id, pairRoute);
        }
        reconcileWaitlist(pairRoute.id);
      }
    }
    reconcileWaitlist(route.id);
  } else if (diff < 0) {
    const removing = Math.abs(diff);
    for (let i = 0; i < removing; i++) {
      const train = route.trains.pop();
      if (!train) break;
      trainRouteIndex.delete(train.id);
      // Remove bookings for this train
      for (const bid of Object.keys(bookings)) {
        const b = bookings[bid];
        if (b && b.trainId === train.id) {
          gameState.money -= b.price;
          gameState.revenue -= b.price;
          delete bookings[bid];
        }
      }
      waitlist = waitlist.filter(w => w.trainId !== train.id);
    }
    // Recount waitlist for this route
    route._wl = waitlist.filter(w => w.routeId === route.id).length;

    if (route.pairId) {
      const pairRoute = playerRoutes.find(r => r.id === route.pairId);
      if (pairRoute) {
        for (let i = 0; i < removing; i++) {
          const train = pairRoute.trains.pop();
          if (!train) break;
          trainRouteIndex.delete(train.id);
          for (const bid of Object.keys(bookings)) {
            const b = bookings[bid];
            if (b && b.trainId === train.id) {
              gameState.money -= b.price;
              gameState.revenue -= b.price;
              delete bookings[bid];
            }
          }
          waitlist = waitlist.filter(w => w.trainId !== train.id);
        }
        pairRoute._wl = waitlist.filter(w => w.routeId === pairRoute.id).length;
      }
    }
  }

  res.json({ status: 'SUCCESS', trainCount: route.trains.length });
});

app.post('/api/reset', (_req, res) => {
  gameState = {
    money: 200000000, revenue: 0, costs: 0, tick: 0, day: 1, hour: 6,
    speed: 1, paused: false, score: 0, totalBookings: 0,
    totalCancellations: 0, totalWaitlisted: 0,
  };
  playerRoutes = [];
  bookings = {};
  waitlist = [];
  trainNum = 0;
  routeNum = 0;
  bidNum = 0;
  trainRouteIndex.clear();
  res.json({ status: 'SUCCESS' });
});

app.post('/api/speed', (req, res) => {
  const speed = Math.max(0, Math.min(20, parseInt(req.body.speed) || 1));
  gameState.speed = speed;
  gameState.paused = speed === 0;
  rescheduleTimer();
  res.json({ status: 'SUCCESS', speed, paused: gameState.paused });
});

// ─────────────────────────────────────────────────────────────────────────────
// GAME LOOP — adaptive interval based on speed
// ─────────────────────────────────────────────────────────────────────────────

let timer = null;

function rescheduleTimer() {
  if (timer) { clearInterval(timer); timer = null; }
  if (gameState.paused || gameState.speed === 0) return;

  let interval, ticksPerCall;
  if (gameState.speed <= 5) {
    interval = 500;
    ticksPerCall = gameState.speed;
  } else if (gameState.speed <= 10) {
    interval = 300;
    ticksPerCall = 3;
  } else {
    interval = 150;
    ticksPerCall = 3;
  }

  timer = setInterval(() => {
    if (gameState.paused) return;
    for (let i = 0; i < ticksPerCall; i++) gameTick();
  }, interval);
}

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚄  12306 Game running on port ${PORT}`);
});
rescheduleTimer();
