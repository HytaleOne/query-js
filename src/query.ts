import dgram from 'node:dgram';
import {
  buildRequest,
  parseBasicResponse,
  parseFullResponse,
  TYPE_BASIC,
  TYPE_FULL,
} from './protocol.js';
import type { QueryOptions, ServerInfo, ServerInfoFull } from './types.js';

const DEFAULT_TIMEOUT = 5000;

/**
 * Send a UDP query and wait for response.
 */
function sendQuery(
  host: string,
  port: number,
  type: number,
  timeout: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');
    let timeoutHandle: NodeJS.Timeout;
    let closed = false;

    const cleanup = () => {
      if (closed) return;
      closed = true;
      clearTimeout(timeoutHandle);
      try {
        socket.close();
      } catch {
        // Already closed
      }
    };

    socket.on('message', (msg) => {
      cleanup();
      resolve(msg);
    });

    socket.on('error', (err) => {
      cleanup();
      reject(err);
    });

    timeoutHandle = setTimeout(() => {
      cleanup();
      reject(new Error(`Query timeout after ${timeout}ms`));
    }, timeout);

    const request = buildRequest(type);
    socket.send(request, port, host, (err) => {
      if (err) {
        cleanup();
        reject(err);
      }
    });
  });
}

/**
 * Query a Hytale server for information.
 *
 * @param host - Server hostname or IP address
 * @param port - Server port (default: 5520)
 * @param options - Query options
 * @returns Server information (full if options.full is true)
 *
 * @example
 * ```typescript
 * // Basic query
 * const info = await query('play.example.com', 5520);
 * console.log(`${info.serverName}: ${info.currentPlayers}/${info.maxPlayers}`);
 *
 * // Full query (includes players + plugins)
 * const full = await query('play.example.com', 5520, { full: true });
 * console.log('Players:', full.players.map(p => p.name).join(', '));
 * ```
 */
export async function query(
  host: string,
  port?: number,
  options?: QueryOptions & { full?: false }
): Promise<ServerInfo>;
export async function query(
  host: string,
  port: number,
  options: QueryOptions & { full: true }
): Promise<ServerInfoFull>;
export async function query(
  host: string,
  port = 5520,
  options: QueryOptions & { full?: boolean } = {}
): Promise<ServerInfo | ServerInfoFull> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const type = options.full ? TYPE_FULL : TYPE_BASIC;
  const response = await sendQuery(host, port, type, timeout);

  if (options.full) {
    return parseFullResponse(response);
  }
  return parseBasicResponse(response);
}
