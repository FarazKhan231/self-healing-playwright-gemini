const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function suggestNewLocator(failedLocator, pageHtml) {
  const prompt = `
You are an expert Playwright locator fixer.
The locator "${failedLocator}" failed.
Given the page HTML below, return ONLY a single valid CSS selector
that correctly identifies the same element. No explanations.

HTML:
${pageHtml}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

module.exports = { suggestNewLocator };
