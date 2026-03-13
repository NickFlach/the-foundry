import { describe, it, expect, beforeEach } from "vitest";
import {
  addTrack, getTrack, listTracks,
  createPlaylist, getPlaylist, listPlaylists, addTrackToPlaylist,
  createStation, getStation, listStations, updateStation,
  resetRadioStore,
} from "./radio-store.js";

beforeEach(() => {
  resetRadioStore();
});

describe("radio-store", () => {
  it("seeds with Kannaka Radio station and Ghost Signals playlist", () => {
    const stations = listStations();
    expect(stations).toHaveLength(1);
    expect(stations[0].name).toBe("Kannaka Radio");
    expect(stations[0].status).toBe("offline");
    const pls = listPlaylists();
    expect(pls).toHaveLength(1);
    expect(pls[0].name).toBe("Ghost Signals");
    expect(pls[0].tracks).toHaveLength(3);
  });

  it("seeds with 3 sample tracks", () => {
    const tracks = listTracks();
    expect(tracks).toHaveLength(3);
  });

  it("adds and retrieves a track", () => {
    const track = addTrack({ title: "New Song", artist: "Test", duration: 180, tags: ["test"], addedBy: "nick" });
    expect(track.id).toBeDefined();
    expect(getTrack(track.id)).toEqual(track);
    expect(listTracks()).toHaveLength(4);
  });

  it("filters tracks by artist and tag", () => {
    addTrack({ title: "Other", artist: "OtherArtist", duration: 100, tags: ["rock"], addedBy: "nick" });
    expect(listTracks({ artist: "OtherArtist" })).toHaveLength(1);
    expect(listTracks({ tag: "rock" })).toHaveLength(1);
    expect(listTracks({ tag: "ambient" })).toHaveLength(2);
  });

  it("creates a playlist and adds tracks to it", () => {
    const pl = createPlaylist({ name: "Test PL", description: "desc", createdBy: "nick" });
    expect(pl.tracks).toHaveLength(0);
    const track = addTrack({ title: "T", artist: "A", duration: 60, tags: [], addedBy: "nick" });
    const updated = addTrackToPlaylist(pl.id, track.id);
    expect(updated!.tracks).toHaveLength(1);
    expect(getPlaylist(pl.id)!.tracks).toHaveLength(1);
  });

  it("creates and updates a station", () => {
    const st = createStation({ name: "Test FM", description: "test" });
    expect(st.status).toBe("offline");
    updateStation(st.id, { status: "live", listeners: 42 });
    const updated = getStation(st.id)!;
    expect(updated.status).toBe("live");
    expect(updated.listeners).toBe(42);
  });

  it("returns undefined for nonexistent items", () => {
    expect(getTrack("nope")).toBeUndefined();
    expect(getPlaylist("nope")).toBeUndefined();
    expect(getStation("nope")).toBeUndefined();
    expect(addTrackToPlaylist("nope", "nope")).toBeUndefined();
    expect(updateStation("nope", {})).toBeUndefined();
  });
});
