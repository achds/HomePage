import React from 'react'
import { ExternalLink } from 'lucide-react'
import { Service } from '../types'

interface ServiceCardProps {
  service: Service
  shouldAnimate?: boolean
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, shouldAnimate = true }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (service.url === '#') {
      e.preventDefault()
      return
    }
    
    if (!service.url.startsWith('http')) {
      window.location.href = service.url
    } else {
      window.open(service.url, '_blank', 'noopener,noreferrer')
    }
  }

  // 判断图标类型
  const isImageIcon = service.icon.startsWith('data:image/') || service.icon.startsWith('http')

  return (
    <div
      onClick={handleClick}
      className={`service-card group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg hover:shadow-xl ${
        shouldAnimate ? 'animate-slide-up' : ''
      }`}
      style={shouldAnimate ? { animationDelay: `${service.order! * 0.1}s` } : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl overflow-hidden">
              {isImageIcon ? (
                <img 
                  src={service.icon} 
                  alt={service.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                service.icon
              )}
            </div>
            
            <h3 className="mb-2 text-lg font-semibold leading-none tracking-tight">
              {service.name}
            </h3>
            
            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
              {service.description}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {service.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
