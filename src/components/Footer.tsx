import React from 'react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Personal Service Dashboard. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-4">
            Powered by React + Vite + Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
