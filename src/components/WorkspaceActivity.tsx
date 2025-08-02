import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WorkspaceActivity as ActivityType } from '@/types/library';
import { 
  BookOpen, 
  UserPlus, 
  Settings, 
  FileEdit,
  UserMinus,
  RotateCcw,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WorkspaceActivityProps {
  limit?: number;
}

const getActivityIcon = (action: string, resourceType: string) => {
  switch (action) {
    case 'created':
      if (resourceType === 'book') return <BookOpen className="h-4 w-4" />;
      if (resourceType === 'member') return <UserPlus className="h-4 w-4" />;
      return <FileEdit className="h-4 w-4" />;
    case 'updated':
      return <FileEdit className="h-4 w-4" />;
    case 'deleted':
      return <UserMinus className="h-4 w-4" />;
    case 'borrowed':
      return <BookOpen className="h-4 w-4" />;
    case 'returned':
      return <RotateCcw className="h-4 w-4" />;
    case 'invited':
      return <UserPlus className="h-4 w-4" />;
    case 'joined':
      return <UserPlus className="h-4 w-4" />;
    case 'left':
      return <UserMinus className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

const getActivityColor = (action: string) => {
  switch (action) {
    case 'created':
    case 'joined':
    case 'invited':
      return 'text-green-600';
    case 'updated':
    case 'borrowed':
      return 'text-blue-600';
    case 'deleted':
    case 'left':
      return 'text-red-600';
    case 'returned':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

const formatActivityMessage = (activity: ActivityType): string => {
  const { action, resourceType, details } = activity;
  
  switch (action) {
    case 'created':
      if (resourceType === 'book') return `added "${details.title}" to the library`;
      if (resourceType === 'workspace') return 'created the workspace';
      return `created a ${resourceType}`;
    case 'updated':
      if (resourceType === 'book') return `updated "${details.title}"`;
      return `updated ${resourceType} settings`;
    case 'deleted':
      if (resourceType === 'book') return `removed "${details.title}" from the library`;
      return `deleted a ${resourceType}`;
    case 'borrowed':
      return `borrowed "${details.title}"`;
    case 'returned':
      return `returned "${details.title}"`;
    case 'invited':
      return `invited ${details.email} to join`;
    case 'joined':
      return 'joined the workspace';
    case 'left':
      return 'left the workspace';
    default:
      return `performed ${action} on ${resourceType}`;
  }
};

export function WorkspaceActivity({ limit }: WorkspaceActivityProps) {
  const { currentWorkspace, activities, loadActivities } = useWorkspace();
  const [displayActivities, setDisplayActivities] = useState<ActivityType[]>([]);

  useEffect(() => {
    if (currentWorkspace) {
      loadActivities(currentWorkspace.id);
    }
  }, [currentWorkspace, loadActivities]);

  useEffect(() => {
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setDisplayActivities(
      limit ? sortedActivities.slice(0, limit) : sortedActivities
    );
  }, [activities, limit]);

  // Mock data for demonstration since we don't have a backend yet
  const mockActivities: ActivityType[] = [
    {
      id: '1',
      workspaceId: currentWorkspace?.id || '',
      userId: 'user-1',
      action: 'created',
      resourceType: 'book',
      resourceId: 'book-1',
      details: { title: 'The Great Gatsby' },
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: '2',
      workspaceId: currentWorkspace?.id || '',
      userId: 'user-2',
      action: 'borrowed',
      resourceType: 'book',
      resourceId: 'book-2',
      details: { title: 'To Kill a Mockingbird' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: '3',
      workspaceId: currentWorkspace?.id || '',
      userId: 'user-3',
      action: 'joined',
      resourceType: 'member',
      resourceId: 'user-3',
      details: { name: 'Alice Johnson' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    },
    {
      id: '4',
      workspaceId: currentWorkspace?.id || '',
      userId: 'user-1',
      action: 'updated',
      resourceType: 'book',
      resourceId: 'book-3',
      details: { title: '1984' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: '5',
      workspaceId: currentWorkspace?.id || '',
      userId: 'user-4',
      action: 'returned',
      resourceType: 'book',
      resourceId: 'book-4',
      details: { title: 'Pride and Prejudice' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
  ];

  const activitiesToShow = displayActivities.length > 0 ? displayActivities : mockActivities.slice(0, limit);

  if (activitiesToShow.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Clock className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-center">
            No recent activity in this workspace
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activitiesToShow.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {activity.userId.slice(-2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`${getActivityColor(activity.action)} flex items-center gap-1`}>
                {getActivityIcon(activity.action, activity.resourceType)}
              </span>
              <Badge variant="outline" className="text-xs">
                {activity.resourceType}
              </Badge>
            </div>
            
            <p className="text-sm">
              <span className="font-medium">User {activity.userId.slice(-2)}</span>{' '}
              {formatActivityMessage(activity)}
            </p>
            
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}