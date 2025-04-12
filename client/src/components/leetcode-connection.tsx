import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { setLeetCodeUsername } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Settings, Unlink, RefreshCw, MoreVertical } from "lucide-react";
import LeetCodeUsernameForm from "./leetcode-username-form";

interface LeetCodeConnectionProps {
  username: string;
  onUpdate: () => void;
}

interface SyncOption {
  label: string;
  endpoint: string;
}

const syncOptions: SyncOption[] = [
  { label: "All Stats", endpoint: "/api/leetcode/refresh" },
  { label: "Problem Stats", endpoint: "/api/leetcode/refresh/problems" },
  { label: "Contest History", endpoint: "/api/leetcode/refresh/contests" },
  { label: "Submissions", endpoint: "/api/leetcode/refresh/submissions" },
  { label: "Badges", endpoint: "/api/leetcode/refresh/badges" },
];

export default function LeetCodeConnection({ username, onUpdate }: LeetCodeConnectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncingOption, setSyncingOption] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSync = async (option: SyncOption) => {
    setSyncingOption(option.label);
    try {
      const response = await fetch(option.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sync data');
      }

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${option.label.toLowerCase()}.`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || `Failed to sync ${option.label.toLowerCase()}.`,
        variant: "destructive",
      });
    } finally {
      setSyncingOption(null);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await setLeetCodeUsername("");
      toast({
        title: "Account Disconnected",
        description: "Your LeetCode account has been disconnected.",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Change LeetCode Account</h3>
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
        <LeetCodeUsernameForm
          currentUsername={username}
          onSuccess={() => {
            setIsEditing(false);
            onUpdate();
          }}
        />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold mb-1">Connected LeetCode Account</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your progress and statistics are synced with this account.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {syncOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.label}
                    onClick={() => handleSync(option)}
                    disabled={!!syncingOption}
                  >
                    {syncingOption === option.label ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      option.label
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Change
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <img
                src={`https://leetcode.com/${username}/avatar`}
                alt="LeetCode Avatar"
                className="h-12 w-12 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = "https://assets.leetcode.com/users/default_avatar.jpg";
                }}
              />
            </div>
            <div>
              <p className="font-medium">{username}</p>
              <a
                href={`https://leetcode.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                View Profile
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Unlink className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect LeetCode Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the connection to your LeetCode account. Your progress and statistics will no longer be synced.
                  You can reconnect your account at any time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisconnect}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isLoading}
                >
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
} 