import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, FileText, Sun, Moon, Sparkles } from 'lucide-react';
import type { ResumeVersion } from '../App';

interface TopBarProps {
  currentResume?: ResumeVersion;
}

export function TopBar({ currentResume }: TopBarProps) {

  const handleDownload = () => {
    if (!currentResume) return;
    
    const blob = new Blob([currentResume.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-v${currentResume.version}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
      
      <div className="flex items-center space-x-6 relative z-10">
        {/* Current Resume Info */}
        {currentResume ? (
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Currently analyzing:</span>
              <Badge variant="outline" className="border-primary/30 bg-primary/5">
                Resume v{currentResume.version} (latest)
              </Badge>
              {currentResume.analysisScore && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Score: {currentResume.analysisScore}
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-muted/50 border border-border">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">No resume uploaded</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3 relative z-10">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-9 w-9 p-0 rounded-full hover:bg-accent/50 transition-all duration-200"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100" />
          ) : (
            <Sun className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100" />
          )}
        </Button>

        {/* Download Resume Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!currentResume}
          className="flex items-center space-x-2 transition-all duration-200 hover:shadow-md hover:scale-105 disabled:hover:scale-100"
        >
          <Download className="h-4 w-4" />
          <span>Download Resume</span>
        </Button>
      </div>
    </header>
  );
}