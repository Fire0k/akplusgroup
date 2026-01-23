$(function () {
    /*СЛАЙДЕР ИСТОРИИ*/

    window.history.scrollRestoration = 'manual';

    const swiperEl = document.querySelector(".scroll-anchor");
    const footerEl = document.querySelector("footer");
    const progressScale = document.querySelector(".progress-bar-scale");
    const bottomGradient = document.querySelector('.bottom-gradient');
    const textEls = [...document.querySelectorAll('[data-text-index]')];

    const swiperElHeight = swiperEl.getBoundingClientRect().height;
    const scrollAreaHeight = window.innerHeight - swiperElHeight;

    const isMobile = window.innerWidth <= 520;

    // Свайперы для слайдов и для пагинации
    const swiperHistory = new Swiper(".swiper-history", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
        },
    });
    let swiperHistoryPagination = new Swiper(".swiper-history-pagination", {
        slidesPerView: 'auto',
        freeMode: true,
        mousewheel: true,
    });

    // Якорь для градиента внизу
    const gradientScrollTrigger = ScrollTrigger.create({
        trigger: swiperEl,
        start: "bottom bottom",
        endTrigger: footerEl,
        end: "top bottom",
        onEnter: () => {
            bottomGradient.style.display = 'block';
        },
        onLeave: () => {
            bottomGradient.style.display = 'none';
        },
        onEnterBack: () => {
            bottomGradient.style.display = 'block';
        },
    });

    //Переменные для хранения текущего состояния скролла
    let previousText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex - 1}']`);
    let currentText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex}']`);
    let nextText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex + 1}']`);
    let activeBullet = swiperHistoryPagination.slides[0];
    let scrollListenerActive = true;
    let inAnimating = false;

    /**
     * Функции для переключения текста при смене слайда
     * Для десктопа и мобильных разное поведение
     * - Десктоп - смена текстового блока
     * - Мобильные - скролл до нужного текстового блока
     */
    const toggleText = (index) => {
        const tesxtEls = document.querySelectorAll('.history-slider-text');
        tesxtEls.forEach(el => {
            if (Number(el.dataset.textIndex) === index) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        gradientScrollTrigger.refresh();
        setTimeout(() => {
            swiperScrollTrigger.refresh();
        }, swiperHistory.params.speed);
    }
    const scrollToText = (targetIndex) => {
        const targetTextEl = document.querySelector(`[data-text-index='${targetIndex}']`);

        let scrollLength = swiperEl.getBoundingClientRect().bottom - targetTextEl.getBoundingClientRect().top;
        let scrollTo;

        if (scrollLength < 0) {
            scrollLength -= 10;
            scrollTo = window.scrollY - scrollLength;

            if (swiperEl.getBoundingClientRect().top > 0) {
                scrollTo += swiperEl.getBoundingClientRect().top;
            }
        } else {
            scrollTo = window.scrollY - scrollLength;
            scrollLength += 10;
        }

        gsap.to(window, { duration: swiperHistory.params.speed / 1000, scrollTo: scrollTo }).then(() => scrollListenerActive = true);
    }
    const updateSliderState = (targetIndex, changeSlide, scrollText) => {
        if (inAnimating) return;
        inAnimating = true;

        if (!isMobile) {
            bottomGradient.style.display = 'none';
        }

        if (scrollText) {
            scrollListenerActive = false;
        }

        previousText = document.querySelector(`[data-text-index='${targetIndex - 1}']`);
        currentText = document.querySelector(`[data-text-index='${targetIndex}']`);
        nextText = document.querySelector(`[data-text-index='${targetIndex + 1}']`);

        if (activeBullet) {
            activeBullet.classList.remove('active');
        }
        activeBullet = swiperHistoryPagination.slides[targetIndex];
        activeBullet.classList.add('active');

        const slide = swiperHistoryPagination.slides[targetIndex];
        const maxTranslate = swiperHistoryPagination.maxTranslate();

        const offset = slide.offsetLeft;
        let translate = -offset;

        translate = Math.max(translate, maxTranslate);

        swiperHistoryPagination.setTranslate(translate);
        
        if (changeSlide) {
            swiperHistory.slideTo(targetIndex);
        }

        if (scrollText) {
            if (isMobile) {
                scrollToText(targetIndex);
            } else {
                toggleText(targetIndex);
            }
        }

        inAnimating = false;
    }

    // Перелистываем слайдер, когда тайтл его текста пересекает слайдер
    const swiperScrollTrigger = ScrollTrigger.create({
        trigger: swiperEl,
        pin: true,
        start: "top top",
        pinSpacing: false,
        endTrigger: isMobile ? textEls.at(-1) : footerEl,
        end: isMobile ? `top bottom-=${scrollAreaHeight + 10}px` : "top bottom",
        onUpdate: (event) => {
            if (!isMobile) return;

            progressScale.style.width = `${event.progress * 100}%`;

            if (!scrollListenerActive) return;

            if (nextText && swiperEl.getBoundingClientRect().bottom >= nextText.getBoundingClientRect().top) {
                const targetIndex = Number(nextText.dataset.textIndex);
                updateSliderState(targetIndex, true, false);
            }

            if (previousText && swiperEl.getBoundingClientRect().bottom <= previousText.getBoundingClientRect().bottom) {
                const targetIndex = Number(previousText.dataset.textIndex);
                updateSliderState(targetIndex, true, false);
            }
        },
    });

    // Обработчики событий на пагинации
    swiperHistoryPagination.on('click', (swiper) => {
        updateSliderState(swiper.clickedIndex, true, true);
    });

    // Обработчики событий на слайдере
    /**
     * Определяем клик или драг по разнице начальной и конечной координат
     * т.к. логика нужна разная. Можно добавить небольшую дельту, в рамках которой драг
     * будет все еще считаться кликом\тапом.
     * Отслеживание клика в отдельном слушателе нерационально,
     * т.к. клик триггерит так же touchEnd
     */
    swiperHistory.on('click', (swiper, event) => {
        if (event.changedTouches && event.changedTouches.length > 1) return;

        const clientX = event.clientX ?? event.changedTouches[0].clientX;
        const clientY = event.clientY ?? event.changedTouches[0].clientY;

        const slides = swiper.slides;
        let targetIndex = null;

        slides.forEach((slide, index) => {
            const rect = slide.getBoundingClientRect();

            if (
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom
            ) {
                targetIndex = index;
            }
        });
        
        if (targetIndex != null) {
            updateSliderState(targetIndex, true, true);
        }
    });
    swiperHistory.on('slideChange', (swiper) => {
        updateSliderState(swiper.activeIndex, false, true);
    });
    swiperHistory.init();

    /*END СЛАЙДЕР ИСТОРИИ*/
})