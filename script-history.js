$(function () {
    /*СЛАЙДЕР ИСТОРИИ*/
    window.history.scrollRestoration = "manual";

    const swiperEl = document.querySelector(".scroll-anchor");
    const footerEl = document.querySelector("footer");
    const progressScale = document.querySelector(".progress-bar-scale");
    const bottomGradient = document.querySelector('.bottom-gradient');

    const isMobile = window.innerWidth <= 520;

    const SLIDES_COUNT = 16;
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

    // Якорь для скролла и переменные для хранения текущего состояния скролла
    let previousText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex - 1}']`);
    let currentText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex}']`);
    let nextText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex + 1}']`);
    let canScrollForNext = true;

    /**
     * Перелистываем слайдер, когда тайтл его текста пересекает слайдер
     * Исключение - последние слайды, т.к. топ их текста никогда не достигнет слайдера
     * Ниже переменный для обработки такого кейса
     */
    let finalHeight = 0;
    let finalProgress = 0;
    let finalSlidesCount = 0;
    let progressesForNext = [];
    let currentStep = 0;

    let lastProgress = 0;
    let direction = 0;
    const EPS = 0.002;

    const swiperScrollTrigger = ScrollTrigger.create({
        trigger: swiperEl,
        pin: true,
        start: "top top",
        pinSpacing: false,
        endTrigger: footerEl,
        end: "top bottom",
        onUpdate: (event) => {
            if (!isMobile) return;
            progressScale.style.width = `${event.progress * 100}%`;

            // if (isManualScrolling) return;

            const delta = event.progress - lastProgress;
            if (Math.abs(delta) > EPS) {
                direction = delta > 0 ? 1 : -1;
                lastProgress = event.progress;
            }

            const scrollHeight = event.end - event.start;

            const currentScrollHeight = scrollHeight * event.progress;
            const remainingHeight = scrollHeight - currentScrollHeight;

            const scrollForNext = nextText.getBoundingClientRect().top - swiperEl.getBoundingClientRect().bottom;
            canScrollForNext = scrollForNext <= remainingHeight;

            if (direction === 1) {
                if (!canScrollForNext) {
                    if (event.progress >= progressesForNext[currentStep]) {
                        swiperHistory.slideTo(swiperHistory.activeIndex + 1);

                        currentStep = Math.min(currentStep + 1, progressesForNext.length - 1);
                    }

                    return;
                }

                if (swiperEl.getBoundingClientRect().bottom >= nextText.getBoundingClientRect().top) {
                    swiperHistory.slideTo(swiperHistory.activeIndex + 1);

                    previousText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex - 1}']`);
                    currentText = nextText;
                    nextText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex + 1}']`);

                    if (!canScrollForNext) {
                        finalHeight = remainingHeight;
                        finalProgress = 1 - event.progress;
                        finalSlidesCount = SLIDES_COUNT - (swiperHistory.activeIndex + 1);
                        progressesForNext = [];

                        for (let i = 1; i <= finalSlidesCount; i++) {
                            progressesForNext.push(event.progress + (finalProgress / finalSlidesCount * i))
                        }
                        currentStep = 0;
                    }
                }
            } else {
                if (!canScrollForNext) {
                    if (event.progress <= progressesForNext[currentStep]) {
                        swiperHistory.slideTo(swiperHistory.activeIndex - 1);

                        currentStep -= 1;
                        if (currentStep < 0) {
                            currentStep = 0;
                            canScrollForNext = true;
                        }
                    }

                    return;
                }

                if (previousText && swiperEl.getBoundingClientRect().bottom <= previousText.getBoundingClientRect().top) {
                    swiperHistory.slideTo(swiperHistory.activeIndex - 1);

                    nextText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex + 1}']`);
                    currentText = previousText;
                    previousText = document.querySelector(`[data-text-index='${swiperHistory.activeIndex - 1}']`);
                }
            }
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

        setTimeout(() => {
            swiperScrollTrigger.refresh(false);
            gradientScrollTrigger.refresh(false);
        }, refreshDelay);
    }
    const scrollToText = (targetIndex) => {
        if (!isMobile) return;

        const targetTextEl = document.querySelector(`[data-text-index='${targetIndex}']`);

        if (canScrollForNext) {
            let scrollLength = swiperEl.getBoundingClientRect().bottom - targetTextEl.getBoundingClientRect().top;

            if (scrollLength < 0) {
                scrollLength -= 10;
            } else {
                scrollLength += 10;
            }

            window.scrollBy({ top: -scrollLength, behavior: 'smooth' });
        } else {
            const currentProgess = swiperScrollTrigger.progress;
            const targetProgress = progressesForNext[finalSlidesCount - (SLIDES_COUNT - targetIndex)];

            const scrollY = swiperScrollTrigger.start + targetProgress * (swiperScrollTrigger.end - swiperScrollTrigger.start);
            console.log(finalSlidesCount - (SLIDES_COUNT - targetIndex), targetProgress, scrollY)

            window.scrollTo({ top: scrollY, behavior: 'smooth' });
        }
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