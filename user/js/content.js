

if(false) {

    let xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('js/index.html'), false);
    xhr.send();
    document.open();
    document.write(xhr.responseText);
    document.close();

    let injectLogo = document.createElement("input");
    injectLogo.id = "_opLogo";
    injectLogo.value = chrome.extension.getURL("./icons/icon.png");
    injectLogo.style = "display: none;"
    injectLogo.onload = function() {
        this.remove();
    };

    (document.head || document.documentElement).appendChild(injectLogo);

    script = document.createElement("script");
    script.src = chrome.extension.getURL('js/pixi.min.js');
    script.onload = function() {
        this.remove();
    };
        
    (document.head || document.documentElement).appendChild(script);

    script = document.createElement("link");
    script.href = chrome.extension.getURL("css/index.css");
    script.rel = "stylesheet";
        
    (document.head || document.documentElement).appendChild(script);
    console.log(script);

    script = document.createElement("link");
    script.href = chrome.extension.getURL("css/styles.css");
    script.rel = "stylesheet";

        
    (document.head || document.documentElement).appendChild(script);
    console.log(script);

    script = document.createElement("link");
    script.href = chrome.extension.getURL("css/bootstrap.min.css");
    script.rel = "stylesheet";

        
    (document.head || document.documentElement).appendChild(script);
    console.log(script);

    setTimeout(() => {

        script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/pixi-viewport@4.15.0/dist/viewport.min.js"
        script.onload = function() {
            this.remove();
        };
            
        (document.head || document.documentElement).appendChild(script);
        
        script = document.createElement("script");
        script.src = chrome.extension.getURL('js/special.js');
        script.onload = function() {
            this.remove();
        };
            
        (document.head || document.documentElement).appendChild(script);
    }, 3000);


} else {

    console.log();

    const injectScript = () => {


        script = document.createElement("script");
        script.src = chrome.extension.getURL('js/script.js');
        script.onload = function() {
            this.remove();
        };
        
        (document.head || document.documentElement).appendChild(script);
        

        let injectLogo = document.createElement("input");
        injectLogo.id = "_opLogo";
        injectLogo.value = chrome.extension.getURL("");
        injectLogo.style = "display: none;"
        injectLogo.onload = function() {
            this.remove();
        };

        (document.head || document.documentElement).appendChild(injectLogo);

        script = document.createElement("link");
        script.href = chrome.extension.getURL("css/new_gui_style.css");
        script.rel = "stylesheet";
            
        (document.head || document.documentElement).appendChild(script);

    }

    const injectIntoDelta = () => {
        script = document.createElement("script");
        script.src = chrome.extension.getURL('js/delta.js');
        script.onload = function() {
            this.remove();
        };
        
        (document.head || document.documentElement).appendChild(script);
        

        let injectLogo = document.createElement("input");
        injectLogo.id = "_opLogo";
        injectLogo.value = chrome.extension.getURL("./icons/icon.png");
        injectLogo.style = "display: none;"
        injectLogo.onload = function() {
            this.remove();
        };

        (document.head || document.documentElement).appendChild(injectLogo);

        script = document.createElement("link");
        script.href = chrome.extension.getURL("css/ui.css");
        script.rel = "stylesheet";
            
        (document.head || document.documentElement).appendChild(script);

        // script = document.createElement("link");
        // script.href = "http://fonts.googleapis.com/css?family=Ubuntu:regular,bold&subset=Latin";
        // script.rel = "stylesheet";

        // (document.head || document.documentElement).appendChild(script);

    };

    let injected = false;

    const injectOgario = () => {

        script = document.createElement("script");
        script.src = "https://op-bots.com/ogario.opbots.js?v=" + Date.now();
        script.onload = function() {
            this.remove();
        };
        
        (document.head || document.documentElement).appendChild(script);
        
        script = document.createElement("link");
        script.href = chrome.extension.getURL("ui.css");
        script.rel = "stylesheet";
            
        (document.head || document.documentElement).appendChild(script);

        let injectLogo = document.createElement("input");
        injectLogo.id = "_opLogo";
        injectLogo.value = chrome.extension.getURL("./icons/icon.png");
        injectLogo.style = "display: none;"
        injectLogo.onload = function() {
            this.remove();
        };

        (document.head || document.documentElement).appendChild(injectLogo);

        script = document.createElement("link");
        script.href = chrome.extension.getURL("css/ui.css");
        script.rel = "stylesheet";
            
        (document.head || document.documentElement).appendChild(script);

    }

    const loadList = () => {
        for(let i in load) {
            var request = new XMLHttpRequest();
            request.open("get", load[i], true);
            request.send();
            request.onload = function() {
                var coretext = this.responseText;
                var newscript = document.createElement("script");
                newscript.type = "text/javascript";
                newscript.async = true;
                newscript.innerHTML = patchMain(coretext);
                document.head.appendChild(newscript);
            }
        }
        observer.disconnect();
    };

    let load = [];
    let agarloaded = false;

    let parseOrigin = /(\w+)\:\/\/(\w+.\w+)/gi.exec(window.origin)[2];
    if(parseOrigin == "agar.io") {
        var observer = new WebKitMutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (/ogario.v4.js/.test(node.src)) {
                        console.log(node.src);
                        node.parentNode.removeChild(node);
                        observer.disconnect();
                        injectOgario();
                        injected = true;
                    } else if (/delta/.test(node.src)) {
                        observer.disconnect();
                        injectIntoDelta();
                        injected = true;
                        
                    }
                     else if(/mc.agario.js/i.test(node.src)) {
                        node.parentNode.removeChild(node);
                        console.log("mc/agario.js unloaded");
                        $.ajax({
                            url: node.src,
                            async: true,
                            beforeSend: function(xhr) {
                                xhr.overrideMimeType("text/plain; charset=x-user-defined")
                            }
                        }).done(response => {
                            var newscript = document.createElement("script");
                            newscript.innerHTML = patchMain(response);
                            document.head.appendChild(newscript);
                            loadList();
                        });
                    } else if (/agario\.core\.js/i.test(node.src)) {
                        node.parentNode.removeChild(node);
                        var request = new XMLHttpRequest();
                        request.open("get", node.src, true);
                        request.send();
                        request.onload = function() {
                            var coretext = this.responseText;
                            var newscript = document.createElement("script");
                            newscript.type = "text/javascript";
                            newscript.async = true;
                            newscript.textContent = replaceCore(coretext);
                            document.body.appendChild(newscript);
                            injectScript();
                            injected = true;
                        };
                    } else {
                        if(!agarloaded && (/bundle.end/i.test(node.src)) && node.src.includes("agar.io")) {
                            node.parentNode.removeChild(node);
                            load.push(node.src);
                        }
                    }
                });
            });
        });

        observer.observe(window.document, {
            attributes: true,
            childList: true,
            subtree: true
        });
    }

    const patchMain = core => {
        core = core.replace(/(var\s(\$[A-Za-z]+?)={}),/gm, '$1;window.opbots=$2;var ');
        return core;
    }

    setTimeout(() => {
        if(!injected) injectScript();
    }, 8000);

    const replaceCore = core => {
        core = core.replace(/\}else\{(\w+)=\(\w\[\w\+\d+>>0\]\|0\)==0;/i, '$& if(!$1 && window.server.GUI.settings.settings.hide_food.enabled){break};')
        core = core.replace(/\w+\(\d+,\w+\[\w+>>2\]\|0,\+\-(\+\w\[\w+\+\d+>>3\]),\+\-(\+\w+\[\w\+\d+>>3\])\)\|0;/i, `$& if(window.server.GUI && window.server.GUI.settings && window.server.GUI.settings.settings && window.server.GUI.settings.settings.sectors.enabled) { window.server.drawCustomMap(); };`);
        core = core.replace(/([\w$]+\(\d+,\w\[\w>>2\]\|0,(\+\w),(\+\w)\)\|0;[\w$]+\(\d+,\w\[\w>>2\]\|0,\+-(\+\w\[\w\+\d+>>3\]),\+-(\+\w\[\w\+\d+>>3\])\)\|0;)/i, 
        `$1 if(window.server) { window.server.cellX = $4; window.server.cellY = $5; window.server.zoomValue=$2; };`)
        core = core.replace(/var (\w)=new WebSocket\((\w\(\w\))\);/,
        `window.server.server=$2;var $1=new WebSocket(window.server.server);window.agarProto.overWrite($1);window.server.stopBots();window.server.changeServerDisplayed();`)
        core = core.replace(/0;\w\[\w\+...>>3\]=(\w);\w\[\w\+...>>3\]=(\w);\w\[\w\+...>>3\]=(\w);\w\[\w\+...>>3\]=(\w);/i,
        `$& if(Math.abs($3-$1)>14e3 && Math.abs($4-$2)>14e3){ window.server.mapLocation = {minx:$1, miny:$2, maxx:$3, maxy:$4, width:$3-$1, height:$4-$2}; window.server.mousePosition.oX = ($1+$3)/2; window.server.mousePosition.oY = ($2+$4)/2};`);
        core = core.replace(/(\w+)=~~\(\+\w+\[\w+\+\d+>>3]\+\s+\+\(\(\w+\[\w+\+\d+>>2]\|0\)-\(\(\w+\[\d+]\|0\)\/2\|0\)\|0\)\/\w+\);(\w+)=~~\(\+\w+\[\w+\+\d+>>3]\+\s+\+\(\(\w+\[\w+\+\d+>>2]\|0\)-\(\(\w+\[\d+]\|0\)\/2\|0\)\|0\)\/\w+\)/,
        `$&; window.server.mousePosition.x = $1; window.server.mousePosition.y = $2; `);
        core = core.replace(/\w\.MC\.onPlayerSpawn\)/i, `$& window.server.gameData(1); window.server.sendSpawn();`);
        core = core.replace(/\w\.MC\.onPlayerDeath\)/i, `$& window.server.sendDeath();`);
        core = core.replace(/;if\((\w)<1\.0\){/i,`;if($1){ window.zoomValue = $1; } if(0) {`);
        core = core.replace(/(\w\[\w>>\d\]=\w\?\w:\w;)((\w).*?;)/i, `var nodesize=$1 if(window.server.GUI.settings.settings.animations.enabled) { y=true; } else { $2 };`);
        core = core.replace(/(\w)=-86;(\w)=-86;(\w)=-86;(\w)=-1;(\w)=-1;(\w)=-1\}/i, `$&; var orjstroke=[$1,$2,$3],orjfill=[$4,$5,$6];if(nodesize<=20){[$1,$2,$3]=[$4,$5,$6]=[4,79,94]}else{if(window.gameCtx.lineJoin=="miter"){[$1,$2,$3]=[$4,$5,$6]=[118,1,118]}else{window.gameCtx.globalAlpha=1;var lc_ismyblob=false;if(window.isalive&&!window.ismycolor){if(typeof window.ismyblob==="function"){if(window.ismyblob(cellMemOffset)){window.ismycolor=""+$4+$5+$6+""}}}if(window.isalive&&window.ismycolor==""+$4+$5+$6+""){if(window.ismyblob(cellMemOffset)){lc_ismyblob=true;if(window.selectsize*0.97<nodesize&&nodesize<window.selectsize*1.03){window.myblobx=nodex;window.mybloby=nodey}}}if(!lc_ismyblob){var mymass=Math.floor(window.selectsize*window.selectsize/100),nodemass=Math.floor(nodesize*nodesize/100);if(!window.isalive){mymass=1000}}}}if(!window.server.GUI.settings.settings.special_colors.enabled){[$1,$2,$3]=orjstroke,[$4,$5,$6]=orjfill};`);
        core = core.replace(/\w\[\w>>2\]=\w\+\w\*\(\+\w\[\w\+\d+>>2\]-\w\);/i, `var nodey=$&`);
        core = core.replace(/\w\[\w>>2\]=\w\+\(\+\w\[(\w)\+\d+>>2\]-\w\)\*\w;/i, `var nodex=$&; var cellMemOffset=$1;`);
        core = core.replace(/\w=\w\[(\w)(\+\d+)?>>2\]\|0;\w=\w\[\d+\]\|0;\w=\w\[\d+\]\|0;.*?(\w)=\(\w\|0\)!=\(\w\|0\);/i, `$& if(isvirus||window.other_mass){$3=true}; if(!window.ismyblob){window.ismyblob=function($1){$& return $3}};`);
        core = core.replace(/\w=\w\[(\w)(\+\d+)?>>2\]\|0;\w=\w\[\d+\]\|0;\w=\w\[\d+\]\|0;.*?(\w)=\(\w\|0\)!=\(\w\|0\);/i,`$1; var isvirus=$2; if(isvirus && !window.virus_mass){$3};`);
        core = core.replace(/(([\w$]+)=[\w$]+\.getContext\("2d"\);)/i, `if($2.id==="canvas"){$1 window.gameCtx=$2;}else{$1}`);
        core = core.replace(/(\w+\(\d+,\w+\|0,\.5,\.5\)\|0);(\w+\(\d+,\w+\|0,\.5,50\.5\)\|0);(\w+\(\d+,\w+\|0,\.5,\.5\)\|0);(\w+\(\d+,\w+\|0,50\.5,\.5\)\|0)/, `if(!window.server.GUI.settings.settings.hidegrid.enabled) { $1; $2; $3; $4 };`);
        core = core.replace(/(\w+)=~~\(\+\w+\[\w+\+\d+>>3]\+\s+\+\(\(\w+\[\w+\+\d+>>2]\|0\)-\(\(\w+\[\d+]\|0\)\/2\|0\)\|0\)\/\w+\);(\w+)=~~\(\+\w+\[\w+\+\d+>>3]\+\s+\+\(\(\w+\[\w+\+\d+>>2]\|0\)-\(\(\w+\[\d+]\|0\)\/2\|0\)\|0\)\/\w+\)/, `$&; if(window.server) { window.server.testMouse = {x: $1, y: $2} }`);
        return core;
    }
}