export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // seconds
  url?: string;
  tags: string[];
  addedBy: string;
  addedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type RadioStationStatus = "live" | "offline";

export interface RadioStation {
  id: string;
  name: string;
  description: string;
  currentTrack?: Track;
  queue: Track[];
  listeners: number;
  status: RadioStationStatus;
}
