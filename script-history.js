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
    let isManualScroll = false;
    const updateSliderState = () => {
        if (nextText && swiperEl.getBoundingClientRect().bottom >= nextText.getBoundingClientRect().top) {
            if (!isManualScroll) {
                swiperHistory.slideTo(swiperHistory.activeIndex + 1);
            }

            previousText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex - 1}']`);
            currentText = nextText;
            nextText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex + 1}']`);
        }

        if (previousText && swiperEl.getBoundingClientRect().bottom <= previousText.getBoundingClientRect().bottom) {
            if (!isManualScroll) {
                swiperHistory.slideTo(swiperHistory.activeIndex - 1);
            }

            nextText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex + 1}']`);
            currentText = previousText;
            previousText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex - 1}']`);
        }
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

            updateSliderState();
        },
    });

    /**
     * Функции для переключения текста при смене слайда
     * Для десктопа и мобильных разное поведение
     * - Десктоп - смета текстового блока
     * - Мобильные - скролл до нужного текстового блока
     */
    const toggleText = (index, refreshDelay) => {
        if (isMobile) return;

        const tesxtEls = document.querySelectorAll('.history-slider-text');
        tesxtEls.forEach(el => {
            if (Number(el.dataset.textIndex) === index) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        if (swiperScrollTrigger.isActive) {
            const start = swiperScrollTrigger.start;
            swiperScrollTrigger.scroll(start)
        }

        gradientScrollTrigger.refresh();
        setTimeout(() => {
            swiperScrollTrigger.refresh();
        }, refreshDelay);
    }
    const scrollToText = (targetIndex) => {
        swiperHistory.slideTo(targetIndex);

        if (!isMobile) return;

        const targetTextEl = document.querySelector(`[data-text-index='${targetIndex}']`);

        let scrollLength = swiperEl.getBoundingClientRect().bottom - targetTextEl.getBoundingClientRect().top;
        let scrollTo;

        if (scrollLength < 0) {
            scrollLength -= 10;
            scrollTo = window.scrollY - scrollLength;

            if (swiperEl.getBoundingClientRect().top > 0) {
                scrollLength -= swiperEl.getBoundingClientRect().top;
            }
        } else {
            scrollTo = window.scrollY - scrollLength;
            scrollLength += 10;
        }

        isManualScroll = true;
        gsap.to(window, { duration: 0.3, scrollTo: scrollTo });
        setTimeout(() => {
            updateSliderState();
            isManualScroll = false;
        }, 300)
    }

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
            scrollToText(targetIndex);
        }
    });

    // Пагинация
    let swiperHistoryPagination = new Swiper(".swiper-history-pagination", {
        slidesPerView: 'auto',
        freeMode: true,
        mousewheel: true,
    });
    let activeBullet = swiperHistoryPagination.slides[0];
    swiperHistoryPagination.on('click', (swiper) => {
        scrollToText(swiper.clickedIndex);
    });
    swiperHistory.on('slideChange', (swiper) => {
        if (activeBullet) {
            activeBullet.classList.remove('active');
        }
        activeBullet = swiperHistoryPagination.slides[swiper.activeIndex];;
        activeBullet.classList.add('active');

        const slide = swiperHistoryPagination.slides[swiper.activeIndex];
        const offset = slide.offsetLeft;
        let translate = -offset;

        const max = swiperHistoryPagination.maxTranslate();

        translate = Math.max(translate, max);

        swiperHistoryPagination.setTranslate(translate);

        toggleText(swiper.activeIndex, swiper.params.speed);
    });
    swiperHistory.init();

    /*END СЛАЙДЕР ИСТОРИИ*/
})