import React, { useState, useEffect, useRef } from 'react'
import { X, Save, Type, Link, MessageSquare, Tag, Smile, ChevronDown, Upload, Image } from 'lucide-react'
import { Service, Tag as TagType } from '../types'

// 常用图标列表
const ICON_OPTIONS = [
  '🚀', '🌐', '📁', '📂', '💾', '🗄️', '🖥️', '💻', '📊', '📈', '📉',
  '🎬', '🎵', '🎮', '📸', '🎨', '✏️', '📝', '📋', '📌', '🔖', '📚',
  '⚙️', '🔧', '🔨', '💡', '🔌', '🔋', '📡', '📟', '💿', '📀', '💽',
  '🏠', '🏡', '🏢', '🏭', '🏪', '🏫', '🏥', '🏦', '🏰', '🏯', '🏟️',
  '☁️', '⛅', '🌤️', '🌦️', '🌧️', '⛈️', '❄️', '🌙', '☀️', '⭐', '🌟',
  '💬', '👥', '📢', '📣', '🔔', '🔊', '📞', '📟', '📠', '📡', '📺',
  '🍿', '🎪', '🎯', '🎲', '🎰', '🎳', '🏓', '🏸', '🏒', '🏑', '🏏'
]

// 图标上传限制
const ICON_MAX_SIZE = 100 * 1024 // 100KB

interface ServiceFormProps {
  service: Service | null
  onSubmit: (service: Omit<Service, 'id' | 'order'>) => void
  onCancel: () => void
  tags: TagType[]
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSubmit, onCancel, tags }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    icon: '🚀',
    iconType: 'emoji' as 'emoji' | 'image',
    tags: [] as string[],
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [uploadedIconPreview, setUploadedIconPreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 可用的标签选项（排除"全部"）
  const availableTags = tags.filter(tag => tag.id !== 'all')

  useEffect(() => {
    if (service) {
      const isImageIcon = service.icon.startsWith('data:image/') || service.icon.startsWith('http')
      setFormData({
        name: service.name,
        description: service.description,
        url: service.url,
        icon: service.icon,
        iconType: isImageIcon ? 'image' : 'emoji',
        tags: service.tags,
      })
      if (isImageIcon) {
        setUploadedIconPreview(service.icon)
      }
    }
  }, [service])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '服务名称不能为空'
    }
    
    if (!formData.url.trim()) {
      newErrors.url = '服务链接不能为空'
    }
    
    if (!formData.icon.trim()) {
      newErrors.icon = '服务图标不能为空'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate()) {
      onSubmit(formData)
    }
  }

  const handleTagToggle = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName]
    }))
  }

  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ 
      ...prev, 
      icon,
      iconType: 'emoji'
    }))
    setShowIconPicker(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, icon: '请上传图片文件（PNG、JPG、GIF等）' }))
      return
    }

    // 验证文件大小
    if (file.size > ICON_MAX_SIZE) {
      setErrors(prev => ({ ...prev, icon: `图标文件大小不能超过 ${ICON_MAX_SIZE / 1024}KB` }))
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      
      if (!result) {
        setErrors(prev => ({ ...prev, icon: '图片读取失败，请重试' }))
        return
      }
      
      // 验证是否为有效的 Data URL
      if (!result.startsWith('data:image/')) {
        setErrors(prev => ({ ...prev, icon: '无效的图片格式' }))
        return
      }
        
      setUploadedIconPreview(result)
      setFormData(prev => ({
        ...prev,
        icon: result,
        iconType: 'image'
      }))
      setErrors(prev => ({ ...prev, icon: '' }))
    }
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, icon: '图片读取失败，请重试' }))
    }
    reader.readAsDataURL(file)
  }

  const switchIconType = (type: 'emoji' | 'image') => {
    setFormData(prev => ({ ...prev, iconType: type }))
    if (type === 'emoji') {
      setFormData(prev => ({ ...prev, icon: '🚀' }))
      setUploadedIconPreview('')
    } else {
      setFormData(prev => ({ ...prev, icon: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {service ? '编辑服务' : '添加服务'}
        </h2>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <X className="h-4 w-4" />
          取消
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          {/* 服务名称 */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-foreground flex items-center gap-2">
              <Type className="h-4 w-4" />
              服务名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.name ? 'border-destructive' : ''
              }`}
              placeholder="请输入服务名称"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* 服务描述 */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              服务描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] ${
                errors.description ? 'border-destructive' : ''
              }`}
              placeholder="请输入服务描述（可选）"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* 服务链接 */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-foreground flex items-center gap-2">
              <Link className="h-4 w-4" />
              服务链接
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono ${
                errors.url ? 'border-destructive' : ''
              }`}
              placeholder="http://localhost:8080 或 /path"
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url}</p>
            )}
            <p className="text-xs text-muted-foreground">
              支持完整URL或相对路径，如：http://localhost:8080 或 /nas
            </p>
          </div>

          {/* 服务图标 */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-foreground flex items-center gap-2">
              <Smile className="h-4 w-4" />
              服务图标
            </label>
            
            {/* 图标类型切换 */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => switchIconType('emoji')}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-md border px-3 py-2 text-sm transition-colors ${
                  formData.iconType === 'emoji'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-background hover:bg-muted/50'
                }`}
              >
                <Smile className="h-4 w-4" />
                选择图标
              </button>
              <button
                type="button"
                onClick={() => switchIconType('image')}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-md border px-3 py-2 text-sm transition-colors ${
                  formData.iconType === 'image'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-background hover:bg-muted/50'
                }`}
              >
                <Upload className="h-4 w-4" />
                上传图标
              </button>
            </div>

            {/* 图标预览 */}
            <div className="flex gap-2 mb-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-md border border-input bg-background overflow-hidden">
                {formData.iconType === 'emoji' ? (
                  <span className="text-3xl">{formData.icon}</span>
                ) : uploadedIconPreview ? (
                  <img 
                    src={uploadedIconPreview} 
                    alt="上传的图标" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center text-sm text-muted-foreground">
                {formData.iconType === 'image' && (
                  <>
                    <p>建议尺寸: 64x64 像素</p>
                    <p>最大大小: 100KB</p>
                    <p>支持格式: PNG, JPG, GIF, SVG</p>
                  </>
                )}
                {formData.iconType === 'emoji' && (
                  <p>从下方选择一个 Emoji 图标</p>
                )}
              </div>
            </div>

            {/* Emoji 选择器 */}
            {formData.iconType === 'emoji' && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-full flex items-center justify-between h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <span>选择图标</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showIconPicker ? 'rotate-180' : ''}`} />
                </button>
                
                {showIconPicker && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-input bg-background shadow-lg">
                    <div className="grid grid-cols-8 gap-2 p-3">
                      {ICON_OPTIONS.map((icon, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleIconSelect(icon)}
                          className="flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted text-xl transition-colors"
                          title={icon}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 图片上传 */}
            {formData.iconType === 'image' && (
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {uploadedIconPreview ? '重新上传图标' : '点击上传图标'}
                </button>
              </div>
            )}

            {errors.icon && (
              <p className="text-sm text-destructive">{errors.icon}</p>
            )}
          </div>

          {/* 标签选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              标签
            </label>
            
            <div className="flex flex-wrap gap-2 p-3 rounded-md border border-input bg-background min-h-[80px]">
              {availableTags.length > 0 ? (
                availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                      formData.tags.includes(tag.name)
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {tag.icon && <span>{tag.icon}</span>}
                    {tag.name}
                    {formData.tags.includes(tag.name) && (
                      <X className="h-3 w-3 ml-0.5" />
                    )}
                  </button>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">暂无可用标签</span>
              )}
            </div>

            {formData.tags.length > 0 && (
              <p className="text-xs text-muted-foreground">
                已选择: {formData.tags.join('、')}
              </p>
            )}

            {errors.tags && (
              <p className="text-sm text-destructive">{errors.tags}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <X className="h-4 w-4" />
            取消
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            {service ? '保存修改' : '添加服务'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ServiceForm
