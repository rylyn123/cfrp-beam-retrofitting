import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudCheck,
  FolderOpen,
  Trash2,
  LogIn,
  LogOut,
  X,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Sparkles,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
  saveProjectToCloud,
  fetchUserProjects,
  deleteProjectFromCloud,
  CloudProject,
} from '../firebase';
import { CfrpInputs, ShearInputs } from '../types/cfrp';

interface CloudProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFlexureInputs: CfrpInputs;
  currentShearInputs: ShearInputs;
  onLoadProject: (project: CloudProject) => void;
}

export const CloudProjectsModal: React.FC<CloudProjectsModalProps> = ({
  isOpen,
  onClose,
  currentFlexureInputs,
  currentShearInputs,
  onLoadProject,
}) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [projects, setProjects] = useState<CloudProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Project Form Inputs
  const [projectTitle, setProjectTitle] = useState<string>(
    currentFlexureInputs.projectTitle || 'CFRP Beam Retrofit Calculation'
  );
  const [beamId, setBeamId] = useState<string>(currentFlexureInputs.beamId || 'B-101');
  const [structureName, setStructureName] = useState<string>(
    currentFlexureInputs.structureName || 'Parking Structure Level 2'
  );
  const [engineerName, setEngineerName] = useState<string>(
    currentFlexureInputs.engineerName || 'Structural Engineer'
  );

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadProjects(currentUser.uid);
      } else {
        setProjects([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadProjects = async (uid: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchUserProjects(uid);
      setProjects(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to fetch projects from Firestore.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setErrorMessage(null);
    try {
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
      loadProjects(signedInUser.uid);
      setSuccessMessage(`Signed in as ${signedInUser.email}`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Google Sign-In failed.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setProjects([]);
      setSuccessMessage('Signed out successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to sign out.');
    }
  };

  const handleSaveCurrentProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Please sign in with Google to save projects.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const newProjectId = `proj-${Date.now()}`;
      await saveProjectToCloud({
        id: newProjectId,
        title: projectTitle.trim() || 'Untitled Calculation',
        beamId: beamId.trim() || 'B-01',
        structureName: structureName.trim() || 'Main Structure',
        engineerName: engineerName.trim() || user.displayName || 'Engineer',
        flexureInputs: {
          ...currentFlexureInputs,
          projectTitle,
          beamId,
          structureName,
          engineerName,
        },
        shearInputs: {
          ...currentShearInputs,
          beamId,
          structureName,
          engineerName,
        },
        createdAt: new Date().toISOString(),
      });

      setSuccessMessage(`Project "${projectTitle}" saved to Firebase!`);
      setTimeout(() => setSuccessMessage(null), 3500);
      loadProjects(user.uid);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to save project to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (projId: string, title: string) => {
    if (!window.confirm(`Delete "${title}" from Firebase Cloud?`)) return;

    try {
      await deleteProjectFromCloud(projId);
      setProjects((prev) => prev.filter((p) => p.id !== projId));
      setSuccessMessage(`Project deleted.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to delete project from Firestore.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in font-mono text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                Firebase Cloud Projects & Sync
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.2 rounded font-bold">
                  Firestore Connected
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Persistent project storage, member calculations & TDS system sync.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-cyan-500/50"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
              <div>
                <span className="text-slate-200 font-bold block text-xs">
                  {user.displayName || 'Authorized Engineer'}
                </span>
                <span className="text-slate-400 text-[10px]">{user.email}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Sign in with Google to save & access your calculations across devices.</span>
            </div>
          )}

          <div>
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 font-semibold text-xs transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2 text-xs transition-all shadow-md shadow-cyan-950"
              >
                <LogIn className="w-4 h-4" />
                Sign In with Google
              </button>
            )}
          </div>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-rose-950/60 border border-rose-800 text-rose-200 rounded text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              {errorMessage}
            </span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {successMessage}
            </span>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Modal Content Body */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {/* Section 1: Save Current Project */}
          {user && (
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <CloudUpload className="w-4 h-4 text-cyan-400" />
                  Save Active Calculation to Firestore
                </span>
                <span className="text-[10px] text-slate-500">
                  Includes Sheet 1 (Flexure) & Sheet 3 (Shear)
                </span>
              </div>

              <form onSubmit={handleSaveCurrentProject} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Project Title:</label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      required
                      placeholder="e.g. Beam Strengthening Analysis"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Beam ID / Tag:</label>
                    <input
                      type="text"
                      value={beamId}
                      onChange={(e) => setBeamId(e.target.value)}
                      required
                      placeholder="e.g. B-101 (Span 1)"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Structure / Facility:</label>
                    <input
                      type="text"
                      value={structureName}
                      onChange={(e) => setStructureName(e.target.value)}
                      placeholder="e.g. West Wing Commercial Building"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Lead Engineer:</label>
                    <input
                      type="text"
                      value={engineerName}
                      onChange={(e) => setEngineerName(e.target.value)}
                      placeholder="e.g. P.E. Structural"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 text-xs transition-all shadow"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving to Cloud...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-3.5 h-3.5" />
                        Save Project to Cloud
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section 2: Saved Projects List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                Cloud Saved Calculations ({projects.length})
              </span>
              {user && (
                <button
                  onClick={() => loadProjects(user.uid)}
                  disabled={isLoading}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              )}
            </div>

            {!user ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-lg border border-slate-800 space-y-2">
                <Cloud className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-400">
                  Please sign in with Google to view your saved beam calculations.
                </p>
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold inline-flex items-center gap-2 text-xs shadow-md mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In with Google
                </button>
              </div>
            ) : isLoading ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                Loading your projects from Firebase...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-lg border border-slate-800 text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">No saved projects found in your cloud storage.</p>
                <p className="text-[11px]">Save your current beam calculation above to access it anytime.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs">{proj.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                          {proj.beamId}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex flex-wrap gap-2">
                        <span>{proj.structureName}</span>
                        <span>·</span>
                        <span>Eng: {proj.engineerName}</span>
                        <span>·</span>
                        <span>Updated: {new Date(proj.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-3 font-mono pt-0.5">
                        <span>
                          Flexure: b={proj.flexureInputs?.b}mm, d={proj.flexureInputs?.d}mm, fc={proj.flexureInputs?.fc}MPa
                        </span>
                        <span>·</span>
                        <span>
                          CFRP: {proj.flexureInputs?.cfrpBrand || 'Custom'}, {proj.flexureInputs?.noOfPlies} plies
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          onLoadProject(proj);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 text-xs transition-all shadow"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Load Project
                      </button>
                      <button
                        onClick={() => handleDelete(proj.id, proj.title)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 transition-colors"
                        title="Delete calculation from Firebase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Project ID: <strong className="text-slate-300">sunlit-striker-5mzf6</strong> (asia-southeast1)
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
