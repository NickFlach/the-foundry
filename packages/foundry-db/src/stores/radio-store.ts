import type { Track, Playlist, RadioStation, RadioStationStatus } from "@the-foundry/shared";
import crypto from "crypto";

const tracks = new Map<string, Track>();
const playlists = new Map<string, Playlist>();
const stations = new Map<string, RadioStation>();

function now(): string {
  return new Date().toISOString();
}

function seed(): void {
  // Sample tracks
  const t1: Track = { id: crypto.randomUUID(), title: "Ghost Signal Alpha", artist: "Kannaka", duration: 312, tags: ["ambient", "ghost"], addedBy: "nick", addedAt: now() };
  const t2: Track = { id: crypto.randomUUID(), title: "Void Transmission", artist: "Kannaka", duration: 245, tags: ["ambient", "transmission"], addedBy: "nick", addedAt: now() };
  const t3: Track = { id: crypto.randomUUID(), title: "Wave Function Collapse", artist: "Kannaka", duration: 198, tags: ["experimental", "consciousness"], addedBy: "nick", addedAt: now() };
  tracks.set(t1.id, t1);
  tracks.set(t2.id, t2);
  tracks.set(t3.id, t3);

  // Playlist
  const pl: Playlist = {
    id: crypto.randomUUID(),
    name: "Ghost Signals",
    description: "Transmissions from the void",
    tracks: [t1, t2, t3],
    createdBy: "nick",
    createdAt: now(),
    updatedAt: now(),
  };
  playlists.set(pl.id, pl);

  // Station
  const st: RadioStation = {
    id: crypto.randomUUID(),
    name: "Kannaka Radio",
    description: "Broadcasting from the void",
    queue: [],
    listeners: 0,
    status: "offline",
  };
  stations.set(st.id, st);
}

seed();

// Tracks
export function addTrack(data: Omit<Track, "id" | "addedAt">): Track {
  const track: Track = { ...data, id: crypto.randomUUID(), addedAt: now() };
  tracks.set(track.id, track);
  return track;
}

export function getTrack(id: string): Track | undefined {
  return tracks.get(id);
}

export function listTracks(filters?: { artist?: string; tag?: string }): Track[] {
  let result = Array.from(tracks.values());
  if (filters?.artist) result = result.filter((t) => t.artist === filters.artist);
  if (filters?.tag) result = result.filter((t) => t.tags.includes(filters.tag!));
  return result;
}

// Playlists
export function createPlaylist(data: { name: string; description: string; createdBy: string }): Playlist {
  const pl: Playlist = {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description,
    tracks: [],
    createdBy: data.createdBy,
    createdAt: now(),
    updatedAt: now(),
  };
  playlists.set(pl.id, pl);
  return pl;
}

export function getPlaylist(id: string): Playlist | undefined {
  return playlists.get(id);
}

export function listPlaylists(): Playlist[] {
  return Array.from(playlists.values());
}

export function addTrackToPlaylist(playlistId: string, trackId: string): Playlist | undefined {
  const pl = playlists.get(playlistId);
  const track = tracks.get(trackId);
  if (!pl || !track) return undefined;
  pl.tracks.push(track);
  pl.updatedAt = now();
  return pl;
}

// Stations
export function createStation(data: { name: string; description: string }): RadioStation {
  const st: RadioStation = {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description,
    queue: [],
    listeners: 0,
    status: "offline",
  };
  stations.set(st.id, st);
  return st;
}

export function getStation(id: string): RadioStation | undefined {
  return stations.get(id);
}

export function listStations(): RadioStation[] {
  return Array.from(stations.values());
}

export function updateStation(id: string, update: { currentTrack?: Track; queue?: Track[]; status?: RadioStationStatus; listeners?: number }): RadioStation | undefined {
  const st = stations.get(id);
  if (!st) return undefined;
  if (update.currentTrack !== undefined) st.currentTrack = update.currentTrack;
  if (update.queue !== undefined) st.queue = update.queue;
  if (update.status !== undefined) st.status = update.status;
  if (update.listeners !== undefined) st.listeners = update.listeners;
  return st;
}

export function resetRadioStore(): void {
  tracks.clear();
  playlists.clear();
  stations.clear();
  seed();
}
