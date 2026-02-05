// 配置和状态
let sitesConfig = null;
let testResults = {
  internal: [],
  domestic: [],
  overseas: []
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadSitesConfig();
  bindEvents();
});

// 加载站点配置
async function loadSitesConfig() {
  try {
    const response = await fetch('sites.json');
    sitesConfig = await response.json();
    console.log('站点配置加载成功:', sitesConfig);
    
    // 显示站点并开始测试
    displayAllSites();
    startTest();
  } catch (error) {
    console.error('加载站点配置失败:', error);
    showError('加载配置失败，请确保 sites.json 文件存在');
  }
}

// 绑定事件
function bindEvents() {
  document.getElementById('refreshBtn').addEventListener('click', startTest);
}

// 显示所有站点（初始状态为加载中）
function displayAllSites() {
  const container = document.getElementById('categoriesContainer');
  container.innerHTML = '';

  const categories = [
    { key: 'internal', icon: '🏢', name: '内网站点', desc: '公司内部网络服务' },
    { key: 'domestic', icon: '🇨🇳', name: '国内站点', desc: '中国大陆常用网站' },
    { key: 'overseas', icon: '🌍', name: '海外站点', desc: '海外常用服务' }
  ];

  for (const cat of categories) {
    const sites = sitesConfig.sites.filter(s => s.category === cat.key);
    if (sites.length > 0) {
      const categoryHTML = createCategoryHTML(cat, sites);
      container.innerHTML += categoryHTML;
    }
  }
}

// 创建类别HTML
function createCategoryHTML(category, sites) {
  const sitesHTML = sites.map(site => createSiteLoadingCardHTML(site)).join('');
  
  return `
    <div class="category">
      <div class="category-header">
        <span class="category-icon">${category.icon}</span>
        <span class="category-name">${category.name}</span>
        <span class="category-desc">${category.desc}</span>
      </div>
      <div class="sites-grid">
        ${sitesHTML}
      </div>
    </div>
  `;
}

// 创建站点卡片HTML（加载中状态）
function createSiteLoadingCardHTML(site) {
  return `
    <div class="site-card" id="site-${site.category}-${site.name.replace(/\s+/g, '-')}">
      <div class="site-header">
        <div>
          <div class="site-name">${site.name}</div>
          <div class="site-url">${site.url}</div>
        </div>
        <div class="site-latency">
          <span class="latency-badge" id="badge-${site.category}-${site.name.replace(/\s+/g, '-')}">
            <span class="site-loading">
              <span class="site-spinner"></span>
              <span class="loading-text">测试中...</span>
            </span>
          </span>
        </div>
      </div>
      <div class="site-details">
        <div class="detail-item">
          <span class="status-dot" id="status-${site.category}-${site.name.replace(/\s+/g, '-')}" style="background: #00d4ff;"></span>
          <span id="detail-${site.category}-${site.name.replace(/\s+/g, '-')}">连接测试中...</span>
        </div>
      </div>
    </div>
  `;
}

// 开始测试
async function startTest() {
  if (!sitesConfig) return;

  // 重置状态
  testResults = { internal: [], domestic: [], overseas: [] };

  // 按类别测试
  const categories = ['internal', 'domestic', 'overseas'];
  
  for (const category of categories) {
    const sites = sitesConfig.sites.filter(s => s.category === category);
    for (const site of sites) {
      const result = await testSite(site);
      updateSiteCard(site, result);
      testResults[category].push(result);
    }
  }

  // 更新统计
  updateSummary();
}

// 测试单个站点
async function testSite(site) {
  const startTime = performance.now();
  let status = 'success';
  let latency = 0;
  let errorMsg = '';

  try {
    const testUrl = site.url + (site.url.includes('?') ? '&' : '?') + '_=' + Date.now();
    
    const response = await fetch(testUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store'
    });
    
    latency = Math.round(performance.now() - startTime);
    
    if (response.ok || response.type === 'opaque') {
      status = 'success';
    } else {
      status = 'error';
      errorMsg = `HTTP ${response.status}`;
    }
    
  } catch (error) {
    status = 'error';
    errorMsg = error.message || '连接失败';
    latency = Math.round(performance.now() - startTime);
  }

  return {
    name: site.name,
    url: site.url,
    category: site.category,
    latency,
    status,
    errorMsg,
    timestamp: new Date().toISOString()
  };
}

// 更新站点卡片
function updateSiteCard(site, result) {
  const cardId = `site-${site.category}-${site.name.replace(/\s+/g, '-')}`;
  const badgeId = `badge-${site.category}-${site.name.replace(/\s+/g, '-')}`;
  const statusId = `status-${site.category}-${site.name.replace(/\s+/g, '-')}`;
  const detailId = `detail-${site.category}-${site.name.replace(/\s+/g, '-')}`;
  
  const badgeEl = document.getElementById(badgeId);
  const statusEl = document.getElementById(statusId);
  const detailEl = document.getElementById(detailId);
  
  if (!badgeEl || !statusEl || !detailEl) return;

  const { latency, status, errorMsg } = result;
  
  let badgeClass = 'good';
  let statusClass = 'success';
  let displayLatency = `${latency}ms`;
  let statusText = '连接正常';
  let detailText = `${latency}ms`;
  
  if (status === 'error') {
    badgeClass = 'error';
    statusClass = 'error';
    displayLatency = '失败';
    statusText = errorMsg;
    detailText = errorMsg;
  } else if (latency < 100) {
    badgeClass = 'good';
    statusClass = 'success';
  } else if (latency < 300) {
    badgeClass = 'moderate';
    statusClass = 'timeout';
  } else {
    badgeClass = 'poor';
    statusClass = 'timeout';
  }
  
  badgeEl.className = `latency-badge ${badgeClass}`;
  badgeEl.innerHTML = displayLatency;
  
  statusEl.className = `status-dot ${statusClass}`;
  
  detailEl.textContent = detailText;
}

// 更新统计
function updateSummary() {
  const allResults = [
    ...testResults.internal,
    ...testResults.domestic,
    ...testResults.overseas
  ];
  
  const total = allResults.length;
  const good = allResults.filter(r => r.status === 'success' && r.latency < 100).length;
  const moderate = allResults.filter(r => r.status === 'success' && r.latency >= 100 && r.latency < 300).length;
  const poor = allResults.filter(r => r.status === 'error' || r.latency >= 300).length;

  document.getElementById('totalSites').textContent = total;
  document.getElementById('goodCount').textContent = good;
  document.getElementById('moderateCount').textContent = moderate;
  document.getElementById('poorCount').textContent = poor;
}

// 显示错误
function showError(message) {
  alert(message);
}
