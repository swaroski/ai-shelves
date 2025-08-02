import { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  Shield, 
  Bot, 
  Bell,
  Save,
  ArrowLeft,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const WorkspaceSettings = () => {
  const { currentWorkspace, updateWorkspace, isLoading } = useWorkspace();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: currentWorkspace?.name || '',
    description: currentWorkspace?.description || '',
    isPublic: currentWorkspace?.isPublic || false,
    settings: currentWorkspace?.settings || {
      allowPublicAccess: false,
      requireApprovalForJoining: true,
      borrowingEnabled: true,
      maxBorrowDuration: 14,
      aiAnalysisEnabled: true,
      collaborativeEditingEnabled: true,
      notificationsEnabled: true,
    }
  });

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Workspace Not Found</h1>
          <p className="text-muted-foreground mt-2">Please select a workspace to view settings.</p>
          <Link to="/dashboard">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentWorkspace.ownerId === user?.id;
  const canEdit = isOwner; // Add more role-based logic here

  const handleSave = async () => {
    if (!canEdit) return;
    
    setIsSaving(true);
    try {
      await updateWorkspace(currentWorkspace.id, {
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
        settings: formData.settings,
      });
      toast.success('Workspace settings updated successfully');
    } catch (error) {
      toast.error('Failed to update workspace settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsChange = (setting: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Workspace Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your workspace configuration and preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update your workspace name and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Workspace Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your workspace..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                      disabled={!canEdit}
                    />
                    <Label htmlFor="public">Make workspace public</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Library Settings</CardTitle>
                  <CardDescription>
                    Configure how your library operates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Borrowing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow members to borrow books
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.borrowingEnabled}
                      onCheckedChange={(checked) => handleSettingsChange('borrowingEnabled', checked)}
                      disabled={!canEdit}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxBorrowDuration">Maximum Borrow Duration (days)</Label>
                    <Input
                      id="maxBorrowDuration"
                      type="number"
                      value={formData.settings.maxBorrowDuration}
                      onChange={(e) => handleSettingsChange('maxBorrowDuration', parseInt(e.target.value))}
                      disabled={!canEdit || !formData.settings.borrowingEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI Analysis</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable AI-powered book analysis and recommendations
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.aiAnalysisEnabled}
                      onCheckedChange={(checked) => handleSettingsChange('aiAnalysisEnabled', checked)}
                      disabled={!canEdit}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Collaborative Editing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow multiple users to edit book information simultaneously
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.collaborativeEditingEnabled}
                      onCheckedChange={(checked) => handleSettingsChange('collaborativeEditingEnabled', checked)}
                      disabled={!canEdit}
                    />
                  </div>
                </CardContent>
              </Card>

              {canEdit && (
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Management</CardTitle>
                <CardDescription>
                  Manage workspace members and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Approval for Joining</Label>
                      <p className="text-sm text-muted-foreground">
                        New members need approval before joining
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.requireApprovalForJoining}
                      onCheckedChange={(checked) => handleSettingsChange('requireApprovalForJoining', checked)}
                      disabled={!canEdit}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Current Members</h4>
                    {currentWorkspace.members.map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{member.userId}</p>
                            <p className="text-sm text-muted-foreground">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{member.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>
                  Configure workspace access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow public access to read-only content
                    </p>
                  </div>
                  <Switch
                    checked={formData.settings.allowPublicAccess}
                    onCheckedChange={(checked) => handleSettingsChange('allowPublicAccess', checked)}
                    disabled={!canEdit}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications for workspace activities
                    </p>
                  </div>
                  <Switch
                    checked={formData.settings.notificationsEnabled}
                    onCheckedChange={(checked) => handleSettingsChange('notificationsEnabled', checked)}
                    disabled={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <div className="space-y-6">
              {isOwner && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Irreversible actions that will permanently affect your workspace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Workspace
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkspaceSettings;