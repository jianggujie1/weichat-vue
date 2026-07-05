<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useChat } from "@/composables/useChat";

const chat = useChat();
const {
  phone,
  setting,
  dialogs,
  users,
  getSender,
  setUserImage,
  selectUser,
  addUser,
  delUser,
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
  batchImport,
  cleanDialogs,
  save,
} = chat;
// Tab 切换状态
const activeTab = ref("tabContent3");
function switchTab(tabId: string) {
  activeTab.value = tabId;
}

// 表情选择器状态
const showEmojiPicker = ref(false);
const showEmojiPickerBatch = ref(false);
const activeEmojiTab = ref("preset");
const emojiInputRef = ref<HTMLInputElement | null>(null);
const batchTextareaRef = ref<HTMLTextAreaElement | null>(null);

const presetEmojis = [
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

function handleEmojiClick(emoji: { url: string; emoji?: string }) {
  if (emoji.url) {
    addEmojiDialog(emoji.url);
  } else {
    setting.dialog_content += emoji.emoji;
  }
  showEmojiPicker.value = false;
}

function triggerEmojiFileInput() {
  emojiInputRef.value?.click();
}

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value;
}
function toggleEmojiPickerBatch() {
  showEmojiPickerBatch.value = !showEmojiPickerBatch.value;
}

async function handleBatchEmojiClick(emoji: { url: string; emoji?: string }, index?: number) {
  const textarea = batchTextareaRef.value;
  if (!textarea) return;

  let insertText = "";
  if (emoji.url) {
    // 自定义表情：插入 [表情:N] 占位符
    insertText = `[表情:${index! + 1}]`;
  } else {
    // 预设表情：直接插入 emoji 字符
    insertText = emoji.emoji || "";
  }

  const start = textarea.selectionStart ?? setting.batch_text.length;
  const end = textarea.selectionEnd ?? start;
  const before = setting.batch_text.slice(0, start);
  const after = setting.batch_text.slice(end);
  setting.batch_text = before + insertText + after;

  // 将光标移到插入文本之后
  await nextTick();
  textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
  textarea.focus();
}

// ── batch import ────────────────────────────────────────────────────────────
const imageCache = ref<string[]>([]);
const batchMyName = ref("我");

function handleImportImages(e: Event) {
  imageCache.value = [];
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      imageCache.value.push(ev.target!.result as string);
    };
    reader.readAsDataURL(file);
  }
}

function handleBatchImport() {
  if (!setting.batch_text.trim()) {
    alert("请输入批量导入内容");
    return;
  }
  const countBefore = dialogs.length;
  batchImport(setting.batch_text, batchMyName.value, imageCache.value);
  const countAfter = dialogs.length;
  alert(`批量导入完成！\n新增 ${countAfter - countBefore} 条对话`);
}

const contentRef = ref<HTMLTextAreaElement | null>(null);

function handleKeyDown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTextDialog();
    } else if (e.key === 'm') {
      e.preventDefault();
      addTransferDialog();
    }
  }
}

onMounted(() => {
  setTimeout(() => {
    contentRef.value?.focus();
  }, 100);
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="cfg-panel">
    <!-- Tab 切换 -->
    <div class="cfg-tabs">
      <button :class="{ active: activeTab === 'tabContent1' }" @click="switchTab('tabContent1')">
        外观设置
      </button>
      <button :class="{ active: activeTab === 'tabContent2' }" @click="switchTab('tabContent2')">
        对话设置
      </button>
      <button :class="{ active: activeTab === 'tabContent3' }" @click="switchTab('tabContent3')">
        批量导入
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
              <option v-for="h in chat.hours" :key="h" :value="h">{{ h }}</option>
            </select>
            <span>:</span>
            <select v-model="phone.time_mini">
              <option v-for="m in chat.minutes" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </div>
        <div class="cfg-row">
          <label>充电中</label>
          <div class="cfg-radio-group">
            <label><input type="radio" v-model="phone.battery_charge" value="1" /> 是</label>
            <label><input type="radio" v-model="phone.battery_charge" value="0" /> 否</label>
          </div>
        </div>
        <div class="cfg-row">
          <label>手机电量</label>
          <div class="cfg-range">
            <input type="range" v-model="phone.battery_amount" min="0" max="100" />
            <span>{{ phone.battery_amount }}%</span>
          </div>
        </div>
        <div class="cfg-row">
          <label>听筒模式</label>
          <div class="cfg-radio-group">
            <label><input type="radio" v-model="phone.ear" value="1" /> 是</label>
            <label><input type="radio" v-model="phone.ear" value="0" /> 否</label>
          </div>
        </div>
      </div>

      <div class="cfg-section">
        <h3>聊天信息</h3>
        <div class="cfg-row">
          <label>消息数目</label>
          <input type="number" v-model.number="setting.message" style="width: 60px" />
        </div>
        <div class="cfg-row">
          <label>聊天标题</label>
          <input type="text" v-model="setting.title" />
        </div>
        <div class="cfg-row">
          <label>语音模式</label>
          <div class="cfg-radio-group">
            <label><input type="radio" v-model="setting.voice" value="1" /> 是</label>
            <label><input type="radio" v-model="setting.voice" value="0" /> 否</label>
          </div>
        </div>
        <div class="cfg-row">
          <label>聊天背景</label>
          <div class="cfg-bg-picker">
            <a class="cfg-bg-btn" href="javascript:;" title="选择背景图">
              <span>+</span>
              <img v-if="setting.background" :src="setting.background" />
              <input @change="setBackground($event)" type="file" accept="image/*" />
            </a>
            <span class="cfg-bg-del" @click="deleteBackground" v-if="setting.background !== ''">x</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话设置 -->
    <div v-show="activeTab === 'tabContent2'" class="cfg-body">
      <div class="cfg-section">
        <h3>用户管理</h3>
        <p class="cfg-hint">第一个用户默认是自己，点击头像可更换头像</p>
        <div class="cfg-user-list">
          <div v-for="(user, idx) in users" :key="idx" class="cfg-user-card">
            <div class="cfg-user-avatar">
              <input type="file" @change="setUserImage($event, idx)" accept="image/*" />
              <img :src="user.image" />
            </div>
            <input type="text" v-model="user.name" class="cfg-user-name" />
            <span class="user-check-badge" :class="{ checked: user.selected }" @click="selectUser(idx)"></span>
            <span v-if="idx >= 2 && !user.is_me" class="cfg-user-del" @click="delUser(idx)">x</span>
          </div>
          <div class="cfg-user-card cfg-user-add" @click="addUser">
            <span>+</span>
          </div>
        </div>
        <div class="cfg-sender">发送人：{{ getSender() }}</div>
      </div>

      <div class="cfg-section">
        <h3>添加对话</h3>
        <div class="cfg-row">
          <label>文字内容</label>
          <textarea ref="contentRef" v-model="setting.dialog_content" rows="3"></textarea>
        </div>
        <div class="cfg-row">
          <label>红包/转账金额</label>
          <input v-model.number="setting.dialog_money" type="number" style="width: 80px" />
        </div>

        <div class="chat-time-picker">
          <label class="picker-label">添加聊天时间</label>
          <div class="picker-body">
            <div class="picker-seg date-seg">
              <select v-model="setting.date_year">
                <option value="">-</option>
                <option v-for="y in 40" :key="y" :value="1990 + y">{{ 1990 + y }}</option>
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
                <option v-for="h in 24" :key="h" :value="String(h - 1).padStart(2, '0')">
                  {{ String(h - 1).padStart(2, "0") }}
                </option>
              </select>
              <span class="sep colon">:</span>
              <select v-model="setting.date_min">
                <option v-for="p in 60" :key="p" :value="String(p - 1).padStart(2, '0')">
                  {{ String(p - 1).padStart(2, "0") }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="cfg-row">
          <label>语音时间(秒)</label>
          <input v-model.number="setting.dialog_voice" type="number" style="width: 60px" />
          <div class="cfg-radio-group" style="margin-left: 12px">
            <label><input type="radio" v-model="setting.dialog_voice_isread" value="1" /> 已读</label>
            <label><input type="radio" v-model="setting.dialog_voice_isread" value="0" /> 未读</label>
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
          <button class="btn-text" @click="addTextDialog">+ 文字 (Ctrl+Enter)</button>
          <button class="btn-time" @click="addNoticeDialog">+ 时间</button>
          <div class="cfg-file-btn btn-image">
            + 图片
            <input type="file" @change="addImageDialog($event)" accept="image/*" />
          </div>
          <button class="btn-voice" @click="addVoiceDialog">+ 语音</button>
          <button class="btn-redpacket" @click="addRedpacketDialog">+ 红包</button>
          <button class="btn-transfer" @click="addTransferDialog">+ 转账 (Ctrl+M)</button>
          <button class="btn-emoji" @click="toggleEmojiPicker">+ 表情</button>
        </div>

        <div v-if="showEmojiPicker" class="emoji-picker" @click.stop>
          <div class="emoji-tabs">
            <button :class="{ active: activeEmojiTab === 'preset' }" @click="activeEmojiTab = 'preset'">预设</button>
            <button :class="{ active: activeEmojiTab === 'custom' }" @click="activeEmojiTab = 'custom'">自定义</button>
          </div>
          <div class="emoji-content">
            <div v-if="activeEmojiTab === 'preset'" class="emoji-grid">
              <span v-for="emoji in presetEmojis" :key="emoji.id" class="emoji-item" @click="handleEmojiClick(emoji)">
                {{ emoji.emoji }}
              </span>
            </div>
            <div v-if="activeEmojiTab === 'custom'" class="emoji-grid">
              <div v-for="(emoji, index) in setting.customEmojis" :key="index" class="emoji-item custom" @click="handleEmojiClick({ url: emoji })">
                <img :src="emoji" alt="自定义表情" />
                <span class="emoji-delete" @click.stop="removeCustomEmoji(index)">×</span>
              </div>
              <div class="emoji-add" @click="triggerEmojiFileInput()">
                +
                <input ref="emojiInputRef" type="file" accept="image/*" style="display: none" @change="addCustomEmoji($event)" />
              </div>
            </div>
          </div>
          <div class="emoji-hint">点击表情添加到输入框，自定义表情点击后直接插入聊天</div>
        </div>
      </div>


      <div class="cfg-section">
        <div class="cfg-actions">
          <button class="cfg-btn cfg-btn-danger" @click="cleanDialogs">清空对话</button>
          <button class="cfg-btn cfg-btn-primary" @click="save">生成图片</button>
        </div>
      </div>
    </div>

    <!-- 批量导入 -->
    <div v-show="activeTab === 'tabContent3'" class="cfg-body">
      <div class="cfg-section">
        <h3>批量导入对话</h3>
        <p class="cfg-hint">
          格式：<code>姓名: 内容</code>，支持多行文本、图片、语音、红包、转账、时间、系统消息
          <br/>表情用法：预设表情（如 😀😃）直接输入文本中；自定义表情包用 <code>[表情:N]</code> 占位符，N 为表情在"自定义"列表中的顺序（从 1 开始）
        </p>
        <div class="cfg-row" style="flex-wrap:wrap;">
          <label>预载图片（可选）</label>
          <input type="file" multiple accept="image/*" @change="handleImportImages" />
        </div>
        <div class="cfg-row">
          <label>主角名称</label>
          <input v-model="batchMyName" type="text" style="width: 80px" />
          <span style="color:#999; font-size:12px; margin-left:6px;">（识别为绿色气泡）</span>
        </div>
        <textarea
          ref="batchTextareaRef"
          v-model="setting.batch_text"
          style="width:100%; height:160px; border:1px solid #ddd; border-radius:8px; padding:10px; font-size:12px; box-sizing:border-box; outline:none; line-height:1.5; resize:vertical;"
          placeholder="格式示例：
我: 吃了没？
我: 😀 笑一笑
对方: [图片:1]
我: 还没呢
想吃火锅
时间: 12:00
对方: [语音:5]
我: [红包:188.88:恭喜发财:0]
对方: [转账:50:请你喝奶茶:1]
我: [表情:1]"
        ></textarea>
        <div class="cfg-row" style="flex-wrap:wrap; align-items:center;">
          <button class="cfg-btn" style="margin-right:8px; flex-shrink:0;" @click="toggleEmojiPickerBatch">表情</button>
          <span style="color:#999; font-size:11px; word-break:break-all;">
            [图片:1] / [语音:5] / [表情:1] / [红包:金额:备注:0/1] / [转账:金额:备注:0/1] / 时间: / 系统:
          </span>
        </div>

        <div v-if="showEmojiPickerBatch" class="emoji-picker" @click.stop>
          <div class="emoji-tabs">
            <button :class="{ active: activeEmojiTab === 'preset' }" @click="activeEmojiTab = 'preset'">预设</button>
            <button :class="{ active: activeEmojiTab === 'custom' }" @click="activeEmojiTab = 'custom'">自定义</button>
          </div>
          <div class="emoji-content">
            <div v-if="activeEmojiTab === 'preset'" class="emoji-grid">
              <span v-for="emoji in presetEmojis" :key="emoji.id" class="emoji-item" @click="handleBatchEmojiClick(emoji)">
                {{ emoji.emoji }}
              </span>
            </div>
            <div v-if="activeEmojiTab === 'custom'" class="emoji-grid">
              <div v-for="(emoji, index) in setting.customEmojis" :key="index" class="emoji-item custom" @click="handleBatchEmojiClick({ url: emoji }, index)">
                <img :src="emoji" alt="自定义表情" />
              </div>
              <div class="emoji-add" @click="triggerEmojiFileInput()">
                +
                <input ref="emojiInputRef" type="file" accept="image/*" style="display: none" @change="addCustomEmoji($event)" />
              </div>
            </div>
          </div>
          <div class="emoji-hint">点击预设表情直接插入，点击自定义表情插入 [表情:N] 占位符</div>
        </div>

        <button
          class="cfg-btn cfg-btn-primary"
          style="margin-top:8px;"
          @click="handleBatchImport"
        >批量导入对话</button>
      </div>
    </div>
  </div>
</template>
