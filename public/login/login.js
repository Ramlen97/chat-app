
function showErrorMessage(error) {
    console.log(error);
    if (error.response && error.response.data.message) {
        document.getElementById('err').textContent = `${error.response.data.message}`;
    } else {
        document.getElementById('err').textContent = 'Something went wrong! Please try again.';
    }
    document.addEventListener('click', () => document.getElementById('err').textContent = "", { once: true });
}

async function userSignup(e) {
    e.preventDefault();
    try {
        const signupDetails = {
            name: e.target.name.value,
            email: e.target.email.value,
            phone: e.target.phone.value,
            password: e.target.password.value
        }
        const response = await axios.post('/user/signup', signupDetails);
        if(response.status===201){
            alert("Successfully signed up");
            localStorage.setItem('token', response.data.token);
            window.location.href="/chat/chat.html"
        }
    }
    catch (error) {
        showErrorMessage(error);
    }
}

async function userLogin(e){
    e.preventDefault();
    try {
        const loginDetails = {
            email: e.target.email.value,
            password: e.target.password.value
        }
        const response = await axios.post('/user/login', loginDetails);
        if(response.status===200){
            alert("Successfully logged in");
            localStorage.setItem('token', response.data.token);
            window.location.href="/chat/chat.html"
        }
    } 
    catch (error) {
        showErrorMessage(error);
    }
    
}
