import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "@playwright/test";

const HOST = "127.0.0.1";
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const SERVER_TIMEOUT_MS = 30_000;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForServerReady(baseUrl: string, timeoutMs: number): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.ok || response.status === 304) {
        return;
      }
    } catch (_error) {
      // Keep polling until the preview server is ready.
    }
    await delay(300);
  }

  throw new Error(`预览服务未能在 ${timeoutMs}ms 内启动：${baseUrl}`);
}

async function isVisible(page: import("@playwright/test").Page, selector: string): Promise<boolean> {
  try {
    return await page.locator(selector).isVisible();
  } catch {
    return false;
  }
}

async function runChecks(): Promise<void> {
  console.log("[e2e] launching browser");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();

    console.log("[e2e] deep link scenario");
    await page.goto(`${BASE_URL}/#/d/marketing/market-research`);
    await page.locator("#modal").waitFor({ state: "visible", timeout: 15_000 });
    assert(
      (await page.locator("#modal-content").textContent())?.includes("市场调研代理"),
      "深链打开后没有看到“市场调研代理”场景"
    );

    console.log("[e2e] invalid route");
    await page.goto(`${BASE_URL}/#/d/not-a-real-room/ghost-scenario`);
    await page.locator("#route-error-screen").waitFor({ state: "visible", timeout: 15_000 });
    assert(
      (await page.locator("#route-error-title").textContent())?.includes("这个场景链接不存在"),
      "非法深链没有进入友好错误页"
    );

    console.log("[e2e] in-app search");
    await page.goto(`${BASE_URL}/#/d/marketing`);
    await page.locator("#modal").waitFor({ state: "visible", timeout: 15_000 });
    await page.keyboard.press("Escape");
    await page.locator("#modal").waitFor({ state: "hidden", timeout: 15_000 });
    await page.keyboard.press("/");
    await page.locator("#search-overlay").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#search-input").fill("市场调研");
    await page.locator("#search-results .search-result").first().waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#search-results .search-result", { hasText: "市场调研代理" }).click();
    assert(
      /#\/d\/marketing\/market-research$/.test(page.url()),
      "搜索跳转后 URL 没有进入市场调研深链"
    );
    await page.locator("#modal").waitFor({ state: "visible", timeout: 15_000 });

    console.log("[e2e] start screen flow");
    const startPage = await browser.newPage();
    await startPage.goto(BASE_URL);
    await startPage.locator("#start-language-en").click();
    await startPage.locator("#start-button").waitFor({ state: "visible", timeout: 15_000 });
    await startPage.waitForFunction(() => {
      const button = document.querySelector<HTMLButtonElement>("#start-button");
      return Boolean(button && !button.disabled);
    }, undefined, { timeout: 15_000 });
    await startPage.locator("#start-button").click();
    await startPage.waitForFunction(
      () => !document.body.classList.contains("intro-cinematic-active"),
      undefined,
      { timeout: 15_000 }
    );
    if (await isVisible(startPage, "#onboarding-overlay")) {
      await startPage.locator("#onboarding-close").click();
    }
    await startPage.keyboard.press("/");
    await startPage.locator("#search-overlay").waitFor({ state: "visible", timeout: 15_000 });
    await startPage.locator("#search-input").fill("Market Research Agent");
    await startPage.locator("#search-results .search-result", { hasText: "Market Research Agent" }).click();
    assert(
      /#\/d\/marketing\/market-research$/.test(startPage.url()),
      "开始页完整流程后没有跳到英文市场调研场景"
    );
    await startPage.locator("#modal").waitFor({ state: "visible", timeout: 15_000 });

    console.log("OpenClaw browser smoke check");
    console.log("- deep link scenario modal: PASS");
    console.log("- invalid route fallback: PASS");
    console.log("- in-app search jump: PASS");
    console.log("- start screen intro flow: PASS");
    console.log("");
    console.log("PASS browser smoke flow.");
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  const previewServer = spawn(
    "npx",
    ["vite", "preview", "--host", HOST, "--port", String(PORT)],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: "pipe",
    }
  ) as ChildProcessWithoutNullStreams;

  let serverOutput = "";
  previewServer.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  previewServer.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    console.log("[e2e] waiting for preview server");
    await waitForServerReady(BASE_URL, SERVER_TIMEOUT_MS);
    console.log("[e2e] preview server ready");
    await runChecks();
  } catch (error) {
    if (serverOutput.trim()) {
      console.error(serverOutput.trim());
    }
    throw error;
  } finally {
    previewServer.kill("SIGTERM");
    await delay(300);
    if (!previewServer.killed) {
      previewServer.kill("SIGKILL");
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
