$(function () {
    /*СЛАЙДЕР ИСТОРИИ*/

    const swiperEl = document.querySelector(".scroll-anchor");
    const footerEl = document.querySelector("footer");

    // Якорь для скролла
    gsap.registerPlugin(ScrollTrigger);
    const swiperScrollTrigger = ScrollTrigger.create({
        trigger: swiperEl,
        pin: true,
        start: "top top",
        pinSpacing: false,
        endTrigger: footerEl,
        end: "top bottom",
    });

    // Слайдер
    let swiperHistory = new Swiper(".swiper-history", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        init: false,
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
        },
    });
    const toggleText = (index) => {
        const tesxtEls = document.querySelectorAll('.history-slider-text');
        tesxtEls.forEach(el => {
            if (el.classList.contains(`text-index-${index}`)) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
        
        swiperScrollTrigger.refresh();
    }
    swiperHistory.on('init', function(event) {
        toggleText(event.activeIndex);
    });
    swiperHistory.on('slideChange', (swiper) => {
        if (activeBullet) {
            activeBullet.classList.remove('active');
        }
        activeBullet = swiperHistoryPagination.slides[swiper.activeIndex];;
        activeBullet.classList.add('active');

        toggleText(swiper.activeIndex);
    });
    swiperHistory.on('click', (swiper, event) => {
        const { clientX, clientY } = event;

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
        }
    });
    swiperHistory.init();

    // Пагинация
    let swiperHistoryPagination = new Swiper(".swiper-history-pagination", {
        slidesPerView: 'auto',
        freeMode: true,
        mousewheel: true,
        init: false,
    });
    let activeBullet;
    swiperHistoryPagination.on('init', (swiper) => {
       if (activeBullet) {
            activeBullet.classList.remove('active');
        }
        activeBullet = swiper.slides[0];
        activeBullet.classList.add('active');
        swiperHistory.slideTo(swiper.clickedIndex);
    });
    swiperHistoryPagination.on('click', (swiper) => {
        if (activeBullet) {
            activeBullet.classList.remove('active');
        }
        activeBullet = swiper.clickedSlide;
        activeBullet.classList.add('active');
        swiperHistory.slideTo(swiper.clickedIndex);
    });
    swiperHistoryPagination.init();

    /*END СЛАЙДЕР ИСТОРИИ*/
})