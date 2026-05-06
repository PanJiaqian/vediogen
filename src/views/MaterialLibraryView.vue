<template>
  <div class="asset-library">
    <!-- 顶部标签导航 -->
    <div class="tab-navigation">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { 'tab-button--active': activeTab === tab.id }]"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filter-section">
      <div class="filter-controls">
        <div class="search-box">
          <input
            type="text"
            placeholder="输入素材名称进行搜索"
            v-model="searchQuery"
          />
          <img src="/zhuti_search.svg" class="search-icon" alt="search" />
        </div>

        <button class="create-subject-btn" @click="createNewSubject">
          <span class="plus-icon">+</span>
          上传新素材
        </button>
      </div>
    </div>

    <!-- 资产网格 -->
    <div class="assets-container">
      <div class="assets-grid">
        <div
          v-for="asset in filteredAssets"
          :key="asset.id"
          class="asset-card"
          @click="selectAsset(asset)"
        >
          <div class="asset-preview">
            <img :src="asset.thumbnail" :alt="asset.title" />
            <button class="asset-delete-btn" @click.stop="openDeleteConfirm(asset)">
              ×
            </button>
          </div>

          <div class="asset-info">
            <h3 class="asset-title">{{ asset.title }}</h3>
          </div>
        </div>
      </div>

      <!-- 暂无更多内容 -->
      <div v-if="filteredAssets.length === 0" class="empty-message">
        暂无更多内容
      </div>
    </div>

    <!-- 资产详情页面 -->
    <div v-if="selectedAsset" class="asset-detail-page">
      <!-- 顶部导航栏 -->
      <div class="detail-header">
        <button class="back-btn" @click="closeModal">
          <span class="back-icon">×</span>
        </button>
        <div class="detail-header-actions">
          <button class="edit-btn" @click="openEditModal">编辑</button>
          <button class="delete-btn" @click.stop="openDeleteConfirm">删除</button>
          <button class="favorite-btn">
            <span class="star-icon">☆</span>
          </button>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="detail-content">
        <!-- 左侧图片区域 -->
        <div class="detail-image-section">
          <div class="image-container">
            <img :src="selectedAsset.thumbnail" :alt="selectedAsset.title" @click="openImagePreview(selectedAsset.thumbnail)" />
          </div>
        </div>

        <!-- 右侧信息区域 -->
        <div class="detail-info-section">
          <h2 class="info-title">{{ selectedAsset.title }}</h2>
          <div class="info-row">
            <span class="info-label">类别</span>
            <span class="info-value">{{ selectedAsset.category || '未知' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">格式</span>
            <span class="info-value">{{ selectedAsset.format || 'JPG' }}</span>
            <span class="info-label">大小</span>
            <span class="info-value">{{ selectedAsset.size || '未知' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">素材描述</span>
          </div>

          <div class="description-text">{{ selectedAsset.themeDescription || '暂无描述' }}</div>

          <!-- 使用主体按钮 -->
          <button class="use-subject-btn" @click="useMaterial">
            <span class="plus-icon">+</span>
            使用素材
          </button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="edit-modal-overlay" @click="closeEditModal">
      <div class="edit-modal" @click.stop>
        <div class="edit-modal-header">
          <h2 class="edit-modal-title">编辑素材</h2>
          <button class="edit-modal-close" @click="closeEditModal">×</button>
        </div>

        <div class="edit-modal-body">
          <div class="edit-image-upload" @click="triggerEditImageUpload">
            <img v-if="editImagePreview" :src="editImagePreview" alt="预览图" class="edit-preview-image" />
            <div v-else class="edit-upload-placeholder">
              <div class="edit-upload-icon">📷</div>
              <p class="edit-upload-text">点击上传新图片（可选）</p>
            </div>
          </div>
          <input ref="editImageInput" type="file" accept="image/*" @change="handleEditImageUpload" style="display: none;" />

          <div class="edit-form">
            <div class="edit-form-group">
              <label class="edit-form-label">名字</label>
              <input v-model="editSubject.name" type="text" class="edit-form-input" placeholder="请输入名字" />
            </div>
            <div class="edit-form-row">
              <div class="edit-form-group" style="width: 100%;">
                <label class="edit-form-label">类别</label>
                <select v-model="editSubject.category" class="edit-form-input">
                  <option value="实拍素材">实拍素材</option>
                  <option value="网络素材">网络素材</option>
                  <option value="新闻素材">新闻素材</option>
                  <option value="媒体爆料">媒体爆料</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
            <div class="edit-form-group">
              <label class="edit-form-label">素材描述</label>
              <textarea v-model="editSubject.themeDescription" class="edit-form-textarea" rows="4" placeholder="请输入素材描述"></textarea>
            </div>
          </div>
        </div>

        <div class="edit-modal-footer">
          <button class="edit-cancel-btn" @click="closeEditModal">取消</button>
          <button class="edit-save-btn" :disabled="editSaving" @click="submitEditSubject">
            {{ editSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleteConfirmVisible" class="delete-modal-overlay" @click.self="closeDeleteConfirm">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-title">是否删除该素材</div>
        <div class="delete-modal-actions">
          <button class="delete-cancel" @click="closeDeleteConfirm">取消</button>
          <button class="delete-confirm" :disabled="deleteDeleting" @click="confirmDeleteSelectedSubject">
            {{ deleteDeleting ? '删除中...' : '删除' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showImagePreview" class="image-preview-overlay" @click.self="closeImagePreview">
      <img :src="imagePreviewUrl" alt="预览图" class="image-preview-img" />
      <button class="image-preview-close" @click="closeImagePreview">×</button>
    </div>

    <div v-if="toastVisible" class="floating-toast">{{ toastText }}</div>

    <!-- 上传素材弹窗 -->
    <div v-if="showUploadModal" class="edit-modal-overlay" @click="closeUploadModal">
      <div class="edit-modal" @click.stop>
        <div class="edit-modal-header">
          <h2 class="edit-modal-title">上传新素材</h2>
          <button class="edit-modal-close" @click="closeUploadModal">×</button>
        </div>

        <div class="edit-modal-body">
          <div class="edit-image-upload" @click="triggerUploadImage">
            <img v-if="uploadForm.thumbnail" :src="uploadForm.thumbnail" alt="预览图" class="edit-preview-image" />
            <div v-else class="edit-upload-placeholder">
              <div class="edit-upload-icon">📷</div>
              <p class="edit-upload-text">点击上传素材图片/视频</p>
            </div>
          </div>
          <input ref="uploadImageInput" type="file" accept="image/*,video/*" @change="handleUploadImage" style="display: none;" />

          <div class="edit-form">
            <div class="edit-form-group">
              <label class="edit-form-label">素材名称</label>
              <input v-model="uploadForm.title" type="text" class="edit-form-input" placeholder="请输入素材名称" />
            </div>
            <div class="edit-form-row">
              <div class="edit-form-group" style="width: 100%;">
                <label class="edit-form-label">素材分类</label>
                <select v-model="uploadForm.category" class="edit-form-input">
                  <option value="实拍素材">实拍素材</option>
                  <option value="网络素材">网络素材</option>
                  <option value="新闻素材">新闻素材</option>
                  <option value="媒体爆料">媒体爆料</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
            <div class="edit-form-group">
              <label class="edit-form-label">素材描述</label>
              <textarea v-model="uploadForm.themeDescription" class="edit-form-textarea" rows="4" placeholder="请输入素材描述"></textarea>
            </div>
          </div>
        </div>

        <div class="edit-modal-footer">
          <button class="edit-cancel-btn" @click="closeUploadModal">取消</button>
          <button class="edit-save-btn" :disabled="uploading" @click="submitUpload">
            {{ uploading ? '上传中...' : '确认上传' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 使用模拟数据
const MOCK_ASSETS = [
  // 实拍素材 (10条)
  { id: '1', title: '街头采访录像', thumbnail: 'https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&w=300&q=80', type: 'public', category: '实拍素材', themeDescription: '真实的街头采访录像，适合做纪录片素材。', format: 'JPG', size: '124MB' },
  { id: '5', title: '我的办公桌实拍', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80', type: 'personal', category: '实拍素材', themeDescription: '个人上传的办公桌素材，包含电脑、咖啡和植物。', format: 'JPG', size: '1.2MB' },
  { id: '11', title: '雨天街道行车', thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=300&q=80', type: 'public', category: '实拍素材', themeDescription: '雨夜驾车的第一视角素材。', format: 'JPG', size: '250MB' },
  { id: '12', title: '海边日出延时', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80', type: 'public', category: '实拍素材', themeDescription: '海边日出的绝美延时摄影。', format: 'JPG', size: '412MB' },
  { id: '13', title: '咖啡馆白噪音场景', thumbnail: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=300&q=80', type: 'public', category: '实拍素材', themeDescription: '安静的咖啡馆午后实拍。', format: 'JPG', size: '300MB' },
  { id: '14', title: '森林徒步记录', thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80', type: 'public', category: '实拍素材', themeDescription: '第一视角森林徒步真实记录。', format: 'JPG', size: '510MB' },
  { id: '15', title: '繁忙的十字路口', thumbnail: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=300&q=80', type: 'public', category: '实拍素材', themeDescription: '大城市繁忙十字路口的俯拍。', format: 'JPG', size: '180MB' },
  { id: '16', title: '厨房烹饪过程', thumbnail: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=300&q=80', type: 'public', category: '实拍素材', themeDescription: '煎牛排的特写镜头实拍。', format: 'JPG', size: '95MB' },
  { id: '17', title: '宠物猫玩耍', thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80', type: 'personal', category: '实拍素材', themeDescription: '小猫玩毛线球的可爱瞬间。', format: 'JPG', size: '60MB' },
  { id: '18', title: '烟花秀实况', thumbnail: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=300&q=80', type: 'public', category: '实拍素材', themeDescription: '节日烟花秀的高清实拍。', format: 'JPG', size: '320MB' },

  // 网络素材 (10条)
  { id: '2', title: '星空背景视频', thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=300&q=80', type: 'public', category: '网络素材', themeDescription: '璀璨的银河系星空视频，适合科幻题材。', format: 'JPG', size: '53.1MB' },
  { id: '21', title: '故障艺术转场', thumbnail: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=300&q=80', type: 'public', category: '网络素材', themeDescription: '赛博朋克风格的故障转场特效。', format: 'JPG', size: '12MB' },
  { id: '22', title: '极简白色光效', thumbnail: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=300&q=80', type: 'public', category: '网络素材', themeDescription: '干净的白色光斑漏光素材。', format: 'JPG', size: '45MB' },
  { id: '23', title: '复古胶片颗粒', thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80', type: 'public', category: '网络素材', themeDescription: '模拟老电影的胶片颗粒噪点覆盖。', format: 'JPG', size: '88MB' },
  { id: '24', title: '炫酷流光线条', thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80', type: 'public', category: '网络素材', themeDescription: '科技感十足的动态流光线条。', format: 'JPG', size: '150MB' },
  { id: '25', title: '动态音波可视化', thumbnail: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=300&q=80', type: 'public', category: '网络素材', themeDescription: '适合音乐频道的音频跳动波形。', format: 'JPG', size: '65MB' },
  { id: '26', title: '水墨晕染特效', thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80', type: 'public', category: '网络素材', themeDescription: '国风中国画水墨散开转场。', format: 'JPG', size: '30MB' },
  { id: '27', title: '复古电视雪花', thumbnail: 'https://images.unsplash.com/photo-1595859702810-1845180f55eb?auto=format&fit=crop&w=300&q=80', type: 'public', category: '网络素材', themeDescription: 'CRT老电视无信号雪花噪点。', format: 'JPG', size: '20MB' },
  { id: '28', title: '金色粒子飘散', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', type: 'public', category: '网络素材', themeDescription: '唯美的金色粒子上升动画。', format: 'JPG', size: '110MB' },
  { id: '29', title: '绿幕手机边框', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80', type: 'public', category: '网络素材', themeDescription: '带有绿幕抠图区域的手机框架。', format: 'PNG', size: '2MB' },

  // 新闻素材 (10条)
  { id: '3', title: '新闻发布会现场', thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', type: 'public', category: '新闻素材', themeDescription: '新闻发布会现场的真实记录。', format: 'JPG', size: '1.8MB' },
  { id: '31', title: '股市大盘全景', thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80', type: 'public', category: '新闻素材', themeDescription: '华尔街股市大盘数据跳动画面。', format: 'JPG', size: '75MB' },
  { id: '32', title: '记者现场连线', thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=300&q=80', type: 'public', category: '新闻素材', themeDescription: '外景记者拿着话筒在风雨中连线报道。', format: 'JPG', size: '210MB' },
  { id: '33', title: '突发火灾远景', thumbnail: 'https://images.unsplash.com/photo-1602980068989-cb21ea54b036?auto=format&fit=crop&w=300&q=80', type: 'public', category: '新闻素材', themeDescription: '城市远郊工厂突发火灾浓烟滚滚。', format: 'JPG', size: '140MB' },
  { id: '34', title: '重要会议握手', thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32f7?auto=format&fit=crop&w=300&q=80', type: 'public', category: '新闻素材', themeDescription: '两国代表在重要会议上握手致意。', format: 'JPG', size: '3.5MB' },
  { id: '35', title: '抢险救灾现场', thumbnail: 'https://images.unsplash.com/photo-1516301389880-9a80b0fcb869?auto=format&fit=crop&w=300&q=80', type: 'public', category: '新闻素材', themeDescription: '救援人员在洪灾前线搬运沙袋。', format: 'JPG', size: '300MB' },
  { id: '36', title: '新科技产品发布', thumbnail: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=300&q=80', type: 'public', category: '新闻素材', themeDescription: '某科技巨头发布会大屏幕PPT。', format: 'JPG', size: '185MB' },
  { id: '37', title: '体育赛事夺冠', thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=300&q=80', type: 'public', category: '新闻素材', themeDescription: '田径运动员冲过终点线的瞬间。', format: 'JPG', size: '2.8MB' },
  { id: '38', title: '火箭发射升空', thumbnail: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=300&q=80', type: 'public', category: '新闻素材', themeDescription: '航天火箭点火升空的震撼镜头。', format: 'JPG', size: '450MB' },
  { id: '39', title: '市民排队核酸', thumbnail: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&w=300&q=80', type: 'public', category: '新闻素材', themeDescription: '疫情期间市民有序排队做检测。', format: 'JPG', size: '120MB' },

  // 媒体爆料 (10条)
  { id: '4', title: '某明星绯闻照片', thumbnail: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80', type: 'public', category: '媒体爆料', themeDescription: '某媒体爆料的明星绯闻现场照片。', format: 'JPG', size: '4.2MB' },
  { id: '41', title: '暗访黑作坊', thumbnail: 'https://images.unsplash.com/photo-1558227031-64ebcb320f78?auto=format&fit=crop&w=300&q=80', type: 'public', category: '媒体爆料', themeDescription: '针孔摄像头拍摄的食品黑作坊内幕。', format: 'JPG', size: '80MB' },
  { id: '42', title: '街头打架斗殴', thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80', type: 'public', category: '媒体爆料', themeDescription: '路人手机摇晃拍摄的街角冲突。', format: 'JPG', size: '45MB' },
  { id: '43', title: '车祸行车记录仪', thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=300&q=80', type: 'public', category: '媒体爆料', themeDescription: '高速追尾瞬间的行车记录仪画面。', format: 'JPG', size: '120MB' },
  { id: '44', title: '高空抛物瞬间', thumbnail: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=300&q=80', type: 'public', category: '媒体爆料', themeDescription: '监控摄像头拍下的高空抛物危险行为。', format: 'JPG', size: '30MB' },
  { id: '45', title: '偷拍网红约会', thumbnail: 'https://images.unsplash.com/photo-1516483638261-f40af5ba8ce6?auto=format&fit=crop&w=300&q=80', type: 'public', category: '媒体爆料', themeDescription: '狗仔队远距离偷拍网红私下约会。', format: 'JPG', size: '1.5MB' },
  { id: '46', title: '粗暴执法录像', thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80', type: 'public', category: '媒体爆料', themeDescription: '网友提供的安保人员粗暴对待商贩视频。', format: 'JPG', size: '66MB' },
  { id: '47', title: '泄露的新机谍照', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80', type: 'public', category: '媒体爆料', themeDescription: '某品牌尚未发布的新款手机模糊谍照。', format: 'JPG', size: '0.8MB' },
  { id: '48', title: '电梯监控咸猪手', thumbnail: 'https://images.unsplash.com/photo-1506869640319-fea1a288fd71?auto=format&fit=crop&w=300&q=80', type: 'public', category: '媒体爆料', themeDescription: '电梯监控拍下的骚扰全过程。', format: 'JPG', size: '25MB' },
  { id: '49', title: '粉丝接机拥挤踩踏', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', type: 'public', category: '媒体爆料', themeDescription: '机场大量粉丝接机导致护栏倒塌。', format: 'JPG', size: '155MB' }
];

export default {
  name: 'MaterialLibraryView',
  data() {
    return {
      activeTab: '全部',
      searchQuery: '',
      selectedAsset: null,
      showEditModal: false,
      deleteConfirmVisible: false,
      deleteDeleting: false,
      deleteTargetAsset: null,
      toastVisible: false,
      toastText: '',
      showImagePreview: false,
      imagePreviewUrl: '',
      showUploadModal: false,
      uploading: false,
      uploadForm: {
        title: '',
        category: '实拍素材',
        themeDescription: '',
        thumbnail: '',
        file: null
      },
      editSaving: false,
      editSubject: {
        materialId: '',
        name: '',
        category: '',
        themeDescription: ''
      },
      editImageFile: null,
      editImagePreview: '',
      tabs: [
        { id: '全部', name: '全部' },
        { id: '实拍素材', name: '实拍素材' },
        { id: '网络素材', name: '网络素材' },
        { id: '新闻素材', name: '新闻素材' },
        { id: '媒体爆料', name: '媒体爆料' }
      ],
      assets: MOCK_ASSETS
    }
  },
  computed: {
    filteredAssets() {
      let filtered = this.assets;

      // 按标签页筛选
      if (this.activeTab !== '全部') {
        filtered = filtered.filter(asset => asset.category === this.activeTab);
      }

      // 按搜索关键词筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(asset =>
          asset.title.toLowerCase().includes(query)
        );
      }

      return filtered;
    }
  },
  methods: {
    setActiveTab(tabId) {
      this.activeTab = tabId;
    },
    selectAsset(asset) {
      this.selectedAsset = asset;
    },
    closeModal() {
      this.selectedAsset = null;
      this.deleteConfirmVisible = false;
      this.showImagePreview = false;
      this.imagePreviewUrl = '';
    },
    createNewSubject() {
      this.uploadForm = {
        title: '',
        category: this.activeTab,
        themeDescription: '',
        thumbnail: '',
        file: null
      };
      this.showUploadModal = true;
    },
    closeUploadModal() {
      if (this.uploading) return;
      this.showUploadModal = false;
      this.uploadForm.file = null;
      this.uploadForm.thumbnail = '';
    },
    triggerUploadImage() {
      if (this.uploading) return;
      this.$refs.uploadImageInput && this.$refs.uploadImageInput.click();
    },
    handleUploadImage(event) {
      const file = event && event.target && event.target.files && event.target.files[0];
      if (!file) return;
      this.uploadForm.file = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadForm.thumbnail = e && e.target ? e.target.result : '';
      };
      reader.readAsDataURL(file);
    },
    submitUpload() {
      if (!this.uploadForm.title.trim()) {
        alert('请输入素材名称');
        return;
      }
      if (!this.uploadForm.file && !this.uploadForm.thumbnail) {
        alert('请上传素材图片/视频');
        return;
      }
      this.uploading = true;
      setTimeout(() => {
        const newAsset = {
          id: Date.now().toString(),
          title: this.uploadForm.title,
          thumbnail: this.uploadForm.thumbnail || 'https://via.placeholder.com/300',
          type: 'personal',
          category: this.uploadForm.category,
          themeDescription: this.uploadForm.themeDescription,
          format: this.uploadForm.file ? this.uploadForm.file.name.split('.').pop().toUpperCase() : 'JPG',
          size: this.uploadForm.file ? (this.uploadForm.file.size / 1024 / 1024).toFixed(1) + 'MB' : '未知'
        };
        this.assets.unshift(newAsset);
        this.showToast('素材上传成功');
        this.uploading = false;
        this.showUploadModal = false;
      }, 800);
    },
    openImagePreview(url) {
      const u = String(url || '').trim();
      if (!u) return;
      this.imagePreviewUrl = u;
      this.showImagePreview = true;
    },
    closeImagePreview() {
      this.showImagePreview = false;
      this.imagePreviewUrl = '';
    },
    showToast(text) {
      this.toastText = String(text || '').trim() || '提示';
      this.toastVisible = true;
      setTimeout(() => { this.toastVisible = false }, 1800);
    },
    openEditModal() {
      if (!this.selectedAsset) return;
      this.editSubject = {
        materialId: String(this.selectedAsset.id || ''),
        name: String(this.selectedAsset.title || ''),
        category: String(this.selectedAsset.category || ''),
        themeDescription: String(this.selectedAsset.themeDescription || '')
      };
      this.editImageFile = null;
      this.editImagePreview = String(this.selectedAsset.thumbnail || '');
      this.showEditModal = true;
    },
    closeEditModal() {
      if (this.editSaving) return;
      this.showEditModal = false;
      this.editImageFile = null;
      this.editImagePreview = '';
    },
    triggerEditImageUpload() {
      if (this.editSaving) return;
      this.$refs.editImageInput && this.$refs.editImageInput.click();
    },
    handleEditImageUpload(event) {
      const file = event && event.target && event.target.files && event.target.files[0];
      if (!file) return;
      this.editImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editImagePreview = e && e.target ? e.target.result : '';
      };
      reader.readAsDataURL(file);
    },
    submitEditSubject() {
      if (!String(this.editSubject.name || '').trim()) {
        alert('请输入名字');
        return;
      }
      this.editSaving = true;
      setTimeout(() => {
        const materialId = String(this.editSubject.materialId || '').trim();
        const idx = this.assets.findIndex(a => String(a.id) === materialId);
        if (idx >= 0) {
          const next = {
            ...this.assets[idx],
            title: this.editSubject.name,
            category: this.editSubject.category,
            themeDescription: this.editSubject.themeDescription,
            thumbnail: this.editImagePreview || this.assets[idx].thumbnail
          };
          this.assets.splice(idx, 1, next);
          if (this.selectedAsset && String(this.selectedAsset.id) === materialId) {
            this.selectedAsset = next;
          }
        }
        this.showToast('模拟：保存成功');
        this.editSaving = false;
        this.showEditModal = false;
      }, 500);
    },
    openDeleteConfirm() {
      const arg = arguments && arguments.length ? arguments[0] : null;
      const target = arg || this.selectedAsset;
      if (!target) return;
      this.deleteTargetAsset = target;
      this.deleteConfirmVisible = true;
    },
    closeDeleteConfirm() {
      if (this.deleteDeleting) return;
      this.deleteConfirmVisible = false;
      this.deleteTargetAsset = null;
    },
    confirmDeleteSelectedSubject() {
      if (this.deleteDeleting) return;
      this.deleteDeleting = true;
      setTimeout(() => {
        const materialId = this.deleteTargetAsset.id;
        this.assets = this.assets.filter(a => a.id !== materialId);
        if (this.selectedAsset && String(this.selectedAsset.id) === String(materialId)) {
           this.closeModal();
        }
        this.showToast('模拟：删除成功');
        this.deleteDeleting = false;
        this.deleteConfirmVisible = false;
        this.deleteTargetAsset = null;
      }, 500);
    },
    useMaterial() {
      this.showToast('模拟：使用了该素材');
    }
  }
}
</script>

<style scoped>
.asset-library {
  position: relative;
  max-width: 1200px;
  margin: 0;
  padding: 20px;
  background-color: var(--bg-secondary);
  min-height: 100vh;
}

/* 标签页导航 */
.tab-navigation {
  display: flex;
  margin-bottom: 30px;
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 20px;
  padding-right: 20px;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  color: var(--text-tertiary);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: var(--text-secondary);
}

.tab-button--active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 30px;
}

.filter-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-dropdown select {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  min-width: 80px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23495057' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0px center;
  background-size: 16px;
  padding-right: 24px;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  margin-left: auto;
}

.search-box input {
  width: 100%;
  padding: 12px 40px 12px 20px;
  border: 1px solid var(--border-secondary);
  border-radius: 100px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.search-box input::placeholder {
  color: var(--text-quaternary);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  pointer-events: none;
  opacity: 0.6;
}

/* 创建新主体按钮 */
.create-subject-btn {
  height: 35px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.create-subject-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.create-subject-btn .plus-icon {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

/* 资产网格 */
.assets-container {
  margin-bottom: 40px;
}

.assets-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 40px;
}

.asset-card {
  width: 200px;
  height: 280px;
  flex-shrink: 0;
  background-color: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.asset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.asset-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.6);
  color: #ffffff;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.asset-delete-btn:hover {
  background: rgba(17, 24, 39, 0.8);
}

.asset-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.asset-info {
  padding: 16px;
  height: 100px;
}

.asset-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.empty-message {
  width: 100%;
  text-align: center;
  padding: 60px 20px;
  color: var(--text-tertiary);
  font-size: 16px;
}

/* 资产详情页面 */
.asset-detail-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-secondary);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: var(--bg-tertiary);
}

.back-icon {
  font-size: 35px;
  color: var(--text-tertiary);
}

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.favorite-btn:hover {
  background: var(--bg-tertiary);
}

.detail-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit-btn {
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--border-secondary);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.delete-btn {
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--border-secondary);
  background: var(--bg-primary);
  color: var(--error-color);
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: var(--bg-tertiary);
  color: var(--error-color);
}

.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
}

.delete-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 280px;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.delete-modal-title {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.delete-cancel {
  padding: 8px 16px;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
}

.delete-confirm {
  padding: 8px 16px;
  border: none;
  background: var(--error-color);
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
}

.delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.floating-toast {
  position: fixed;
  left: 50%;
  bottom: 80px;
  transform: translateX(-50%);
  background: rgba(17, 24, 39, 0.9);
  color: #fff;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 4000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.edit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.edit-modal {
  width: 90%;
  max-width: 820px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
}

.edit-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 14px;
  border-bottom: 1px solid var(--border-secondary);
}

.edit-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.edit-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
}

.edit-modal-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.edit-modal-body {
  display: flex;
  gap: 24px;
  padding: 20px 24px;
}

.edit-image-upload {
  flex: 0 0 260px;
  width: 260px;
  height: 360px;
  border: 2px dashed var(--border-primary);
  border-radius: 12px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.edit-image-upload:hover {
  border-color: var(--primary-color);
  background: var(--bg-quaternary);
}

.edit-preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  background-color: #000;
}

.edit-upload-placeholder {
  text-align: center;
  padding: 16px;
}

.edit-upload-icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.edit-upload-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-tertiary);
}

.edit-form {
  flex: 1;
  min-width: 0;
}

.edit-form-group {
  margin-bottom: 16px;
}

.edit-form-row {
  display: flex;
  gap: 16px;
}

.edit-form-label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.edit-form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.edit-form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.edit-form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 90px;
  transition: all 0.2s ease;
}

.edit-form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.edit-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 20px;
}

.edit-cancel-btn {
  padding: 10px 22px;
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-cancel-btn:hover {
  background: var(--bg-secondary);
}

.edit-save-btn {
  padding: 10px 22px;
  border: none;
  border-radius: 10px;
  background: var(--primary-color);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-save-btn:not(:disabled):hover {
  background: var(--primary-hover);
}

.star-icon {
  font-size: 20px;
  color: var(--text-tertiary);
}

/* 主要内容区域 */
.detail-content {
  flex: 1;
  display: flex;
  padding: 40px;
  gap: 150px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  height: calc(100% - 60px);
  overflow: hidden;
}

/* 左侧图片区域 */
.detail-image-section {
  flex: 2;
  max-width: 550px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  transition: all 0.3s ease;
}

.image-container {
  width: 100%;
  height: 100%;
  max-height: 450px;
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: height 0.3s ease;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  cursor: zoom-in;
  background-color: #000;
}

.image-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.image-preview-img {
  max-width: 92vw;
  max-height: 92vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  background: transparent;
}

.image-preview-close {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-close:hover {
  background: rgba(0, 0, 0, 0.7);
}

/* 右侧信息区域 */
.detail-info-section {
  flex: 1;
  max-height: 500px;
  max-width: 320px;
  padding: 15px;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}

.info-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-secondary);
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.info-label {
  font-size: 14px;
  color: var(--text-tertiary);
  min-width: 60px;
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.description-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 30px;
  padding: 16px;
}

/* 使用素材按钮 */
.use-subject-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.use-subject-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.use-subject-btn .plus-icon {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .asset-library {
    padding: 16px;
  }

  .filter-section {
    padding: 16px;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .assets-grid {
    justify-content: center;
  }

  /* 详情页面响应式 */
  .detail-content {
    flex-direction: column;
    padding: 20px;
    gap: 30px;
  }

  .detail-image-section {
    max-width: 100%;
  }

  .detail-info-section {
    max-width: 100%;
  }

  .edit-modal-body {
    flex-direction: column;
  }

  .edit-image-upload {
    width: 100%;
    height: 300px;
    flex: 0 0 auto;
  }

  .edit-form-row {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .detail-content {
    padding: 16px;
    gap: 20px;
  }

  .detail-header {
    padding: 12px 16px;
  }
}
</style>