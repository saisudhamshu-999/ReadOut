/**
 * Readout Firebase & Firestore Client Integration
 * Handles Google Sign-in with Firebase Auth and Firestore Data Persistence
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

let app = null;
let auth = null;
let db = null;
let currentUser = null;
let isConfigured = false;

// Default Provisioned Configuration
const DEFAULT_FIREBASE_CONFIG = {
  projectId: "supple-xylocarp-4f6jr",
  appId: "1:116112115520:web:d8118957dda6a835cb9ca5",
  apiKey: "AIzaSyAdePbfBR9vLwwM9P208Tay8wrM2j5b3ss",
  authDomain: "supple-xylocarp-4f6jr.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-readout-0cb86259-4d2c-4d7b-ac16-63e92a41819d",
  storageBucket: "supple-xylocarp-4f6jr.firebasestorage.app",
  messagingSenderId: "116112115520",
  oAuthClientId: "116112115520-38kavun5rij1mvnrcvm4m4ee0ikp4msu.apps.googleusercontent.com"
};

async function initFirebase() {
  try {
    let cfg = DEFAULT_FIREBASE_CONFIG;
    try {
      const res = await fetch('/api/firebase-config');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.apiKey) {
          cfg = json.data;
        }
      }
    } catch {
      // Use fallback
    }

    app = initializeApp(cfg);
    auth = getAuth(app);
    // Use configured custom database ID if available
    if (cfg.firestoreDatabaseId) {
      db = getFirestore(app, cfg.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }

    isConfigured = true;

    // Listen to Auth State
    onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      if (user) {
        // Upsert user profile in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Readout Patient',
            photoURL: user.photoURL || '',
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn('[Firestore User Sync Notice]:', e);
        }

        // Sync with API.setUser if defined
        if (window.API && typeof window.API.setUser === 'function') {
          window.API.setUser({
            id: user.uid,
            email: user.email,
            fullName: user.displayName || user.email?.split('@')[0] || 'Patient User',
            photoURL: user.photoURL
          });
        }
      } else {
        if (window.API && typeof window.API.setUser === 'function') {
          // Revert to local anonymous demo profile
          window.API.setUser({
            id: 'usr-demo-001',
            email: 'demo@readout.health',
            fullName: 'Demo Patient'
          });
        }
      }

      // Dispatch event to update all page UI elements
      window.dispatchEvent(new CustomEvent('readout:auth-changed', {
        detail: { user, isConfigured: true }
      }));
    });

  } catch (err) {
    console.warn('[Firebase Client Init Error]:', err.message);
  }
}

// ----------------------------------------------------
// Authentication Actions
// ----------------------------------------------------
async function signInWithGoogle() {
  if (!auth) await initFirebase();
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (err) {
    console.error('[Google Sign-in Error]:', err);
    return { success: false, error: err.message };
  }
}

async function signOutUser() {
  if (!auth) return;
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    console.error('[Sign-out Error]:', err);
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// Firestore Persistent Storage Operations
// ----------------------------------------------------

// 1. Save Report to Firestore
async function saveReportToFirestore(report) {
  if (!currentUser) return { success: false, error: 'Sign in required to save report to Firestore' };
  if (!db) return { success: false, error: 'Firestore database not initialized' };

  try {
    const reportId = report.id || `rep-${Date.now()}`;
    const reportRef = doc(db, 'users', currentUser.uid, 'reports', reportId);
    const payload = {
      id: reportId,
      userId: currentUser.uid,
      patientName: report.patient?.name || report.patientName || 'De-identified Patient',
      reportDate: report.collected || report.reportDate || new Date().toISOString().split('T')[0],
      labName: report.lab || report.laboratory || report.labName || 'Diagnostic Laboratory',
      parameters: report.parameters || [],
      patientContext: report.patientContext || {},
      clinicianSummary: report.clinicianSummary || '',
      updatedAt: new Date().toISOString(),
      createdAt: report.createdAt || new Date().toISOString()
    };
    await setDoc(reportRef, payload, { merge: true });
    return { success: true, id: reportId };
  } catch (err) {
    console.error('[Firestore Save Report Error]:', err);
    return { success: false, error: err.message };
  }
}

// 2. Fetch User's Stored Reports from Firestore
async function getUserReportsFromFirestore() {
  if (!currentUser || !db) return [];
  try {
    const reportsCol = collection(db, 'users', currentUser.uid, 'reports');
    const q = query(reportsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const reports = [];
    snapshot.forEach(docSnap => {
      reports.push({ id: docSnap.id, ...docSnap.data() });
    });
    return reports;
  } catch (err) {
    console.error('[Firestore Get Reports Error]:', err);
    return [];
  }
}

// 3. Delete Report from Firestore
async function deleteReportFromFirestore(reportId) {
  if (!currentUser || !db || !reportId) return { success: false };
  try {
    const reportRef = doc(db, 'users', currentUser.uid, 'reports', reportId);
    await deleteDoc(reportRef);
    return { success: true };
  } catch (err) {
    console.error('[Firestore Delete Report Error]:', err);
    return { success: false, error: err.message };
  }
}

// 4. Save Multi-turn Chat Message to Firestore
async function saveChatMessageToFirestore(chatMessage) {
  if (!currentUser || !db) return { success: false };
  try {
    const msgId = chatMessage.id || `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const chatRef = doc(db, 'users', currentUser.uid, 'chats', msgId);
    const payload = {
      id: msgId,
      userId: currentUser.uid,
      role: chatMessage.role || 'user',
      content: chatMessage.content || '',
      model: chatMessage.model || 'gemini-3.5-flash',
      rolePersona: chatMessage.rolePersona || 'clinical_explainer',
      timestamp: chatMessage.timestamp || new Date().toISOString()
    };
    await setDoc(chatRef, payload);
    return { success: true, id: msgId };
  } catch (err) {
    console.error('[Firestore Save Chat Error]:', err);
    return { success: false, error: err.message };
  }
}

// 5. Get User Chat History from Firestore
async function getUserChatHistoryFromFirestore() {
  if (!currentUser || !db) return [];
  try {
    const chatsCol = collection(db, 'users', currentUser.uid, 'chats');
    const q = query(chatsCol, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    const history = [];
    snapshot.forEach(docSnap => {
      history.push({ id: docSnap.id, ...docSnap.data() });
    });
    return history;
  } catch (err) {
    console.error('[Firestore Get Chats Error]:', err);
    return [];
  }
}

// 6. Save Generated Image to Firestore
async function saveHealthImageToFirestore(imageAsset) {
  if (!currentUser || !db) return { success: false };
  try {
    const imageId = imageAsset.id || `img-${Date.now()}`;
    const imgRef = doc(db, 'users', currentUser.uid, 'images', imageId);
    const payload = {
      id: imageId,
      userId: currentUser.uid,
      prompt: imageAsset.prompt || '',
      mode: imageAsset.mode || 'create',
      imageUrl: imageAsset.imageUrl || '',
      model: imageAsset.model || 'gemini-3.1-flash-image-preview',
      createdAt: new Date().toISOString()
    };
    await setDoc(imgRef, payload);
    return { success: true, id: imageId };
  } catch (err) {
    console.error('[Firestore Save Image Error]:', err);
    return { success: false, error: err.message };
  }
}

// 7. Get User Generated Images from Firestore
async function getUserImagesFromFirestore() {
  if (!currentUser || !db) return [];
  try {
    const imagesCol = collection(db, 'users', currentUser.uid, 'images');
    const q = query(imagesCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const images = [];
    snapshot.forEach(docSnap => {
      images.push({ id: docSnap.id, ...docSnap.data() });
    });
    return images;
  } catch (err) {
    console.error('[Firestore Get Images Error]:', err);
    return [];
  }
}

// Initialize immediately on script load
initFirebase();

// Export to global window namespace
window.ReadoutFirebase = {
  getAuth: () => auth,
  getDb: () => db,
  getCurrentUser: () => currentUser,
  isConfigured: () => isConfigured,
  signInWithGoogle,
  signOutUser,
  saveReport: saveReportToFirestore,
  getReports: getUserReportsFromFirestore,
  deleteReport: deleteReportFromFirestore,
  saveChat: saveChatMessageToFirestore,
  getChats: getUserChatHistoryFromFirestore,
  saveImage: saveHealthImageToFirestore,
  getImages: getUserImagesFromFirestore
};
