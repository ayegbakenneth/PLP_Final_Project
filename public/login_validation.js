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


  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('http://localhost:3000/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        window.location.href = '/products.html'; // Redirect to products page
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error during login.');
    }
  });
