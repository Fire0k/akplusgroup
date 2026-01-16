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

    // Блок заголовка во вьюпорте
    let titleInView = false;
    // Отображение финального экрана
    let secondScreenShowed = false;

    /**
     * pageY при старте анимации вывода заголовка из прозрачности,
     * по совместительству соответсвует положению документа при котором блок у верхней границы вьюпорта
     */
    let startShowingPosition;
    // pageY при котором заголовок должен завершить анимацию скейла
    let endScalingPosition;

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
     * animateProgress - текущий прогресс скролла внутри анимируемого блока, от 0 на старте до 1 в пощиции страницы, где анимация должна закончиться
     * endShowingPoint - прогресс, при котором должна закончиться анимация появления, можно регулировать
     * startScalingPoint - прогресс, при котором должна начаться анимация скейла, можно регулировать
     */
    let animateProgress = 0;
    const endShowingPoint = 0.15;
    const startScalingPoint = 0.35;
    function animate() {
        if (animateProgress <= 0) {
            title.style.opacity = 0;
            title.style.transform = `translateY(100%)`;

            return;
        }

        if (animateProgress >= 1) {
            title.style.opacity = 1;
            title.style.transform = `scale(${maxScale})`;

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
    window.addEventListener('scroll', (e) => {
        // ничего не делаем, если нет нужных блоков или уже выведен финальный экран
        if (!containerOneClick || !title || !secondScreen || secondScreenShowed) return;

        /**
         * Проверяем топ координату контейнера заголовка
         * Если она больше нуля - контейнер еще не во вьюпорте, возвращаем его стили к изначальным
         */
        const { top } = titleWrapper.getBoundingClientRect();
        if (top > 0) {
            if (!secondScreenShowed) {
                animateProgress = 0;
                animate();
            }
            return;
        };

        /**
         * На мобильных при попадании в блок блокируем скролл и добавляем класс для автоматической анимации
         * Ставим таймаут по длительности этой анимации и после её завершения анимируем появление финального блока
         * аналогично с вариантом ниже для анимации по скроллу
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

        /**
         * Ловим момент появления блока заголовка во вьюпорте
         * Высчитываем пограничные значения pageY для конца анимаци
         */
        if (!titleInView) {
            titleInView = true;
            startShowingPosition = window.scrollY;
            endScalingPosition = 
                startShowingPosition + containerOneClick.getBoundingClientRect().height - window.innerHeight - secondScreen.getBoundingClientRect().height;
        }

        /**
         * Считаем прогресс анимации по проценту скролла между стартовой точкой анимации и конечной
         */
        if (animateProgress < 1) {
            animateProgress = mapRange(window.scrollY, startShowingPosition, endScalingPosition, 0, 1);
            animate();

            return;
        }


        /**
         * Блокируем скролл документа на время анимации появления финального экрана
         * Устанавливаем переходный временный класс
         * По таймаутам вначале установятся финальные классы,
         * страница проскроллится во второй экран (необходимо т.к. меняется высота документа)
         * затем после всех анимаций разблокируется скролл документа
         * 
         * Подробнее в комментах css
         */
        if (!secondScreenShowed && animateProgress >= 1) {
            secondScreenShowed = true;

            body.classList.add('lock-scroll');

            secondScreen.classList.add('animate-show');

            setTimeout(() => {
                secondScreen.classList.remove('animate-show');
                secondScreen.classList.add('show');

                firstScreen.classList.add('hide');

                window.scrollTo({ top: containerOneClick.offsetTop });

            }, 1000);
            setTimeout(() => {
                body.classList.remove('lock-scroll');
            }, 4100);
        }
    });