((target) => {
    console.log("LOADING")
    class serverManager {
        constructor() {
            this.ws = null;
            this.data = {}
            this.server = null;
            this.mousePosition = {
                x: 0,
                y: 0,
                oX: 0,
                oY: 0
            }
            this.mapLocation = {
                minx: 0,
                miny: 0,
                maxx: 0,
                maxy: 0
            };


            this.ownLogo = document.getElementById("_opLogo").value;
            this.nickName = "";
            this.overwrited = "";

            this.version = 303;

            this.cellX = 0;
            this.cellY = 0;

            this.started = false;

            this.wsip = `op-bots.com`;
            this.GUI = new guiHandler();

            this.follow_mouse = true;

            this.addListeners();
            this.sendMouse();
            this.connect();
        }
        changeServerDisplayed() {
            if(!document.getElementById("serverIP")) return;
            document.getElementById("serverIP").value = this.server;
        }
        sendMouse() {
            setInterval(() => {
                this.gameData(2);
                let nick = document.getElementById("nick");
                if(nick) this.nickName = nick.value;
            }, 100);
        }
        connect() {
            //this.ws = new WebSocket(`ws://127.0.0.1:8000`);
            window.location.protocol == "https:" ? this.ws = new WebSocket(`wss://${this.wsip}:8001`) : this.ws = new WebSocket(`ws://${this.wsip}:8000`);
            this.ws.binaryType = "arraybuffer";
            this.ws.onopen = this.open.bind(this);
            this.ws.onclose = this.close.bind(this);
            this.ws.onerror = this.error.bind(this);
            this.ws.onmessage = this.message.bind(this);
        }
        open() {
            let buffer = this.createBuffer(3);
            buffer.setUint8(0, 40);
            buffer.setUint16(1, this.version, true);
            this.sendData(buffer);
            document.getElementById("serverstatus").innerHTML = "Connected";
        }
        close() {
            this.server = null;
            this.started = false;
            document.getElementById("serverstatus").innerHTML = "Disconnected";
            if(this.canReconnect) setTimeout(this.connect.bind(this), 10000);
        }
        error() {

        }
        sendSpawn() {
            this.sendData(new Uint8Array([3, 5]));
            if(this.GUI.settings.custom_skin) core.registerSkin(this.nickName, null, this.GUI.settings.custom_skin, 0, null);
        }
        sendDeath() {
            this.sendData(new Uint8Array([3, 4]));
        }
        convertTime(time) {
            let years   = time / (60 * 60 * 24 * 30 * 12) >>> 0;
            let month   = time / (60 * 60 * 24 * 30) >>> 0;
            let day     = time / (60 * 60 * 24) >>> 0;
            let hour    = time / (60 * 60) % 24 >>> 0;
            let min     = time / 60 % 60 >>> 0;
            let sec     = time % 60 >>> 0;
            return `${hour}H ${min}M ${sec}S`;
            if(years > 0) {
                return `${years} Year(s)`
            } else if(month > 0) {
                return `${month} Month(s)`
            } else if(day > 0) {
                return `${day} Day(s)`
            } else if(hour > 0) {
                return `${hour} Hour(s)`
            } else if(min > 0) {
                return `${min} Min(s)`
            } else {
                return `${sec} Sec(s)`
            }
        }
        message(msg) {
            msg = target.inject.normalizeBuffer(msg.data);
            let offset = 0;
            let opcode = msg.getUint8(offset++);
            switch(opcode) {
                case 254: {
                    let state = msg.getUint8(offset++);

                    switch(state) {
                        case 1:
                            this.data.bots = msg.getUint16(offset, true);
                            offset += 2;
                            this.data.maxbots = msg.getUint16(offset, true);

                            document.getElementById("spawned").innerHTML = this.data.bots;
                            document.getElementById("maxbots").innerHTML = this.data.maxbots;

                            // document.getElementById("botsAmount").innerHTML = `${this.data.bots}/${this.data.maxbots}`;
                            // document.getElementById("opbot_load").style.width = `${~~((this.data.bots / this.data.maxbots) * 100)}%`
                            break;
                        case 2:
                            this.data.time = msg.getFloat64(offset, true);
                            document.getElementById("timeleft").innerHTML = this.convertTime(this.data.time);
                            break;
                        case 3:
                            this.data.sessionID = msg.getFloat64(offset, true);
                            document.getElementById("sessionid").innerHTML = this.data.sessionID;
                            break;
                        case 4:
                            this.data.version = "";
                            let version_bytes;
                            while((version_bytes = msg.getUint8(offset++)) != 0) {
                                this.data.version += String.fromCharCode(version_bytes);
                            }
                            document.getElementById("serverbuild").innerHTML = this.data.version;
                            break;
                        case 5:
                            {
                                let check = msg.getUint8(offset++);
                                document.getElementById("botsaistatus").innerHTML = check ? "Enabled" : "Disabled";
                            }
                            break;
                        case 6:
                            {
                                let check = msg.getUint8(offset++);
                                document.getElementById("virusprotectionstatus").innerHTML = check ? "Enabled" : "Disabled";
                            }
                            break;
                    }
                } break;
                case 200: {
                    let message = "";
                    let byte = 0;
                    while((byte = msg.getUint8(offset++)) != 0) {
                        message += String.fromCharCode(byte);
                    }
                    alert(message);
                } break;
                case 25: {
                    
                    let op2 = msg.getUint8(offset++);
                    // let htmlToInject = `
                    // <div class="opcontentc botsCounter">
                    //     <p>Bots: <span id="botsAmount">0/0</span>
                    //         <span class="opsmall expire">Allocated bots</span>
                    //         <span id="opbot_load"></span>
                    //     </p>
                    // </div>
                    // <div class="opcontentc botMod">
                    //     <p>Time Left
                    //         <span class="opsmall">
                    //             <span class="botmod"></span>
                    //             <span id="botsTime">0D 0H 0M 0S</span>
                    //         </span>
                    //     </p>
                    // </div>
                    // <div class="opcontentc" id="botsAIc" style="left: 405px; width:136px">
                    //     <p>Bots AI
                    //         <span class="opsmall">
                    //             <span class="botmod"></span>
                    //             <span id="botsAI">Disabled</span>
                    //         </span>
                    //     </p>
                    // </div>
                    // `;
                    switch(op2) {
                        case 0:
                           this.started = false;
                           if(document.getElementById("startstopbots")) document.getElementById("startstopbots").innerHTML = "START BOTS";
                           break;
                       case 1:
                           this.started = true;
                           if(document.getElementById("startstopbots")) document.getElementById("startstopbots").innerHTML = "STOP BOTS";
                           break;
                    }
                    // this.aienabled = false;
                    // document.getElementById("mainBar").innerHTML = htmlToInject;
                } break;
                case 87: {
                    this.sendData(new Uint8Array([87]));
                } break;
                case 40: {
                    let error_code = msg.getUint8(offset++);
                    console.log(error_code);
                    switch(error_code) {
                        case 0:
                            {
                                this.GUI.errorNotify("Cannot find your account, please update your IP on profile page!");
                                this.ws.close();
                            }
                            break;
                        case 1:
                            {
                                this.GUI.errorNotify("Client version mismatch! Update extension!");
                                this.canReconnect = false;
                                this.ws.close();
                            }
                            break;
                        case 2:
                            {
                                this.GUI.errorNotify("Your plan has expired!");
                                this.canReconnect = false;
                                this.ws.close();
                            }
                            break;
                    }
                } break;
                case 41: {
                    document.getElementById("alert").innerHTML = '<div class="alert-info">Logged in as Free User</div>';
                } break;
                case 42: {
                    let bots = msg.getUint16(offset, true);
                    document.getElementById("maxbots").innerHTML = bots;
                    document.getElementById("alert").innerHTML = '<div class="alert-info">Logged in as Premium User with ' + bots + ' bots</div>'
                } break;
                case 43: {
                    this.data.ip = "";
                    let ip;
                    while((ip = msg.getUint8(offset++)) != 0) {
                        this.data.ip += String.fromCharCode(ip);
                    }
                    document.getElementById("yourip").innerHTML = this.data.ip;
                } break;
            }
        }
        stopBots() {
            this.sendData(new Uint8Array([25, 0]))
        }
        addController() {
            document.getElementById("controlStart").onclick = () => {
                if(this.started) {
                    this.sendData(new Uint8Array([25, 0]))
                } else {
                    let buf = this.createBuffer(3 + this.server.length);
                    let offset = 0;
                    buf.setUint8(offset++, 25);
                    buf.setUint8(offset++, 1);
                    for(let i = 0; i < this.server.length; i++) {
                        buf.setUint8(offset++, this.server.charCodeAt(i))
                    };
                    buf.setUint8(offset++, 0)
                    this.sendData(buf);
                }
            };
        }
        sendBytesDebug(text) {
            let buf = this.createBuffer(2 + text.length);
            let offset = 0;
            buf.setUint8(offset++, 50);
            for(let i = 0; i < text.length; i++) {
                buf.setUint8(offset++, text.charCodeAt(i))
            };
            buf.setUint8(offset++, 0)
            this.sendData(buf);
        }
        sendData(data) {
            if(this.ws && this.ws.readyState == 1) {
                this.ws.send(data);
            }
        }
        startOrStop() {
            if(this.started) {
                this.stopBots();
            } else {
                this.gameData(1);
            }
        }
        clientState(state) {

        }
        createBuffer(len) {
            return new DataView(new ArrayBuffer(len));
        }
        sendMyNick(name) {
            let buffer = this.createBuffer(4 + name.length * 2);
            let offset = 0;
            buffer.setUint8(offset++, 3);
            buffer.setUint8(offset++, 6);
            for(let i = 0; i < name.length; i++) {
                buffer.setUint16(offset, name.charCodeAt(i), true);
                offset += 2;
            }
            buffer.setUint16(offset, 0, true);
            this.sendData(buffer);
        }
        sendCheck(x, y) {
            let buffer = this.createBuffer(3);
            buffer.setUint8(0, 3);
            buffer.setUint8(1, 7);
            switch (true) {
                case (x < 0 && y < 0):
                    buffer.setUint8(2, 1);
                    break;
                case (x > 0 && y < 0):
                    buffer.setUint8(2, 2);
                    break;
                case (x > 0 && y > 0):
                    buffer.setUint8(2, 3);
                    break;
                case (x < 0 && y > 0):
                    buffer.setUint8(2, 4);
                    break;
                default:
                    break;
            }
            this.sendData(buffer);
            this.sendMyNick(this.nickName);
        }
        sendCheck2(x, y) {
            let buffer = this.createBuffer(3);
            buffer.setUint8(0, 3);
            buffer.setUint8(1, 7);
            buffer.setUint8(2, 5);
            this.sendData(buffer);
            this.sendMyNick(this.nickName);
        }
        gameData(type, message) {
            if(type == 1) { // game server
                let buf = this.createBuffer(3 + this.server.length);
                let offset = 0;
                buf.setUint8(offset++, 25);
                buf.setUint8(offset++, 1);
                for(let i = 0; i < this.server.length; i++) {
                    buf.setUint8(offset++, this.server.charCodeAt(i))
                };
                buf.setUint8(offset++, 0)
                this.sendData(buf);
            } else if(type == 2) { // game mouse data
                let buf = this.createBuffer(18);
                let offset = 0;
                let pos = this.getMousePos();
                buf.setUint8(offset++, 2);
                buf.setFloat64(offset, pos.x, true);
                offset += 8;
                buf.setFloat64(offset, pos.y, true);
                this.sendData(buf);
            } else if(type == 3) { // game user modified data

            } else if(type == 4) {
                let buf = this.createBuffer(3 + message.length);
                let offset = 0;
                buf.setUint8(offset++, 19);
                buf.setUint8(offset++, 0)
                buf.setUint8(offset++, message.length)
                for(let i = 0; i < message.length; i++) {
                    buf.setUint8(offset++, message.charCodeAt(i))
                };
                this.sendData(buf);
            }
        }

        getMousePos() {
            return {
                x: (this.follow_mouse ? this.mousePosition.x : this.cellX) - ((this.mapLocation.minx + this.mapLocation.maxx) / 2),
                y: (this.follow_mouse ? this.mousePosition.y : this.cellY) - ((this.mapLocation.miny + this.mapLocation.maxy) / 2)
            }
        }

        getRecaptchaToken() {
            
            grecaptcha.execute("6Le2eLIZAAAAACYfDXc6fT__SyfOP0m7rNyjkJdR", {action: `homepage`}).then(token => {
                let buf = this.createBuffer(2 + token.length);
                let offset = 0;
                buf.setUint8(offset++, 111);
                for(let i = 0; i < token.length; i++) {
                    buf.setUint8(offset++, token.charCodeAt(i))
                };
                buf.setUint8(offset++, 0)
                this.sendData(buf);
            });

        }

        
        addListeners() {
            window.addEventListener("mousemove", event => {
                window.clientXXX = event.clientX;
                window.clientYYY = event.clientY;
            });
        }
        
        drawCustomMap() {
            if(!this.mapLocation) return false;
            window.gameCtx.save();
            var sectorCount = 5;
            var w = this.mapLocation.width / sectorCount;
            var h = this.mapLocation.height / sectorCount;
            window.gameCtx.fillStyle = "#808080";
            window.gameCtx.textBaseline = "middle";
            window.gameCtx.textAlign = "center";
            window.gameCtx.globalAlpha = 0.7;
            window.gameCtx.font = (w / 3 | 0) + "px Ubuntu";
            for (var y = 0; y < sectorCount; ++y) {
                for (var x = 0; x < sectorCount; ++x) {
                    var str = String.fromCharCode(65+y) + (x + 1);
                    var dx = (x + 0.5) * w + this.mapLocation.minx;
                    var dy = (y + 0.5) * h + this.mapLocation.miny;
                    window.gameCtx.fillText(str, dx, dy);
                }
            }
            window.gameCtx.restore();
            window.gameCtx.save();
            window.gameCtx.strokeStyle = '#F07D00';
            window.gameCtx.lineWidth = 20;
            window.gameCtx.lineCap = 'round';
            window.gameCtx.lineJoin = 'round';
            window.gameCtx.beginPath();
            window.gameCtx.moveTo(this.mapLocation.minx, this.mapLocation.miny);
            window.gameCtx.lineTo(this.mapLocation.maxx, this.mapLocation.miny);
            window.gameCtx.lineTo(this.mapLocation.maxx, this.mapLocation.maxy);
            window.gameCtx.lineTo(this.mapLocation.minx, this.mapLocation.maxy);
            window.gameCtx.closePath();
            window.gameCtx.stroke();
            window.gameCtx.restore();
        }
        connect_to_agar_server(server) {
            window.opbots.Core.ui.network.connect(server.split("wss://")[1]);
            this.server = server;
        }
        joinAgarServer() {
            let server = prompt("Enter server IP here, example: wss://live-arena-gs6321:443", "");
            this.connect_to_agar_server(server);
        }
    }


    class inject {
        constructor() {
            this.coreurl = "";
            this.inject();
        }

        inject() {
            let parseOrigin = /(\w+)\:\/\/(\w+.\w+)/gi.exec(target.origin)[2];
            console.log(parseOrigin);
            let _this = this;
            if(parseOrigin == "mope.io") {
                setInterval(() => {
                    target.server.getRecaptchaToken();
                }, 2500);
                target.WebSocket.prototype._send = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._send.apply(this, arguments);

                    if(/(\w+-\w+.\w+.\w+)/.test(this.url)) {
                        let serverurl = /(\w+-\w+.\w+.\w+)/.exec(this.url)[0];
                        serverurl = `wss://${serverurl}:443`;
                        if(!serverurl.includes(target.server.wsip)) {
                            let buf = _this.normalizeBuffer(arguments[0]);
                            let offset = 0;
                            let opcode = buf.getUint8(offset++, 0);
                            switch(opcode) {
                                case 5:
                                    target.server.mousePosition.x = buf.getInt16(offset);
                                    offset += 2;
                                    target.server.mousePosition.y = buf.getInt16(offset);
                                    target.server.gameData(2);
                                    break;
                            }
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            //target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "beta.mope") {
                console.log("INJECTING")
                console.log("btw nice protection");
                target.WebSocket.prototype._send = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._send.apply(this, arguments);

                    let serverurl = this.url;
                    console.log(serverurl, target.server.wsip);
                    if(!serverurl.includes(target.server.wsip)) {
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        target.server.sendBytesDebug(new Uint8Array(arguments[0]) + "")
                        switch(opcode) {
                            case 5:
                                target.server.mousePosition.x = buf.getInt16(offset);
                                offset += 2;
                                target.server.mousePosition.y = buf.getInt16(offset);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "ixagar.net") {
                target.WebSocket.prototype._send = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._send.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        switch(opcode) {
                            case 2:
                                break;
                            case 16:
                                target.server.mousePosition.x = buf.getInt32(offset, true);
                                offset += 4;
                                target.server.mousePosition.y = buf.getInt32(offset, true);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "slither.io") {
                setInterval(() => {
                    if (target.social) target.social.remove();
                    target.server.mousePosition.x = target.snake.xx;
                    target.server.mousePosition.y = target.snake.yy;
                    target.server.gameData(2);
                    let server = "ws://" + target.bso.ip + ":" + target.bso.po + "/slither";
                    if(target.server.server != server) {
                        target.server.server = server;
                        target.server.gameData(1);
                    }
                }, 200);
            } else if(parseOrigin == "de.agar") {
                target.WebSocket.prototype._send = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._send.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        switch(opcode) {
                            case 16:
                                target.server.mousePosition.x = buf.getFloat64(offset, true);
                                offset += 8;
                                target.server.mousePosition.y = buf.getFloat64(offset, true);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "agar.cc") {
                target.WebSocket.prototype._send = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._send.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        console.log(new Uint8Array(arguments[0]) + "")
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        switch(opcode) {
                            case 16:
                                target.server.mousePosition.x = buf.getFloat64(offset, true);
                                offset += 8;
                                target.server.mousePosition.y = buf.getFloat64(offset, true);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "cellcraft.io") {
                target.WebSocket.prototype._sniffer = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._sniffer.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        window.checkAds = () => {return false}
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        switch(opcode) {
                            case 16:
                                target.server.mousePosition.x = buf.getInt32(offset, true);
                                offset += 4;
                                target.server.mousePosition.y = buf.getInt32(offset, true);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "www.modd") {
                
                setTimeout(() => {
                    $("#more-games").remove();
                }, 5000);

                target.WebSocket.prototype._sniffer = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._sniffer.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        console.log(JSON.parse(arguments[0]));
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            //target.server.gameData(1);
                        }
                    }
                }
            } else if(parseOrigin == "balz.io") {
                target.WebSocket.prototype._sniffer = target.WebSocket.prototype.send;
                target.WebSocket.prototype.send = function() {
                    this._sniffer.apply(this, arguments);
                    let serverurl = `${this.url}`;
                    if(!serverurl.includes(target.server.wsip)) {
                        if(typeof arguments[0] == "string") return;
                        console.log(arguments[0])
                        let buf = _this.normalizeBuffer(arguments[0]);
                        let offset = 0;
                        let opcode = buf.getUint8(offset++, 0);
                        switch(opcode) {
                            case 16:
                                target.server.mousePosition.x = buf.getInt32(offset, true);
                                offset += 4;
                                target.server.mousePosition.y = buf.getInt32(offset, true);
                                target.server.gameData(2);
                                break;
                        }
                        if(target.server.server != serverurl) {
                            target.server.server = serverurl;
                            target.server.gameData(1);
                        }
                    }
                }
            }
        };


        normalizeBuffer(buf) {
            buf = new Uint8Array(buf);
            //if(buf[0] != 5) console.log(buf)
            let newBuf = new DataView(new ArrayBuffer(buf.byteLength));
            for(let i = 0; i < buf.byteLength; i++) {
                newBuf.setUint8(i, buf[i])
            }
            return newBuf;
        }

        replace(data, func, type) {

        }

    }

    class guiHandler {
        constructor() {
            this.version = "1.0.5";
            this.isVisisble = true;
            this.settings = {};
            this.currentTab = null;
            
            this.actionID = null;

            this.gui = "";
            this.inject();
            this.initKeyBinds();
        }

        loadCache() {
            let cache = window.localStorage.getItem("gui_cache");
            if(cache) {
                this.settings = JSON.parse(cache);
                if(this.settings.version != this.version) {
                    console.log(this.settings, cache);
                    console.log(this.version, this.settings.version);
                    window.localStorage.removeItem("gui_cache");
                    return this.loadCache();
                }
                this.addGUI();
                this.loadKeyBindsHtml();
                this.loadSettingsHtml();
                this.settings.darkmode = !this.settings.darkmode;
                this.darkModeChange();
            } else {
                this.settings = {
                    version: "1.0.5",
                    darkmode: false,
                    custom_skin: "",
                    keybinds: [
                        {
                            action: "togglegui",
                            key: "P",
                            key_code: 80,
                            description: "Toggle GUI"
                        }, 
                        {
                            action: "split_bots_x1",
                            key: "X",
                            key_code: 88,
                            description: "Split from bots"
                        }, 
                        {
                            action: "eject_bots",
                            key: "C",
                            key_code: 67,
                            description: "Eject from bots"
                        }, 
                        {
                            action: "bots_ai",
                            key: "F",
                            key_code: 70,
                            description: "Toggle Bots AI"
                        }, 
                        {
                            action: "virus_protection",
                            key: "V",
                            key_code: 86,
                            description: "Toggle Virus Protection"
                        },
                        {
                            action: "follow_mode",
                            key: "B",
                            key_code: 66,
                            description: "Toggle Follow Mode"
                        },
                        {
                            action: "macro_eject",
                            key: "W",
                            key_code: 87,
                            description: "Macro feed"
                        }, 
                        {
                            action: "double_split",
                            key: "Q",
                            key_code: 81,
                            description: "Double split(User)"
                        }, 
                        {
                            action: "quad_split",
                            key: "SHIFT",
                            key_code: 16,
                            description: "Quad Split(User)"
                        }, 
                        {
                            action: "double_split_bots",
                            key: "G",
                            key_code: 71,
                            description: "Quad Split(Bots)"
                        }, 
                        {
                            action: "quad_split_bots",
                            key: "H",
                            key_code: 72,
                            description: "Quad Split(Bots)"
                        }
                    ],
                    settings: {
                        animations: {
                            enabled: false,
                            desc: "Disable Vanilla Animation"
                        },
                        zoom: {
                            enabled: true,
                            desc: "More zoom"
                        },
                        sectors: {
                            enabled: false,
                            desc: "Background sectors"
                        },
                        hidegrid: {
                            enabled: false,
                            desc: "Hide grid"
                        },
                        special_colors: {
                            enabled: false,
                            desc: "Special Colors (fps up)"
                        },
                        hide_food: {
                            enabled: false,
                            desc: "Hide ingame food (fps up)"
                        }
                    }
                }
                this.saveCache();
                return this.loadCache();
            }
        }

        loadKeyBindsHtml() {
            let block = "";
            for(const bind of this.settings.keybinds) {
                block += `
                <div class="toggle-button-cover">
                    <div class="button-cover-more">
                        <div class="buttonop r buttonop-more" id="button-3">
                            <div class="keybinds-key" onclick="server.GUI.changeBind(this)" id="${bind.action}">${bind.key}</div>
                        </div>
                        <div class="checkbox-lable">${bind.description}</div>
                    </div>
                </div>
                `;
            }
            document.getElementById("keybind_section").innerHTML = block;
        }

        loadSettingsHtml() {
            let block = "";
            for(let i in this.settings.settings) {
                let option = this.settings.settings[i];
                block += 
                `
                <div class="toggle-button-cover">
                    <div class="button-cover">
                        <div class="buttonop r" id="button-1">
                        <input type="checkbox" class="checkboxx" id="${i}" onchange="server.GUI.changeOption(this.id)" ${option.enabled ? "" : "checked"}>
                            <div class="knobs"></div>
                            <div class="layer"></div>
                        </div>
                        <div class="checkbox-lable">${option.desc}</div>
                    </div>
                </div>
                `;
            }
            document.getElementById("options_section").innerHTML = block;
        }

        customSkinChange() {
            this.settings.custom_skin = document.getElementById("nick_op").value;
            this.saveCache();
        }

        changeOption(id) {
            if(this.settings.settings.hasOwnProperty(id)) {
                this.settings.settings[id].enabled = !this.settings.settings[id].enabled;
                this.saveCache();
            }
        }

        changeBind(element) {
            if(this.actionID) {
                document.getElementById(this.actionID).style.backgroundColor = "var(--main-box-color)";
                this.actionID = element.id;
                element.style.backgroundColor = "var(--op-second-color)";
            } else {
                this.actionID = element.id;
                element.style.backgroundColor = "var(--op-second-color)";
            }
        }

        initKeyBinds() {
            window.addEventListener("keydown", (e) => {
                e = e.which || e.keyCode;
                if(this.actionID) {
                    for(const bind of this.settings.keybinds) {
                        if(bind.action == this.actionID) {
                            

                            bind.key = String.fromCharCode(e).toUpperCase();
                            bind.key_code = e;
                            document.getElementById(bind.action).innerHTML = bind.key;
                            document.getElementById(bind.action).style.backgroundColor = "var(--main-box-color)";
                            this.actionID = null;
                            this.saveCache();
                            break;
                        }
                    }
                } else {
                    let action;
                    for(const bind of this.settings.keybinds) {
                        if(bind.key_code == e) {
                            action = bind.action;
                            break;
                        }
                    }
                    switch(action) {
                        case "togglegui":
                            {
                                this.toggleGui();
                            }
                            break;
                        case "split_bots_x1":
                            {
                                server.sendData(new Uint8Array([3, 1]));
                            }
                            break;
                        case "eject_bots":
                            {
                                server.sendData(new Uint8Array([3, 2]));
                            }
                            break;
                        case "bots_ai":
                            {
                                server.sendData(new Uint8Array([3, 3]));
                            }
                            break;
                        case "virus_protection":
                            {
                                server.sendData(new Uint8Array([3, 8]));
                            }
                            break;
                        case "macro_eject":
                            {
                                if(!window.macroEject) {
                                    window.macroEject = setInterval(() => {
                                        window.core.eject();
                                    }, 10);
                                }
                            }
                            break;
                        case "double_split":
                            {
                                for(let i =  0; i < 2; i++) {
                                    setTimeout(() => {
                                        window.core.split();
                                    }, 40 * i);
                                }
                            }
                            break;
                        case "quad_split":
                            {
                                for(let i =  0; i < 4; i++) {
                                    setTimeout(() => {
                                        window.core.split();
                                    }, 40 * i);
                                }
                            }
                            break;
                        case "double_split_bots":
                            {
                                server.sendData(new Uint8Array([3, 9]));
                            }
                            break;
                        case "quad_split_bots":
                            {
                                server.sendData(new Uint8Array([3, 10]));
                            }
                            break;
                        case "follow_mode":
                            {
                                if(server.follow_mouse) {
                                    document.getElementById("followmode").innerHTML = "Cell";
                                } else {
                                    document.getElementById("followmode").innerHTML = "Mouse";
                                }
                                server.follow_mouse = !server.follow_mouse;
                            }
                            break;
                    }
                }
            })
            window.addEventListener("keyup", (e) => {
                e = e.which || e.keyCode;
                let action;
                for(const bind of this.settings.keybinds) {
                    if(bind.key_code == e) {
                        action = bind.action;
                        break;
                    }
                }
                switch(action) {
                    case "macro_eject":
                        {
                            if(window.macroEject) {
                                clearInterval(window.macroEject);
                                window.macroEject = null;
                            }
                        }
                        break;
                }
            });
        }

        saveCache() {
            window.localStorage.setItem("gui_cache", JSON.stringify(this.settings));
        }

        inject() {
            this.loadCache();
            document.getElementById("darktoggle").onclick = () => {
                this.darkModeChange();
            };
        }

        darkModeChange() {
            if(!this.settings.darkmode) {
                document.documentElement.style.setProperty('--main-box-color', "var(--main-box-dark-color)");
                document.documentElement.style.setProperty('--text-color-normal', "var(--main-text-dark-color)");
                document.documentElement.style.setProperty('--text-color-second', "var(--main-second-dark-color)");
                document.getElementById("darktoggle").classList.add("activecircle")
                this.settings.darkmode = true;
            } else {
                document.documentElement.style.setProperty('--main-box-color', "var(--main-box-white-color)");
                document.documentElement.style.setProperty('--text-color-normal', "var(--main-text-white-color)");
                document.documentElement.style.setProperty('--text-color-second', "var(--main-second-white-color)");
                document.getElementById("darktoggle").classList.remove("activecircle")
                this.settings.darkmode = false;
            }
            this.saveCache();
        }

        openTab(tab) {
            if(tab != this.currentTab) {
                this.currentTab.classList.remove("activeui");
                document.getElementById(this.currentTab.getAttribute("target")).style.display = "none";
                this.currentTab = tab;
                this.currentTab.classList.add("activeui");
                document.getElementById(this.currentTab.getAttribute("target")).style.display = "block";
            }
        }



        addGUI() {
            let GUI = document.createElement("span");
            GUI.id = "botshud";
            let ext_src = document.getElementById("_opLogo").value;
            var htmlToInject = 
            `
            <div class="main">
                <div class="marker">
                    <p>OP-BOTS.COM</p>
                </div>

                <div class="main-box">


                    <div class="menubox">
                        <h1>OP</h1>
                        <h6>Main Tabs</h6>
                        <ul id="style-6">
                            <li class="tabincon1 activeui" id="maintab" target="server_statistic" onclick="server.GUI.openTab(this)">Statistic</li>
                            <li class="tabincon2" target="op_settings" onclick="server.GUI.openTab(this)">Settings</li>
                            <li class="tabincon3" target="op_keybinds" onclick="server.GUI.openTab(this)">Keybinds</li>
                            <li class="tabincon3" target="op_game_data" onclick="server.GUI.openTab(this)">Game Data</li>
                            <li class="tabincon3" target="op_private" onclick="server.GUI.openTab(this)">Private</li>
                        </ul>
                        <div class="gui_version">
                            <hr class="hline">
                            <p>GUI version 1.01</p>
                        </div>
                    </div>
                    <div class="contentbox">
                        <div class="icon-box">
                            <p class="icon1" id="darktoggle" style="background-image: url(${ext_src}icons/darkmode.png)"></p>
                            <!-- <p class="icon2"></p> -->
                        </div>
                        <hr class="hline">
                        <div class="content" id="style-5" style="height: 350px; overflow: auto;">
                        <div id="error_block" style="display: none">
                            <div class="alert-error" id="erralert">Extension/Client version mismatch. Please update extension</div>
                        </div>
                        <div id="server_statistic">
                            <div id="alert"></div>
                            <div style="width: 100%; display: flex;">
                                <div class="abilities">
                                    <p>Spawned Bots</p>
                                    <span id="spawned">0</span>
                                    <h6>Current spawned bots</h6>
                                </div>
                                <div class="abilities">
                                    <p>Maximum Bots</p>
                                    <span id="maxbots">0</span>
                                    <h6>Maximum of bots that can be spawned on a server.</h6>
                                </div>
                                <div class="abilities">
                                    <p>Remaining Time</p>
                                    <span id="timeleft">0H 0M 0S</span>
                                    <h6>Time before your plan expire</h6>
                                </div>
                            </div>
                            <div style="width: 100%; display: flex;">
                                <div class="abilities">
                                    <p>Bots AI</p>
                                    <span id="botsaistatus">Disabled</span>
                                    <h6>This mode will make bots collect mass until you disable it</h6>
                                </div>
                                <div class="abilities">
                                    <p>Virus Protection</p>
                                    <span id="virusprotectionstatus">Disabled</span>
                                    <h6>This mode will make bots destroy all viruses around your mouse/cell</h6>
                                </div>
                                <div class="abilities">
                                    <p>Follow Mode</p>
                                    <span id="followmode">Mouse</span>
                                    <h6>This is what bots following for</h6>
                                </div>
                            </div>
                            <div style="width: 100%; display: flex;">
                                <div class="abilities">
                                    <p>Launch Bots</p>
                                    <div class="keybinds-key" onclick="server.startOrStop()" style="height:10%;" id="startstopbots">Start</div>
                                    <h6>By clicking on this button you can start/stop bots.</h6>
                                </div>
                                <div class="abilities">
                                    <p>Session ID</p>
                                    <span id="sessionid">0</span>
                                    <h6>Your current session ID</h6>
                                </div>
                                <div class="abilities">
                                    <p>Server Status</p>
                                    <span id="serverstatus">Disconnected</span>
                                    <h6>Here you can see connection status</h6>
                                </div>
                            </div>
                            <div style="width: 100%; display: flex;">
                                <div class="abilities">
                                    <p>Server Version</p>
                                    <span id="serverbuild">0.0.0</span>
                                    <h6>Server build version</h6>
                                </div>
                            </div>
                        </div>
                        <div id="op_game_data">
                            <div style="width: 100%; display: flex;">
                                <div class="abilities" style="width: 800px">
                                    <p>Server IP</p>
                                    <span id="server_ip">0</span>
                                    <h6>Current server IP</h6>
                                </div>
                                <div class="abilities">
                                    <p>Server Players</p>
                                    <span id="server_players">0</span>
                                    <h6>Current server "spawned" players</h6>
                                </div>
                                <div class="abilities">
                                    <p>Biggest Players</p>
                                    <span id="server_mass_players">0</span>
                                    <h6>Players that have more mass than you</h6>
                                </div>
                                
                            </div>
                            <div style="width: 100%; display: flex;">
                                <div class="abilities">
                                    <p>Join to agar.io server</p>
                                    <div class="keybinds-key" onclick="server.joinAgarServer();" style="height:10%;">Join</div>
                                    <h6>By clicking on this button you will be able to connect to server if you have IP.</h6>
                                </div>
                            </div>
                        </div>
                        <div id="op_settings">
                            <div style="padding: 0px 0px 70px 60px;">
                                <input id="nick_op" class="form-control_op" placeholder="Your custom skin url" onchange="server.GUI.customSkinChange()" value="${this.settings.custom_skin}">
                            </div>
                            <div class="option" id="options_section">
                                
                            </div>
                        </div>
                        <div id="op_keybinds">
                            <div class="keybind" id="keybind_section">
                            </div>
                        </div>
                        <div id="op_private">
                            <div style="width: 100%; display: flex;">
                                <div class="abilities">
                                    <p>Your IP</p>
                                    <span id="yourip">0.0.0.0</span>
                                    <h6>Here is IP you connected from, you can use it to change IP on site if you have problems with your plan</h6>
                                </div>
                                <div class="abilities">
                                    <p>Discord Server</p>
                                    <div class="keybinds-key" onclick="window.open('https://discord.gg/op-community')" style="height:10%;">Join</div>
                                    <h6>This is the place where you can get help if you can't figure out something</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                    <div class="clearfix"></div>
                </div>
            </div>
            <div style="
                background: #00000096;
                position: fixed;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                backdrop-filter: blur(10px);
            " id="blurbackground">
            </div>
            `;

            GUI.innerHTML = htmlToInject;

            GUI.onload = function() {
                this.remove();
            };

            (document.body || document.getElementsByTagName("body")[0]).appendChild(GUI);

            this.currentTab = document.getElementById("maintab");

            document.getElementById("blurbackground").onclick = () => {
                this.toggleGui();
            }

            //target.server.addController();

        }

        toggleGui() {
            if(this.isVisisble) {
                document.getElementById("botshud").style.display = "none";
            } else {
                document.getElementById("botshud").style.display = "block";
            }
            this.isVisisble = !this.isVisisble;
        }

        errorNotify(message) {
            document.getElementById("error_block").style.display = "block";
            document.getElementById("erralert").innerHTML = message;
        }

    }

    target.server = new serverManager();

    target.inject = new inject();


    // minimap by mrsonicmaster
    class Minimap {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.init();
        }
        init() {
            this.createCanvas();
            requestAnimationFrame(this.drawUpdate.bind(this));
        }
        createCanvas() {
            if (!document.body) return setTimeout(this.createCanvas.bind(this), 100);
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext('2d');
            this.addCanvasCustomization();
            document.body.appendChild(this.canvas);
            console.log("canvas created");
        }
        addCanvasCustomization() {
            this.canvas.id = "Minimap";
            this.canvas.width = 200;
            this.canvas.height = 200;
            this.canvas.style.position = "absolute";
            this.canvas.style.border = '3px solid #444444';
            this.canvas.style.top = "75%";
            this.canvas.style.right = "2%";
            this.drawUpdate();
        }
        clearCanvas() {
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
        drawUpdate() {
            if (!this.ctx && !window.server.cfg.Minimap) return console.log(window.server.cfg.Minimap);
            this.clearCanvas();
            const cWidth = this.canvas.width;
            const cHeight = this.canvas.height;
            this.ctx.strokeStyle = "#444444";
            this.ctx.strokeWidth = 1;
            this.ctx.beginPath();
            this.ctx.globalAlpha = 0.9;
            this.ctx.rect(0, 0, cWidth, cHeight);
            this.ctx.fillStyle = "black";
            this.ctx.fill();
            var sectorCount = 5;
            var w = cWidth / sectorCount;
            var h = cHeight / sectorCount;
            this.ctx.fillStyle = "#808080";
            this.ctx.textBaseline = "middle";
            this.ctx.textAlign = "center";
            this.ctx.globalAlpha = 0.7;
            this.ctx.font = (w / 3 | 0) + "px Ubuntu";
            for (var y = 0; y < sectorCount; ++y) {
                for (var x = 0; x < sectorCount; ++x) {
                    var str = String.fromCharCode(65+y) + (x + 1);
                    var dx = (x + 0.5) * w;
                    var dy = (y + 0.5) * h;
                    this.ctx.fillText(str, dx, dy);
                }
            }
            this.ctx.restore();
            this.ctx.save();
            //if (window.server.cfg.drawBotsOnMinimap && window.bots.length > 0) this.drawBotUpdate();
            this.drawAgarPlayers();
            this.drawCellUpdate(window.server.cellX, window.server.cellY, "#00FFFF");
            requestAnimationFrame(this.drawUpdate.bind(this));
        }
        drawCellUpdate(x, y, color) {
            const transX = (7071 + x) / 14142 * this.canvas.height;
            const transY = (7071 + y) / 14142 * this.canvas.width;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(transX, transY, 5, 0, 2 * Math.PI);
            this.ctx.fill();
            const transMoveX = (7071 + ((window.clientXXX - window.innerWidth / 2) / window.server.zoomValue) + window.server.cellX) / 14142 * this.canvas.height;
            const transMoveY = (7071 + ((window.clientYYY - window.innerHeight / 2) / window.server.zoomValue) + window.server.cellY) / 14142 * this.canvas.width;
            this.ctx.globalAlpha = 1.0;
            this.ctx.fillStyle = "#FF0000";
            this.ctx.beginPath();
            this.ctx.arc(transMoveX, transMoveY, 4, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        drawBotUpdate() {
            for (const bot of window.bots) {
                if (bot.y !== 0 && bot.x !== 0) {
                    this.ctx.globalAlpha = 0.9;
                    const botTransX = (7071 + bot.x) / 14142 * this.canvas.height;
                    const botTransY = (7071 + bot.y) / 14142 * this.canvas.width;
                    this.ctx.fillStyle = "#FFFF99";
                    this.ctx.beginPath();
                    this.ctx.arc(botTransX, botTransY, 2, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
        }
        drawAgarPlayers() {
            for (const bot of window.agarProto.lb) {
                if (bot.y !== 0 && bot.x !== 0) {
                    this.ctx.globalAlpha = 0.9;
                    const botTransX = (7071 + bot.x) / 14142 * this.canvas.height;
                    const botTransY = (7071 + bot.y) / 14142 * this.canvas.width;
                    this.ctx.fillStyle = "#46d246";
                    this.ctx.beginPath();
                    this.ctx.arc(botTransX, botTransY, 6, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
        }
    }
    window.addEventListener("mousemove", event => {
        window.clientXXX = event.clientX;
        window.clientYYY = event.clientY;
    });
    class agarProto {
        constructor() {
            this.ws = null;
            this.dKey = 0;
            this.clientKey = 0;
            this.players = 0;
            this.lb = [];
            setInterval(() => {
                if(this.lb[0] && this.lb.length > 0) {
                    window.server.sendCheck(this.lb[0].x, this.lb[0].y);
                } else {
                    let pos = server.getMousePos();
                    window.server.sendCheck(server.cellX - ((window.server.mapLocation.minx + window.server.mapLocation.maxx) / 2), server.cellY - ((window.server.mapLocation.miny + window.server.mapLocation.maxy) / 2));
                }
                if(this.lb.length <= 1) this.lb = [];
                document.getElementById("server_mass_players").innerHTML = this.lb.length;
            }, 500);
        }
        xor(buf, xorKey) {
            const newBuf = new DataView(new ArrayBuffer(buf.byteLength));
            for (let i = 0; i < buf.byteLength; i++) newBuf.setUint8(i, buf.getUint8(i) ^ (xorKey >>> ((i % 4) * 8)) & 255);
            return newBuf;
        }
        overWrite(ws) {
            this.ws = ws;
            this.dKey = 0;
            setTimeout(() => {
                this.ws._send = this.ws.send;
                this.ws.send = function() {
                    this.ws._send(arguments[0]);
                    let msg = new DataView(new Uint8Array(arguments[0]).buffer);
                    if(msg.getUint8(0) == 255 && !this.clientKey) {
                        this.clientKey = msg.getUint32(1, true);
                    }
                }.bind(this);
                this.ws._msgHandler = this.ws.onmessage;
                this.ws.onmessage = function(msg) {
                    this.ws._msgHandler(msg);
                    msg = new DataView(msg.data);
                    this.dKey ? msg = this.xor(msg, this.dKey ^ this.clientKey) : "";
                    let offset = 0;
                    let opcode = msg.getUint8(offset++);
                    switch(opcode) {
                        case 53:
                        case 54: {
                            this.players = 0;
                            for (let i = 0; offset < msg.byteLength;) {
                                let flag = msg.getUint8(offset++);
                                if (flag & 2) {
                                    let x, d = '';
                                    while ((x = msg.getUint8(offset++)) != 0) {
                                        d += String.fromCharCode(x);
                                    }
                                    this.players++;
                                }
                                if (flag & 4) offset += 4;
                                if (flag & 16) this.friendsCounter++;
                            }
                            document.getElementById("server_players").innerHTML = this.players;
                            document.getElementById("server_ip").innerHTML = server.server;
                        } break;
                        case 69: {
                            this.lb = [];
                            let record = msg.getUint16(offset, true);
                            offset += 2;
                            for(let i = 0; i < record; i++) {
                                let x = msg.getInt32(offset, true);
                                offset += 4;
                                let y = msg.getInt32(offset, true);
                                offset += 4;
                                let size = msg.getInt32(offset, true);
                                offset += 5;
                                let mass = ~~(Math.sqrt(100 * size));
                                this.lb.push({
                                    x: x - ((window.server.mapLocation.minx + window.server.mapLocation.maxx) / 2),
                                    y: y - ((window.server.mapLocation.miny + window.server.mapLocation.maxy) / 2),
                                    size: size,
                                    mass: mass
                                });
                            }
                            window.server.sendCheck(this.lb[0].x, this.lb[0].y);
                        } break;
                        case 241: {
                            this.dKey = msg.getInt32(offset, true);
                        } break;
                    }
                }.bind(this);
            }, 0);
        }
    }

    if(window.location.origin.includes("agar.io")) {
        window.agarProto = new agarProto()
        // setTimeout(() => {
        //      window.minimap = new Minimap();
        // }, 5000);
    }

    console.log("SERVER STARTED")

})(window);