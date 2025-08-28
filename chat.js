// message elements
const msgTemplate = document.getElementById('message-template')
const container = document.getElementById('messages-go-here');
// input related
const textarea = document.querySelector('.text-input');
const sendBtn = document.querySelector('.send-button');
// toggling chat
const toggleBtn = document.querySelector('.chat-toggle');
const chatBox = document.querySelector('.chat-wrapper');

// info for generating response/whatever
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
]

/******************
* Event Listeners *
******************/
// toggle chat on
toggleBtn.addEventListener('click', () => {
    // slide button down
    toggleBtn.classList.add('hide');

    // slide chat up
    setTimeout(() => {
        chatBox.classList.add('open');
    }, 400);
});
// toggle chat off
const toggleOffBtn = document.querySelector('.chat-close-button');
toggleOffBtn.addEventListener('click', () => {
    chatBox.classList.remove('open');
    setTimeout(() => {
        toggleBtn.classList.remove('hide'); // slide button back up
    }, 500);
});

// send message
const form = document.querySelector('.message-input-container');
form.addEventListener('submit', (e) => {
    e.preventDefault(); // prevent page reload
    userMessage();
});

// intro message
toggleBtn.addEventListener('click', () => {
    newMessage('Please request assistance.', 'Porygon', '#ffe6e6ff', 'porygon.png');
}, { once: true });

/*******************
 * Event Listeners *
 ******************/
// create and display element for a new message
const newMessage = (message, sender = '', color, icon) => {
    const ele = msgTemplate.content.cloneNode(true).querySelector('.chat-message');     // create clone
    // sender
    ele.querySelector('.chat-sender p').innerText = sender;
    // content
    ele.querySelector('.message-line .message-content p').innerText = message;
    // color
    ele.querySelector('.message-line .message-content').style.background = (color) ? color : "#d3d3d3ff";
    // icon
    if (icon != null)
        ele.querySelector('.message-line .sender-icon img').src = `images/${icon}`;
    else
        ele.querySelector('.message-line .sender-icon').remove();
    // add message to chatbox and scroll to bottom
    container.prepend(ele);
    container.scrollTop = container.scrollHeight;
    // return created message element
    return ele;
}

/************
* Messaging *
************/
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
    const msg = newMessage("", helperInfo.name, helperInfo.color, helperInfo.icon);
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
    const msg = document.getElementById("your-message-here").value;
    if (!/[a-zA-Z0-9]/.test(msg)) return; // check for at least 1 desirable character

    const ele = newMessage(msg);
    ele.querySelector('.message-line').style.justifyContent = 'flex-end'; // place at right side of chatbox

    document.getElementById("your-message-here").value = ""; // clear input

    // disable ui to allow ai to respond
    Array.from(form.elements).forEach(el => el.disabled = true);

    // ai response
    await aiMessage();

    // re-enable input
    Array.from(form.elements).forEach(el => el.disabled = false);
}