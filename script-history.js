$(function () {
    /*СЛАЙДЕР ИСТОРИИ*/

    const swiperEl = document.querySelector(".scroll-anchor");
    const footerEl = document.querySelector("footer");
    const progressScale = document.querySelector(".progress-bar-scale");
    const bottomGradient = document.querySelector('.bottom-gradient');
    const section = document.querySelector('.history-slider')
    const textEls = [...document.querySelectorAll('[data-text-index]')]

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

    // Якорь для скролла
    const SLIDES_COUNT = 16;
    let currentStep = -1;
    let isManualScrolling = false;

    const heights = textEls.map(el => el.getBoundingClientRect().height);
    const totalHeight = heights.reduce((sum, h) => sum + h, 0);
    const thresholds = [];

    let accumulatedHeight = 0;
    const total = heights.length;

    const firstEnd = Math.floor(total / 3);
    const secondEnd = Math.floor((total * 2) / 3);

    for (let i = 0; i < total; i++) {
        let point;

        if (i < firstEnd) {
            point = accumulatedHeight;
        } else if (i < secondEnd) {
            point = accumulatedHeight + heights[i] / 2;
        } else {
            point = accumulatedHeight + heights[i];
        }

        thresholds.push(point / totalHeight);

        accumulatedHeight += heights[i];
    }

    const mid = Math.floor(heights.length / 2);

    for (let i = 0; i < heights.length; i++) {
        let point;

        if (i < mid) {
            point = accumulatedHeight;
        } else {
            point = accumulatedHeight + heights[i];
        }

        thresholds.push(point / totalHeight);

        accumulatedHeight += heights[i];
    }

    const swiperScrollTrigger = ScrollTrigger.create({
        trigger: swiperEl,
        pin: true,
        start: "top top",
        pinSpacing: false,
        endTrigger: footerEl,
        end: "top bottom",
        markers: true,
        onUpdate: (event) => {
            if (!isMobile) return;

            if (
                currentStep < thresholds.length - 1 &&
                event.progress >= thresholds[currentStep + 1] &&
                !isManualScrolling
            ) {
                currentStep++;
                swiperHistory.slideTo(currentStep);
            }

            if (
                currentStep > 0 &&
                event.progress < thresholds[currentStep] &&
                !isManualScrolling
            ) {
                currentStep--;
                swiperHistory.slideTo(currentStep);
            }

            progressScale.style.width = `${event.progress * 100}%`;
        },
    });

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

        const targetProgress = targetIndex / SLIDES_COUNT;
        const scrollY = swiperScrollTrigger.start + targetProgress * (swiperScrollTrigger.end - swiperScrollTrigger.start);

        isManualScrolling = true;
        gsap.to(window, { duration: 0.3, scrollTo: scrollY });
        setTimeout(() => isManualScrolling = false, 300)
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
            swiper.slideTo(targetIndex);

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
        swiperHistory.slideTo(swiper.clickedIndex);

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