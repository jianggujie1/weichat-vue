import { reactive, watch } from "vue";
import type { Dialog, User, PhoneConfig, SettingConfig } from "../types/index";
import { moneyFormat, getVoiceLength } from "../utils/index";
// ─── helpers ───────────────────────────────────────────────────────────────
const $ = (sel: string) => document.querySelector(sel);

// gif.js 类型声明
declare global {
  interface Window {
    GIF: import("../types/index").GifConstructor;
    html2canvas: (
      element: HTMLElement,
      options?: Record<string, unknown>,
    ) => Promise<HTMLCanvasElement>;
  }
}

// 录制状态
interface RecordingState {
  isRecording: boolean;
  frameCount: number;
  progress: number;
}

const recordingState = reactive<RecordingState>({
  isRecording: false,
  frameCount: 0,
  progress: 0,
});

let gifInstance: import("../types/index").GIFInstance | null = null;
let captureInterval: ReturnType<typeof setInterval> | null = null;
const FRAME_INTERVAL = 100; // 每100ms捕获一帧

// ─── default data ──────────────────────────────────────────────────────────
const state = {
  phone: reactive<PhoneConfig>({
    single: 4,
    wifi: 4,
    wifi_single: 3,
    time_hour: "12",
    time_mini: "00",
    battery_charge: 0,
    battery_amount: 50,
    ear: 0,
  }),
  setting: reactive<SettingConfig>({
    message: 1,
    title: "甜甜",
    voice: 0,
    background: "static/app/images/background-ddd.jpg",
    date_year: "",
    date_month: "",
    date_day: "",
    date_xinqi: "",
    date_shiduan: "",
    date_hour: "12",
    date_min: "41",
    dialog_content: "",
    dialog_money: 88,
    dialog_voice: 2,
    dialog_voice_isread: "0",
    dialog_repacket_remark: "恭喜发财，大吉大利",
    dialog_trans_remark: "请收款",
    customEmojis: [],
  }),
  users: reactive<User[]>([
    {
      name: "微信对话生成器",
      image: "./static/app/images/user-ddd.jpg",
      is_me: true,
      selected: true,
    },
    {
      id: "user-2",
      name: "甜甜",
      image: "static/app/images/user2.png",
      is_me: false,
      selected: false,
    },
  ]),
  dialogs: reactive<Dialog[]>([]),
};

export function useChat() {
  const { phone, setting, users, dialogs } = state;

  // ── localStorage persistence ──────────────────────────────────────────────
  const STORAGE_KEY_USERS = "weichat_users";
  const STORAGE_KEY_DIALOGS = "weichat_dialogs";

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_DIALOGS, JSON.stringify(dialogs));
    } catch (e) {
      console.warn("保存数据到 localStorage 失败:", e);
    }
  }

  function loadFromStorage() {
    try {
      const savedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      const savedDialogs = localStorage.getItem(STORAGE_KEY_DIALOGS);
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          users.splice(0, users.length, ...parsed);
        }
      }
      if (savedDialogs) {
        const parsed = JSON.parse(savedDialogs);
        if (Array.isArray(parsed)) {
          dialogs.splice(0, dialogs.length, ...parsed);
        }
      }
    } catch (e) {
      console.warn("从 localStorage 加载数据失败:", e);
    }
  }

  // 启动时加载已保存的数据
  loadFromStorage();

  // 监听变化自动保存
  watch([users, dialogs], saveToStorage, { deep: true });

  // ── user helpers ──────────────────────────────────────────────────────────
  function getMe(): User {
    return users.find((u) => u.is_me) || users[0];
  }

  function getOther(): User {
    return users.find((u) => !u.is_me) || users[1];
  }

  function getSender(): string {
    const sel = users.find((u) => u.selected);
    return sel ? sel.name : getMe().name;
  }

  function getSelectedUser(): User {
    return users.find((u) => u.selected) || users[0];
  }

  function getUserById(id?: number): User {
    return users[id ?? 0] || getMe();
  }

  function toggleUser(index: number) {
    users.forEach((u, i) => (u.selected = i === index));
  }

  function addUser() {
    users.push({
      name: `用户${users.length + 1}`,
      image: "./static/app/images/user-face.png",
      is_me: false,
      selected: false,
    });
  }

  function delUser(index: number) {
    if (index < 2) return; // keep first two
    users.splice(index, 1);
  }

  function selectUser(index: number) {
    toggleUser(index);
  }

  function setUserImage(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      users[index].image = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ── phone / background ────────────────────────────────────────────────────
  function onBackgroundLoad(event: Event) {
    const canvas = $("#background-canvas") as HTMLCanvasElement | null;
    if (canvas) {
      const img = event.target as HTMLImageElement;
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
    }
  }

  function setBackground(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setting.background = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function deleteBackground() {
    setting.background = "";
  }

  function onBatteryChange(e: Event) {
    phone.battery_amount = +(e.target as HTMLInputElement).value;
  }

  // ── dialog management ────────────────────────────────────────────────────
  let dialogIdCounter = 0;

  function getDialogDefaults(
    type: Dialog["type"],
    overrides: Partial<Dialog> = {},
  ): Dialog {
    return {
      id: ++dialogIdCounter,
      type,
      is_me: false,
      is_get: false,
      isread: "0",
      time: 1,
      image: "",
      content: "",
      money: 0,
      remark: "",
      is_system: false,
      ...overrides,
    };
  }

  function addTextDialog() {
    if (!setting.dialog_content.trim()) {
      alert("请输入对话内容");
      return;
    }
    const sender = getSelectedUser();
    dialogs.push(
      getDialogDefaults("text", {
        user_id: users.indexOf(sender),
        is_me: sender.is_me,
        content: setting.dialog_content,
      }),
    );
    // setting.dialog_content = ""; // Stop clearing content to allow repeated additions
  }

  function addNoticeDialog() {
    const dateParts: string[] = [];
    const timeParts: string[] = [];

    if (setting.date_year) dateParts.push(setting.date_year + "年");
    if (setting.date_month) dateParts.push(setting.date_month + "月");
    if (setting.date_day) dateParts.push(setting.date_day + "日");
    if (setting.date_xinqi) timeParts.push(setting.date_xinqi);
    if (setting.date_shiduan) timeParts.push(setting.date_shiduan);
    if (setting.date_hour || setting.date_min) {
      const timeStr = [setting.date_hour, setting.date_min]
        .filter(Boolean)
        .join(":");
      if (timeStr) timeParts.push(timeStr);
    }

    let content = dateParts.join("");
    if (timeParts.length > 0) {
      content += " " + timeParts.join(" ");
    }

    if (!content.trim()) {
      alert("请输入时间内容或选择时间");
      return;
    }
    dialogs.push(
      getDialogDefaults("notice", {
        is_me: false,
        is_system: false,
        content,
      }),
    );
    // setting.dialog_content = ""; // Stop clearing content to allow repeated additions
  }

  function addImageDialog(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const sender = getSelectedUser();
      dialogs.push(
        getDialogDefaults("image", {
          user_id: users.indexOf(sender),
          is_me: sender.is_me,
          image: reader.result as string,
        }),
      );
    };
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = "";
  }

  function addEmojiDialog(emojiUrl: string) {
    const sender = getSelectedUser();
    dialogs.push(
      getDialogDefaults("image", {
        user_id: users.indexOf(sender),
        is_me: sender.is_me,
        image: emojiUrl,
        is_emoji: true,
      }),
    );
  }

  function addCustomEmoji(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setting.customEmojis.push(reader.result as string);
    };
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = "";
  }

  function removeCustomEmoji(index: number) {
    setting.customEmojis.splice(index, 1);
  }

  function addVoiceDialog() {
    const time = +setting.dialog_voice || 1;
    const isRead = setting.dialog_voice_isread;
    const sender = getSelectedUser();
    dialogs.push(
      getDialogDefaults("voice", {
        user_id: users.indexOf(sender),
        is_me: sender.is_me,
        time,
        isread: isRead === "1" ? "1" : "0",
      }),
    );
  }

  function addRedpacketDialog() {
    const sender = getSelectedUser();
    dialogs.push(
      getDialogDefaults("redpacket", {
        user_id: users.indexOf(sender),
        is_me: sender.is_me,
        is_get: false,
        remark: setting.dialog_repacket_remark || "恭喜发财，大吉大利",
      }),
    );
  }

  function addTransferDialog() {
    const sender = getSelectedUser();
    dialogs.push(
      getDialogDefaults("transfer", {
        user_id: users.indexOf(sender),
        is_me: sender.is_me,
        is_get: false,
        remark: setting.dialog_trans_remark || "请收款",
        money: +setting.dialog_money || 0,
      }),
    );
  }

  function deleteDialog(index: number) {
    dialogs.splice(index, 1);
  }

  function cleanDialogs() {
    dialogs.length = 0;
  }

  function redpacketGet(index: number) {
    const dialog = dialogs[index];
    dialog.is_get = true;
    const sender = getUserById(dialog.user_id ?? 0);
    const senderName = sender ? sender.name : getOther().name;

    let noticeContent: string;
    if (dialog.is_me) {
      const receiverName = getOther() ? getOther().name : "他";
      noticeContent = `${receiverName} 领取了你的<span class="wechat-notice-highlight">红包</span>`;
    } else {
      noticeContent = `你领取了${senderName}的<span class="wechat-notice-highlight">红包</span>`;
    }

    dialogs.push(
      getDialogDefaults("notice", {
        is_system: true,
        content: noticeContent,
      }),
    );
  }

  function transferGet(index: number) {
    const dialog = dialogs[index];
    dialog.is_get = true;
    dialog.remark = "已被接收";

    const otherUser = users.find((u) => !u.is_me);
    const receiver = users.find((u) => (dialog.is_me ? !u.is_me : u.is_me));

    if (otherUser && receiver) {
      dialogs.push(
        getDialogDefaults("transfer", {
          user_id: users.indexOf(receiver),
          is_me: !dialog.is_me,
          is_get: true,
          remark: "已收款",
          money: dialog.money || 0,
        }),
      );
    }
  }

  // ── time options ──────────────────────────────────────────────────────────
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  function initPhoneTime() {
    const hourSelect = $(".edit-phone-time-hour") as HTMLSelectElement | null;
    const miniSelect = $(".edit-phone-time-mini") as HTMLSelectElement | null;
    if (hourSelect) {
      hourSelect.innerHTML = hours
        .map(
          (h) =>
            `<option value="${h}" ${h === phone.time_hour ? "selected" : ""}>${h}</option>`,
        )
        .join("");
    }
    if (miniSelect) {
      miniSelect.innerHTML = minutes
        .map(
          (m) =>
            `<option value="${m}" ${m === phone.time_mini ? "selected" : ""}>${m}</option>`,
        )
        .join("");
    }
  }

  // ── generate image ────────────────────────────────────────────────────────
  function save() {
    const phoneEl = $("#element-to-record") as HTMLElement | null;
    if (!phoneEl) {
      console.error("找不到元素 #element-to-record");
      alert("找不到要截图的元素");
      return;
    }
    if (typeof window.html2canvas === "undefined") {
      console.error("html2canvas 未加载");
      alert("html2canvas 未加载，请刷新页面");
      return;
    }
    window
      .html2canvas(phoneEl, { useCORS: true, backgroundColor: null, scale: 2 })
      .then((canvas) => {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = "wechat-chat.png";
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 100);
        }, "image/png");
      })
      .catch((err) => {
        console.error("生成图片失败:", err);
        alert("生成图片失败: " + err.message);
      });
  }

  // ── GIF recording ───────────────────────────────────────────────────────
  function captureFrame() {
    const phoneEl = $("#element-to-record") as HTMLElement | null;
    if (!phoneEl || !recordingState.isRecording) return;
    if (typeof window.html2canvas === "undefined") return;

    window
      .html2canvas(phoneEl, { useCORS: true, backgroundColor: null, scale: 1 })
      .then((canvas) => {
        if (gifInstance) {
          gifInstance.addFrame(canvas, { delay: FRAME_INTERVAL, copy: true });
          recordingState.frameCount++;
        }
      })
      .catch((err) => console.error("捕获帧失败:", err));
  }

  function startRecording() {
    if (recordingState.isRecording) return;
    const phoneEl = $("#element-to-record") as HTMLElement | null;
    if (!phoneEl) {
      alert("找不到要录制的元素");
      return;
    }
    if (typeof window.GIF === "undefined") {
      alert("GIF 库未加载，请刷新页面");
      return;
    }

    recordingState.isRecording = true;
    recordingState.frameCount = 0;
    recordingState.progress = 0;

    // 创建 GIF 实例，workerScript 指向 public 目录
    gifInstance = new window.GIF({
      workers: 2,
      quality: 10,
      width: phoneEl.offsetWidth,
      height: phoneEl.offsetHeight,
      workerScript: "/static/app/js/gif.worker.js",
    });

    gifInstance.on("progress", (p: number) => {
      recordingState.progress = Math.round(p * 100);
    });

    gifInstance.on("finished", (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "wechat-chat.gif";
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      recordingState.progress = 0;
    });

    // 定时捕获帧
    captureFrame();
    captureInterval = setInterval(captureFrame, FRAME_INTERVAL);
  }

  function stopRecording() {
    if (!recordingState.isRecording) return;
    recordingState.isRecording = false;
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }
    if (gifInstance) {
      gifInstance.render();
      gifInstance = null;
    }
  }

  return {
    phone,
    setting,
    users,
    dialogs,
    getMe,
    getOther,
    getSender,
    getUserById,
    setUserImage,
    selectUser,
    addUser,
    delUser,
    onBackgroundLoad,
    setBackground,
    deleteBackground,
    onBatteryChange,
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
    initPhoneTime,
    redpacketGet,
    transferGet,
    getVoiceLength,
    moneyFormat,
    hours,
    minutes,
    save,
    recordingState,
    startRecording,
    stopRecording,
  };
}
