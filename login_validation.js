function validateForm() {
    let valid = true;
    
    // Clear error messages
    document.getElementById('emailError').innerHTML = '';
    document.getElementById('passwordError').innerHTML = '';
    
    // Validate email
    let email = document.getElementById('email').value;
    if (email === "") {
        document.getElementById('emailError').innerHTML = 'Error! Email is required.';
        valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('emailError').innerHTML = 'Error! Invalid email format.';
        valid = false;
    }

    // Validate password
    let password = document.getElementById('password').value;
    if (password === "") {
        document.getElementById('passwordError').innerHTML = 'Error! Password is required.';
        valid = false;
    }

    // If all validations pass, form will be submitted.
    return valid;
}