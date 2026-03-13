import { app } from "./app.js";
import { seedKnowledgeStore } from "@the-foundry/db";

// Seed knowledge commons with starter articles
seedKnowledgeStore();

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`🔥 The Foundry API running on http://localhost:${PORT}`);
});
