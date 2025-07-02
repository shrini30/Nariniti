function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
  }
}

function talkToLakshmi() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    alert(`Hello ${user.name}! Launching your Lakshmi – AI support in your language (coming soon!)`);
  } else {
    alert("Please login to access Lakshmi. Redirecting to login page...");
    window.location.href = 'login.html';
  }
  console.log("Talk to Lakshmi button clicked");
}

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user'));
  const authLink = document.getElementById('auth-link');
  
  if (user && authLink) {
    authLink.textContent = `Hello, ${user.name}`;
    authLink.href = '#';
    authLink.onclick = function(e) {
      e.preventDefault();
      if (confirm('Do you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        location.reload();
      }
    };
  }
});

function changeLanguage(language) {
  console.log('Language changed to:', language);
  // Language switching functionality can be implemented here
  alert('Language switching feature coming soon!');
}

