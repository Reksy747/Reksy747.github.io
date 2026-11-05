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

    // Section index: mark where the reader is
    const links = [...document.querySelectorAll('.index a')];
    if (!links.length || !('IntersectionObserver' in window)) return;

    const setActive = (id) => {
        // Phone tab bar hides Organizations/Certifications: light the nearest visible tab before them (Education)
        let i = links.findIndex((link) => link.getAttribute('href') === '#' + id);
        while (i > 0 && links[i].offsetParent === null) i--;
        if (i < 0) return;
        links.forEach((link, j) => {
            const on = j === i;
            link.classList.toggle('is-active', on);
            if (on) {
                link.setAttribute('aria-current', 'true');
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
