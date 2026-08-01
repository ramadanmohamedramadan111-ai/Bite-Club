importScripts(
  'https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js',
);

importScripts(
  'https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js',
);

firebase.initializeApp({
  apiKey: 'AIzaSyBk2pJV_OUiXKnbkXTWgRUamZLH2LmAuWM',
  authDomain: 'biteclub-e3690.firebaseapp.com',
  projectId: 'biteclub-e3690',
  storageBucket: 'biteclub-e3690.firebasestorage.app',
  messagingSenderId: '253672185075',
  appId: '1:253672185075:web:4d97b79a467a52ddb1ab86',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo.png',
  });
});
