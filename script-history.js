$(function () {
    /*СЛАЙДЕР ИСТОРИИ*/
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
        pagination: {
            el: ".swiper-history-pagination",
            clickable: true,
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
        })
    }
    
    swiperHistory.on('init', function(event) {
        toggleText(event.activeIndex);
    });
    swiperHistory.on('slideChange', (event) => {
        toggleText(event.activeIndex);
    });
    swiperHistory.init();

    const swiperEl = document.querySelector(".swiper-history");
    const textEl = document.querySelector(".history-slider-text");

    const swiperScrollTrigger = ScrollTrigger.create({
        trigger: swiperEl,
        pin: true,
        start: "top top",
        pinSpacing: false,
        endTrigger: textEl,
        end: "bottom bottom",
        fastScrollEnd: true,
    });
    /*END СЛАЙДЕР ИСТОРИИ*/
})