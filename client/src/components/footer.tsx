import { Link } from "wouter";
import { Code, Github, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Code className="h-6 w-6 text-primary mr-2" />
            <span className="text-gray-800 dark:text-white font-medium">CodeTrack</span>
          </div>
          <div className="mb-4 md:mb-0 flex space-x-4">
            <Link href="/">
              <span className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white cursor-pointer">
                Home
              </span>
            </Link>
            <Link href="/dashboard">
              <span className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white cursor-pointer">
                Dashboard
              </span>
            </Link>
          </div>
          <div className="flex space-x-3">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} CodeTrack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
