$(function () {
    /*СЛАЙДЕР ИСТОРИИ*/
    const swiperEl = document.querySelector(".swiper-history");
    const footerEl = document.querySelector("footer");

    const swiperScrollTrigger = ScrollTrigger.create({
        trigger: swiperEl,
        pin: true,
        start: "top top",
        pinSpacing: false,
        endTrigger: footerEl,
        end: "top bottom",
    });

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
        });
        
        swiperScrollTrigger.refresh();
    }

    swiperHistory.on('init', function(event) {
        toggleText(event.activeIndex);
    });
    swiperHistory.on('slideChange', (event) => {
        toggleText(event.activeIndex);
    });
    swiperHistory.init();
    /*END СЛАЙДЕР ИСТОРИИ*/
})