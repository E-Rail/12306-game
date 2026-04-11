# 🚄 12306 Railway Tycoon

A web-based train ticket booking strategy game. Manage a Chinese railway network — create routes across real HSR lines, deploy trains, and optimize revenue. The game auto-books and unbooks passengers each tick using realistic Chinese HSR pricing.

## Quick Start

```bash
npm install
npm start
# Open http://localhost:3000
```

## How to Play

1. **Click cities** on the map to build a route — each stop must connect via real rail lines
2. **Create the route** — it auto-creates both directions (bidirectional)
3. **Add trains** with the slider — train creation is FREE, but you pay running costs per tick
4. **Watch revenue grow** as passengers auto-book seats based on demand curves

### Ticket Classes & Pricing (real 12306 rates)

| Class | Price | Seats/Train |
|-------|-------|-------------|
| Business | ¥1.46/km | 8 |
| First | ¥0.73/km | 28 |
| Second | ¥0.46/km | 80 |

- Starting capital: **¥200,000,000**
- Running cost: **¥0.1/km/tick** per train
- Max trains per route: **50**
- Speed: **1x to 20x**, or pause

## Map

**40 Chinese cities** with **60 real HSR connections** — from Harbin to Hong Kong, Ürümqi to Shanghai.

Geographic projection keeps cities in their real-world positions. Key lines include:

- **京沪高铁** Beijing → Shanghai (1,318km)
- **京广高铁** Beijing → Guangzhou (2,298km)
- **沪昆高铁** Shanghai → Kunming (2,252km)
- **西武高铁** Xi'an → Wuhan (657km)
- **贵广高铁** Guiyang → Guilin → Guangzhou (857km)
- **广深港高铁** Guangzhou → Shenzhen → Hong Kong (180km)

## Game Mechanics

- **Auto-booking**: Demand varies by time of day, city importance, and route distance
- **Waitlist**: When trains are full, passengers queue and get confirmed when seats free up
- **Trip completion**: Trains reset seats after completing a trip (simulates arrival/departure)
- **Auto-cancellation**: 3-8% of bookings cancel each tick, freeing seats for waitlisted passengers
- **Score**: Based on revenue minus running costs

## Tech Stack

- **Backend**: Express.js — game engine, auto-booking, JSON API
- **Frontend**: Vanilla JS, Canvas 2D API — interactive map with animated trains
- **No frameworks** — single file server, single file client
- **Dependencies**: express, cors

## Project Structure

```
server.js          # Game engine, map data, API routes
public/
  index.html       # Canvas map, route builder, route list
package.json
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/map` | Map data (cities + edges) |
| GET | `/api/state` | Full game state |
| POST | `/api/route` | Create a route |
| DELETE | `/api/route/:id` | Remove a route |
| POST | `/api/route/:id/trains` | Set train count |
| POST | `/api/speed` | Set game speed (0-20) |
| POST | `/api/reset` | Reset game |

## License

MIT
