

function showErrorMessage(error) {
    console.log(error);
    if (error.response && error.response.data.message) {
        document.getElementById('message-list').innerHTML += `<p id="err">${error.response.data.message}</p>`;
    } else {
        document.getElementById('message-list').innerHTML += `<p id="err">Something went wrong,please try again</p>`;
    }
    scrollUpdate();
    document.addEventListener('click', () => document.getElementById('err').remove(), { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
    scrollUpdate();
    const token = localStorage.getItem('token');
    if (!token) {
        // window.location.href = "/login/login.html";
    }
});

async function sendMessage(e) {
    e.preventDefault();
    try {
        const text = e.target.text.value;
        if (!text) {
            return
        }
        const token = localStorage.getItem('token');
        const response = await axios.post('/message', {text}, { headers: { "Authorization": token } });
        if (response.status === 201) {
            document.getElementById('message-list').innerHTML += `<li>You : ${text}</li>`
            e.target.text.value = "";
        }
        scrollUpdate();
  
    } catch (error) {
        showErrorMessage(error);
    }
}

function scrollUpdate() {
    const div = document.getElementById('chatbox');
    div.scrollTop = div.scrollHeight;
}