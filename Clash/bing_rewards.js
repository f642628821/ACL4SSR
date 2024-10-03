// ==UserScript==
// @name         必应积分搜索任务
// @namespace    http://tampermonkey.net/
// @version      2024-06-16
// @description  try to take over the world!
// @run-at document-end
// @author       You
// @match        https://*.bing.com/search*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bing.com
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(async function() {
    const _window = window;
    'use strict';
    const storageKey = '___bing_rewards',
          currentKeywordKey = '___bing_curr_keyword',
          preKeywordKey = '___bing_pre_keyword',
          currentCountKey = '___bing_curr_keyword_count',
          todayIndexKey = '___bing_today_index',
          todayrewardsKey = '___bing_today_rewards',
          todayCompleteKey = '___bing_today_complete',
          logs = [];
    const $logEl = _window.document.createElement("div");
    let isRunning = false;
    $logEl.id = '___log_el';
    $logEl.style.position = 'fixed';
    $logEl.style.width = '500px';
    $logEl.style.height = '500px';
    $logEl.style.right = '0';
    $logEl.style.top = '0';
    $logEl.style.zIndex = 99999;
    $logEl.style.border = '1px solid red';
    $logEl.style.padding = '10px';
    $logEl.style.boxSizing = 'content-box';
    $logEl.style.color = 'red';
    $logEl.style.background = 'rgba(0,0,0,.2)';
    function __log(...args) {
        console.log(...args);
        logs.push(args);
        $logEl.innerHTML = logs.reduce((str, logItem) => {
            return str + '<br/>' + logItem.join(' ');
        }, '');
    }
    async function waitFor(selector, count = 0) {
        const $el = _window.document.querySelector(selector);
        if ($el) {
            return $el;
        }
        if (count >= 10) {
            return null;
        }
        count ++;
        return new Promise(resolve => {
            _window.setTimeout(() => {
                waitFor(selector, count).then(resolve);
            }, 1e3);
        })
    }
    function doSearch(wd){
        __log('搜索关键词：', wd);
        if (!wd || !wd.trim()) {
            _window.setTimeout(() => {
                _window.location.reload();
            }, 5e3);
            return;
        }
        localStorage.setItem(currentKeywordKey, wd);
        _window.location.href = "https://www.bing.com/search?q=" + encodeURIComponent(wd) + "&qs=ds&form=QBRE";
        //let ipt = _window.document.getElementById("sb_form_q");
        //let btn = _window.document.getElementById("sb_form_go");
        //ipt.value = wd;
        //btn.click();
    }
    _window.document.body.appendChild($logEl);
    const $idrc = await waitFor('#id_rc');
    //debugger;
    if (!$idrc) {
        __log('没找到元素#id_rc')
        _window.setTimeout(() => {
            _window.location.reload();
        }, 5e3);
        return;
    }
    let rewardsNum = parseInt(localStorage.getItem(storageKey)),
        currentKeyword = localStorage.getItem(currentKeywordKey) || '',
        preKeyword = localStorage.getItem(preKeywordKey) || '',
        currentCount = parseInt(localStorage.getItem(currentCountKey) || 0),
        todayrewards = parseInt(localStorage.getItem(todayrewardsKey) || 0),
        todayIndexs = JSON.parse(localStorage.getItem(todayIndexKey) || '[]'),
        todayComplete = JSON.parse(localStorage.getItem(todayCompleteKey) || '{}');
    __log('当前积分:', rewardsNum);
    __log('当前关键词:', currentKeyword);
    __log('上次关键词:', preKeyword || '无');
    __log('当前点击次数:', currentCount);
    __log('今天总计积分:', todayrewards);
    __log('今天已搜索关键词位置:', todayIndexs.join(','));
    const __timeout = _window.setTimeout(() => {
        run();
    }, 5e3);
    function run () {
        if (isRunning) return;
        isRunning = true;
        _window.setTimeout(() => {
            __log("开始执行操作...");
            window.scrollTo(0, _window.document.body.clientHeight + 9000);
            let day = new Date(),
                today = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`,
                maxRewards = 81,
                maxCount = 3,
                currentRewards = parseInt(_window.document.getElementById('id_rc').innerText.trim());

            const getRandomNumber = (min, max, rerandom = true) => {
                let num = Math.floor(Math.random() * (max - min + 1)) + min;
                if (rerandom !== false && todayIndexs.includes(num)) {
                    return getRandomNumber(min, max);
                }
                return num;
            };
            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }
            const strs = shuffleArray(['圣墟', '遮天', '天道伞', '死皮赖脸', '呼吸法', '风华绝代', '泰山', '五岳', '猴子', '重启',
                         '脸绿了', '太阳', '恒星系', '楚风', '神灵', '神奇之处', '日月星辰', '蜡染', '纪念碑', '纪念币',
                         '骨龄', '年轮', '化学方程式', '第二定律', '标准', '星球', '孩子', '漂亮', '四星级', '亚神兽', '天才',
                         '手表', '运动手环', '热情', '大造化', '超新星', '红矮星', '黑洞', '布偶猫', '哈士奇', '桃花', '次元空间',
                         "观沧海","咏雪",
                         "诫子书","狼","杞人忧天","峨眉山月歌","夜雨寄北","潼关","孙权劝学",
                         "木兰诗","卖油翁","陋室铭","爱莲说","登幽州台歌","望岳","登飞来峰","游山西村",
                         "活板","竹里馆","逢入京使","晚春","泊秦淮","贾生",
                         "约客","三峡","野望",
                         "黄鹤楼","使至塞上","渡荆门送别","钱塘湖春行","得道多助失道寡助",
                         "生于忧患死于安乐","愚公移山","春望","雁门太守行","赤壁赋能",'京公网安备','增值电信业务经营许可证',
                         '是时候展现真正的技术了', '天降大任与是人也','必先苦其心志','劳其体肤','天地玄黄','宇宙洪荒','日月盈昃辰宿列张',
                         '寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜信使可覆器欲难量摄职从政存以甘棠去而益咏浮渭据泾仁慈隐恻好爵自縻',
                         '桓公匡合济弱扶倾绮回汉惠说感武俊乂密勿多士实宁晋更霸赵魏困横俶载南亩我艺黍稷税熟贡新劝赏黜陟省躬讥诫宠增抗极殆辱'].join('').split(''));
            const arr = [];
            for (let i = 0; i < 80; i++) {
                const len = getRandomNumber(2,3,false),
                      strArr = [];
                for (let j = 0; j < len; j ++) {
                    const _str = strs.splice(getRandomNumber(0, strs.length,false),1);
                    strArr.push(_str[0]);
                }
                arr.push(strArr.join(''));
            }
            if (currentRewards > rewardsNum || !todayComplete[today]) {
                // todayrewards += currentRewards - rewardsNum;
                if (preKeyword && preKeyword !== _window.document.getElementById('sb_form_q').value && currentRewards == rewardsNum && todayrewards >= maxRewards) {
                    todayComplete = {};
                    todayComplete[today] = currentRewards;
                    localStorage.setItem(todayCompleteKey, JSON.stringify(todayComplete));
                    localStorage.setItem(currentCountKey, 0);
                    localStorage.setItem(currentKeywordKey, '');
                    localStorage.setItem(preKeywordKey, '');
                    localStorage.setItem(todayrewardsKey, 0);
                    localStorage.setItem(todayIndexKey, '');
                    return;
                }
                if (currentKeyword) {
                    localStorage.setItem(preKeywordKey, currentKeyword);
                }
                __log('开始搜索...', '页面积分：', currentRewards, '缓存积分：', rewardsNum);
                let keyword = '';
                if (currentCount < maxCount) {
                    localStorage.setItem(currentCountKey, currentCount+1);
                    const $els = _window.document.querySelectorAll('#brsv3 ul.b_vList li a'),
                          idx = getRandomNumber(0, $els.length - 1, false),
                          $el = $els[idx];
                    __log("idx:", idx, 'els length:', $els.length, '$el:', $el?.innerText, $el);
                    if ($el) {
                        keyword = $el.innerText.trim();
                        //localStorage.setItem(currentKeywordKey, keyword);
                        //location.href = $el.href;
                    }
                }
                if (!keyword) {
                    let index = getRandomNumber(0, arr.length - 1);
                    keyword = arr[index];
                    __log('keyword index:', index, 'keyword:', keyword);
                    todayIndexs.push(index);
                    localStorage.setItem(todayIndexKey, JSON.stringify(todayIndexs));
                    localStorage.setItem(currentCountKey, 0);
                }
                if (keyword) {
                    localStorage.setItem(todayrewardsKey, todayrewards + 3);
                }
                localStorage.setItem(storageKey, currentRewards);
                setTimeout(() => {
                    doSearch(keyword);
                }, 2e3);
            } else {
                alert("可以停掉了");
            }
        }, 5e3);
    }
    const observer = new MutationObserver(() => {
        if (__timeout) _window.clearTimeout(__timeout);
        run();
    });
    observer.observe($idrc, {
        subtree: true,
        childList: true,
    });
})();
