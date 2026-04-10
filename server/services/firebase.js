/**
 * Firebase Admin Service
 * 
 * Initializes Firebase Admin SDK for server-side
 * authentication verification and Firestore access.
 */

const admin = require('firebase-admin');

let firebaseApp = null;

/**
 * Returns the initialized Firebase Admin app.
 * Uses Application Default Credentials in GCP environments.
 */
function getFirebaseApp() {
  if (!firebaseApp) {
    try {
      firebaseApp = admin.initializeApp({
        projectId: process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
      });
      console.log('[FIREBASE] Admin SDK initialized');
    } catch (err) {
      // App may already be initialized
      if (err.code === 'app/duplicate-app') {
        firebaseApp = admin.app();
      } else {
        console.warn('[FIREBASE] Admin SDK init failed:', err.message);
      }
    }
  }
  return firebaseApp;
}

/**
 * Verifies a Firebase ID token from the Authorization header.
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<admin.auth.DecodedIdToken|null>}
 */
async function verifyToken(idToken) {
  try {
    getFirebaseApp();
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch (err) {
    console.warn('[FIREBASE AUTH] Token verification failed:', err.message);
    return null;
  }
}

/**
 * Returns the Firestore instance.
 * @returns {admin.firestore.Firestore}
 */
function getFirestore() {
  getFirebaseApp();
  return admin.firestore();
}

module.exports = { getFirebaseApp, verifyToken, getFirestore };
