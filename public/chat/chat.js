const modalOverlay = document.getElementById('modal-overlay');
const openNewGroupForm = document.getElementById('open-new-group-form');
const closeFormBtn = document.getElementById('close-form-btn');
const leftMenu = document.getElementById('left-menu');
const leftDropdown = document.getElementById('left-dropdown');

const newGroupForm = document.getElementById('new-group-form');
const newGroupCreated = document.getElementById('new-group-created');
const groupCreatedMessage = document.getElementById('group-created-message');
const closeGroupCreatedMessage = document.getElementById('close-group-created-message');
const newGroupName = document.getElementById('new-group-name');

const modalOverlay1 = document.getElementById('modal-overlay-1');
const openAddmembers = document.getElementById('open-add-member');
const openViewMembers = document.getElementById('open-view-members');
const openMakeAdmin = document.getElementById('open-make-admin');
const openRemoveMember = document.getElementById('open-remove-member');
const closeFormBtn1 = document.getElementById('close-form-btn-1');
const rightMenu = document.getElementById('right-menu');
const rightDropdown = document.getElementById('right-dropdown');

const memberSearchBtn = document.getElementById('member-search-btn');
const searchName = document.getElementById('search-name');
const memberSearchDiv = document.getElementById('member-search-div');
const searchedMemberList = document.getElementById('searched-member-list');
const searchButtonDiv = document.getElementById('search-button-div');
const sendMessageForm = document.getElementById('send-message-form');

const displayMessage = document.getElementById('message-list');


let groupList = localStorage.getItem('groupList') ? JSON.parse(localStorage.getItem('groupList')) : [];
let removedGroupList = localStorage.getItem('removedGroupList') ? JSON.parse(localStorage.getItem('removedGroupList')) : [];
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
        // Get all groups for the user   
        const response = await axios.get(`/group/get-all/${parsedToken.userId}`, { headers: { "Authorization": token } });
        let newGroupList = response.data;

        if (newGroupList.length > 0) {
            for (let group of newGroupList) {
                const { groupId, groupname, isAdmin, joinedMessageId } = group;
                if (groupDetails[groupId]) {
                    groupDetails[groupId].isAdmin = isAdmin;
                } else {
                    // It is a new group
                    groupList.push(groupId);
                    groupDetails[groupId] = { groupname, isAdmin, joinedMessageId, lastMessageId: joinedMessageId - 1 };
                    groupMessages[groupId] = [];
                    localStorage.setItem('groupList', JSON.stringify(groupList));
                    localStorage.setItem('groupDetails', JSON.stringify(groupDetails));
                    localStorage.setItem('groupMessages', JSON.stringify(groupMessages));
                }
            }

            // Get the new messages for all the groups through the lastMessageId of each group;
            const groupData = newGroupList.map(group => {
                const groupId = group.groupId;
                return { groupId, lastMessageId: groupDetails[groupId].lastMessageId }
            })
            const response1 = await axios.get(`/message/new`, { params: { groupData }, headers: { "Authorization": token } });
            const newMessages = response1.data;
            //Store the new messages
            for (let groupId in newMessages) {
                if (newMessages[groupId].length < 25) {
                    const oldMessages = groupMessages[groupId];
                    groupMessages[groupId] = [...oldMessages, ...newMessages[groupId].reverse()].slice(-25);
                } else {
                    groupMessages[groupId] = newMessages[groupId].reverse();
                }
                const msg = groupMessages[groupId]
                groupDetails[groupId].lastMessageId = msg[msg.length - 1].id;
                localStorage.setItem('groupDetails', JSON.stringify(groupDetails));
                localStorage.setItem('groupMessages', JSON.stringify(groupMessages));
            }
        }
        // Get the removed groups
        newGroupList = newGroupList.map(group => group.groupId);
        for (let groupId of groupList) {
            if (!newGroupList.includes(groupId)) {
                removedGroupList.push(groupId);
            }
        }
        localStorage.setItem('removedGroupList', JSON.stringify(removedGroupList));
        groupList=newGroupList;
        localStorage.setItem('groupList', JSON.stringify(groupList));
        //Show the groups on screen on leftside
        const chatlist = document.getElementById('chatList');
        for (let groupId in groupDetails) {
            const groupname = groupDetails[groupId].groupname;
            chatlist.innerHTML += `<li onclick="openCurrentChat(event,'${groupname}',${groupId})"><p>${groupname}</p></li>`;
        }
        socket.emit("join-multiple-groups", groupList);
    }
    catch (error) {
        console.log(error);
    }
});

let socket = io('http://localhost:2000', { query: { userId: parsedToken.userId } });

socket.on('receive-message', (message) => {
    storeMessages(message);
    if (currentChatId === message.groupId) {
        displayMessageOnScreen([message]);
    }
})

socket.on('new-member-added', (message, memberId, groupname) => {
    const groupId = message.groupId;
    if (parsedToken.userId === +memberId) {
        message.text = `${message.username} added you to the group`;
        groupList.push(groupId);
        groupDetails[groupId] = { groupname, isAdmin: false, joinedMessageId: message.id, lastMessageId: message.id };
        groupMessages[groupId] = [];
        localStorage.setItem('groupList', JSON.stringify(groupList));
        localStorage.setItem('groupDetails', JSON.stringify(groupDetails));
        document.getElementById('chatList').innerHTML += `<li onclick="openCurrentChat(event,'${groupname}',${groupId})"><p>${groupname}</p></li>`;
    }
    storeMessages(message)
    if (currentChatId === groupId) {
        displayMessageOnScreen([message]);
    }
})

socket.on('update-admin', (groupId) => {
    groupDetails[groupId].isAdmin = true;
    localStorage.setItem('groupDetails', JSON.stringify(groupDetails));
})

socket.on('removed-from-group', (memberId, message) => {
    const groupId = +message.groupId;
    if (parsedToken.userId === +memberId) {
        socket.emit('leave-group', groupId)
        message.text = `${message.username} removed you from the group`;
        const index = groupList.indexOf(groupId);
        if (index !== -1) {
            groupList.splice(index, 1);
            localStorage.setItem('groupList', JSON.stringify(groupList));
        }
        removedGroupList.push(groupId);
        localStorage.setItem('removedGroupList', JSON.stringify(removedGroupList));
        if (currentChatId === groupId) {
            sendMessageForm.classList.add('hide');
        }
    }
    storeMessages(message);
    if (currentChatId === groupId) {
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


openNewGroupForm.addEventListener('click', function () {
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
        const groupId = message.groupId;
        socket.emit("join-group", groupId);
        socket.emit('send-message', message);

        message.text = `You created this group`;
        groupList.push(groupId);
        groupDetails[groupId] = { groupname: name, isAdmin: true, joinedMessageId: message.id, lastMessageId: message.id };
        groupMessages[groupId] = [message];
        localStorage.setItem('groupList', JSON.stringify(groupList));
        localStorage.setItem('groupDetails', JSON.stringify(groupDetails));
        localStorage.setItem('groupMessages', JSON.stringify(groupMessages));
        groupCreatedMessage.innerHTML = `${name} group created successfully`;
        newGroupForm.style.display = "none";
        newGroupCreated.style.display = "block";
        document.getElementById('current-chat').innerHTML = `${name}`;
        document.getElementById('chatList').innerHTML += `<li onclick="openCurrentChat(event,'${name}',${groupId})"><p>${name}</p></li>`;
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

openViewMembers.addEventListener('click', async () => {
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
    searchButtonDiv.classList.remove('hide');
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

openMakeAdmin.addEventListener('click', async () => {
    rightMenu.classList.remove('active-menu');
    rightDropdown.style.display = "none";
    searchButtonDiv.classList.add('hide');
    modalOverlay1.classList.add('show');
    memberSearchDiv.style.display = "block";
    try {
        const response = await axios.get(`/group/members/${currentChatId}`, { headers: { Authorization: token } });
        for (let member of response.data) {
            if (member.userId === parsedToken.userId) {
                searchedMemberList.innerHTML += `<li>${member.user.username} <li>`;
                continue
            }
            searchedMemberList.innerHTML +=
                `<li>${member.user.username} <button onclick="makeNewAdmin('${member.userId}','${member.user.username}','${currentChatId}')">Select</button></li>`;
        }
    }
    catch (error) {
        memberSearchDiv.style.display = "block";
        searchedMemberList.innerHTML = 'Something went wrong';
        console.log(error);
    }
});

openRemoveMember.addEventListener('click', async () => {
    rightMenu.classList.remove('active-menu');
    rightDropdown.style.display = "none";
    searchButtonDiv.classList.add('hide');
    modalOverlay1.classList.add('show');
    memberSearchDiv.style.display = "block";
    try {
        const response = await axios.get(`/group/members/${currentChatId}`, { headers: { Authorization: token } });
        for (let member of response.data) {
            if (member.userId === parsedToken.userId) {
                searchedMemberList.innerHTML += `<li>${member.user.username} <li>`;
                continue
            }
            searchedMemberList.innerHTML +=
                `<li>${member.user.username} <button onclick="removeMember('${member.userId}','${member.user.username}','${currentChatId}')">Remove</button></li>`;
        }
    }
    catch (error) {
        memberSearchDiv.style.display = "block";
        searchedMemberList.innerHTML = 'Something went wrong';
        console.log(error);
    }
});

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
        searchedMemberList.innerHTML = `${membername} successfully added to the group`;
        message.data.text = `You added ${membername} to the group`;
        storeMessages(message.data);
        displayMessageOnScreen([message.data]);
    }
    catch (error) {
        searchedMemberList.innerHTML += `${error.response.data.message}`;
        console.log(error);
    }
}
async function makeNewAdmin(memberId, membername, groupId) {
    try {
        const response = await axios.post(`/group/make-admin`, { memberId, groupId }, { headers: { Authorization: token } });
        socket.emit('new-admin', memberId, groupId);
        searchedMemberList.innerHTML = `${membername} is now admin of the group.He can add new member or remove any menber or make new admin.`;
    }
    catch (error) {
        console.log(error);
        searchedMemberList.innerHTML += `${error.response.data.message}`;
    }
}

async function removeMember(memberId, membername, groupId) {
    try {
        const message = await axios.post(`/group/remove-member`, { memberId, groupId, membername }, { headers: { Authorization: token } });
        socket.emit('remove-member', memberId, message.data);
        searchedMemberList.innerHTML = `${membername} is successfully removed from the group.`;
        message.data.text = `You removed ${membername} from the group`;
        storeMessages(message.data);
        displayMessageOnScreen([message.data]);
    }
    catch (error) {
        searchedMemberList.innerHTML += `${error.response.data.message}`;
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
            storeMessages(newMessage.data);
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
    const { joinedMessageId } = groupDetails[groupId];
    const startMessageId = groupMessages[groupId][0].id;
    // console.log(joinedMessageId,startMessageId);
    if (joinedMessageId !== startMessageId) {
        displayMessage.innerHTML += `<li id="get-old-messages"><button onclick="getOldMessages('${groupId}','${joinedMessageId}','${startMessageId}')">Load old messages</button></li>`;
    }
    displayMessageOnScreen(groupMessages[groupId]);
    if (removedGroupList.includes(+groupId)) {
        sendMessageForm.classList.add('hide');
    } else {
        sendMessageForm.classList.remove('hide');
    }
    if (groupDetails[groupId].isAdmin) {
        openAddmembers.style.display = "block";
        openMakeAdmin.style.display = "block";
        openRemoveMember.style.display = "block";
    } else {
        openAddmembers.style.display = "none";
        openMakeAdmin.style.display = "none";
        openRemoveMember.style.display = "none";
    }
}

async function getOldMessages(groupId, joinedMessageId, startMessageId) {
    try {
        --startMessageId;
        const response = await axios.get(`/message/old`, { params: { groupId, joinedMessageId, startMessageId }, headers: { "Authorization": token } });
        const oldMessages = response.data;
        const oldMessageBtn = document.getElementById('get-old-messages');
        if (+groupId === currentChatId) {
            for (let message of oldMessages) {
                if (message.isUpdate) {
                    oldMessageBtn.insertAdjacentHTML('afterend', `<li class="updates">${message.text}</li>`);
                    continue;
                }
                if (message.userId === parsedToken.userId) {
                    oldMessageBtn.insertAdjacentHTML('afterend', `<li class="mymessage"><p>You:<br>${message.text}</p></li>`);
                }
                else {
                    oldMessageBtn.insertAdjacentHTML('afterend', `<li><p>${message.username}:<br>${message.text}</p></li>`);
                }
            }
        }
        groupMessages[groupId] = [...oldMessages.reverse(), ...groupMessages[groupId]];
        localStorage.setItem('groupMessages', JSON.stringify(groupMessages))
        startMessageId = groupMessages[groupId][0].id;
        if (+joinedMessageId !== startMessageId) {
            oldMessageBtn.innerHTML = `<li id="get-old-messages"><button onclick="getOldMessages('${groupId}','${joinedMessageId}','${startMessageId}')">Load old messages</button></li>`;
        }
        else {
            oldMessageBtn.remove();
        }
    } catch (error) {
        console.log(error);
    }
}

function storeMessages(message) {
    const groupId = message.groupId;
    groupMessages[groupId].push(message);
    groupDetails[groupId].lastMessageId = message.id;
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

function handlebeforeunload() {
    for (group in groupMessages) {
        if (groupMessages[group].length > 25) {
            groupMessages[group] = groupMessages[group].slice(-25);
        }
    }
    localStorage.setItem('groupMessages', JSON.stringify(groupMessages));
}

window.addEventListener('beforeunload', handlebeforeunload);

document.getElementById('logout').addEventListener('click', () => {
    window.removeEventListener('beforeunload', handlebeforeunload);
    localStorage.clear();
    window.location.href = "/login/login.html";
})