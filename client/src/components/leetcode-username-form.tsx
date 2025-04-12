import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { setLeetCodeUsername } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface LeetCodeUsernameFormProps {
  onSuccess?: () => void;
  currentUsername?: string;
}

export default function LeetCodeUsernameForm({ onSuccess, currentUsername }: LeetCodeUsernameFormProps) {
  const [username, setUsername] = useState(currentUsername || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter your LeetCode username",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending request to set LeetCode username:", username.trim());
      const response = await fetch('/api/leetcode/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ leetcodeUsername: username.trim() }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        console.error("API error response:", data);
        throw new Error(data.message || 'Failed to update LeetCode username');
      }

      if (!data.success) {
        console.error("API success false:", data);
        throw new Error(data.message || 'Failed to update LeetCode username');
      }

      toast({
        title: "Success!",
        description: "Your LeetCode username has been updated. Your stats will sync automatically.",
        duration: 5000,
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setLocation("/dashboard");
      }, 1000);

    } catch (error: any) {
      console.error('Detailed error setting LeetCode username:', {
        error,
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      let errorMessage = "Failed to update LeetCode username. Please try again.";
      if (error.status === 401) {
        errorMessage = "Please log in to connect your LeetCode account.";
      } else if (error.message?.includes('rate limit')) {
        errorMessage = "LeetCode API rate limit reached. Please try again in a few minutes.";
      } else if (error.message?.includes('not found')) {
        errorMessage = "Could not find your LeetCode profile. Please check the username.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Connect LeetCode Account</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter your LeetCode username to sync your progress and statistics.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your LeetCode username"
              disabled={isLoading}
              className="flex-1"
            />
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Make sure:</p>
            <ul className="list-disc list-inside ml-2">
              <li>Your LeetCode profile is public</li>
              <li>You've entered the exact username (case-sensitive)</li>
              <li>The username is from leetcode.com (not leetcode.cn)</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Account"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
} 