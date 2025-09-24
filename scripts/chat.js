const Chat = (() => {
/******************
* CHAT SETUP      *
******************/
    // constants info for generating response/whatever
    const helperInfo = {
        name: 'Porygon',
        icon: 'porygon.png',
        color: '#ffe6e6ff'
    };
    const replies = [
        "It is certain",
        "Reply hazy, try again",
        "Don’t count on it",
        "It is decidedly so",
        "Ask again later",
        "My reply is no",
        "Without a doubt",
        "Better not tell you now",
        "My sources say no",
        "Yes definitely",
        "Cannot predict now",
        "Outlook not so good",
        "You may rely on it",
        "Concentrate and ask again",
        "Very doubtful",
        "As I see it, yes",
        "Most likely",
        "Outlook good",
        "Yes",
        "Signs point to yes"
    ];
    // START OF HTML STUFF 
    const body = document.querySelector('body');
    // open chat button
    const toggleBtn = document.createElement('button');
    toggleBtn.setAttribute('class', 'chat-toggle');
    toggleBtn.innerText = '💬';
    body.append(toggleBtn);
    // header
    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "chat-wrapper");
    body.append(wrapper);

    const header = document.createElement("div");
    header.setAttribute("class", "chat-header");
    wrapper.append(header);

    const infobar = document.createElement("div");
    infobar.setAttribute("class", "infobar");
    infobar.innerHTML = '<p>porychat</p>'
    header.append(infobar);

    const closeBtn = document.createElement("div");
    closeBtn.setAttribute("class", "chat-close-button");
    closeBtn.innerText = '×';
    header.append(closeBtn);
    // main content
    const main = document.createElement("div");
    main.setAttribute("class", "chat-main");
    wrapper.append(main);

    const container = document.createElement("div");
    container.setAttribute("class", "messages-container");
    main.append(container);
    // input form
    const form = document.createElement('form');
    form.setAttribute('class', 'message-input-container');
    main.append(form);

    const innercontainer = document.createElement('div');
    innercontainer.setAttribute('class', 'inner-message-container');
    form.append(innercontainer);

    const messageinput = document.createElement('div');
    messageinput.setAttribute('class', 'message-input');
    innercontainer.append(messageinput);

    const forminput = document.createElement('input');
    forminput.id = "your-message-here";
    forminput.className = "text-input";
    forminput.type = "text";
    forminput.name = "message";
    forminput.placeholder = "Type message here";
    forminput.maxLength = 140;
    forminput.autocomplete = "off";
    messageinput.append(forminput);

    const sendBtn = document.createElement('input');
    sendBtn.setAttribute('class', 'send-button');
    sendBtn.setAttribute('type', 'button');
    sendBtn.value = '➤';
    form.append(sendBtn);
    //
    const footer = document.createElement("div");
    footer.setAttribute("class", "chat-footer");
    wrapper.append(footer);
/******************
* Event Listeners *
******************/
    // toggle chat on
    toggleBtn.addEventListener('click', () => {
        // slide button down
        toggleBtn.classList.add('hide');

        // slide chat up
        setTimeout(() => {
            wrapper.classList.add('open');
        }, 400);
    });
    // toggle chat off
    closeBtn.addEventListener('click', () => {
        wrapper.classList.remove('open');
        setTimeout(() => {
            toggleBtn.classList.remove('hide'); // slide button back up
        }, 500);
    });

    // send message
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // prevent page reload
        userMessage();
    });

    sendBtn.addEventListener('click', (e) => {
        userMessage();
    });

    // intro message
    toggleBtn.addEventListener('click', () => {
        NewMessage('Please request assistance.', 'Porygon', '#ffe6e6ff', 'porygon.png');
    }, { once: true });
/************
* Messaging *
************/
    // create and display element for a new message
    const NewMessage = (a, b = '', c, d) => { // message, sender, color, icon
        const message = document.createElement("div");
        message.setAttribute("class", "chat-message");

        const line = document.createElement("div");
        line.setAttribute("class", "message-line");
        message.append(line);

        const sender = document.createElement("div");
        sender.setAttribute("class", "chat-sender");
        sender.innerHTML = `<p>${b}</p>`
        message.append(sender);

        // sender icon , left out if user message
        const icon = document.createElement("div");
        icon.setAttribute("class", "sender-icon");
        const iconimg = document.createElement("img");
        iconimg.setAttribute("alt", "icon");
        iconimg.style = "height:100%;width:100%;border-radius:50%";
        if (d != null) {
            iconimg.src = `images/${d}`;
            line.append(icon);
            icon.append(iconimg);
        }

        const content = document.createElement("div");
        content.setAttribute("class", "message-content");
        content.innerHTML = `<p>${a}</p>`;
        content.style.background = (c) ? c : "#d3d3d3ff";
        line.append(content);

        //
        container.prepend(message);
        container.scrollTop = container.scrollHeight;
        return message;
    }
    // generate and return message from input
    // ai = magic 8 ball for now
    async function getAiResponse(input) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        let index = Math.floor(Math.random() * replies.length);
        return replies[index];
    }

    // sending the message
    async function aiMessage(input) {
        // create message element
        const msg = NewMessage("", helperInfo.name, helperInfo.color, helperInfo.icon);
        // display temporary wait
        const img = document.createElement("img");
        img.src = "images/load.gif";
        img.style = "height:40.25px;padding:10px 0px;box-sizing:border-box;";
        msg.querySelector('.message-line .message-content p').remove();
        msg.querySelector('.message-line .message-content').append(img);
        // replace wait with the real message, attempting to make it less jarring?
        let message = await getAiResponse(input);
        img.remove();
        // send msg
        const p = document.createElement('p');
        msg.querySelector('.message-line .message-content').append(p);
        let incompleteMessage = "";
        for (let char of message) {
            incompleteMessage += char;
            p.innerText = incompleteMessage;
            await new Promise(resolve => setTimeout(resolve, 25));
        }
    }

    async function userMessage() {
        const msg = forminput.value;
        if (!/[a-zA-Z0-9]/.test(msg)) return; // check for at least 1 desirable character

        const ele = NewMessage(msg);
        ele.querySelector('.message-line').style.justifyContent = 'flex-end'; // place at right side of chatbox

        forminput.value = ""; // clear input

        // disable ui to allow ai to respond
        Array.from(form.elements).forEach(el => el.disabled = true);

        // ai response
        await aiMessage();

        // re-enable input
        Array.from(form.elements).forEach(el => el.disabled = false);
    }
/************
*    CSS    *
************/
    const style = document.createElement("style");
    style.textContent = `.chat-toggle {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #ff0040;
    color: #fff;
    font-size: 24px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    transition: transform 0.4s ease, opacity 0.4s ease;
}

.chat-toggle.hide {
    transform: translateY(100px);
    opacity: 0;
}

.chat-toggle:hover {
    background: #9c193a;
}

.chat-wrapper {
    position: fixed;
    bottom: -700px;
    right: 20px;
    width: 400px;
    height: 600px;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    font-family: sans-serif;
    transition: bottom 0.5s ease;
}

.chat-wrapper.open {
    bottom: 20px;
}

.chat-header {
    background: #ff0040;
    color: #fff;
    height: 40px;
    font-weight: bold;
    font-size: 14px;
    font-family: sans-serif;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 15px;
}

.chat-footer {
    height: 20px;
    padding: 0;
    display: flex;
    text-align: center;
    justify-content: center;
}

.chat-close-button {
    height: 30px;
    width: 30px;
    border-radius: 50%;
    background: transparent;
    border: none;
    cursor: pointer;
    color: white;
    font-weight: bold;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

/* Messages */
.messages-container {
    flex: 1;
    display: flex;
    flex-direction: column-reverse;
    padding: 10px;
    gap: 6px;
    overflow-y: auto;
    overflow-x: hidden;
    background: #f9f9f9;
}

/* Single message */
.chat-message {
    display: flex;
    flex-direction: column;
}

.message-line {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 100%;
}

.sender-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #ddd;
}

.message-content {
    background: #e6f0ff;
    padding: 0px 16px;
    border-radius: 15px;
    max-width: 75%;
    font-size: 14px;
}

.chat-sender p {
    margin: 0;
    padding: 5px;
    text-indent: 48px;
    font-size: 10px;
    color: #4e4e4e
}

/* Input bar */
.message-input-container {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 8px;
    border-top: 1px solid #ddd;
    background: #fff;
}

.inner-message-container {
    flex: 1;
}

.message-input {
    display: flex;
    justify-content: flex-end;
    flex: 1;
}

.text-input {
    flex: 1;
    resize: none;
    height: 32px;
    padding: 6px 12px;
    font-family: 'Arial';
    font-size: 14px;
    line-height: 1.25;
    border: 1px solid #ccc;
    border-radius: 15px;
    overflow: auto;
    box-sizing: border-box;
    outline: none;
}

.send-button {
    margin-left: 8px;
    background: #ff0040;
    color: #fff;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
}

.send-button:disabled {
    background: #aaa;
    cursor: default;
}

/* temp - doesnt really look great */
@media (orientation: portrait) {
    .chat-wrapper {
        bottom: -110vh;
        width: 95vw;
        height: 95vh;
    }
}
`;
    document.head.appendChild(style);
})();