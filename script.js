let chipsData = { chips: {}, series_info: {} };
let selectedChips = [];
let activeCategory = 'main';
let periSearchQuery = '';

const featureGroups = {
    main: [
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
    'cpu': '<b>CPU 架构</b>ESP32 的 CPU 主要是 Xtensa 和 RISC-V。Xtensa 性能强劲、带 AI/DSP 指令集（如 S3）；RISC-V 在新型号（如 C3/C6/H2）上被广泛使用，功耗更低。双核架构（经典款、S3、P4）允许部分核心专职处理无线协议栈，另一核跑应用，大大提升实时并发能力。',
    'freq': '<b>最高主频</b>直接决定芯片的峰值计算能力。高性能系列（如 P4）高达 400MHz，S系列最高 240MHz，足以驱动高刷彩屏或音频算法；低功耗 C 系列通常在 120~160MHz，在性能和省电之间取得最佳平衡。',
    'wifi': '<b>Wi-Fi 标准</b>经典系列及 S2/S3 支持 Wi-Fi 4。进入 Wi-Fi 6 时代后，C6/C61 引入了 802.11ax（支持 OFDMA 和 TWT 目标唤醒时间），显著降低 IoT 节点在密集网络中的功耗。C5 更是支持了 5GHz 双频 Wi-Fi 6。',
    'ble': '<b>蓝牙版本</b>早期型号支持经典蓝牙 (BR/EDR) 与 BLE 4.2。C3/S3 升级至 BLE 5.0，大幅提升传输距离 (Long Range) 和吞吐量；新款 C6/H2 达到 BLE 5.3；H4 等新架构更支持了 BLE 6.0，提供极高精度的测距定位 (Channel Sounding) 和 LE Audio 音频能力。',
    'ls': '<b>Light-sleep (轻度睡眠)</b>该模式下 ESP32 暂停 CPU 执行但维持内存(SRAM)供电，唤醒时间仅为微秒级。结合 Wi-Fi 的 DTIM 心跳周期，能在保持网络常连接的同时，极大程度降低整体功耗。',
    'ds': '<b>Deep-sleep (深度睡眠)</b>仅保留 ULP（超低功耗协处理器）和 RTC 域工作，主 CPU 及大部分内存均断电，功耗仅几微安(µA)。是电池供电的温湿度贴片、智能门磁等设备实现“数年续航”的核心技术。',
    'rom': '<b>ROM</b>其中固化了乐鑫官方的 Bootloader 和基础的 Wi-Fi/蓝牙底层核心栈库函数。固化的 ROM 越大，不仅缩短启动时间，还能为用户的应用程序省下大量宝贵的 Flash 存储空间。',
    'sram': '<b>SRAM</b>分为 IRAM 和 DRAM。因为跑 Wi-Fi 协议栈本身需要占用较多内存缓冲，剩余的可用 SRAM（如 S3 具有高达 512KB SRAM）对运行复杂的 LVGL UI 界面、甚至运行小模型推理起到了决定性作用。',
    'psram': '<b>PSRAM</b>片外伪静态随机存储。当内置 SRAM 不够时（例如驱动高像素 LCD、做音频大缓存），可以通过高速总线外挂 PSRAM。像 ESP32-S3 就支持高达 8MB 或 16MB 的 Octal SPI (八线) PSRAM，带宽高得惊人。',
    'gpio': '<b>GPIO</b>引出的脚位数量。ESP32 拥有独门绝技“GPIO 矩阵 (GPIO Matrix)”，允许把绝大多数外设信号 (比如 PWM, I2C, SPI) 软件映射到任意物理管脚，大幅简化了 PCB 的布线难度。',
    '15.4': '<b>IEEE 802.15.4</b>专用于 Mesh 组网的低速低功耗射频硬件，是支持 Thread、Zigbee 和 Matter 协议的底层基础。目前装备在主打智能家居生态的 H 系列（ESP32-H2）和最新的 C/P 系列中。',
    'GPIO': '<b>GPIO</b>引出的脚位数量。ESP32 拥有独门绝技“GPIO 矩阵 (GPIO Matrix)”，允许把绝大多数外设信号 (比如 PWM, I2C, SPI) 软件映射到任意物理管脚，大幅简化了 PCB 的布线难度。',
    'ADC': '<b>ADC (模数转换器)</b>ESP32 系列的 ADC 历经多次迭代，新型号（如 S3/C6）大幅改善了早期产品的非线性问题，并且出厂自带 eFuse 硬件校准，极大提升了对模拟传感器读取的准确度。',
    'UART': '<b>UART (串口)</b>除了默认的 UART0 用作日志打印外，ESP32 可用 GPIO 矩阵将额外的硬件 UART 映射到任何引脚，轻松接入 GPS 模块、温湿度变送器等外部串口设备。',
    'I2C': '<b>I2C</b>常用于连接温湿度传感器或小型 OLED 屏幕。ESP32 硬件支持高达 1MHz 的 Fast-mode Plus (Fm+) 模式，可以轻松挂载大量低速 I2C 节点。',
    'SPI': '<b>SPI</b>乐鑫的 SPI 控制器带有强大的 DMA（直接内存访问），在驱动高刷新率的 TFT 屏幕、甚至摄像头数据搬运时，可以直接在后台完成，完全不占用 CPU 计算资源。',
    'I2S': '<b>I2S</b>虽然名为音频接口，但它的底层其实是一个高速并行移位寄存器。创客们经常将其利用在其“非设计用途”上：比如通过 DMA 疯狂输出并行数据，直接用来驱动大量 LED 点阵或老式并行 RGB 屏幕。',
    'PWM': '<b>PWM</b>乐鑫的 PWM 分两大家族。LEDC（LED 控制器）自带硬件渐变功能，非常适合平滑调光；而 MCPWM (电机控制 PWM) 则是高级工具，带死区控制和故障刹车，专为无刷电机 (BLDC) 及逆变器打造。',
    'RMT': '<b>RMT (远程控制)</b>ESP32 的“神级外设”。本意是为了红外遥控(IR)收发设计的，但因为它能产生纳秒级极其精确且可编程的波形，所以被广泛用来完美驱动 WS2812/NeoPixel 这类对时序极其苛刻的炫彩灯珠。',
    'USB': '<b>USB 接口</b>较新的 C 系列搭载 USB Serial/JTAG，无需再外挂 CP2102 等串口转换芯片就能直接连电脑烧录下载代码。而 S2/S3 则是原生 USB OTG，可以直接把自己模拟成为 U盘 (Mass Storage) 或电脑鼠标键盘 (HID)。P4 更是加持了高速的 USB 2.0 (480Mbps)。',
    'TWAI': '<b>TWAI</b>乐鑫将其汽车总线控制器命名为 TWAI，兼容 CAN 2.0B。新型号 C6、H4 等进一步支持了 CAN FD，允许更高的波特率与每帧高达 64 字节的有效载荷，在车载 OBD 和精密机器人控制 (如大疆无刷电机) 领域大放异彩。',
    'Security': '<b>安全特性</b>ESP32 内置极为强大的硬件安全模块。Secure BootV2 防止固件被篡改；Flash Encryption 使用片内防读取的密钥，将外部 Flash 的数据变为乱码，彻底断绝“抄板”和固件提取的可能性；且加解密不消耗 CPU。',
    'Touch': '<b>电容触摸接口</b>无需额外的触摸芯片，引脚可直接识别手指靠近产生的微小电容变化。高级型号甚至可以在 Deep-sleep (几十微安) 状态下通过触摸特定的按键唤醒系统。',
    'LCD/Camera': '<b>多媒体接口</b>到了 S3 时代，乐鑫专门加入了 LCD_CAM 外设，原生支持高通量并行数据吞吐，可直驱 8/16位 RGB 屏或数字麦克风/摄像头。最新的 P4 更突破性搭载了 MIPI DSI (显示) 与 MIPI CSI (相机) 接口，直接对标高性能 Linux 板卡。',
    'SDIO': '<b>SDIO 接口</b>除了用于外挂 SD 卡读取海量资源外，它还允许 ESP32 作为一个高速 Wi-Fi 扩展网卡 (SDIO Slave 模式)，通过 SDIO 总线被树莓派或其它不带 Wi-Fi 的高性能处理器高效调用。',
    'Audio': '<b>音频加速</b>像 H4 这样的新型号搭载了 ASRC 音频采样率转换器，大幅减轻 CPU 处理音频流时的运算量，结合 ESP-ADF 框架极度适合智能音箱领域开发。'
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
    const order = ['S', 'C', 'H', 'E', 'P', 'Original'];
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

    let extraHTML = '';
    if (chip.key_capabilities) {
        extraHTML = `
        <div class="chip-deep-dive" style="margin-top: 2.5rem; margin-bottom: 2.5rem; text-align: left;">
            <div class="glass" style="padding: 2rem; border-radius: 20px; border: 1px solid var(--glass-border);">
                <h3 style="color: var(--primary-light); margin-bottom: 1rem; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>✨</span> 关键能力
                </h3>
                <ul style="color: var(--text-dim); line-height: 1.8; padding-left: 1.5rem; margin-bottom: ${chip.typical_applications ? '2rem' : '0'};">
                    ${chip.key_capabilities.map(cap => `<li style="margin-bottom: 0.5rem;">${cap}</li>`).join('')}
                </ul>
                ${chip.typical_applications ? `
                <h3 style="color: var(--primary-light); margin-bottom: 1rem; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>🎯</span> 典型应用场景
                </h3>
                <ul style="color: var(--text-dim); line-height: 1.8; padding-left: 1.5rem;">
                    ${chip.typical_applications.map(app => `<li style="margin-bottom: 0.5rem;">${app}</li>`).join('')}
                </ul>
                ` : ''}
            </div>
        </div>
        `;
    }

    container.innerHTML = `
        <div class="single-chip-hero">
            <div class="chip-icon-large">SoC</div>
            <div class="single-chip-header">
                <h2>${name}</h2>
                <div class="highlight-tag">${highlight}</div>
                <p style="margin-top: 0.5rem; color: var(--text-dim)">${chipsData.series_info[chip.series]}</p>
            </div>
        </div>
        ${extraHTML}
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

        if (values.every(v => v === 'N/A' || v === 'N/A')) {
            return;
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

    const explTr = document.createElement('tr');
    explTr.className = 'explanation-row';
    const cellCount = selectedChips.length + 1;

    let explanationText = featureExplanations[feature.key] || `<b>${feature.label}</b>：暂无详细说明。该参数决定了芯片的 ${feature.label} 性能。`;

    let dynamicAnalysis = `<div style="margin-top:0.8rem; padding-top:0.8rem; border-top:1px dashed rgba(255,255,255,0.1); color:var(--text-main);">`;
    if (selectedChips.length === 1) {
        const chipName = selectedChips[0];
        const val = feature.isPeri ? (chipsData.chips[chipName].peripherals && chipsData.chips[chipName].peripherals[feature.key] || 'N/A') : (chipsData.chips[chipName][feature.key] || 'N/A');
        dynamicAnalysis += `<b>当前选择 (${chipName})：</b><span style="color:#4ade80; margin-left:0.5rem">${val}</span>`;
    } else {
        const valueMap = {};
        selectedChips.forEach(name => {
            const val = feature.isPeri ? (chipsData.chips[name].peripherals && chipsData.chips[name].peripherals[feature.key] || 'N/A') : (chipsData.chips[name][feature.key] || 'N/A');
            if (!valueMap[val]) valueMap[val] = [];
            valueMap[val].push(name);
        });
        const uniqueValues = Object.keys(valueMap);
        if (uniqueValues.length === 1) {
            dynamicAnalysis += `<b>对比分析：</b>在【${feature.label}】特性上，所选芯片配置完全一致，均为 <span style="color:#4ade80">${uniqueValues[0]}</span>。`;
        } else {
            dynamicAnalysis += `<b>对比分析：</b>各芯片在【${feature.label}】存在差异<ul>`;
            for (const [val, chips] of Object.entries(valueMap)) {
                dynamicAnalysis += `<li style="margin-top: 0.2rem;"><b>${chips.join('、')}</b>: <span style="color:#4ade80">${val}</span></li>`;
            }
            dynamicAnalysis += `</ul>`;
        }
    }
    dynamicAnalysis += `</div>`;

    explTr.innerHTML = `
        <td colspan="${cellCount}">
            <div class="explanation-content">
                ${explanationText}
                ${dynamicAnalysis}
            </div>
        </td>
    `;

    row.after(explTr);
}

function getCategoryLabel(cat) {
    switch (cat) {
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
    if (chip.series === 'E') return '网络伴随处理器';
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
