"use strict"

window.addEventListener('load', windowLoaded);

function windowLoaded() {
   document.addEventListener('click', documentEvents);
}

function documentEvents(e) {
   const targetElement = e.target;
   const header = document.querySelector('.header');

   if (targetElement == document.querySelector(".menu__icon")) {
      document.body.classList.add('_lock');
      header.classList.add('_menu-open');
   } else if (targetElement == document.querySelector('.menu__exit') || targetElement == document.querySelector('._lock')) {
      document.body.classList.remove('_lock');
      header.classList.remove('_menu-open');
   }

   if (targetElement.hasAttribute('data-video') || targetElement.closest('[data-play]') || targetElement.closest('[data-pause]')) {
      const videoElement = document.querySelector('[data-video]');

      if (videoElement.paused) {
         videoElement.play();
         videoElement.parentNode.classList.remove('_video-plause');
         videoElement.parentNode.classList.add('_video-play');
      } else {
         videoElement.pause();
         videoElement.parentNode.classList.remove('_video-play');
         videoElement.parentNode.classList.add('_video-plause');
      }
   }

   if (targetElement == document.querySelector('.search-form__icon')) {
      targetElement.classList.toggle('_search-active');
   }
}

// Header Scroll
let addWindowScrollEvent = false;

function headerScroll() {
   addWindowScrollEvent = true;
   const header = document.querySelector('.header');
   const headerShow = header.hasAttribute('data-scroll-show');
   const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
   const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
   let scrollDirection = 0;
   let timer;

   document.addEventListener('windowScroll', e => {
      const scrollTop = window.scrollY;
      clearTimeout(timer);

      if (scrollTop >= startPoint) {
         !header.classList.contains('_header-scroll') ? header.classList.add('_header-scroll') : null;
         if (headerShow) {
            if (scrollTop > scrollDirection) {
               header.classList.contains('_header-show') ? header.classList.remove('_header-show') : null;
            } else {
               !header.classList.contains('_header-show') ? header.classList.add('_header-show') : null;
            }
            timer = setTimeout(() => {
               !header.classList.contains('_header-show') ? header.classList.add('_header-show') : null;
            }, headerShowTimer);
         }
      } else {
         header.classList.contains('_header-scroll') ? header.classList.remove('_header-scroll') : null;
         if (headerShow) {
            header.classList.contains('_header-show') ? header.classList.remove('_header-show') : null;
         }
      }
      scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
   });
}

setTimeout(() => {
   if (addWindowScrollEvent) {
      let windowScroll = new Event("windowScroll");
      window.addEventListener("scroll", function (e) {
         document.dispatchEvent(windowScroll);
      });
   }
}, 0);

headerScroll();

// Dynamic adapt
function DynamicAdapt(type) {
   this.type = type;
}
DynamicAdapt.prototype.init = function () {
   const _this = this;
   // массив объектов
   this.оbjects = [];
   this.daClassname = "_dynamic_adapt_";
   // массив DOM-элементов
   this.nodes = document.querySelectorAll("[data-da]");
   // наполнение оbjects объктами
   for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const data = node.dataset.da.trim();
      const dataArray = data.split(",");
      const оbject = {};
      оbject.element = node;
      оbject.parent = node.parentNode;
      оbject.destination = document.querySelector(dataArray[0].trim());
      оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767";
      оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
      оbject.index = this.indexInParent(оbject.parent, оbject.element);
      this.оbjects.push(оbject);
   }
   this.arraySort(this.оbjects);
   // массив уникальных медиа-запросов
   this.mediaQueries = Array.prototype.map.call(this.оbjects, function (item) {
      return '(' + this.type + "-width: " + item.breakpoint + "px)," + item.breakpoint;
   }, this);
   this.mediaQueries = Array.prototype.filter.call(this.mediaQueries, function (item, index, self) {
      return Array.prototype.indexOf.call(self, item) === index;
   });
   // навешивание слушателя на медиа-запрос
   // и вызов обработчика при первом запуске
   for (let i = 0; i < this.mediaQueries.length; i++) {
      const media = this.mediaQueries[i];
      const mediaSplit = String.prototype.split.call(media, ',');
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      // массив объектов с подходящим брейкпоинтом
      const оbjectsFilter = Array.prototype.filter.call(this.оbjects, function (item) {
         return item.breakpoint === mediaBreakpoint;
      });
      matchMedia.addListener(function () {
         _this.mediaHandler(matchMedia, оbjectsFilter);
      });
      this.mediaHandler(matchMedia, оbjectsFilter);
   }
};
DynamicAdapt.prototype.mediaHandler = function (matchMedia, оbjects) {
   if (matchMedia.matches) {
      for (let i = 0; i < оbjects.length; i++) {
         const оbject = оbjects[i];
         оbject.index = this.indexInParent(оbject.parent, оbject.element);
         this.moveTo(оbject.place, оbject.element, оbject.destination);
      }
   } else {
      //for (let i = 0; i < оbjects.length; i++) {
      for (let i = оbjects.length - 1; i >= 0; i--) {
         const оbject = оbjects[i];
         if (оbject.element.classList.contains(this.daClassname)) {
            this.moveBack(оbject.parent, оbject.element, оbject.index);
         }
      }
   }
};
// Функция перемещения
DynamicAdapt.prototype.moveTo = function (place, element, destination) {
   element.classList.add(this.daClassname);
   if (place === 'last' || place >= destination.children.length) {
      destination.insertAdjacentElement('beforeend', element);
      return;
   }
   if (place === 'first') {
      destination.insertAdjacentElement('afterbegin', element);
      return;
   }
   destination.children[place].insertAdjacentElement('beforebegin', element);
}
// Функция возврата
DynamicAdapt.prototype.moveBack = function (parent, element, index) {
   element.classList.remove(this.daClassname);
   if (parent.children[index] !== undefined) {
      parent.children[index].insertAdjacentElement('beforebegin', element);
   } else {
      parent.insertAdjacentElement('beforeend', element);
   }
}
// Функция получения индекса внутри родителя
DynamicAdapt.prototype.indexInParent = function (parent, element) {
   const array = Array.prototype.slice.call(parent.children);
   return Array.prototype.indexOf.call(array, element);
};
// Функция сортировки массива по breakpoint и place 
// по возрастанию для this.type = min
// по убыванию для this.type = max
DynamicAdapt.prototype.arraySort = function (arr) {
   if (this.type === "min") {
      Array.prototype.sort.call(arr, function (a, b) {
         if (a.breakpoint === b.breakpoint) {
            if (a.place === b.place) {
               return 0;
            }

            if (a.place === "first" || b.place === "last") {
               return -1;
            }

            if (a.place === "last" || b.place === "first") {
               return 1;
            }

            return a.place - b.place;
         }

         return a.breakpoint - b.breakpoint;
      });
   } else {
      Array.prototype.sort.call(arr, function (a, b) {
         if (a.breakpoint === b.breakpoint) {
            if (a.place === b.place) {
               return 0;
            }

            if (a.place === "first" || b.place === "last") {
               return 1;
            }

            if (a.place === "last" || b.place === "first") {
               return -1;
            }

            return b.place - a.place;
         }

         return b.breakpoint - a.breakpoint;
      });
      return;
   }
};
const da = new DynamicAdapt("max");
da.init();

// Price counter
function priceCounter() {
   const selects = document.querySelectorAll('.product-quantity');
   const listOfPrices = document.querySelectorAll('[data-price]');
   let totalAmount = document.querySelector('[data-total]');

   selects.forEach((selectItem, selectIndex) => {
      selectItem.addEventListener('change', () => {
         let counter = 0;
         listOfPrices.forEach((itemPrice, priceIndex) => {
            if (selectIndex == priceIndex) {
               itemPrice.innerHTML = `<span class="price-value">${itemPrice.getAttribute('data-price') * selectItem.value}</span> $`;
            }
            counter += +itemPrice.childNodes[0].textContent;
            totalAmount.innerHTML = `${counter} $`;
         });
      });
   });
}

priceCounter();

// Show more or less
function showMore() {
   window.addEventListener("load", function (e) {
      const showMoreBlocks = document.querySelectorAll('[data-showmore]');
      let showMoreBlocksRegular;
      let mdQueriesArray;
      if (showMoreBlocks.length) {
         // Получение обычных объектов
         showMoreBlocksRegular = Array.from(showMoreBlocks).filter(function (item, index, self) {
            return !item.dataset.showmoreMedia;
         });
         // Инициализация обычных объектов
         showMoreBlocksRegular.length ? initItems(showMoreBlocksRegular) : null;

         document.addEventListener("click", showMoreActions);
         window.addEventListener("resize", showMoreActions);

         // Получение объектов с медиа запросами
         mdQueriesArray = dataMediaQueries(showMoreBlocks, "showmoreMedia");
         if (mdQueriesArray && mdQueriesArray.length) {
            mdQueriesArray.forEach(mdQueriesItem => {
               // Событие
               mdQueriesItem.matchMedia.addEventListener("change", function () {
                  initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
               });
            });
            initItemsMedia(mdQueriesArray);
         }
      }
      function initItemsMedia(mdQueriesArray) {
         mdQueriesArray.forEach(mdQueriesItem => {
            initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
         });
      }
      function initItems(showMoreBlocks, matchMedia) {
         showMoreBlocks.forEach(showMoreBlock => {
            initItem(showMoreBlock, matchMedia);
         });
      }
      function initItem(showMoreBlock, matchMedia = false) {
         showMoreBlock = matchMedia ? showMoreBlock.item : showMoreBlock;
         let showMoreContent = showMoreBlock.querySelectorAll('[data-showmore-content]');
         let showMoreButton = showMoreBlock.querySelectorAll('[data-showmore-button]');
         showMoreContent = Array.from(showMoreContent).filter(item => item.closest('[data-showmore]') === showMoreBlock)[0];
         showMoreButton = Array.from(showMoreButton).filter(item => item.closest('[data-showmore]') === showMoreBlock)[0];
         const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
         if (matchMedia.matches || !matchMedia) {
            if (hiddenHeight < getOriginalHeight(showMoreContent)) {
               _slideUp(showMoreContent, 0, hiddenHeight);
               showMoreButton.hidden = false;
            } else {
               _slideDown(showMoreContent, 0, hiddenHeight);
               showMoreButton.hidden = true;
            }
         } else {
            _slideDown(showMoreContent, 0, hiddenHeight);
            showMoreButton.hidden = true;
         }
      }
      function getHeight(showMoreBlock, showMoreContent) {
         let hiddenHeight = 0;
         const showMoreType = showMoreBlock.dataset.showmore ? showMoreBlock.dataset.showmore : 'size';
         if (showMoreType === 'items') {
            const showMoreTypeValue = showMoreContent.dataset.showmoreContent ? showMoreContent.dataset.showmoreContent : 3;
            const showMoreItems = showMoreContent.children;
            for (let index = 1; index < showMoreItems.length; index++) {
               const showMoreItem = showMoreItems[index - 1];
               hiddenHeight += showMoreItem.offsetHeight;
               if (index == showMoreTypeValue) break
            }
         } else {
            const showMoreTypeValue = showMoreContent.dataset.showmoreContent ? showMoreContent.dataset.showmoreContent : 150;
            hiddenHeight = showMoreTypeValue;
         }
         return hiddenHeight;
      }
      function getOriginalHeight(showMoreContent) {
         let parentHidden;
         let hiddenHeight = showMoreContent.offsetHeight;
         showMoreContent.style.removeProperty('height');
         if (showMoreContent.closest(`[hidden]`)) {
            parentHidden = showMoreContent.closest(`[hidden]`);
            parentHidden.hidden = false;
         }
         let originalHeight = showMoreContent.offsetHeight;
         parentHidden ? parentHidden.hidden = true : null;
         showMoreContent.style.height = `${hiddenHeight}px`;
         return originalHeight;
      }
      function showMoreActions(e) {
         const targetEvent = e.target;
         const targetType = e.type;
         if (targetType === 'click') {
            if (targetEvent.closest('[data-showmore-button]')) {
               const showMoreButton = targetEvent.closest('[data-showmore-button]');
               const showMoreBlock = showMoreButton.closest('[data-showmore]');
               const showMoreContent = showMoreBlock.querySelector('[data-showmore-content]');
               const showMoreSpeed = showMoreBlock.dataset.showmoreButton ? showMoreBlock.dataset.showmoreButton : '500';
               const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
               if (!showMoreContent.classList.contains('_slide')) {
                  showMoreBlock.classList.contains('_showmore-active') ? _slideUp(showMoreContent, showMoreSpeed, hiddenHeight) : _slideDown(showMoreContent, showMoreSpeed, hiddenHeight);
                  showMoreBlock.classList.toggle('_showmore-active');
               }
            }
         } else if (targetType === 'resize') {
            showMoreBlocksRegular && showMoreBlocksRegular.length ? initItems(showMoreBlocksRegular) : null;
            mdQueriesArray && mdQueriesArray.length ? initItemsMedia(mdQueriesArray) : null;
         }
      }
   });
}

function dataMediaQueries(array, dataSetValue) {
   // Получение объектов с медиа запросами
   const media = Array.from(array).filter(function (item, index, self) {
      if (item.dataset[dataSetValue]) {
         return item.dataset[dataSetValue].split(",")[0];
      }
   });
   // Инициализация объектов с медиа запросами
   if (media.length) {
      const breakpointsArray = [];
      media.forEach(item => {
         const params = item.dataset[dataSetValue];
         const breakpoint = {};
         const paramsArray = params.split(",");
         breakpoint.value = paramsArray[0];
         breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
         breakpoint.item = item;
         breakpointsArray.push(breakpoint);
      });
      // Получаем уникальные брейкпоинты
      let mdQueries = breakpointsArray.map(function (item) {
         return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
      });
      mdQueries = uniqArray(mdQueries);
      const mdQueriesArray = [];

      if (mdQueries.length) {
         // Работаем с каждым брейкпоинтом
         mdQueries.forEach(breakpoint => {
            const paramsArray = breakpoint.split(",");
            const mediaBreakpoint = paramsArray[1];
            const mediaType = paramsArray[2];
            const matchMedia = window.matchMedia(paramsArray[0]);
            // Объекты с нужными условиями
            const itemsArray = breakpointsArray.filter(function (item) {
               if (item.value === mediaBreakpoint && item.type === mediaType) {
                  return true;
               }
            });
            mdQueriesArray.push({
               itemsArray,
               matchMedia
            })
         });
         return mdQueriesArray;
      }
   }
}

showMore();

// Tabs
function tabs() {
   const tabTitles = document.querySelectorAll('[data-tab-title]');
   const tabContents = document.querySelectorAll('[data-tab-body]');
   let tabName;

   tabTitles.forEach(title => {
      title.addEventListener('click', selectTabTitle);
   });

   function selectTabTitle() {
      tabTitles.forEach(title => {
         title.classList.remove('_tab-active');
      });

      this.classList.add('_tab-active');
      tabName = this.getAttribute('data-tab-title');
      selectTabContent(tabName);
   }

   function selectTabContent(tabName) {
      tabContents.forEach(item => {
         item.getAttribute('data-tab-body') == tabName ? item.classList.add('_tab-active') : item.classList.remove('_tab-active')
      });
   }
}

tabs();

// Spollers
const spollersArray = document.querySelectorAll('[data-spollers]');
if (spollersArray.length > 0) {
   // Get base spollers
   const spollersRegular = Array.from(spollersArray).filter((item, index, self) => {
      return !item.dataset.spollers.split(",")[0];
   });

   // Init base spollers
   if (spollersRegular.length > 0) {
      initSpollers(spollersRegular);
   }

   // Initialization
   function initSpollers(spollersArray) {
      spollersArray.forEach(spollersBlock => {
         spollersBlock.classList.add('_init');
         initSpollerBody(spollersBlock);
         spollersBlock.addEventListener('click', setSpollerAction);
      });
   }
   // Work with content
   function initSpollerBody(spollersBlock) {
      const spollerTitles = document.querySelectorAll('[data-spoller]');
      if (spollerTitles.length > 0) {
         spollerTitles.forEach(spollerTitle => {
            if (!spollerTitle.classList.contains('_active')) {
               spollerTitle.nextElementSibling.hidden = true;
            }
         });
      }
   }

   function setSpollerAction(e) {
      const el = e.target;
      if (el.closest('[data-spoller]')) {
         const spollerTitle = el.closest('[data-spoller]');
         const spollersBlock = spollerTitle.closest('[data-spollers]');
         const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;

         if (!spollersBlock.querySelectorAll('._slide').length) {
            if (oneSpoller && !spollerTitle.classList.contains('_active')) {
               hideSpollersBody(spollersBlock);
            }
            spollerTitle.classList.toggle('_active');
            _slideToggle(spollerTitle.nextElementSibling, 500);
         }
         e.preventDefault();
      }
   }

   function hideSpollersBody(spollersBlock) {
      const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._active');

      if (spollerActiveTitle) {
         spollerActiveTitle.classList.remove('_active');
         _slideUp(spollerActiveTitle.nextElementSibling, 500);
      }
   }
}

let _slideUp = (target, duration = 500, showmore = 0) => {
   if (!target.classList.contains('_slide')) {
      target.classList.add('_slide');
      target.style.transitionProperty = 'height, margin, padding';
      target.style.transitionDuration = duration + 'ms';
      target.style.height = `${target.offsetHeight}px`;
      target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = showmore ? `${showmore}px` : `0px`;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      window.setTimeout(() => {
         target.hidden = !showmore ? true : false;
         !showmore ? target.style.removeProperty('height') : null;
         target.style.removeProperty('padding-top');
         target.style.removeProperty('padding-bottom');
         target.style.removeProperty('margin-top');
         target.style.removeProperty('margin-bottom');
         !showmore ? target.style.removeProperty('overflow') : null;
         target.style.removeProperty('transition-duration');
         target.style.removeProperty('transition-property');
         target.classList.remove('_slide');
         // Создаем событие 
         document.dispatchEvent(new CustomEvent("slideUpDone", {
            detail: {
               target: target
            }
         }));
      }, duration);
   }
}
let _slideDown = (target, duration = 500, showmore = 0) => {
   if (!target.classList.contains('_slide')) {
      target.classList.add('_slide');
      target.hidden = target.hidden ? false : null;
      showmore ? target.style.removeProperty('height') : null;
      let height = target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.height = showmore ? `${showmore}px` : `0px`;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      target.offsetHeight;
      target.style.transitionProperty = "height, margin, padding";
      target.style.transitionDuration = duration + 'ms';
      target.style.height = height + 'px';
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      window.setTimeout(() => {
         target.style.removeProperty('height');
         target.style.removeProperty('overflow');
         target.style.removeProperty('transition-duration');
         target.style.removeProperty('transition-property');
         target.classList.remove('_slide');
         // Создаем событие 
         document.dispatchEvent(new CustomEvent("slideDownDone", {
            detail: {
               target: target
            }
         }));
      }, duration);
   }
}
let _slideToggle = (target, duration = 500) => {
   if (target.hidden) {
      return _slideDown(target, duration);
   } else {
      return _slideUp(target, duration);
   }
}

// Input Mask
if (document.querySelector('#phoneNumber')) {
   let phoneNumberMask = document.querySelector('#phoneNumber');

   // Custom selects
   const defaultSelects = () => {
      const elements = document.querySelectorAll('.product-quantity');

      elements.forEach(select => {
         const choices = new Choices(select, {
            searchEnabled: false,
            itemSelectText: "",
         });
      });
   }

   defaultSelects();

   let maskOptions = {
      mask: '+{1}(000) 000-00-00',
   }

   let mask = IMask(phoneNumberMask, maskOptions);
}

// Swiper
if (document.querySelector('.main-page__swiper')) {
   const swiper = new Swiper('.main-page__swiper', {
      speed: 600,
      allowTouchMove: true,
      preloadImages: true,
      lazy: true,
      pagination: {
         el: '.main-page-pagination',
         clickable: true,
         renderBullet: function (index, className) {
            return '<span class="' + className + '">' + (index + 1) + '</span>';
         }
      },

      // Navigation arrows
      navigation: {
         nextEl: '.main-page-button-next',
         prevEl: '.main-page-button-prev',
      },
   });
}

if (document.querySelector('.photo-slider__swiper')) {
   const swiper = new Swiper('.photo-slider__swiper', {
      speed: 600,
      spaceBetween: 30,
      allowTouchMove: true,
      preloadImages: false,
      lazy: {
         loadOnTransitionStart: false,
         loadPrevNext: true,
      },
      slidesPerView: 1,
      centeredSlides: true,
   });
}