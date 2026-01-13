/**
 * Basic server information returned by a basic query.
 */
export interface ServerInfo {
  /** Server display name */
  serverName: string;
  /** Message of the day */
  motd: string;
  /** Current number of players online */
  currentPlayers: number;
  /** Maximum player capacity */
  maxPlayers: number;
  /** Server port */
  hostPort: number;
  /** Server version string */
  version: string;
  /** Protocol version number */
  protocolVersion: number;
  /** Protocol hash string */
  protocolHash: string;
}

/**
 * Player information included in full query response.
 */
export interface Player {
  /** Player username */
  name: string;
  /** Player UUID in standard format */
  uuid: string;
}

/**
 * Plugin information included in full query response.
 */
export interface Plugin {
  /** Plugin identifier (e.g. "HytaleOne:Query") */
  id: string;
  /** Plugin version string */
  version: string;
  /** Whether the plugin is enabled */
  enabled: boolean;
}

/**
 * Full server information including player and plugin lists.
 */
export interface ServerInfoFull extends ServerInfo {
  /** List of online players */
  players: Player[];
  /** List of installed plugins */
  plugins: Plugin[];
}

/**
 * Options for query function.
 */
export interface QueryOptions {
  /** Timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Request full info including players and plugins (default: false) */
  full?: boolean;
}
