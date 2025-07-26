// ==UserScript==
// @name         必应积分搜索任务
// @namespace    http://tampermonkey.net/
// @version      2024-06-16
// @description  try to take over the world!
// @run-at document-end
// @author       https://github.com/f642628821
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
    $logEl.style.top = '100px';
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
    function __timeLog(...args) {
        const timeLogElId = '__time_log_el';
        const $timeLogEl = $logEl.querySelector('#' + timeLogElId);
        if (!$timeLogEl) {
            $logEl.innerHTML += `<br/><div id="${timeLogElId}">${args.join(' ')}</div>`;
        } else {
            $timeLogEl.innerHTML = args.join(' ');
        }
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
    let $idrc = await waitFor('#rh_rwm');
    //debugger;
    if (!$idrc) {
        __log('没找到元素#rh_rwm')
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
        todayComplete = JSON.parse(localStorage.getItem(todayCompleteKey) || '{}'),
        currentRewards = parseInt(_window.document.getElementById('rh_rwm').innerText.trim());
    __log('当前积分:', rewardsNum);
    __log('当前关键词:', currentKeyword);
    __log('上次关键词:', preKeyword || '无');
    __log('当前点击次数:', currentCount);
    __log('今天总计积分:', todayrewards);
    __log('今天已搜索关键词位置:', todayIndexs.join(','));
    const __timeout = _window.setTimeout(() => {
        run();
    }, 5e3);
    const longTime = true,
          totalSeconds = (longTime ? (Math.floor(Math.random() * 8) + 3) * 60 : 5);
    function run () {
        if (isRunning) return;
        isRunning = true;
        //if (longTime) {
            let countDown = totalSeconds;
            let __interval = setInterval(() => {
                countDown --;
                if (countDown > 0) {
                    __timeLog(countDown, '秒后继续操作');
                } else {
                    clearInterval(__interval);
                }
            }, 1e3)
        //}
        _window.setTimeout(() => {
            __log("开始执行操作...");
            window.scrollTo(0, _window.document.body.clientHeight + 9000);
            let day = new Date(),
                today = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`,
                maxRewards = 81,
                maxCount = 3;

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
            const strs = shuffleArray([
                "天地玄黄","宇宙洪荒","日月盈昃","辰宿列张",
                "寒来暑往","秋收冬藏","闰余成岁","律吕调阳",
                "云腾致雨","露结为霜","金生丽水","玉出昆冈",
                "剑号巨阙","珠称夜光","果珍李柰","菜重芥姜",
                "海咸河淡","鳞潜羽翔","龙师火帝","鸟官人皇",
                "始制文字","乃服衣裳","推位让国","有虞陶唐",
                "吊民伐罪","周发殷汤","坐朝问道","垂拱平章",
                "爱育黎首","臣伏戎羌","遐迩一体","率宾归王",
                "鸣凤在竹","白驹食场","化被草木","赖及万方",
                "盖此身发","四大五常","恭惟鞠养","岂敢毁伤",
                "女慕贞洁","男效才良","知过必改","得能莫忘",
                "罔谈彼短","靡恃己长","信使可覆","器欲难量",
                "墨悲丝染","诗赞羔羊","景行维贤","克念作圣",
                "德建名立","形端表正","空谷传声","虚堂习听",
                "祸因恶积","福缘善庆","尺璧非宝","寸阴是竞",
                "资父事君","曰严与敬","孝当竭力","忠则尽命",
                "临深履薄","夙兴温凊","似兰斯馨","如松之盛",
                "川流不息","渊澄取映","容止若思","言辞安定",
                "笃初诚美","慎终宜令","荣业所基","籍甚无竟",
                "学优登仕","摄职从政","存以甘棠","去而益咏",
                "乐殊贵贱","礼别尊卑","上和下睦","夫唱妇随",
                "外受傅训","入奉母仪","诸姑伯叔","犹子比儿",
                "孔怀兄弟","同气连枝","交友投分","切磨箴规",
                "仁慈隐恻","造次弗离","节义廉退","颠沛匪亏",
                "性静情逸","心动神疲","守真志满","逐物意移",
                "坚持雅操","好爵自縻","都邑华夏","东西二京",
                "背邙面洛","浮渭据泾","宫殿盘郁","楼观飞惊",
                "图写禽兽","画彩仙灵","丙舍旁启","甲帐对楹",
                "肆筵设席","鼓瑟吹笙","升阶纳陛","弁转疑星",
                "右通广内","左达承明","既集坟典","亦聚群英",
                "杜稿钟隶","漆书壁经","府罗将相","路侠槐卿",
                "户封八县","家给千兵","高冠陪辇","驱毂振缨",
                "世禄侈富","车驾肥轻","策功茂实","勒碑刻铭",
                "磻溪伊尹","佐时阿衡","奄宅曲阜","微旦孰营",
                "桓公匡合","济弱扶倾","绮回汉惠","说感武丁",
                "俊乂密勿","多士实宁","晋楚更霸","赵魏困横",
                "假途灭虢","践土会盟","何遵约法","韩弊烦刑",
                "起翦颇牧","用军最精","宣威沙漠","驰誉丹青",
                "九州禹迹","百郡秦并","岳宗泰岱","禅主云亭",
                "雁门紫塞","鸡田赤城","昆池碣石","钜野洞庭",
                "旷远绵邈","岩岫杳冥","治本于农","务兹稼穑",
                "俶载南亩","我艺黍稷","税熟贡新","劝赏黜陟",
                "孟轲敦素","史鱼秉直","庶几中庸","劳谦谨敕",
                "聆音察理","鉴貌辨色","贻厥嘉猷","勉其祗植",
                "省躬讥诫","宠增抗极","殆辱近耻","林皋幸即",
                "两疏见机","解组谁逼","索居闲处","沉默寂寥",
                "求古寻论","散虑逍遥","欣奏累遣","戚谢欢招",
                "渠荷的历","园莽抽条","枇杷晚翠","梧桐蚤凋",
                "陈根委翳","落叶飘摇","游鹍独运","凌摩绛霄",
                "耽读玩市","寓目囊箱","易輶攸畏","属耳垣墙",
                "具膳餐饭","适口充肠","饱饫烹宰","饥厌糟糠",
                "亲戚故旧","老少异粮","妾御绩纺","侍巾帷房",
                "纨扇圆絜","银烛炜煌","昼眠夕寐","蓝笋象床",
                "弦歌酒宴","接杯举觞","矫手顿足","悦豫且康",
                "嫡后嗣续","祭祀烝尝","稽颡再拜","悚惧恐惶",
                "笺牒简要","顾答审详","骸垢想浴","执热愿凉",
                "驴骡犊特","骇跃超骧","诛斩贼盗","捕获叛亡",
                "布射僚丸","嵇琴阮啸","恬笔伦纸","钧巧任钓",
                "释纷利俗","并皆佳妙","毛施淑姿","工颦妍笑",
                "年矢每催","曦晖朗曜","璇玑悬斡","晦魄环照",
                "指薪修祜","永绥吉劭","矩步引领","俯仰廊庙",
                "束带矜庄","徘徊瞻眺","孤陋寡闻","愚蒙等诮",
                "谓语助者","焉哉乎也"
            ].join('').split(''));
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
                    __log('已累计90积分，今天任务完成，已停止自动搜索，可以关掉页面了。');
                    return;
                }
                if (currentKeyword) {
                    localStorage.setItem(preKeywordKey, currentKeyword);
                }
                __log('开始搜索...', '缓存积分：', rewardsNum, '页面积分：', currentRewards);
                let keyword = '';
                if (currentCount < maxCount) {
                    localStorage.setItem(currentCountKey, currentCount+1);
                    let $els = _window.document.querySelectorAll('#brsv3 ul.b_vList li a'),
                          idx = getRandomNumber(0, $els.length - 1, false),
                          $el = $els[idx];
                    if (!$els.length) {
                        $els = _window.document.querySelectorAll('#b_context .richrsrailsuggestion a');
                        idx = getRandomNumber(0, $els.length - 1, false);
                        $el = $els[idx];
                    }
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
        }, totalSeconds * 1e3);
    }
    const observer = new MutationObserver(() => {
        if (__timeout) _window.clearTimeout(__timeout);
        if ($idrc?.innerText) {
            console.log($idrc.innerText);
            currentRewards = parseInt($idrc.innerText.trim());
        }
        run();
    });
    observer.observe($idrc, {
        subtree: true,
        childList: true,
    });
})();
