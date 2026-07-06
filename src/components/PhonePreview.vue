<script setup lang="ts">
import { useChat } from "@/composables/useChat";
import { onMounted, onUnmounted } from "vue";

const chat = useChat();
const {
  phone,
  setting,
  dialogs,
  getUserById,
  getVoiceLength,
  moneyFormat,
  onBackgroundLoad,
  deleteDialog,
  redpacketGet,
  transferGet,
} = chat;

// ── pinch-to-zoom ────────────────────────────────────────────────────────────
let lastDistance = 0;
let currentScale = 1;
const MIN_SCALE = 0.3;
const MAX_SCALE = 3;

function getTouchDistance(t1: Touch, t2: Touch) {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length !== 2) return;
  e.preventDefault();
  lastDistance = getTouchDistance(e.touches[0], e.touches[1]);
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length !== 2) return;
  e.preventDefault();
  const dist = getTouchDistance(e.touches[0], e.touches[1]);
  const delta = dist / lastDistance;
  currentScale = Math.min(Math.max(currentScale * delta, MIN_SCALE), MAX_SCALE);
  lastDistance = dist;
  applyScale(currentScale);
}

function onTouchEnd(e: TouchEvent) {
  if (e.touches.length < 2) {
    lastDistance = 0;
  }
}

function applyScale(scale: number) {
  const content = document.querySelector(".phone-content") as HTMLElement | null;
  if (!content) return;
  content.style.transform = `scale(${scale})`;
  const wrap = document.querySelector(".phone-wrap") as HTMLElement | null;
  if (!wrap) return;
  const baseW = 390;
  const baseH = 844;
  wrap.style.width = `${baseW * scale}px`;
  wrap.style.height = `${baseH * scale}px`;
}

onMounted(() => {
  const el = document.querySelector(".phone-wrap") as HTMLElement | null;
  if (!el) return;
  el.addEventListener("touchstart", onTouchStart, { passive: false });
  el.addEventListener("touchmove", onTouchMove, { passive: false });
  el.addEventListener("touchend", onTouchEnd);
  el.addEventListener("touchcancel", onTouchEnd);
});

onUnmounted(() => {
  const el = document.querySelector(".phone-wrap") as HTMLElement | null;
  if (!el) return;
  el.removeEventListener("touchstart", onTouchStart);
  el.removeEventListener("touchmove", onTouchMove);
  el.removeEventListener("touchend", onTouchEnd);
  el.removeEventListener("touchcancel", onTouchEnd);
});
</script>

<template>
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
                ><font :style="{ width: phone.battery_amount + '%' }">电量</font
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
                <div v-if="dialog.type !== 'notice'" class="wechat-dialog-face">
                  <img :src="getUserById(dialog.user_id ?? 0).image" />
                </div>

                <!-- 文字 -->
                <template v-if="dialog.type === 'text'">
                  <div class="wechat-dialog-text" style="white-space: pre-wrap;" v-html="dialog.content"></div>
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
                    <span v-if="dialog.is_me">{{ dialog.time }}</span>
                    <i></i>
                    <span v-if="!dialog.is_me">{{ dialog.time }}</span>
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
                    dialog.type === 'transfer' || dialog.type === 'redpacket'
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
                          >¥{{ moneyFormat(dialog.money ?? 0, 2, "") }}</span
                        >
                        <font v-if="dialog.type === 'transfer'">{{
                          dialog.remark
                        }}</font>
                        <span v-if="dialog.type === 'redpacket'">{{
                          dialog.remark
                        }}</span>
                        <font
                          v-if="dialog.type === 'redpacket' && dialog.is_get"
                        >
                          已领取</font
                        >
                      </div>
                    </div>
                    <div class="wechat-dialog-trans-bottom">
                      <span v-if="dialog.type === 'transfer'">微信转账</span>
                      <span v-if="dialog.type === 'redpacket'">微信红包</span>
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
              <div class="wechat-bottom-icon wechat-more-icon">更多功能</div>
            </div>
          </div>
          <div class="phone-bottom-bar"><i>返回桌面</i></div>
        </div>
      </div>
    </div>
  </div>
</template>
