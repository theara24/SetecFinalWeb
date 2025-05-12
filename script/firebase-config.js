// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js';
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDWWQNIsb__EwfxjeJeGKiGbqQNA_K_wXU',
  authDomain: 'finalsetec.firebaseapp.com',
  projectId: 'finalsetec',
  storageBucket: 'finalsetec.appspot.com',
  messagingSenderId: '111968946774',
  appId: '1:111968946774:web:2a4ed69409bc8015c209f7',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

function showMessage(message, divId, isError = true) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = 'block';
  messageDiv.textContent = message;
  messageDiv.style.color = isError ? 'red' : 'green';
  messageDiv.style.opacity = 1;

  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Registration Function
const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', async (event) => {
  event.preventDefault();

  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstName = document.getElementById('fName').value;
  const lastName = document.getElementById('lName').value;
  const role = document.querySelector('input[name="userRole"]:checked')?.value;

  if (!role) {
    showMessage('Please select a role (Admin or User)', 'signUpMessage');
    return;
  }

  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Store additional user data in Firestore
    const userData = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    showMessage(
      'Account Created Successfully! Redirecting...',
      'signUpMessage',
      false
    );

    // Redirect based on role after short delay
    setTimeout(() => {
      if (role === 'admin') {
        window.location.href = '/pages/admin.html';
      } else {
        window.location.href = '/index.html';
      }
    }, 1500);
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-in-use') {
      showMessage('Email Address Already Exists!', 'signUpMessage');
    } else if (error.code === 'auth/weak-password') {
      showMessage('Password should be at least 6 characters', 'signUpMessage');
    } else {
      showMessage('Unable to create user: ' + error.message, 'signUpMessage');
    }
  }
});

// Login Function
const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      localStorage.setItem('loggedInUserId', user.uid);
      localStorage.setItem('userRole', userData.role || 'user');

      showMessage('Login successful! Redirecting...', 'signInMessage', false);

      // Redirect based on role after short delay
      setTimeout(() => {
        if (userData.role === 'admin') {
          window.location.href = '/pages/admin.html';
        } else {
          window.location.href = '../index.html';
        }
      }, 1500);
    } else {
      showMessage('User data not found', 'signInMessage');
    }
  } catch (error) {
    console.error('Login error:', error);
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found'
    ) {
      showMessage('Incorrect email or password', 'signInMessage');
    } else {
      showMessage('Login failed: ' + error.message, 'signInMessage');
    }
  }
});

// Toggle between sign-in and sign-up forms
document.getElementById('signUpButton').addEventListener('click', function () {
  document.getElementById('signIn').style.display = 'none';
  document.getElementById('signup').style.display = 'block';
});

document.getElementById('signInButton').addEventListener('click', function () {
  document.getElementById('signup').style.display = 'none';
  document.getElementById('signIn').style.display = 'block';
});
