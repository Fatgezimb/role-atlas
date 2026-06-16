import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const fixturePath = new URL("services/worker/role_atlas_worker/fixtures/sample_jobs.json", root);
const sourcePaths = [
  "apps/web/src/data/demoJobs.ts",
  "apps/web/src/components/JobDetailModal.tsx",
  "apps/web/src/components/ResultsPanel.tsx",
  "services/worker/role_atlas_worker/fixtures/sample_jobs.json"
];

const errors = [];

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
for (const job of fixture) {
  validateUrl(job.source_url, `${job.external_id}.source_url`);
}

for (const relativePath of sourcePaths) {
  const text = await readFile(new URL(relativePath, root), "utf8");
  if (text.includes("example.com")) {
    errors.push(`${relativePath} still contains example.com`);
  }
  for (const href of text.matchAll(/href=["']([^"']*)["']/g)) {
    if (!href[1] || href[1] === "#" || href[1].startsWith("javascript:")) {
      errors.push(`${relativePath} contains a non-working href: ${href[1] || "(empty)"}`);
    }
  }
  for (const anchor of text.matchAll(/<a\b[^>]*>/g)) {
    const tag = anchor[0];
    if (/target=["']_blank["']/.test(tag) && !/rel=["'][^"']*\bnoreferrer\b[^"']*["']/.test(tag)) {
      errors.push(`${relativePath} has an external anchor missing rel="noreferrer": ${tag}`);
    }
  }
}

if (errors.length) {
  console.error(`Link QA failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Link QA passed: ${fixture.length} fixture job URLs and frontend anchors are valid.`);

function validateUrl(value, context) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") {
      errors.push(`${context} must use https: ${value}`);
    }
    if (parsed.hostname === "example.com" || parsed.hostname.endsWith(".example.com")) {
      errors.push(`${context} uses a placeholder host: ${value}`);
    }
  } catch {
    errors.push(`${context} is not a valid URL: ${value}`);
  }
}
