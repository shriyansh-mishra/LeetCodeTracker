import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun, Code, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logoutUser } from "@/lib/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
  
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/me"],
    onError: () => {
      // Fail silently, user is not logged in
    }
  });
  
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/");
    }
  });

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <nav className="bg-white shadow dark:bg-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-primary" />
            <Link href="/">
              <span className="text-xl font-bold text-primary dark:text-white cursor-pointer">
                CodeTrack
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <span className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white cursor-pointer">
                Home
              </span>
            </Link>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            {userData ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              className="mobile-menu-button p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mt-3 border-t border-gray-200 dark:border-gray-700 py-2">
            <Link href="/">
              <span 
                className="block py-2 text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Home
              </span>
            </Link>
            {userData ? (
              <>
                <Link href="/dashboard">
                  <span 
                    className="block py-2 text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </span>
                </Link>
                <button 
                  className="block w-full text-left py-2 text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                  onClick={() => {
                    logoutMutation.mutate();
                    setIsOpen(false);
                  }}
                  disabled={logoutMutation.isPending}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <span 
                    className="block py-2 text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </span>
                </Link>
                <Link href="/signup">
                  <span 
                    className="block py-2 text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </span>
                </Link>
              </>
            )}
            <button 
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="flex items-center py-2 text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white"
            >
              <span className="mr-2">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
