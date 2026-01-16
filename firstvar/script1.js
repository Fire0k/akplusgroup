
; /* Start:"a:4:{s:4:"full";s:51:"/local/templates/ak_plus/js/main.js?176652305110566";s:6:"source";s:35:"/local/templates/ak_plus/js/main.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
$(function (){

function upadateValue()
{
    $.ajax({
        url: '/local/ajax/getData.php',
        method: 'get',
        dataType: 'json',
        success: function(data){ 
            let search = data.search.replace(/\s/g, '');
            let trevel = data.trevel.replace(/\s/g, '');
            $('.js-counter').html(parseInt(search).toLocaleString('ru-Ru'));
            $('.js-counter-2').html(parseInt(trevel).toLocaleString('ru-Ru'));
        }
    });
}
upadateValue();

setInterval(upadateValue ,5000);

const section = document.querySelector('#directions');
const cards = document.querySelectorAll('.dir-card');

cards.forEach(card => {
    card.addEventListener('mouseenter', () => focusCard(card));
    card.addEventListener('click ', () => focusCard(card));
});
function focusCard(card) {
    const bg = card.dataset.bg; // путь к картинке
    const bg_sec = card.dataset.bg_sec; // путь к картинке для общего бека

    // фон секции
    section.style.setProperty('--section-bg-image', `url("${bg_sec}")`);

    // активная карточка
    cards.forEach(c => {
        c.classList.toggle('is-active', c === card);
        // фон самой карточки
        if (c === card) {
            c.style.backgroundImage = `url("${bg}")`;
        } else {
            c.style.backgroundImage = '';
        }
    });

    section.classList.add('has-active');
}

section.addEventListener('mouseleave', () => {
    section.style.setProperty('--section-bg-image', 'none');
    cards.forEach(c => {
        c.classList.remove('is-active');
        c.style.backgroundImage = '';
    });
    section.classList.remove('has-active');
});


    /*АНИМАЦИЯ ЦИФР*/

    const figure = document.querySelector('.figure__flex__item');
    const time = 1000;

    function outNum(num, elem,step) {
        let n = 0;
        let res = 0;
        let t = Math.round(time / (num / step));
        let interval = setInterval(() => {
            n = parseFloat(n) + parseFloat(step);
            if (n >= num) {
                clearInterval(interval);
            }
            if(Number.isInteger(n))
                res = n;
            else
                res = n.toFixed(1);

            $(elem).text(res);
        }, t);
    }

    const observer2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            $('.figure__flex').css('opacity','1');
            setTimeout(function () {
                $('.out-num').each(function (index,el) {
                    let tmp = $(el).data('max');
                    let step = $(el).data('step');
                    outNum(tmp, el,step);
                });
            }, 900);
          observer2.unobserve(entry.target);
        }
      });
    }, {
      threshold: 1
    });

    observer2.observe(figure);



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
    // Завершена анимация вывода заголовка из прозрачности
    let titleShowed = false;
    // Завершена анимация скейла заголовка
    let titleScaled = false;

    // Отображение финального экрана
    let secondScreenShowed = false;

    /**
     * pageY при старте анимации вывода заголовка из прозрачности,
     * по совместительству соответсвует положению документа при котором блок у верхней границы вьюпорта
     */
    let startShowingPosition;
    // pageY при старте анимации скейла
    let startScalingPosition;

    // pageY при котором заголовок должен завершить анимацию вывода из прозрачности
    let endShowingPosition;
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

    window.addEventListener('scroll', (e) => {
        // ничего не делаем, если нет нужных блоков или уже выведен финальный экран
        if (!containerOneClick || !title || !secondScreen || secondScreenShowed) return;

        /**
         * Проверяем топ координату контейнера заголовка
         * Если она больше нуля - контейнер еще не во вьюпорте, возвращаем его стили к изначальным
         */
        const { top } = containerOneClick.querySelector('.one__screen__text').getBoundingClientRect();
        if (top > 0) {
            if (!titleScaled) {
                title.style.opacity = 0;
                title.style.transform = `translateY(100%)`;
            }
            return;
        };

        /**
         * Ловим момент появления блока заголовка во вьюпорте
         * Высчитываем пограничные значения pageY для конца анимаций
         */
        if (!titleInView) {
            titleInView = true;
            startShowingPosition = window.scrollY;
            endShowingPosition = startShowingPosition + title.getBoundingClientRect().height;
            endScalingPosition = 
                startShowingPosition + containerOneClick.getBoundingClientRect().height - window.innerHeight - secondScreen.getBoundingClientRect().height;
        }

        // Если скроллим ниже точки конца анимации opacity - искуственно завершаем её
        if (window.scrollY >= endShowingPosition) {
            if (!titleShowed) {
                title.style.opacity = 1;
                title.style.transform = `translateY(0)`;
            }
            titleShowed = true;
        // Если скроллим вверх не завершив скейл - заголовок будет уходить в прозрачность
        } else {
            if (!titleScaled) {
                titleShowed = false;
            }
        };

        /**
         * Регулируем прозрачность и положение
         * превращая pageY в соответствующие значения стилей
         * Можно поиграться с коэффициентами, но лучше не надо - см. комменты в css
         */
        if (!titleShowed) {
            title.style.opacity = mapRange(window.scrollY, startShowingPosition, endShowingPosition, 0, 1);
            title.style.transform = `translateY(${100 - mapRange(window.scrollY, startShowingPosition, endShowingPosition, 0, 100)}%)`;
            // + для задержки начала скейла, можно увеличить\уменьшить по вкусу
            startScalingPosition = window.scrollY + 500;
            return;
        }

        if (window.scrollY >= endScalingPosition) {
            title.style.transform = `scale(${maxScale})`;
            titleScaled = true;
        }

        /**
         * Регулируем скейл
         * превращая pageY в соответствующие значения скейла
         * Можно поиграться с коэффициентами, но лучше не надо - см. комменты в css
         */
        if (!titleScaled) {
            const scale = Math.max(mapRange(window.scrollY, startScalingPosition, endScalingPosition, 0, maxScale), 1);
            title.style.transform = `scale(${scale})`;
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
        if (!secondScreenShowed) {
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

    /*Слайдер*/

    const swiper = new Swiper('.block__slider__one', {
        slidesPerView: 1,
        autoHeight: false,
        spaceBetween: 0,
        autoplay: {
            delay: 8000,
        },
        pagination: {
            el: '.pagination',
            type: 'bullets',
            clickable: true,
        },
        speed: 900,
        loop:true,
        stopOnLastSlide: false
    });




    /*Отслеживанием ширину экрана*/

    const widthWin = $('body').width();

    if(widthWin < 1200)
    {
        $('#directions .directions__grid').hide();
        $('.clients .clients__flex').hide();

        if(widthWin > 620){
            $('.directions_swiper article').each(function(index, el) {
                let back = $(el).data('tablet');
                $(el).css('backgroundImage', `url("${back}")`);
            });
        }else{
            $('.directions_swiper article').each(function(index, el) {
                let back = $(el).data('mobile');
                $(el).css('backgroundImage', `url("${back}")`);
            });
        }

        $('#directions .directions__slider').show().closest('.container').removeClass('container');

        const swiper2 = new Swiper('.directions__slider', {
            slidesPerView: 1,
            autoHeight: false,
            spaceBetween: 0,
            autoplay: {
                delay: 8000,
            },
            pagination: {
                el: '.directions__slider .pagination',
                type: 'bullets',
                clickable: true,
            },
            speed: 900,
            loop:true,
            stopOnLastSlide: false
        });


        $('.clients__slider').show();

        const swiper3 = new Swiper('.clients__slider', {
            slidesPerView: ((widthWin > 620) ? 2 : 1),
            autoHeight: false,
            spaceBetween: 0,
            navigation: {
                nextEl: '.nav-next',
                prevEl: '.nav-prev',
            },
            speed: 900,
            loop:true,
            stopOnLastSlide: false
        });
    }

    if(widthWin < 620)
    {
        $('.block__slider__one .swiper-slide').each(function(index, el) {
            $(el).css('backgroundImage', 'url("img/back_mob_slider.png")').find('.flex__slide__text').next().remove();
        });
    }



});
/* End */
;; /* /local/templates/ak_plus/js/main.js?176652305110566*/
