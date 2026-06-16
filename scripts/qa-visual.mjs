import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const defaultUrl = "http://127.0.0.1:5173/?q=Find+remote+BCBA+contract+roles+over+%2470%2Fhr+with+sign-on+bonus";
const targetUrl = process.argv[2] ?? defaultUrl;
const screenshotDir = "/tmp/role-atlas-qa";
const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 720 },
  { name: "desktop-1440", width: 1440, height: 1024 },
  { name: "wide-1920", width: 1920, height: 1080 }
];

await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch();
const failures = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const consoleIssues = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleIssues.push(message.text());
      }
    });
    page.on("pageerror", (error) => consoleIssues.push(error.message));

    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForSelector("[data-testid^='job-card-']", { timeout: 15_000 });
    await exerciseFilters(page);
    await checkPage(page, viewport.name, failures);

    const firstCard = page.locator("[data-testid^='job-card-']").first();
    await firstCard.click();
    await page.getByRole("dialog").waitFor({ timeout: 10_000 });
    await checkPage(page, `${viewport.name}-modal`, failures);
    await page.getByRole("button", { name: /Close/i }).click();
    await page.getByRole("dialog").waitFor({ state: "detached", timeout: 10_000 });

    await page.screenshot({ path: `${screenshotDir}/${viewport.name}.png`, fullPage: true });

    if (consoleIssues.length) {
      failures.push(`${viewport.name}: console errors: ${consoleIssues.join(" | ")}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Visual QA failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Visual QA passed across ${viewports.length} viewport sizes.`);
console.log(`Screenshots saved to ${screenshotDir}`);

async function exerciseFilters(page) {
  await page.getByTestId("filter-role").click();
  await page.getByRole("menuitem", { name: "PMHNP", exact: true }).click();
  await page.waitForSelector("[data-testid*='pmhnp']", { timeout: 10_000 });

  await page.getByTestId("filter-role").click();
  await page.getByRole("menuitem", { name: "BCBA", exact: true }).click();
  await page.waitForSelector("[data-testid*='bcba']", { timeout: 10_000 });

  await page.getByTestId("filter-pay").click();
  await page.getByRole("menuitem", { name: "$70+/hr", exact: true }).click();
  await page.waitForSelector("[data-testid^='job-card-']", { timeout: 10_000 });

  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".results-header strong")?.textContent?.includes("total in search"));
  await page.getByRole("button", { name: "Reset", exact: true }).click();

  await page.getByTestId("filter-more").click();
  await page.getByRole("menuitem", { name: "Show all BCBA roles", exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll("[data-testid^='job-card-']").length >= 10);
}

async function checkPage(page, context, failures) {
  const pageIssues = await page.evaluate(() => {
    const issues = [];
    const documentWidth = document.documentElement.scrollWidth;
    if (documentWidth > window.innerWidth + 2) {
      issues.push(`document width ${documentWidth}px exceeds viewport ${window.innerWidth}px`);
    }

    const selectors = [
      ".filter-select",
      ".filter-menu button",
      ".job-card",
      ".job-card h2",
      ".match-badge",
      ".pay-row",
      ".benefit-row span",
      ".source-row",
      ".remote-label",
      ".metric-card",
      ".chart-card",
      ".detail-modal",
      ".detail-top",
      ".detail-actions button",
      ".detail-actions a",
      ".fact",
      ".overview-panel",
      ".detail-side section",
      ".insight"
    ];

    for (const element of document.querySelectorAll(selectors.join(","))) {
      const htmlElement = element;
      const rect = htmlElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        continue;
      }
      if (htmlElement.scrollWidth > Math.ceil(htmlElement.clientWidth) + 2) {
        const text = htmlElement.textContent?.trim().replace(/\s+/g, " ").slice(0, 90) ?? "";
        issues.push(`${selectorName(htmlElement)} overflows horizontally: "${text}"`);
      }
    }

    for (const anchor of document.querySelectorAll("a[href]")) {
      const rawHref = anchor.getAttribute("href") ?? "";
      if (!rawHref || rawHref === "#" || rawHref.startsWith("javascript:")) {
        issues.push(`invalid href: ${rawHref || "(empty)"}`);
        continue;
      }
      const parsed = new URL(rawHref, window.location.href);
      if (parsed.hostname === "example.com" || parsed.hostname.endsWith(".example.com")) {
        issues.push(`placeholder link host found: ${parsed.href}`);
      }
      if (anchor.getAttribute("target") === "_blank" && !anchor.getAttribute("rel")?.includes("noreferrer")) {
        issues.push(`external link missing rel=noreferrer: ${parsed.href}`);
      }
    }

    return issues.slice(0, 50);

    function selectorName(element) {
      const className = typeof element.className === "string" ? element.className.trim().replace(/\s+/g, ".") : "";
      return className ? `.${className}` : element.tagName.toLowerCase();
    }
  });

  for (const issue of pageIssues) {
    failures.push(`${context}: ${issue}`);
  }
}
