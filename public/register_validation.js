// This file is implemented for user input validation

function validateForm() {
    let valid = true;
  
    // Clear error messages
    document.getElementById('firstNameError').innerHTML = '';
    document.getElementById('lastNameError').innerHTML = '';
    document.getElementById('emailError').innerHTML = '';
    document.getElementById('passwordError').innerHTML = '';
    document.getElementById('confirmPasswordError').innerHTML = '';
    document.getElementById('ageError').innerHTML = '';
    document.getElementById('genderError').innerHTML = '';
    document.getElementById('countryError').innerHTML = '';
    document.getElementById('termsError').innerHTML = '';
  
    // Validate first name
    let firstName = document.getElementById('first_name').value;
    if (firstName === "") {
        document.getElementById('firstNameError').innerHTML = 'Error! First Name is required.';
        valid = false;
    }
  
    // Validate last name
    let lastName = document.getElementById('last_name').value;
    if (lastName === "") {
        document.getElementById('lastNameError').innerHTML = 'Error! Last Name is required.';
        valid = false;
    }
  
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
    } else if (password.length < 8) {
        document.getElementById('passwordError').innerHTML = 'Error! Password must be at least 8 characters long.';
        valid = false;
    }
  
    // Validate confirm password
    let confirmPassword = document.getElementById('confirm_password').value;
    if (confirmPassword === "") {
        document.getElementById('confirmPasswordError').innerHTML = 'Error! Confirmation password is required.';
        valid = false;
    } else if (confirmPassword !== password) {
        document.getElementById('confirmPasswordError').innerHTML = 'Error! Passwords do not match.';
        valid = false;
    }
  
    // Validate age
    let age = document.getElementById('age').value;
    if (age === "") {
        document.getElementById('ageError').innerHTML = 'Error! Age is required.';
        valid = false;
    } else if (isNaN(age) || age < 18 || age > 100) {
        document.getElementById('ageError').innerHTML = 'Error! Age must be between 18 and 100.';
        valid = false;
    }
  
    // Validate gender
    let gender = document.querySelector('input[name="gender"]:checked');
    if (!gender) {
        document.getElementById('genderError').innerHTML = 'Error! Gender is required.';
        valid = false;
    }
  
    // Validate country
    let country = document.getElementById('country').value;
    if (country === "") {
        document.getElementById('countryError').innerHTML = 'Error! Country is required.';
        valid = false;
    }
  
    // Validate terms and conditions
    let terms = document.getElementById('terms').checked;
    if (!terms) {
        document.getElementById('termsError').innerHTML = 'Error! You must agree to the terms and conditions.';
        valid = false;
    }
  
    // If all validations pass, form will be submitted.
    return valid;
  }
  
  function clearErrors() {
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.innerHTML = '';
    });
  }

  
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3000/submit_form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        window.location.href = '/login.html'; // Redirect to login page
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error during registration.');
    }
  });
