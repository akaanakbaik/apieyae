import WebSocket from 'ws';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import FormData from 'form-data';

// --- API Utama (Copilot) ---
class Copilot {
  constructor() {
    this.conversationId = null;
    this.models = {
      default: 'chat'
    };
    this.headers = {
      origin: 'https://copilot.microsoft.com',
      'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
    };
  }

  async createConversation() {
    try {
      let { data } = await axios.post('https://copilot.microsoft.com/c/api/conversations', null, { headers: this.headers });
      this.conversationId = data.id;
      return this.conversationId;
    } catch (e) {
      console.error("Error creating conversation:", e.message);
      throw new Error("Failed to create Copilot conversation.");
    }
  }

  async chat(message, { model = 'default' } = {}) {
    if (!this.conversationId) await this.createConversation();
    if (!this.models[model]) throw new Error(`Available models: ${Object.keys(this.models).join(', ')}`);
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`wss://copilot.microsoft.com/c/api/chat?api-version=2&features=-,ncedge,edgepagecontext&setflight=-,ncedge,edgepagecontext&ncedge=1`, { headers: this.headers });
      const response = { text: '', citations: [] };
      let timeout = setTimeout(() => {
        reject(new Error("Copilot WebSocket timeout"));
        ws.close();
      }, 30000); // 30 detik timeout

      ws.on('open', () => {
        ws.send(JSON.stringify({
          event: 'setOptions',
          supportedFeatures: ['partial-generated-images'],
          supportedCards: ['weather', 'local', 'image', 'sports', 'video', 'ads', 'safetyHelpline', 'quiz', 'finance', 'recipe'],
          ads: { supportedTypes: ['text', 'product', 'multimedia', 'tourActivity', 'propertyPromotion'] }
        }));
        ws.send(JSON.stringify({
          event: 'send',
          mode: this.models[model],
          conversationId: this.conversationId,
          content: [{ type: 'text', text: message }],
          context: {}
        }));
      });

      ws.on('message', (chunk) => {
        try {
          const parsed = JSON.parse(chunk.toString());
          switch (parsed.event) {
            case 'appendText':
              response.text += parsed.text || '';
              break;
            case 'citation':
              response.citations.push({ title: parsed.title, icon: parsed.iconUrl, url: parsed.url });
              break;
            case 'done':
              clearTimeout(timeout);
              resolve(response);
              ws.close();
              break;
            case 'error':
              clearTimeout(timeout);
              reject(new Error(parsed.message));
              ws.close();
              break;
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error.message);
        }
      });

      ws.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
        
      ws.on('close', () => {
         clearTimeout(timeout);
      });
    });
  }
}

// --- API Fallback (GPT-4o) ---
async function aichat(question) {
    let model = 'gpt-4o-mini'; // Hanya gpt-4o-mini
    let models = {
        'gpt-4o-mini': '25865'
    };
    
    let { data: html } = await axios.post(`https://px.nekolabs.my.id/${encodeURIComponent('https://chatgptfree.ai/')}`);
    let nonce = html.data.content.match(/&quot;nonce&quot;\s*:\s*&quot;([^&]+)&quot;/);
    if (!nonce) throw new Error('Nonce not found for fallback API.');
    
    let { data } = await axios.post(`https://px.nekolabs.my.id/${encodeURIComponent('https://chatgptfree.ai/wp-admin/admin-ajax.php')}`, new URLSearchParams({
        action: 'aipkit_frontend_chat_message',
        _ajax_nonce: nonce[1],
        bot_id: models[model],
        session_id: uuidv4(),
        conversation_uuid: uuidv4(),
        post_id: '6',
        message: question
    }).toString(), {
        headers: {
            origin: 'https://chatgptfree.ai',
            referer: 'https://chatgptfree.ai/',
            'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        }
    });
    
    if (data && data.data && data.data.content && data.data.content.data && data.data.content.data.reply) {
        return data.data.content.data.reply;
    } else {
        throw new Error('Invalid response structure from fallback API.');
    }
}

// --- Vercel Serverless Function Handler ---
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle only POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ 
        author: "aka",
        email: "akaanakbaik17@proton.me",
        status: 405, 
        error: "Method Not Allowed" 
    });
    return;
  }

  const { query, custom, language } = req.body;

  if (!query) {
    res.status(400).json({ 
        author: "aka",
        email: "akaanakbaik17@proton.me",
        status: 400, 
        error: "Query is required." 
    });
    return;
  }

  // Gabungkan custom prompt, query, dan instruksi bahasa
  const fullQuery = `${custom || 'Anda adalah asisten AI.'}\n\nPertanyaan: ${query}\n\n(Balas dalam bahasa: ${language || 'Indonesia'})`;
  const startTime = Date.now();

  try {
    // 1. Coba API Utama (Copilot)
    const copilot = new Copilot();
    const result = await copilot.chat(fullQuery, { model: 'default' });
    const endTime = Date.now();

    res.status(200).json({
      author: "aka",
      email: "akaanakbaik17@proton.me",
      status: 200,
      model: "Copilot (Default)",
      response_time: `${endTime - startTime}ms`,
      result: {
        response: result.text.trim(),
        citations: result.citations
      }
    });

  } catch (e) {
    console.error("Main API (Copilot) Error:", e.message);
    
    try {
      // 2. Jika Gagal, Coba API Fallback (GPT-4o)
      const fallbackResult = await aichat(fullQuery);
      const endTime = Date.now();

      res.status(200).json({
        author: "aka",
        email: "akaanakbaik17@proton.me",
        status: 200,
        model: "GPT-4o Mini (Fallback)",
        response_time: `${endTime - startTime}ms`,
        result: {
          response: fallbackResult.trim(),
          citations: []
        }
      });

    } catch (fallbackError) {
      console.error("Fallback API (GPT-4o) Error:", fallbackError.message);
      const endTime = Date.now();
      
      // 3. Jika Keduanya Gagal
      res.status(500).json({
        author: "aka",
        email: "akaanakbaik17@proton.me",
        status: 500,
        model: "Error",
        response_time: `${endTime - startTime}ms`,
        error: "Both main and fallback APIs failed.",
        main_error: e.message,
        fallback_error: fallbackError.message
      });
    }
  }
            }
                  
