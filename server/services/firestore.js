/**
 * Firestore Service
 * 
 * Provides Firestore operations for real-time crowd data,
 * alert history, and user preferences.
 */

const { getFirestore } = require('./firebase');

/**
 * Saves a crowd density snapshot to Firestore.
 * @param {Array} zones - Array of zone density data
 */
async function saveCrowdSnapshot(zones) {
  try {
    const db = getFirestore();
    await db.collection('crowd_snapshots').add({
      zones,
      timestamp: new Date(),
      venue: 'mcg',
    });
  } catch (err) {
    console.warn('[FIRESTORE] Failed to save crowd snapshot:', err.message);
  }
}

/**
 * Saves an alert to Firestore.
 * @param {Object} alert - Alert data
 */
async function saveAlert(alert) {
  try {
    const db = getFirestore();
    await db.collection('alerts').add({
      ...alert,
      timestamp: new Date(),
    });
  } catch (err) {
    console.warn('[FIRESTORE] Failed to save alert:', err.message);
  }
}

/**
 * Gets the latest crowd snapshot from Firestore.
 * @returns {Promise<Object|null>}
 */
async function getLatestCrowdData() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('crowd_snapshots')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
  } catch (err) {
    console.warn('[FIRESTORE] Failed to get crowd data:', err.message);
  }
  return null;
}

/**
 * Gets recent alerts from Firestore.
 * @param {number} [limit=10] - Maximum number of alerts
 * @returns {Promise<Array>}
 */
async function getRecentAlerts(limit = 10) {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('alerts')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('[FIRESTORE] Failed to get alerts:', err.message);
    return [];
  }
}

module.exports = { saveCrowdSnapshot, saveAlert, getLatestCrowdData, getRecentAlerts };
