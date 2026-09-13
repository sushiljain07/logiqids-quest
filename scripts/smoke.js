import { chromium } from "playwright-core";

async function shot(page, path) { await page.screenshot({ path, fullPage: true }); }

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome-stable", args: ["--no-sandbox"] });
  const errors = [];

  // Spy on speechSynthesis.speak before the page's own script runs, so we can prove
  // a spoken explanation actually fires on a wrong answer.
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => {
    window.__speakCalls = [];
    // window.speechSynthesis is a native getter-only accessor in real Chrome;
    // a plain assignment silently no-ops, so use defineProperty to replace it.
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [{ name: "Test Voice", lang: "en-US" }],
        cancel: () => {},
        speak: (utterance) => { window.__speakCalls.push(utterance.text); },
      },
    });
    window.SpeechSynthesisUtterance = function (text) { this.text = text; };
  });
  const page = await ctx.newPage();
  page.on("pageerror", e => errors.push(String(e)));

  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForSelector("text=Who's playing?");
  await page.fill(".nameInput", "Aanya");
  await page.click("button:has-text('🦁')");
  await page.click("text=Start learning!");
  await page.waitForSelector("text=Analytical Thinking");
  await shot(page, "scripts/screenshots/desktop-skillmap.png");

  // Full Teach -> Try Together -> Your Turn loop for Series Completion, forcing a wrong answer.
  await page.click("text=Series Completion");
  await page.waitForSelector(".teachCard");
  await shot(page, "scripts/screenshots/desktop-teach.png");
  // The teach card is a multi-step walkthrough; click through "Next" until the
  // final step's button reads "Let's practice!".
  while (await page.locator("button:has-text('Next')").count()) {
    await page.click("button:has-text('Next')");
  }
  await page.click("text=Let's practice!");
  await page.waitForSelector(".questionCard");

  for (let i = 0; i < 6; i++) { // 2 tryTogether + 4 yourTurn
    const options = page.locator(".option");
    await options.first().click(); // deliberately often wrong, to exercise the explanation path
    await page.waitForSelector(".explanationCard");
    const continueBtn = page.locator("button:has-text('Continue')");
    if (await continueBtn.count()) { await continueBtn.click(); }
    await page.waitForTimeout(150);
  }
  await page.waitForSelector("text=/Topic mastered|Nice practice/");
  await shot(page, "scripts/screenshots/desktop-topic-done.png");
  const speakCallCount = await page.evaluate(() => window.__speakCalls.length);
  console.log("speechSynthesis.speak call count (expect > 0):", speakCallCount);

  await page.click("button[aria-label='Home']");
  await page.waitForSelector("text=Analytical Thinking");

  // Mixed Practice
  await page.click("text=Mixed Practice");
  // Exact match: "text=Mixed" (substring) ambiguously matches both the "Mixed Practice"
  // heading and this button, and clicks the (inert) heading first.
  await page.click('text="Mixed"');
  for (let i = 0; i < 10; i++) {
    const stillGoing = await page.locator(".option").count();
    if (!stillGoing) break;
    await page.locator(".option").first().click();
    await page.waitForSelector(".explanationCard");
    await page.click("button:has-text('Continue')");
    await page.waitForTimeout(120);
  }
  await page.waitForSelector("text=Practice complete!");
  await page.click("button[aria-label='Home']");

  // Mock Test — full run
  await page.click("text=Mock Test");
  await page.click("text=Start Test");
  for (let i = 0; i < 35; i++) {
    const done = await page.locator("text=Test Complete!").count();
    if (done) break;
    await page.locator(".option").first().click();
    await page.waitForTimeout(100);
  }
  await page.waitForSelector("text=Test Complete!");
  await shot(page, "scripts/screenshots/desktop-mocktest-result.png");
  await page.click("text=Review Answers");
  await page.waitForSelector("text=Question-Wise Review");
  await shot(page, "scripts/screenshots/desktop-mocktest-review.png");

  await page.click("button[aria-label='Home']");
  await page.click("text=My Progress");
  await shot(page, "scripts/screenshots/desktop-progress.png");
  await page.click("button[aria-label='Home']");
  await page.click("text=Leaderboard");
  await shot(page, "scripts/screenshots/desktop-leaderboard.png");

  console.log("Page errors:", JSON.stringify(errors));
  await ctx.close();

  // Mobile + tablet viewport checks on the skill map and a topic screen
  for (const [label, viewport] of [["mobile", { width: 375, height: 667 }], ["tablet", { width: 820, height: 1180 }]]) {
    const c = await browser.newContext({ viewport });
    const p = await c.newPage();
    await p.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await p.waitForSelector("text=Who's playing?");
    await p.fill(".nameInput", "Aanya");
    await p.click("text=Start learning!");
    await p.waitForSelector("text=Analytical Thinking");
    await shot(p, `scripts/screenshots/${label}-skillmap.png`);
    await p.click("text=Series Completion");
    await p.waitForSelector(".teachCard");
    await shot(p, `scripts/screenshots/${label}-teach.png`);
    await c.close();
  }

  await browser.close();
})();
