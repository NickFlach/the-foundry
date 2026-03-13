import { Router } from "express";
import {
  addTrack, getTrack, listTracks,
  createPlaylist, getPlaylist, listPlaylists, addTrackToPlaylist,
  getStation, listStations,
} from "@the-foundry/db";

const router = Router();

// GET /api/radio/stations
router.get("/stations", (_req, res) => {
  res.json(listStations());
});

// GET /api/radio/stations/:id
router.get("/stations/:id", (req, res) => {
  const station = getStation(req.params.id);
  if (!station) return res.status(404).json({ error: "Station not found" });
  res.json(station);
});

// GET /api/radio/playlists
router.get("/playlists", (_req, res) => {
  res.json(listPlaylists());
});

// GET /api/radio/playlists/:id
router.get("/playlists/:id", (req, res) => {
  const pl = getPlaylist(req.params.id);
  if (!pl) return res.status(404).json({ error: "Playlist not found" });
  res.json(pl);
});

// POST /api/radio/tracks
router.post("/tracks", (req, res) => {
  const { title, artist, duration, url, tags, addedBy } = req.body ?? {};
  if (!title || !artist) {
    return res.status(400).json({ error: "title and artist are required" });
  }
  const track = addTrack({
    title,
    artist,
    duration: duration ?? 0,
    url,
    tags: tags ?? [],
    addedBy: addedBy ?? "anonymous",
  });
  res.status(201).json(track);
});

// POST /api/radio/playlists
router.post("/playlists", (req, res) => {
  const { name, description, createdBy } = req.body ?? {};
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }
  const pl = createPlaylist({ name, description: description ?? "", createdBy: createdBy ?? "anonymous" });
  res.status(201).json(pl);
});

// POST /api/radio/playlists/:id/tracks
router.post("/playlists/:id/tracks", (req, res) => {
  const { trackId } = req.body ?? {};
  if (!trackId) {
    return res.status(400).json({ error: "trackId is required" });
  }
  const pl = addTrackToPlaylist(req.params.id, trackId);
  if (!pl) return res.status(404).json({ error: "Playlist or track not found" });
  res.json(pl);
});

export { router as radioRouter };
