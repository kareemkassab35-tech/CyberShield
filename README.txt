CyberShield — CMS via Firebase
================================

Files:
- index.html          : public site (AR/EN toggle)
- admin.html          : admin dashboard (login + CMS)
- style.css           : styles
- app.js              : site logic (reads Firestore)
- admin.js            : admin logic (Auth, Firestore, Storage)
- firebase-config.js  : your Firebase config (already filled)

Firebase steps you MUST complete:
1) Authentication -> Sign-in method -> enable Email/Password
2) Authentication -> Users -> Add user: kareemkassab35@gmail.com with a strong password
3) Firestore Database -> Create database
4) Storage -> enable (first upload from admin will prompt creation)

Recommended security rules (paste in Firestore Rules):
-----------------------------------------------------
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /site/{document=**} {
      allow read: if true;      // public read
      allow write: if request.auth != null; // only authenticated users
    }
  }
}

Storage rules (restrict uploads to authenticated users):
------------------------------------------------------
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

Deployment:
- Upload all files to your GitHub repo root (same place as index.html)
- Open /admin.html to login and manage content
- The public site will reflect your changes immediately
