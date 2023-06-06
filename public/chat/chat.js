var modalOverlay = document.getElementById('modal-overlay');
var openGroupName = document.getElementById('open-group-name');
var closeFormBtn = document.getElementById('close-form-btn');
var leftMenu = document.getElementById('left-menu');
var leftDropdown = document.getElementById('left-dropdown');

const newGroupForm = document.getElementById('new-group-form');
const newGroupCreated = document.getElementById('new-group-created');
const groupCreatedMessage = document.getElementById('group-created-message');
const closeGroupCreatedMessage = document.getElementById('close-group-created-message');
const newGroupName = document.getElementById('new-group-name');

const modalOverlay1 = document.getElementById('modal-overlay-1');
const openAddmembers = document.getElementById('open-add-member');
const closeFormBtn1 = document.getElementById('close-form-btn-1');
const rightMenu = document.getElementById('right-menu');
const rightDropdown = document.getElementById('right-dropdown');

const memberSearchBtn = document.getElementById('member-search-btn');
const searchName = document.getElementById('search-name');
const memberSearchDiv = document.getElementById('member-search-div');
const searchedMemberList = document.getElementById('searched-member-list');
const searchButtonDiv = document.getElementById('search-button-div');
const OpenViewMembers = document.getElementById('open-view-members');

const displayMessage = document.getElementById('message-list');

let groupList = localStorage.getItem('groupList') ? JSON.parse(localStorage.getItem('groupList')) : [];
let groupDetails = localStorage.getItem('groupDetails') ? JSON.parse(localStorage.getItem('groupDetails')) : {};
let groupMessages = localStorage.getItem('groupMessages') ? JSON.parse(localStorage.getItem('groupMessages')) : {};
let currentChatId;
let currentChatName;

const token = localStorage.getItem('token');
const parsedToken = token ? parseJwt(token) : null;

console.log(groupList, groupDetails, groupMessages);


function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!token) {
            window.location.href = "/login/login.html";
        }
        document.getElementById('chatapp-user').textContent = parsedToken.name;
        // Get the new groups for the user   
        const response = await axios.get(`/group/new-groups/${parsedToken.userId}`, { params: { groupList }, headers: { "Authorization": token } });
        const newGroupList = response.data

        // Add the new groups to the current grouplist
        if (newGroupList.length > 0) {
            for (let group of newGroupList) {
                const { groupId, groupname, isAdmin } = group;
                groupList.push(groupId);
                groupDetails[groupId] = { groupname, isAdmin, lastMessageId: group.joinedMessageId - 1 };
                groupMessages[groupId] = [];
                localStorage.setItem('groupList', JSON.stringify(groupList));
                localStorage.setItem('groupDetails', JSON.stringify(groupDetails));
                localStorage.setItem('groupMessages', JSON.stringify(groupMessages));
            }
        }
        //Show the groups on screen on leftside
        if (groupList.length > 0) {
            const chatlist = document.getElementById('chatList');
            for (let groupId in groupDetails) {
                const groupname = groupDetails[groupId].groupname;
                chatlist.innerHTML += `<li onclick="openCurrentChat(event,'${groupname}',${groupId})"><p>${groupname}</p></li>`;
            }
            // Get the new messages for all the groups through the last lastMessageId of each group;
            const groupData = groupList.map(groupId => {
                return { groupId, lastMessageId: groupDetails[groupId].lastMessageId }
            })
            const response = await axios.get(`/message/new`, { params: { groupData }, headers: { "Authorization": token } });
            const newMessages = response.data;
            if (newMessages.length > 0) {
                storeMessages(newMessages);
            }
        }
        socket.emit("join-multiple-groups", groupList);
    }
    catch (error) {
        console.log(error);
    }
});


let socket = io('http://localhost:2000', { query: { userId: parsedToken.userId } });

socket.on('receive-message', (message) => {
    storeMessages([message]);
    if (currentChatId === message.groupId) {
        displayMessageOnScreen([message]);
    }
})

socket.on('new-member-added', (message, memberId, groupname) => {
    if (parsedToken.userId === +memberId) {
        document.getElementById('chatList').innerHTML += `<li onclick="openCurrentChat(event,'${groupname}',${message.groupId})"><p>${groupname}</p></li>`;
        groupDetails[message.groupId] = { groupname, isAdmin: false, lastMessageId: message.id };
        localStorage.setItem('groupDetails', JSON.stringify(groupDetails));
        groupMessages[message.groupId] = [];
        message.text = `${message.username} added you to the group`;
    }
    storeMessages([message]);
    if (currentChatId === message.groupId) {
        displayMessageOnScreen([message]);
    }
})

leftMenu.addEventListener('click', () => {
    if (leftDropdown.style.display === "block") {
        leftMenu.classList.remove('active-menu');
        leftDropdown.style.display = "none";
        return;
    }
    leftMenu.classList.add('active-menu');
    leftDropdown.style.display = "block";
})

openGroupName.addEventListener('click', function () {
    leftMenu.classList.remove('active-menu');
    leftDropdown.style.display = "none";
    modalOverlay.classList.add('show');
});

closeFormBtn.addEventListener('click', function () {
    modalOverlay.classList.remove('show');
    newGroupName.value = ""
});

closeGroupCreatedMessage.addEventListener('click', function () {
    modalOverlay.classList.remove('show');
    newGroupForm.style.display = "block";
    newGroupCreated.style.display = "none";
    newGroupName.value = "";
});

modalOverlay.addEventListener('click', function (event) {
    if (event.target === modalOverlay) {
        modalOverlay.classList.remove('show');
        newGroupForm.style.display = "block";
        newGroupCreated.style.display = "none";
        newGroupName.value = "";
    }
});

async function createNewGroup(e) {
    e.preventDefault();
    try {
        const name = e.target.groupname.value;
        const response = await axios.post('/group/create', { name }, { headers: { Authorization: token } })
        const { message } = response.data;
        socket.emit("join-group", groupId);
        socket.emit('send-message', message);

        message.text = `You created this group`;
        groupList.push(groupId);
        localStorage.setItem('groupList', JSON.stringify(groupList));
        groupDetails[groupId] = { groupname: name, isAdmin: true, lastMessageId: message.id };
        localStorage.setItem('groupDetails', JSON.stringify(groupDetails));
        groupMessages[groupId] = [message];
        localStorage.setItem('messageList', JSON.stringify(messageList));
        groupCreatedMessage.innerHTML = `${groupname} group created successfully`;
        newGroupForm.style.display = "none";
        newGroupCreated.style.display = "block";
        document.getElementById('current-chat').innerHTML = `${groupname}`;
        document.getElementById('chatList').innerHTML += `<li onclick="openCurrentChat(event,'${groupname}',${groupId})"><p>${groupname}</p></li>`;
        document.getElementById('chatList').lastElementChild.click();
    } catch (error) {
        console.log(error);
    }
}

rightMenu.addEventListener('click', () => {
    if (rightDropdown.style.display === "block") {
        rightMenu.classList.remove('active-menu');
        rightDropdown.style.display = "none";
        return;
    }
    rightMenu.classList.add('active-menu');
    rightDropdown.style.display = "block";
})

OpenViewMembers.addEventListener('click', async () => {
    rightMenu.classList.remove('active-menu');
    rightDropdown.style.display = "none";
    searchButtonDiv.classList.add('hide');
    modalOverlay1.classList.add('show');
    memberSearchDiv.style.display = "block";
    try {
        const response = await axios.get(`/group/members/${currentChatId}`, { headers: { Authorization: token } });
        for (let member of response.data) {
            searchedMemberList.innerHTML +=
                `<li>${member.user.username}</li>`;
        }
    }
    catch (error) {
        memberSearchDiv.style.display = "block";
        searchedMemberList.innerHTML = 'Something went wrong';
        console.log(error);
    }
});

openAddmembers.addEventListener('click', () => {
    rightMenu.classList.remove('active-menu');
    rightDropdown.style.display = "none";
    memberSearchDiv.style.dispay = "block";
    modalOverlay1.classList.add('show');
    searchButtonDiv.classList.add('show');
});

memberSearchBtn.addEventListener('click', async () => {
    try {
        const search = searchName.value;
        const response = await Promise.all([
            axios.get(`/group/search-user?search=${search}`, { headers: { Authorization: token } }),
            axios.get(`/group/members/${currentChatId}`, { headers: { Authorization: token } })
        ]);
        const groupMembersList = response[1].data;
        memberSearchDiv.style.display = "block";
        searchedMemberList.innerHTML = "";
        const list = response[0].data.filter(user => {
            return !groupMembersList.some(member => member.userId === user.id);
        })
        if (list.length > 0) {
            for (let user of list) {
                searchedMemberList.innerHTML +=
                    `<li>${user.username} <button onclick="addUserToGroup('${user.id}','${user.username}','${currentChatId}')">Add</button></li>`
            }
        } else {
            searchedMemberList.innerHTML = 'No results';
        }
    } catch (error) {
        memberSearchDiv.style.display = "block";
        searchedMemberList.innerHTML = 'Something went wrong';
        console.log(error);
    }
})

closeFormBtn1.addEventListener('click', function () {
    modalOverlay1.classList.remove('show');
    memberSearchDiv.style.display = "none";
    searchedMemberList.innerHTML = "";
    searchName.value = "";
});

modalOverlay1.addEventListener('click', function (event) {
    if (event.target === modalOverlay1) {
        modalOverlay1.classList.remove('show');
        memberSearchDiv.style.display = "none";
        searchedMemberList.innerHTML = "";
        searchName.value = "";
    }
});

async function addUserToGroup(memberId, membername, groupId) {
    try {
        const message = await axios.post('/group/add-user', { memberId, groupId }, { headers: { Authorization: token } });
        socket.emit('add-to-group', memberId, currentChatName, message.data);
        searchedMemberList.innerHTML+=`${membername} successfully to the group`;
        message.data.text = `You added ${membername} to the group`;
        storeMessages([message.data]);
        displayMessageOnScreen([message.data]);
    }
    catch (error) {
        console.log(error);
    }
}

async function sendMessage(e) {
    e.preventDefault();
    try {
        const text = e.target.text.value;
        if (!text) {
            return
        }
        const groupId = currentChatId;
        const newMessage = await axios.post('/message/save', { text, isUpdate: false, groupId }, { headers: { "Authorization": token } });
        if (newMessage.status === 201) {
            e.target.text.value = "";
            socket.emit('send-message', newMessage.data);
            storeMessages([newMessage.data]);
            displayMessageOnScreen([newMessage.data]);
        }
    }
    catch (error) {
        console.log(error);
    }
}

function scrollUpdate() {
    const div = document.getElementById('chatbox');
    div.scrollTop = div.scrollHeight;
}

function openCurrentChat(e, groupname, groupId) {
    // socket.emit("join-group", groupId);
    document.getElementById('active-rightside').style.display = "block";
    document.getElementById('current-chat-not-selected').style.display = "none";
    const list = document.getElementById('chatList').querySelectorAll('li');
    for (item of list) {
        item.classList.remove('active-chat');
    }
    e.target.classList.add('active-chat');
    currentChatId = groupId;
    currentChatName = groupname;
    document.getElementById('current-chat').innerHTML = `${groupname}`;
    displayMessage.innerHTML = "";
    displayMessageOnScreen(groupMessages[groupId]);
}

function storeMessages(messages) {
    for (let message of messages) {
        const groupId = message.groupId;
        groupMessages[groupId].push(message);
        groupDetails[groupId].lastMessageId = message.id;
    }
    localStorage.setItem('groupMessages', JSON.stringify(groupMessages));
    localStorage.setItem('groupDetails', JSON.stringify(groupDetails));
}

function displayMessageOnScreen(messages) {
    for (let message of messages) {
        if (message.isUpdate) {
            displayMessage.innerHTML += `<li class="updates">${message.text}</li>`;
            continue;
        }
        if (message.userId === parsedToken.userId) {
            displayMessage.innerHTML += `<li class="mymessage"><p>You:<br>${message.text}</p></li>`
        }
        else {
            displayMessage.innerHTML += `<li><p>${message.username}:<br>${message.text}</p></li>`;
        }

    }
    scrollUpdate();
}

window.addEventListener('beforeunload', (event) => {
    for (group in groupMessages) {
        if (groupMessages[group].length > 5) {
            groupMessages[group]=groupMessages[group].slice(-25);
        }
    }
    localStorage.setItem('groupMessages', JSON.stringify(groupMessages));
})