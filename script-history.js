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
    // const swiperScrollTriggerEND = ScrollTrigger.create({
    //     trigger: footerEl,
    //     start: "top bottom",
    //     end: "top bottom",
    //     onEnter: (event) => {
    //         console.log(event)
    //         // const style = swiperScrollTrigger.saveStyles()
    //         swiperScrollTrigger.disable()
    //     },
    //     onEnterBack: (event) => {
    //         console.log('enback', event)
    //         swiperScrollTrigger.enable()
    //     },
    // });

    // Слайдер
    let swiperHistory = new Swiper(".swiper-history", {
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
    const toggleText = (index, refreshDelay) => {
        const tesxtEls = document.querySelectorAll('.history-slider-text');
        tesxtEls.forEach(el => {
            if (el.classList.contains(`text-index-${index}`)) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
        
        setTimeout(() => swiperScrollTrigger.refresh(true), refreshDelay);
    }
    swiperHistory.on('slideChange', (swiper) => {
        if (activeBullet) {
            activeBullet.classList.remove('active');
        }
        activeBullet = swiperHistoryPagination.slides[swiper.activeIndex];;
        activeBullet.classList.add('active');


        toggleText(swiper.activeIndex, swiper.params.speed);
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
    });
    let activeBullet = swiperHistoryPagination.slides[0];
    swiperHistoryPagination.on('click', (swiper) => {
        if (activeBullet) {
            activeBullet.classList.remove('active');
        }
        activeBullet = swiper.clickedSlide;
        activeBullet.classList.add('active');
        swiperHistory.slideTo(swiper.clickedIndex);
    });

    /*END СЛАЙДЕР ИСТОРИИ*/
})