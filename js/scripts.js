/*!
    Petrus Chanel Reksy Arfila — CV
    Vanilla JS, no dependencies. The page is complete without it.
*/

(() => {
    document.getElementById('year').textContent = new Date().getFullYear();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Portfolio timeline: draw the line once it scrolls into view. The `motion` class is set
    // only when the observer exists, so the line is never left hidden if this script fails.
    const timelines = document.querySelectorAll('.postmortem__timeline');
    if (timelines.length && 'IntersectionObserver' in window && !reduceMotion.matches) {
        document.documentElement.classList.add('motion');
        const draw = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-drawn');
                    draw.unobserve(entry.target);
                }
            });
        }, { threshold: 0.35 });
        timelines.forEach((el) => draw.observe(el));
    }

    // Contact form: send in place and report status; plain POST remains the no-JS fallback
    const form = document.querySelector('.form');
    if (form && window.fetch) {
        const status = form.querySelector('.form__status');
        const button = form.querySelector('button[type="submit"]');
        const say = (text, kind) => {
            status.textContent = text;
            status.className = 'form__status' + (kind ? ' is-' + kind : '');
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            form.classList.add('is-sending');
            button.disabled = true;
            say('Sending…');
            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });
                if (!res.ok) throw new Error(res.status);
                form.reset();
                say('Sent. Thank you, I will reply by email.', 'sent');
            } catch (err) {
                say('Could not send. Check your connection and try again, or message me on LinkedIn.', 'error');
            } finally {
                form.classList.remove('is-sending');
                button.disabled = false;
            }
        });
    }

    // Phone menu: the burger opens and closes the section list
    const index = document.querySelector('.index');
    const toggle = index && index.querySelector('.index__toggle');
    const current = index && index.querySelector('.index__current');
    const links = index ? [...index.querySelectorAll('a')] : [];

    const setOpen = (open) => {
        index.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
    };

    if (toggle) {
        toggle.addEventListener('click', () => setOpen(!index.classList.contains('is-open')));
        links.forEach((link) => link.addEventListener('click', () => setOpen(false)));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && index.classList.contains('is-open')) {
                setOpen(false);
                toggle.focus();
            }
        });
        document.addEventListener('click', (e) => {
            if (!index.contains(e.target)) setOpen(false);
        });
    }

    // Section index: mark where the reader is, and name it in the phone bar
    if (!links.length || !('IntersectionObserver' in window)) return;

    const setActive = (id) => {
        links.forEach((link) => {
            const on = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', on);
            if (on) {
                link.setAttribute('aria-current', 'true');
                if (current) current.textContent = link.textContent;
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: '-30% 0px -65% 0px' });

    links
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean)
        .forEach((section) => spy.observe(section));
})();
