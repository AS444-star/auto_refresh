var chrome = chrome || browser
  , isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1
  , inBefore = {}
  , tabs = []
  , tabsMonitor = {};
function getCurrentTab(e) {
    chrome.tabs.query({
        currentWindow: !0,
        active: !0,
        windowType: "normal"
    }, function(t) {
        chrome.runtime.lastError,
        e && e(t[0])
    })
}
function validateEmail(e) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(e).toLowerCase())
}
var arp = {
    defaultValues() {
        null == localStorage.pmonitor && (localStorage.pmonitor = "true"),
        null == localStorage.pmpattern && (localStorage.pmpattern = "A"),
        null == localStorage.sound && (localStorage.sound = "2"),
        null == localStorage.soundvolume && (localStorage.soundvolume = 1),
        null == localStorage.pm_sound_til && (localStorage.pm_sound_til = "sound"),
        null == localStorage.random_time && (localStorage.random_time = "true"),
        null == localStorage.timercheck && (localStorage.timercheck = "true"),
        null == localStorage.asrefresh && (localStorage.asrefresh = "true"),
        null == localStorage.visualPosition && (localStorage.visualPosition = "1"),
        null == localStorage.windowFocus && (localStorage.windowFocus = "true"),
        null == localStorage.tabAlertSection && (localStorage.tabAlertSection = "true")
    },
    formatOptions(e) {
        let t = !1
          , a = "";
        return void 0 != e.track && void 0 != e.track.ac && "string" == typeof e.track.ac && "" != e.track.ac && (t = !0,
        a = e.track.ac),
        arp.global = {
            track: t,
            trackAcc: a
        },
        arp.global
    },
    saveMigration() {
        let e = {};
        [{
            name: "asrefresh",
            type: "bool"
        }, {
            name: "asrestart",
            type: "bool"
        }, {
            name: "asurl",
            type: "string"
        }, {
            name: "autostart",
            type: "bool"
        }, {
            name: "default_time",
            type: "number"
        }, {
            name: "defaultpgtxt",
            type: "string"
        }, {
            name: "hotkeys",
            type: "bool"
        }, {
            name: "interactions",
            type: "bool"
        }, {
            name: "pdcheck",
            type: "bool"
        }, {
            name: "pdurl",
            type: "string"
        }, {
            name: "pm_sound_til",
            type: "string"
        }, {
            name: "pm_sound_timeout",
            type: "string"
        }, {
            name: "pmemail",
            type: "string"
        }, {
            name: "pmonitor",
            type: "bool"
        }, {
            name: "pmpattern",
            type: "string"
        }, {
            name: "random_time",
            type: "bool"
        }, {
            name: "restartDefault",
            type: "bool"
        }, {
            name: "rpt",
            type: "bool"
        }, {
            name: "rpttext",
            type: "string"
        }, {
            name: "sound",
            type: "string"
        }, {
            name: "soundurl",
            type: "string"
        }, {
            name: "soundvolume",
            type: "string"
        }, {
            name: "timercheck",
            type: "bool"
        }, {
            name: "timesRating",
            type: "string"
        }, {
            name: "visualPosition",
            type: "string"
        }, {
            name: "visualtimer",
            type: "bool"
        }].forEach(t=>{
            let a = localStorage[t.name]
              , r = a;
            "bool" === t.type && (r = "true" === a),
            "number" === t.type && isNaN(r = Math.abs(a)) && (r = 0),
            e[t.name] = r
        }
        ),
        chrome.storage.sync.set({
            options: e
        })
    },
    startMigration() {
        arp.saveMigration(),
        chrome.storage.sync.set({
            migrationLevel: chrome.runtime.getManifest().version
        })
    },
    checktMigration() {
        chrome.storage.sync.get("migrationLevel", e=>{
            let t = e.migrationLevel;
            void 0 === t && arp.startMigration()
        }
        )
    },
    init(e) {
        arp.defaultValues(),
        arp.autoStart();
        let t = arp.formatOptions(e);
        t.track && arp.initTrack(t.trackAcc),
        arp.checktMigration()
    },
    initTrack(e) {
        var t, a, r = r || [];
        r.push(["_setAccount", e]),
        r.push(["_trackPageview"]),
        window._gaq = r,
        (t = document.createElement("script")).type = "text/javascript",
        t.async = !1,
        t.src = "https://ssl.google-analytics.com/ga.js",
        (a = document.getElementsByTagName("script")[0]).parentNode.insertBefore(t, a)
    },
    parseUrl: (e,t=!1)=>(-1 == e.search("http://") && -1 == e.search("https://") && (e = new URL("http://" + e).href),
    "/" == (e = e.replace("www.", "")).slice(-1) && (e = e.replace(/.$/, "")),
    t && (e = e.replace(/^https?:\/\//, "")),
    e),
    formatUrl(e) {
        try {
            e = new URL(-1 == e.search("http://") && -1 == e.search("https://") ? "http://" + e : e)
        } catch (t) {
            return null
        }
        let a = "/" == e.href.slice(-1) ? e.href.replace(/.$/, "") : e.href;
        a = a.replaceAll("%2A", "*");
        var r = function(e) {
            return e = (e = (e = e.replace("www.", "")).replace(/^https?:\/\//, "")).replaceAll("%2A", "*")
        };
        let n = e.host.replaceAll("%2A.", "");
        return e.cleanUrl = r(a),
        e.href = a,
        e.host = r(e.host),
        e.path = "/" == e.pathname ? "" : e.pathname,
        e.domain = psl.get(n),
        e
    },
    sendEmail: function(e) {
        fetch("https://autorefresh.io/mail/", {
            method: "POST",
            body: e
        }).then(function(e) {
            return e.text()
        }).then(function(e) {
            console.log(e)
        }).catch(function(e) {
            console.error(e)
        })
    },
    emailAlert: function(e, t, a, r) {
        var n = localStorage.pmemail
          , o = localStorage.vrfem;
        if (!o || !1 == validateEmail(e))
            return;
        let s = JSON.parse(o || {}).email;
        if (s !== n)
            return;
        let i = new FormData, l;
        l = "B" == r ? "lost" : "ANY" == r ? "ANY" : "found",
        i.append("e", e),
        i.append("b", t),
        i.append("u", a),
        i.append("p", l),
        i.append("lang", chrome.i18n.getMessage("lang_code")),
        i.append("userId", "1"),
        this.sendEmail(i),
        arp && arp._ev && arp._ev("sndEmail", "sndEmail")
    },
    defaultDataRefresh: function(e, t) {
        try {
            if (!chrome.storage)
                return;
            chrome.storage.local.get("domain_config", function(a) {
                let r = a.domain_config;
                r || (r = {});
                let n = r[e] || r[e + "/"];
                t && t(n, r)
            })
        } catch (a) {
            arp.trackErrors(a)
        }
    },
    updateDataRefresh: function(e, t, a) {
        chrome.storage.local.get("domain_config", function(r) {
            let n = r.domain_config;
            n || (n = {}),
            n[e] = t,
            chrome.storage.local.set({
                domain_config: n
            }, ()=>{
                a && a(n)
            }
            )
        })
    },
    tabStart(e) {
        if (void 0 != tabs[e.id])
            return;
        let t = localStorage.asurl;
        if ("true" == localStorage.asrefresh && t) {
            let a = t.split(/\r?\n/)
              , r = arp.parseUrl(e.url, !0);
            a.forEach((e,t)=>{
                (e = e.replace(/\s/g, "")) && "" !== e && e.length > 0 && (a[t] = arp.parseUrl(e, !0))
            }
            );
            a.indexOf(r) > -1 && arp.defaultDataRefresh(e.url, function(t) {
                defaultRefresh(e, t, 1)
            })
        }
    },
    rptStart(e) {
        if (void 0 != tabs[e.id])
            return;
        let t = localStorage.rpttext;
        t && chrome.tabs.sendMessage(e.id, {
            pattern: "E",
            words: t
        }, function(t) {
            chrome.runtime.lastError,
            null != t && "yes" == t.predefinedText && arp.defaultDataRefresh(e.url, function(t) {
                defaultRefresh(e, t, 1)
            })
        })
    },
    i18n(e, t=null) {
        let a;
        return null == t && (a = chrome.i18n.getMessage(e.toLowerCase())),
        null != t && (a = chrome.i18n.getMessage(e.toLowerCase(), t)),
        "" == a ? e : a
    },
    autoStart_open(e) {
        chrome.tabs.create({
            url: e
        }, t=>{
            arp.defaultDataRefresh(e, function(e, a) {
                chrome.tabs.onUpdated.addListener(function e(r, n, o) {
                    "complete" === n.status && r === t.id && (chrome.tabs.onUpdated.removeListener(e),
                    setTimeout(()=>{
                        defaultRefresh(o, a[o.url], 1)
                    }
                    , 200))
                })
            })
        }
        )
    },
    default_time() {
        let e = 5e3;
        return localStorage.default_time && (e = 1e3 * localStorage.default_time),
        e
    },
    autoStart() {
        let e = localStorage.asurl;
        "true" == localStorage.autostart && "true" == localStorage.asrestart && e && e.split(/\r?\n/).forEach(e=>{
            "" != (e = e.replace(/\s/g, "")) && void 0 != e && arp.autoStart_open(arp.parseUrl(e))
        }
        )
    },
    Track(e, t) {
        void 0 != arp.global && _gaq.push(["_trackEvent", e, t])
    },
    trackErrors(e) {
        console.trace(e, tabs),
        void 0 != arp.global && _gaq.push(["_trackEvent", e.name, e.stack.toString()])
    },
    _ev(e, t) {
        void 0 != arp.global && _gaq.push(["_trackEvent", e, t])
    }
};
try {
    arp.init({
        track: {
            ac: "UA-109860713-1"
        }
    })
} catch (e) {
    arp.trackErrors(e)
}
function insertFile(e, t, a=!1) {
    chrome.tabs.executeScript(e, {
        file: t,
        allFrames: a
    }, ()=>{
        chrome.runtime.lastError
    }
    )
}
chrome.tabs.onUpdated.addListener((e,t,a)=>{
    try {
        if (!a || !a.url)
            return;
        void 0 !== t.status && "loading" === t.status && (insertFile(e, "js/counterInPage.js"),
        chrome.tabs.executeScript(e, {
            file: "js/event.js",
            allFrames: !1
        }, ()=>{
            chrome.runtime.lastError,
            csManager.before(a)
        }
        )),
        void 0 !== t.status && "complete" === t.status && (csManager.start(a),
        chrome.tabs.executeScript(e, {
            file: "js/content.js",
            allFrames: !1
        }, ()=>{
            chrome.runtime.lastError,
            a.url.search("//autorefresh.io/") > -1 || ("true" == localStorage.autostart && arp.tabStart(a),
            "true" == localStorage.rpt && arp.rptStart(a))
        }
        ),
        chrome.tabs.insertCSS(e, {
            file: "/assets/css/counterInPage.css"
        }, ()=>{
            chrome.runtime.lastError
        }
        ),
        insertFile(e, "js/node_helper.js"))
    } catch (r) {
        arp.trackErrors(r)
    }
}
);
let cs_domain = {}
  , cs_blklis = {};
const csManager = {
    startData() {
        chrome.storage.local.get(function(e) {
            cs_domain = {},
            cs_blklis = {};
            let t = e.custom || null;
            t && Object.entries(t).forEach(function(e) {
                e[0];
                let t = e[1]
                  , a = arp.formatUrl(t.url).cleanUrl;
                1 == t.type ? (cs_domain[a] || (cs_domain[a] = []),
                cs_domain[a].push(t)) : (cs_blklis[a] || (cs_blklis[a] = []),
                cs_blklis[a].push(t))
            })
        })
    },
    setData() {
        chrome.storage && csManager.startData()
    },
    code(e) {
        if (!e)
            return null;
        let t = null
          , a = function(e) {
            t || (t = []),
            e.forEach(function(e) {
                t.push(e)
            })
        };
        return cs_domain[e.cleanUrl] && a(cs_domain[e.cleanUrl]),
        cs_domain[e.host + "/*"] && a(cs_domain[e.host + "/*"]),
        cs_domain["*." + e.domain + "/*"] && a(cs_domain["*." + e.domain + "/*"]),
        cs_domain["*." + e.domain + e.path] && a(cs_domain["*." + e.domain + e.path]),
        Object.keys(cs_blklis).forEach(function(t) {
            if (t != e.cleanUrl && t != e.host + "/*" && t != "*." + e.domain + "/*" && t != "*." + e.domain + e.path)
                a(cs_blklis[t])
        }),
        t
    },
    run(e, t) {
        chrome.tabs.executeScript(e, {
            code: t.code,
            allFrames: !1
        }, function() {
            chrome.runtime.lastError
        })
    },
    start(e) {
        if (!e || !e.url)
            return;
        let t = csManager.code(arp.formatUrl(e.url));
        if (t) {
            let a = "loading" == e.status ? 0 : 1;
            t.forEach(function(t) {
                t.type_inct == a && t.turn && 0 == t.cs_select && csManager.run(e.id, t)
            })
        }
    },
    before(e) {
        e && e.url && chrome.tabs.sendMessage(e.id, {
            greeting: "ARP_inbefore"
        }, function(t) {
            if (chrome.runtime.lastError,
            t && "ready" == t.message) {
                let a = csManager.code(arp.formatUrl(e.url));
                if (a) {
                    let r = "loading" == e.status ? 0 : 1;
                    a.forEach(function(t) {
                        t.type_inct == r && t.turn && 0 == t.cs_select && csManager.run(e.id, t)
                    })
                }
            }
        })
    },
    pageMonitor(e, t) {
        if (!e || !e.url)
            return;
        let a = csManager.code(arp.formatUrl(e.url));
        a && a.forEach(function(a) {
            a.turn && ("A" == t && 2 == a.cs_select ? csManager.run(e.id, a) : "B" == t && 3 == a.cs_select ? csManager.run(e.id, a) : "ANY" == t && 4 == a.cs_select && csManager.run(e.id, a))
        })
    },
    pageRefresh(e, t) {
        chrome.tabs.get(e, function(e) {
            if (chrome.runtime.lastError,
            !e || !e.url)
                return;
            let a = csManager.code(arp.formatUrl(e.url));
            a && a.forEach(function(a) {
                a.type_inct == t && a.turn && 1 == a.cs_select && csManager.run(e.id, a)
            })
        })
    }
};
csManager.setData();
var RELOAD_LIMIT = 10
  , counters = {}
  , pending_reloads = {}
  , blank_page = chrome.runtime.getURL("blank.html");
function loop_start(e, t, a, r, n, o, s, i={}) {
    try {
        if (!e || !e.id)
            return;
        i.pmOptions && "2" == i.pmOptions.type ? chrome.tabs.sendMessage(e.id, {
            pattern: "ANY",
            options: i
        }, l=>{
            if (chrome.runtime.lastError,
            !l) {
                chrome.tabs.reload(e.id, function() {
                    chrome.runtime.lastError,
                    setTimeout(function() {
                        loop_start(e, t, a, r, n, o, s, i)
                    }, 500)
                });
                return
            }
            null == s && (i.doc_instance = l.body),
            arp_loop(e, t, a, r, n, o, s, i)
        }
        ) : arp_loop(e, t, a, r, n, o, s, i)
    } catch (l) {
        arp.trackErrors(l)
    }
}
function defaultRefresh(e, t, a) {
    t || (t = {});
    let r, n, o;
    if (1 == a)
        r = -1,
        n = t.time_interval || 1e3 * localStorage.default_time,
        o = t.time_type || "custom";
    else if (2 == a) {
        let s = t.randomInterval;
        r = -1,
        n = "5-30",
        s && s.min && s.max && (n = s.min + "-" + s.max),
        o = "rand"
    } else
        3 == a && (r = t.timerInterval || 6e5,
        n = t.time_interval || 1e3 * localStorage.default_time,
        o = t.time_type || "custom");
    let i = t.pmOptions || {};
    i.type || (i = {
        type: "1",
        refresh: "1",
        visual: !0,
        source: !1,
        restart: "true" == localStorage.restartDefault,
        emailEnabled: !1
    }),
    loop_start(e, r, n, o, t.checkme || null, null == t.pm_p_type ? "A" : t.pm_p_type, t.preurl || null, {
        openLink: null != t.openLink && t.openLink,
        inNewTab: null != t.inNewTab && t.inNewTab,
        hardRefresh: null != t.hardRefresh && t.hardRefresh,
        refreshNumber: null != t.refreshNumber && t.refreshNumber,
        setRefNumber: t.setRefNumber || "0",
        autoclick: t.autoclick || "",
        visual: null == t.visual ? "true" == localStorage.visualTimer : t.visual,
        interactions: null == t.interactions ? "true" == localStorage.interactions : t.interactions,
        pmOptions: i
    })
}
function readHotkeys(e) {
    "true" == (localStorage.hotkeys || !1) && (arp._ev("hotkeys", "key"),
    "startTime" == e || "startRandom" == e || "startTimer" == e ? getCurrentTab(function(t) {
        try {
            if (!chrome.storage)
                return;
            chrome.storage.local.get("domain_config", function(a) {
                let r = a.domain_config;
                if (r || (r = {}),
                "startTime" == e)
                    defaultRefresh(t, r[t.url], 1);
                else if ("startRandom" == e) {
                    if ("true" != localStorage.random_time)
                        return;
                    defaultRefresh(t, r[t.url], 2)
                } else if ("startTimer" == e) {
                    if ("true" != localStorage.timercheck)
                        return;
                    defaultRefresh(t, r[t.url], 3)
                }
            })
        } catch (a) {
            arp.trackErrors(a)
        }
    }) : "stoptTime" == e ? loop_stop(null, !0) : "killSound" == e && pause_sound())
}
function updateTabWithBlankSandwich(e, t) {
    chrome.tabs.update(e, {
        url: blank_page
    })
}
function get_rand_time(e, t) {
    return Math.round(Math.random() * (t - e - 0)) + (e - 0)
}
function arp_loop(e, t, a, r, n, o, s, i={}) {
    if (void 0 != e) {
        var l = e.id;
        if (arp._ev("start", "StartButton"),
        tabs[l] && reload_cancel(e.id, "no"),
        tabs[l] = [],
        s ? (tabs[l].pre_url = s,
        tabs[l].action_url = s) : tabs[l].action_url = e.url,
        tabs[l].interval_time = a,
        tabs[l].canonical_url = e.url,
        "rand" == r) {
            var c = a.split("-")
              , u = get_rand_time(c[0], c[1]);
            tabs[l].time_between_load = 1e3 * u
        } else if ("timer" == r) {
            let m = e=>10 > parseInt(e) ? "0" + e : e.toString();
            var d = a.split("-")
              , p = (m(d[0]) + ":" + m(d[1]) + ":" + m(d[2])).split(":")
              , f = 3600 * +p[0] + 60 * +p[1] + +p[2];
            tabs[l].time_between_load = 1e3 * f
        } else
            tabs[l].time_between_load = a;
        tabs[l].time_type = r,
        tabs[l].next_round = tabs[l].time_between_load / 1e3,
        i.doc_instance && (tabs[l].doc_instance = i.doc_instance),
        null != n && (tabs[l].checkme = n),
        null != i.openLink && (tabs[l].openLink = i.openLink),
        null != i.inNewTab && (tabs[l].inNewTab = i.inNewTab),
        null != i.autoclick && (tabs[l].autoclick = i.autoclick),
        null != i.visual && (tabs[l].visual = i.visual),
        null != i.interactions && (tabs[l].interactions = i.interactions),
        null != i.pmOptions && (tabs[l].pm_options = JSON.parse(JSON.stringify(i.pmOptions))),
        o && (tabs[l].pmpattern = o),
        tabs[l].options = JSON.parse(JSON.stringify(i)),
        tabs[l].count = 0,
        tabs[l].hardRefresh = i.hardRefresh,
        tabs[l].refreshNumber = i.refreshNumber,
        tabs[l].setRefNumber = i.setRefNumber;
        var h = tabs[l].action_url;
        if (-1 == t)
            tabs[l].status = "start",
            tabs[l].wait_time = 0,
            tabs[l].wait_next_round = 0,
            tabs[l].displayTimer && stopBadgeTimer(l),
            real_start(l, h, e.title);
        else {
            tabs[l].wait_time = t;
            var b = 0;
            t.toString().search(" ") > 0 ? (tabs[l].status = "wait",
            b = new Date(t).getTime() - new Date().getTime(),
            tabs[l].wait_next_round = Math.floor(b / 1e3)) : (tabs[l].status = "wait",
            b = t,
            tabs[l].wait_next_round = t / 1e3),
            tabs[l].displayTimer = window.setInterval(function(e) {
                tabs[e].wait_next_round--,
                setTimerBadgeText(e)
            }, 1e3, l),
            tabs[l].startTime = setTimeout(function() {
                real_start(l, h, e.title)
            }, b)
        }
    }
}
function loop_stop(e=null, t=!1) {
    let a = function(e) {
        chrome.tabs.sendMessage(e, {
            pattern: "D"
        }, function() {
            chrome.runtime.lastError
        }),
        counters[e] = 0,
        reload_cancel(e, "no", t)
    };
    e ? a(e) : getCurrentTab(function(e) {
        void 0 != e && a(e.id)
    })
}
function real_start(e, t, a) {
    stopBadgeTimer(e),
    chrome.tabs.onUpdated.addListener(onUpdateListener),
    reload_it(e, t, a)
}
function updateMonitor(e) {
    let t = tabs[e].next_round;
    tabsMonitor[e] && (tabsMonitor[e].actual = t),
    chrome.runtime.sendMessage({
        name: "updateTime",
        id: e,
        time: t
    }, e=>{
        chrome.runtime.lastError
    }
    ),
    tabs[e] && tabs[e].visual && chrome.tabs.sendMessage(e, {
        name: "updateCounter",
        time: t,
        pos: localStorage.visualPosition
    }, ()=>{
        chrome.runtime.lastError
    }
    )
}
function stopMonitor(e) {
    chrome.runtime.sendMessage({
        name: "stopTab",
        id: e
    }, e=>{
        chrome.runtime.lastError
    }
    ),
    chrome.tabs.sendMessage(e, {
        name: "stopCounter"
    }, ()=>{
        chrome.runtime.lastError
    }
    )
}
function completedMonitor(e) {
    let t = tabsMonitor[e];
    tabs[e],
    tabsMonitor[e] && (tabsMonitor[e].status = "completed",
    tabsMonitor[e].timeCompleted = Date.now()),
    chrome.runtime.sendMessage({
        name: "completedTab",
        id: e,
        data: t
    }, e=>{
        chrome.runtime.lastError
    }
    ),
    chrome.tabs.sendMessage(e, {
        name: "stopCounter"
    }, ()=>{
        chrome.runtime.lastError
    }
    )
}
function pauseMonitor(e) {
    let t = tabsMonitor[e]
      , a = tabs[e];
    tabsMonitor[e] && (tabsMonitor[e].status = a.status || "paused"),
    chrome.runtime.sendMessage({
        name: "pauseTab",
        id: e,
        data: t
    }, e=>{
        chrome.runtime.lastError
    }
    ),
    chrome.tabs.sendMessage(e, {
        name: "pauseCounter"
    }, ()=>{
        chrome.runtime.lastError
    }
    )
}
function addMonitor(e) {
    tabs[e.id],
    tabsMonitor[e.id] = e,
    chrome.runtime.sendMessage({
        name: "addTab",
        data: e
    }, e=>{
        chrome.runtime.lastError
    }
    )
}
function inRefreshTab(e, t) {
    if ("rand" == tabs[e].time_type) {
        var a = tabs[e].interval_time.split("-")
          , r = get_rand_time(a[0], a[1]);
        tabs[e].time_between_load = 1e3 * r
    }
    tabs[e].next_round = tabs[e].time_between_load / 1e3,
    updateMonitor(e),
    setTheBadgeText(e),
    setupReloadTimer(e, t),
    stopBadgeTimer(e),
    tabs[e].displayTimer = window.setInterval(function(e) {
        tabs[e].next_round--,
        updateMonitor(e),
        setTheBadgeText(e)
    }, 1e3, e),
    "2" == tabs[e].pm_options.refresh && tabs[e].autoclick && chrome.tabs.sendMessage(e, {
        name: "autoclick",
        id: tabs[e].autoclick
    }, function(e) {
        chrome.runtime.lastError
    })
}
function onUpdateListener(e, t, a) {
    if (a.url != blank_page && tabs[e] && "start" == tabs[e].status && tabs[e].time_between_load > 0) {
        if ("loading" === t.status) {
            var r = t.url || !1;
            tabs[e].pre_url ? tabs[e].action_url = tabs[e].pre_url : r && (tabs[e].action_url = r)
        } else
            "complete" === t.status && inRefreshTab(e, a.title)
    }
}
function setupReloadTimer(e, t) {
    var a = parseInt(tabs[e].time_between_load);
    "2" == tabs[e].pm_options.refresh && (a += 1e3),
    tabs[e].reloadTimer && (clearTimeout(tabs[e].reloadTimer),
    tabs[e].reloadTimer = null),
    tabs[e].reloadTimer = window.setTimeout(function(e) {
        reload_it(e, tabs[e].action_url, t)
    }, a, e)
}
function stopBadgeTimer(e) {
    tabs[e].displayTimer && (clearTimeout(tabs[e].displayTimer),
    tabs[e].displayTimer = null)
}
function setTimerBadgeText(e) {
    chrome.browserAction.setBadgeBackgroundColor({
        color: [0, 128, 0, 255],
        tabId: e
    });
    var t = String(tabs[e].wait_next_round)
      , a = tabs[e].wait_next_round % 60
      , r = Math.floor(tabs[e].wait_next_round / 60 % 60)
      , n = Math.floor(tabs[e].wait_next_round / 3600 % 24)
      , o = Math.floor(tabs[e].wait_next_round / 86400);
    if (o > 999)
        t = "9...";
    else if (o > 9)
        t = String(o) + "d";
    else if (o > 0)
        t = String(o) + "d" + String(n) + "h";
    else if (n > 0) {
        if (r < 10 && (r = "0" + String(r)),
        a % 2)
            var s = ":";
        else
            var s = " ";
        t = String(n) + s + String(r)
    } else
        a < 10 && (a = "0" + String(a)),
        t = String(r) + ":" + String(a);
    chrome.browserAction.setBadgeText({
        text: t,
        tabId: e
    })
}
function setTheBadgeText(e) {
    if (tabs[e].next_round < 0)
        chrome.browserAction.setBadgeText({
            text: "00:00",
            tabId: e
        }, ()=>{
            chrome.runtime.lastError
        }
        ),
        stopBadgeTimer(e);
    else {
        var t = String(tabs[e].next_round)
          , a = tabs[e].next_round % 60
          , r = Math.floor(tabs[e].next_round / 60 % 60)
          , n = Math.floor(tabs[e].next_round / 3600 % 24)
          , o = Math.floor(tabs[e].next_round / 86400);
        if (o > 999)
            t = "9...";
        else if (o > 9)
            t = String(o) + "d";
        else if (o > 0)
            t = String(o) + "d" + String(n) + "h";
        else if (n > 0) {
            if (r < 10 && (r = "0" + String(r)),
            a % 2)
                var s = ":";
            else
                var s = " ";
            t = String(n) + "h" + s + String(r)
        } else {
            let i = a
              , l = r;
            if (i < 10 && (i = "0" + String(i)),
            l < 10 && (l = "0" + String(l)),
            String(i).search(".") > -1) {
                let c = ""
                  , u = String(i).split(".");
                u.forEach(function(e, t) {
                    1 == e.length && (e += "0"),
                    c += e,
                    u.length > t + 1 && (c += ":")
                }),
                i = c
            }
            t = String(l) + ":" + String(i),
            0 == r && a > 0 && a < 1 && (t = String(i))
        }
        chrome.browserAction.setBadgeText({
            text: t,
            tabId: e
        }, ()=>{
            chrome.runtime.lastError && (stopBadgeTimer(e),
            clearTimeout(tabs[e].reloadTimer))
        }
        )
    }
}
function focusTab(e) {
    chrome.tabs.get(e, t=>{
        chrome.runtime.lastError,
        chrome.windows.update(t.windowId, {
            focused: !0
        }, ()=>{
            chrome.runtime.lastError,
            chrome.tabs.update(e, {
                active: !0
            })
        }
        )
    }
    )
}
function show_notification(e, t, a) {
    try {
        var r, n = "B" == e ? arp.i18n("lost") : arp.i18n("found"), o = /(..):(..)/.exec(new Date);
        o[1],
        o[1];
        var s = "ANY" == e ? arp.i18n("detect_any_change_title") : n + " " + arp.i18n("noti_msg_title")
          , i = "ANY" == e ? arp.i18n("detect_any_change") : arp.i18n("noti_msg", n) + ' "' + t + '" ';
        r = isFirefox ? chrome.notifications.create(`mynotification-${a}-${Date.now()}`, {
            type: "basic",
            title: s,
            message: i,
            iconUrl: "Icon/128.png"
        }, ()=>{}
        ) : chrome.notifications.create(`mynotification-${a}-${Date.now()}`, {
            type: "basic",
            title: s,
            message: i,
            iconUrl: "Icon/128.png",
            buttons: [{
                title: arp.i18n("show_tab")
            }, {
                title: arp.i18n("dismiss")
            }]
        }, ()=>{}
        );
        var l = "";
        localStorage.sound && "2" == localStorage.sound ? l = "./sound/sound1.mp3" : localStorage.sound && "3" == localStorage.sound ? l = "./sound/sound2.mp3" : localStorage.sound && "4" == localStorage.sound && (l = localStorage.soundurl ? localStorage.soundurl : "./sound/sound1.mp3"),
        l && (null == document.querySelector("audio") ? startAudio(l) : pause_sound_with_fadeout(document.querySelector("audio"), ()=>{
            startAudio(l)
        }
        ))
    } catch (c) {
        arp.trackErrors(c)
    }
}
function pause_sound(e) {
    null == e && (e = document.querySelector("audio")),
    pause_sound_with_fadeout(e, null)
}
function startAudio(e) {
    let t = document.createElement("audio");
    t.src = e,
    t.loop = "sound" != localStorage.pm_sound_til,
    t.volume = localStorage.soundvolume,
    document.documentElement.appendChild(t),
    t.play(),
    "timeout" == localStorage.pm_sound_til && setTimeout(()=>{
        pause_sound()
    }
    , 1e3 * localStorage.pm_sound_timeout || 5e3)
}
function kill_sound() {
    pause_sound_with_fadeout(document.querySelector("audio"), null)
}
function pause_sound_with_fadeout(e, t) {
    if (e) {
        var a = e.volume;
        volume_fadeout_timer = setInterval(function() {
            a > 0 ? (a -= .05,
            e.volume = Math.max(a, 0)) : (null != e && e.parentNode && (clearInterval(volume_fadeout_timer),
            e.pause(),
            e.parentNode.removeChild(e)),
            null != t && t())
        }, 16)
    }
}
function updateTab(e, t, a) {
    try {
        let r = !!tabs[e] && !!tabs[e].hardRefresh;
        csManager.pageRefresh(e, 0),
        counters[e] = counters[e] || 0;
        var n = {
            updatePredefined(e) {
                chrome.tabs.update(e, {
                    url: t
                }, t=>{
                    chrome.runtime.lastError,
                    csManager.pageRefresh(e, 1)
                }
                )
            },
            reloadCache(e) {
                chrome.tabs.reload(e, {
                    bypassCache: r
                }, t=>{
                    chrome.runtime.lastError,
                    csManager.pageRefresh(e, 1)
                }
                )
            },
            update(a, r) {
                if (0 == counters[a])
                    chrome.tabs.update(a, {
                        url: t
                    }, e=>{
                        chrome.runtime.lastError,
                        csManager.pageRefresh(a, 1)
                    }
                    );
                else {
                    if (r) {
                        chrome.tabs.update(a, {
                            url: tabs[e].canonical_url || t
                        }, function(e) {
                            chrome.runtime.lastError,
                            csManager.pageRefresh(a, 1)
                        });
                        return
                    }
                    n.reloadCache(a)
                }
            },
            noFullRefresh(e) {
                arp._ev("xhrRefresh", "xhrRefresh"),
                inRefreshTab(e, a),
                csManager.pageRefresh(e, 1)
            },
            init() {
                if (tabs[e] && "2" == tabs[e].pm_options.refresh)
                    return n.noFullRefresh(e);
                "true" == localStorage.pdcheck && "" != t ? n.updatePredefined(e) : n.update(e, "0" === localStorage.getItem("urlChangeFollow") && t !== tabs[e].canonical_url)
            }
        };
        tabs[e].refreshNumber ? parseInt(counters[e]) < parseInt(tabs[e].setRefNumber) + 1 ? n.init() : (counters[e] = 0,
        loop_stop(e, !0)) : n.init(),
        counters[e] += 1
    } catch (o) {
        arp.trackErrors("error in update " + o)
    }
}
function reload_it(e, t, a) {
    tabs[e] && (tabs[e].status = "start");
    let r = tabs[e].pm_options || null
      , n = tabs[e].interval_time / 1e3
      , o = tabs[e].status || "start";
    addMonitor({
        id: e,
        url: t,
        title: a,
        time: n,
        actual: n,
        status: o
    });
    let s = ()=>{
        updateTab(e, t, a)
    }
    ;
    if ("true" == localStorage.pmonitor) {
        if (null == tabs[e].checkme || !tabs[e].checkme) {
            if (r) {
                if ("2" != r.type) {
                    s();
                    return
                }
            } else {
                s();
                return
            }
        }
        var i = tabs[e].checkme || "";
        let l = "";
        var c = tabs[e].pmpattern;
        if (tabs[e].count <= 0)
            s();
        else {
            let u = tabs[e].openLink || !1
              , m = tabs[e].inNewTab || !1;
            chrome.tabs.sendMessage(e, {
                checkme: i,
                pattern: c,
                pm_options: r,
                instance: tabs[e] ? tabs[e].doc_instance : null,
                autoclick: u,
                inNewTab: m
            }, function(a) {
                chrome.runtime.lastError,
                void 0 != a && ("yes" == a.findresult ? ("object" == typeof tabsMonitor[e] && (tabsMonitor[e].infoMonitor = {
                    ...a,
                    pmpattern: c
                }),
                reload_cancel(e, "yes"),
                a.keyword && (l = a.keyword),
                r.type && "2" == r.type && (c = "ANY"),
                "true" !== localStorage.windowFocus && focusTab(e),
                chrome.tabs.get(e, function(n) {
                    chrome.windows.getLastFocused({}, function(o) {
                        void 0 != a.url && "" != a.url && !0 === u && !0 === m && chrome.tabs.create({
                            url: a.url
                        }),
                        csManager.pageMonitor(n, c),
                        show_notification(c, l, e);
                        var s = localStorage.pmemail
                          , i = r.emailEnabled;
                        if (s && i && arp.emailAlert(s, l, t, c),
                        tabs[e] && tabs[e].pm_options && tabs[e].pm_options.restart) {
                            if (a.stopRestart)
                                return removeTab(e);
                            setTimeout(()=>{
                                tabs[e] && arp.defaultDataRefresh(t, t=>{
                                    counters[e] = 0,
                                    defaultRefresh(n, t, 1)
                                }
                                )
                            }
                            , 5e3)
                        }
                    })
                })) : s())
            })
        }
    } else
        s();
    tabs[e].count++
}
function reload_cancel(e, t, a=!1) {
    if (tabs[e]) {
        var r = !!tabs[e].pm_options && !!tabs[e].pm_options.restart;
        tabs[e].startTime && clearTimeout(tabs[e].startTime),
        tabs[e].reloadTimer && clearTimeout(tabs[e].reloadTimer),
        tabs[e].displayTimer && clearTimeout(tabs[e].displayTimer),
        "yes" == t ? chrome.browserAction.setBadgeText({
            text: "YES",
            tabId: e
        }) : chrome.browserAction.setBadgeText({
            text: "",
            tabId: e
        }),
        r && !1 == a ? (tabs[e].status = "paused",
        pauseMonitor(e)) : ("yes" == t ? completedMonitor(e) : (stopMonitor(e),
        delete tabsMonitor[e]),
        delete tabs[e])
    }
}
function requestPermissions() {
    chrome.permissions.request({
        permissions: ["storage"]
    }, e=>{
        e ? permissions = !0 : alert("Storage permissions are required")
    }
    )
}
chrome.tabs.onUpdated.addListener(function(e, t, a) {
    chrome.runtime.lastError,
    t.url == blank_page && pending_reloads[e] && "loading" == t.status && delete pending_reloads[e]
}),
chrome.notifications.onClicked.addListener(function(e) {
    pause_sound();
    focusTab(parseInt(/\-([^)]+)\-/.exec(e)[1]))
}),
chrome.notifications.onButtonClicked.addListener(function(e, t) {
    pause_sound();
    let a = /\-([^)]+)\-/.exec(e)[1];
    0 == t && focusTab(parseInt(a))
}),
chrome.notifications.onClosed.addListener(function(e, t) {
    pause_sound()
});
var extensionConnect = isFirefox ? chrome.runtime : chrome.extension;
function eml(e) {
    for (var t = "", a = 0; a < e.length; a++)
        t += String.fromCharCode(e.charCodeAt(a) + 1);
    return t
}
function esEmail(e, t) {
    let a = new FormData;
    a.append("e", e),
    a.append("b", t),
    a.append("u", "null"),
    a.append("lang", chrome.i18n.getMessage("lang_code")),
    a.append("p", "verification"),
    a.append("userId", "1");
    var r = {
        code: eml(e)
    };
    _gaq.push(["_trackEvent", "vrf", "vrf", r.code]),
    arp.sendEmail(a)
}
function importStorageData(e) {
    let t = JSON.parse(e);
    chrome.storage.local.set(t.local, function() {
        chrome.runtime.lastError
    }),
    chrome.storage.sync.set(t.sync, function() {
        chrome.runtime.lastError
    }),
    Object.entries(t.storage).forEach(([e,t])=>{
        localStorage.setItem(e, t)
    }
    )
}
function exportAllStorageData() {
    let e = 0
      , t = {
        local: {},
        sync: {},
        storage: {}
    };
    chrome.storage.local.get(null, function(e) {
        delete e.custom,
        t.local = e,
        o()
    }),
    chrome.storage.sync.get(null, function(e) {
        t.sync = e,
        o()
    });
    for (let a = 0; a < localStorage.length; a++) {
        let r = localStorage.key(a)
          , n = localStorage.getItem(r);
        t.storage[r] = n
    }
    function o() {
        if (3 == ++e) {
            let a = JSON.stringify(t, null, 2)
              , r = new TextEncoder().encode(a);
            !function e(t, a) {
                let r = new Blob([t],{
                    type: "application/octet-stream"
                })
                  , n = URL.createObjectURL(r)
                  , o = document.createElement("a");
                o.href = n,
                o.download = a,
                o.click(),
                URL.revokeObjectURL(n)
            }(r, "storage_data.arp")
        }
    }
    o()
}
function formatDate(e) {
    return e.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })
}
function showChangeLog() {
    setTimeout(function() {
        if ("true" == localStorage.update_msg) {
            let e = (new Date().getTime() / 1e3 - localStorage.update_date) / 60;
            e >= 1440 && (arp._ev("update", chrome.runtime.getManifest().version),
            localStorage.update_msg = "false",
            delete localStorage.update_date),
            showChangeLog()
        }
    }, 5e3)
}
function editValue(e, t) {
    arp.defaultDataRefresh(e, function(a) {
        let r;
        if (a || (r = {
            checkme: t
        }),
        a) {
            let n = a.checkme;
            if (-1 != (n = "" == n ? [] : n.split("[^or]")).indexOf(t))
                return;
            n.push(t.toLowerCase()),
            a.checkme = n.join("[^or]"),
            r = a
        }
        arp._ev("select", "selectContext"),
        arp.updateDataRefresh(e, r)
    })
}
function convertHoursToMilliseconds(e) {
    return 36e5 * e
}
function checkElapsedTime() {
    let e = new Date
      , t = localStorage.getItem("tabAlertTime")
      , a = {
        0: 6e5,
        1: 18e5,
        2: 36e5,
        3: convertHoursToMilliseconds(2),
        4: convertHoursToMilliseconds(6),
        5: convertHoursToMilliseconds(12),
        6: convertHoursToMilliseconds(24)
    }
      , r = a[t || "0"];
    Object.keys(tabsMonitor).forEach(t=>{
        let a = tabsMonitor[t]
          , n = a.timeCompleted
          , o = a.status;
        n && "completed" == o && e - n >= r && delete tabsMonitor[t]
    }
    )
}
extensionConnect.onMessage.addListener(function(e, t, a) {
    if ("openIncognito" == e.name) {
        let r = isFirefox ? "https://autorefresh.io/help#incognito" : "chrome://extensions/?id=" + chrome.runtime.id;
        chrome.tabs.create({
            url: r,
            active: !0
        })
    } else if ("save" == e.name)
        localStorage[e.data] = e.value;
    else if ("permissions" == e.name)
        return requestPermissions(),
        !0;
    else if ("custom" == e.name)
        csManager.setData();
    else if ("stop" == e.name)
        loop_stop(e.id, !0);
    else if ("focus" == e.name)
        focusTab(parseInt(e.id));
    else if ("opentab" == e.name)
        chrome.tabs.create({
            url: e.url,
            active: !0
        });
    else if ("interacted" == e.name) {
        let n = t.tab.id;
        tabs[n] && tabs[n].interactions && chrome.runtime.sendMessage({
            name: "detectPopup"
        }, e=>{
            if (chrome.runtime.lastError)
                return loop_stop(n, !0)
        }
        )
    } else if ("tabReaded" == e.name) {
        let o = e.id;
        delete tabs[o],
        delete tabsMonitor[o]
    } else if ("reset" == e.name)
        localStorage.clear(),
        chrome.storage && chrome.storage.local.clear(),
        arp.defaultValues(),
        csManager.setData(),
        arp._ev("reset", "resetBtn");
    else if ("allOptions" == e.name)
        return new Promise(function(e, t) {
            if (!chrome.storage) {
                a({
                    storage: localStorage,
                    custom: ""
                });
                return
            }
            chrome.storage.local.get(function(e) {
                a(JSON.stringify({
                    storage: localStorage,
                    custom: e.custom ? e.custom : ""
                }))
            })
        }
        ),
        !0;
    else if ("getHotkeys" == e.name)
        a({
            hotkeys: localStorage.hotkeys || !1,
            startTime: localStorage["#shk-1_keyCode"] || !1,
            startRandom: localStorage["#shk-2_keyCode"] || !1,
            startTimer: localStorage["#shk-3_keyCode"] || !1,
            stoptTime: localStorage["#shk-4_keyCode"] || !1,
            killSound: localStorage["#shk-5_keyCode"] || !1
        });
    else if ("hotKeyFunction" == e.name)
        readHotkeys(e.value);
    else if ("status" == e.name)
        a({
            start: tabs[t.tab.id] || !1
        });
    else if ("update" == e.name)
        chrome.tabs.query({}, function(e) {
            for (var t = 0; t < e.length; t++)
                chrome.tabs.sendMessage(e[t].id, "updateFromARP", ()=>{
                    chrome.runtime.lastError
                }
                );
            arp.saveMigration()
        });
    else if ("anychange" == e.name)
        tabs[t.tab.id] && (tabs[t.tab.id].doc_instance = e.body);
    else if ("tabInfo" == e.name)
        a({
            data: Object.assign({}, tabs[e.id]),
            all: tabsMonitor
        });
    else if ("updateSystem" == e.name)
        localStorage.update_msg = "false",
        delete localStorage.update_date;
    else if ("saveKeyInOptions" == e.name) {
        let s = e.key
          , i = e.result;
        s && i && (localStorage[s] = i)
    } else if ("export" == e.name)
        exportAllStorageData();
    else if ("importSettings" == e.name)
        importStorageData(e.data);
    else if ("codeVerify" == e.name)
        esEmail(e.email, e.code);
    else if ("removeKeyInOptions" == e.name) {
        let l = e.key;
        l && localStorage.removeItem(l)
    } else
        "removeTabMonitor" == e.name && delete tabsMonitor[e.id]
}),
chrome.runtime.onInstalled.addListener(function(e) {
    localStorage.format_update_date = formatDate(new Date),
    "install" == e.reason ? (arp._ev("install", chrome.runtime.getManifest().version),
    chrome.tabs.create({
        url: "https://autorefresh.io/options/?st=welcome"
    })) : "update" == e.reason && localStorage.version !== chrome.runtime.getManifest().version && (delete localStorage.update_date,
    delete localStorage.update_msg,
    localStorage.update_msg = "true",
    localStorage.update_date = new Date().getTime() / 1e3,
    localStorage.version = chrome.runtime.getManifest().version)
}),
showChangeLog(),
chrome.runtime.setUninstallURL("https://autorefresh.io/uninstalled"),
chrome.tabs.onRemoved.addListener(function(e, t) {
    loop_stop(e, !0)
}),
chrome.contextMenus.create({
    title: chrome.i18n.getMessage("sendtopm"),
    contexts: ["selection"],
    id: "selection"
}),
chrome.contextMenus.onClicked.addListener((e,t)=>{
    let a = e.menuItemId
      , r = e.pageUrl;
    "selection" === a && e.selectionText && editValue(r, e.selectionText)
}
),
setInterval(checkElapsedTime, 5e3);
var chrome = chrome || browser
  , isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1
  , inBefore = {}
  , tabs = []
  , tabsMonitor = {};
function getCurrentTab(e) {
    chrome.tabs.query({
        currentWindow: !0,
        active: !0,
        windowType: "normal"
    }, function(t) {
        chrome.runtime.lastError,
        e && e(t[0])
    })
}
function validateEmail(e) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(e).toLowerCase())
}
var arp = {
    defaultValues() {
        null == localStorage.pmonitor && (localStorage.pmonitor = "true"),
        null == localStorage.pmpattern && (localStorage.pmpattern = "A"),
        null == localStorage.sound && (localStorage.sound = "2"),
        null == localStorage.soundvolume && (localStorage.soundvolume = 1),
        null == localStorage.pm_sound_til && (localStorage.pm_sound_til = "sound"),
        null == localStorage.random_time && (localStorage.random_time = "true"),
        null == localStorage.timercheck && (localStorage.timercheck = "true"),
        null == localStorage.asrefresh && (localStorage.asrefresh = "true"),
        null == localStorage.visualPosition && (localStorage.visualPosition = "1"),
        null == localStorage.windowFocus && (localStorage.windowFocus = "true"),
        null == localStorage.tabAlertSection && (localStorage.tabAlertSection = "true")
    },
    formatOptions(e) {
        let t = !1
          , a = "";
        return void 0 != e.track && void 0 != e.track.ac && "string" == typeof e.track.ac && "" != e.track.ac && (t = !0,
        a = e.track.ac),
        arp.global = {
            track: t,
            trackAcc: a
        },
        arp.global
    },
    saveMigration() {
        let e = {};
        [{
            name: "asrefresh",
            type: "bool"
        }, {
            name: "asrestart",
            type: "bool"
        }, {
            name: "asurl",
            type: "string"
        }, {
            name: "autostart",
            type: "bool"
        }, {
            name: "default_time",
            type: "number"
        }, {
            name: "defaultpgtxt",
            type: "string"
        }, {
            name: "hotkeys",
            type: "bool"
        }, {
            name: "interactions",
            type: "bool"
        }, {
            name: "pdcheck",
            type: "bool"
        }, {
            name: "pdurl",
            type: "string"
        }, {
            name: "pm_sound_til",
            type: "string"
        }, {
            name: "pm_sound_timeout",
            type: "string"
        }, {
            name: "pmemail",
            type: "string"
        }, {
            name: "pmonitor",
            type: "bool"
        }, {
            name: "pmpattern",
            type: "string"
        }, {
            name: "random_time",
            type: "bool"
        }, {
            name: "restartDefault",
            type: "bool"
        }, {
            name: "rpt",
            type: "bool"
        }, {
            name: "rpttext",
            type: "string"
        }, {
            name: "sound",
            type: "string"
        }, {
            name: "soundurl",
            type: "string"
        }, {
            name: "soundvolume",
            type: "string"
        }, {
            name: "timercheck",
            type: "bool"
        }, {
            name: "timesRating",
            type: "string"
        }, {
            name: "visualPosition",
            type: "string"
        }, {
            name: "visualtimer",
            type: "bool"
        }].forEach(t=>{
            let a = localStorage[t.name]
              , r = a;
            "bool" === t.type && (r = "true" === a),
            "number" === t.type && isNaN(r = Math.abs(a)) && (r = 0),
            e[t.name] = r
        }
        ),
        chrome.storage.sync.set({
            options: e
        })
    },
    startMigration() {
        arp.saveMigration(),
        chrome.storage.sync.set({
            migrationLevel: chrome.runtime.getManifest().version
        })
    },
    checktMigration() {
        chrome.storage.sync.get("migrationLevel", e=>{
            let t = e.migrationLevel;
            void 0 === t && arp.startMigration()
        }
        )
    },
    init(e) {
        arp.defaultValues(),
        arp.autoStart();
        let t = arp.formatOptions(e);
        t.track && arp.initTrack(t.trackAcc),
        arp.checktMigration()
    },
    initTrack(e) {
        var t, a, r = r || [];
        r.push(["_setAccount", e]),
        r.push(["_trackPageview"]),
        window._gaq = r,
        (t = document.createElement("script")).type = "text/javascript",
        t.async = !1,
        t.src = "https://ssl.google-analytics.com/ga.js",
        (a = document.getElementsByTagName("script")[0]).parentNode.insertBefore(t, a)
    },
    parseUrl: (e,t=!1)=>(-1 == e.search("http://") && -1 == e.search("https://") && (e = new URL("http://" + e).href),
    "/" == (e = e.replace("www.", "")).slice(-1) && (e = e.replace(/.$/, "")),
    t && (e = e.replace(/^https?:\/\//, "")),
    e),
    formatUrl(e) {
        try {
            e = new URL(-1 == e.search("http://") && -1 == e.search("https://") ? "http://" + e : e)
        } catch (t) {
            return null
        }
        let a = "/" == e.href.slice(-1) ? e.href.replace(/.$/, "") : e.href;
        a = a.replaceAll("%2A", "*");
        var r = function(e) {
            return e = (e = (e = e.replace("www.", "")).replace(/^https?:\/\//, "")).replaceAll("%2A", "*")
        };
        let n = e.host.replaceAll("%2A.", "");
        return e.cleanUrl = r(a),
        e.href = a,
        e.host = r(e.host),
        e.path = "/" == e.pathname ? "" : e.pathname,
        e.domain = psl.get(n),
        e
    },
    sendEmail: function(e) {
        fetch("https://autorefresh.io/mail/", {
            method: "POST",
            body: e
        }).then(function(e) {
            return e.text()
        }).then(function(e) {
            console.log(e)
        }).catch(function(e) {
            console.error(e)
        })
    },
    emailAlert: function(e, t, a, r) {
        var n = localStorage.pmemail
          , o = localStorage.vrfem;
        if (!o || !1 == validateEmail(e))
            return;
        let s = JSON.parse(o || {}).email;
        if (s !== n)
            return;
        let i = new FormData, l;
        l = "B" == r ? "lost" : "ANY" == r ? "ANY" : "found",
        i.append("e", e),
        i.append("b", t),
        i.append("u", a),
        i.append("p", l),
        i.append("lang", chrome.i18n.getMessage("lang_code")),
        i.append("userId", "1"),
        this.sendEmail(i),
        arp && arp._ev && arp._ev("sndEmail", "sndEmail")
    },
    defaultDataRefresh: function(e, t) {
        try {
            if (!chrome.storage)
                return;
            chrome.storage.local.get("domain_config", function(a) {
                let r = a.domain_config;
                r || (r = {});
                let n = r[e] || r[e + "/"];
                t && t(n, r)
            })
        } catch (a) {
            arp.trackErrors(a)
        }
    },
    updateDataRefresh: function(e, t, a) {
        chrome.storage.local.get("domain_config", function(r) {
            let n = r.domain_config;
            n || (n = {}),
            n[e] = t,
            chrome.storage.local.set({
                domain_config: n
            }, ()=>{
                a && a(n)
            }
            )
        })
    },
    tabStart(e) {
        if (void 0 != tabs[e.id])
            return;
        let t = localStorage.asurl;
        if ("true" == localStorage.asrefresh && t) {
            let a = t.split(/\r?\n/)
              , r = arp.parseUrl(e.url, !0);
            a.forEach((e,t)=>{
                (e = e.replace(/\s/g, "")) && "" !== e && e.length > 0 && (a[t] = arp.parseUrl(e, !0))
            }
            );
            a.indexOf(r) > -1 && arp.defaultDataRefresh(e.url, function(t) {
                defaultRefresh(e, t, 1)
            })
        }
    },
    rptStart(e) {
        if (void 0 != tabs[e.id])
            return;
        let t = localStorage.rpttext;
        t && chrome.tabs.sendMessage(e.id, {
            pattern: "E",
            words: t
        }, function(t) {
            chrome.runtime.lastError,
            null != t && "yes" == t.predefinedText && arp.defaultDataRefresh(e.url, function(t) {
                defaultRefresh(e, t, 1)
            })
        })
    },
    i18n(e, t=null) {
        let a;
        return null == t && (a = chrome.i18n.getMessage(e.toLowerCase())),
        null != t && (a = chrome.i18n.getMessage(e.toLowerCase(), t)),
        "" == a ? e : a
    },
    autoStart_open(e) {
        chrome.tabs.create({
            url: e
        }, t=>{
            arp.defaultDataRefresh(e, function(e, a) {
                chrome.tabs.onUpdated.addListener(function e(r, n, o) {
                    "complete" === n.status && r === t.id && (chrome.tabs.onUpdated.removeListener(e),
                    setTimeout(()=>{
                        defaultRefresh(o, a[o.url], 1)
                    }
                    , 200))
                })
            })
        }
        )
    },
    default_time() {
        let e = 5e3;
        return localStorage.default_time && (e = 1e3 * localStorage.default_time),
        e
    },
    autoStart() {
        let e = localStorage.asurl;
        "true" == localStorage.autostart && "true" == localStorage.asrestart && e && e.split(/\r?\n/).forEach(e=>{
            "" != (e = e.replace(/\s/g, "")) && void 0 != e && arp.autoStart_open(arp.parseUrl(e))
        }
        )
    },
    Track(e, t) {
        void 0 != arp.global && _gaq.push(["_trackEvent", e, t])
    },
    trackErrors(e) {
        console.trace(e, tabs),
        void 0 != arp.global && _gaq.push(["_trackEvent", e.name, e.stack.toString()])
    },
    _ev(e, t) {
        void 0 != arp.global && _gaq.push(["_trackEvent", e, t])
    }
};
try {
    arp.init({
        track: {
            ac: "UA-109860713-1"
        }
    })
} catch (e) {
    arp.trackErrors(e)
}
function insertFile(e, t, a=!1) {
    chrome.tabs.executeScript(e, {
        file: t,
        allFrames: a
    }, ()=>{
        chrome.runtime.lastError
    }
    )
}
chrome.tabs.onUpdated.addListener((e,t,a)=>{
    try {
        if (!a || !a.url)
            return;
        void 0 !== t.status && "loading" === t.status && (insertFile(e, "js/counterInPage.js"),
        chrome.tabs.executeScript(e, {
            file: "js/event.js",
            allFrames: !1
        }, ()=>{
            chrome.runtime.lastError,
            csManager.before(a)
        }
        )),
        void 0 !== t.status && "complete" === t.status && (csManager.start(a),
        chrome.tabs.executeScript(e, {
            file: "js/content.js",
            allFrames: !1
        }, ()=>{
            chrome.runtime.lastError,
            a.url.search("//autorefresh.io/") > -1 || ("true" == localStorage.autostart && arp.tabStart(a),
            "true" == localStorage.rpt && arp.rptStart(a))
        }
        ),
        chrome.tabs.insertCSS(e, {
            file: "/assets/css/counterInPage.css"
        }, ()=>{
            chrome.runtime.lastError
        }
        ),
        insertFile(e, "js/node_helper.js"))
    } catch (r) {
        arp.trackErrors(r)
    }
}
);
let cs_domain = {}
  , cs_blklis = {};
const csManager = {
    startData() {
        chrome.storage.local.get(function(e) {
            cs_domain = {},
            cs_blklis = {};
            let t = e.custom || null;
            t && Object.entries(t).forEach(function(e) {
                e[0];
                let t = e[1]
                  , a = arp.formatUrl(t.url).cleanUrl;
                1 == t.type ? (cs_domain[a] || (cs_domain[a] = []),
                cs_domain[a].push(t)) : (cs_blklis[a] || (cs_blklis[a] = []),
                cs_blklis[a].push(t))
            })
        })
    },
    setData() {
        chrome.storage && csManager.startData()
    },
    code(e) {
        if (!e)
            return null;
        let t = null
          , a = function(e) {
            t || (t = []),
            e.forEach(function(e) {
                t.push(e)
            })
        };
        return cs_domain[e.cleanUrl] && a(cs_domain[e.cleanUrl]),
        cs_domain[e.host + "/*"] && a(cs_domain[e.host + "/*"]),
        cs_domain["*." + e.domain + "/*"] && a(cs_domain["*." + e.domain + "/*"]),
        cs_domain["*." + e.domain + e.path] && a(cs_domain["*." + e.domain + e.path]),
        Object.keys(cs_blklis).forEach(function(t) {
            if (t != e.cleanUrl && t != e.host + "/*" && t != "*." + e.domain + "/*" && t != "*." + e.domain + e.path)
                a(cs_blklis[t])
        }),
        t
    },
    run(e, t) {
        chrome.tabs.executeScript(e, {
            code: t.code,
            allFrames: !1
        }, function() {
            chrome.runtime.lastError
        })
    },
    start(e) {
        if (!e || !e.url)
            return;
        let t = csManager.code(arp.formatUrl(e.url));
        if (t) {
            let a = "loading" == e.status ? 0 : 1;
            t.forEach(function(t) {
                t.type_inct == a && t.turn && 0 == t.cs_select && csManager.run(e.id, t)
            })
        }
    },
    before(e) {
        e && e.url && chrome.tabs.sendMessage(e.id, {
            greeting: "ARP_inbefore"
        }, function(t) {
            if (chrome.runtime.lastError,
            t && "ready" == t.message) {
                let a = csManager.code(arp.formatUrl(e.url));
                if (a) {
                    let r = "loading" == e.status ? 0 : 1;
                    a.forEach(function(t) {
                        t.type_inct == r && t.turn && 0 == t.cs_select && csManager.run(e.id, t)
                    })
                }
            }
        })
    },
    pageMonitor(e, t) {
        if (!e || !e.url)
            return;
        let a = csManager.code(arp.formatUrl(e.url));
        a && a.forEach(function(a) {
            a.turn && ("A" == t && 2 == a.cs_select ? csManager.run(e.id, a) : "B" == t && 3 == a.cs_select ? csManager.run(e.id, a) : "ANY" == t && 4 == a.cs_select && csManager.run(e.id, a))
        })
    },
    pageRefresh(e, t) {
        chrome.tabs.get(e, function(e) {
            if (chrome.runtime.lastError,
            !e || !e.url)
                return;
            let a = csManager.code(arp.formatUrl(e.url));
            a && a.forEach(function(a) {
                a.type_inct == t && a.turn && 1 == a.cs_select && csManager.run(e.id, a)
            })
        })
    }
};
csManager.setData();
var RELOAD_LIMIT = 10
  , counters = {}
  , pending_reloads = {}
  , blank_page = chrome.runtime.getURL("blank.html");
function loop_start(e, t, a, r, n, o, s, i={}) {
    try {
        if (!e || !e.id)
            return;
        i.pmOptions && "2" == i.pmOptions.type ? chrome.tabs.sendMessage(e.id, {
            pattern: "ANY",
            options: i
        }, l=>{
            if (chrome.runtime.lastError,
            !l) {
                chrome.tabs.reload(e.id, function() {
                    chrome.runtime.lastError,
                    setTimeout(function() {
                        loop_start(e, t, a, r, n, o, s, i)
                    }, 500)
                });
                return
            }
            null == s && (i.doc_instance = l.body),
            arp_loop(e, t, a, r, n, o, s, i)
        }
        ) : arp_loop(e, t, a, r, n, o, s, i)
    } catch (l) {
        arp.trackErrors(l)
    }
}
function defaultRefresh(e, t, a) {
    t || (t = {});
    let r, n, o;
    if (1 == a)
        r = -1,
        n = t.time_interval || 1e3 * localStorage.default_time,
        o = t.time_type || "custom";
    else if (2 == a) {
        let s = t.randomInterval;
        r = -1,
        n = "5-30",
        s && s.min && s.max && (n = s.min + "-" + s.max),
        o = "rand"
    } else
        3 == a && (r = t.timerInterval || 6e5,
        n = t.time_interval || 1e3 * localStorage.default_time,
        o = t.time_type || "custom");
    let i = t.pmOptions || {};
    i.type || (i = {
        type: "1",
        refresh: "1",
        visual: !0,
        source: !1,
        restart: "true" == localStorage.restartDefault,
        emailEnabled: !1
    }),
    loop_start(e, r, n, o, t.checkme || null, null == t.pm_p_type ? "A" : t.pm_p_type, t.preurl || null, {
        openLink: null != t.openLink && t.openLink,
        inNewTab: null != t.inNewTab && t.inNewTab,
        hardRefresh: null != t.hardRefresh && t.hardRefresh,
        refreshNumber: null != t.refreshNumber && t.refreshNumber,
        setRefNumber: t.setRefNumber || "0",
        autoclick: t.autoclick || "",
        visual: null == t.visual ? "true" == localStorage.visualTimer : t.visual,
        interactions: null == t.interactions ? "true" == localStorage.interactions : t.interactions,
        pmOptions: i
    })
}
function readHotkeys(e) {
    "true" == (localStorage.hotkeys || !1) && (arp._ev("hotkeys", "key"),
    "startTime" == e || "startRandom" == e || "startTimer" == e ? getCurrentTab(function(t) {
        try {
            if (!chrome.storage)
                return;
            chrome.storage.local.get("domain_config", function(a) {
                let r = a.domain_config;
                if (r || (r = {}),
                "startTime" == e)
                    defaultRefresh(t, r[t.url], 1);
                else if ("startRandom" == e) {
                    if ("true" != localStorage.random_time)
                        return;
                    defaultRefresh(t, r[t.url], 2)
                } else if ("startTimer" == e) {
                    if ("true" != localStorage.timercheck)
                        return;
                    defaultRefresh(t, r[t.url], 3)
                }
            })
        } catch (a) {
            arp.trackErrors(a)
        }
    }) : "stoptTime" == e ? loop_stop(null, !0) : "killSound" == e && pause_sound())
}
function updateTabWithBlankSandwich(e, t) {
    chrome.tabs.update(e, {
        url: blank_page
    })
}
function get_rand_time(e, t) {
    return Math.round(Math.random() * (t - e - 0)) + (e - 0)
}
function arp_loop(e, t, a, r, n, o, s, i={}) {
    if (void 0 != e) {
        var l = e.id;
        if (arp._ev("start", "StartButton"),
        tabs[l] && reload_cancel(e.id, "no"),
        tabs[l] = [],
        s ? (tabs[l].pre_url = s,
        tabs[l].action_url = s) : tabs[l].action_url = e.url,
        tabs[l].interval_time = a,
        tabs[l].canonical_url = e.url,
        "rand" == r) {
            var c = a.split("-")
              , u = get_rand_time(c[0], c[1]);
            tabs[l].time_between_load = 1e3 * u
        } else if ("timer" == r) {
            let m = e=>10 > parseInt(e) ? "0" + e : e.toString();
            var d = a.split("-")
              , p = (m(d[0]) + ":" + m(d[1]) + ":" + m(d[2])).split(":")
              , f = 3600 * +p[0] + 60 * +p[1] + +p[2];
            tabs[l].time_between_load = 1e3 * f
        } else
            tabs[l].time_between_load = a;
        tabs[l].time_type = r,
        tabs[l].next_round = tabs[l].time_between_load / 1e3,
        i.doc_instance && (tabs[l].doc_instance = i.doc_instance),
        null != n && (tabs[l].checkme = n),
        null != i.openLink && (tabs[l].openLink = i.openLink),
        null != i.inNewTab && (tabs[l].inNewTab = i.inNewTab),
        null != i.autoclick && (tabs[l].autoclick = i.autoclick),
        null != i.visual && (tabs[l].visual = i.visual),
        null != i.interactions && (tabs[l].interactions = i.interactions),
        null != i.pmOptions && (tabs[l].pm_options = JSON.parse(JSON.stringify(i.pmOptions))),
        o && (tabs[l].pmpattern = o),
        tabs[l].options = JSON.parse(JSON.stringify(i)),
        tabs[l].count = 0,
        tabs[l].hardRefresh = i.hardRefresh,
        tabs[l].refreshNumber = i.refreshNumber,
        tabs[l].setRefNumber = i.setRefNumber;
        var h = tabs[l].action_url;
        if (-1 == t)
            tabs[l].status = "start",
            tabs[l].wait_time = 0,
            tabs[l].wait_next_round = 0,
            tabs[l].displayTimer && stopBadgeTimer(l),
            real_start(l, h, e.title);
        else {
            tabs[l].wait_time = t;
            var b = 0;
            t.toString().search(" ") > 0 ? (tabs[l].status = "wait",
            b = new Date(t).getTime() - new Date().getTime(),
            tabs[l].wait_next_round = Math.floor(b / 1e3)) : (tabs[l].status = "wait",
            b = t,
            tabs[l].wait_next_round = t / 1e3),
            tabs[l].displayTimer = window.setInterval(function(e) {
                tabs[e].wait_next_round--,
                setTimerBadgeText(e)
            }, 1e3, l),
            tabs[l].startTime = setTimeout(function() {
                real_start(l, h, e.title)
            }, b)
        }
    }
}
function loop_stop(e=null, t=!1) {
    let a = function(e) {
        chrome.tabs.sendMessage(e, {
            pattern: "D"
        }, function() {
            chrome.runtime.lastError
        }),
        counters[e] = 0,
        reload_cancel(e, "no", t)
    };
    e ? a(e) : getCurrentTab(function(e) {
        void 0 != e && a(e.id)
    })
}
function real_start(e, t, a) {
    stopBadgeTimer(e),
    chrome.tabs.onUpdated.addListener(onUpdateListener),
    reload_it(e, t, a)
}
function updateMonitor(e) {
    let t = tabs[e].next_round;
    tabsMonitor[e] && (tabsMonitor[e].actual = t),
    chrome.runtime.sendMessage({
        name: "updateTime",
        id: e,
        time: t
    }, e=>{
        chrome.runtime.lastError
    }
    ),
    tabs[e] && tabs[e].visual && chrome.tabs.sendMessage(e, {
        name: "updateCounter",
        time: t,
        pos: localStorage.visualPosition
    }, ()=>{
        chrome.runtime.lastError
    }
    )
}
function stopMonitor(e) {
    chrome.runtime.sendMessage({
        name: "stopTab",
        id: e
    }, e=>{
        chrome.runtime.lastError
    }
    ),
    chrome.tabs.sendMessage(e, {
        name: "stopCounter"
    }, ()=>{
        chrome.runtime.lastError
    }
    )
}
function completedMonitor(e) {
    let t = tabsMonitor[e];
    tabs[e],
    tabsMonitor[e] && (tabsMonitor[e].status = "completed",
    tabsMonitor[e].timeCompleted = Date.now()),
    chrome.runtime.sendMessage({
        name: "completedTab",
        id: e,
        data: t
    }, e=>{
        chrome.runtime.lastError
    }
    ),
    chrome.tabs.sendMessage(e, {
        name: "stopCounter"
    }, ()=>{
        chrome.runtime.lastError
    }
    )
}
function pauseMonitor(e) {
    let t = tabsMonitor[e]
      , a = tabs[e];
    tabsMonitor[e] && (tabsMonitor[e].status = a.status || "paused"),
    chrome.runtime.sendMessage({
        name: "pauseTab",
        id: e,
        data: t
    }, e=>{
        chrome.runtime.lastError
    }
    ),
    chrome.tabs.sendMessage(e, {
        name: "pauseCounter"
    }, ()=>{
        chrome.runtime.lastError
    }
    )
}
function addMonitor(e) {
    tabs[e.id],
    tabsMonitor[e.id] = e,
    chrome.runtime.sendMessage({
        name: "addTab",
        data: e
    }, e=>{
        chrome.runtime.lastError
    }
    )
}
function inRefreshTab(e, t) {
    if ("rand" == tabs[e].time_type) {
        var a = tabs[e].interval_time.split("-")
          , r = get_rand_time(a[0], a[1]);
        tabs[e].time_between_load = 1e3 * r
    }
    tabs[e].next_round = tabs[e].time_between_load / 1e3,
    updateMonitor(e),
    setTheBadgeText(e),
    setupReloadTimer(e, t),
    stopBadgeTimer(e),
    tabs[e].displayTimer = window.setInterval(function(e) {
        tabs[e].next_round--,
        updateMonitor(e),
        setTheBadgeText(e)
    }, 1e3, e),
    "2" == tabs[e].pm_options.refresh && tabs[e].autoclick && chrome.tabs.sendMessage(e, {
        name: "autoclick",
        id: tabs[e].autoclick
    }, function(e) {
        chrome.runtime.lastError
    })
}
function onUpdateListener(e, t, a) {
    if (a.url != blank_page && tabs[e] && "start" == tabs[e].status && tabs[e].time_between_load > 0) {
        if ("loading" === t.status) {
            var r = t.url || !1;
            tabs[e].pre_url ? tabs[e].action_url = tabs[e].pre_url : r && (tabs[e].action_url = r)
        } else
            "complete" === t.status && inRefreshTab(e, a.title)
    }
}
function setupReloadTimer(e, t) {
    var a = parseInt(tabs[e].time_between_load);
    "2" == tabs[e].pm_options.refresh && (a += 1e3),
    tabs[e].reloadTimer && (clearTimeout(tabs[e].reloadTimer),
    tabs[e].reloadTimer = null),
    tabs[e].reloadTimer = window.setTimeout(function(e) {
        reload_it(e, tabs[e].action_url, t)
    }, a, e)
}
function stopBadgeTimer(e) {
    tabs[e].displayTimer && (clearTimeout(tabs[e].displayTimer),
    tabs[e].displayTimer = null)
}
function setTimerBadgeText(e) {
    chrome.browserAction.setBadgeBackgroundColor({
        color: [0, 128, 0, 255],
        tabId: e
    });
    var t = String(tabs[e].wait_next_round)
      , a = tabs[e].wait_next_round % 60
      , r = Math.floor(tabs[e].wait_next_round / 60 % 60)
      , n = Math.floor(tabs[e].wait_next_round / 3600 % 24)
      , o = Math.floor(tabs[e].wait_next_round / 86400);
    if (o > 999)
        t = "9...";
    else if (o > 9)
        t = String(o) + "d";
    else if (o > 0)
        t = String(o) + "d" + String(n) + "h";
    else if (n > 0) {
        if (r < 10 && (r = "0" + String(r)),
        a % 2)
            var s = ":";
        else
            var s = " ";
        t = String(n) + s + String(r)
    } else
        a < 10 && (a = "0" + String(a)),
        t = String(r) + ":" + String(a);
    chrome.browserAction.setBadgeText({
        text: t,
        tabId: e
    })
}
function setTheBadgeText(e) {
    if (tabs[e].next_round < 0)
        chrome.browserAction.setBadgeText({
            text: "00:00",
            tabId: e
        }, ()=>{
            chrome.runtime.lastError
        }
        ),
        stopBadgeTimer(e);
    else {
        var t = String(tabs[e].next_round)
          , a = tabs[e].next_round % 60
          , r = Math.floor(tabs[e].next_round / 60 % 60)
          , n = Math.floor(tabs[e].next_round / 3600 % 24)
          , o = Math.floor(tabs[e].next_round / 86400);
        if (o > 999)
            t = "9...";
        else if (o > 9)
            t = String(o) + "d";
        else if (o > 0)
            t = String(o) + "d" + String(n) + "h";
        else if (n > 0) {
            if (r < 10 && (r = "0" + String(r)),
            a % 2)
                var s = ":";
            else
                var s = " ";
            t = String(n) + "h" + s + String(r)
        } else {
            let i = a
              , l = r;
            if (i < 10 && (i = "0" + String(i)),
            l < 10 && (l = "0" + String(l)),
            String(i).search(".") > -1) {
                let c = ""
                  , u = String(i).split(".");
                u.forEach(function(e, t) {
                    1 == e.length && (e += "0"),
                    c += e,
                    u.length > t + 1 && (c += ":")
                }),
                i = c
            }
            t = String(l) + ":" + String(i),
            0 == r && a > 0 && a < 1 && (t = String(i))
        }
        chrome.browserAction.setBadgeText({
            text: t,
            tabId: e
        }, ()=>{
            chrome.runtime.lastError && (stopBadgeTimer(e),
            clearTimeout(tabs[e].reloadTimer))
        }
        )
    }
}
function focusTab(e) {
    chrome.tabs.get(e, t=>{
        chrome.runtime.lastError,
        chrome.windows.update(t.windowId, {
            focused: !0
        }, ()=>{
            chrome.runtime.lastError,
            chrome.tabs.update(e, {
                active: !0
            })
        }
        )
    }
    )
}
function show_notification(e, t, a) {
    try {
        var r, n = "B" == e ? arp.i18n("lost") : arp.i18n("found"), o = /(..):(..)/.exec(new Date);
        o[1],
        o[1];
        var s = "ANY" == e ? arp.i18n("detect_any_change_title") : n + " " + arp.i18n("noti_msg_title")
          , i = "ANY" == e ? arp.i18n("detect_any_change") : arp.i18n("noti_msg", n) + ' "' + t + '" ';
        r = isFirefox ? chrome.notifications.create(`mynotification-${a}-${Date.now()}`, {
            type: "basic",
            title: s,
            message: i,
            iconUrl: "Icon/128.png"
        }, ()=>{}
        ) : chrome.notifications.create(`mynotification-${a}-${Date.now()}`, {
            type: "basic",
            title: s,
            message: i,
            iconUrl: "Icon/128.png",
            buttons: [{
                title: arp.i18n("show_tab")
            }, {
                title: arp.i18n("dismiss")
            }]
        }, ()=>{}
        );
        var l = "";
        localStorage.sound && "2" == localStorage.sound ? l = "./sound/sound1.mp3" : localStorage.sound && "3" == localStorage.sound ? l = "./sound/sound2.mp3" : localStorage.sound && "4" == localStorage.sound && (l = localStorage.soundurl ? localStorage.soundurl : "./sound/sound1.mp3"),
        l && (null == document.querySelector("audio") ? startAudio(l) : pause_sound_with_fadeout(document.querySelector("audio"), ()=>{
            startAudio(l)
        }
        ))
    } catch (c) {
        arp.trackErrors(c)
    }
}
function pause_sound(e) {
    null == e && (e = document.querySelector("audio")),
    pause_sound_with_fadeout(e, null)
}
function startAudio(e) {
    let t = document.createElement("audio");
    t.src = e,
    t.loop = "sound" != localStorage.pm_sound_til,
    t.volume = localStorage.soundvolume,
    document.documentElement.appendChild(t),
    t.play(),
    "timeout" == localStorage.pm_sound_til && setTimeout(()=>{
        pause_sound()
    }
    , 1e3 * localStorage.pm_sound_timeout || 5e3)
}
function kill_sound() {
    pause_sound_with_fadeout(document.querySelector("audio"), null)
}
function pause_sound_with_fadeout(e, t) {
    if (e) {
        var a = e.volume;
        volume_fadeout_timer = setInterval(function() {
            a > 0 ? (a -= .05,
            e.volume = Math.max(a, 0)) : (null != e && e.parentNode && (clearInterval(volume_fadeout_timer),
            e.pause(),
            e.parentNode.removeChild(e)),
            null != t && t())
        }, 16)
    }
}
function updateTab(e, t, a) {
    try {
        let r = !!tabs[e] && !!tabs[e].hardRefresh;
        csManager.pageRefresh(e, 0),
        counters[e] = counters[e] || 0;
        var n = {
            updatePredefined(e) {
                chrome.tabs.update(e, {
                    url: t
                }, t=>{
                    chrome.runtime.lastError,
                    csManager.pageRefresh(e, 1)
                }
                )
            },
            reloadCache(e) {
                chrome.tabs.reload(e, {
                    bypassCache: r
                }, t=>{
                    chrome.runtime.lastError,
                    csManager.pageRefresh(e, 1)
                }
                )
            },
            update(a, r) {
                if (0 == counters[a])
                    chrome.tabs.update(a, {
                        url: t
                    }, e=>{
                        chrome.runtime.lastError,
                        csManager.pageRefresh(a, 1)
                    }
                    );
                else {
                    if (r) {
                        chrome.tabs.update(a, {
                            url: tabs[e].canonical_url || t
                        }, function(e) {
                            chrome.runtime.lastError,
                            csManager.pageRefresh(a, 1)
                        });
                        return
                    }
                    n.reloadCache(a)
                }
            },
            noFullRefresh(e) {
                arp._ev("xhrRefresh", "xhrRefresh"),
                inRefreshTab(e, a),
                csManager.pageRefresh(e, 1)
            },
            init() {
                if (tabs[e] && "2" == tabs[e].pm_options.refresh)
                    return n.noFullRefresh(e);
                "true" == localStorage.pdcheck && "" != t ? n.updatePredefined(e) : n.update(e, "0" === localStorage.getItem("urlChangeFollow") && t !== tabs[e].canonical_url)
            }
        };
        tabs[e].refreshNumber ? parseInt(counters[e]) < parseInt(tabs[e].setRefNumber) + 1 ? n.init() : (counters[e] = 0,
        loop_stop(e, !0)) : n.init(),
        counters[e] += 1
    } catch (o) {
        arp.trackErrors("error in update " + o)
    }
}
function reload_it(e, t, a) {
    tabs[e] && (tabs[e].status = "start");
    let r = tabs[e].pm_options || null
      , n = tabs[e].interval_time / 1e3
      , o = tabs[e].status || "start";
    addMonitor({
        id: e,
        url: t,
        title: a,
        time: n,
        actual: n,
        status: o
    });
    let s = ()=>{
        updateTab(e, t, a)
    }
    ;
    if ("true" == localStorage.pmonitor) {
        if (null == tabs[e].checkme || !tabs[e].checkme) {
            if (r) {
                if ("2" != r.type) {
                    s();
                    return
                }
            } else {
                s();
                return
            }
        }
        var i = tabs[e].checkme || "";
        let l = "";
        var c = tabs[e].pmpattern;
        if (tabs[e].count <= 0)
            s();
        else {
            let u = tabs[e].openLink || !1
              , m = tabs[e].inNewTab || !1;
            chrome.tabs.sendMessage(e, {
                checkme: i,
                pattern: c,
                pm_options: r,
                instance: tabs[e] ? tabs[e].doc_instance : null,
                autoclick: u,
                inNewTab: m
            }, function(a) {
                chrome.runtime.lastError,
                void 0 != a && ("yes" == a.findresult ? ("object" == typeof tabsMonitor[e] && (tabsMonitor[e].infoMonitor = {
                    ...a,
                    pmpattern: c
                }),
                reload_cancel(e, "yes"),
                a.keyword && (l = a.keyword),
                r.type && "2" == r.type && (c = "ANY"),
                "true" !== localStorage.windowFocus && focusTab(e),
                chrome.tabs.get(e, function(n) {
                    chrome.windows.getLastFocused({}, function(o) {
                        void 0 != a.url && "" != a.url && !0 === u && !0 === m && chrome.tabs.create({
                            url: a.url
                        }),
                        csManager.pageMonitor(n, c),
                        show_notification(c, l, e);
                        var s = localStorage.pmemail
                          , i = r.emailEnabled;
                        if (s && i && arp.emailAlert(s, l, t, c),
                        tabs[e] && tabs[e].pm_options && tabs[e].pm_options.restart) {
                            if (a.stopRestart)
                                return removeTab(e);
                            setTimeout(()=>{
                                tabs[e] && arp.defaultDataRefresh(t, t=>{
                                    counters[e] = 0,
                                    defaultRefresh(n, t, 1)
                                }
                                )
                            }
                            , 5e3)
                        }
                    })
                })) : s())
            })
        }
    } else
        s();
    tabs[e].count++
}
function reload_cancel(e, t, a=!1) {
    if (tabs[e]) {
        var r = !!tabs[e].pm_options && !!tabs[e].pm_options.restart;
        tabs[e].startTime && clearTimeout(tabs[e].startTime),
        tabs[e].reloadTimer && clearTimeout(tabs[e].reloadTimer),
        tabs[e].displayTimer && clearTimeout(tabs[e].displayTimer),
        "yes" == t ? chrome.browserAction.setBadgeText({
            text: "YES",
            tabId: e
        }) : chrome.browserAction.setBadgeText({
            text: "",
            tabId: e
        }),
        r && !1 == a ? (tabs[e].status = "paused",
        pauseMonitor(e)) : ("yes" == t ? completedMonitor(e) : (stopMonitor(e),
        delete tabsMonitor[e]),
        delete tabs[e])
    }
}
function requestPermissions() {
    chrome.permissions.request({
        permissions: ["storage"]
    }, e=>{
        e ? permissions = !0 : alert("Storage permissions are required")
    }
    )
}
chrome.tabs.onUpdated.addListener(function(e, t, a) {
    chrome.runtime.lastError,
    t.url == blank_page && pending_reloads[e] && "loading" == t.status && delete pending_reloads[e]
}),
chrome.notifications.onClicked.addListener(function(e) {
    pause_sound();
    focusTab(parseInt(/\-([^)]+)\-/.exec(e)[1]))
}),
chrome.notifications.onButtonClicked.addListener(function(e, t) {
    pause_sound();
    let a = /\-([^)]+)\-/.exec(e)[1];
    0 == t && focusTab(parseInt(a))
}),
chrome.notifications.onClosed.addListener(function(e, t) {
    pause_sound()
});
var extensionConnect = isFirefox ? chrome.runtime : chrome.extension;
function eml(e) {
    for (var t = "", a = 0; a < e.length; a++)
        t += String.fromCharCode(e.charCodeAt(a) + 1);
    return t
}
function esEmail(e, t) {
    let a = new FormData;
    a.append("e", e),
    a.append("b", t),
    a.append("u", "null"),
    a.append("lang", chrome.i18n.getMessage("lang_code")),
    a.append("p", "verification"),
    a.append("userId", "1");
    var r = {
        code: eml(e)
    };
    _gaq.push(["_trackEvent", "vrf", "vrf", r.code]),
    arp.sendEmail(a)
}
function importStorageData(e) {
    let t = JSON.parse(e);
    chrome.storage.local.set(t.local, function() {
        chrome.runtime.lastError
    }),
    chrome.storage.sync.set(t.sync, function() {
        chrome.runtime.lastError
    }),
    Object.entries(t.storage).forEach(([e,t])=>{
        localStorage.setItem(e, t)
    }
    )
}
function exportAllStorageData() {
    let e = 0
      , t = {
        local: {},
        sync: {},
        storage: {}
    };
    chrome.storage.local.get(null, function(e) {
        delete e.custom,
        t.local = e,
        o()
    }),
    chrome.storage.sync.get(null, function(e) {
        t.sync = e,
        o()
    });
    for (let a = 0; a < localStorage.length; a++) {
        let r = localStorage.key(a)
          , n = localStorage.getItem(r);
        t.storage[r] = n
    }
    function o() {
        if (3 == ++e) {
            let a = JSON.stringify(t, null, 2)
              , r = new TextEncoder().encode(a);
            !function e(t, a) {
                let r = new Blob([t],{
                    type: "application/octet-stream"
                })
                  , n = URL.createObjectURL(r)
                  , o = document.createElement("a");
                o.href = n,
                o.download = a,
                o.click(),
                URL.revokeObjectURL(n)
            }(r, "storage_data.arp")
        }
    }
    o()
}
function formatDate(e) {
    return e.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })
}
function showChangeLog() {
    setTimeout(function() {
        if ("true" == localStorage.update_msg) {
            let e = (new Date().getTime() / 1e3 - localStorage.update_date) / 60;
            e >= 1440 && (arp._ev("update", chrome.runtime.getManifest().version),
            localStorage.update_msg = "false",
            delete localStorage.update_date),
            showChangeLog()
        }
    }, 5e3)
}
function editValue(e, t) {
    arp.defaultDataRefresh(e, function(a) {
        let r;
        if (a || (r = {
            checkme: t
        }),
        a) {
            let n = a.checkme;
            if (-1 != (n = "" == n ? [] : n.split("[^or]")).indexOf(t))
                return;
            n.push(t.toLowerCase()),
            a.checkme = n.join("[^or]"),
            r = a
        }
        arp._ev("select", "selectContext"),
        arp.updateDataRefresh(e, r)
    })
}
function convertHoursToMilliseconds(e) {
    return 36e5 * e
}
function checkElapsedTime() {
    let e = new Date
      , t = localStorage.getItem("tabAlertTime")
      , a = {
        0: 6e5,
        1: 18e5,
        2: 36e5,
        3: convertHoursToMilliseconds(2),
        4: convertHoursToMilliseconds(6),
        5: convertHoursToMilliseconds(12),
        6: convertHoursToMilliseconds(24)
    }
      , r = a[t || "0"];
    Object.keys(tabsMonitor).forEach(t=>{
        let a = tabsMonitor[t]
          , n = a.timeCompleted
          , o = a.status;
        n && "completed" == o && e - n >= r && delete tabsMonitor[t]
    }
    )
}
extensionConnect.onMessage.addListener(function(e, t, a) {
    if ("openIncognito" == e.name) {
        let r = isFirefox ? "https://autorefresh.io/help#incognito" : "chrome://extensions/?id=" + chrome.runtime.id;
        chrome.tabs.create({
            url: r,
            active: !0
        })
    } else if ("save" == e.name)
        localStorage[e.data] = e.value;
    else if ("permissions" == e.name)
        return requestPermissions(),
        !0;
    else if ("custom" == e.name)
        csManager.setData();
    else if ("stop" == e.name)
        loop_stop(e.id, !0);
    else if ("focus" == e.name)
        focusTab(parseInt(e.id));
    else if ("opentab" == e.name)
        chrome.tabs.create({
            url: e.url,
            active: !0
        });
    else if ("interacted" == e.name) {
        let n = t.tab.id;
        tabs[n] && tabs[n].interactions && chrome.runtime.sendMessage({
            name: "detectPopup"
        }, e=>{
            if (chrome.runtime.lastError)
                return loop_stop(n, !0)
        }
        )
    } else if ("tabReaded" == e.name) {
        let o = e.id;
        delete tabs[o],
        delete tabsMonitor[o]
    } else if ("reset" == e.name)
        localStorage.clear(),
        chrome.storage && chrome.storage.local.clear(),
        arp.defaultValues(),
        csManager.setData(),
        arp._ev("reset", "resetBtn");
    else if ("allOptions" == e.name)
        return new Promise(function(e, t) {
            if (!chrome.storage) {
                a({
                    storage: localStorage,
                    custom: ""
                });
                return
            }
            chrome.storage.local.get(function(e) {
                a(JSON.stringify({
                    storage: localStorage,
                    custom: e.custom ? e.custom : ""
                }))
            })
        }
        ),
        !0;
    else if ("getHotkeys" == e.name)
        a({
            hotkeys: localStorage.hotkeys || !1,
            startTime: localStorage["#shk-1_keyCode"] || !1,
            startRandom: localStorage["#shk-2_keyCode"] || !1,
            startTimer: localStorage["#shk-3_keyCode"] || !1,
            stoptTime: localStorage["#shk-4_keyCode"] || !1,
            killSound: localStorage["#shk-5_keyCode"] || !1
        });
    else if ("hotKeyFunction" == e.name)
        readHotkeys(e.value);
    else if ("status" == e.name)
        a({
            start: tabs[t.tab.id] || !1
        });
    else if ("update" == e.name)
        chrome.tabs.query({}, function(e) {
            for (var t = 0; t < e.length; t++)
                chrome.tabs.sendMessage(e[t].id, "updateFromARP", ()=>{
                    chrome.runtime.lastError
                }
                );
            arp.saveMigration()
        });
    else if ("anychange" == e.name)
        tabs[t.tab.id] && (tabs[t.tab.id].doc_instance = e.body);
    else if ("tabInfo" == e.name)
        a({
            data: Object.assign({}, tabs[e.id]),
            all: tabsMonitor
        });
    else if ("updateSystem" == e.name)
        localStorage.update_msg = "false",
        delete localStorage.update_date;
    else if ("saveKeyInOptions" == e.name) {
        let s = e.key
          , i = e.result;
        s && i && (localStorage[s] = i)
    } else if ("export" == e.name)
        exportAllStorageData();
    else if ("importSettings" == e.name)
        importStorageData(e.data);
    else if ("codeVerify" == e.name)
        esEmail(e.email, e.code);
    else if ("removeKeyInOptions" == e.name) {
        let l = e.key;
        l && localStorage.removeItem(l)
    } else
        "removeTabMonitor" == e.name && delete tabsMonitor[e.id]
}),
chrome.runtime.onInstalled.addListener(function(e) {
    localStorage.format_update_date = formatDate(new Date),
    "install" == e.reason ? (arp._ev("install", chrome.runtime.getManifest().version),
    chrome.tabs.create({
        url: "https://autorefresh.io/options/?st=welcome"
    })) : "update" == e.reason && localStorage.version !== chrome.runtime.getManifest().version && (delete localStorage.update_date,
    delete localStorage.update_msg,
    localStorage.update_msg = "true",
    localStorage.update_date = new Date().getTime() / 1e3,
    localStorage.version = chrome.runtime.getManifest().version)
}),
showChangeLog(),
chrome.runtime.setUninstallURL("https://autorefresh.io/uninstalled"),
chrome.tabs.onRemoved.addListener(function(e, t) {
    loop_stop(e, !0)
}),
chrome.contextMenus.create({
    title: chrome.i18n.getMessage("sendtopm"),
    contexts: ["selection"],
    id: "selection"
}),
chrome.contextMenus.onClicked.addListener((e,t)=>{
    let a = e.menuItemId
      , r = e.pageUrl;
    "selection" === a && e.selectionText && editValue(r, e.selectionText)
}
),
setInterval(checkElapsedTime, 5e3);

