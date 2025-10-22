document.addEventListener('DOMContentLoaded', () => {
    const aiForm = document.getElementById('ai-form');
    const queryInput = document.getElementById('query');
    const customPromptInput = document.getElementById('custom-prompt');
    const languageSelect = document.getElementById('language');
    const clearBtn = document.getElementById('clear-btn');
    const execBtn = document.getElementById('exec-btn');
    const outputContainer = document.getElementById('output-container');
    const logOutput = document.getElementById('log-output');
    const curlOutput = document.getElementById('curl-output');

    // Salin
    attachCopyListeners();

    // Tombol Clear
    clearBtn.addEventListener('click', () => {
        queryInput.value = '';
        outputContainer.classList.add('hidden');
        logOutput.textContent = '';
        curlOutput.textContent = '';
        showNotification('Query dibersihkan', 'info');
    });

    // Tombol Exec
    aiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = queryInput.value.trim();
        const custom = customPromptInput.value.trim();
        const language = languageSelect.value;

        if (!query) {
            showNotification('Query tidak boleh kosong', 'error');
            return;
        }

        // Tampilkan loading & nonaktifkan tombol
        execBtn.disabled = true;
        execBtn.textContent = 'Executing...';
        showNotification('Memproses permintaan...', 'info', 3000);
        outputContainer.classList.add('hidden');

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, custom, language }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Terjadi kesalahan pada server');
            }

            // Tampilkan hasil
            logOutput.textContent = JSON.stringify(data, null, 2);
            curlOutput.textContent = generateCurlCommand(query, custom, language);
            outputContainer.classList.remove('hidden');
            showNotification('Sukses! Respons diterima.', 'success');

        } catch (error) {
            console.error('Error fetching AI response:', error);
            showNotification(`Error: ${error.message}`, 'error', 3000);
            // Tampilkan error di log
            logOutput.textContent = JSON.stringify({ error: error.message }, null, 2);
            outputContainer.classList.remove('hidden');
            curlOutput.textContent = 'Gagal menghasilkan cURL.';
        } finally {
            // Aktifkan kembali tombol
            execBtn.disabled = false;
            execBtn.textContent = 'Exec';
        }
    });

    function generateCurlCommand(query, custom, language) {
        const domain = window.location.origin;
        const apiUrl = `${domain}/api/ai`;
        
        const payload = { query, custom, language };
        
        // Escape single quotes in JSON string for shell
        const escapedPayload = JSON.stringify(payload).replace(/'/g, "'\\''");

        return `curl -X POST '${apiUrl}' \\
     -H 'Content-Type: application/json' \\
     -d '${escapedPayload}'`;
    }

    function attachCopyListeners() {
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', () => {
                const targetSelector = button.getAttribute('data-clipboard-target');
                const targetElement = document.querySelector(targetSelector);
                
                if (targetElement) {
                    navigator.clipboard.writeText(targetElement.textContent)
                        .then(() => {
                            showNotification('Disalin ke clipboard!', 'success');
                        })
                        .catch(err => {
                            console.error('Gagal menyalin:', err);
                            showNotification('Gagal menyalin', 'error');
                        });
                }
            });
        });
    }
});
                                                    
