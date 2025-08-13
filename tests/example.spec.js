

// const { test, expect } = require('@playwright/test');
// const fs = require('fs');
// const path = require('path');

// function loadLocators() {
//   return JSON.parse(fs.readFileSync(path.join(__dirname, '../locators.json')));
// }

// async function fixLocator(locatorKey, failedLocator, pageHtml) {
//   const fetch = (await import('node-fetch')).default;
//   const res = await fetch('http://localhost:3009/fix-locator', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ locatorKey, failedLocator, pageHtml })
//   });
//   return res.json();
// }

// test.setTimeout(60000);

// async function generateTestCases(description, url) {
//   const fetch = (await import('node-fetch')).default;
//   const res = await fetch('http://localhost:3009/generate-tests', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ description, url })
//   });
//   return res.json();
// }

// // ✅ Valid login test
// test('Login on SauceDemo with self-healing locator', async ({ browser }) => {
//   const locators = loadLocators();
//   const context = await browser.newContext();
//   let page = await context.newPage();

//   await page.goto('https://www.saucedemo.com/');
//   await page.fill('#user-name', 'standard_user');
//   await page.fill('#password', 'secret_sauce');

//   const locator = locators.loginButton;
//   const locatorHandle = page.locator(locator);

//   try {
//     await locatorHandle.waitFor({ state: 'visible', timeout: 2000 });
//     await locatorHandle.click();
//   } catch (err) {
//     console.log('Locator not found or click failed, sending to AI...');
//     try {
//       const pageHtml = await page.content();
//       const { newLocator } = await fixLocator('loginButton', locator, pageHtml);
//       console.log(`New locator from AI: ${newLocator}`);

//       await page.close();
//       page = await context.newPage();

//       await page.goto('https://www.saucedemo.com/');
//       await page.fill('#user-name', 'standard_user');
//       await page.fill('#password', 'secret_sauce');

//       const newLocatorHandle = page.locator(newLocator);
//       await newLocatorHandle.waitFor({ state: 'visible', timeout: 5000 });
//       await newLocatorHandle.click();
//     } catch (innerErr) {
//       console.error('Failed after AI locator fix:', innerErr);
//       throw innerErr;
//     }
//   }

//   await expect(page).toHaveURL(/inventory/);

//   const result = await generateTestCases(
//     'Login on SauceDemo and verify inventory page',
//     'https://www.saucedemo.com/'
//   );
//   console.log('Generated test cases:', result.testCases);

//   await page.close();
//   await context.close();
// });



// /*

// // ❌ Invalid username
// test('Login with invalid username', async ({ browser }) => {
//   const locators = loadLocators();
//   const context = await browser.newContext();
//   let page = await context.newPage();

//   await page.goto('https://www.saucedemo.com/');
  
  
//   await page.fill('#user-name', 'wrong_user');
//   await page.fill('#password', 'secret_sauce');

//   const locator = locators.loginButton;
//   const locatorHandle = page.locator(locator);

//   try {
//     await locatorHandle.waitFor({ state: 'visible', timeout: 2000 });
//     await locatorHandle.click();
//   } catch (err) {
//     console.log('Locator not found or click failed, sending to AI...');
//     try {
//       const pageHtml = await page.content();
//       const { newLocator } = await fixLocator('loginButton', locator, pageHtml);
//       console.log(`New locator from AI: ${newLocator}`);

//       await page.close();
//       page = await context.newPage();

//       await page.goto('https://www.saucedemo.com/');
//       await page.fill('#user-name', 'wrong_user');
//       await page.fill('#password', 'secret_sauce');

//       const newLocatorHandle = page.locator(newLocator);
//       await newLocatorHandle.waitFor({ state: 'visible', timeout: 5000 });
//       await newLocatorHandle.click();
//     } catch (innerErr) {
//       console.error('Failed after AI locator fix:', innerErr);
//       throw innerErr;
//     }
//   }

//   await expect(page.locator('h3[data-test="error"]')).toContainText(
//     'Username and password do not match'
//   );

//   const result = await generateTestCases(
//     'Login with invalid username on SauceDemo',
//     'https://www.saucedemo.com/'
//   );
//   console.log('Generated test cases:', result.testCases);

//   await page.close();
//   await context.close();
// });




// // ❌ Invalid password
// test('Login with invalid password', async ({ browser }) => {
//   const locators = loadLocators();
//   const context = await browser.newContext();
//   let page = await context.newPage();

//   await page.goto('https://www.saucedemo.com/');
//   await page.fill('#user-name', 'standard_user');
//   await page.fill('#password', 'wrong_pass');

//   const locator = locators.loginButton;
//   const locatorHandle = page.locator(locator);

//   try {
//     await locatorHandle.waitFor({ state: 'visible', timeout: 2000 });
//     await locatorHandle.click();
//   } catch (err) {
//     console.log('Locator not found or click failed, sending to AI...');
//     try {
//       const pageHtml = await page.content();
//       const { newLocator } = await fixLocator('loginButton', locator, pageHtml);
//       console.log(`New locator from AI: ${newLocator}`);

//       await page.close();
//       page = await context.newPage();

//       await page.goto('https://www.saucedemo.com/');
//       await page.fill('#user-name', 'standard_user');
//       await page.fill('#password', 'wrong_pass');

//       const newLocatorHandle = page.locator(newLocator);
//       await newLocatorHandle.waitFor({ state: 'visible', timeout: 5000 });
//       await newLocatorHandle.click();
//     } catch (innerErr) {
//       console.error('Failed after AI locator fix:', innerErr);
//       throw innerErr;
//     }
//   }

//   await expect(page.locator('h3[data-test="error"]')).toContainText(
//     'Username and password do not match'
//   );

//   const result = await generateTestCases(
//     'Login with invalid password on SauceDemo',
//     'https://www.saucedemo.com/'
//   );
//   console.log('Generated test cases:', result.testCases);

//   await page.close();
//   await context.close();
// });

// // ❌ Blank credentials
// test('Login with blank credentials', async ({ browser }) => {
//   const locators = loadLocators();
//   const context = await browser.newContext();
//   let page = await context.newPage();

//   await page.goto('https://www.saucedemo.com/');

//   const locator = locators.loginButton;
//   const locatorHandle = page.locator(locator);

//   try {
//     await locatorHandle.waitFor({ state: 'visible', timeout: 2000 });
//     await locatorHandle.click();
//   } catch (err) {
//     console.log('Locator not found or click failed, sending to AI...');
//     try {
//       const pageHtml = await page.content();
//       const { newLocator } = await fixLocator('loginButton', locator, pageHtml);
//       console.log(`New locator from AI: ${newLocator}`);

//       await page.close();
//       page = await context.newPage();

//       await page.goto('https://www.saucedemo.com/');

//       const newLocatorHandle = page.locator(newLocator);
//       await newLocatorHandle.waitFor({ state: 'visible', timeout: 5000 });
//       await newLocatorHandle.click();
//     } catch (innerErr) {
//       console.error('Failed after AI locator fix:', innerErr);
//       throw innerErr;
//     }
//   }

//   await expect(page.locator('h3[data-test="error"]')).toContainText(
//     'Username is required'
//   );

//   const result = await generateTestCases(
//     'Login with blank credentials on SauceDemo',
//     'https://www.saucedemo.com/'
//   );
//   console.log('Generated test cases:', result.testCases);

//   await page.close();
//   await context.close();
// });
// */

const { test, expect } = require('@playwright/test');
const { healingUsingAI } = require('../server/healingUsingAI');

test('Login on SauceDemo with AI healing + test case generation', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');

  await healingUsingAI(
    page,
    'loginButton',
    async (locatorHandle) => { await locatorHandle.click(); },
    'Login on SauceDemo and verify inventory page', // description
    'https://www.saucedemo.com/' // url
  );

  await expect(page).toHaveURL(/inventory/);
});
