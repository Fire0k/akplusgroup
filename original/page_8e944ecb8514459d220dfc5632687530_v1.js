
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



  /*АНИМАЦИЯ ЗАГОЛОВКА СВЕРХУ*/
    const blurTextElems = document.querySelectorAll('#blurText, #blurText_2');

    function prepareLetters(el) {
        const text = el.textContent;
        el.textContent = '';

        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('blur-letter');
            el.appendChild(span);
        });
    }

    blurTextElems.forEach(prepareLetters);

    function animateLetters(container, baseDelay = 0) {
        const letters = container.querySelectorAll('.blur-letter');

        letters.forEach((letter, index) => {
            setTimeout(() => {
                letter.classList.add('show');
            }, baseDelay + index * 50); // 50 мс между буквами
        });
    }


    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'blurText') {
                    animateLetters(entry.target, 0);
                } else if (entry.target.id === 'blurText_2') {
                    animateLetters(entry.target, 400);
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });

    setTimeout(function () {
        blurTextElems.forEach(el => observer.observe(el));
    }, 400);


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



    /*ПУТЕШЕСТВИЕ В 1 КЛИЕ АНИМАЦИЯ*/

    const observer3 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting)
        {
            const top = $(containerOneClick).offset().top;
            $('html, body').stop().animate({ scrollTop: top }, 100, function () {
                start(); 
            });
        }
      });
    }, {
      threshold: 0.8
    });

    const containerOneClick = document.getElementById('js__one__click');
    observer3.observe(containerOneClick);

    function start()
    {
        var Scale = 1;
        const maxScale = ($(window).width() < 767) ? 210 : 110;
        var isLocked = true;
        const zoomText = $('#js__one__click .one__screen h2');
        const titleEl = zoomText.get(0);
        const anchorEl = document.getElementById('anchorChar');

        $('body').addClass('lock-scroll');

        /* ======================
           DESKTOP — WHEEL
        ====================== */

        window.addEventListener('wheel', function (e)
        {
            if (!isLocked) return;
            e.preventDefault();

            if (e.deltaY <= 0)
            {
                if(Scale > 1)
                    Scale -= Math.abs(e.deltaY) * 0.02;
                else
                    finish(false);
                
            }else if(e.deltaY >= 0)
            {
                Scale += Math.abs(e.deltaY) * 0.02

                if (Scale >= maxScale)
                {
                    Scale = maxScale;
                    finish();
                    return;
                }
            }
            zoomText.css('transform', `scale(${Scale})`);

        },{ passive: false });

        /* ======================
           MOBILE — TOUCH
        ====================== */
        let touchStartY = 0;

        window.addEventListener('touchstart', function (e)
        {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchmove', function (e)
        {
            if (!isLocked) return;

            e.preventDefault();

            const currentY = e.touches[0].clientY;
            const deltaY = touchStartY - currentY;
            touchStartY = currentY;

            Scale += Math.abs(deltaY) * 0.5;

            if (Scale >= maxScale)
            {
                Scale = maxScale;
                finish();
                return;
            }

            zoomText.css('transform', `scale(${Scale})`);

        }, { passive: false });

        function finish(status = true)
        {
            if(status)
            {
                $('.one__screen').addClass('start')
                Scale = maxScale;
                zoomText.css('transform', `scale(${Scale})`);
                isLocked = false;
                animate();
                observer3.unobserve(containerOneClick);
            }else{
                zoomText.css('transform', `scale(${Scale})`);
                isLocked = false;
                $('body').removeClass('lock-scroll');
            }
        }
    }


    function animate()
    {

        setTimeout(function () {
            let html = $('#js__one__click .two__screen').html();
            $('.one__screen').html(html);
            $('.one__screen').addClass('animate');
        },1000);

        setTimeout(function ()
        {
            let finishedCount = 6;
            let counter = 1;

            let intervalScale = setInterval(() => {

                if (finishedCount === counter){
                    clearInterval(intervalScale);
                    $('body').removeClass('lock-scroll');
                }

                $(`.animate_${counter}`).css('visibility','visible').css('opacity','1');
                counter++;

            }, 400);

        },1300);
    }

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
