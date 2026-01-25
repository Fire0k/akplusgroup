/* Start:"a:4:{s:4:"full";s:51:"/local/templates/ak_plus/js/main.js?176652305110566";s:6:"source";s:35:"/local/templates/ak_plus/js/main.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
$(function () {
    function upadateValue() {
        $.ajax({
            url: "/local/ajax/getData.php",
            method: "get",
            dataType: "json",
            success: function (data) {
                let search = data.search.replace(/\s/g, "");
                let trevel = data.trevel.replace(/\s/g, "");
                $(".js-counter").html(parseInt(search).toLocaleString("ru-Ru"));
                $(".js-counter-2").html(
                    parseInt(trevel).toLocaleString("ru-Ru"),
                );
            },
        });
    }
    upadateValue();

    setInterval(upadateValue, 5000);

    const section = document.querySelector("#directions");
    const cards = document.querySelectorAll(".dir-card");

    cards.forEach((card) => {
        card.addEventListener("mouseenter", () => focusCard(card));
        card.addEventListener("click ", () => focusCard(card));
    });
    function focusCard(card) {
        const bg = card.dataset.bg; // путь к картинке
        const bg_sec = card.dataset.bg_sec; // путь к картинке для общего бека

        // фон секции
        section.style.setProperty("--section-bg-image", `url("${bg_sec}")`);

        // активная карточка
        cards.forEach((c) => {
            c.classList.toggle("is-active", c === card);
            // фон самой карточки
            if (c === card) {
                c.style.backgroundImage = `url("${bg}")`;
            } else {
                c.style.backgroundImage = "";
            }
        });

        section.classList.add("has-active");
    }

    section.addEventListener("mouseleave", () => {
        section.style.setProperty("--section-bg-image", "none");
        cards.forEach((c) => {
            c.classList.remove("is-active");
            c.style.backgroundImage = "";
        });
        section.classList.remove("has-active");
    });

    /*АНИМАЦИЯ ЦИФР*/

    const figure = document.querySelector(".figure__flex__item");
    const time = 1000;

    function outNum(num, elem, step) {
        let n = 0;
        let res = 0;
        let t = Math.round(time / (num / step));
        let interval = setInterval(() => {
            n = parseFloat(n) + parseFloat(step);
            if (n >= num) {
                clearInterval(interval);
            }
            if (Number.isInteger(n)) res = n;
            else res = n.toFixed(1);

            $(elem).text(res);
        }, t);
    }

    const observer2 = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    $(".figure__flex").css("opacity", "1");
                    setTimeout(function () {
                        $(".out-num").each(function (index, el) {
                            let tmp = $(el).data("max");
                            let step = $(el).data("step");
                            outNum(tmp, el, step);
                        });
                    }, 900);
                    observer2.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 1,
        },
    );

    observer2.observe(figure);

    /*ПУТЕШЕСТВИЕ В 1 КЛИК АНИМАЦИЯ*/
    /**
     * Интерполяция занчения одного диапазона в соответсвующее значение из другого диапазона
     * Для определения значений стилей, зависящих от прокрутки страницы
     */
    function mapRange(value, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
    }

    const body = document.querySelector("body");
    const containerOneClick = document.getElementById("js__one__click");
    const titleWrapper = containerOneClick.querySelector(".one__screen__text");
    const title = titleWrapper.querySelector("h2");
    const firstScreen = containerOneClick.querySelector(".one__screen");
    const secondScreen = containerOneClick.querySelector(".two__screen");

    // Отображение финального экрана
    let secondScreenShowed = false;

    // Установка максимального скейла в зависимости от ширины вьюпорта, можно корректировать
    let maxScale = 150;
    if (window.innerWidth <= 1776) {
        maxScale = 170;
    }
    if (window.innerWidth <= 1500) {
        maxScale = 190;
    }
    if (window.innerWidth <= 1200) {
        maxScale = 290;
    }
    if (window.innerWidth <= 768) {
        maxScale = 400;
    }

    const isMobile = window.innerWidth <= 820;

    /**
     * scrollProgress - текущий прогресс скролла внутри анимируемого блока, от 0 на старте до 1 в пощиции страницы, где анимация должна закончиться
     * animateProgress - высчитываем интерполяцией, по прогрессу скролла от 0 до ~0.7, для небольшого запаса внизу
     * endShowingPoint - прогресс, при котором должна закончиться анимация появления, можно регулировать
     * startScalingPoint - прогресс, при котором должна начаться анимация скейла, можно регулировать
     */
    const endShowingPoint = 0.15;
    const startScalingPoint = 0.35;
    function animate(scrollProgress) {
        if (secondScreenShowed || isMobile) return;

        const animateProgress = mapRange(scrollProgress, 0, 0.7, 0, 1);

        if (animateProgress <= 0) {
            title.style.opacity = 0;
            title.style.transform = `translateY(100%)`;

            return;
        }

        if (animateProgress >= 1) {
            title.style.opacity = 1;
            title.style.transform = `scale(${maxScale})`;

            if (!secondScreenShowed) {
                secondScreenShowed = true;

                body.classList.add("lock-scroll");

                secondScreen.classList.add("animate-show");

                setTimeout(() => {
                    secondScreen.classList.remove("animate-show");
                    secondScreen.classList.add("show");

                    firstScreen.classList.add("hide");

                    smoother.scrollTo(containerOneClick, false, "top top");
                }, 1000);
                setTimeout(() => {
                    body.classList.remove("lock-scroll");
                }, 4100);
            }

            return;
        }

        if (animateProgress <= endShowingPoint) {
            title.style.opacity = mapRange(
                animateProgress,
                0,
                endShowingPoint,
                0,
                1,
            );
            title.style.transform = `translateY(${100 - mapRange(animateProgress, 0, endShowingPoint, 0, 100)}%)`;
        } else {
            title.style.opacity = 1;
            const scale = Math.max(
                mapRange(animateProgress, startScalingPoint, 1, 0, maxScale),
                1,
            );
            title.style.transform = `scale(${scale})`;
        }
    }

    /**
     * @see https://gsap.com/docs/v3/Plugins/ScrollTrigger/
     * @see https://gsap.com/docs/v3/Plugins/ScrollSmoother/
     *
     * smooth: Number - the time (in seconds) that it takes to "catch up" to the native scroll position. By default, it is 0.8 seconds.
     * smoothTouch: Boolean | Number - by default, ScrollSmoother will NOT apply scroll smoothing on touch-only devices (like phones)
     * because that typically feels odd to users when it disconnects from their finger's drag position,
     * but you can force smoothing on touch devices too by setting smoothTouch: true (same as smooth value) or specify an amount like smoothTouch: 0.1 (in seconds).
     */
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    const smoother = ScrollSmoother.create({
        smooth: 1, //
        smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
    });
    const desktopAnimate = ScrollTrigger.create({
        trigger: titleWrapper,
        pin: true,
        start: "top top",
        pinSpacing: false,
        endTrigger: containerOneClick,
        end: "bottom bottom",
        onUpdate: (self) => {
            animate(self.progress);
        },
        once: true,
        fastScrollEnd: true,
    });
    const mobileAnimate = gsap.to(title, {
        scrollTrigger: {
            trigger: titleWrapper,
            start: "top top",
            pinSpacing: false,
            once: true,
            pin: true,
        },
        keyframes: {
            "0%": { opacity: 0, y: 0, yPercent: 100 },
            "15%": { opacity: 1, y: 0, yPercent: 0, scale: 1 },
            "25%": { opacity: 1, y: 0, yPercent: 0, scale: 1 },
            "100%": { opacity: 1, y: 0, yPercent: 0, scale: 450 },
        },
        duration: 3,
        onStart: () => {
            smoother.paused(true);
        },
        onComplete: () => {
            secondScreen.classList.add("animate-show");

            setTimeout(() => {
                secondScreen.classList.remove("animate-show");
                secondScreen.classList.add("show");

                firstScreen.classList.add("hide");

                smoother.scrollTo(containerOneClick, false, "top top");
            }, 1000);

            setTimeout(() => {
                smoother.paused(false);
                secondScreenShowed = true;
            }, 3100);
        },
    });

    if (isMobile) {
        desktopAnimate.kill();
    } else {
        mobileAnimate.kill();
    }

    /**
     * Обновляем скролл-тригеры при изменениях размера документа
     */
    const resizeObserver = new ResizeObserver(() => {
        if (mobileAnimate?.scrollTrigger) {
            mobileAnimate.scrollTrigger.refresh();
        }
        if (desktopAnimate) {
            desktopAnimate.refresh();
        }
    });
    resizeObserver.observe(document.body);
    /*END ПУТЕШЕСТВИЕ В 1 КЛИК АНИМАЦИЯ*/

    /*Слайдер*/

    const swiper = new Swiper(".block__slider__one", {
        slidesPerView: 1,
        autoHeight: false,
        spaceBetween: 0,
        autoplay: {
            delay: 8000,
        },
        pagination: {
            el: ".pagination",
            type: "bullets",
            clickable: true,
        },
        speed: 900,
        loop: true,
        stopOnLastSlide: false,
    });

    /*Отслеживанием ширину экрана*/

    const widthWin = $("body").width();

    if (widthWin < 1200) {
        $("#directions .directions__grid").hide();
        $(".clients .clients__flex").hide();

        if (widthWin > 620) {
            $(".directions_swiper article").each(function (index, el) {
                let back = $(el).data("tablet");
                $(el).css("backgroundImage", `url("${back}")`);
            });
        } else {
            $(".directions_swiper article").each(function (index, el) {
                let back = $(el).data("mobile");
                $(el).css("backgroundImage", `url("${back}")`);
            });
        }

        $("#directions .directions__slider")
            .show()
            .closest(".container")
            .removeClass("container");

        const swiper2 = new Swiper(".directions__slider", {
            slidesPerView: 1,
            autoHeight: false,
            spaceBetween: 0,
            autoplay: {
                delay: 8000,
            },
            pagination: {
                el: ".directions__slider .pagination",
                type: "bullets",
                clickable: true,
            },
            speed: 900,
            loop: true,
            stopOnLastSlide: false,
        });

        $(".clients__slider").show();

        const swiper3 = new Swiper(".clients__slider", {
            slidesPerView: widthWin > 620 ? 2 : 1,
            autoHeight: false,
            spaceBetween: 0,
            navigation: {
                nextEl: ".nav-next",
                prevEl: ".nav-prev",
            },
            speed: 900,
            loop: true,
            stopOnLastSlide: false,
        });
    }

    if (widthWin < 620) {
        $(".block__slider__one .swiper-slide").each(function (index, el) {
            $(el)
                .css("backgroundImage", 'url("img/back_mob_slider.png")')
                .find(".flex__slide__text")
                .next()
                .remove();
        });
    }


    /**
     * Библиотека для модалок не дружит со ScrollSmoother
     * Небольшой костыль для временного отключения смузера при открытии модалки
     * и включения при закрытии
     */
    const modalButtons = document.querySelectorAll('[data-hystmodal="#callback"]');
    modalButtons.forEach(button => button.onclick = () => smoother.paused(true));

    const modalCloseButton = document.querySelector('[data-hystclose]');
    modalCloseButton.onclick = () => setTimeout(() => smoother.paused(false), 10);
});
/* End */ /* /local/templates/ak_plus/js/main.js?176652305110566*/
