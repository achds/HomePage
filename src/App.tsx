import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Header from './components/Header'
import Footer from './components/Footer'
import { api } from './lib/api'
import { Service, Tag, AppSettings } from './types'

const defaultTags: Tag[] = [
  { id: 'all', name: '全部', icon: '🌐' },
  { id: 'storage', name: '存储', icon: '💾' },
  { id: 'media', name: '媒体', icon: '🎬' },
  { id: 'tool', name: '工具', icon: '🔧' },
  { id: 'writing', name: '写作', icon: '✍️' }
]

function App() {
  const [services, setServices] = useState<Service[]>([])
  const [tags] = useState<Tag[]>(defaultTags)
  const [settings, setSettings] = useState<AppSettings>({
    title: '个人服务导航站',
    description: '管理和访问您的个人服务',
    theme: 'system' as const
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  // 应用主题设置
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement
      
      // 移除所有主题类
      root.classList.remove('light', 'dark')
      
      // 根据设置应用主题
      if (settings.theme === 'system') {
        // 跟随系统，使用媒体查询
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', isDark)
      } else {
        // 应用指定主题
        root.classList.add(settings.theme)
      }
    }

    applyTheme()

    // 监听系统主题变化（仅在设置为system时）
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme()
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [settings.theme])

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.getServices()
      } catch (error) {
        console.error('无法连接到后端服务器:', error)
      }
    }
    checkBackend()
  }, [])

  const loadInitialData = async () => {
    try {
      const [servicesData, settingsData] = await Promise.all([
        api.getServices(),
        api.getSettings()
      ])
      setServices(servicesData)
      setSettings(settingsData)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const addService = async (service: Omit<Service, 'id' | 'order'>) => {
    try {
      const newService = await api.createService(service)
      setServices(prev => [...prev, newService])
    } catch (error) {
      console.error('添加服务失败:', error)
      throw error
    }
  }

  const updateService = async (id: string, service: Partial<Service>) => {
    try {
      await api.updateService(id, service)
      setServices(prev => prev.map(s => s.id === id ? { ...s, ...service } : s))
    } catch (error) {
      console.error('更新服务失败:', error)
      throw error
    }
  }

  const deleteService = async (id: string) => {
    try {
      await api.deleteService(id)
      setServices(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('删除服务失败:', error)
      throw error
    }
  }

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      await api.updateSettings(newSettings)
      setSettings(prev => ({ ...prev, ...newSettings }))
    } catch (error) {
      console.error('更新设置失败:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <Header 
        title={settings.title}
        showAdminLink={true}
      />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                services={services}
                tags={tags}
              />
            } 
          />
          <Route 
            path="/admin" 
            element={
              <Admin
                services={services}
                tags={tags}
                settings={settings}
                onAddService={addService}
                onUpdateService={updateService}
                onDeleteService={deleteService}
                onUpdateSettings={updateSettings}
                onRefresh={loadInitialData}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default App
