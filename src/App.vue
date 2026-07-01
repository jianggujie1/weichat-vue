<script setup lang="ts">
import { useChat } from "./composables/useChat";
import ConfigPanel from "./components/ConfigPanel.vue";
import PhonePreview from "./components/PhonePreview.vue";

const { save } = useChat();
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
      data-width="300"
      data-caption="右击图片，点击图片另存为即可下载图片"
      @click="save"
      >生成图片</a
    >
  </div>
</template>

