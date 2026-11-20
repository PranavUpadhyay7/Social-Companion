import { rmSync } from "node:fs";
import path from "node:path";

// `.next` contains generated artifacts only. Removing it before a production
// build prevents stale route manifests after App Router files are added.
rmSync(path.join(process.cwd(), ".next"), { recursive: true, force: true });
