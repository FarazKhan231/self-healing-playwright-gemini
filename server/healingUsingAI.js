const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

function loadLocators() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../locators.json')));
}

async function fixLocator(locatorKey, failedLocator, pageHtml) {
  const res = await fetch('http://localhost:3009/fix-locator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locatorKey, failedLocator, pageHtml })
  });
  return res.json();
}

async function generateTestCases(description, url) {
  const res = await fetch('http://localhost:3009/generate-tests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, url })
  });
  return res.json();
}

/**
 * Healing AI wrapper
 * @param {object} page Playwright page object
 * @param {string} locatorKey Key from locators.json
 * @param {function} action Function that performs action on locatorHandle
 * @param {string} description Description for test case generation
 * @param {string} url URL for test case generation
 */
async function healingUsingAI(page, locatorKey, action, description, url) {
  const locators = loadLocators();
  let locator = locators[locatorKey];
  let locatorHandle = page.locator(locator);

  try {
    await locatorHandle.waitFor({ state: 'visible', timeout: 2000 });
    await action(locatorHandle);
  } catch {
    console.log(`[AI Healing] ${locatorKey} failed. Sending to AI...`);
    const pageHtml = await page.content();
    const { newLocator } = await fixLocator(locatorKey, locator, pageHtml);
    console.log(`[AI Healing] New locator: ${newLocator}`);

    locatorHandle = page.locator(newLocator);
    await locatorHandle.waitFor({ state: 'visible', timeout: 5000 });
    await action(locatorHandle);

    // 🔹 Generate test cases after healing
    if (description && url) {
      const result = await generateTestCases(description, url);
      console.log(`[AI Healing] Generated test cases:`, result.testCases);
    }
  }
}

module.exports = { healingUsingAI };