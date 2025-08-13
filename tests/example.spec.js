const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
import fetch from 'node-fetch';

function loadLocators() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../locators.json')));
}
async function fixLocator(locatorKey, failedLocator, pageHtml) {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('http://localhost:3007/fix-locator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locatorKey, failedLocator, pageHtml })
    });
    return res.json();
  }
  
test.setTimeout(60000);

test('Login on SauceDemo with self-healing locator', async ({ browser }) => {
  const locators = loadLocators();
  const context = await browser.newContext();
  let page = await context.newPage();

  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');

  const locator = locators.loginButton;
  const locatorHandle = page.locator(locator);

  try {
    // Wait max 2 seconds for locator to be visible
    await locatorHandle.waitFor({ state: 'visible', timeout: 2000 });
    await locatorHandle.click();
  } catch (err) {
    console.log('Locator not found or click failed, sending to AI...');
    try {
      const pageHtml = await page.content();
      const { newLocator } = await fixLocator('loginButton', locator, pageHtml);
      console.log(`New locator from AI: ${newLocator}`);

      // Close old page and open a fresh one
      await page.close();
      page = await context.newPage();

      await page.goto('https://www.saucedemo.com/');
      await page.fill('#user-name', 'standard_user');
      await page.fill('#password', 'secret_sauce');

      const newLocatorHandle = page.locator(newLocator);
      await newLocatorHandle.waitFor({ state: 'visible', timeout: 5000 });
      await newLocatorHandle.click();
    } catch (innerErr) {
      console.error('Failed after AI locator fix:', innerErr);
      throw innerErr;
    }
  }

  await expect(page).toHaveURL(/inventory/);

  await page.close();
  await context.close();
});
