import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Workspace, WorkspaceMember, WorkspaceActivity } from '@/types/library';
import { WorkspaceService } from '@/services/workspaceService';

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  activities: WorkspaceActivity[];
  isLoading: boolean;
  error: string | null;
}

interface WorkspaceContextType extends WorkspaceState {
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => Promise<void>;
  inviteMember: (workspaceId: string, email: string, role: string) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  updateMemberRole: (workspaceId: string, userId: string, role: string) => Promise<void>;
  joinWorkspace: (workspaceId: string) => Promise<void>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;
  loadActivities: (workspaceId: string) => Promise<void>;
}

type WorkspaceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WORKSPACES'; payload: Workspace[] }
  | { type: 'SET_CURRENT_WORKSPACE'; payload: Workspace | null }
  | { type: 'SET_MEMBERS'; payload: WorkspaceMember[] }
  | { type: 'SET_ACTIVITIES'; payload: WorkspaceActivity[] }
  | { type: 'ADD_WORKSPACE'; payload: Workspace }
  | { type: 'UPDATE_WORKSPACE'; payload: Workspace }
  | { type: 'REMOVE_WORKSPACE'; payload: string };

const initialState: WorkspaceState = {
  currentWorkspace: null,
  workspaces: [],
  members: [],
  activities: [],
  isLoading: false,
  error: null,
};

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_WORKSPACES':
      return { ...state, workspaces: action.payload, isLoading: false };
    case 'SET_CURRENT_WORKSPACE':
      return { ...state, currentWorkspace: action.payload, isLoading: false };
    case 'SET_MEMBERS':
      return { ...state, members: action.payload };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_WORKSPACE':
      return {
        ...state,
        workspaces: [...state.workspaces, action.payload],
        currentWorkspace: action.payload,
        isLoading: false,
      };
    case 'UPDATE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.map(w =>
          w.id === action.payload.id ? action.payload : w
        ),
        currentWorkspace: state.currentWorkspace?.id === action.payload.id 
          ? action.payload 
          : state.currentWorkspace,
        isLoading: false,
      };
    case 'REMOVE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.filter(w => w.id !== action.payload),
        currentWorkspace: state.currentWorkspace?.id === action.payload 
          ? null 
          : state.currentWorkspace,
      };
    default:
      return state;
  }
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      loadUserWorkspaces();
    }
  }, [isLoaded, user, loadUserWorkspaces]);

  const loadUserWorkspaces = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      let userWorkspaces = WorkspaceService.getUserWorkspaces(user.id);
      
      // Create a default workspace if user has none
      if (userWorkspaces.length === 0) {
        const defaultWorkspace = WorkspaceService.createDefaultWorkspace(
          user.id,
          user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'User'
        );
        userWorkspaces = [defaultWorkspace];
      }

      dispatch({ type: 'SET_WORKSPACES', payload: userWorkspaces });
      
      if (userWorkspaces.length > 0 && !state.currentWorkspace) {
        dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: userWorkspaces[0] });
        
        // Load members and activities for the current workspace
        const members = WorkspaceService.getWorkspaceMembers(userWorkspaces[0].id);
        const activities = WorkspaceService.getWorkspaceActivities(userWorkspaces[0].id, 10);
        dispatch({ type: 'SET_MEMBERS', payload: members });
        dispatch({ type: 'SET_ACTIVITIES', payload: activities });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load workspaces' });
    }
  }, [user?.id, user?.firstName, user?.emailAddresses, state.currentWorkspace]);

  const switchWorkspace = async (workspaceId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const workspace = state.workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        dispatch({ type: 'SET_CURRENT_WORKSPACE', payload: workspace });
      } else {
        throw new Error('Workspace not found');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to switch workspace' });
    }
  };

  const createWorkspace = async (name: string, description?: string): Promise<Workspace> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newWorkspace = WorkspaceService.createWorkspace({
        name,
        description,
        ownerId: user.id,
        members: [],
        settings: {
          allowPublicAccess: false,
          requireApprovalForJoining: true,
          borrowingEnabled: true,
          maxBorrowDuration: 14,
          aiAnalysisEnabled: true,
          collaborativeEditingEnabled: true,
          notificationsEnabled: true,
        },
        isPublic: false,
      });

      // Add the owner as a member
      WorkspaceService.addWorkspaceMember({
        userId: user.id,
        workspaceId: newWorkspace.id,
        role: 'owner',
        joinedAt: new Date().toISOString(),
        permissions: [],
      });

      dispatch({ type: 'ADD_WORKSPACE', payload: newWorkspace });
      return newWorkspace;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create workspace' });
      throw error;
    }
  };

  const updateWorkspace = async (workspaceId: string, updates: Partial<Workspace>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedWorkspace = WorkspaceService.updateWorkspace(workspaceId, updates);
      if (!updatedWorkspace) throw new Error('Workspace not found');

      dispatch({ type: 'UPDATE_WORKSPACE', payload: updatedWorkspace });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update workspace' });
    }
  };

  const inviteMember = async (workspaceId: string, email: string, role: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Mock implementation - replace with actual API call
      console.log(`Inviting ${email} to workspace ${workspaceId} with role ${role}`);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to invite member' });
    }
  };

  const removeMember = async (workspaceId: string, userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Mock implementation - replace with actual API call
      console.log(`Removing user ${userId} from workspace ${workspaceId}`);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove member' });
    }
  };

  const updateMemberRole = async (workspaceId: string, userId: string, role: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Mock implementation - replace with actual API call
      console.log(`Updating user ${userId} role to ${role} in workspace ${workspaceId}`);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update member role' });
    }
  };

  const joinWorkspace = async (workspaceId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Mock implementation - replace with actual API call
      console.log(`Joining workspace ${workspaceId}`);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to join workspace' });
    }
  };

  const leaveWorkspace = async (workspaceId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Mock implementation - replace with actual API call
      console.log(`Leaving workspace ${workspaceId}`);
      dispatch({ type: 'REMOVE_WORKSPACE', payload: workspaceId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to leave workspace' });
    }
  };

  const loadActivities = async (workspaceId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const activities = WorkspaceService.getWorkspaceActivities(workspaceId);
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load activities' });
    }
  };

  const contextValue: WorkspaceContextType = {
    ...state,
    switchWorkspace,
    createWorkspace,
    updateWorkspace,
    inviteMember,
    removeMember,
    updateMemberRole,
    joinWorkspace,
    leaveWorkspace,
    loadActivities,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}