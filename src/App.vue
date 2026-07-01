<script setup lang="ts">
import { ref } from "vue";

// ─── Core Composable ────────────────────────────────────────────────────────
import { useChat } from "./composables/useChat";
const {
  phone,
  setting,
  users,
  dialogs,
  getSender,
  getUserById,
  setUserImage,
  selectUser,
  addUser,
  delUser,
  onBackgroundLoad,
  setBackground,
  deleteBackground,
  addTextDialog,
  addNoticeDialog,
  addImageDialog,
  addEmojiDialog,
  addCustomEmoji,
  removeCustomEmoji,
  addVoiceDialog,
  addRedpacketDialog,
  addTransferDialog,
  deleteDialog,
  cleanDialogs,
  redpacketGet,
  transferGet,
  getVoiceLength,
  moneyFormat,
  hours,
  minutes,
  save,
} = useChat();

// 表情选择器状态
const showEmojiPicker = ref(false);
const activeEmojiTab = ref("preset");
const emojiInputRef = ref<HTMLInputElement | null>(null);

// 预设表情列表（使用 Emoji 或图片 URL）
const presetEmojis = [
  // 笑脸表情
  { id: 1, url: "", emoji: "😀" },
  { id: 2, url: "", emoji: "😃" },
  { id: 3, url: "", emoji: "😄" },
  { id: 4, url: "", emoji: "😁" },
  { id: 5, url: "", emoji: "😅" },
  { id: 6, url: "", emoji: "😂" },
  { id: 7, url: "", emoji: "🤣" },
  { id: 8, url: "", emoji: "😊" },
  { id: 9, url: "", emoji: "😇" },
  { id: 10, url: "", emoji: "🙂" },
  { id: 11, url: "", emoji: "😉" },
  { id: 12, url: "", emoji: "😌" },
  { id: 13, url: "", emoji: "😍" },
  { id: 14, url: "", emoji: "🥰" },
  { id: 15, url: "", emoji: "😘" },
  { id: 16, url: "", emoji: "😋" },
  { id: 17, url: "", emoji: "😛" },
  { id: 18, url: "", emoji: "😜" },
  { id: 19, url: "", emoji: "🤪" },
  { id: 20, url: "", emoji: "😝" },
  { id: 21, url: "", emoji: "🤗" },
  { id: 22, url: "", emoji: "🤭" },
  { id: 23, url: "", emoji: "😏" },
  { id: 24, url: "", emoji: "😒" },
  // 表情符号
  { id: 25, url: "", emoji: "👍" },
  { id: 26, url: "", emoji: "👎" },
  { id: 27, url: "", emoji: "👏" },
  { id: 28, url: "", emoji: "🤝" },
  { id: 29, url: "", emoji: "🙏" },
  { id: 30, url: "", emoji: "💪" },
  { id: 31, url: "", emoji: "❤️" },
  { id: 32, url: "", emoji: "💕" },
  { id: 33, url: "", emoji: "💖" },
  { id: 34, url: "", emoji: "💗" },
  { id: 35, url: "", emoji: "💓" },
  { id: 36, url: "", emoji: "💝" },
  { id: 37, url: "", emoji: "💞" },
  { id: 38, url: "", emoji: "💘" },
  { id: 39, url: "", emoji: "💝" },
  { id: 40, url: "", emoji: "☀️" },
  { id: 41, url: "", emoji: "🌙" },
  { id: 42, url: "", emoji: "⭐" },
  { id: 43, url: "", emoji: "🌈" },
  { id: 44, url: "", emoji: "🔥" },
  { id: 45, url: "", emoji: "✨" },
  { id: 46, url: "", emoji: "🎉" },
  { id: 47, url: "", emoji: "🎊" },
  { id: 48, url: "", emoji: "💯" },
];

// 点击表情
function handleEmojiClick(emoji: { url: string; emoji?: string }) {
  if (emoji.url) {
    // 自定义表情（图片）
    addEmojiDialog(emoji.url);
  } else {
    // 预设 Emoji，添加到文字内容
    setting.dialog_content += emoji.emoji;
  }
  // 关闭表情选择器
  showEmojiPicker.value = false;
}

// 触发文件选择（自定义表情）
function triggerEmojiFileInput() {
  emojiInputRef.value?.click();
}

// 切换表情选择器
function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value;
}

// Tab 切换状态
const activeTab = ref("tabContent2");
function switchTab(tabId: string) {
  activeTab.value = tabId;
}
</script>

<template>
  <div class="wrapper">
    <div class="page-content">
      <!-- ==================== 左侧：全新配置面板 ==================== -->
      <div class="cfg-panel">
        <!-- Tab 切换 -->
        <div class="cfg-tabs">
          <button
            :class="{ active: activeTab === 'tabContent1' }"
            @click="switchTab('tabContent1')"
          >
            外观设置
          </button>
          <button
            :class="{ active: activeTab === 'tabContent2' }"
            @click="switchTab('tabContent2')"
          >
            对话设置
          </button>
        </div>

        <!-- 外观设置 -->
        <div v-show="activeTab === 'tabContent1'" class="cfg-body">
          <div class="cfg-section">
            <h3>状态栏</h3>
            <div class="cfg-row">
              <label>手机信号</label>
              <select v-model="phone.single">
                <option value="1">1格</option>
                <option value="2">2格</option>
                <option value="3">3格</option>
                <option value="4">4格</option>
              </select>
            </div>
            <div class="cfg-row">
              <label>网络信号</label>
              <select v-model="phone.wifi">
                <option value="1">wifi</option>
                <option value="2">3G</option>
                <option value="3">4G</option>
                <option value="4">5G</option>
              </select>
            </div>
            <div class="cfg-row">
              <label>WiFi 信号</label>
              <select v-model="phone.wifi_single">
                <option value="1">1格</option>
                <option value="2">2格</option>
                <option value="3">3格</option>
              </select>
            </div>
            <div class="cfg-row">
              <label>手机时间</label>
              <div class="cfg-time">
                <select v-model="phone.time_hour">
                  <option v-for="h in hours" :key="h" :value="h">
                    {{ h }}
                  </option>
                </select>
                <span>:</span>
                <select v-model="phone.time_mini">
                  <option v-for="m in minutes" :key="m" :value="m">
                    {{ m }}
                  </option>
                </select>
              </div>
            </div>
            <div class="cfg-row">
              <label>充电中</label>
              <div class="cfg-radio-group">
                <label
                  ><input
                    type="radio"
                    v-model="phone.battery_charge"
                    value="1"
                  />
                  是</label
                >
                <label
                  ><input
                    type="radio"
                    v-model="phone.battery_charge"
                    value="0"
                  />
                  否</label
                >
              </div>
            </div>
            <div class="cfg-row">
              <label>手机电量</label>
              <div class="cfg-range">
                <input
                  type="range"
                  v-model="phone.battery_amount"
                  min="0"
                  max="100"
                />
                <span>{{ phone.battery_amount }}%</span>
              </div>
            </div>
            <div class="cfg-row">
              <label>听筒模式</label>
              <div class="cfg-radio-group">
                <label
                  ><input type="radio" v-model="phone.ear" value="1" />
                  是</label
                >
                <label
                  ><input type="radio" v-model="phone.ear" value="0" />
                  否</label
                >
              </div>
            </div>
          </div>

          <div class="cfg-section">
            <h3>聊天信息</h3>
            <div class="cfg-row">
              <label>消息数目</label>
              <input
                type="number"
                v-model.number="setting.message"
                style="width: 60px"
              />
            </div>
            <div class="cfg-row">
              <label>聊天标题</label>
              <input type="text" v-model="setting.title" />
            </div>
            <div class="cfg-row">
              <label>语音模式</label>
              <div class="cfg-radio-group">
                <label
                  ><input type="radio" v-model="setting.voice" value="1" />
                  是</label
                >
                <label
                  ><input type="radio" v-model="setting.voice" value="0" />
                  否</label
                >
              </div>
            </div>
            <div class="cfg-row">
              <label>聊天背景</label>
              <div class="cfg-bg-picker">
                <a class="cfg-bg-btn" href="javascript:;" title="选择背景图">
                  <span>+</span>
                  <img v-if="setting.background" :src="setting.background" />
                  <input
                    @change="setBackground($event)"
                    type="file"
                    accept="image/*"
                  />
                </a>
                <span
                  class="cfg-bg-del"
                  @click="deleteBackground"
                  v-if="setting.background !== ''"
                  >x</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 对话设置 -->
        <div v-show="activeTab === 'tabContent2'" class="cfg-body">
          <!-- 用户管理 -->
          <div class="cfg-section">
            <h3>用户管理</h3>
            <p class="cfg-hint">第一个用户默认是自己，点击头像可更换头像</p>
            <div class="cfg-user-list">
              <div
                v-for="(user, idx) in users"
                :key="idx"
                class="cfg-user-card"
              >
                <div class="cfg-user-avatar">
                  <input
                    type="file"
                    @change="setUserImage($event, idx)"
                    accept="image/*"
                  />
                  <img :src="user.image" />
                </div>
                <input type="text" v-model="user.name" class="cfg-user-name" />
                <span
                  class="user-check-badge"
                  :class="{ checked: user.selected }"
                  @click="selectUser(idx)"
                ></span>
                <span
                  v-if="idx >= 2 && !user.is_me"
                  class="cfg-user-del"
                  @click="delUser(idx)"
                  >x</span
                >
              </div>
              <div class="cfg-user-card cfg-user-add" @click="addUser">
                <span>+</span>
              </div>
            </div>
            <div class="cfg-sender">发送人：{{ getSender() }}</div>
          </div>

          <!-- 对话内容 -->
          <div class="cfg-section">
            <h3>添加对话</h3>
            <div class="cfg-row">
              <label>文字内容</label>
              <textarea v-model="setting.dialog_content" rows="3"></textarea>
            </div>
            <div class="cfg-row">
              <label>红包/转账金额</label>
              <input
                v-model.number="setting.dialog_money"
                type="number"
                style="width: 80px"
              />
            </div>

            <!-- 聊天时间 -->
            <div class="chat-time-picker">
              <label class="picker-label">添加聊天时间</label>
              <div class="picker-body">
                <div class="picker-seg date-seg">
                  <select v-model="setting.date_year">
                    <option value="">-</option>
                    <option v-for="y in 40" :key="y" :value="1990 + y">
                      {{ 1990 + y }}
                    </option>
                  </select>
                  <span class="sep">-</span>
                  <select v-model="setting.date_month">
                    <option value="">-</option>
                    <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
                  </select>
                  <span class="sep">-</span>
                  <select v-model="setting.date_day">
                    <option value="">-</option>
                    <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>
                <div class="picker-seg">
                  <select v-model="setting.date_xinqi">
                    <option value="">-</option>
                    <option value="星期一">星期一</option>
                    <option value="星期二">星期二</option>
                    <option value="星期三">星期三</option>
                    <option value="星期四">星期四</option>
                    <option value="星期五">星期五</option>
                    <option value="星期六">星期六</option>
                    <option value="星期日">星期日</option>
                    <option value="昨天">昨天</option>
                  </select>
                </div>
                <div class="picker-seg">
                  <select v-model="setting.date_shiduan">
                    <option value="">-</option>
                    <option value="上午">上午</option>
                    <option value="下午">下午</option>
                    <option value="凌晨">凌晨</option>
                  </select>
                </div>
                <div class="picker-seg time-seg">
                  <select v-model="setting.date_hour">
                    <option
                      v-for="h in 24"
                      :key="h"
                      :value="String(h - 1).padStart(2, '0')"
                    >
                      {{ String(h - 1).padStart(2, "0") }}
                    </option>
                  </select>
                  <span class="sep colon">:</span>
                  <select v-model="setting.date_min">
                    <option
                      v-for="p in 60"
                      :key="p"
                      :value="String(p - 1).padStart(2, '0')"
                    >
                      {{ String(p - 1).padStart(2, "0") }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="cfg-row">
              <label>语音时间(秒)</label>
              <input
                v-model.number="setting.dialog_voice"
                type="number"
                style="width: 60px"
              />
              <div class="cfg-radio-group" style="margin-left: 12px">
                <label
                  ><input
                    type="radio"
                    v-model="setting.dialog_voice_isread"
                    value="1"
                  />
                  已读</label
                >
                <label
                  ><input
                    type="radio"
                    v-model="setting.dialog_voice_isread"
                    value="0"
                  />
                  未读</label
                >
              </div>
            </div>
            <div class="cfg-row">
              <label>红包备注</label>
              <input v-model="setting.dialog_repacket_remark" type="text" />
            </div>
            <div class="cfg-row">
              <label>转账备注</label>
              <input v-model="setting.dialog_trans_remark" type="text" />
            </div>
            <div class="cfg-btn-group">
              <button class="btn-text" @click="addTextDialog">+ 文字</button>
              <button class="btn-time" @click="addNoticeDialog">+ 时间</button>
              <div class="cfg-file-btn btn-image">
                + 图片
                <input type="file" @change="addImageDialog($event)" accept="image/*" />
              </div>
              <button class="btn-voice" @click="addVoiceDialog">+ 语音</button>
              <button class="btn-redpacket" @click="addRedpacketDialog">+ 红包</button>
              <button class="btn-transfer" @click="addTransferDialog">+ 转账</button>
              <button class="btn-emoji" @click="toggleEmojiPicker">+ 表情</button>
            </div>

            <!-- 表情选择器 -->
            <div v-if="showEmojiPicker" class="emoji-picker"
            @click.stop>
              <div class="emoji-tabs">
                <button
                  :class="{ active: activeEmojiTab === 'preset' }"
                  @click="activeEmojiTab = 'preset'"
                >预设</button>
                <button
                  :class="{ active: activeEmojiTab === 'custom' }"
                  @click="activeEmojiTab = 'custom'"
                >自定义</button>
              </div>
              <div class="emoji-content">
                <!-- 预设表情 -->
                <div v-if="activeEmojiTab === 'preset'" class="emoji-grid">
                  <span
                    v-for="emoji in presetEmojis"
                    :key="emoji.id"
                    class="emoji-item"
                    @click="handleEmojiClick(emoji)"
                  >{{ emoji.emoji }}</span>
                </div>
                <!-- 自定义表情 -->
                <div v-if="activeEmojiTab === 'custom'" class="emoji-grid">
                  <div
                    v-for="(emoji, index) in setting.customEmojis"
                    :key="index"
                    class="emoji-item custom"
                    @click="handleEmojiClick({ url: emoji })"
                  >
                    <img :src="emoji" alt="自定义表情" />
                    <span class="emoji-delete" @click.stop="removeCustomEmoji(index)">×</span>
                  </div>
                  <div class="emoji-add"
                    @click="triggerEmojiFileInput()">
                    +
                    <input
                      ref="emojiInputRef"
                      type="file"
                      accept="image/*"
                      style="display: none"
                      @change="addCustomEmoji($event)"
                    />
                  </div>
                </div>
              </div>
              <div class="emoji-hint">点击表情添加到输入框，自定义表情点击后直接插入聊天</div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="cfg-section">
            <div class="cfg-actions">
              <button class="cfg-btn cfg-btn-danger" @click="cleanDialogs">
                清空对话
              </button>
              <button class="cfg-btn cfg-btn-primary" @click="save">
                生成图片
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 右侧：微信预览（完全保留） ==================== -->
      <div class="phone-wrap" id="element-to-record">
        <div class="phone-content">
          <div id="phone" class="phone">
            <!-- 顶部状态栏 -->
            <div class="phone-top">
              <div class="phone-bar">
                <div class="phone-time">
                  {{ phone.time_hour }}:{{ phone.time_mini }}
                </div>
                <div
                  :class="[
                    'phone-sigle',
                    { 'phone-sigle-v1': phone.single == 1 },
                    { 'phone-sigle-v2': phone.single == 2 },
                    { 'phone-sigle-v3': phone.single == 3 },
                    { 'phone-sigle-v4': phone.single == 4 },
                  ]"
                >
                  信号
                </div>
                <div
                  :class="[
                    'phone-wifi',
                    { 'phone-wifi-v2': phone.wifi > 1 },
                    phone.wifi == 1 ? 'phone-wifi-s' + phone.wifi_single : '',
                  ]"
                >
                  <template v-if="phone.wifi == 1"> wifi </template>
                  <template v-else-if="phone.wifi == 2"> 3G </template>
                  <template v-else-if="phone.wifi == 3"> 4G </template>
                  <template v-else-if="phone.wifi == 4"> 5G </template>
                </div>
                <div
                  :class="[
                    'phone-battery',
                    { 'phone-battery-charge': phone.battery_charge == 1 },
                  ]"
                >
                  <span
                    ><font :style="{ width: phone.battery_amount + '%' }"
                      >电量</font
                    ><i></i
                  ></span>
                </div>
              </div>

              <div class="phone-nav">
                <div class="phone-nav-left">
                  <div class="phone-nav-back">返回</div>
                  <span v-if="setting.message && setting.message > 0">{{
                    setting.message
                  }}</span>
                </div>
                <div class="phone-nav-center">
                  <span
                    ><font>{{ setting.title }}</font
                    ><i v-if="phone.ear == 1"></i
                  ></span>
                </div>
                <div class="phone-nav-right">
                  <div class="phone-nav-more">更多</div>
                </div>
              </div>
            </div>

            <!-- 聊天背景 -->
            <div class="phone-bg">
              <img
                v-if="setting.background"
                :src="setting.background"
                @load="onBackgroundLoad($event)"
                alt="聊天背景"
              />
            </div>
            <div class="phone-water"></div>

            <!-- 聊天内容 -->
            <div class="phone-body">
              <div class="wechat-content">
                <template v-for="(dialog, index) in dialogs" :key="dialog.id">
                  <div
                    :class="[
                      'wechat-dialog',
                      { 'wechat-dialog-right': dialog.is_me },
                    ]"
                  >
                    <div
                      v-if="dialog.type !== 'notice'"
                      class="wechat-dialog-face"
                    >
                      <img :src="getUserById(dialog.user_id ?? 0).image" />
                    </div>

                    <!-- 文字 -->
                    <template v-if="dialog.type === 'text'">
                      <div
                        class="wechat-dialog-text"
                        v-html="dialog.content"
                      ></div>
                    </template>

                    <!-- 图片 -->
                    <template v-if="dialog.type === 'image'">
                      <div
                        :class="[
                          'wechat-dialog-text',
                          'wechat-dialog-image',
                          {
                            'wechat-dialog-image-noborder':
                              setting.background !== '',
                          },
                        ]"
                      >
                        <img :src="dialog.image" alt="图片消息" />
                      </div>
                    </template>

                    <!-- 语音 -->
                    <template v-if="dialog.type === 'voice'">
                      <div class="wechat-dialog-text wechat-dialog-voice">
                        <div
                          v-if="dialog.is_me"
                          :style="{ width: getVoiceLength(dialog.time) + 'px' }"
                        ></div>
                        <span v-if="dialog.is_me">{{ dialog.time }}"</span>
                        <i></i>
                        <span v-if="!dialog.is_me">{{ dialog.time }}"</span>
                        <div
                          v-if="!dialog.is_me"
                          :style="{ width: getVoiceLength(dialog.time) + 'px' }"
                        ></div>
                        <em v-if="!dialog.is_me && dialog.isread == '0'"></em>
                      </div>
                    </template>

                    <!-- 系统通知 -->
                    <template v-if="dialog.type === 'notice'">
                      <div class="wechat-dialog-notice">
                        <span
                          :class="[
                            {
                              'wechat-dialog-notice-has-bg':
                                setting.background !== '',
                            },
                            { 'wechat-dialog-notice-system': dialog.is_system },
                          ]"
                          v-html="dialog.content"
                        ></span>
                      </div>
                    </template>

                    <!-- 转账 / 红包 -->
                    <template
                      v-if="
                        dialog.type === 'transfer' ||
                        dialog.type === 'redpacket'
                      "
                    >
                      <div
                        :class="[
                          'wechat-dialog-text',
                          'wechat-dialog-trans',
                          { 'wechat-dialog-trans-get': dialog.is_get },
                        ]"
                      >
                        <div
                          :class="[
                            'wechat-dialog-trans-content',
                            {
                              'wechat-dialog-redp-content':
                                dialog.type === 'redpacket',
                            },
                          ]"
                        >
                          <i></i>
                          <div>
                            <span v-if="dialog.type === 'transfer'"
                              >¥{{
                                moneyFormat(dialog.money ?? 0, 2, "", false)
                              }}</span
                            >
                            <font v-if="dialog.type === 'transfer'">{{
                              dialog.remark
                            }}</font>
                            <span v-if="dialog.type === 'redpacket'">{{
                              dialog.remark
                            }}</span>
                            <font
                              v-if="
                                dialog.type === 'redpacket' && dialog.is_get
                              "
                            >
                              已领取</font
                            >
                          </div>
                        </div>
                        <div class="wechat-dialog-trans-bottom">
                          <span v-if="dialog.type === 'transfer'"
                            >微信转账</span
                          >
                          <span v-if="dialog.type === 'redpacket'"
                            >微信红包</span
                          >
                        </div>
                      </div>
                    </template>

                    <!-- 删除 & 领取 -->
                    <a
                      @click="deleteDialog(index)"
                      class="a-wechat-dialog-del"
                      href="javascript:;"
                      title="删除对话"
                      >X</a
                    >
                    <div
                      v-if="!dialog.is_get && dialog.type === 'redpacket'"
                      class="a-wechat-dialog-menu"
                    >
                      <a @click="redpacketGet(index)">领取</a>
                    </div>
                    <div
                      v-if="!dialog.is_get && dialog.type === 'transfer'"
                      class="a-wechat-dialog-menu"
                    >
                      <a @click="transferGet(index)">领取</a>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- 手机底栏 -->
            <div class="phone-bottom">
              <div class="phone-bottom-chat">
                <div class="wechat-bottom">
                  <div
                    :class="[
                      'wechat-bottom-icon',
                      'wechat-voice-icon',
                      { 'wechat-voice-say-icon': setting.voice == 1 },
                    ]"
                  >
                    语音
                  </div>
                  <div
                    :class="[
                      'wechat-input',
                      { 'wechat-input-say': setting.voice == 1 },
                    ]"
                  >
                    <template v-if="setting.voice == 1">按住 说话</template>
                    <template v-else>输入框</template>
                  </div>
                  <div class="wechat-bottom-icon wechat-emoji-icon">表情</div>
                  <div class="wechat-bottom-icon wechat-more-icon">
                    更多功能
                  </div>
                </div>
              </div>
              <div class="phone-bottom-bar"><i>返回桌面</i></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 录制 / 导出区域（隐藏） -->
      <div style="display: none; margin-left: 10px">
        <video controls autoplay playsinline id="preview-video"></video>
      </div>
      <canvas
        id="background-canvas"
        style="position: absolute; left: -99999px"
      ></canvas>
    </div>

    <!-- lightbox export trigger -->
    <a
      id="lightBoxToggle"
      style="display: none"
      href="javascript:;"
      data-width="300"
      data-caption="右击图片，点击图片另存为即可下载图片"
      >生成图片</a
    >
  </div>
</template>
