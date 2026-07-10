<script setup lang="ts">
import { useChat } from "./composables/useChat";
import ConfigPanel from "./components/ConfigPanel.vue";
import PhonePreview from "./components/PhonePreview.vue";

const { save, previewImage, closePreview } = useChat();

function downloadPreview() {
  if (!previewImage.dataUrl) return;
  const link = document.createElement("a");
  link.download = "wechat-chat.png";
  link.href = previewImage.dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  closePreview();
}
</script>

<template>
  <div class="wrapper">
    <div class="page-content">
      <ConfigPanel />
      <PhonePreview />

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
      @click="save"
      >生成图片</a
    >

    <!-- 图片预览弹窗：参照旧项目 zui.lightbox，图片原尺寸显示，超出可滚动 -->
    <Teleport to="body">
      <div v-if="previewImage.visible" class="preview-overlay" @click.self="closePreview">
        <div class="preview-modal">
          <div class="preview-header">
            <span>图片预览</span>
            <button class="preview-close" @click="closePreview">×</button>
          </div>
          <div class="preview-body">
            <img :src="previewImage.dataUrl" alt="预览" />
          </div>
          <div class="preview-footer">
            <p class="preview-hint">长按图片或右键另存为即可保存</p>
            <button class="preview-download-btn" @click="downloadPreview">
              下载图片
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: auto;
}

.preview-modal {
  background: #fff;
  margin: 40px auto;
  border-radius: 4px;
  overflow: hidden;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  font-size: 14px;
  font-weight: 500;
}

.preview-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}
.preview-body {
  overflow: auto;
  text-align: center;
  background: #1a1a1a;
  line-height: 0;
  flex: 1;
}

.preview-body img {
  display: block;
  max-width: 100%;
  height: auto;
}


.preview-footer {
  padding: 10px 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-hint {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.preview-download-btn {
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 32px;
  font-size: 14px;
  cursor: pointer;
}
</style>