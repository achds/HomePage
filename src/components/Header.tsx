import React from 'react'
import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'

interface HeaderProps {
  title: string
  showAdminLink?: boolean
}

const Header: React.FC<HeaderProps> = ({ title, showAdminLink = false }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-8 w-8 rounded-lg object-contain"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        
        {showAdminLink && (
          <Link
            to="/admin"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            title="管理后台"
          >
            <Settings className="h-4 w-4" />
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header
