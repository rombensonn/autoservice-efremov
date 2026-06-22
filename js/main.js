(function () {
    const statusNodes = document.querySelectorAll('[data-business-status]');
    const openHour = 8;
    const closeHour = 18;

    function getMoscowParts() {
        const formatter = new Intl.DateTimeFormat('ru-RU', {
            timeZone: 'Europe/Moscow',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const parts = formatter.formatToParts(new Date());
        const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
        const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
        return { hour, minute };
    }

    function updateStatus() {
        const { hour, minute } = getMoscowParts();
        const minutesNow = hour * 60 + minute;
        const opens = openHour * 60;
        const closes = closeHour * 60;
        const text = minutesNow >= opens && minutesNow < closes
            ? 'Открыто до 18:00'
            : 'Закрыто до 08:00';

        statusNodes.forEach((node) => {
            node.textContent = text;
        });
    }

    updateStatus();
    window.setInterval(updateStatus, 60000);

    const siteHeader = document.querySelector('[data-site-header]');
    const navToggle = document.querySelector('.nav-toggle');
    const siteMenu = document.querySelector('#site-menu');

    function setMenuOpen(isOpen) {
        if (!siteHeader || !navToggle || !siteMenu) {
            return;
        }

        siteHeader.classList.toggle('is-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    }

    if (siteHeader && navToggle && siteMenu) {
        navToggle.addEventListener('click', () => {
            setMenuOpen(!siteHeader.classList.contains('is-open'));
        });

        siteMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMenuOpen(false));
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        });

        document.addEventListener('click', (event) => {
            if (!siteHeader.contains(event.target)) {
                setMenuOpen(false);
            }
        });
    }

    document.querySelectorAll('details.service-card').forEach((details) => {
        details.addEventListener('toggle', () => {
            if (!details.open) {
                return;
            }

            document.querySelectorAll('details.service-card[open]').forEach((other) => {
                if (other !== details && window.matchMedia('(max-width: 680px)').matches) {
                    other.open = false;
                }
            });
        });
    });
}());
