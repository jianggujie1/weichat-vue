(function () {
  function findVue() {
    const el = document.querySelector("#vueApp");
    return el && el.__vue__ ? el.__vue__ : null;
  }

  // 图片缓存池
  let imageCache = [];

  function injectUI(app) {
    if (document.getElementById("auto-gen-panel")) return;

    // 1. 创建悬浮球 (入口)
    const fab = document.createElement("div");
    fab.id = "auto-gen-fab";
    fab.innerHTML = "💬";
    fab.style =
      "position:fixed; bottom:20px; right:20px; z-index:999998; width:50px; height:50px; background:#07c160; color:white; border-radius:50%; display:none; align-items:center; justify-content:center; cursor:pointer; font-size:24px; box-shadow:0 4px 12px rgba(0,0,0,0.2);";

    // 2. 创建主面板
    const panel = document.createElement("div");
    panel.id = "auto-gen-panel";
    panel.style =
      "position:fixed; bottom:20px; right:20px; z-index:999999; background:rgba(255,255,255,0.98); padding:15px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.2); width:340px; border:1px solid #ddd; font-family:sans-serif;";

    panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <b style="color:#07c160;">智能多功能导入器</b>
                <button id="closePanel" style="border:none; background:none; cursor:pointer; font-size:20px; color:#999;">×</button>
            </div>
            <div style="margin-bottom:8px;">
                <label style="font-size:12px; color:#666;">1. 先选择对话中需要的图片(可选):</label>
                <input type="file" id="imageFiles" multiple accept="image/*" style="font-size:12px; width:100%; margin-top:4px;">
            </div>
            <textarea id="batchInput" style="width:100%; height:200px; border:1px solid #ddd; border-radius:8px; padding:10px; font-size:12px; box-sizing:border-box; outline:none; line-height:1.5;" 
                placeholder="格式示例：\n我: 吃了没？\n对方: [图片:1]\n我: 还没呢\n想吃火锅\n时间: 12:00"></textarea>
            <div style="margin:10px 0; font-size:12px; display:flex; align-items:center; gap:10px;">
                <span>主角名称:</span>
                <input type="text" id="meName" value="我" style="width:60px; border:1px solid #ddd; padding:2px 5px;">
                <span style="color:#999;">(识别为绿色气泡)</span>
            </div>
            <button id="btnImport" style="width:100%; background:#07c160; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;">批量导入对话</button>
        `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    // --- 交互逻辑 ---

    // 图片预读处理
    document.getElementById("imageFiles").onchange = async (e) => {
      imageCache = [];
      for (let file of e.target.files) {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(file);
        });
        imageCache.push(base64);
      }
    };

    // 面板隐藏/显示
    document.getElementById("closePanel").onclick = () => {
      panel.style.display = "none";
      fab.style.display = "flex";
    };
    fab.onclick = () => {
      fab.style.display = "none";
      panel.style.display = "block";
    };

    // 核心导入逻辑
    document.getElementById("btnImport").onclick = function () {
      const text = document.getElementById("batchInput").value;
      const myName = document.getElementById("meName").value;
      if (!text.trim()) return;

      const lines = text.split("\n");
      const dialogStack = [];

      lines.forEach((line) => {
        if (!line.trim()) return;

        // 尝试匹配 “姓名:内容”
        const match = line.match(/^(.+?)[:](.*)$/);

        if (match) {
          const name = match[1].trim();
          const content = match[2].trim();
          const isMe = name === myName;
          const userId = isMe ? "user-1" : "user-2";

          let item = {
            id: "dialog-" + Date.now() + dialogStack.length,
            user_id: userId,
            is_me: isMe,
            type: "text",
            content: content,
          };

          // A. 时间/系统消息识别
          if (name === "时间") {
            item.type = "notice";
            item.content = "  " + content;
            delete item.user_id;
            delete item.is_me;
            dialogStack.push(item);
          } else if (name === "系统") {
            item.type = "notice";
            item.content = content;
            item.is_system = 1;
            delete item.user_id;
            delete item.is_me;
            dialogStack.push(item);
          }
          // B. 图片识别 [图片:1]
          else if (content.match(/\[图片:(\d+)\]/)) {
            const imgIdx = parseInt(content.match(/\[图片:(\d+)\]/)[1]) - 1;
            if (imageCache[imgIdx]) {
              item.type = "image";
              item.image = imageCache[imgIdx];
              delete item.content;
              dialogStack.push(item);
            } else {
              console.warn("未找到对应索引的图片");
            }
          }
          // C. 语音识别 [语音:秒数]
          else if (content.includes("[语音:")) {
            item.type = "voice";
            item.time = parseInt(content.match(/\[语音:(\d+)\]/)[1]);
            item.isread = 1;
            dialogStack.push(item);
          }
          // D. 红包识别 [红包:金额:备注:是否领取(0/1)]
          else if (content.includes("[红包:")) {
            const p = content.match(/\[红包:([\d\.]+):?(.*?):?(\d)?\]/);
            item.type = "redpacket";
            item.money = p[1];
            item.remark = p[2] || "恭喜发财";
            item.is_get = p[3] === "0" ? false : true;
            dialogStack.push(item);
          }
          // E. 转账识别 [转账:金额:备注:是否领取(0未收/1已收)]
          else if (content.includes("[转账:")) {
            const p = content.match(/\[转账:([\d\.]+):?(.*?):?(\d)?\]/);
            if (p) {
              item.type = "transfer";
              item.money = p[1];
              item.is_get = p[3] === "1"; // 1为已领取
              item.remark = item.is_get ? "已被接收" : p[2] || "请确认收钱";
              item.trans_remark = p[2] || "转账给你"; // 原本的转账说明
              dialogStack.push(item);
            }
          }
          // F. 普通文本
          else {
            dialogStack.push(item);
          }
        } else if (dialogStack.length > 0) {
          // 如果这行没有“姓名:”，则合并到上一条文本消息中（处理换行）
          const lastItem = dialogStack[dialogStack.length - 1];
          if (lastItem.type === "text") {
            lastItem.content += "\n" + line;
          }
        }
      });

      // 最后统一将文本中的 \n 转换为 <br> 以适配 Vue 渲染
      dialogStack.forEach((item) => {
        if (item.type === "text" && item.content) {
          item.content = item.content.replace(/\n/g, "<br>");
        }
        app.dialogs.push(item);
      });
    };
  }

  // 自动探测初始化
  let retry = 0;
  function init() {
    const app = findVue();
    if (app) {
      injectUI(app);
    } else if (retry < 10) {
      retry++;
      setTimeout(init, 1000);
    }
  }
  init();
})();
