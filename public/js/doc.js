document.addEventListener('DOMContentLoaded', () => {
    // --- PENGISIAN KONTEN OTOMATIS ---
    const currentUrl = window.location.origin;
    
    // 1. Contoh cURL
    const curlExampleEl = document.getElementById('curl-example');
    if (curlExampleEl) {
        const curlPayload = JSON.stringify({
            query: "Apa itu Node.js?",
            customModel: "Anda adalah asisten yang ramah",
            language: "Indonesia"
        }, null, 2);
        curlExampleEl.textContent = `curl -X POST '${currentUrl}/api/chat' \\\n-H 'Content-Type: application/json' \\\n-d '${curlPayload}'`;
    }

    // 2. Contoh Output Sukses
    const successOutputEl = document.getElementById('success-output-example');
    if (successOutputEl) {
        const successJson = {
            "success": true,
            "author": "aka",
            "email": "akaanakbaik17@proton.me",
            "source": "primary",
            "response": "Node.js adalah platform runtime JavaScript yang dibangun di atas mesin V8 Chrome...",
            "citations": []
        };
        successOutputEl.textContent = JSON.stringify(successJson, null, 2);
    }

    // 3. Contoh Output Error
    const errorOutputEl = document.getElementById('error-output-example');
    if (errorOutputEl) {
        const errorJson = {
            "success": false,
            "message": "Query tidak valid atau kosong."
        };
        errorOutputEl.textContent = JSON.stringify(errorJson, null, 2);
    }

    // 4. Contoh Plugin Bot WA
    const waPluginEl = document.getElementById('wa-plugin-example');
    if (waPluginEl) {
        waPluginEl.textContent = `import axios from 'axios';

// handler.help = ['ai', 'copilot'];
// handler.tags = ['ai'];
// handler.command = /^(ai|copilot)$/i;
// export default handler;

// SIMULASI FUNGSI HANDLER
async function handler(m, { text, conn, usedPrefix, command }) {
    try {
        const query = text.trim();
        if (!query) {
            return m.reply(\`Contoh: \${usedPrefix + command} Apa itu REST API?\`);
        }

        const isGroup = m.isGroup;
        const isBotMentioned = m.mentionedJid.includes(conn.user.jid);
        
        // Di grup, AI hanya merespons jika di-mention atau pesan diawali 'ai '
        if (isGroup && !isBotMentioned && !query.toLowerCase().startsWith('ai ')) {
            return;
        }

        await m.reply('Sedang memproses permintaan Anda...');

        const { data } = await axios.post('${currentUrl}/api/chat', {
            query: query,
            // Anda bisa menambahkan customModel dan language di sini jika perlu
            // customModel: 'Anda adalah bot WhatsApp bernama JARVIS',
            // language: 'Indonesia'
        });

        if (!data.success) {
            throw new Error(data.message);
        }

        await m.reply(data.response);

    } catch (e) {
        console.error(e);
        m.reply(e.message || 'Terjadi kesalahan saat menghubungi API.');
    }
}
`;
    }

    // --- LOGIKA TOMBOL SALIN ---
    const allCopyButtons = document.querySelectorAll('.copy-btn');
    allCopyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const textToCopy = document.getElementById(targetId)?.textContent;

            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const copyIcon = button.querySelector('.copy-icon');
                    const checkIcon = button.querySelector('.check-icon');
                    const copyText = button.querySelector('.copy-text');
                    
                    const originalText = copyText.textContent;
                    copyIcon.classList.add('hidden');
                    checkIcon.classList.remove('hidden');
                    copyText.textContent = 'Disalin!';
                    showNotification('Kode disalin!', 'success');

                    setTimeout(() => {
                        copyIcon.classList.remove('hidden');
                        checkIcon.classList.add('hidden');
                        copyText.textContent = originalText;
                    }, 2000);
                }).catch(err => {
                    showNotification('Gagal menyalin.', 'error');
  
                  console.error('Gagal menyalin:', err);
                });
            }
        });
    });
});          
