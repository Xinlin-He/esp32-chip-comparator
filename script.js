let chipsData = { chips: {}, series_info: {} };
let selectedChips = [];
let activeCategory = 'main';
let periSearchQuery = '';

const featureGroups = {
    main: [
        { key: 'series', label: '系列' },
        { key: 'cpu', label: 'CPU 架构' },
        { key: 'freq', label: '最高主频' },
        { key: 'wifi', label: 'Wi-Fi' },
        { key: 'ble', label: '蓝牙' },
        { key: 'ls', label: 'Light-sleep' },
        { key: 'ds', label: 'Deep-sleep' }
    ],
    core: [
        { key: 'cpu', label: '处理器核心' },
        { key: 'freq', label: '时钟主频' },
        { key: 'rom', label: 'ROM' },
        { key: 'sram', label: 'SRAM' },
        { key: 'psram', label: 'PSRAM 支持' },
        { key: 'gpio', label: '可用 GPIO' }
    ],
    comm: [
        { key: 'wifi', label: 'Wi-Fi 标准' },
        { key: 'ble', label: '蓝牙版本' },
        { key: '15.4', label: 'IEEE 802.15.4' }
    ],
    power: [
        { key: 'ls', label: 'Light-sleep 电流' },
        { key: 'ds', label: 'Deep-sleep 电流' }
    ],
    peri: []
};

const featureExplanations = {
    'series': '<b>系列定位</b>：S(高性能)、C(极致性价比)、H(智能家居协议)、P(通用高性能)、Original(经典款)。不同系列针对不同应用广度。',
    'cpu': '<b>CPU 架构</b>：双核 (Dual-core) 允许将无线协议栈与用户逻辑分离，提供高实时性。单核 (Single-core) 通常功耗更低。RISC-V 是开源架构，Xtensa 是定制的高性能架构。',
    'freq': '<b>最高主频</b>：主频决定计算速度。主频越高，处理音频、图形或复杂算法能力越强。低功耗场景常运行在较低主频以省电。',
    'wifi': '<b>Wi-Fi 标准</b>：Wi-Fi 6 (ax) 引入 OFDMA 和 TWT，在高密度物联网环境中效率更高、延时更低且更省电。2.4G 穿透好，5G 带宽大。',
    'ble': '<b>蓝牙版本</b>：蓝牙 5.0+ 提升了传输距离 (Long Range) 和数据吞吐。蓝牙 6.0 增强了精确定位。LE Audio 提供了更先进的音频流处理。',
    'ls': '<b>Light-sleep (轻度睡眠)</b>：该模式下 CPU 暂停工作但保持状态，唤醒极快。电流越小，对于需要频繁唤醒（如保持 Wi-Fi 连接）的设备越省电。',
    'ds': '<b>Deep-sleep (深度睡眠)</b>：极低功耗模式，仅 RTC 域工作。电流大小直接决定了电池供电传感器（如温湿度计）数年的待机时长。',
    'rom': '<b>ROM (只读存储)</b>：芯片内部固化的代码空间，存放启动加载程序和内置库函数。越大意味着固件能调用的内置功能越多。',
    'sram': '<b>SRAM (静态随机存储)</b>：运行时内存。SRAM 越大，能同时处理的任务越复杂（如 TLS 连接、大缓冲区数据处理）。',
    'psram': '<b>PSRAM (伪静态随机存储)</b>：外部扩展内存，主要用于音频缓冲、大型显示屏驱动或 AI 模型处理。',
    'gpio': '<b>GPIO (通用 IO)</b>：可编程引脚数量。引脚越多，可同时连接的外设（LED、按键、传感器、屏幕）越丰富。',
    '15.4': '<b>IEEE 802.15.4</b>：支持 Zigbee、Thread 和 Matter 协议的基础，专为超低功耗、低比特率的网状网络设计。',
    'GPIO': '<b>GPIO (通用输入输出)</b>：设备最基础的接口。更多的引脚意味着可以控制更多的硬件模块而无需扩展芯片。',
    'ADC': '<b>ADC (模数转换器)</b>：将模拟信号（如传感器电压）转换为数字。分辨率越高（如 12-bit），采样得到的数据越精确。',
    'UART': '<b>UART (串口)</b>：通用的异步串行通信接口。常用于打印日志、连接 GPS 或其他 MCU。',
    'I2C': '<b>I2C (总线接口)</b>：两线制串行总线。适合连接大量传感器和显示屏幕。',
    'SPI': '<b>SPI (串行外设接口)</b>：高速串行通信。常用于驱动高分辨率 LCD、SD 卡或高速传感器。',
    'I2S': '<b>I2S (音频接口)</b>：专用于传输高质量音频数据。常用于连接麦克风和扬声器。',
    'PWM': '<b>PWM (脉宽调制)</b>：LEDC 用于控制灯光亮度和颜色，MCPWM 专门用于电机、波形发生器等运动控制。',
    'RMT': '<b>RMT (远程控制)</b>：支持红外编码传输，也可用于驱动 WS2812 等对时序要求极严的 RGB 灯条。',
    'USB': '<b>USB 接口</b>：Serial/JTAG 用于调试；2.0 OTG 支持高速数据传输，可作为 U 盘、键盘等设备的主机或从机。',
    'TWAI': '<b>TWAI (双线汽车接口)</b>：兼容 CAN 总线。CAN FD 支持更高的比特率和更大的载荷，广泛用于机器人和车载。',
    'Security': '<b>安全特性</b>：硬件加密加速器（AES/SHA/RSA）和安全认证机制（Secure Boot/Flash Encryption）从硬件层面保护代码隐私和通信安全。',
    'Touch': '<b>电容触摸接口</b>：通过引脚感知人体触摸，无需实体按键即可实现触摸开关功能。',
    'LCD/Camera': '<b>多媒体接口</b>：专用的并行或 MIPI 接口，用于高速传输显示屏图像或摄像头采集的像素流。',
    'SDIO': '<b>SDIO 接口</b>：用于连接 SD 卡扩容，或通过 SDIO 协议让 ESP32 作为 Wi-Fi 卡辅助其他主控联网。'
};

async function init() {
    try {
        const response = await fetch('chips_data.json');
        chipsData = await response.json();
        
        const periKeys = new Set();
        Object.values(chipsData.chips).forEach(chip => {
            if (chip.peripherals) {
                Object.keys(chip.peripherals).forEach(k => periKeys.add(k));
            }
        });
        featureGroups.peri = Array.from(periKeys).sort().map(k => ({ key: k, label: k, isPeri: true }));

        renderChipSelector();
        setupTabs();
        setupSearch();
    } catch (error) {
        console.error('Error loading chips data:', error);
    }
}

function setupSearch() {
    const searchInput = document.getElementById('peripheral-search');
    if (!searchInput) return;
    searchInput.oninput = (e) => {
        periSearchQuery = e.target.value.toLowerCase();
        renderComparison();
    };
}

function renderChipSelector() {
    const selector = document.getElementById('chip-selector');
    selector.innerHTML = '';
    const grouped = {};
    Object.entries(chipsData.chips).forEach(([name, data]) => {
        if (!grouped[data.series]) grouped[data.series] = [];
        grouped[data.series].push({ name, ...data });
    });
    const order = ['S', 'C', 'H', 'P', 'Original'];
    order.forEach(series => {
        if (grouped[series]) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'series-group';
            groupDiv.innerHTML = `
                <div class="series-group-header">
                    <h3>${series} 系列</h3>
                    <span class="series-pos-desc">${chipsData.series_info[series] || ''}</span>
                </div>
                <div class="chip-grid-compact"></div>
            `;
            const grid = groupDiv.querySelector('.chip-grid-compact');
            grouped[series].forEach(chip => {
                const card = document.createElement('div');
                card.className = `chip-card-compact ${selectedChips.includes(chip.name) ? 'selected' : ''}`;
                card.innerHTML = chip.name;
                card.onclick = () => toggleChip(chip.name, card);
                grid.appendChild(card);
            });
            selector.appendChild(groupDiv);
        }
    });
}

function setupTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const searchContainer = document.getElementById('peripheral-search-container');
    
    buttons.forEach(btn => {
        btn.onclick = () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.category;
            
            if (searchContainer) {
                if (activeCategory === 'peri') {
                    searchContainer.classList.remove('hidden');
                } else {
                    searchContainer.classList.add('hidden');
                }
            }
            
            renderComparison();
        };
    });
}

function toggleChip(name, element) {
    const index = selectedChips.indexOf(name);
    if (index > -1) {
        selectedChips.splice(index, 1);
        element.classList.remove('selected');
    } else {
        selectedChips.push(name);
        element.classList.add('selected');
    }
    updateUI();
}

function updateUI() {
    const comparisonSection = document.getElementById('comparison-section');
    const emptyState = document.getElementById('empty-state');
    const countBadge = document.getElementById('selection-count');
    if (countBadge) countBadge.textContent = `已选 ${selectedChips.length}`;
    if (selectedChips.length >= 1) {
        comparisonSection.classList.remove('hidden');
        emptyState.classList.add('hidden');
        renderComparison();
    } else {
        comparisonSection.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }
}

function renderComparison() {
    const modeContainer = document.getElementById('view-mode-container');
    if (selectedChips.length === 1) {
        renderSingleView(selectedChips[0], modeContainer);
    } else {
        renderMultiView(modeContainer);
    }
}

function renderSingleView(name, container) {
    const chip = chipsData.chips[name];
    const highlight = getChipHighlight(name, chip);

    container.innerHTML = `
        <div class="single-chip-hero">
            <div class="chip-icon-large">SoC</div>
            <div class="single-chip-header">
                <h2>${name}</h2>
                <div class="highlight-tag">${highlight}</div>
                <p style="margin-top: 0.5rem; color: var(--text-dim)">${chipsData.series_info[chip.series]}</p>
            </div>
        </div>
    `;
    renderMultiView(document.createElement('div'), true); 
}

function renderMultiView(container, isSingleDetail = false) {
    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');
    let currentFeatures = featureGroups[activeCategory];

    if (activeCategory === 'peri' && periSearchQuery) {
        currentFeatures = currentFeatures.filter(f => f.label.toLowerCase().includes(periSearchQuery));
    }

    thead.innerHTML = `
        <tr>
            <th class="feature-label">特性 / ${getCategoryLabel(activeCategory)} (点击行查看说明)</th>
            ${selectedChips.map(name => `<th class="chip-header">${name}</th>`).join('')}
        </tr>
    `;

    if (currentFeatures.length === 0 && activeCategory === 'peri') {
        tbody.innerHTML = `<tr><td colspan="${selectedChips.length + 1}" style="text-align: center; color: var(--text-dim); padding: 3rem;">未找到相关外设内容</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    currentFeatures.forEach(feature => {
        let values;
        if (feature.isPeri) {
            values = selectedChips.map(name => chipsData.chips[name].peripherals ? (chipsData.chips[name].peripherals[feature.key] || 'N/A') : 'N/A');
        } else {
            values = selectedChips.map(name => chipsData.chips[name][feature.key] || 'N/A');
        }
        
        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.dataset.feature = feature.key;
        tr.innerHTML = `
            <td class="feature-label">${feature.label}</td>
            ${selectedChips.map((name, i) => {
                const value = values[i];
                const isSuperior = !isSingleDetail && !feature.isPeri && checkSuperior(feature.key, value, values);
                return `<td class="${isSuperior ? 'superior' : ''}">${value}</td>`;
            }).join('')}
        `;
        
        tr.onclick = (e) => toggleRowExplanation(feature, tr);
        tbody.appendChild(tr);
    });

    if (!isSingleDetail) {
        const modeContainer = document.getElementById('view-mode-container');
        modeContainer.innerHTML = `<h2 style="margin-bottom: 1rem">对比矩阵</h2>`;
    }
}

function toggleRowExplanation(feature, row) {
    const nextRow = row.nextElementSibling;
    if (nextRow && nextRow.classList.contains('explanation-row')) {
        nextRow.remove();
        return;
    }

    // Remove other expanded rows in this table if desired (accordion style)
    // Removed for multi-expansion support

    const explTr = document.createElement('tr');
    explTr.className = 'explanation-row';
    const cellCount = selectedChips.length + 1;
    
    const explanationText = featureExplanations[feature.key] || `<b>${feature.label}</b>：暂无详细说明。该参数决定了芯片的 ${feature.label} 性能。`;
    
    explTr.innerHTML = `
        <td colspan="${cellCount}">
            <div class="explanation-content">
                ${explanationText}
            </div>
        </td>
    `;
    
    row.after(explTr);
}

function getCategoryLabel(cat) {
    switch(cat) {
        case 'main': return '主要特性';
        case 'core': return '核心与存储';
        case 'comm': return '无线通信';
        case 'power': return '功耗管理';
        case 'peri': return '外设资源';
        default: return '';
    }
}

function getChipHighlight(name, chip) {
    if (chip.series === 'S') return '高性能无线专家';
    if (chip.series === 'C') return '极致性价比之选';
    if (chip.series === 'H') return '智能家居核心 (Matter/Thread)';
    if (chip.series === 'P') return '工业级高性能全能王';
    return '经典之作';
}

function checkSuperior(key, value, allValues) {
    if (value === 'N/A' || allValues.length < 2) return false;
    const numericKeys = ['freq', 'gpio', 'ls', 'ds', 'rom', 'sram'];
    if (numericKeys.includes(key)) {
        const numValue = value.toString().replace(/[^0-9.]/g, '');
        const num = parseFloat(numValue);
        if (isNaN(num)) return false;
        const nums = allValues.map(v => parseFloat(v.toString().replace(/[^0-9.]/g, ''))).filter(v => !isNaN(v));
        if (key === 'ls' || key === 'ds') return num === Math.min(...nums);
        return num === Math.max(...nums);
    }
    if (key === 'wifi' && value.includes('ax')) return true;
    if (key === 'ble' && (value.includes('6.0') || value.includes('5.4'))) return true;
    return false;
}

document.getElementById('clear-selection').onclick = () => {
    selectedChips = [];
    document.querySelectorAll('.chip-card-compact').forEach(c => c.classList.remove('selected'));
    updateUI();
};

init();
