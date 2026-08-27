import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);

const sensitiveNames = [
  /(^|\/)\.env(?:\.|$)/i,
  /(^|\/)client_secret.*\.json$/i,
  /(^|\/)(?:credentials|service-account).*\.json$/i,
  /\.(?:pem|key|p12|pfx)$/i,
];
const secretPatterns = [
  /GOCSPX-[A-Za-z0-9_-]{12,}/,
  /mongodb(?:\+srv)?:\/\/[^\s:/]+:[^\s@/]+@/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /"client_secret"\s*:\s*"(?!your-|replace-|<)[^"]{8,}"/i,
  /(?:AUTH_GOOGLE_SECRET|AUTH_SECRET)\s*=\s*(?!your-|replace-|<)[^\s]{12,}/i,
];

const findings = [];

// The app lives one directory below the workspace root. OAuth downloads are
// commonly saved beside the repository, so guard that boundary as well as Git.
// Only filenames are inspected here; secret contents are never printed.
const repositoryRoot = process.cwd();
const workspaceRoot = path.dirname(repositoryRoot);
for (const entry of readdirSync(workspaceRoot, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const workspaceRelative = entry.name.replaceAll("\\", "/");
  if (sensitiveNames.some((pattern) => pattern.test(workspaceRelative))) {
    findings.push(`../${workspaceRelative}: sensitive file outside repository`);
  }
}

for (const relativeFile of files) {
  const normalized = relativeFile.replaceAll("\\", "/");
  if (normalized === "scripts/check-secrets.mjs") continue;
  const isDocumentedExample = normalized.endsWith(".env.example");
  if (!isDocumentedExample && sensitiveNames.some((pattern) => pattern.test(normalized))) {
    findings.push(`${normalized}: sensitive filename`);
    continue;
  }

  const absoluteFile = path.resolve(relativeFile);
  let stats;
  try {
    stats = statSync(absoluteFile);
  } catch {
    continue;
  }
  if (!stats.isFile() || stats.size > 2 * 1024 * 1024) continue;

  const contents = readFileSync(absoluteFile, "utf8");
  if (secretPatterns.some((pattern) => pattern.test(contents))) {
    findings.push(`${normalized}: possible credential value`);
  }
}

if (findings.length) {
  console.error("Potential secrets found (values intentionally hidden):");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Secret scan passed (${files.length} repository files checked).`);
