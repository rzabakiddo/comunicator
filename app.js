function error(title, content) {
    let error = document.getElementById('error');
    document.getElementById('erT').innerText = title
    document.getElementById('erC').innerText = content
    error.classList.remove('show');
    void error.offsetWidth;
    error.classList.add('show');
}

let wserv = new WebSocket('ws://localhost:3002')

wserv.onclose = function () {
    wserv = new WebSocket('ws://localhost:3002')
}

onload = function () {
    downloadChats()
}
let talkingTo = "";

function clickChat(element) {
    let cns = element.getElementsByClassName('name')
    if (cns != undefined) {
        wserv.send("7"+auth()+"|"+cns[0].innerText);
        talkingTo = cns[0].innerText;
        let text = cns[0].innerText;
        readMessages(20,text);
        document.getElementById('status').style.opacity = '0';
        getStatus(text);
        document.getElementById('message').placeholder = 'Message ' + text;
        document.getElementById('user').innerText = text;
        document.getElementById('user').innerHTML += '<a>&nbsp;</a>' + '<img id="status" width="35vw" height="35vw" src="online.png">';
        document.getElementById('scrollPane').innerHTML = '';
    }
}

function auth() {
    return localStorage.getItem("piwo_username") + "|" + localStorage.getItem("piwo_password");
}

function downloadChats() {
    wserv.send("9" + auth());
}

function updateStatus(nick, status) {
    if (document.getElementById('user').innerText == nick + " ") {
        document.getElementById('status').src = status + ".png"
        document.getElementById('status').removeAttribute('style');
        document.getElementById('status').style.opacity = '1'
    }
}

wserv.onmessage = function (data) {
    let message = data.data;
    if (message.startsWith('sendInfo')) {
        wserv.send('4' + auth() + "&|&" + message.split("&|&")[1])
    }
    if (message === "doAuth") {
        wserv.send("8|" + auth());
    }
    if (message.startsWith("error")) {
        error("Error", message.split("|")[1]);
    }
    if (message.startsWith("status")) {
        let status = message.split("|");
        updateStatus(status[1], status[2])
    }
    if(message.startsWith("statuscode")) {
        let status = message.split("|");
        localStorage.setItem("currentKey",status[1]);
    }
    if (message.startsWith("chat")) {
        let data = message.split("|");
        let element = document.getElementById('scroll');
        let text = "";
        text += '<div class="chat" onclick="clickChat(this)" data-chatid="' + data[1] + '">'
        text += '<img class="pfp" src="pfp.jpg">'
        text += '<h3 class="name">' + data[2] + '</h3>'
        text += '<h4 class="status">Pije piwo</h4>'
        text += '</div>'
        element.innerHTML += text;
    }
    if (message.startsWith("newchat")) {
        let data = message.split("|");
        let element = document.getElementById('scroll');
        let text = "";
        text += '<div class="chat" onclick="clickChat(this)" data-chatid="' + data[2] + '">'
        text += '<img class="pfp" src="pfp.jpg">'
        text += '<h3 class="name">' + data[1] + '</h3>'
        text += '<h4 class="status">Pije piwo</h4>'
        text += '</div>'
        element.innerHTML += text;
    }
    if(message.startsWith("message")) {
        let data = message.split("|");
        newMessage(data[1],data[2]);
    }
    if (message === '5') {
        alert("authorization failed");
    }
}
onkeydown = function (event) {
    if (event.key === 'Enter' && talkingTo != "") {
        if (document.getElementById('message').value.length > 0) {
            sendChatMessage(talkingTo, document.getElementById('message').value)
            document.getElementById('message').value = '';
        }
    }
}

function encrypt(text,key) {
    var encrypted = CryptoJS.AES.encrypt(
        text,
        key
    );
    return encrypted;
}
function decrypt(text,key) {
    var decrypted = CryptoJS.AES.decrypt(
        text,
        key
    ).toString(CryptoJS.enc.Utf8);
    return decrypted
}

function readMessages(bound,name) {
    wserv.send('A'+auth()+"|"+bound+"|"+name)
}
function newMessage(name, message, messageID) {
    if(name!=talkingTo&&name!=localStorage.getItem("piwo_username"))
        return;
    let element = document.getElementById('scrollPane');
    let text = "";
    text += '<div class="message" data-messageid="'+messageID+'">'
    text += '<div class="contentHolder">'
    text += '<img class="messProf" src="pfp.jpg">'
    if(name=='SmakoszPiwa')
        text += '<h3 class="messNameDev">'+name+'</h3>'
    else
        text += '<h3 class="messName">'+name+'</h3>'
    text += '<h3 class="messageContent">'+decrypt(message,localStorage.getItem("currentKey"))+'</h3>'
    text += '</div>'
    text += '</div>'
    element.innerHTML+=text;
}

function getStatus(nick) {
    wserv.send("6" + auth() + "|" + nick)
}

function sendChatMessage(to, message) {
    wserv.send('3' + auth() + "|" + to + "|" + encrypt(message,localStorage.getItem("currentKey")))
}

function sendMesage() {
    wserv.send('2' + localStorage.getItem("piwo_username") + "|" + document.getElementById('newChat').value + "|" + localStorage.getItem("piwo_password"))
}