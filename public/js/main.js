document.addEventListener('DOMContentLoaded', () => {
    // Ambil semua elemen interaktif
    const queryInput = document.getElementById('query-input');
    const customModelInput = document.getElementById('custom-model-input');
    const languageSelect = document.getElementById('language-select');
    const execBtn = document.getElementById('exec-btn');
    const clearBtn = document.getElementById('clear-btn');
    const docBtn = document.getElementById('doc-btn');
    const resultContainer = document.getElementById('result-container');

    // Navigasi ke halaman dokumentasi
    docBtn.addEventListener('click', () => {
        window.location.href = '/doc.html';
    });

    // Fungsi untuk membersihkan input dan hasil
    const handleClear = () => {
        queryInput.value = '';
        customModelInput.value = '';
        languageSelect.selectedIndex = 0;
        resultContainer.classList.add('hidden');
        resultContainer.innerHTML = '';
        showNotification('Input dibersihkan!', 'info');
    };

    // Fungsi untuk mengeksekusi query
    const handleExec = async () => {
        const query = queryInput.value.trim();
        const customModel = customModelInput.value.trim();
        const language = languageSelect.value;

        if (!query) {
            showNotification('Mohon masukkan query terlebih dahulu.', 'error');
            return;
        }

        // Tampilkan status loading
        execBtn.disabled = true;
        execBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Processing...</span>`;
        resultContainer.classList.remove('hidden');
        resultContainer.innerHTML = `
            <div class="glass-card w-full p-6 sm:p-8 rounded-2xl">
                <div class="bg-black rounded-lg p-4">
                    <pre class="text-sm text-gray-300 animate-pulse">Menghubungi server AI, mohon tunggu...</pre>
                </div>
            </div>`;

        try {
            // Panggil API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, customModel, language }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Terjadi kesalahan pada server.');
            }
            
            showNotification('Berhasil mendapatkan respons!', 'success');
            displayResults(data);

        } catch (error) {
            console.error('Fetch error:', error);
            showNotification(error.message, 'error');
            resultContainer.innerHTML = `
                <div class="glass-card w-full p-6 sm:p-8 rounded-2xl">
                    <div class="bg-black rounded-lg p-4">
                        <pre class="text-sm text-red-400">Error: ${error.message}</pre>
                    </div>
                </div>`;
        } finally {
            // Kembalikan tombol ke keadaan semula
            execBtn.disabled = false;
            execBtn.innerHTML = '<span>Exec</span>';
        }
    };

    // Fungsi untuk menampilkan hasil
    const displayResults = (data) => {
        const logContent = data.response || 'Tidak ada respons teks.';
        const metadataContent = JSON.stringify({
            author: data.author,
            email: data.email,
            source: data.source,
            citations: data.citations
        }, null, 2);
        
        const currentUrl = window.location.origin;
        const curlPayload = JSON.stringify({ query: queryInput.value.trim() }, null, 2);
        const curlContent = `curl -X POST '${currentUrl}/api/chat' \\\n-H 'Content-Type: application/json' \\\n-d '${curlPayload}'`;

        resultContainer.innerHTML = `
            <div class="glass-card w-full p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/30 space-y-6">
                <!-- Execution Log -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-lg font-semibold text-gray-200">Execution Log</h3>
                        <button class="copy-btn" data-target="log-output">
                             <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                             <svg class="check-icon hidden" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                             <span class="copy-text">Salin</span>
                        </button>
                    </div>
                    <div class="bg-black rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre id="log-output" class="text-sm text-gray-300 whitespace-pre-wrap break-words">${logContent}</pre>
                    </div>
                </div>
                <!-- Metadata -->
                <div>
                    <h3 class="text-lg font-semibold text-gray-200 mb-2">Metadata</h3>
                    <div class="bg-black rounded-lg p-4 max-h-60 overflow-y-auto">
                        <pre class="text-sm text-green-400 whitespace-pre-wrap break-words">${metadataContent}</pre>
                    </div>
                </div>
                <!-- cURL Example -->
                <div>
                    <h3 class="text-lg font-semibold text-gray-200 mb-2">Example cURL</h3>
                    <div class="bg-black rounded-lg p-4 relative">
                        <pre class="text-sm text-yellow-300 whitespace-pre-wrap break-words overflow-x-auto">${curlContent}</pre>
                    </div>
                </div>
            </div>`;

        // Pasang event listener untuk tombol salin yang baru dibuat
        resultContainer.querySelector('.copy-btn').addEventListener('click', handleCopy);
    };
    
    // Fungsi untuk menyalin teks
    const handleCopy = (event) => {
        const button = event.currentTarget;
        const targetId = button.dataset.target;
        const textToCopy = document.getElementById(targetId)?.innerText;

        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                const copyIcon = button.querySelector('.copy-icon');
                const checkIcon = button.querySelector('.check-icon');
                const copyText = button.querySelector('.copy-text');
                
                const originalText = copyText.textContent;
                copyIcon.classList.add('hidden');
                checkIcon.classList.remove('hidden');
                copyText.textContent = 'Disalin!';

                setTimeout(() => {
                    copyIcon.classList.remove('hidden');
                    checkIcon.classList.add('hidden');
                    copyText.textContent = originalText;
                }, 2000);
            }).catch(err => {
                showNotification('Gagal menyalin ke clipboard.', 'error');
                console.error('Gagal menyalin:', err);
            });
        }
    };

    // Pasang event listener utama
    execBtn.addEventListener('click', handleExec);
    clearBtn.addEventListener('click', handleClear);
});
