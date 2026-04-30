document.addEventListener('DOMContentLoaded', function() {
    // Страховка: при загрузке всегда закрываем попап-меню
    $('.menu__popup').removeClass('active');
    $('body').removeClass('no-scroll');

    // Yandex Metrika (loads only after cookie consent)
    const YA_METRIKA_ID = 0; // TODO: replace with your counter id on hosting (e.g. 12345678)
    let metrikaLoaded = false;

    function loadYandexMetrika() {
        if (metrikaLoaded) return;
        if (!YA_METRIKA_ID || typeof YA_METRIKA_ID !== 'number') return;
        if (typeof window.ym === 'function') {
            metrikaLoaded = true;
            return;
        }

        (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            k=e.createElement(t);
            a=e.getElementsByTagName(t)[0];
            k.async=1;
            k.src=r;
            a.parentNode.insertBefore(k,a);
        })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        window.ym(YA_METRIKA_ID, "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true
        });

        metrikaLoaded = true;
    }

    // cookie consent
    (function initCookieConsent() {
        const KEY = 'mm_cookie_consent';
        const banner = document.getElementById('cookie-banner');
        if (!banner) return;

        function setCookie(name, value, days) {
            const maxAge = Math.round(days * 24 * 60 * 60);
            document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
        }

        function setConsent(value) {
            try {
                localStorage.setItem(KEY, value);
            } catch (_) {}
            setCookie(KEY, value, 180);
            document.documentElement.dataset.cookieConsent = value;
            banner.classList.remove('is-visible');
            banner.setAttribute('aria-hidden', 'true');

            if (value === 'accepted') {
                loadYandexMetrika();
            }
        }

        let current = null;
        try {
            current = localStorage.getItem(KEY);
        } catch (_) {}

        if (current !== 'accepted' && current !== 'declined') {
            banner.classList.add('is-visible');
            banner.setAttribute('aria-hidden', 'false');
        } else {
            document.documentElement.dataset.cookieConsent = current;
            if (current === 'accepted') {
                loadYandexMetrika();
            }
        }

        banner.addEventListener('click', function (e) {
            const target = e.target;
            if (!(target instanceof Element)) return;
            if (target.closest('[data-cookie-accept]')) setConsent('accepted');
            if (target.closest('[data-cookie-decline]')) setConsent('declined');
        });
    })();

    const tabsContainer = document.getElementById('tabs');
    const tabLinks = tabsContainer.querySelectorAll('.step__item_link');
    const tabContents = tabsContainer.querySelectorAll('.content-step');
    const tabsContentWrap = tabsContainer.querySelector('.step-description__content-step');
    const buttonsContainer = tabsContainer.querySelector('.content-step__button_orange').parentNode;
    const buttons = buttonsContainer.querySelectorAll('.content-step__button');
    let activeTabIndex = 0;
    let tabAnimToken = 0;

    function setHowJobWrapHeightBy(index) {
        if (!tabsContentWrap) return;
        const slide = tabContents[index];
        if (!slide) return;
        // slide already in DOM; make it measurable
        const prevDisplay = slide.style.display;
        slide.style.display = 'flex';
        const h = slide.offsetHeight;
        slide.style.display = prevDisplay;
        tabsContentWrap.style.height = h + 'px';
    }

    // Функция для активации таба
    function activateTab(tabIndex) {
        if (tabIndex === activeTabIndex) return;
        const token = ++tabAnimToken;

        tabLinks.forEach(link => link.classList.remove('step__item_link-active'));
        tabLinks[tabIndex].classList.add('step__item_link-active');

        const prev = tabContents[activeTabIndex];
        const next = tabContents[tabIndex];

        if (prev) {
            prev.classList.remove('is-active');
            prev.classList.add('is-leaving');
        }

        if (next) {
            next.classList.remove('is-leaving');
            next.style.display = 'flex';
            void next.offsetWidth;

            if (tabsContentWrap) {
                tabsContentWrap.style.height = (prev ? prev.offsetHeight : tabsContentWrap.offsetHeight) + 'px';
                requestAnimationFrame(function () {
                    if (token !== tabAnimToken) return;
                    tabsContentWrap.style.height = next.offsetHeight + 'px';
                });
            }

            requestAnimationFrame(function () {
                if (token !== tabAnimToken) return;
                next.classList.add('is-active');
            });
        }

        window.setTimeout(function () {
            if (token !== tabAnimToken) return;
            if (prev) {
                prev.classList.remove('is-leaving');
                prev.style.display = 'none';
            }
        }, 300);

        activeTabIndex = tabIndex;
        
        // Перемещаем кнопки после активного контента
        buttons.forEach(button => {
            buttonsContainer.appendChild(button);
        });
    }

    // Обработчики кликов для табов
    tabLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            activateTab(index);
        });
    });

    // Активируем первый таб по умолчанию
    tabLinks.forEach(link => link.classList.remove('step__item_link-active'));
    tabLinks[0].classList.add('step__item_link-active');
    tabContents.forEach((content, i) => {
        content.classList.remove('is-active', 'is-leaving');
        content.style.display = i === 0 ? 'flex' : 'none';
        if (i === 0) content.classList.add('is-active');
    });
    activeTabIndex = 0;
    setHowJobWrapHeightBy(0);

    window.addEventListener('resize', function () {
        setHowJobWrapHeightBy(activeTabIndex);
    });

    // Обработчик для hash в URL (если кто-то переходит по ссылке #fragment-2 и т.д.)
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash;
        if (hash) {
            const tabIndex = Array.from(tabLinks).findIndex(link => link.getAttribute('href') === hash);
            if (tabIndex !== -1) {
                activateTab(tabIndex);
            }
        }
    });

    // Проверяем hash при загрузке страницы
    if (window.location.hash) {
        const tabIndex = Array.from(tabLinks).findIndex(link => link.getAttribute('href') === window.location.hash);
        if (tabIndex !== -1) {
            activateTab(tabIndex);
        }
    }

    const projectsViewport = document.querySelector('.projects__viewport');
    const projectsSlider = projectsViewport
        ? projectsViewport.querySelector('[data-projects-slider]')
        : document.querySelector('[data-projects-slider]');
    if (projectsSlider && projectsViewport) {
        const track = projectsSlider.querySelector('.projects__track');
        const slides = projectsSlider.querySelectorAll('.projects__slide');
        const prevBtn = projectsViewport.querySelector('.projects__nav--prev');
        const nextBtn = projectsViewport.querySelector('.projects__nav--next');
        const total = slides.length;
        if (track && total > 0) {
            let index = 0;
            let startX = 0;
            let dragX = 0;
            let activePointerId = null;
            let dragging = false;

            const mqDesktopNav = window.matchMedia('(min-width: 1025px)');

            function isDesktopNav() {
                return mqDesktopNav.matches;
            }

            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const transitionCss = reduceMotion
                ? 'none'
                : 'transform 0.38s cubic-bezier(0.25, 0.1, 0.25, 1)';

            function slideWidth() {
                return projectsSlider.offsetWidth;
            }

            function setTransform(animated) {
                const w = slideWidth();
                const x = -index * w + dragX;
                track.style.transition = animated ? transitionCss : 'none';
                track.style.transform = 'translate3d(' + x + 'px, 0, 0)';
            }

            function clampIndex() {
                if (index < 0) index = 0;
                if (index > total - 1) index = total - 1;
            }

            function updateNavButtons() {
                if (!prevBtn || !nextBtn) return;
                prevBtn.disabled = index <= 0;
                nextBtn.disabled = index >= total - 1;
            }

            function goBy(delta) {
                index += delta;
                clampIndex();
                dragX = 0;
                setTransform(true);
                updateNavButtons();
            }

            function onPointerDown(e) {
                if (isDesktopNav()) return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                dragging = true;
                activePointerId = e.pointerId;
                startX = e.clientX;
                dragX = 0;
                projectsSlider.classList.add('is-dragging');
                try {
                    projectsSlider.setPointerCapture(e.pointerId);
                } catch (_) {}
                setTransform(false);
            }

            function onPointerMove(e) {
                if (isDesktopNav()) return;
                if (!dragging || e.pointerId !== activePointerId) return;
                dragX = e.clientX - startX;
                setTransform(false);
            }

            function onPointerEnd(e) {
                if (isDesktopNav()) return;
                if (!dragging || e.pointerId !== activePointerId) return;
                dragging = false;
                activePointerId = null;
                projectsSlider.classList.remove('is-dragging');
                try {
                    projectsSlider.releasePointerCapture(e.pointerId);
                } catch (_) {}

                const threshold = Math.max(48, slideWidth() * 0.12);
                if (dragX < -threshold && index < total - 1) index++;
                else if (dragX > threshold && index > 0) index--;
                dragX = 0;
                clampIndex();
                setTransform(true);
                updateNavButtons();
            }

            projectsSlider.addEventListener('pointerdown', onPointerDown);
            projectsSlider.addEventListener('pointermove', onPointerMove);
            projectsSlider.addEventListener('pointerup', onPointerEnd);
            projectsSlider.addEventListener('pointercancel', onPointerEnd);

            if (prevBtn) {
                prevBtn.addEventListener('click', function () {
                    if (!isDesktopNav()) return;
                    goBy(-1);
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', function () {
                    if (!isDesktopNav()) return;
                    goBy(1);
                });
            }

            projectsSlider.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (index > 0) {
                        index--;
                        dragX = 0;
                        setTransform(true);
                        updateNavButtons();
                    }
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (index < total - 1) {
                        index++;
                        dragX = 0;
                        setTransform(true);
                        updateNavButtons();
                    }
                }
            });

            function onLayoutModeChange() {
                dragX = 0;
                if (dragging) {
                    dragging = false;
                    activePointerId = null;
                    projectsSlider.classList.remove('is-dragging');
                }
                clampIndex();
                setTransform(false);
                updateNavButtons();
            }

            if (typeof mqDesktopNav.addEventListener === 'function') {
                mqDesktopNav.addEventListener('change', onLayoutModeChange);
            } else if (typeof mqDesktopNav.addListener === 'function') {
                mqDesktopNav.addListener(onLayoutModeChange);
            }

            let resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(onLayoutModeChange, 100);
            });

            setTransform(false);
            updateNavButtons();
        }
    }

    const leadForm = document.querySelector('.lead-form__form');
    const modal = document.getElementById('lead-form-modal');
    const modalTitle = document.getElementById('lead-form-modal-title');
    const modalText = document.getElementById('lead-form-modal-text');
    const leadFilesInput = document.getElementById('lead-files');
    const filesMeta = document.querySelector('.lead-form__files-meta');
    const uploadBox = document.querySelector('.lead-form__upload');
    const uploadText = document.querySelector('.lead-form__upload-text');

    function openModal(state, title, text) {
        if (!modal || !modalTitle || !modalText) return;
        modal.dataset.state = state;
        modalTitle.textContent = title;
        modalText.textContent = text;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');

        const focusTarget =
            modal.querySelector('.site-modal__action') ||
            modal.querySelector('.site-modal__close');
        if (focusTarget) focusTarget.focus({ preventScroll: true });
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }

    if (modal) {
        modal.addEventListener('click', function (e) {
            const target = e.target;
            if (!(target instanceof Element)) return;
            if (target.closest('[data-modal-close]')) {
                closeModal();
            }
        });

        window.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                e.preventDefault();
                closeModal();
            }
        });
    }

    if (leadForm) {
        function formatBytes(bytes) {
            if (!Number.isFinite(bytes)) return '';
            const units = ['Б', 'КБ', 'МБ', 'ГБ'];
            let v = Math.max(0, bytes);
            let i = 0;
            while (v >= 1024 && i < units.length - 1) {
                v /= 1024;
                i++;
            }
            const rounded = i === 0 ? Math.round(v) : Math.round(v * 10) / 10;
            return `${rounded} ${units[i]}`;
        }

        function renderFilesMeta() {
            if (!filesMeta || !leadFilesInput || !(leadFilesInput instanceof HTMLInputElement)) return;
            const files = leadFilesInput.files ? Array.from(leadFilesInput.files) : [];
            if (files.length === 0) {
                filesMeta.textContent = '';
                return;
            }

            const totalBytes = files.reduce((sum, f) => sum + (f && f.size ? f.size : 0), 0);
            const names = files.slice(0, 3).map(f => f.name).join(', ');
            const suffix = files.length > 3 ? ` и ещё ${files.length - 3}` : '';
            filesMeta.textContent = `Выбрано файлов: ${files.length} (${formatBytes(totalBytes)}). ${names}${suffix}`;
        }

        if (leadFilesInput) {
            leadFilesInput.addEventListener('change', renderFilesMeta);
            renderFilesMeta();
        }

        leadForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = leadForm.querySelector('.lead-form__submit');
            const originalBtnText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправляем...';
            }
            if (uploadBox) {
                uploadBox.classList.add('is-visible');
                uploadBox.setAttribute('aria-hidden', 'false');
            }
            if (uploadText) {
                const filesCount =
                    leadFilesInput && leadFilesInput instanceof HTMLInputElement && leadFilesInput.files
                        ? leadFilesInput.files.length
                        : 0;
                uploadText.textContent = filesCount > 0 ? `Отправляем файлы (${filesCount})…` : 'Отправляем заявку…';
            }

            try {
                const formData = new FormData(leadForm);
                const resp = await fetch(leadForm.action, {
                    method: leadForm.method || 'POST',
                    body: formData,
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (resp.ok) {
                    openModal(
                        'success',
                        'Заявка отправлена',
                        'Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.'
                    );

                    leadForm.reset();
                    renderFilesMeta();

                    const consent = leadForm.querySelector('#lead-consent');
                    if (consent && consent instanceof HTMLInputElement) {
                        consent.checked = true;
                    }
                } else {
                    openModal(
                        'error',
                        'Не удалось отправить',
                        'Похоже, произошла ошибка на сервере. Попробуйте ещё раз чуть позже или свяжитесь с нами по телефону.'
                    );
                }
            } catch (_) {
                openModal(
                    'error',
                    'Нет соединения',
                    'Проверьте интернет и попробуйте отправить форму ещё раз.'
                );
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
                if (uploadBox) {
                    uploadBox.classList.remove('is-visible');
                    uploadBox.setAttribute('aria-hidden', 'true');
                }
            }
        });
    }
});


var accordion = function(){
    var data = $(".faq__list").attr("data-accordion");
    
    $(".accordion-header").on("click", function(){
        // Закрываем все другие открытые элементы
        $(".accordion-header").not(this).removeClass("active");
        $(".accordion-body").not($(this).next(".accordion-body")).slideUp();
        
        // Переключаем текущий элемент
        $(this).toggleClass("active");
        $(this).next(".accordion-body").slideToggle();
    });
    
    // Инициализация 
    if(data === "close") {
        $(".accordion-body").hide();
    }
}

accordion();


$(document).ready(function() {
    function closeMenuPopup() {
        $('.menu__popup').removeClass('active');
        $('.menu__overlay').removeClass('active');
        $('body').removeClass('no-scroll');
    }

    // Открытие меню по клику на бургер
    $('.header-burger').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.menu__popup').addClass('active');
        $('.menu__overlay').addClass('active');
        $('body').addClass('no-scroll'); 
    });
    
    // Закрытие меню по клику на крестик
    $('.menu-close').on('click', function(e) {
        e.preventDefault();
        closeMenuPopup();
    });
    
    // Закрытие меню при клике на ссылку
    $('.nav-list__mobile .nav-list-link').on('click', function() {
        closeMenuPopup();
    });

    // Закрытие меню по клику вне попапа
    $(document).on('click', function(e) {
        const $popup = $('.menu__popup');
        if (!$popup.hasClass('active')) return;

        const $target = $(e.target);
        const clickedInsidePopup = $target.closest('.menu__popup').length > 0;
        const clickedBurger = $target.closest('.header-burger').length > 0;
        const clickedOverlay = $target.closest('.menu__overlay').length > 0;

        if (clickedOverlay || (!clickedInsidePopup && !clickedBurger)) {
            closeMenuPopup();
        }
    });

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('.menu__popup').hasClass('active')) {
            e.preventDefault();
            closeMenuPopup();
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;
    const scrollDownThreshold = 6;
    const scrollUpThreshold = 3;
    const alwaysShowBelowY = 32;

    function onScrollFrame() {
        const y = window.scrollY || window.pageYOffset;
        const dy = y - lastY;
        const popup = document.querySelector('.menu__popup');
        const menuOpen = popup && popup.classList.contains('active');

        if (menuOpen) {
            header.classList.remove('header--hidden');
        } else if (y <= alwaysShowBelowY) {
            header.classList.remove('header--hidden');
        } else if (dy > scrollDownThreshold) {
            header.classList.add('header--hidden');
        } else if (dy < -scrollUpThreshold) {
            header.classList.remove('header--hidden');
        }

        lastY = y;
        ticking = false;
    }

    window.addEventListener(
        'scroll',
        function () {
            if (!ticking) {
                window.requestAnimationFrame(onScrollFrame);
                ticking = true;
            }
        },
        { passive: true }
    );
});

