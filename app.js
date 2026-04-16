// 商场集章打卡系统 - 主应用

// 数据存储键名
const STORAGE_KEYS = {
    SHOPS: 'stamp_shops',
    CHECKINS: 'stamp_checkins',
    USER: 'stamp_user',
    REWARDS: 'stamp_rewards',
    ACTIVITY: 'stamp_activity'
};

// 默认店铺数据
const DEFAULT_SHOPS = [
    { id: 'shop1', name: '星巴克咖啡', icon: '☕', checked: false },
    { id: 'shop2', name: '优衣库', icon: '👕', checked: false },
    { id: 'shop3', name: 'Apple Store', icon: '📱', checked: false },
    { id: 'shop4', name: '海底捞火锅', icon: '🍲', checked: false },
    { id: 'shop5', name: '乐高专卖店', icon: '🧱', checked: false },
    { id: 'shop6', name: '西西弗书店', icon: '📚', checked: false },
    { id: 'shop7', name: '周大福珠宝', icon: '💎', checked: false },
    { id: 'shop8', name: '小米之家', icon: '⚡', checked: false }
];

// 初始化数据
function initData() {
    if (!localStorage.getItem(STORAGE_KEYS.SHOPS)) {
        localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(DEFAULT_SHOPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHECKINS)) {
        localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
        const userId = 'user_' + Date.now();
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
            id: userId,
            name: '游客' + userId.slice(-4),
            createdAt: new Date().toISOString()
        }));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REWARDS)) {
        localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify({
            name: '商场集章打卡活动',
            description: '打卡6家店铺，赢取大奖！',
            minShopsForReward: 6,
            startDate: new Date().toISOString(),
            isActive: true
        }));
    }
}

// 获取数据
function getShops() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOPS) || '[]');
}

function getCheckins() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKINS) || '[]');
}

function getUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
}

function getRewards() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REWARDS) || '[]');
}

function getActivity() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '{}');
}

// 保存数据
function saveShops(shops) {
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
}

function saveCheckins(checkins) {
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkins));
}

function saveRewards(rewards) {
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
}

// 获取当前用户的打卡记录
function getUserCheckins() {
    const user = getUser();
    const checkins = getCheckins();
    return checkins.filter(c => c.userId === user.id);
}

// 获取用户已打卡的店铺ID
function getUserCheckedShopIds() {
    const userCheckins = getUserCheckins();
    return [...new Set(userCheckins.map(c => c.shopId))];
}

// 更新店铺打卡状态
function updateShopStatus() {
    const shops = getShops();
    const checkedIds = getUserCheckedShopIds();
    
    shops.forEach(shop => {
        shop.checked = checkedIds.includes(shop.id);
    });
    
    saveShops(shops);
    return shops;
}

// 渲染店铺列表
function renderShops() {
    const shops = updateShopStatus();
    const grid = document.getElementById('shopsGrid');
    
    grid.innerHTML = shops.map(shop => `
        <div class="shop-card ${shop.checked ? 'checked' : ''}" data-shop-id="${shop.id}">
            <div class="shop-icon">${shop.icon}</div>
            <div class="shop-name">${shop.name}</div>
            <div class="shop-status">${shop.checked ? '已打卡' : '未打卡'}</div>
        </div>
    `).join('');
}

// 渲染打卡记录
function renderRecords() {
    const recordsList = document.getElementById('recordsList');
    const userCheckins = getUserCheckins();
    const shops = getShops();
    
    if (userCheckins.length === 0) {
        recordsList.innerHTML = '<p class="empty-text">暂无打卡记录</p>';
        return;
    }
    
    // 按时间倒序排列
    const sortedCheckins = userCheckins.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    recordsList.innerHTML = sortedCheckins.map(checkin => {
        const shop = shops.find(s => s.id === checkin.shopId);
        const date = new Date(checkin.timestamp);
        const timeStr = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return `
            <div class="record-item">
                <img src="${checkin.photo}" alt="打卡照片" class="record-image" onclick="viewImage('${checkin.photo}')">
                <div class="record-info">
                    <div class="record-shop">${shop ? shop.name : '未知店铺'}</div>
                    <div class="record-time">${timeStr}</div>
                    ${checkin.note ? `<div class="record-note">${checkin.note}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 更新进度显示
function updateProgress() {
    const checkedIds = getUserCheckedShopIds();
    const checkedCount = checkedIds.length;
    const activity = getActivity();
    const minShops = activity.minShopsForReward || 6;
    
    document.getElementById('checkedCount').textContent = checkedCount;
    document.getElementById('progressFill').style.width = `${Math.min((checkedCount / minShops) * 100, 100)}%`;
    
    const rewardStatus = document.getElementById('rewardStatus');
    const claimBtn = document.getElementById('claimRewardBtn');
    
    if (checkedCount >= minShops) {
        rewardStatus.textContent = '🎉 恭喜！您已获得兑换大奖资格！';
        rewardStatus.classList.add('eligible');
        claimBtn.disabled = false;
    } else {
        const remaining = minShops - checkedCount;
        rewardStatus.textContent = `还需打卡 ${remaining} 家店铺即可兑换大奖`;
        rewardStatus.classList.remove('eligible');
        claimBtn.disabled = true;
    }
}

// 打开打卡弹窗
function openCheckInModal() {
    const modal = document.getElementById('checkInModal');
    const shopSelect = document.getElementById('shopSelect');
    const shops = getShops();
    const checkedIds = getUserCheckedShopIds();
    
    // 清空表单
    document.getElementById('photoInput').value = '';
    document.getElementById('previewImage').style.display = 'none';
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('checkInNote').value = '';
    
    // 填充店铺选项（排除已打卡的）
    const uncheckedShops = shops.filter(s => !checkedIds.includes(s.id));
    
    if (uncheckedShops.length === 0) {
        alert('恭喜！您已打卡所有店铺！');
        return;
    }
    
    shopSelect.innerHTML = '<option value="">请选择要打卡的店铺</option>' +
        uncheckedShops.map(shop => 
            `<option value="${shop.id}">${shop.icon} ${shop.name}</option>`
        ).join('');
    
    modal.classList.add('active');
}

// 关闭打卡弹窗
function closeCheckInModal() {
    document.getElementById('checkInModal').classList.remove('active');
}

// 图片预览
let selectedPhoto = null;

document.addEventListener('DOMContentLoaded', function() {
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    selectedPhoto = e.target.result;
                    const preview = document.getElementById('previewImage');
                    const placeholder = document.getElementById('uploadPlaceholder');
                    preview.src = selectedPhoto;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// 提交打卡
function submitCheckIn() {
    const shopId = document.getElementById('shopSelect').value;
    const note = document.getElementById('checkInNote').value.trim();
    
    if (!shopId) {
        alert('请选择要打卡的店铺');
        return;
    }
    
    if (!selectedPhoto) {
        alert('请上传打卡照片');
        return;
    }
    
    const user = getUser();
    const checkin = {
        id: 'checkin_' + Date.now(),
        userId: user.id,
        shopId: shopId,
        photo: selectedPhoto,
        note: note,
        timestamp: new Date().toISOString(),
        status: 'pending' // pending, approved, rejected
    };
    
    const checkins = getCheckins();
    checkins.push(checkin);
    saveCheckins(checkins);
    
    // 重置选择的照片
    selectedPhoto = null;
    
    // 更新UI
    renderShops();
    renderRecords();
    updateProgress();
    closeCheckInModal();
    
    // 显示成功提示
    const shop = getShops().find(s => s.id === shopId);
    alert(`✅ 打卡成功！您已在 ${shop.name} 完成打卡`);
}

// 兑换大奖
function claimReward() {
    const checkedIds = getUserCheckedShopIds();
    const activity = getActivity();
    const minShops = activity.minShopsForReward || 6;
    
    if (checkedIds.length < minShops) {
        alert(`还需打卡 ${minShops - checkedIds.length} 家店铺才能兑换大奖`);
        return;
    }
    
    const user = getUser();
    const rewards = getRewards();
    
    // 检查是否已兑换过
    const existingReward = rewards.find(r => r.userId === user.id);
    if (existingReward) {
        document.getElementById('rewardCode').textContent = existingReward.code;
        document.getElementById('rewardModal').classList.add('active');
        return;
    }
    
    // 生成兑换码
    const code = generateRewardCode();
    const reward = {
        id: 'reward_' + Date.now(),
        userId: user.id,
        code: code,
        shopCount: checkedIds.length,
        claimedAt: new Date().toISOString(),
        status: 'active'
    };
    
    rewards.push(reward);
    saveRewards(rewards);
    
    document.getElementById('rewardCode').textContent = code;
    document.getElementById('rewardModal').classList.add('active');
}

// 生成兑换码
function generateRewardCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code.match(/.{1,4}/g).join('-');
}

// 关闭兑换弹窗
function closeRewardModal() {
    document.getElementById('rewardModal').classList.remove('active');
}

// 查看大图
function viewImage(src) {
    const modal = document.createElement('div');
    modal.className = 'modal image-modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-body">
                <img src="${src}" alt="打卡照片" onclick="this.closest('.modal').remove()">
            </div>
        </div>
    `;
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
    document.body.appendChild(modal);
}

// 加载主题
function loadTheme() {
    const theme = JSON.parse(localStorage.getItem('stamp_theme') || '{}');
    if (theme.primary) {
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--primary-dark', theme.primaryDark);
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initData();
    loadTheme();
    
    // 更新用户名显示
    const user = getUser();
    const userNameEl = document.getElementById('userName');
    if (userNameEl && user.name) {
        userNameEl.textContent = user.name;
    }
    
    // 渲染页面
    renderShops();
    renderRecords();
    updateProgress();
});

// 点击弹窗外部关闭
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
