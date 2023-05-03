let username;
let localMessages;
let lastMeassageId = 0;

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showErrorMessage(error) {
    const err = document.getElementById('err');
    if (err) {
        err.remove();
    }
    console.log(error);
    if (error.response && error.response.data.message) {
        document.getElementById('message-list').innerHTML += `<p id="err">${error.response.data.message}</p>`;
    } else {
        document.getElementById('message-list').innerHTML += `<p id="err">Something went wrong,please try again</p>`;
    }
    scrollUpdate();
    document.addEventListener('click', () => document.getElementById('err').remove(), { once: true });
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // window.location.href = "/login/login.html";
    }
    username = parseJwt(token).name;
    localMessages = JSON.parse(localStorage.getItem('messages'));
    if (localMessages) {
        for (msg of localMessages) {
            document.getElementById('message-list').innerHTML += msg.username === username ? `<li>You : ${msg.text}</li>` : `<li>${msg.username} : ${msg.text}</li>`;
        }
        lastMeassageId = localMessages[localMessages.length - 1].id;
    } else {
        localMessages = [];
    }
    scrollUpdate();

    setInterval(async () => {
        try {
            const response = await axios.get(`/message/?lastMessage=${lastMeassageId}`, { headers: { "Authorization": token } });
            if (response.status === 200) {
                const messages = response.data;
                if (messages.length > 0) {
                    for (msg of messages) {
                        console.log(msg);
                        localMessages.push(msg);
                        document.getElementById('message-list').innerHTML += msg.username === username ? `<li>You : ${msg.text}</li>` : `<li>${msg.username} : ${msg.text}</li>`;
                    }
                    scrollUpdate();
                    if (localMessages.length>200){
                        localMessages=localMessages.slice(-200);
                    }
                    lastMeassageId = localMessages[localMessages.length - 1].id;
                    localStorage.setItem('messages', JSON.stringify(localMessages));
                }
            }
        }
        catch (error) {
            showErrorMessage(error);
        }
    }, 1000);
});

async function sendMessage(e) {
    e.preventDefault();
    try {
        const text = e.target.text.value;
        if (!text) {
            return
        }
        const token = localStorage.getItem('token');
        const response = await axios.post('/message', { text }, { headers: { "Authorization": token } });
        if (response.status === 201) {
            e.target.text.value = "";
        }
    } 
    catch (error) {
        showErrorMessage(error);
    }
}

function scrollUpdate() {
    const div = document.getElementById('chatbox');
    div.scrollTop = div.scrollHeight;
}