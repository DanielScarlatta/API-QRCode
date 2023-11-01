document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('page');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value;
    const confirmpassword = document.getElementById('confirmpassword').value;
    const textArea = document.getElementById('responseApi')

    const endPoint = 'http://localhost:3000/v1/register/user'
    const response = await fetch(endPoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, confirmpassword })
    })

    const data = await response.json()
    textArea.innerText = data.msg

    
  });
});