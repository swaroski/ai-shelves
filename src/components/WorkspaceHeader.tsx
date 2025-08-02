import { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown,
  Settings,
  Plus,
  LogOut,
  Users,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function WorkspaceHeader() {
  const { currentWorkspace, workspaces, switchWorkspace, isLoading } = useWorkspace();
  const { user } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleWorkspaceSwitch = async (workspaceId: string) => {
    if (workspaceId !== currentWorkspace?.id) {
      await switchWorkspace(workspaceId);
    }
    setIsDropdownOpen(false);
  };

  if (!currentWorkspace) return null;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-auto p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">{currentWorkspace.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {currentWorkspace.members.length} members
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => handleWorkspaceSwitch(workspace.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                        <Building className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{workspace.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {workspace.members.length} members
                        </div>
                      </div>
                    </div>
                    {workspace.id === currentWorkspace.id && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {currentWorkspace.members.length}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Workspace Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/workspace/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Members
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}