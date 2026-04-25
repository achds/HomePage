import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Settings, List, ArrowLeft } from 'lucide-react'
import ServiceList from '../components/ServiceList'
import ServiceForm from '../components/ServiceForm'
import SettingsPanel from '../components/SettingsPanel'
import { Service, Tag, AppSettings } from '../types'

interface AdminProps {
  services: Service[]
  tags: Tag[]
  settings: AppSettings
  onAddService: (service: Omit<Service, 'id' | 'order'>) => void
  onUpdateService: (id: string, service: Partial<Service>) => void
  onDeleteService: (id: string) => void
  onUpdateSettings: (settings: Partial<AppSettings>) => void
  onRefresh: () => void
}

type AdminView = 'list' | 'add' | 'edit' | 'settings'

const Admin: React.FC<AdminProps> = ({
  services,
  tags,
  settings,
  onAddService,
  onUpdateService,
  onDeleteService,
  onUpdateSettings
}) => {
  const [view, setView] = useState<AdminView>('list')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setView('edit')
  }

  const handleAdd = () => {
    setEditingService(null)
    setView('add')
  }

  const handleFormSubmit = async (serviceData: Omit<Service, 'id' | 'order'>) => {
    try {
      if (view === 'edit' && editingService) {
        await onUpdateService(editingService.id, serviceData)
        setMessage({ type: 'success', text: '服务已更新！' })
      } else {
        await onAddService(serviceData)
        setMessage({ type: 'success', text: '服务已添加！' })
      }
      setView('list')
      setEditingService(null)
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: '操作失败，请重试' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleFormCancel = () => {
    setView('list')
    setEditingService(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个服务吗？此操作无法撤销。')) {
      onDeleteService(id)
    }
  }

  const renderContent = () => {
    switch (view) {
      case 'list':
        return (
          <ServiceList
            services={services}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      case 'add':
      case 'edit':
        return (
          <ServiceForm
            service={editingService}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            tags={tags}
          />
        )
      case 'settings':
        return (
          <SettingsPanel
            settings={settings}
            onUpdate={onUpdateSettings}
            onBack={() => setView('list')}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in">
      {/* 导航栏 */}
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          
          <h1 className="text-2xl font-bold text-foreground">管理后台</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('list')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <List className="h-4 w-4" />
            服务列表
          </button>

          <button
            onClick={handleAdd}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === 'add'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Plus className="h-4 w-4" />
            添加服务
          </button>

          <button
            onClick={() => setView('settings')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              view === 'settings'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Settings className="h-4 w-4" />
            系统设置
          </button>
        </div>
      </nav>

      {/* 内容区域 */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
        {message && (
          <div className={`mb-4 rounded-md border p-3 text-sm ${
            message.type === 'success' 
              ? 'border-green-500/50 bg-green-500/10 text-green-600' 
              : 'border-destructive/50 bg-destructive/10 text-destructive'
          }`}>
            {message.text}
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  )
}

export default Admin
