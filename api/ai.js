import WebSocket from 'ws';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// --- API UTAMA (COPILOT) ---
export class PrimaryAI {
    constructor() {
        this.conversationId = null;
        this.models = {
            default: 'chat',
            'think-deeper': 'reasoning',
            'gpt-5': 'smart'
        };
        this.headers = {
            origin: 'https://copilot.microsoft.com',
            'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        };
    }

    async createConversation() {
        let { data } = await axios.post('https://copilot.microsoft.com/c/api/conversations', null, { headers: this.headers });
        this.conversationId = data.id;
        return this.conversationId;
    }

    async chat(message, { model = 'default' } = {}) {
        if (!this.conversationId) await this.createConversation();
        if (!this.models[model]) throw new Error(`Model yang tersedia: ${Object.keys(this.models).join(', ')}`);
        
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`wss://copilot.microsoft.com/c/api/chat?api-version=2&features=-,ncedge,edgepagecontext&setflight=-,ncedge,edgepagecontext&ncedge=1`, { headers: this.headers });
            const response = { text: '', citations: [] };
            
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
                            resolve(response);
                            ws.close();
                            break;
                        case 'error':
                            reject(new Error(parsed.message));
                            ws.close();
                            break;
                    }
                } catch (error) {
                    reject(new Error(error.message));
                }
            });
            ws.on('error', reject);
        });
    }
}

// --- API CADANGAN (FEEDBACK) ---
export async function fallbackAIChat(question) {
    const model = 'gpt-4o-mini'; 
    const models = { 'gpt-4o-mini': '25865' };

    try {
        let { data: html } = await axios.post(`https://px.nekolabs.my.id/${encodeURIComponent('https://chatgptfree.ai/')}`);
        let nonce = html.data.content.match(/&quot;nonce&quot;\s*:\s*&quot;([^&]+)&quot;/);
        if (!nonce) throw new Error('Nonce tidak ditemukan.');

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
        
        const reply = data.data.content.data.reply;
        if (!reply || reply.trim() === '') throw new Error('API cadangan memberikan respons kosong.');
        
        return { text: reply, citations: [] };
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message || 'API Cadangan Gagal.');
    }
                            }
                                     
