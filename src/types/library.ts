export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  isbn: string;
  tags: string[];
  summary?: string;
  isAvailable: boolean;
  borrower?: string;
  dueDate?: string;
  borrowedDate?: string;
  workspaceId?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  lastModified?: string;
  version?: number;
}

export interface BorrowingRecord {
  id: string;
  bookId: string;
  borrower: string;
  borrowedDate: string;
  dueDate: string;
  returnedDate?: string;
  workspaceId?: string;
}

export interface UserFavorite {
  id: string;
  userId: string;
  bookId: string;
  dateAdded: string;
}

export interface LibraryStats {
  totalBooks: number;
  borrowedBooks: number;
  availableBooks: number;
  popularGenres: { genre: string; count: number }[];
  recentBorrowings: BorrowingRecord[];
  workspaceStats?: WorkspaceStats;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: UserRole;
  createdAt: string;
  lastActive?: string;
}

export type UserRole = 'admin' | 'librarian' | 'member' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  joinedAt: string;
  invitedBy?: string;
  permissions: WorkspacePermission[];
}

export type WorkspaceRole = 'owner' | 'admin' | 'librarian' | 'member' | 'viewer';

export interface WorkspacePermission {
  action: PermissionAction;
  resource: PermissionResource;
  granted: boolean;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'invite';
export type PermissionResource = 'books' | 'borrowings' | 'members' | 'settings' | 'workspace';

export interface WorkspaceSettings {
  allowPublicAccess: boolean;
  requireApprovalForJoining: boolean;
  borrowingEnabled: boolean;
  maxBorrowDuration: number;
  aiAnalysisEnabled: boolean;
  collaborativeEditingEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface WorkspaceStats {
  totalMembers: number;
  activeMembers: number;
  booksAddedThisMonth: number;
  borrowingsThisMonth: number;
  topContributors: { userId: string; contributions: number }[];
}

export interface WorkspaceActivity {
  id: string;
  workspaceId: string;
  userId: string;
  action: ActivityAction;
  resourceType: ActivityResource;
  resourceId: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export type ActivityAction = 'created' | 'updated' | 'deleted' | 'borrowed' | 'returned' | 'invited' | 'joined' | 'left';
export type ActivityResource = 'book' | 'borrowing' | 'member' | 'workspace' | 'settings';

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
}