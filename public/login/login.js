
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
        const response = await axios.post('http://localhost:2000/user/signup', signupDetails);
        alert("Successfuly signed up");
        localStorage.setItem('token', response.token);
    }
    catch (error) {
        showErrorMessage(error);
    }
}
