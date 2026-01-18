# @hytaleone/query

[![npm version](https://img.shields.io/npm/v/@hytaleone/query.svg)](https://www.npmjs.com/package/@hytaleone/query)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Query Hytale servers using the UDP query protocol. Get server status, player count, player list, and plugin information.

## Features

- **Server Status** - Get server name, MOTD, version, player count
- **Player List** - Retrieve online players with names and UUIDs
- **Plugin List** - See installed plugins with versions
- **Zero dependencies** - Uses only Node.js built-in modules
- **TypeScript** - Full type definitions included
- **Dual format** - Works with both ESM and CommonJS

## Installation

```bash
npm install @hytaleone/query
```

## Usage

```typescript
import { query } from '@hytaleone/query';

// Basic query
const info = await query('play.example.com', 5520);
console.log(`${info.serverName}: ${info.currentPlayers}/${info.maxPlayers}`);

// Full query - includes players and plugins
const full = await query('play.example.com', 5520, { full: true });
console.log('Players:', full.players.map(p => p.name).join(', '));
console.log('Plugins:', full.plugins.map(p => p.id).join(', '));
```

## API

### query(host, port?, options?)

Query a server for information.

```typescript
const info = await query('localhost', 5520, {
  timeout: 5000,
  full: true
});
```

**Options:**
- `timeout` - Query timeout in milliseconds (default: 5000)
- `full` - Include players and plugins (default: false)

**Returns `ServerInfo`:**
- `serverName` - Server display name
- `motd` - Message of the day
- `currentPlayers` - Current player count
- `maxPlayers` - Maximum player capacity
- `hostPort` - Server port
- `version` - Server version
- `protocolVersion` - Protocol version number
- `protocolHash` - Protocol hash

**With `full: true`, also returns:**
- `players` - Array of `{ name, uuid }`
- `plugins` - Array of `{ id, version, enabled }`

## Requirements

- Node.js >= 18
- Server must have the [HytaleOne Query Plugin](https://github.com/hytaleone/hytale-one-query-plugin) installed

## License

MIT

## Related

- [@hytaleone/votifier](https://www.npmjs.com/package/@hytaleone/votifier) - Send votes to Hytale and Minecraft servers

---

**[hytale.one](https://hytale.one/)** - Discover Hytale Servers
