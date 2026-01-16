/*ПУТЕШЕСТВИЕ В 1 КЛИК АНИМАЦИЯ*/

    /**
     * Интерполяция занчения одного диапазона в соответсвующее значение из другого диапазона
     * Для определения значений стилей, зависящих от прокрутки страницы
     */
    function mapRange(value, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
    }

    const body = document.querySelector('body');
    const containerOneClick = document.getElementById('js__one__click');
    const titleWrapper = containerOneClick.querySelector('.one__screen__text')
    const title = titleWrapper.querySelector('h2');
    const firstScreen = containerOneClick.querySelector('.one__screen');
    const secondScreen = containerOneClick.querySelector('.two__screen');

    // Отображение финального экрана
    let secondScreenShowed = false;

    // Установка максимального скейла в зависимости от ширины вьюпорта, можно корректировать
    let maxScale = 150;
    if (window.innerWidth <= 1776) {
        maxScale = 170;
    } 
    if (window.innerWidth <= 1500) {
        maxScale = 190;
    };
    if (window.innerWidth <= 1200) {
        maxScale = 290;
    };
    if (window.innerWidth <= 768) {
        maxScale = 400;
    };
    
    const isMobile = window.innerWidth <= 768;

    /**
     * scrollProgress - текущий прогресс скролла внутри анимируемого блока, от 0 на старте до 1 в пощиции страницы, где анимация должна закончиться
     * animateProgress - высчитываем интерполяцией, по прогрессу скролла от 0 до ~0.7, для небольшого запаса внизу
     * endShowingPoint - прогресс, при котором должна закончиться анимация появления, можно регулировать
     * startScalingPoint - прогресс, при котором должна начаться анимация скейла, можно регулировать
     */
    const endShowingPoint = 0.15;
    const startScalingPoint = 0.35;
    function animate(scrollProgress) {
        if (secondScreenShowed) return;

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

                body.classList.add('lock-scroll');

                secondScreen.classList.add('animate-show');

                setTimeout(() => {
                    secondScreen.classList.remove('animate-show');
                    secondScreen.classList.add('show');

                    firstScreen.classList.add('hide');

                    smoother.scrollTo(containerOneClick, false, 'top top');

                }, 1000);
                setTimeout(() => {
                    body.classList.remove('lock-scroll');
                }, 4100);
            }

            return;
        }

        if (animateProgress <= endShowingPoint) {
            title.style.opacity = mapRange(animateProgress, 0, endShowingPoint, 0, 1);
            title.style.transform = `translateY(${100 - mapRange(animateProgress, 0, endShowingPoint, 0, 100)}%)`;
        } else {
            title.style.opacity = 1;
            const scale = Math.max(mapRange(animateProgress, startScalingPoint, 1, 0, maxScale), 1);
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
    ScrollTrigger.create({
        trigger: titleWrapper,
        pin: true,
        start: "top top",
        pinSpacing: false,
        endTrigger: containerOneClick,
        end: 'bottom bottom',
        onUpdate: (self) => {
            animate(self.progress);
        },
        once: true,
        fastScrollEnd: true,
    });

    window.addEventListener('scroll', () => {
        // ничего не делаем, в десктопе, а так же если нет нужных блоков или уже выведен финальный экран
        if (!isMobile || !containerOneClick || secondScreenShowed) return;

        /**
         * Проверяем топ координату контейнера заголовка
         * Если она больше нуля - контейнер еще не во вьюпорте, возвращаем его стили к изначальным
         */
        const { top } = containerOneClick.getBoundingClientRect();
        if (top > 0) {
            return;
        };

        /**
         * На мобильных при попадании в блок блокируем скролл и добавляем класс для автоматической анимации
         * Ставим таймаут по длительности этой анимации и после её завершения анимируем появление финального блока
         */
        if (isMobile) {
            if (!containerOneClick.classList.contains('mobile-animate')) {
                secondScreenShowed = true;
                
                window.scrollTo({ top: containerOneClick.offsetTop });
                body.classList.add('lock-scroll');
                containerOneClick.classList.add('mobile-animate');

                setTimeout(() => {
                    secondScreen.classList.add('animate-show');
                }, 3000);
                setTimeout(() => {
                    secondScreen.classList.remove('animate-show');
                    secondScreen.classList.add('show');

                    firstScreen.classList.add('hide');

                    window.scrollTo({ top: containerOneClick.offsetTop });

                }, 4000);
                setTimeout(() => {
                    body.classList.remove('lock-scroll');
                }, 7100);
            }
            return;
        }
    });