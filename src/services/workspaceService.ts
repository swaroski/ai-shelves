import { Workspace, WorkspaceMember, WorkspaceActivity, WorkspaceInvitation } from '@/types/library';

export class WorkspaceService {
  private static readonly STORAGE_KEY = 'ai-shelves-workspaces';
  private static readonly MEMBERS_KEY = 'ai-shelves-workspace-members';
  private static readonly ACTIVITIES_KEY = 'ai-shelves-workspace-activities';
  private static readonly INVITATIONS_KEY = 'ai-shelves-workspace-invitations';

  static getWorkspaces(): Workspace[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getWorkspace(id: string): Workspace | null {
    const workspaces = this.getWorkspaces();
    return workspaces.find(w => w.id === id) || null;
  }

  static createWorkspace(data: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Workspace {
    const workspace: Workspace = {
      ...data,
      id: `workspace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const workspaces = this.getWorkspaces();
    workspaces.push(workspace);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workspaces));

    return workspace;
  }

  static updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | null {
    const workspaces = this.getWorkspaces();
    const index = workspaces.findIndex(w => w.id === id);
    
    if (index === -1) return null;

    workspaces[index] = {
      ...workspaces[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workspaces));
    return workspaces[index];
  }

  static deleteWorkspace(id: string): boolean {
    const workspaces = this.getWorkspaces();
    const filtered = workspaces.filter(w => w.id !== id);
    
    if (filtered.length === workspaces.length) return false;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    
    // Clean up related data
    this.removeWorkspaceMembers(id);
    this.removeWorkspaceActivities(id);
    this.removeWorkspaceInvitations(id);
    
    return true;
  }

  static getWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
    try {
      const stored = localStorage.getItem(this.MEMBERS_KEY);
      const allMembers: WorkspaceMember[] = stored ? JSON.parse(stored) : [];
      return allMembers.filter(m => m.workspaceId === workspaceId);
    } catch {
      return [];
    }
  }

  static addWorkspaceMember(member: WorkspaceMember): WorkspaceMember {
    const members = this.getAllMembers();
    members.push(member);
    localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(members));
    return member;
  }

  static updateWorkspaceMember(workspaceId: string, userId: string, updates: Partial<WorkspaceMember>): WorkspaceMember | null {
    const members = this.getAllMembers();
    const index = members.findIndex(m => m.workspaceId === workspaceId && m.userId === userId);
    
    if (index === -1) return null;

    members[index] = { ...members[index], ...updates };
    localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(members));
    return members[index];
  }

  static removeWorkspaceMember(workspaceId: string, userId: string): boolean {
    const members = this.getAllMembers();
    const filtered = members.filter(m => !(m.workspaceId === workspaceId && m.userId === userId));
    
    if (filtered.length === members.length) return false;

    localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(filtered));
    return true;
  }

  private static getAllMembers(): WorkspaceMember[] {
    try {
      const stored = localStorage.getItem(this.MEMBERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static removeWorkspaceMembers(workspaceId: string): void {
    const members = this.getAllMembers();
    const filtered = members.filter(m => m.workspaceId !== workspaceId);
    localStorage.setItem(this.MEMBERS_KEY, JSON.stringify(filtered));
  }

  static getWorkspaceActivities(workspaceId: string, limit?: number): WorkspaceActivity[] {
    try {
      const stored = localStorage.getItem(this.ACTIVITIES_KEY);
      const allActivities: WorkspaceActivity[] = stored ? JSON.parse(stored) : [];
      const workspaceActivities = allActivities
        .filter(a => a.workspaceId === workspaceId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return limit ? workspaceActivities.slice(0, limit) : workspaceActivities;
    } catch {
      return [];
    }
  }

  static addWorkspaceActivity(activity: WorkspaceActivity): WorkspaceActivity {
    const activities = this.getAllActivities();
    activities.push(activity);
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
    return activity;
  }

  private static getAllActivities(): WorkspaceActivity[] {
    try {
      const stored = localStorage.getItem(this.ACTIVITIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static removeWorkspaceActivities(workspaceId: string): void {
    const activities = this.getAllActivities();
    const filtered = activities.filter(a => a.workspaceId !== workspaceId);
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(filtered));
  }

  static getWorkspaceInvitations(workspaceId: string): WorkspaceInvitation[] {
    try {
      const stored = localStorage.getItem(this.INVITATIONS_KEY);
      const allInvitations: WorkspaceInvitation[] = stored ? JSON.parse(stored) : [];
      return allInvitations.filter(i => i.workspaceId === workspaceId);
    } catch {
      return [];
    }
  }

  static createInvitation(invitation: Omit<WorkspaceInvitation, 'id' | 'token'>): WorkspaceInvitation {
    const newInvitation: WorkspaceInvitation = {
      ...invitation,
      id: `invitation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      token: Math.random().toString(36).substr(2, 32),
    };

    const invitations = this.getAllInvitations();
    invitations.push(newInvitation);
    localStorage.setItem(this.INVITATIONS_KEY, JSON.stringify(invitations));
    return newInvitation;
  }

  static updateInvitation(id: string, updates: Partial<WorkspaceInvitation>): WorkspaceInvitation | null {
    const invitations = this.getAllInvitations();
    const index = invitations.findIndex(i => i.id === id);
    
    if (index === -1) return null;

    invitations[index] = { ...invitations[index], ...updates };
    localStorage.setItem(this.INVITATIONS_KEY, JSON.stringify(invitations));
    return invitations[index];
  }

  private static getAllInvitations(): WorkspaceInvitation[] {
    try {
      const stored = localStorage.getItem(this.INVITATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static removeWorkspaceInvitations(workspaceId: string): void {
    const invitations = this.getAllInvitations();
    const filtered = invitations.filter(i => i.workspaceId !== workspaceId);
    localStorage.setItem(this.INVITATIONS_KEY, JSON.stringify(filtered));
  }

  static getUserWorkspaces(userId: string): Workspace[] {
    const workspaces = this.getWorkspaces();
    const userMemberData = this.getAllMembers().filter(m => m.userId === userId);
    const userWorkspaceIds = userMemberData.map(m => m.workspaceId);
    
    return workspaces.filter(w => 
      w.ownerId === userId || userWorkspaceIds.includes(w.id)
    );
  }

  static createDefaultWorkspace(userId: string, userName: string): Workspace {
    const workspace = this.createWorkspace({
      name: `${userName}'s Library`,
      description: 'My personal library workspace',
      ownerId: userId,
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
    this.addWorkspaceMember({
      userId,
      workspaceId: workspace.id,
      role: 'owner',
      joinedAt: new Date().toISOString(),
      permissions: [],
    });

    // Add creation activity
    this.addWorkspaceActivity({
      id: `activity-${Date.now()}`,
      workspaceId: workspace.id,
      userId,
      action: 'created',
      resourceType: 'workspace',
      resourceId: workspace.id,
      details: { name: workspace.name },
      timestamp: new Date().toISOString(),
    });

    return workspace;
  }
}