# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "math-tutor-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Your App

1. In your Firebase project, click the "Web" icon (`</>`)
2. Register your app with nickname "math-tutor-web"
3. **DO NOT** check "Set up Firebase Hosting" for now
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password**:
   - Click "Email/Password"
   - Toggle "Enable" 
   - Click "Save"

4. Enable **Google**:
   - Click "Google"
   - Toggle "Enable"
   - Select your project support email
   - Click "Save"

## Step 4: Configure Your App

1. Open `src/config/firebase.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com", 
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 5: Configure Google OAuth (Important!)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 client ID
5. Click edit (pencil icon)
6. Add your domains to **Authorized JavaScript origins**:
   - `http://localhost:5173` (for development)
   - Your production domain (when deployed)
7. Add your domains to **Authorized redirect URIs**:
   - `http://localhost:5173` (for development)
   - Your production domain (when deployed)
8. Click "Save"

## Step 6: Test the Setup

1. Run your app: `npm run dev`
2. Try signing up with email/password
3. Try signing in with Google
4. Check Firebase Console > Authentication > Users to see registered users

## Troubleshooting

### Common Issues:

1. **"auth/configuration-not-found"**
   - Make sure you've enabled Email/Password in Firebase Console
   - Check that your Firebase config is correct

2. **Google Sign-in not working**
   - Verify OAuth configuration in Google Cloud Console
   - Make sure authorized origins include your domain
   - Clear browser cache and try again

3. **"auth/operation-not-allowed"**
   - Double-check that authentication methods are enabled in Firebase Console

### Security Notes:

- Your Firebase config is safe to expose publicly
- The real security comes from Firebase Security Rules (for Firestore/Storage)
- Consider setting up Firebase Security Rules when you add a database

## Next Steps

Once authentication is working, you can:
- Add Firestore database for storing user progress
- Implement user profiles and settings
- Add social features like leaderboards
- Set up Firebase Analytics for usage tracking 