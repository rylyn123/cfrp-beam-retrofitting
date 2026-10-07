import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { CfrpInputs, ShearInputs, CfrpPreset } from './types/cfrp';

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore with custom database ID (Mandatory per ACI Studio instructions)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 3. Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 4. Test Firestore Connection upon Boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore: client is offline or network unavailable.');
    }
    return false;
  }
}
// Run connection test immediately
testConnection();

// 5. Standardized Error Handling per Firestore Skill Guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 6. Authentication Helper Functions
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// 7. Data Models for Cloud Storage
export interface CloudProject {
  id: string;
  title: string;
  beamId: string;
  structureName: string;
  engineerName: string;
  userId: string;
  flexureInputs: CfrpInputs;
  shearInputs: ShearInputs;
  createdAt: string;
  updatedAt: string;
}

// 8. Cloud Database Operations with Rigorous Error Catching
export async function saveProjectToCloud(
  project: Omit<CloudProject, 'userId' | 'updatedAt'> & { userId?: string }
): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to save calculations to Firebase.');
  }

  const path = `projects/${project.id}`;
  const now = new Date().toISOString();
  const payload: CloudProject = {
    ...project,
    userId: auth.currentUser.uid,
    createdAt: project.createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'projects', project.id), payload);
    return project.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserProjects(userId: string): Promise<CloudProject[]> {
  const path = 'projects';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as CloudProject);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteProjectFromCloud(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserProjects(
  userId: string,
  onUpdate: (projects: CloudProject[]) => void,
  onError?: (error: Error) => void
) {
  const path = 'projects';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as CloudProject);
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

// 9. Custom Materials Cloud Sync
export async function saveCustomMaterialToCloud(
  material: CfrpPreset,
  userId: string
): Promise<void> {
  const path = `custom_materials/${material.id}`;
  const payload = {
    ...material,
    userId,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'custom_materials', material.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserCustomMaterials(userId: string): Promise<CfrpPreset[]> {
  const path = 'custom_materials';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as CfrpPreset);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteCustomMaterialFromCloud(materialId: string): Promise<void> {
  const path = `custom_materials/${materialId}`;
  try {
    await deleteDoc(doc(db, 'custom_materials', materialId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
