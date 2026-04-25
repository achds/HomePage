import React from 'react'
import { Edit2, Trash2, ExternalLink } from 'lucide-react'
import { Service } from '../types'

interface ServiceListProps {
  services: Service[]
  onEdit: (service: Service) => void
  onDelete: (id: string) => void
}

const ServiceList: React.FC<ServiceListProps> = ({ services, onEdit, onDelete }) => {
  const handleServiceClick = (url: string) => {
    if (url === '#') return
    
    if (!url.startsWith('http')) {
      window.location.href = url
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // 判断图标类型
  const isImageIcon = (icon: string) => icon.startsWith('data:image/') || icon.startsWith('http')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">服务列表</h2>
          <p className="text-sm text-muted-foreground mt-1">
            管理您的所有个人服务，共 {services.length} 个
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <div className="mb-4 text-4xl">🚀</div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            还没有添加任何服务
          </h3>
          <p className="text-sm text-muted-foreground">
            点击上方"添加服务"按钮添加您的第一个服务
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">服务信息</th>
                <th className="px-4 py-3 font-medium">标签</th>
                <th className="px-4 py-3 font-medium">排序</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.sort((a, b) => (a.order || 0) - (b.order || 0)).map((service) => (
                <tr key={service.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl overflow-hidden">
                        {isImageIcon(service.icon) ? (
                          <img 
                            src={service.icon} 
                            alt={service.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          service.icon
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {service.name}
                          <button
                            onClick={() => handleServiceClick(service.url)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="访问服务"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {service.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                          {service.url}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {service.order || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(service)}
                        className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                      >
                        <Edit2 className="h-3 w-3" />
                        编辑
                      </button>
                      <button
                        onClick={() => onDelete(service.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                      >
                        <Trash2 className="h-3 w-3" />
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ServiceList
