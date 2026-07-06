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

    <!-- 图片预览弹窗 -->
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
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

  background: #fff;
  border-radius: 12px;
  width: min(90vw, 600px);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  font-size: 15px;
  font-weight: 500;
}

.preview-close {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #999;
  padding: 0;
  line-height: 1;
}

.preview-body {
  padding: 12px;
  overflow: auto;
  max-height: 60vh;
}

.preview-body img {
  max-width: 100%;
  max-height: 60vh;
  display: block;
  border-radius: 4px;
}

.preview-footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
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
  border-radius: 6px;
  padding: 8px 32px;
  font-size: 15px;
  cursor: pointer;
}
</style>

