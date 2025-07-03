function initToc() {
    if (typeof headerString !== 'undefined') {
        if (!hbeToc()) {
            let filteredHeadings = getFilteredHeadings();
            createToc(filteredHeadings);
            activeTocItem(filteredHeadings);
            tocPercentage();
            document.addEventListener('scroll', function (event) {
                activeTocItem(filteredHeadings);
                tocPercentage();
            });
        }
    }
}

function tocPercentage() {
    const top = $('article').offset().top;
    const bottom = $('article').offset().top + $('article').outerHeight();
    const scrollTop = $(window).scrollTop();
    const scrollBottom = scrollTop + $(window).height();
    const progress = (scrollTop - top) / bottom;
    const scrollProgress = progress * scrollBottom + (1 - progress) * scrollTop;
    $('.toc-percentage').text(Math.max(0, Math.min(Math.round(((scrollProgress - (1 - progress) * top) / bottom) * 100), 100)));
}

function showAside() {
    var value = localStorage.getItem('aside-status');
    if (value === null) {
        localStorage.setItem('aside-status', 'true');
        value = true;
    }
    if (localStorage.getItem('aside-status') === 'false') {
        $('.main-wrapper').addClass('close-aside');
    }
}

function hbeToc() {
    if ($('.hbe-content').length > 0) {
        $('.main-wrapper').addClass('hbe-toc');
        return true
    } else {
        $('.main-wrapper').removeClass('hbe-toc');
        return false
    }
}

function getFilteredHeadings() {
    var headings = $('article').find(headerString);
    var filteredHeadings = headings.filter(function () {
        var heading = $(this);  // 当前的 heading 元素
        // 判断是否有 <a> 标签，且该 <a> 标签具有 'headerlink' 类
        return heading.find('a').length && heading.find('a').hasClass('headerlink');
    });
    return filteredHeadings
}

function createToc(filteredHeadings) {
    var tocList = [];
    var toc = $('<ol>').addClass('aside-bottom-toc-content');

    filteredHeadings.each(function (_, heading) {
        if (/^[0-9]/.test($(heading).attr('id'))) {
            $(heading).attr('id', '_' + $(heading).attr('id'));
        }
        var level = parseInt(heading.tagName.charAt(1));

        // 创建列表项和链接
        var li = $('<li>').addClass('toc-item toc-level-' + level);
        var a = $('<a>').addClass('toc-link').attr('href', '#' + heading.id);
        var span = $('<span>').addClass('text').text($(heading).text());

        a.append(span);

        a.on('click', function (e) {
            e.preventDefault();
            var target = $($(this).attr('href'));
            window.scrollTo({
                top: $(target).offset().top - 70,
                behavior: 'smooth'
            });
        });

        li.append(a);

        if (tocList.length > 0) {
            var flag = false;
            for (let i = tocList.length - 1; i >= 0; i--) {
                if (level > tocList[i].level) {
                    var tocChild = tocList[i].li.children('ol.toc-child');
                    if (tocChild.length === 0) {
                        tocChild = $('<ol>').addClass('toc-child');
                        tocList[i].li.append(tocChild);
                    }
                    tocChild.append(li);
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                toc.append(li);
            }
        } else {
            toc.append(li);
        }

        if (!tocCollapsed) {
            li.addClass('active');
        }

        tocList.push({ li, level });

        currentLevel = level;
    });

    $('.aside-bottom-toc-content').replaceWith(toc); // 将原来的目录替换为新的目录
}

function onShowAsideButton() {
    document.querySelector('.main-wrapper').classList.toggle('close-aside');

    var value = localStorage.getItem('aside-status');
    if (value === 'false' && typeof headerString !== 'undefined') {
        initToc();
    }
    localStorage.setItem('aside-status', value === 'true' ? 'false' : 'true');
}

function getTopHeadingId(filteredHeadings) {
    if (filteredHeadings) {
        let topHeadingId = null;
        let minDistanceFromTop = Infinity;

        filteredHeadings.each(function (_, heading) {
            const boundingRect = heading.getBoundingClientRect();
            if (boundingRect.y < window.innerHeight) {
                const distanceFromTop = Math.abs(boundingRect.y - 80);
                if (distanceFromTop < minDistanceFromTop) {
                    minDistanceFromTop = distanceFromTop;
                    topHeadingId = heading.id;
                }
            }
        });
        return topHeadingId;
    } else {
        return null;
    }
}

function activeTocItem(filteredHeadings) {
    const tocLinks = document.querySelectorAll('a.toc-link');
    const topHeadingId = getTopHeadingId(filteredHeadings);

    tocLinks.forEach(link => {
        link.classList.remove('active');
        if (tocCollapsed) {
            // 获取每个链接的父 <li> 元素
            const parentLi = link.closest('li');

            // 检查父 <li> 是否有 active 类
            if (parentLi && parentLi.classList.contains('active')) {
                // 移除 active 类
                parentLi.classList.remove('active');
            }
        }
    });

    tocLinks.forEach(link => {
        var href = decodeURIComponent(link.getAttribute('href')).replace(/^#/, '');
        if (href == topHeadingId) {
            link.classList.add('active');
            // 滚动到当前活动的 toc 项目
            var toc = document.querySelector('.aside-bottom-toc-content');
            var activeItem = toc.querySelector('.active');
            if (activeItem) {
                if (tocCollapsed) {
                    let parent = link.parentNode;
                    while (parent && !parent.classList.contains('aside-bottom-toc-content')) {
                        if (parent.classList && parent.classList.contains('toc-item')) {
                            parent.classList.add('active');
                        }
                        parent = parent.parentNode; // 向上遍历
                    }
                }

                toc.scrollTo({
                    top: activeItem.offsetTop - 80
                });
            }
        }
    });
}

function activeSeriesItem() {
    var series = document.querySelector('.aside-top-series-content');
    if (series) {
        var activeItem = series.querySelector('.active');
        if (activeItem) {
            series.scrollTo({
                top: activeItem.offsetTop - 400
            });
        }
    }
}