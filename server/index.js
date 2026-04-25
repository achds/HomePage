const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// 允许所有来源
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method !== 'GET') {
    console.log('Request body:', req.body);
  }
  next();
});

const dataDir = path.join(__dirname, 'data');
const servicesFile = path.join(dataDir, 'services.json');
const settingsFile = path.join(dataDir, 'settings.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化数据文件
function initializeData() {
  if (!fs.existsSync(servicesFile)) {
    fs.writeFileSync(servicesFile, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(settingsFile)) {
    const defaultSettings = {
      id: 1,
      title: '个人服务导航站',
      description: '管理和访问您的个人服务',
      theme: 'system'
    };
    fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2));
  }
  
  console.log('数据文件初始化完成');
}

initializeData();

// 读取服务数据
function readServices() {
  try {
    const data = fs.readFileSync(servicesFile, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('读取服务数据失败:', err.message);
    return [];
  }
}

// 写入服务数据
function writeServices(services) {
  try {
    fs.writeFileSync(servicesFile, JSON.stringify(services, null, 2));
    return true;
  } catch (err) {
    console.error('写入服务数据失败:', err.message);
    return false;
  }
}

// 读取设置数据
function readSettings() {
  try {
    const data = fs.readFileSync(settingsFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('读取设置数据失败:', err.message);
    return {
      id: 1,
      title: '个人服务导航站',
      description: '管理和访问您的个人服务',
      theme: 'system'
    };
  }
}

// 写入设置数据
function writeSettings(settings) {
  try {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    return true;
  } catch (err) {
    console.error('写入设置数据失败:', err.message);
    return false;
  }
}

app.get('/api/services', (req, res) => {
  const services = readServices();
  res.json(services);
});

app.post('/api/services', (req, res) => {
  try {
    const { id, name, description, url, icon, tags, order } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const services = readServices();
    const newService = {
      id,
      name,
      description,
      url,
      icon,
      tags: tags || [],
      order: order || 0
    };
    
    services.push(newService);
    writeServices(services);
    
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, url, icon, tags, order } = req.body;
    
    const services = readServices();
    const index = services.findIndex(s => s.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    services[index] = {
      id,
      name,
      description,
      url,
      icon,
      tags: tags || [],
      order: order || 0
    };
    
    writeServices(services);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id', (req, res) => {
  try {
    const { id } = req.params;
    const services = readServices();
    const filteredServices = services.filter(s => s.id !== id);
    
    if (filteredServices.length === services.length) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    writeServices(filteredServices);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', (req, res) => {
  const settings = readSettings();
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  try {
    const { title, description, theme } = req.body;
    
    const settings = readSettings();
    const updatedSettings = {
      ...settings,
      title: title || settings.title,
      description: description || settings.description,
      theme: theme || settings.theme
    };
    
    writeSettings(updatedSettings);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/import', (req, res) => {
  try {
    const { services, settings } = req.body;
    
    if (!services || !settings) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    writeServices(services);
    writeSettings(settings);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export', (req, res) => {
  try {
    const services = readServices();
    const settings = readSettings();
    
    const exportData = {
      services,
      settings,
      exportDate: new Date().toISOString()
    };
    
    res.json(exportData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clear-all', (req, res) => {
  try {
    const defaultSettings = {
      id: 1,
      title: '个人服务导航站',
      description: '管理和访问您的个人服务',
      theme: 'system'
    };
    
    writeServices([]);
    writeSettings(defaultSettings);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API 文档: http://localhost:${PORT}/api/*`);
  console.log(`数据文件位置: ${dataDir}`);
});

process.on('SIGINT', () => {
  console.log('\n服务器已关闭');
  process.exit(0);
});
