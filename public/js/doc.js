document.addEventListener('DOMContentLoaded', () => {
    
    // Setel cURL dinamis
    const curlElement = document.getElementById('doc-curl');
    if (curlElement) {
        curlElement.textContent = generateDynamicCurl();
    }
    
    // Setel URL API di plugin
    const pluginElement = document.getElementById('doc-plugin');
    if (pluginElement) {
        pluginElement.textContent = pluginElement.textContent.replace(
            '${window.location.origin}', 
            window.location.origin
        );
    }

    // Fungsionalitas Tombol Salin
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

    function generateDynamicCurl() {
        const domain = window.location.origin;
        const apiUrl = `${domain}/api/ai`;
        const payload = {
            query: "Apa itu Node.js?",
            custom: "Anda adalah programmer senior",
            language: "Indonesia"
        };
        
        const escapedPayload = JSON.stringify(payload).replace(/'/g, "'\\''");

        return `curl -X POST '${apiUrl}' \\
     -H 'Content-Type: application/json' \\
     -d '${escapedPayload}'`;
    }
});
