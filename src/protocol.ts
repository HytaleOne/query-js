import type { Player, Plugin, ServerInfo, ServerInfoFull } from './types.js';

// Protocol constants
export const REQUEST_MAGIC = Buffer.from('HYQUERY\0', 'ascii');
export const RESPONSE_MAGIC = Buffer.from('HYREPLY\0', 'ascii');
export const TYPE_BASIC = 0x00;
export const TYPE_FULL = 0x01;

/**
 * Build a query request packet.
 */
export function buildRequest(type: number): Buffer {
  const buf = Buffer.alloc(REQUEST_MAGIC.length + 1);
  REQUEST_MAGIC.copy(buf, 0);
  buf[REQUEST_MAGIC.length] = type;
  return buf;
}

/**
 * Buffer reader helper for parsing responses.
 */
class BufferReader {
  private offset = 0;

  constructor(private buf: Buffer) {}

  readBytes(length: number): Buffer {
    const slice = this.buf.subarray(this.offset, this.offset + length);
    this.offset += length;
    return slice;
  }

  readUInt16LE(): number {
    const value = this.buf.readUInt16LE(this.offset);
    this.offset += 2;
    return value;
  }

  readInt32LE(): number {
    const value = this.buf.readInt32LE(this.offset);
    this.offset += 4;
    return value;
  }

  readBigInt64BE(): bigint {
    const value = this.buf.readBigInt64BE(this.offset);
    this.offset += 8;
    return value;
  }

  readBoolean(): boolean {
    return this.buf[this.offset++] !== 0;
  }

  readString(): string {
    const length = this.readUInt16LE();
    const bytes = this.readBytes(length);
    return bytes.toString('utf8');
  }

  readUUID(): string {
    const msb = this.readBigInt64BE();
    const lsb = this.readBigInt64BE();
    return formatUUID(msb, lsb);
  }

  get remaining(): number {
    return this.buf.length - this.offset;
  }
}

/**
 * Format UUID from most/least significant bits.
 */
function formatUUID(msb: bigint, lsb: bigint): string {
  const toHex = (n: bigint): string => {
    if (n < 0n) {
      n = BigInt.asUintN(64, n);
    }
    return n.toString(16).padStart(16, '0');
  };

  const hex = toHex(msb) + toHex(lsb);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Validate response magic bytes.
 */
export function validateResponse(buf: Buffer): boolean {
  if (buf.length < RESPONSE_MAGIC.length + 1) {
    return false;
  }
  return buf.subarray(0, RESPONSE_MAGIC.length).equals(RESPONSE_MAGIC);
}

/**
 * Parse a basic query response.
 */
export function parseBasicResponse(buf: Buffer): ServerInfo {
  if (!validateResponse(buf)) {
    throw new Error('Invalid response: magic mismatch');
  }

  const reader = new BufferReader(buf);

  // Skip magic
  reader.readBytes(RESPONSE_MAGIC.length);

  // Skip type
  reader.readBytes(1);

  return {
    serverName: reader.readString(),
    motd: reader.readString(),
    currentPlayers: reader.readInt32LE(),
    maxPlayers: reader.readInt32LE(),
    hostPort: reader.readUInt16LE(),
    version: reader.readString(),
    protocolVersion: reader.readInt32LE(),
    protocolHash: reader.readString(),
  };
}

/**
 * Parse a full query response.
 */
export function parseFullResponse(buf: Buffer): ServerInfoFull {
  if (!validateResponse(buf)) {
    throw new Error('Invalid response: magic mismatch');
  }

  const reader = new BufferReader(buf);

  // Skip magic
  reader.readBytes(RESPONSE_MAGIC.length);

  // Skip type
  reader.readBytes(1);

  // Base info
  const serverName = reader.readString();
  const motd = reader.readString();
  const currentPlayers = reader.readInt32LE();
  const maxPlayers = reader.readInt32LE();
  const hostPort = reader.readUInt16LE();
  const version = reader.readString();
  const protocolVersion = reader.readInt32LE();
  const protocolHash = reader.readString();

  // Player list
  const playerCount = reader.readInt32LE();
  const players: Player[] = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({
      name: reader.readString(),
      uuid: reader.readUUID(),
    });
  }

  // Plugin list
  const pluginCount = reader.readInt32LE();
  const plugins: Plugin[] = [];
  for (let i = 0; i < pluginCount; i++) {
    plugins.push({
      id: reader.readString(),
      version: reader.readString(),
      enabled: reader.readBoolean(),
    });
  }

  return {
    serverName,
    motd,
    currentPlayers,
    maxPlayers,
    hostPort,
    version,
    protocolVersion,
    protocolHash,
    players,
    plugins,
  };
}
