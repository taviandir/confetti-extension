(function () {
    'use strict';
    let isMenuUrl = document.location.href.includes('game.php');
    if (isMenuUrl && !inIframe()) {
        initGameMenuView();
        return;
    }
    if (!inIframe())
        return;
    log('INIT');
    let correctUrl = document.location.href.includes('con-client');
    console.log('CORRECT URL?', { correctUrl, href: document.location.href });
    if (!correctUrl)
        return;
    var splashScreen = document.getElementById('splashScreenContainer');
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes') {
                if (!__loaded) {
                    log('INIT SCRIPT');
                    initExtensionPlay();
                    __loaded = true;
                    log('INIT SCRIPT - DONE');
                }
            }
        });
    });
    observer.observe(splashScreen, {
        attributes: true,
    });
})();
function initGameMenuView() {
    log('GAME MENU INIT');
    forceEnglishGameLanguage();
}
function forceEnglishGameLanguage() {
    const sessionReloadKey = 'ext_lang_reloaded';
    var cookies = document.cookie;
    if (cookies.indexOf('bl_lang=0') == -1) {
        var seshReloadValue = sessionStorage.getItem(sessionReloadKey);
        if (seshReloadValue === '1') {
            console.warn('already tried forcing language this session, skip (avoids infinite loop)');
            return;
        }
        var expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 12);
        const cookieName = 'bl_lang';
        const cookieDomain = '.conflictnations.com';
        var cookieValue = '0';
        var finalCookieValue = cookieName + '=' + cookieValue + ';expires=' + expiryDate + ';domain=' + cookieDomain + ';path=/';
        sessionStorage.setItem(sessionReloadKey, '1');
        document.cookie = finalCookieValue;
        location.href = 'https://conflictnations.com/game.php?bust=1';
    }
    else {
        log('cookie value already set, no action');
    }
}
var _activePopupWindow;
var __loaded = false;
function initExtensionPlay() {
    initEventWindow();
    hideTutorialAdvisor();
    initExtensionMenuRow();
    initDiplomacyWindow();
}
function initDiplomacyWindow() {
    var dipBtn = document.getElementById('func_btn_diplomacy');
    dipBtn.addEventListener('click', onOpenDiplomacyWindow);
}
function onOpenDiplomacyWindow() {
    log('on diplomacy open');
    setTimeout(() => {
        var messageTabEl = document.getElementById('func_tab_messages');
        messageTabEl.addEventListener('click', onClickDiplomacyMessagesTab);
    }, 2000);
}
var __enabledCtrlEnterSend;
function onClickDiplomacyMessagesTab() {
    if (!__enabledCtrlEnterSend) {
        setTimeout(() => {
            var textAreaEl = document.getElementById('func_create_message_body');
            if (textAreaEl) {
                textAreaEl.addEventListener('keydown', function (e) {
                    if (e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13)) {
                        document.getElementById('func_send_message').click();
                    }
                });
                __enabledCtrlEnterSend = true;
            }
        }, 2000);
    }
}
function initExtensionMenuRow() {
    var refElement = document.getElementById('menuContainer');
    var menuWrapper = document.createElement('div');
    menuWrapper.id = 'ExtMenu';
    menuWrapper.setAttribute('style', 'position: absolute; bottom: -80px; left: 0; width: 315px; z-index: 10; color: white; margin-left: 13px;');
    var ulEl = document.createElement('ul');
    ulEl.classList.add('mainmenu');
    ulEl.setAttribute('style', 'display: grid; grid-template-columns: repeat(5, 1fr)');
    menuWrapper.appendChild(ulEl);
    insertAfter(menuWrapper, refElement);
    var ubLvlButtonEl = addButtonToMenu(ulEl);
    ubLvlButtonEl.style.fill = 'white';
    var svgWrapper = document.createElement('div');
    svgWrapper.innerHTML = _buildingIconSvg;
    svgWrapper.setAttribute('style', 'width: 100%; margin: 0.25rem');
    ubLvlButtonEl.appendChild(svgWrapper);
    ubLvlButtonEl.addEventListener('click', onClickMenuUnitBuildingLevel);
    var notesButtonEl = addButtonToMenu(ulEl);
    notesButtonEl.innerText = 'NOTES';
    notesButtonEl.addEventListener('click', onClickMenuItemNotes);
}
function addButtonToMenu(menuEl) {
    var liEl = document.createElement('li');
    liEl.classList.add('con_button');
    liEl.setAttribute('style', 'display: inline-flex; align-items: center; justify-content: center; font-weight: bold;');
    menuEl.appendChild(liEl);
    return liEl;
}
function createPopupCloseButton() {
    var div = document.createElement('div');
    div.innerHTML = `<div class="close_button_s"><div>x</div></div>`;
    var child = div.firstChild;
    child.parent = null;
    div.remove();
    return child;
}
const _ubLvlWindowName = 'UbLvl';
function onClickMenuUnitBuildingLevel() {
    log('UNIT BUILDING-LEVEL ITEM CLICKED');
    if (_activePopupWindow != null) {
        _activePopupWindow.close();
        if (_activePopupWindow.name === _ubLvlWindowName) {
            _activePopupWindow = null;
            return;
        }
    }
    _activePopupWindow = new PopupWindow(_ubLvlWindowName, initUbLvlWindow);
    _activePopupWindow.open();
}
function initUbLvlWindow() {
    var popupEl = document.createElement('div');
    popupEl.id = 'ExtNotesUbLvl';
    popupEl.setAttribute('style', 'min-width: 500px; background: #51666d; color: white; border: 1px solid #ccc; position: absolute; left: 2%; top: 25%; display: flex; flex-direction: column; padding: 0.25rem;');
    popupEl.appendChild(initUbPopupStyles());
    popupEl.appendChild(initUbLvlHeader());
    var tableWrapper = document.createElement('div');
    popupEl.appendChild(tableWrapper);
    tableWrapper.innerHTML = _unitBuildlingLevelTableTemplate;
    var data = parseUnitBuildingLevelsData();
    var tableEl = tableWrapper.firstChild;
    for (let key in data) {
        let obj = data[key];
        for (let lvl = 1; lvl <= 5; lvl++) {
            let arr = obj[lvl];
            if (arr.length) {
                let tdHtml = ubArrayToHtml(arr);
                var cellId = getUbTableCellId(key, lvl);
                var tdMatch = tableEl.querySelectorAll('#' + cellId);
                if (tdMatch.length) {
                    tdMatch[0].innerHTML = tdHtml;
                }
            }
        }
    }
    document.getElementById('s1914').appendChild(popupEl);
    return popupEl;
}
function closePopupWindow() {
    _activePopupWindow.close();
}
function initUbPopupStyles() {
    var styles = document.createElement('style');
    styles.innerHTML = _unitBuildlingPopupCss;
    return styles;
}
function ubArrayToHtml(arr) {
    let html = '';
    for (let x of arr) {
        html += '<div>' + x + '</div>';
    }
    return html;
}
function getUbTableCellId(building, lvl) {
    let key = '';
    if (building === 'Army Base') {
        key = 'army';
    }
    else if (building === 'Air Base') {
        key = 'air';
    }
    else if (building === 'Naval Base') {
        key = 'naval';
    }
    return key + '_' + lvl;
}
function initUbLvlHeader() {
    var headerWrapper = document.createElement('div');
    headerWrapper.setAttribute('style', 'display: flex; align-items: space-between');
    var closeButton = createPopupCloseButton();
    closeButton.addEventListener('click', closePopupWindow);
    var headerEl = document.createElement('h1');
    headerEl.innerText = 'Units by Building Levels';
    headerEl.setAttribute('style', 'margin-bottom: 0.5rem');
    headerWrapper.appendChild(headerEl);
    headerWrapper.appendChild(closeButton);
    return headerWrapper;
}
function parseUnitBuildingLevelsData() {
    var rows = ResearchData.UnitBuildingLevelsData.split('\n');
    let dict = {};
    let currentObj = null;
    for (let row of rows) {
        let cols = row.split('\t');
        if (cols[0] != '') {
            currentObj = {};
            initLevelsInBuildingObj(currentObj);
            var key = cols[0] + ' Base';
            dict[key] = currentObj;
        }
        for (let lvl = 1; lvl <= 5; lvl++) {
            if (!!cols[lvl]) {
                currentObj[lvl].push(cols[lvl]);
            }
        }
    }
    return dict;
}
function initLevelsInBuildingObj(obj) {
    for (let i = 0; i < 5; i++) {
        obj[i + 1] = [];
    }
}
const _notesWindowName = 'Notes';
function onClickMenuItemNotes() {
    log('NOTES MENU ITEM CLICKED');
    if (_activePopupWindow != null) {
        _activePopupWindow.close();
        if (_activePopupWindow.name === _notesWindowName) {
            _activePopupWindow = null;
            return;
        }
    }
    _activePopupWindow = new PopupWindow(_notesWindowName, initNotesWindow);
    _activePopupWindow.open();
}
function initNotesWindow() {
    var popupEl = document.createElement('div');
    popupEl.id = 'ExtNotesPopup';
    popupEl.setAttribute('style', 'min-width: 500px; background: #eee; color: black; border: 1px solid #ccc; position: absolute; left: 2%; top: 25%; display: flex; flex-direction: column; padding: 0.25rem;');
    var headerEl = document.createElement('h1');
    headerEl.innerText = 'Notes';
    headerEl.setAttribute('style', 'margin-bottom: 0.5rem');
    popupEl.appendChild(headerEl);
    var gameId = getGameId();
    var textEl = document.createElement('textarea');
    textEl.id = 'ExtNoteInput';
    textEl.value = loadGameNote(gameId);
    textEl.setAttribute('rows', '10');
    popupEl.appendChild(textEl);
    var buttonDiv = document.createElement('div');
    buttonDiv.setAttribute('style', 'display: flex; margin-top: 0.5rem; justify-content: flex-end');
    popupEl.appendChild(buttonDiv);
    var cancelEl = document.createElement('button');
    cancelEl.id = 'ExtNoteCancel';
    cancelEl.innerText = 'Cancel';
    cancelEl.className = 'con_button large_button uppercase';
    cancelEl.setAttribute('style', 'margin-right: 0.5rem;');
    cancelEl.addEventListener('click', closePopupWindow);
    buttonDiv.appendChild(cancelEl);
    var saveEl = document.createElement('button');
    saveEl.id = 'ExtNoteSave';
    saveEl.innerText = 'Save';
    saveEl.className = 'con_button large_button uppercase';
    saveEl.addEventListener('click', onClickSaveNote);
    buttonDiv.appendChild(saveEl);
    document.getElementById('s1914').appendChild(popupEl);
    return popupEl;
}
function onClickSaveNote() {
    var inputElement = document.getElementById('ExtNoteInput');
    var textValue = inputElement.value;
    log(textValue);
    saveGameNote(getGameId(), textValue);
    closePopupWindow();
}
function loadGameNote(gameId) {
    return localStorage.getItem('ext_note_' + gameId);
}
function saveGameNote(gameId, text) {
    localStorage.setItem('ext_note_' + gameId, text);
}
function hideTutorialAdvisor() {
    var element = document.getElementById('tutorialAdviceTextContainer');
    if (element) {
        element.remove();
    }
}
function hideGoldMarketing() {
}
var _unreadEventsSinceLastOpen = 0;
var _unreadEvents = 0;
function initEventWindow() {
    initUnreadCountCheck();
    var eventButton = document.getElementById('func_btn_events');
    eventButton.addEventListener('click', (event) => {
        setEventWindowStyling();
        setEventsUnreadCount();
        initOptionsInEventWindow();
        markUnreadEvents();
        addUnitTypeToResearchEvents();
        markFilterTypeOnEvents();
        addOtherMarkersOnEvents();
        enhanceAgentEvents();
    });
}
function setEventWindowStyling() {
    var eventContentElem = document.querySelector('#eventsContainer .content .overview');
    var styleElem = document.createElement('style');
    styleElem.innerText = _eventWindowStyle;
    eventContentElem.appendChild(styleElem);
}
function initUnreadCountCheck() {
    var eventsBtnElem = document.getElementById('func_btn_events');
    if (eventsBtnElem) {
        eventsBtnElem.onmouseenter = function () {
            var unreadEventsElem = document.getElementById('func_events_unread');
            if (unreadEventsElem.innerText !== '') {
                var unreadValue = parseInt(unreadEventsElem.innerText);
                if (+unreadValue) {
                    _unreadEventsSinceLastOpen = +unreadValue;
                }
            }
        };
    }
}
function setEventsUnreadCount() {
    _unreadEvents += _unreadEventsSinceLastOpen;
    _unreadEventsSinceLastOpen = 0;
}
function initOptionsInEventWindow() {
    var eventContentElem = document.querySelector('#eventsContainer .content .overview');
    if (eventContentElem) {
        let wrapper = document.createElement('div');
        wrapper.id = 'confetti-event-filters';
        wrapper.setAttribute('style', 'display: flex; padding: 1rem;');
        eventContentElem.prepend(wrapper);
        addTypeFilterSelect(wrapper);
        addCountryFilterSelect(wrapper);
        addFreetextFilter(wrapper);
        var titleDiv = document.querySelector('#eventsContainer .dialog_title');
        titleDiv.setAttribute('style', 'display: flex; align-items: center;');
        addClearUnreadButton(titleDiv);
    }
}
function addClearUnreadButton(wrapper) {
    let btn = document.createElement('button');
    btn.innerText = 'Clear Unread';
    btn.classList.add('con_button');
    btn.setAttribute('style', 'position: absolute; right: 5rem;');
    wrapper.appendChild(btn);
    btn.addEventListener('click', onClickButtonClearUnread);
}
function onClickButtonClearUnread() {
    _unreadEvents = 0;
    _unreadEventsSinceLastOpen = 0;
    let childrenOfUl = document.querySelector('#eventsContainer .content .overview ul').children;
    for (var i = 0; i < childrenOfUl.length; i++) {
        var liElem = childrenOfUl[i];
        liElem.classList.remove('confetti-event-unread');
    }
}
function markUnreadEvents() {
    console.log('Mark Unread Events', _unreadEvents);
    let childrenOfUl = document.querySelector('#eventsContainer .content .overview ul').children;
    for (var i = 0; i < _unreadEvents; i++) {
        var liElem = childrenOfUl[i];
        liElem.classList.add('confetti-event-unread');
    }
}
const EventAgentActorAttrName = 'data-agent-actor';
const EventAgentOutcomeAttrName = 'data-agent-outcome';
function enhanceAgentEvents() {
    log('Enhance Agent Events');
    let childrenOfUl = document.querySelector('#eventsContainer .content .overview ul').children;
    for (var i = 0; i < childrenOfUl.length; i++) {
        var evEl = childrenOfUl[i];
        var desc = evEl.querySelector('.event-description');
        if (evEl.getAttribute(EventFilterTypeAttrName) !== 'AGE')
            continue;
        if (desc.innerText.indexOf('Agent: Suspected Spy Action. ') >= 0) {
            var elStartIdx = desc.innerHTML.indexOf('<span');
            if (elStartIdx) {
                var textInEl = desc.firstChild;
                if (textInEl.innerHTML === undefined) {
                    textInEl.textContent = textInEl.textContent.replace('Agent: Suspected Spy Action. ', '');
                }
                else {
                    console.warn('Remove Agent Boilerplate - text is not text element');
                }
            }
        }
        var ourAction;
        var actionSuccess;
        var et = desc.innerText;
        if (et.indexOf('been captured by') >= 0) {
            ourAction = true;
            actionSuccess = false;
        }
        else if (et.indexOf('Our agents have sabotaged') >= 0 || et.indexOf('Our agents have destroyed') >= 0) {
            ourAction = true;
            actionSuccess = true;
        }
        else if (et.indexOf('Resources have gone missing') >= 0 || et.indexOf('Hostile agents have sabotaged') >= 0) {
            ourAction = false;
            actionSuccess = true;
        }
        else if (et.indexOf('Our agents have intercepted') >= 0) {
            ourAction = false;
            actionSuccess = false;
        }
        else {
            console.warn('UNKNOWN AGENT EVENT, skip', { eventText: et });
            continue;
        }
        evEl.setAttribute(EventAgentOutcomeAttrName, actionSuccess ? 'Y' : 'N');
        evEl.setAttribute(EventAgentActorAttrName, ourAction ? 'ME' : 'ENEMY');
        var headerEl = evEl.querySelector('.event-time');
        var headerPrefix = '';
        if (ourAction) {
            headerPrefix += (actionSuccess ? '👍' : '👎') + ' ';
        }
        else {
            headerPrefix += (actionSuccess ? '🔥' : '🛑') + ' ';
        }
        headerEl.innerText = headerPrefix + headerEl.innerText;
    }
}
const EventFilterTypeAttrName = 'data-filter-type';
const EventEventTypeAttrName = 'data-event-type';
function markFilterTypeOnEvents() {
    let filters = {
        COM: ['Enemy Defeated', 'Fighting.', 'Friendly Unit Lost', 'Civilian Casualties'],
        TER: ['Province entered', 'City entered', 'Territory Lost', 'Territory Conquered'],
        AGE: ['Agent'],
        RES: ['Research Completed'],
        CIT: ['built in', 'mobilized', 'produced in'],
        DIP: [
            'New Article Published',
            'Message Received',
            'Diplomatic Status Changed',
            'the coalition',
            'Trade Offer',
            'received a message',
        ],
    };
    var eventElems = document.querySelectorAll('#eventsContainer .content .overview ul li');
    for (let evEl of eventElems) {
        var content = evEl.querySelector('.event-description').innerText;
        for (let key in filters) {
            let keywordsToSearchFor = filters[key];
            let isMatch = keywordsToSearchFor.map((x) => content.includes(x)).some((match) => match === true);
            if (isMatch) {
                evEl.setAttribute(EventFilterTypeAttrName, key);
                break;
            }
        }
    }
}
function getAllEventElements() {
    return document.querySelectorAll('#eventsContainer .content .overview ul li');
}
function addOtherMarkersOnEvents() {
    var eventElems = getAllEventElements();
    for (var i = 0; i < eventElems.length; i++) {
        var evEl = eventElems[i];
        var desc = evEl.querySelector('.event-description');
        var content = '';
        if (desc) {
            content = desc.innerText;
        }
        else {
            continue;
        }
        if (content.includes('Territory Conquered')) {
            evEl.setAttribute(EventEventTypeAttrName, 'TERCON');
        }
    }
}
function addUnitTypeToResearchEvents() {
    setTimeout(() => {
        var eventElems = document.querySelectorAll('#eventsContainer .content .overview ul li');
        for (var i = 0; i < eventElems.length; i++) {
            var evEl = eventElems[i];
            var desc = evEl.querySelector('.event-description');
            var content = '';
            if (desc) {
                content = desc.innerText;
            }
            else {
                continue;
            }
            if (content.includes('Research Completed')) {
                let prefix = 'Research for ';
                let suffix = ' has been completed';
                let idxStart = content.lastIndexOf(prefix) + prefix.length;
                let idxEnd = content.lastIndexOf(suffix);
                let researchName = content.substring(idxStart, idxEnd);
                let researchNameWithoutParanthesis = researchName.substring(0, researchName.indexOf(' ('));
                let unitTypeMatch = tryMatchUnitType(researchNameWithoutParanthesis);
                if (unitTypeMatch) {
                    setNewResearchContent(content, idxStart, idxEnd, researchName, unitTypeMatch, desc);
                }
                else {
                    var lvl = extractResearchUpgradeLevel(researchName);
                    if (lvl > 1) {
                        var unitTypes = tryMatchSoftUpgrade(researchNameWithoutParanthesis, lvl);
                        if (unitTypes.length && unitTypes.length <= 3) {
                            var softMatchStr = unitTypes.join(' / ');
                            setNewResearchContent(content, idxStart, idxEnd, researchName, softMatchStr, desc);
                        }
                    }
                }
            }
        }
    }, 1000);
}
function setNewResearchContent(content, idxStart, idxEnd, researchName, matchName, el) {
    var style = 'text-decoration: underline';
    var newContent = content.substring(0, idxStart) +
        researchName +
        ' <span style="' +
        style +
        '">[ ' +
        matchName +
        ' ]</span>' +
        content.substring(idxEnd);
    el.innerHTML = newContent;
}
function extractResearchUpgradeLevel(researchName) {
    var x = /(\d\))$/.exec(researchName)[0].replace(')', '');
    var num = parseInt(x);
    if (!isNaN(num)) {
        return num;
    }
    else {
        return null;
    }
}
function tryMatchSoftUpgrade(researchName, lvl) {
    let data = parseSoftUnitUpgradesData();
    var idx = lvl - 1;
    var matches = [];
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            try {
                if (data[key][idx] === researchName) {
                    matches.push(key);
                }
            }
            catch (error) { }
        }
    }
    return matches;
}
function tryMatchUnitType(researchName) {
    let data = parseUnitDoctrineData();
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key].some((str) => str == researchName)) {
                return key;
            }
        }
    }
    return null;
}
var _parsedUnitDoctrineData = null;
function parseUnitDoctrineData() {
    if (_parsedUnitDoctrineData) {
        return _parsedUnitDoctrineData;
    }
    let rowSplit = ResearchData.UnitDoctrineData.split('\n');
    var result = {};
    for (let i = 0; i < rowSplit.length; i++) {
        let rawRow = rowSplit[i];
        let cols = rawRow.split('\t');
        let values = cols.filter((x) => !!x && x.length);
        let unitType = values.shift();
        result[unitType] = values;
    }
    _parsedUnitDoctrineData = result;
    return _parsedUnitDoctrineData;
}
var _parsedSoftUpgradesData = null;
function parseSoftUnitUpgradesData() {
    if (_parsedSoftUpgradesData) {
        return _parsedSoftUpgradesData;
    }
    let rowSplit = ResearchData.UnitSoftUpgradesData.split('\n');
    var result = {};
    for (let i = 0; i < rowSplit.length; i++) {
        let rawRow = rowSplit[i];
        let cols = rawRow.split('\t');
        let values = cols;
        let unitType = values.shift();
        result[unitType] = values;
    }
    _parsedSoftUpgradesData = result;
    return _parsedSoftUpgradesData;
}
function onChangeFilters() {
    log('onChangeFilters()');
    var typeFilterValue = getEventFilterTypeValue();
    var countryFilterValue = getEventFilterCountryValue();
    var freetextValue = getEventFilterFreetextValue();
    var eventElems = document.querySelectorAll('#eventsContainer .content .overview ul li');
    for (var i = 0; i < eventElems.length; i++) {
        var evEl = eventElems[i];
        var typeOk = evalFilterType(evEl, typeFilterValue);
        var countryOk = evalFilterCountry(evEl, countryFilterValue);
        var freetextOk = evalFilterFreetext(evEl, freetextValue);
        var show = typeOk && countryOk && freetextOk;
        if (show) {
            evEl.removeAttribute('hidden');
        }
        else {
            evEl.setAttribute('hidden', '');
        }
    }
}
function addTypeFilterSelect(elem) {
    log('addTypeFilterSelect()');
    let wrapper = document.createElement('div');
    wrapper.id = 'confetti-event-wrapper-type';
    wrapper.style.marginRight = '1rem';
    let filterLabel = document.createElement('span');
    filterLabel.innerText = 'Type: ';
    wrapper.appendChild(filterLabel);
    let filterSelect = document.createElement('select');
    filterSelect.id = _eventFilterTypeId;
    wrapper.appendChild(filterSelect);
    filterSelect.style.padding = '0.5rem';
    DomHelpers.addOptionToSelect('All', 'ALL', filterSelect);
    DomHelpers.addOptionToSelect('Combat', 'COM', filterSelect);
    DomHelpers.addOptionToSelect('Territories', 'TER', filterSelect);
    DomHelpers.addOptionToSelect('Agents', 'AGE', filterSelect);
    DomHelpers.addOptionToSelect('Research', 'RES', filterSelect);
    DomHelpers.addOptionToSelect('City Production', 'CIT', filterSelect);
    DomHelpers.addOptionToSelect('Diplomacy', 'DIP', filterSelect);
    filterSelect.addEventListener('change', onChangeFilters);
    elem.append(wrapper);
}
var _eventFilterTypeId = 'confetti-filter-type-select';
function getEventFilterTypeValue() {
    return DomHelpers.getInputElementById('' + _eventFilterTypeId).value;
}
var _eventFilterCountryId = 'confetti-filter-country-select';
function getEventFilterCountryValue() {
    return DomHelpers.getInputElementById('' + _eventFilterCountryId).value;
}
var _eventFilterFreetextId = 'confetti-filter-freetext-input';
function getEventFilterFreetextValue() {
    return DomHelpers.getInputElementById('' + _eventFilterFreetextId).value;
}
function evalFilterType(evEl, filter) {
    if (!filter || filter == '' || filter == 'ALL')
        return true;
    var desc = evEl.querySelector('.event-description');
    var content = '';
    if (desc) {
        content = desc.innerText;
    }
    else {
        return true;
    }
    var value = evEl.getAttribute(EventFilterTypeAttrName);
    return value == filter;
}
function evalFilterCountry(evEl, filter) {
    if (!filter || filter == '')
        return true;
    var attr = evEl.getAttribute('data-country');
    return attr === filter;
}
function evalFilterFreetext(evEl, filter) {
    if (!filter || filter == '')
        return true;
    return evEl.textContent.toLowerCase().includes(filter.toLowerCase());
}
function addCountryFilterSelect(elem) {
    log('addCountryFilterSelect()');
    var countries = detectCountriesInEvents();
    let wrapper = document.createElement('div');
    wrapper.id = 'confetti-event-wrapper-country';
    wrapper.style.marginRight = '1rem';
    let filterLabel = document.createElement('span');
    filterLabel.innerText = 'Country: ';
    wrapper.appendChild(filterLabel);
    let filterSelect = document.createElement('select');
    filterSelect.id = _eventFilterCountryId;
    wrapper.appendChild(filterSelect);
    filterSelect.style.padding = '0.5rem';
    DomHelpers.addOptionToSelect('All', '', filterSelect);
    for (var i = 0; i < countries.length; i++) {
        var c = countries[i];
        DomHelpers.addOptionToSelect(c.value, c.key, filterSelect);
    }
    filterSelect.addEventListener('change', onChangeFilters);
    elem.append(wrapper);
}
function detectCountriesInEvents() {
    var eventElems = document.querySelectorAll('#eventsContainer .content .overview ul li');
    var countriesLower = [];
    for (var i = 0; i < eventElems.length; i++) {
        var evEl = eventElems[i];
        var finds = evEl.querySelectorAll('.small_flag_container img');
        if (finds.length === 0)
            continue;
        var el = finds[0];
        var imgSrc = el.getAttribute('src');
        var countryName = imgSrc.split('small_')[1].split('.png')[0];
        evEl.setAttribute('data-country', countryName);
        if (countriesLower.indexOf(countryName) === -1) {
            countriesLower.push(countryName);
        }
    }
    var result = countriesLower.map((s) => {
        if (_flagCountryNameDict[s]) {
            return { key: s, value: _flagCountryNameDict[s] };
        }
        else {
            return { key: s, value: toUpperCaseFirst(s) };
        }
    });
    console.log('>>>>>> countries result', { result });
    result.sort((a, b) => (a.value < b.value ? -1 : 1));
    return result;
}
function addFreetextFilter(wrapper) {
    var div = document.createElement('div');
    div.id = 'confetti-event-wrapper-freetext';
    div.setAttribute('style', 'display: flex; align-items: center;');
    var labelElem = document.createElement('span');
    labelElem.innerText = 'Text: ';
    div.appendChild(labelElem);
    var inputElem = document.createElement('input');
    inputElem.setAttribute('style', 'align-self: stretch; flex: 1;');
    inputElem.id = _eventFilterFreetextId;
    div.appendChild(inputElem);
    inputElem.addEventListener('keyup', onChangeFilters);
    wrapper.appendChild(div);
}
function getGameId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gameID');
}
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function log(msg) {
    if (typeof msg === 'string') {
        console.log('[CONfetti] ' + msg);
    }
    else {
        console.log('[CONfetti] ', msg);
    }
}
function inIframe() {
    try {
        return window.self !== window.top;
    }
    catch (e) {
        return true;
    }
}
function toUpperCaseFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
const _flagCountryNameDict = {
    thechosen: 'The Chosen',
    roguestate: 'Rogue State',
};
const _unitBuildlingPopupCss = `
thead.ext-ub-head {
border-bottom: 1px solid #fff;
}
td.ext-ub-cell-category {
border-right: 1px solid #fff;
}
#ExtUbTable tbody td {
padding: 1rem;
vertical-align: unset;
}
`;
const _unitBuildlingLevelTableTemplate = `<table id="ExtUbTable">
	<thead class="ext-ub-head">
		<tr>
			<th>Building</th>
			<th>Level 1</th>
			<th>Level 2</th>
			<th>Level 3</th>
			<th>Level 4</th>
			<th>Level 5</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="ext-ub-cell-category">Army Base</td>
			<td id="army_1"></td>
			<td id="army_2"></td>
			<td id="army_3"></td>
			<td id="army_4"></td>
			<td id="army_5"></td>
		</tr>
		<tr>
			<td class="ext-ub-cell-category">Air Base</td>
			<td id="air_1"></td>
			<td id="air_2"></td>
			<td id="air_3"></td>
			<td id="air_4"></td>
			<td id="air_5"></td>
		</tr>
		<tr>
			<td class="ext-ub-cell-category">Naval Base</td>
			<td id="naval_1"></td>
			<td id="naval_2"></td>
			<td id="naval_3"></td>
			<td id="naval_4"></td>
			<td id="naval_5"></td>
		</tr>
	</tbody>
</table>`;
const _buildingIconSvg = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 442 442" style="enable-background:new 0 0 442 442;" xml:space="preserve">
<g>
	<path d="M382,0H60c-5.523,0-10,4.477-10,10v422c0,5.523,4.477,10,10,10h322c5.523,0,10-4.477,10-10V10C392,4.477,387.523,0,382,0z
		 M295,422h-55V279h55V422z M372,422h-57V269c0-5.523-4.477-10-10-10h-75c-5.523,0-10,4.477-10,10v153H70V20h302V422z"/>
	<path d="M103,128h50c5.523,0,10-4.477,10-10V53c0-5.523-4.477-10-10-10h-50c-5.523,0-10,4.477-10,10v65
		C93,123.523,97.477,128,103,128z M113,63h30v45h-30V63z"/>
	<path d="M196,128h50c5.523,0,10-4.477,10-10V53c0-5.523-4.477-10-10-10h-50c-5.523,0-10,4.477-10,10v65
		C186,123.523,190.477,128,196,128z M206,63h30v45h-30V63z"/>
	<path d="M289,128h50c5.523,0,10-4.477,10-10V53c0-5.523-4.477-10-10-10h-50c-5.523,0-10,4.477-10,10v65
		C279,123.523,283.477,128,289,128z M299,63h30v45h-30V63z"/>
	<path d="M103,236h50c5.523,0,10-4.477,10-10v-65c0-5.523-4.477-10-10-10h-50c-5.523,0-10,4.477-10,10v65
		C93,231.523,97.477,236,103,236z M113,171h30v45h-30V171z"/>
	<path d="M196,236h50c5.523,0,10-4.477,10-10v-65c0-5.523-4.477-10-10-10h-50c-5.523,0-10,4.477-10,10v65
		C186,231.523,190.477,236,196,236z M206,171h30v45h-30V171z"/>
	<path d="M289,236h50c5.523,0,10-4.477,10-10v-65c0-5.523-4.477-10-10-10h-50c-5.523,0-10,4.477-10,10v65
		C279,231.523,283.477,236,289,236z M299,171h30v45h-30V171z"/>
	<path d="M103,344h50c5.523,0,10-4.477,10-10v-65c0-5.523-4.477-10-10-10h-50c-5.523,0-10,4.477-10,10v65
		C93,339.523,97.477,344,103,344z M113,279h30v45h-30V279z"/>
</g></svg>`;
const _eventWindowStyle = `
li.event-box-standard[data-filter-type="CIT"] {
	background: #275781 !important;
}
li.event-box-standard[data-filter-type="DIP"] {
	background: teal !important;
}
li.event-box-standard[data-filter-type="RES"] {
	background: lightslategray !important;
}
li.event-box-spyaction[data-agent-actor="ENEMY"] {
	background: #d760bd !important;
}
li.event-box-standard[data-event-type="TERCON"] {
	background: #577057 !important;
}

li.event-box-spyaction[data-agent-actor="ME"][data-agent-outcome="Y"] .event-time {
	color: #0f0;
}
li.event-box-spyaction[data-agent-actor="ME"][data-agent-outcome="N"] .event-time {
	color: yellow;
}
li.event-box-spyaction[data-agent-actor="ENEMY"][data-agent-outcome="Y"] .event-time {
	// color: #0f0;
}
li.event-box-spyaction[data-agent-actor="ENEMY"][data-agent-outcome="N"] .event-time {
	// color: yellow;
}

#confetti-event-filters span {
	margin-right: 0.25rem;
}

#eventsContainer .content .overview ul li.confetti-event-unread {
	border-left: 4px solid yellow
}

`;
class PopupWindow {
    constructor(name, openFunc) {
        this.name = name;
        this.openFunc = openFunc;
    }
    open() {
        this.windowElement = this.openFunc();
    }
    close() {
        this.windowElement.remove();
    }
}
class DomHelpers {
    static getInputElementById(idSelector) {
        return document.getElementById(idSelector);
    }
    static addOptionToSelect(displayName, value, parentElem) {
        let node = document.createElement('option');
        node.value = value;
        node.innerText = displayName;
        parentElem.appendChild(node);
    }
}
const DomIds = {};
class ResearchData {
}
ResearchData.UnitSoftUpgradesData = `Motorized Infantry		Engine Upgrade I	Man Portable Air Defense		Engine Upgrade II		Personal Armor
Mechanized Infantry		Engine Upgrade		NBC Protection	Reinforced Armor
Naval Infantry		Engine Upgrade	Portable Air Defense		NBC Protection
Airborne Infantry		Jungle Warfare Training	Rapid Deployment Training		Woodland Warfare Training	Advanced Ballistic Armor
Special Forces		Portable Air Defense		Amphibious Warfare Training
National Guard		Personal Armor	Rapid Deployment Training I		Rapid Deployment Training II		Streamlined Mobilization
Combat Recon Vehicle		Engine Upgrade	Air Assault		NBC Protection		Reinforced Armor
Armored Fighting Vehicle		Ground-to-Air Armament Upgrade	Reinforced Armor		NBC Protection		Urban Survival Kit
Amphibious Combat Vehicle
Main Battle Tank		Reinforced Armor	Engine Upgrade		NBC Protection		Urban Survival Kit
Tank Destroyer		Anti Personnel Ammunition	Engine Upgrade		Air Assault		Reinforced Armor
Towed Artillery		Rocket Assisted Projectiles		Air Assault	Enhanced Optical Sights		Extended Barrel Upgrade
Mobile Artillery		Rocket Assisted Projectiles	Reinforced Armor		NBC Protection
Multiple Rocket Launcher		Improved Rocket Range	Engine Upgrade
Mobile Anti-Air Vehicle		Reinforced Armor	Engine Upgrade		Air Assault		Ground-to-Air Armament Upgrade
Mobile SAM Launcher		Improved Missile Range	Engine Upgrade		Air Assault
Theater Defense System		Improved Missile Range	Survivability Kit		Stealth Locating System
Mobile Radar		Advanced Sensors Array	Engine Upgrade		Stealth Locating System
Helicopter Gunship		Bulletproofing	Engine Upgrade		AT Missile Pods		Fuel Optimization Measures
Attack Helicopter		Bulletproofing		Fuel Optimization Measures	Engine Upgrade		Streamlined Mobilization
ASW Helicopter		Fuel Optimization Measures	Advanced Sensors Array		Anti-Surface Warfare Kit
Air Superiority Fighter		Reinforced Airframe	Engine Replacement		Fuel Optimization Measures		Streamlined Mobilization
Naval Air Superiority Fighter
Stealth Air Superiority Fighter
Strike Fighter		Reinforced Airframe	Air-to-Air Armament Upgrade		Fuel Optimization Measures		Streamlined Mobilization
Naval Strike Fighter
Stealth Strike Fighter
UAV		Fuel Optimization Measures		Engine Replacement	Reinforced Airframe
Naval Patrol Aircraft		Advanced Sensor Array		Cruise Missile Hardpoints
AWACS		Reinforced Airframe	Advanced Sensor Array		Stealth Locating System
Naval AWACS
Heavy Bomber		Reinforced Airframe	Fuel Optimization Measures		Increased Missile Hardpoints		Bunker Busting Ordnance
Stealth Bomber
Corvette		Survivability Refit	Streamlined Mobilization		Engine Overhaul		Air Defense Upgrade
Frigate		AA Envelope Expansion	Point-Defense Upgrade		Engine Overhaul	Stealth Locating System
Destroyer		Engine Overhaul	Air Defense Upgrade		Survivability Refit
Cruiser		Survivability Refit		Expanded Missile Magazine
Aircraft Carrier		Air Defense Upgrade		Point-Defense Upgrade
Attack Submarine		Survivability Refit	Nuclear Reactor Refit		Expanded Missile Magazine
Ballistic Missile Submarine		Nuclear Reactor Refit	Cruise Missile Launch System		Improved Reloading System	Expanded Missile Magazine
ICBM		Fuel Improvement	Warhead Shielding
Ballistic Missile		Fuel Improvement	Booster Upgrade		Warhead Shielding
Cruise Missile		Booster Upgrade	Fuel Improvement		Warhead Shielding		`;
ResearchData.UnitDoctrineData = `Motorized Infantry									Basic Infantry	Advanced Infantry	Modern Infantry
Mechanized Infantry									Basic Mechanized	Advanced Mechanized	Modern Mechanized
Naval Infantry									Basic Marines	Advanced Marines	Modern Marines
Airborne Infantry									Basic Airborne	Advanced Airborne	Modern Airborne
Special Forces	Basic Rangers	Advanced Rangers	Modern Rangers		Basic SAS	Advanced SAS	Modern SAS		Basic Spetsnaz	Advanced Spetsnaz	Modern Spetsnaz
National Guard									Basic National Guard	Advanced National Guard	Modern National Guard
Combat Recon Vehicle	M113 Recon	M1117 RSTA	LAV-25		Fox FV721	VEC-M1	Griffon VBMR		BRDM-1	BRDM-2	BRDM-3
Armored Fighting Vehicle	M551 Sheridan	M2 Bradley	M3 Bradley		Scorpion	FV Warrior	Puma		BMP-2	BMP-3 Dragon	T-15
Amphibious Combat Vehicle	LVTP-7	AAVP-7A1	ACV 1.1		Fuchs	Piranha	VCBI II		BTR-80	BTR-90	Bumerang
Main Battle Tank	M1A1 Abrams	M1A2 Abrams	M1A3 Abrams		Leopard 2	Challenger 2	Leopard 2A7+		T-80	T-90	T-14 Armata
Tank Destroyer	M56 Scorpion	M901 ITV	M1134 Stryker ATGM		Kanonenjagdpanzer	AMX-10 RC	Centauro		2S25 Sprut-SD	BMPT Terminator	BMPT-72 Terminator 2
Towed Artillery	M198 Howitzer	M119 Howitzer	M777 Howitzer		FH70	TRF1	155 GH 52 APU		D-30 Howitzer	2A36 Giatsint-B	2A Msta-B
Mobile Artillery	M110 Howitzer	M109 Howitzer	M1203 NLOS		GCT 155mm	AS-90 Braveheart	Panzerhaubitzer 2000		2S3 Akatsiya	2S19 Msta-S	2S35 Koalitsiya-SV
Multiple Rocket Launcher	M270 MLRS	M270A1 MLRS	M142 HIMARS		Teruel	M270 B1	LRSVM Morava		BM-21 Grad	BM-30 Smerch	9A52-4 Tornado
Mobile Anti-Air Vehicle	M163 VADS	M247 Sergeant York	LAV-AD Air Defense		Gepard	Otomatic	Marksman		AZU-57-2	ZSU-23-4 Shilka	2K22 Tunguska
Mobile SAM Launcher	MIM-23 Hawk	MIM-72 Chaparral	AN/TWQ-1 Avenger		Ozelot	Crotale	Stormer HVM		9K35 Strela-10	BUK M1	Pantsir-S1
Theater Defense System	MIM-14 Nike	MIM-104 Patriot	THAAD Missile Defence		Bloodhound	MEADS	SAMP/T		S-125 Neva	S-300	S-400 Triumf
Mobile Radar	LCM RADAR	ELEC EQ-36	PATRIOT AN/MPQ-53		UNIMOG SCB	MARS-L	Ground Master 400		1L121-E	KASTA	Nebo-M
Helicopter Gunship	Kiowa	UH-1Y Venom	Armed Black Hawk		Gazelle	Super Puma	NH-90		Mi-8 TVK	Mi-24 Hind	Mi-35M
Attack Helicopter	AH-1G Cobra	AH-1Z Viper	AH-64D Apache Longbow		A129 Mangusta	AW Apache AH64D	Tiger		Ka-50 Black Shark	Ka-52 Alligator	Mi-28 Havoc
ASW Helicopter	SH-3 Sea King	SH-2 Super Seasprite	MH-60R Seahawk		AB 212ASW	Panther	AW159 Wildcat		Ka-25	Mi-14 Haze	Ka-27 Helix
Air Superiority Fighter	F-5 Tiger	F-16A Fighting Falcon	F-16V Viper		J 35A Draken	Mirage F1	Typhoon		MiG-23 Flogger	MiG-29 Fulcrum	MiG-35 Super Fulcrum
Naval Air Superiority Fighter	F-4 Phantom II	F-14A Tomcat	F-14D Super Tomcat		Étendard IVM	Jaguar M	Rafale M		Yak-141	Su-33 Flanker D	MiG-29K
Stealth Air Superiority Fighter	F-22 Raptor				MBB Firefly				Su-47 Berkut
Strike Fighter	F-111 Aardvark	F-15 Strike Eagle	F-15 Silent Eagle		Mirage Delta 2000	Tornado	JAS 39 Gripen		Su-24 Fencer	Su-27 Flanker	Su-35 Super Flanker
Naval Strike Fighter	A-6 Intruder	A-7 Corsair II	F-18 Super Hornet		Harrier	Super Étendard	Harrier II Plus		Yak-38	Su-27K	Su-35K
Stealth Strike Fighter	F-35 Lightning II				F-117 Nighthawk				Su-T50 PakFa
UAV	MQ1-Predator	RQ-9 Global Hawk	X-47B		Super Heron	MQ9-Reaper	NEUROn		ZOND II	United 40 B5	MIG SKAT
Naval Patrol Aircraft	P-3 Orion	CP-140 Aurora	P-8 Poseidon		Nimrod	CN-235 CASA	C295 Persuader		Tu-142 Bear	Il-38 Dolphin	A-40 Albatros
AWACS	EC-121 Warning Star	E-3 Sentry	E-8 Joint STARS		EC-121 Warning Star	E-3 Sentry	E-8 Joint STARS		Tu-126	A-50 Mainstay	A-100
Naval AWACS	E-2 Hawkeye				Bombardier Globaleye				Tu-126XXXXX
Heavy Bomber	B-47 Stratojet	B-52 Stratofortress	B-1 Lancer		Valiant	Victor	Vulcan		Tu-95 Bear	Tu-22M Backfire	Tu-160 White Swan
Stealth Bomber	B-2 Spirit				SR71 Blackbird				Tu-PakDa
Corvette	Hamilton Class	Cyclone Class	Freedom Class LCS		Descubierta Class	Göteborg Class	Braunschweig Class		Albatros Class	Steregushchiy Class	Gremyashchiy Class
Frigate	Garcia Class	Knox Class	Perry Class		Duke Class	Bremen Class	Horizon Class		Krivak Class	Neutrashimy Class	Admiral Gorshkov Class
Destroyer	Farragut Class	Spruance Class	Arleigh Burke Class		Hamburg Class	Gloucester Class	Daring Class		Kashin Class	Sovremennyy Class	Lider Class
Cruiser	California Class	Virginia Class	Ticonderoga Class		Tiger Class	Vittorio Veneto Class	Absalon Class		Kresta II Class	Kara Class	Slava Class
Aircraft Carrier	Kitty Hawk Class	Nimitz Class	Gerald R. Ford Class		Giuseppe Garibaldi Class	Charles de Gaulle Class	Queen Elizabeth Class		Kiev Class	Kuznetsov Class	Ulyanovsk Class
Attack Submarine	Los Angeles Class	Seawolf Class	Virginia Class		Swiftsure Class	Rubis Class	Astute Class		Viktor Class	Akula Class	Yasen Class
Ballistic Missile Submarine	Benjamin Franklin Class	Ohio Class	Columbia Class		Resolution Class	Vanguard Class	Triomphant Class		Delta Class	Typhoon Class	Borey Class
ICBM	Minuteman III	GBSD			M51.1	M51.2			RT-2PM Topol	RS-26 Rubezh
Ballistic Missile	Pershing I	Pershing II	Pershing III		PGM-17 Thor	SSBS S3	J-600T		Scud	SS-20 Saber	9K720 Iskander
Cruise Missile	Gryphon	Tomahawk	LRSO		RBS-15	KEPD 350	Storm Shadow		P-500 Bazalt	Kh-55	3M-54 Klub`;
ResearchData.UnitBuildingLevelsData = `Army	Motorized Infantry	Mechanized Infantry	Special Forces	Multiple Rocket Launcher	Theater Defense System
	National Guard	Naval Infantry	Mobile Artillery
	Combat Recon Vehicle	Airmobile Infantry	Mobile SAM Launcher
	Mobile Anti-Air Vehicle	Armored Fighting Vehicle	⭐Tank Commander
	⭐Infantry Officer	Amphibious Combat Vehicle
	⭐Airborne Officer	Main Battle Tank
		Tank Destroyer
		Towed Artillery
		Mobile Radar

Air	Helicopter Gunship	Attack Helicopter	Naval Strike Fighter	AWACS	Stealth Air Superiority Fighter
	Air Superiority Fighter	ASW Helicopter	Naval Patrol Aircraft	Naval AWACS	Stealth Strike Fighter
	UAV	Naval Air Superiority Fighter	Heavy Bomber		Stealth Bomber
	⭐Rotary Wing Officer	Strike Fighter
		⭐Fixed Winged Officer

Naval		Corvette	Destroyer	Cruiser	Aircraft Carrier
		Frigate	Attack Submarine	Ballistic Missile Submarine
		⭐Naval Officer	⭐Submarine Commander		`;
