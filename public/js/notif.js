function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notif = document.createElement('div');
    notif.className = `notification-card ${type}`;
    
    const icons = {
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    };

    notif.innerHTML = `
        <div class="flex-shrink-0">${icons[type]}</div>
        <span class="flex-grow">${message}</span>
    `;
    
    container.appendChild(notif);

    requestAnimationFrame(() => notif.classList.add('show'));

    const dismiss = () => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    };
    
    const timeoutId = setTimeout(dismiss, 1500);

    let startX, startY, moveX, moveY;
    const threshold = 50;

    const touchStart = (e) => {
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        notif.style.transition = 'none';
    };

    const touchMove = (e) => {
        if (!startX || !startY) return;
        moveX = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX) - startX;
        moveY = (e.type === 'touchmove' ? e.touches[0].clientY : e.clientY) - startY;
        notif.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    const touchEnd = () => {
        notif.style.transition = 'all 0.3s ease-out';
        if (Math.abs(moveX) > threshold || moveY < -threshold) {
            clearTimeout(timeoutId);
            dismiss();
        } else {
            notif.style.transform = 'translate(0, 0)';
        }
        startX = startY = moveX = moveY = null;
    };

    notif.addEventListener('touchstart', touchStart, { passive: true });
    notif.addEventListener('touchmove', touchMove, { passive: true });
    notif.addEventListener('touchend', touchEnd);
    notif.addEventListener('mousedown', touchStart);
    notif.addEventListener('mousemove', (e) => { if(e.buttons === 1) touchMove(e); });
    notif.addEventListener('mouseup', touchEnd);
    notif.addEventListener('mouseleave', () => { if(startX) touchEnd(); });
      }
