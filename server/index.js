const express = require('express');
const axios = require('axios');
const cors = require('cors');
const WebSocket = require('ws'); // Import ws

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const MODEL_NAME = "openai/gpt-oss-20b:novita";
const HF_TOKEN = "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";

const PORT_HTTP = 3007;
const PORT_WS = 9091;

// Start HTTP server for REST API
const server = app.listen(PORT_HTTP, () => {
  console.log(`Locator fixing AI server listening on http://localhost:${PORT_HTTP}`);
});

// Start WebSocket server
const wss = new WebSocket.Server({ port: PORT_WS }, () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT_WS}`);
});

// Broadcast helper function
function broadcast(event) {
  const data = JSON.stringify(event);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

app.post('/fix-locator', async (req, res) => {
  const { locatorKey, failedLocator, pageHtml } = req.body;

  const prompt = `You are a smart test automation assistant. Suggest a precise CSS locator for the element originally targeted by "${failedLocator}". The HTML snippet is: ${pageHtml.slice(0, 2000)}... Respond with only the new CSS selector string, nothing else.`;

  try {
    const response = await axios.post(
      HF_API_URL,
      {
        model: MODEL_NAME,
        messages: [
          { role: "user", content: prompt }
        ],
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
      broadcast({
        locatorKey,
        oldLocator: failedLocator,
        newLocator: null,
        status: 'failed',
        error: errorMsg,
        time: Date.now()
      });
      return res.status(500).json({ error: errorMsg });
    }

    broadcast({
      locatorKey,
      oldLocator: failedLocator,
      newLocator,
      status: 'fixed',
      time: Date.now()
    });

    res.json({ newLocator });
  } catch (error) {
    console.error("HuggingFace Error:", error?.response?.data || error.message);

    broadcast({
      locatorKey,
      oldLocator: failedLocator,
      newLocator: null,
      status: 'error',
      error: error?.response?.data || error.message,
      time: Date.now()
    });

    res.status(500).json({
      error: "Error generating locator fix",
      details: error?.response?.data || error.message
    });
  }
});
