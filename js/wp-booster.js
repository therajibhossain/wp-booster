/*!1. http://localhost/wpme/wp-content/themes/twentytwenty/assets/js/index.js*/
var twentytwenty=twentytwenty||{};twentytwenty.scrolled=0;if(!Element.prototype.closest){Element.prototype.closest=function(s){var el=this;do{if(el.matches(s)){return el;}
el=el.parentElement||el.parentNode;}while(el!==null&&el.nodeType===1);return null;};}
if(window.NodeList&&!NodeList.prototype.forEach){NodeList.prototype.forEach=function(callback,thisArg){var i;var len=this.length;thisArg=thisArg||window;for(i=0;i<len;i++){callback.call(thisArg,this[i],i,this);}};}
twentytwenty.createEvent=function(eventName){var event;if(typeof window.Event==='function'){event=new Event(eventName);}else{event=document.createEvent('Event');event.initEvent(eventName,true,false);}
return event;};if(!Element.prototype.matches){Element.prototype.matches=Element.prototype.matchesSelector||Element.prototype.mozMatchesSelector||Element.prototype.msMatchesSelector||Element.prototype.oMatchesSelector||Element.prototype.webkitMatchesSelector||function(s){var matches=(this.document||this.ownerDocument).querySelectorAll(s),i=matches.length;while(--i>=0&&matches.item(i)!==this){}
return i>-1;};}
twentytwenty.touchEnabled={init:function(){var matchMedia=function(){var prefixes=['-webkit-','-moz-','-o-','-ms-'];var query=['(',prefixes.join('touch-enabled),('),'heartz',')'].join('');return window.matchMedia&&window.matchMedia(query).matches;};if(('ontouchstart'in window)||(window.DocumentTouch&&document instanceof window.DocumentTouch)||matchMedia()){document.body.classList.add('touch-enabled');}}};twentytwenty.coverModals={init:function(){if(document.querySelector('.cover-modal')){this.onToggle();this.outsideUntoggle();this.closeOnEscape();this.hideAndShowModals();}},onToggle:function(){document.querySelectorAll('.cover-modal').forEach(function(element){element.addEventListener('toggled',function(event){var modal=event.target,body=document.body;if(modal.classList.contains('active')){body.classList.add('showing-modal');}else{body.classList.remove('showing-modal');body.classList.add('hiding-modal');setTimeout(function(){body.classList.remove('hiding-modal');},500);}});});},outsideUntoggle:function(){document.addEventListener('click',function(event){var target=event.target;var modal=document.querySelector('.cover-modal.active');if(target===modal){this.untoggleModal(target);}}.bind(this));},closeOnEscape:function(){document.addEventListener('keydown',function(event){if(event.keyCode===27){event.preventDefault();document.querySelectorAll('.cover-modal.active').forEach(function(element){this.untoggleModal(element);}.bind(this));}}.bind(this));},hideAndShowModals:function(){var _doc=document,_win=window,modals=_doc.querySelectorAll('.cover-modal'),htmlStyle=_doc.documentElement.style,adminBar=_doc.querySelector('#wpadminbar');function getAdminBarHeight(negativeValue){var height,currentScroll=_win.pageYOffset;if(adminBar){height=currentScroll+adminBar.getBoundingClientRect().height;return negativeValue?-height:height;}
return currentScroll===0?0:-currentScroll;}
function htmlStyles(){var overflow=_win.innerHeight>_doc.documentElement.getBoundingClientRect().height;return{'overflow-y':overflow?'hidden':'scroll',position:'fixed',width:'100%',top:getAdminBarHeight(true)+'px',left:0};}
modals.forEach(function(modal){modal.addEventListener('toggle-target-before-inactive',function(event){var styles=htmlStyles(),offsetY=_win.pageYOffset,paddingTop=(Math.abs(getAdminBarHeight())-offsetY)+'px',mQuery=_win.matchMedia('(max-width: 600px)');if(event.target!==modal){return;}
Object.keys(styles).forEach(function(styleKey){htmlStyle.setProperty(styleKey,styles[styleKey]);});_win.twentytwenty.scrolled=parseInt(styles.top,10);if(adminBar){_doc.body.style.setProperty('padding-top',paddingTop);if(mQuery.matches){if(offsetY>=getAdminBarHeight()){modal.style.setProperty('top',0);}else{modal.style.setProperty('top',(getAdminBarHeight()-offsetY)+'px');}}}
modal.classList.add('show-modal');});modal.addEventListener('toggle-target-after-inactive',function(event){if(event.target!==modal){return;}
setTimeout(function(){var clickedEl=twentytwenty.toggles.clickedEl;modal.classList.remove('show-modal');Object.keys(htmlStyles()).forEach(function(styleKey){htmlStyle.removeProperty(styleKey);});if(adminBar){_doc.body.style.removeProperty('padding-top');modal.style.removeProperty('top');}
if(clickedEl!==false){clickedEl.focus();clickedEl=false;}
_win.scrollTo(0,Math.abs(_win.twentytwenty.scrolled+getAdminBarHeight()));_win.twentytwenty.scrolled=0;},500);});});},untoggleModal:function(modal){var modalTargetClass,modalToggle=false;if(modal.dataset.modalTargetString){modalTargetClass=modal.dataset.modalTargetString;modalToggle=document.querySelector('*[data-toggle-target="'+modalTargetClass+'"]');}
if(modalToggle){modalToggle.click();}else{modal.classList.remove('active');}}};twentytwenty.intrinsicRatioVideos={init:function(){this.makeFit();window.addEventListener('resize',function(){this.makeFit();}.bind(this));},makeFit:function(){document.querySelectorAll('iframe, object, video').forEach(function(video){var ratio,iTargetWidth,container=video.parentNode;if(video.classList.contains('intrinsic-ignore')||video.parentNode.classList.contains('intrinsic-ignore')){return true;}
if(!video.dataset.origwidth){video.setAttribute('data-origwidth',video.width);video.setAttribute('data-origheight',video.height);}
iTargetWidth=container.offsetWidth;ratio=iTargetWidth/video.dataset.origwidth;video.style.width=iTargetWidth+'px';video.style.height=(video.dataset.origheight*ratio)+'px';});}};twentytwenty.modalMenu={init:function(){this.expandLevel();this.keepFocusInModal();},expandLevel:function(){var modalMenus=document.querySelectorAll('.modal-menu');modalMenus.forEach(function(modalMenu){var activeMenuItem=modalMenu.querySelector('.current-menu-item');if(activeMenuItem){twentytwentyFindParents(activeMenuItem,'li').forEach(function(element){var subMenuToggle=element.querySelector('.sub-menu-toggle');if(subMenuToggle){twentytwenty.toggles.performToggle(subMenuToggle,true);}});}});},keepFocusInModal:function(){var _doc=document;_doc.addEventListener('keydown',function(event){var toggleTarget,modal,selectors,elements,menuType,bottomMenu,activeEl,lastEl,firstEl,tabKey,shiftKey,clickedEl=twentytwenty.toggles.clickedEl;if(clickedEl&&_doc.body.classList.contains('showing-modal')){toggleTarget=clickedEl.dataset.toggleTarget;selectors='input, a, button';modal=_doc.querySelector(toggleTarget);elements=modal.querySelectorAll(selectors);elements=Array.prototype.slice.call(elements);if('.menu-modal'===toggleTarget){menuType=window.matchMedia('(min-width: 1000px)').matches;menuType=menuType?'.expanded-menu':'.mobile-menu';elements=elements.filter(function(element){return null!==element.closest(menuType)&&null!==element.offsetParent;});elements.unshift(_doc.querySelector('.close-nav-toggle'));bottomMenu=_doc.querySelector('.menu-bottom > nav');if(bottomMenu){bottomMenu.querySelectorAll(selectors).forEach(function(element){elements.push(element);});}}
lastEl=elements[elements.length-1];firstEl=elements[0];activeEl=_doc.activeElement;tabKey=event.keyCode===9;shiftKey=event.shiftKey;if(!shiftKey&&tabKey&&lastEl===activeEl){event.preventDefault();firstEl.focus();}
if(shiftKey&&tabKey&&firstEl===activeEl){event.preventDefault();lastEl.focus();}}});}};twentytwenty.primaryMenu={init:function(){this.focusMenuWithChildren();},focusMenuWithChildren:function(){var links,i,len,menu=document.querySelector('.primary-menu-wrapper');if(!menu){return false;}
links=menu.getElementsByTagName('a');for(i=0,len=links.length;i<len;i++){links[i].addEventListener('focus',toggleFocus,true);links[i].addEventListener('blur',toggleFocus,true);}
function toggleFocus(){var self=this;while(-1===self.className.indexOf('primary-menu')){if('li'===self.tagName.toLowerCase()){if(-1!==self.className.indexOf('focus')){self.className=self.className.replace(' focus','');}else{self.className+=' focus';}}
self=self.parentElement;}}}};twentytwenty.toggles={clickedEl:false,init:function(){this.toggle();this.resizeCheck();this.untoggleOnEscapeKeyPress();},performToggle:function(element,instantly){var target,timeOutTime,classToToggle,self=this,_doc=document,toggle=element,targetString=toggle.dataset.toggleTarget,activeClass='active';if(!_doc.querySelectorAll('.show-modal').length){self.clickedEl=_doc.activeElement;}
if(targetString==='next'){target=toggle.nextSibling;}else{target=_doc.querySelector(targetString);}
if(target.classList.contains(activeClass)){target.dispatchEvent(twentytwenty.createEvent('toggle-target-before-active'));}else{target.dispatchEvent(twentytwenty.createEvent('toggle-target-before-inactive'));}
classToToggle=toggle.dataset.classToToggle?toggle.dataset.classToToggle:activeClass;timeOutTime=0;if(target.classList.contains('cover-modal')){timeOutTime=10;}
setTimeout(function(){var focusElement,subMenued=target.classList.contains('sub-menu'),newTarget=subMenued?toggle.closest('.menu-item').querySelector('.sub-menu'):target,duration=toggle.dataset.toggleDuration;if(toggle.dataset.toggleType==='slidetoggle'&&!instantly&&duration!=='0'){twentytwentyMenuToggle(newTarget,duration);}else{newTarget.classList.toggle(classToToggle);}
if(targetString==='next'){toggle.classList.toggle(activeClass);}else if(target.classList.contains('sub-menu')){toggle.classList.toggle(activeClass);}else{_doc.querySelector('*[data-toggle-target="'+targetString+'"]').classList.toggle(activeClass);}
twentytwentyToggleAttribute(toggle,'aria-expanded','true','false');if(self.clickedEl&&-1!==toggle.getAttribute('class').indexOf('close-')){twentytwentyToggleAttribute(self.clickedEl,'aria-expanded','true','false');}
if(toggle.dataset.toggleBodyClass){_doc.body.classList.toggle(toggle.dataset.toggleBodyClass);}
if(toggle.dataset.setFocus){focusElement=_doc.querySelector(toggle.dataset.setFocus);if(focusElement){if(target.classList.contains(activeClass)){focusElement.focus();}else{focusElement.blur();}}}
target.dispatchEvent(twentytwenty.createEvent('toggled'));if(target.classList.contains(activeClass)){target.dispatchEvent(twentytwenty.createEvent('toggle-target-after-active'));}else{target.dispatchEvent(twentytwenty.createEvent('toggle-target-after-inactive'));}},timeOutTime);},toggle:function(){var self=this;document.querySelectorAll('*[data-toggle-target]').forEach(function(element){element.addEventListener('click',function(event){event.preventDefault();self.performToggle(element);});});},resizeCheck:function(){if(document.querySelectorAll('*[data-untoggle-above], *[data-untoggle-below], *[data-toggle-above], *[data-toggle-below]').length){window.addEventListener('resize',function(){var winWidth=window.innerWidth,toggles=document.querySelectorAll('.toggle');toggles.forEach(function(toggle){var unToggleAbove=toggle.dataset.untoggleAbove,unToggleBelow=toggle.dataset.untoggleBelow,toggleAbove=toggle.dataset.toggleAbove,toggleBelow=toggle.dataset.toggleBelow;if(!unToggleAbove&&!unToggleBelow&&!toggleAbove&&!toggleBelow){return;}
if((((unToggleAbove&&winWidth>unToggleAbove)||(unToggleBelow&&winWidth<unToggleBelow))&&toggle.classList.contains('active'))||(((toggleAbove&&winWidth>toggleAbove)||(toggleBelow&&winWidth<toggleBelow))&&!toggle.classList.contains('active'))){toggle.click();}});});}},untoggleOnEscapeKeyPress:function(){document.addEventListener('keyup',function(event){if(event.key==='Escape'){document.querySelectorAll('*[data-untoggle-on-escape].active').forEach(function(element){if(element.classList.contains('active')){element.click();}});}});}};function twentytwentyDomReady(fn){if(typeof fn!=='function'){return;}
if(document.readyState==='interactive'||document.readyState==='complete'){return fn();}
document.addEventListener('DOMContentLoaded',fn,false);}
twentytwentyDomReady(function(){twentytwenty.toggles.init();twentytwenty.coverModals.init();twentytwenty.intrinsicRatioVideos.init();twentytwenty.modalMenu.init();twentytwenty.primaryMenu.init();twentytwenty.touchEnabled.init();});function twentytwentyToggleAttribute(element,attribute,trueVal,falseVal){if(trueVal===undefined){trueVal=true;}
if(falseVal===undefined){falseVal=false;}
if(element.getAttribute(attribute)!==trueVal){element.setAttribute(attribute,trueVal);}else{element.setAttribute(attribute,falseVal);}}
function twentytwentyMenuToggle(target,duration){var initialParentHeight,finalParentHeight,menu,menuItems,transitionListener,initialPositions=[],finalPositions=[];if(!target){return;}
menu=target.closest('.menu-wrapper');menuItems=menu.querySelectorAll('.menu-item');menuItems.forEach(function(menuItem,index){initialPositions[index]={x:menuItem.offsetLeft,y:menuItem.offsetTop};});initialParentHeight=target.parentElement.offsetHeight;target.classList.add('toggling-target');target.classList.toggle('active');menuItems.forEach(function(menuItem,index){finalPositions[index]={x:menuItem.offsetLeft,y:menuItem.offsetTop};});finalParentHeight=target.parentElement.offsetHeight;target.classList.toggle('active');menu.classList.add('is-toggling');target.classList.toggle('active');menuItems.forEach(function(menuItem,index){var initialPosition=initialPositions[index];if(initialPosition.y===0&&menuItem.parentElement===target){initialPosition.y=initialParentHeight;}
menuItem.style.transform='translate('+initialPosition.x+'px, '+initialPosition.y+'px)';});requestAnimationFrame(function(){requestAnimationFrame(function(){menu.classList.add('is-animating');menuItems.forEach(function(menuItem,index){var finalPosition=finalPositions[index];if(finalPosition.y===0&&menuItem.parentElement===target){finalPosition.y=finalParentHeight;}
if(duration!==undefined){menuItem.style.transitionDuration=duration+'ms';}
menuItem.style.transform='translate('+finalPosition.x+'px, '+finalPosition.y+'px)';});if(duration!==undefined){target.style.transitionDuration=duration+'ms';}});transitionListener=function(){menu.classList.remove('is-animating');menu.classList.remove('is-toggling');target.classList.remove('toggling-target');menuItems.forEach(function(menuItem){menuItem.style.transform='';menuItem.style.transitionDuration='';});target.style.transitionDuration='';target.removeEventListener('transitionend',transitionListener);};target.addEventListener('transitionend',transitionListener);});}
function twentytwentyFindParents(target,query){var parents=[];function traverse(item){var parent=item.parentNode;if(parent instanceof HTMLElement){if(parent.matches(query)){parents.push(parent);}
traverse(parent);}}
traverse(target);return parents;}
/* (total-files: 1)   *//* wp-booster | last-modified:  April 12, 2020 06:01:43AM */