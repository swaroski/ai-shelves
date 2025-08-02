import { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  MoreVertical, 
  Mail,
  Shield,
  UserMinus,
  Crown,
  Clock
} from 'lucide-react';
import { WorkspaceMember, WorkspaceRole } from '@/types/library';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function WorkspaceMembers() {
  const { currentWorkspace, inviteMember, removeMember, updateMemberRole } = useWorkspace();
  const { user } = useUser();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  if (!currentWorkspace) return null;

  const isOwner = currentWorkspace.ownerId === user?.id;
  const currentUserMember = currentWorkspace.members.find(m => m.userId === user?.id);
  const canManageMembers = isOwner || currentUserMember?.role === 'admin';

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsInviting(true);
    try {
      await inviteMember(currentWorkspace.id, inviteEmail, inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteDialog(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (userId === currentWorkspace.ownerId) {
      toast.error('Cannot remove workspace owner');
      return;
    }

    try {
      await removeMember(currentWorkspace.id, userId);
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: WorkspaceRole) => {
    if (userId === currentWorkspace.ownerId && newRole !== 'owner') {
      toast.error('Cannot change owner role');
      return;
    }

    try {
      await updateMemberRole(currentWorkspace.id, userId, newRole);
      toast.success('Member role updated successfully');
    } catch (error) {
      toast.error('Failed to update member role');
    }
  };

  const getRoleIcon = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return <Users className="h-3 w-3 text-gray-500" />;
    }
  };

  const getRoleColor = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'librarian':
        return 'bg-green-100 text-green-800';
      case 'member':
        return 'bg-gray-100 text-gray-800';
      case 'viewer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({currentWorkspace.members.length})
              </CardTitle>
              <CardDescription>
                Manage workspace members and their roles
              </CardDescription>
            </div>
            {canManageMembers && (
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite New Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join this workspace
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteRole} onValueChange={(value: WorkspaceRole) => setInviteRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="librarian">Librarian</SelectItem>
                          {isOwner && <SelectItem value="admin">Admin</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowInviteDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleInviteMember} disabled={isInviting}>
                      {isInviting ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentWorkspace.members.map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.userId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">User {member.userId.slice(-4)}</p>
                      {member.userId === user?.id && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={`${getRoleColor(member.role)} flex items-center gap-1`}>
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>

                  {canManageMembers && member.userId !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role !== 'owner' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.userId, 'viewer')}
                              disabled={member.role === 'viewer'}
                            >
                              Set as Viewer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.userId, 'member')}
                              disabled={member.role === 'member'}
                            >
                              Set as Member
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.userId, 'librarian')}
                              disabled={member.role === 'librarian'}
                            >
                              Set as Librarian
                            </DropdownMenuItem>
                            {isOwner && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateRole(member.userId, 'admin')}
                                disabled={member.role === 'admin'}
                              >
                                Set as Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.userId)}
                              className="text-destructive"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
          <CardDescription>
            Invitations that haven't been accepted yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No pending invitations
          </p>
        </CardContent>
      </Card>
    </div>
  );
}