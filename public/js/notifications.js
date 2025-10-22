function showNotification(message, type = 'info', duration = 1500) {
    const container = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;

    let startX = 0;
    let startY = 0;
    let distX = 0;
    let distY = 0;
    let isSwiping = false;

    const dismiss = () => {
        if (notif.classList.contains('exiting')) return;
        notif.classList.add('exiting');
        notif.addEventListener('animationend', () => {
            if (notif.parentNode === container) {
                container.removeChild(notif);
            }
        });
    };

    const autoDismiss = setTimeout(dismiss, duration);

    notif.addEventListener('click', dismiss);

    notif.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
        notif.classList.add('swiping');
        clearTimeout(autoDismiss); // Batalkan auto-dismiss saat disentuh
    }, { passive: true });

    notif.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;

        distX = e.touches[0].clientX - startX;
        distY = e.touches[0].clientY - startY;

        // Hanya terapkan transformasi jika geseran lebih horizontal
        if (Math.abs(distX) > Math.abs(distY)) {
             e.preventDefault(); // Mencegah scrolling halaman
             notif.style.transform = `translateX(${distX}px)`;
        } else {
             // Geser ke atas
             if (distY < 0) {
                notif.style.transform = `translateY(${distY}px)`;
             }
        }
       
    }, { passive: false });

    notif.addEventListener('touchend', () => {
        if (!isSwiping) return;
        isSwiping = false;
        notif.classList.remove('swiping');

        const swipeThreshold = 50; // Jarak minimal geser
        
        // Geser ke kiri, kanan, atau atas
        if (Math.abs(distX) > swipeThreshold || distY < -swipeThreshold) {
            notif.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            let moveX = Math.abs(distX) > Math.abs(distY) ? (distX > 0 ? '100%' : '-100%') : '0';
            let moveY = distY < -swipeThreshold ? '-100%' : '0';
            
            if (moveY !== '0') {
                 notif.style.transform = `translateY(${moveY})`;
            } else {
                 notif.style.transform = `translateX(${moveX})`;
            }
            notif.style.opacity = '0';
            
            setTimeout(dismiss, 300);
        } else {
            // Kembali ke posisi semula
            notif.style.transform = 'translateX(0) translateY(0)';
            // Setel ulang auto-dismiss jika tidak digeser
            setTimeout(dismiss, duration);
        }
        
        // Reset dist
        distX = 0;
        distY = 0;
    });


    container.appendChild(notif);
          }
                  
