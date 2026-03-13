import type { Command } from "commander";
import { FoundryClient } from "../client.js";
import { formatTable } from "../formatters.js";

export function registerRadioCommands(program: Command): void {
  const radio = program.command("radio").description("Kannaka Radio — community audio");

  radio
    .command("stations")
    .description("List radio stations")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.listStations();
        if (opts.pretty) {
          console.log(formatTable(data.map((s: any) => ({
            id: s.id?.substring(0, 8) ?? "", name: s.name, status: s.status, listeners: s.listeners,
          })), ["id", "name", "status", "listeners"]));
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });

  radio
    .command("station")
    .description("Get station details")
    .argument("<id>", "Station ID")
    .option("--pretty", "Human-readable output")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const s = await client.getStation(id);
        if (opts.pretty) {
          console.log(`${s.name} [${s.status}] — ${s.listeners} listeners`);
          if (s.currentTrack) console.log(`  Now playing: ${s.currentTrack.title} by ${s.currentTrack.artist}`);
          if (s.queue?.length) console.log(`  Queue: ${s.queue.length} tracks`);
        } else {
          console.log(JSON.stringify(s, null, 2));
        }
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });

  radio
    .command("playlists")
    .description("List playlists")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.listRadioPlaylists();
        if (opts.pretty) {
          console.log(formatTable(data.map((p: any) => ({
            id: p.id?.substring(0, 8) ?? "", name: p.name, tracks: p.tracks?.length ?? 0,
          })), ["id", "name", "tracks"]));
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });

  radio
    .command("playlist")
    .description("Get playlist details")
    .argument("<id>", "Playlist ID")
    .option("--pretty", "Human-readable output")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const p = await client.getRadioPlaylist(id);
        if (opts.pretty) {
          console.log(`${p.name} — ${p.tracks?.length ?? 0} tracks`);
          for (const t of p.tracks ?? []) console.log(`  • ${t.title} by ${t.artist} (${t.duration}s)`);
        } else {
          console.log(JSON.stringify(p, null, 2));
        }
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });

  radio
    .command("add-track")
    .description("Add a track")
    .requiredOption("--title <title>", "Track title")
    .requiredOption("--artist <artist>", "Artist name")
    .option("--duration <seconds>", "Duration in seconds", "0")
    .option("--tags <tags>", "Comma-separated tags", "")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const tags = opts.tags ? opts.tags.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        const data = await client.addTrack({ title: opts.title, artist: opts.artist, duration: parseInt(opts.duration, 10), tags });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });

  radio
    .command("create-playlist")
    .description("Create a playlist")
    .argument("<name>", "Playlist name")
    .option("--desc <description>", "Description", "")
    .action(async (name, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.createRadioPlaylist({ name, description: opts.desc });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });
}
