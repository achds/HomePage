import React, { useState, useEffect } from 'react'
import { Save, X, Globe, MessageSquare, Palette, Settings } from 'lucide-react'
import { AppSettings } from '../types'
import { api } from '@/lib/api'

interface SettingsPanelProps {
  settings: AppSettings
  onUpdate: (settings: Partial<AppSettings>) => void
  onBack: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, onBack }) => {
  const [formData, setFormData] = useState(settings)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')

  useEffect(() => {
    setFormData(settings)
  }, [settings])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = '站点标题不能为空'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '站点描述不能为空'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      try {
        await onUpdate(formData)
        setImportSuccess('设置已保存！')
        setTimeout(() => setImportSuccess(''), 3000)
      } catch (error) {
        setImportError('保存失败，请重试')
        setTimeout(() => setImportError(''), 3000)
      }
    }
  }

  const handleExport = async () => {
    try {
      const data = await api.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `service-dashboard-backup-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      setImportSuccess('数据导出成功！')
      setTimeout(() => setImportSuccess(''), 3000)
    } catch (error) {
      setImportError('导出失败，请重试')
      setTimeout(() => setImportError(''), 3000)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportError('')
    setImportSuccess('')

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          
          if (!data.services || !data.settings) {
            throw new Error('无效的备份文件格式')
          }

          await api.importData(data)
          setImportSuccess('数据导入成功！正在刷新页面...')
          
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } catch (error) {
          setImportError(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`)
        } finally {
          setImporting(false)
          e.target.value = ''
        }
      }
      reader.readAsText(file)
    } catch (error) {
      setImportError('读取文件失败')
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5" />
          系统设置
        </h2>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <X className="h-4 w-4" />
          返回
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          {/* 站点标题 */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              站点标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.title ? 'border-destructive' : ''
              }`}
              placeholder="个人服务导航站"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* 站点描述 */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              站点描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] ${
                errors.description ? 'border-destructive' : ''
              }`}
              placeholder="管理和访问您的个人服务"
              rows={2}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* 主题设置 */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-foreground flex items-center gap-2">
              <Palette className="h-4 w-4" />
              主题模式
            </label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={formData.theme === 'light'}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="h-4 w-4"
                />
                <span className="text-sm">浅色模式</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={formData.theme === 'dark'}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="h-4 w-4"
                />
                <span className="text-sm">深色模式</span>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-muted/50">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={formData.theme === 'system'}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="h-4 w-4"
                />
                <span className="text-sm">跟随系统</span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              选择导航站的主题显示模式
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <X className="h-4 w-4" />
            返回
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            保存设置
          </button>
        </div>
      </form>

      {/* 数据管理 */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">数据管理</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-medium text-foreground mb-2">导出数据</h4>
            <p className="text-sm text-muted-foreground mb-4">
              将所有服务和设置导出为JSON文件
            </p>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              导出JSON
            </button>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h4 className="font-medium text-foreground mb-2">导入数据</h4>
            <p className="text-sm text-muted-foreground mb-4">
              从JSON文件导入服务和设置
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 cursor-pointer"
            >
              选择JSON文件
            </label>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-destructive/50 p-4">
          <h4 className="font-medium text-destructive mb-2">危险操作</h4>
          <p className="text-sm text-muted-foreground mb-4">
            清空所有服务和设置数据，此操作不可撤销
          </p>
          <button
            onClick={async () => {
              if (window.confirm('确定要清空所有数据吗？此操作不可撤销！')) {
                try {
                  await api.clearAll()
                  setImportSuccess('数据已清空！正在刷新页面...')
                  setTimeout(() => {
                    window.location.reload()
                  }, 1500)
                } catch (error) {
                  setImportError('清空数据失败，请重试')
                }
              }
            }}
            className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            清空所有数据
          </button>
        </div>
      </div>
      
      {/* 消息提示 */}
      {importError && (
        <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {importError}
        </div>
      )}
      {importSuccess && (
        <div className="mt-4 rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600">
          {importSuccess}
        </div>
      )}
      {importing && (
        <div className="mt-4 text-sm text-muted-foreground">
          正在导入数据...
        </div>
      )}
    </div>
  )
}

export default SettingsPanel
