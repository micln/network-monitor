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
  } catch (error) {
    console.error('加载站点配置失败:', error);
    showError('加载配置失败，请确保 sites.json 文件存在');
  }
}

// 绑定事件
function bindEvents() {
  document.getElementById('startBtn').addEventListener('click', startTest);
  document.getElementById('refreshBtn').addEventListener('click', startTest);
}

// 开始测试
async function startTest() {
  if (!sitesConfig) {
    showError('配置未加载，请刷新页面重试');
    return;
  }

  // 重置状态
  testResults = { internal: [], domestic: [], overseas: [] };
  
  // UI 更新
  document.getElementById('startBtn').disabled = true;
  document.getElementById('refreshBtn').style.display = 'none';
  document.getElementById('results').style.display = 'none';
  document.getElementById('loading').style.display = 'block';

  // 按类别测试
  const categories = ['internal', 'domestic', 'overseas'];
  
  for (const category of categories) {
    testResults[category] = await testSites(sitesConfig.sites.filter(s => s.category === category));
  }

  // 显示结果
  displayResults();
}

// 测试一组站点
async function testSites(sites) {
  const results = [];
  
  for (const site of sites) {
    const result = await testSite(site);
    results.push(result);
  }
  
  return results;
}

// 测试单个站点
async function testSite(site) {
  const startTime = performance.now();
  let status = 'success';
  let latency = 0;
  let errorMsg = '';

  try {
    // 使用 fetch 测试，添加时间戳防止缓存
    const testUrl = site.url + (site.url.includes('?') ? '&' : '?') + '_=' + Date.now();
    
    const response = await fetch(testUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store'
    });
    
    latency = Math.round(performance.now() - startTime);
    
    // 状态码检查（no-cors 模式下可能获取不到）
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

// 显示结果
function displayResults() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('results').style.display = 'block';
  document.getElementById('refreshBtn').style.display = 'inline-flex';
  document.getElementById('startBtn').disabled = false;

  // 更新统计
  updateSummary();

  // 按类别显示
  const container = document.getElementById('categoriesContainer');
  container.innerHTML = '';

  const categories = [
    { key: 'internal', icon: '🏢', name: '内网站点', desc: '公司内部网络服务' },
    { key: 'domestic', icon: '🇨🇳', name: '国内站点', desc: '中国大陆常用网站' },
    { key: 'overseas', icon: '🌍', name: '海外站点', desc: '海外常用服务' }
  ];

  for (const cat of categories) {
    if (testResults[cat.key].length > 0) {
      const categoryHTML = createCategoryHTML(cat, testResults[cat.key]);
      container.innerHTML += categoryHTML;
    }
  }
}

// 创建类别HTML
function createCategoryHTML(category, results) {
  const sitesHTML = results.map(site => createSiteCardHTML(site)).join('');
  
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

// 创建站点卡片HTML
function createSiteCardHTML(site) {
  const { latency, status, errorMsg } = site;
  
  let badgeClass = 'good';
  let statusDot = 'success';
  let displayLatency = `${latency}ms`;
  
  if (status === 'error') {
    badgeClass = 'error';
    statusDot = 'error';
    displayLatency = '失败';
  } else if (latency < 100) {
    badgeClass = 'good';
    statusDot = 'success';
  } else if (latency < 300) {
    badgeClass = 'moderate';
    statusDot = 'timeout';
  } else {
    badgeClass = 'poor';
    statusDot = 'timeout';
  }
  
  return `
    <div class="site-card">
      <div class="site-header">
        <div>
          <div class="site-name">${site.name}</div>
          <div class="site-url">${site.url}</div>
        </div>
        <div class="site-latency">
          <span class="latency-badge ${badgeClass}">${displayLatency}</span>
        </div>
      </div>
      <div class="site-details">
        <div class="detail-item">
          <span class="status-dot ${statusDot}"></span>
          <span>${status === 'success' ? '连接正常' : errorMsg}</span>
        </div>
      </div>
    </div>
  `;
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
