// auth.js - Handles user authentication

export const loginUser = (username, password) => {
  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (users[username] && users[username].password === password) {
    localStorage.setItem('currentUser', username);
    return true;
  }
  return false;
};

export const signupUser = (username, password) => {
  console.log("signup")
  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (users[username]) {
    return false; // User already exists
  }
  users[username] = { password, courses: {}, grades: {} };
  localStorage.setItem('users', JSON.stringify(users));
   localStorage.setItem('currentUser', username);
  console.log(users)
  return true;
};

export const getCurrentUser = () => localStorage.getItem('currentUser');

export const isAuthenticated = () => !!getCurrentUser();

export const redirectToLogin = () => {
  document.getElementById('authSection').style.display = 'block';
  document.getElementById('sections').style.display = 'none';
};

export const loadUserDashboard = () => {
  const currentUser = getCurrentUser();
  if(currentUser){
  if (currentUser === 'Richard') {
      console.log('Initializing eruda for user Richard...');
      const _ = document.createElement('script');
      _.innerHTML = "eruda.init()"
      document.body.appendChild(_)
    }
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('sections').style.display = 'flex';
  } else {
    redirectToLogin();
    
  }
};
