const express = require('express');
const axios = require('axios');
const cors = require('cors');
const WebSocket = require('ws');
require('dotenv').config();
 
const app = express();
app.use(cors());
app.use(express.json());
 
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const MODEL_NAME = "openai/gpt-oss-20b:novita";
const HF_TOKEN = process.env.API_HUGGINGFACE_TOKEN;
 
const PORT_HTTP = 3009;
const PORT_WS = 9092;
 
// In-memory store for events (persists until server stops)
let persistedEvents = [];
 
// Start HTTP server
const server = app.listen(PORT_HTTP, () => {
  console.log(`Locator fixing AI server listening on http://localhost:${PORT_HTTP}`);
});
 
// Start WebSocket server
const wss = new WebSocket.Server({ port: PORT_WS }, () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT_WS}`);
});
 
// Send all stored events to newly connected client
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'init', events: persistedEvents }));
});
 
// Broadcast helper
function broadcast(event) {
  persistedEvents.unshift(event); // Add new event at start
  persistedEvents = persistedEvents.slice(0, 100); // Keep max 100 events
  const data = JSON.stringify(event);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
 
// --- Self-healing locator API ---
app.post('/fix-locator', async (req, res) => {
  const { locatorKey, failedLocator, pageHtml } = req.body;
 
  const prompt = `You are a smart test automation assistant. Suggest a precise CSS locator for the element originally targeted by "${failedLocator}". The HTML snippet is: ${pageHtml.slice(0, 2000)}... Respond with only the new CSS selector string, nothing else.`;
 
  try {
    const response = await axios.post(
      HF_API_URL,
      {
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        stream: false
      },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
 
    const generatedText = response.data.choices?.[0]?.message?.content || '';
    console.log(`Hugging Face response for ${locatorKey}:`, generatedText);
 
    const newLocator = generatedText.trim().split('\n')[0];
 
    if (!newLocator) {
      const errorMsg = 'AI returned empty locator';
      const event = {
        type: 'locatorFix',
         
        locatorKey,
        oldLocator: failedLocator,
        newLocator: null,
        status: 'failed',
        error: errorMsg,
        time: Date.now()
      };
      broadcast(event);
      return res.status(500).json({ error: errorMsg });
    }
 
    const event = {
      type: 'locatorFix',
      
      locatorKey,
      oldLocator: failedLocator,
      newLocator,
      status: 'fixed',
      time: Date.now()
    };
    broadcast(event);
 
    res.json({ newLocator });
  } catch (error) {
    console.error("HuggingFace Error:", error?.response?.data || error.message);
 
    const event = {
      type: 'locatorFix',
      locatorKey,
      oldLocator: failedLocator,
      newLocator: null,
      status: 'error',
      error: error?.response?.data || error.message,
      time: Date.now()
    };
    broadcast(event);
 
    res.status(500).json({
      error: "Error generating locator fix",
      details: error?.response?.data || error.message
    });
  }
});
 
// --- Generate test cases from description & URL ---
app.post('/generate-tests', async (req, res) => {
  const { description, url } = req.body;
 
  const prompt = `
You are a senior QA automation engineer.
Based on the following description and URL, write detailed Playwright test cases in plain English steps (no code).
Description: ${description}
URL: ${url}
List the steps clearly, one per line.
  `;
 
  try {
    const response = await axios.post(
      HF_API_URL,
      {
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        stream: false
      },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
 
    const generatedText = response.data.choices?.[0]?.message?.content || '';
    const testCases = generatedText.trim();
    console.log(`------GENERATED TEST CASES FOR ---- ${description}:`, testCases);
 
    const event = {
      type: 'testCases',
      description,
      url,
      testCases,
      time: Date.now()
    };
    broadcast(event);
 
    res.json({ testCases });
  } catch (error) {
    console.error("Test case generation error:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Error generating test cases",
      details: error?.response?.data || error.message
    });
  }
});