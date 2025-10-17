import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import {
  Home,
  FileText,
  BarChart3,
  Mic,
  BookOpen,
  User,
  Settings,
  LogOut,
  Sun
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import type { Module } from '../App';

interface NavigationProps {
  activeTab: Module;
  onTabChange: (tab: Module) => void;
}

const tabs = [
  {
    id: 'home' as Module,
    label: 'Home',
    icon: Home,
  },
  {
    id: 'resume-critique' as Module,
    label: 'Resume Critique',
    icon: FileText,
  },
  {
    id: 'job-fit' as Module,
    label: 'Job Fit',
    icon: BarChart3,
  },
  {
    id: 'interview-prep' as Module,
    label: 'Interview Prep',
    icon: Mic,
  },
  {
    id: 'learning-plan' as Module,
    label: 'Learning Plan',
    icon: BookOpen,
  }
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserDisplayName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`;
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🎯</span>
            </div>
            <h1 className="text-xl text-gray-900">JobFit</h1>
          </div>

          {/* Center: Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-white shadow-sm text-blue-600 border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              // onClick={toggleTheme}
              className="h-9 w-9 p-0 rounded-full"
            >
              <Sun className="h-4 w-4" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full bg-transparent border-0 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {user ? getUserInitials(user.first_name, user.last_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="text-sm text-gray-900">
                      {user ? getUserDisplayName(user.first_name, user.last_name) : 'User'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}