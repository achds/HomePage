import { useState, useMemo } from 'react'
import ServiceCard from '../components/ServiceCard'
import { Service, Tag } from '../types'

interface DashboardProps {
  services: Service[]
  tags: Tag[]
}

const Dashboard: React.FC<DashboardProps> = ({ services, tags }) => {
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(true)

  const handleTagClick = (tagId: string) => {
    setSelectedTag(tagId)
    setShouldAnimate(false)
  }

  const filteredServices = useMemo(() => {
    let filtered = services

    if (selectedTag !== 'all') {
      const selectedTagObj = tags.find(t => t.id === selectedTag)
      const selectedTagName = selectedTagObj?.name || ''
      filtered = filtered.filter(service =>
        service.tags.includes(selectedTagName)
      )
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [services, selectedTag, searchQuery, tags, shouldAnimate])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 搜索栏 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索服务..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShouldAnimate(false)
          }}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          🔍
        </span>
      </div>

      {/* 标签导航 */}
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag.id)}
            className={`tag-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedTag === tag.id
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <span className="text-lg">{tag.icon}</span>
            {tag.name}
          </button>
        ))}
      </div>

      {/* 服务网格 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} shouldAnimate={shouldAnimate} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
            <div className="mb-4 text-4xl">🤔</div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              没有找到匹配的服务
            </h3>
            <p className="text-sm text-muted-foreground">
              尝试调整搜索条件或标签筛选
            </p>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="mt-12 flex justify-center">
        <div className="rounded-lg bg-muted px-6 py-3 text-sm text-muted-foreground">
          共 {services.length} 个服务 · 显示 {filteredServices.length} 个
        </div>
      </div>
    </div>
  )
}

export default Dashboard
