import { animate, hover, inView, stagger, scroll } from "https://cdn.jsdelivr.net/npm/motion@12.41.0/+esm";

const header = document.querySelector('[data-header]');
const form = document.querySelector('[data-lead-form]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (!prefersReducedMotion) {
    initMotion();
}

initForm();
initGallery();

function initMotion() {
    animate(
        '.header-inner',
        { opacity: [0, 1], y: [-18, 0], scale: [.98, 1] },
        { duration: .7, easing: [0.16, 1, 0.3, 1] }
    );

    animate(
        '.hero-badge, .hero h1, .hero-lead, .hero-actions',
        { opacity: [0, 1], y: [22, 0] },
        { delay: stagger(.09, { startDelay: .12 }), duration: .75, easing: [0.16, 1, 0.3, 1] }
    );

    animate(
        '.hero-facts > div',
        { opacity: [0, 1], y: [18, 0], scale: [.96, 1] },
        { delay: stagger(.08, { startDelay: .45 }), duration: .62, easing: [0.16, 1, 0.3, 1] }
    );

    animate(
        '.hero-showcase .showcase-card',
        { opacity: [0, 1], y: [44, 0], rotate: [-1.6, 0] },
        { delay: stagger(.11, { startDelay: .62 }), duration: .78, easing: [0.16, 1, 0.3, 1] }
    );

    document.querySelectorAll('.section, .cta-inner').forEach((section) => {
        inView(section, () => {
            animate(section, { opacity: [0, 1], y: [34, 0] }, { duration: .72, easing: [0.16, 1, 0.3, 1] });
        }, { amount: .16, margin: '0px 0px -90px 0px' });
    });

    const cardGroups = [
        '.services-grid .service-card',
        '.gallery-grid .gallery-card',
        '.trust-list .trust-item',
        '.process-grid > div',
        '.review-card',
    ];

    cardGroups.forEach((selector) => {
        const cards = Array.from(document.querySelectorAll(selector));
        if (!cards.length) return;

        cards.forEach((card) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(28px)';
        });

        inView(cards, () => {
            animate(
                cards,
                { opacity: 1, y: 0 },
                { delay: stagger(.07), duration: .64, easing: [0.16, 1, 0.3, 1] }
            );
        }, { amount: .12, margin: '0px 0px -80px 0px' });
    });

    document.querySelectorAll('.service-card, .gallery-card, .trust-item, .showcase-card, .review-card').forEach((element) => {
        hover(element, () => {
            const lift = element.classList.contains('showcase-card') ? -10 : -7;
            animate(element, { y: lift, scale: 1.012 }, { duration: .24, easing: 'ease-out' });
            return () => animate(element, { y: 0, scale: 1 }, { duration: .28, easing: 'ease-out' });
        });
    });

    const glowOneAnimation = animate('.hero-glow-one', { x: [0, -44], y: [0, 32] }, { ease: 'linear' });
    const glowTwoAnimation = animate('.hero-glow-two', { x: [0, 36], y: [0, -22] }, { ease: 'linear' });
    scroll(glowOneAnimation);
    scroll(glowTwoAnimation);
}

function initGallery() {
    const dialog = document.querySelector('[data-gallery-dialog]');
    const image = document.querySelector('[data-gallery-image]');
    const caption = document.querySelector('[data-gallery-caption]');
    const closeButton = document.querySelector('[data-gallery-close]');
    const triggers = document.querySelectorAll('[data-gallery-trigger]');

    if (!dialog || !image || !caption || !closeButton || !triggers.length) return;

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            image.src = trigger.dataset.full || '';
            image.alt = trigger.getAttribute('aria-label') || 'Фотография автосервиса';
            caption.textContent = trigger.dataset.caption || '';
            dialog.showModal();

            if (!prefersReducedMotion) {
                animate(dialog, { opacity: [0, 1], scale: [.96, 1], y: [18, 0] }, { duration: .28, easing: [0.16, 1, 0.3, 1] });
            }
        });
    });

    closeButton.addEventListener('click', () => closeGallery(dialog));

    dialog.addEventListener('click', (event) => {
        const rect = dialog.getBoundingClientRect();
        const clickedBackdrop = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
        if (clickedBackdrop) closeGallery(dialog);
    });
}

function closeGallery(dialog) {
    if (!dialog.open) return;
    dialog.close();
}

function initForm() {
    if (!form) return;

    const phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^\d+()\- \s]/g, '').slice(0, 24);
        });
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const fields = Array.from(form.querySelectorAll('input, select, textarea'));
        fields.forEach((field) => field.classList.remove('field-error'));

        const name = form.querySelector('input[name="name"]');
        const phone = form.querySelector('input[name="phone"]');
        const consent = form.querySelector('input[name="consent"]');
        const invalid = [];

        if (!name || name.value.trim().length < 2) invalid.push(name);
        if (!phone || phone.value.replace(/\D/g, '').length < 10) invalid.push(phone);
        if (!consent || !consent.checked) invalid.push(consent);

        if (invalid.length) {
            invalid.forEach((field) => field && field.classList.add('field-error'));
            invalid[0].focus();
            showAlert('Проверьте имя, телефон и согласие на обработку данных.', 'error');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : '';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Отправляем...';
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' },
            });
            const data = await response.json();
            if (!response.ok || !data.ok) {
                throw new Error(data.message || 'Не удалось отправить заявку.');
            }
            form.reset();
            showAlert('Заявка отправлена. Сервис свяжется с вами в ближайшее рабочее время.', 'success');
        } catch (error) {
            showAlert(error.message || 'Не удалось отправить заявку. Позвоните по телефону на сайте.', 'error');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    });
}

function showAlert(message, type) {
    let alert = form.querySelector('.alert');
    if (!alert) {
        alert = document.createElement('div');
        form.prepend(alert);
    }
    alert.className = `alert ${type}`;
    alert.setAttribute('role', type === 'error' ? 'alert' : 'status');
    alert.textContent = message;
}
