<script>
import { onDestroy, onMount } from "svelte";
import { pioConfig, profileConfig, siteConfig } from "@/config";

const labels = {
  talk: "\u8a71\u3059",
  title: "\u6708\u306e\u6848\u5185\u5f79",
  close: "x",
  send: "\u9001\u4fe1",
  placeholder: "\u77e5\u308a\u305f\u3044\u3053\u3068\u3092\u5165\u529b",
  intro: "\u81ea\u5df1\u7d39\u4ecb",
  features: "\u3067\u304d\u308b\u3053\u3068",
  recommend: "\u304a\u3059\u3059\u3081",
  contact: "\u9023\u7d61\u5148",
  greeting: "\u3053\u3093\u306b\u3061\u306f\u3002\u6c17\u306b\u306a\u308b\u3053\u3068\u3092\u9078\u3076\u304b\u3001\u305d\u306e\u307e\u307e\u8cea\u554f\u3057\u3066\u306d\u3002",
  openHint: "\u8cea\u554f\u3092\u9078\u3076\u304b\u3001\u305d\u306e\u307e\u307e\u8a71\u3057\u304b\u3051\u3066\u304f\u3060\u3055\u3044\u3002",
  empty: "\u77ed\u3044\u4e00\u8a00\u3067\u3082\u5927\u4e08\u592b\u3067\u3059\u3002\u305f\u3068\u3048\u3070\u300e\u304a\u3059\u3059\u3081\u30da\u30fc\u30b8\u300f\u307f\u305f\u3044\u306b\u805e\u3044\u3066\u307f\u3066\u304f\u3060\u3055\u3044\u3002",
  fallback: "\u305d\u306e\u8a71\u984c\u3082\u6848\u5185\u3067\u304d\u307e\u3059\u3002\u300e\u81ea\u5df1\u7d39\u4ecb\u300f\u300e\u3067\u304d\u308b\u3053\u3068\u300f\u300e\u304a\u3059\u3059\u3081\u30da\u30fc\u30b8\u300f\u300e\u9023\u7d61\u5148\u300f\u3042\u305f\u308a\u304b\u3089\u805e\u3044\u3066\u304f\u308c\u308b\u3068\u7b54\u3048\u3084\u3059\u3044\u3067\u3059\u3002",
  ready: "\u3053\u3093\u306b\u3061\u306f\u3002\u53f3\u4e0a\u306e\u30c1\u30e3\u30c3\u30c8\u304b\u3089\u8a71\u3057\u304b\u3051\u3089\u308c\u307e\u3059\u3002",
};

const quickActions = [
  { label: labels.intro, prompt: labels.intro },
  { label: labels.features, prompt: labels.features },
  { label: labels.recommend, prompt: labels.recommend },
  { label: labels.contact, prompt: labels.contact },
];

const pioOptions = {
  mode: pioConfig.mode,
  hidden: pioConfig.hiddenOnMobile,
  content: pioConfig.dialog || {},
  model: pioConfig.models || ["/pio/models/pio/model.json"],
};

let pioInstance = null;
let pioInitialized = false;
let pioContainer;
let pioCanvas;
let isHiddenForViewport = false;
let isChatOpen = false;
let chatInput = "";
let chatMessages = [{ role: "assistant", text: labels.greeting }];

function getAvailablePages() {
  const pages = [];
  if (siteConfig.featurePages?.projects) pages.push("Projects");
  if (siteConfig.featurePages?.timeline) pages.push("Timeline");
  if (siteConfig.featurePages?.diary) pages.push("Diary");
  if (siteConfig.featurePages?.albums) pages.push("Albums");
  if (siteConfig.featurePages?.friends) pages.push("Friends");
  if (siteConfig.featurePages?.skills) pages.push("Skills");
  return pages;
}

function speak(text, time = 5000) {
  if (pioInstance && typeof pioInstance.message === "function") {
    pioInstance.message(text, { time });
  }
}

function pushMessage(role, text) {
  chatMessages = [...chatMessages, { role, text }].slice(-8);
}

function navigateTo(href) {
  if (typeof window === "undefined") return;
  if (window.swup) {
    window.swup.navigate(href);
    return;
  }
  window.location.href = href;
}

function buildReply(rawText) {
  const text = rawText.trim();
  const normalized = text.toLowerCase();
  const pages = getAvailablePages();
  const githubLink = profileConfig.links?.find((item) => item.name?.toLowerCase() === "github")?.url;

  if (!text) return labels.empty;

  if (
    normalized.includes("about") ||
    text.includes("\u81ea\u5df1\u7d39\u4ecb") ||
    text.includes("\u3042\u306a\u305f") ||
    text.includes("\u541b\u306f")
  ) {
    return `${profileConfig.name} \u306e\u6848\u5185\u5f79\u3067\u3059\u3002\u30b5\u30a4\u30c8\u5185\u306e\u898b\u3069\u3053\u308d\u3084\u79fb\u52d5\u5148\u3092\u3059\u3050\u6848\u5185\u3067\u304d\u307e\u3059\u3002`;
  }

  if (
    normalized.includes("help") ||
    normalized.includes("feature") ||
    text.includes("\u3067\u304d\u308b") ||
    text.includes("\u4f55\u304c")
  ) {
    const summary = pages.length > 0
      ? `\u4eca\u306f ${pages.join(" / ")} \u306a\u3069\u3092\u898b\u3066\u56de\u308c\u307e\u3059\u3002`
      : "\u8a18\u4e8b\u3084\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u307e\u308f\u308a\u3092\u4e2d\u5fc3\u306b\u6848\u5185\u3067\u304d\u307e\u3059\u3002";
    return `\u8a18\u4e8b\u3092\u8aad\u3080\u3001\u30da\u30fc\u30b8\u3092\u6848\u5185\u3059\u308b\u3001\u898b\u3069\u3053\u308d\u3092\u7d39\u4ecb\u3059\u308b\u3001\u3068\u3044\u3046\u4f7f\u3044\u65b9\u304c\u5f97\u610f\u3067\u3059\u3002${summary}`;
  }

  if (
    normalized.includes("recommend") ||
    text.includes("\u304a\u3059\u3059\u3081") ||
    text.includes("\u3069\u3053\u304b\u3089")
  ) {
    return pages.length > 0
      ? `\u307e\u305a\u306f ${pages.slice(0, 3).join("\u3001")} \u3092\u8a2a\u308c\u308b\u306e\u304c\u304a\u3059\u3059\u3081\u3067\u3059\u3002\u8a18\u4e8b\u3092\u8ffd\u3044\u305f\u3044\u3068\u304d\u306f\u30a2\u30fc\u30ab\u30a4\u30d6\u3082\u898b\u3084\u3059\u3044\u3067\u3059\u3002`
      : "\u307e\u305a\u306f\u300e\u7d39\u4ecb\u300f\u3068\u300e\u8a18\u9332\u300f\u304b\u3089\u3086\u3063\u304f\u308a\u89d7\u3044\u3066\u307f\u3066\u304f\u3060\u3055\u3044\u3002";
  }

  if (
    normalized.includes("contact") ||
    normalized.includes("github") ||
    text.includes("\u9023\u7d61") ||
    text.includes("\u554f\u3044\u5408\u308f\u305b")
  ) {
    return githubLink
      ? `GitHub \u306f\u3053\u3061\u3089\u3067\u3059: ${githubLink}`
      : "\u4eca\u306f GitHub \u30ea\u30f3\u30af\u304c\u4e3b\u306a\u9023\u7d61\u5148\u306b\u306a\u3063\u3066\u3044\u307e\u3059\u3002\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u6b04\u3082\u898b\u3066\u307f\u3066\u304f\u3060\u3055\u3044\u3002";
  }

  if (
    normalized.includes("post") ||
    normalized.includes("blog") ||
    text.includes("\u8a18\u4e8b") ||
    text.includes("\u6700\u65b0")
  ) {
    return "\u8a18\u4e8b\u3092\u8aad\u307f\u305f\u3044\u306a\u3089\u3001\u30a2\u30fc\u30ab\u30a4\u30d6\u3084\u30c8\u30c3\u30d7\u306e\u6700\u65b0\u6295\u7a3f\u304c\u304a\u3059\u3059\u3081\u3067\u3059\u3002\u6c17\u306b\u306a\u308b\u5c0e\u5165\u53e3\u304c\u3042\u308c\u3070\u3001\u6b21\u306b\u898b\u308b\u9806\u756a\u3082\u6848\u5185\u3057\u307e\u3059\u3002";
  }

  return labels.fallback;
}

function handleAsk(rawText) {
  const text = rawText.trim();
  if (!text) return;

  pushMessage("user", text);
  const reply = buildReply(text);
  pushMessage("assistant", reply);
  chatInput = "";
  isChatOpen = true;
  speak(reply, 6000);
}

function openChatWithGreeting() {
  isChatOpen = !isChatOpen;
  if (isChatOpen) speak(labels.openHint, 4000);
}

function initPio() {
  if (typeof window !== "undefined" && typeof Paul_Pio !== "undefined") {
    try {
      if (pioContainer && pioCanvas && !pioInitialized) {
        pioInstance = new Paul_Pio(pioOptions);
        pioInitialized = true;
        speak(labels.ready, 4500);
      } else if (!pioContainer || !pioCanvas) {
        setTimeout(initPio, 100);
      }
    } catch (error) {
      console.error("Pio initialization error:", error);
    }
  } else {
    setTimeout(initPio, 100);
  }
}

function loadPioAssets() {
  if (typeof window === "undefined") return;

  const loadScript = (src, id) => new Promise((resolve, reject) => {
    if (document.querySelector(`#${id}`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  loadScript("/pio/static/l2d.js", "pio-l2d-script")
    .then(() => loadScript("/pio/static/pio.js", "pio-main-script"))
    .then(() => setTimeout(initPio, 100))
    .catch((error) => {
      console.error("Failed to load Pio scripts:", error);
    });
}

onMount(() => {
  if (!pioConfig.enable) return;

  isHiddenForViewport = !!(
    pioConfig.hiddenOnMobile &&
    window.matchMedia("(max-width: 1280px)").matches
  );

  if (isHiddenForViewport) return;
  loadPioAssets();
});

onDestroy(() => {
  console.log("Pio Svelte component destroyed (keeping instance alive)");
});
</script>

{#if pioConfig.enable && !isHiddenForViewport}
  <div class={`pio-container ${pioConfig.position || "right"}`} bind:this={pioContainer}>
    <div class="assistant-shell">
      <button
        type="button"
        class="assistant-toggle"
        on:click|stopPropagation={openChatWithGreeting}
        aria-expanded={isChatOpen}
        aria-label="\u6848\u5185\u30c1\u30e3\u30c3\u30c8\u3092\u958b\u304f"
      >
        {labels.talk}
      </button>

      {#if isChatOpen}
        <div class="assistant-panel">
          <div class="assistant-header">
            <strong>{labels.title}</strong>
            <button type="button" class="assistant-close" on:click={() => (isChatOpen = false)}>{labels.close}</button>
          </div>

          <div class="assistant-messages">
            {#each chatMessages as message}
              <div class={`assistant-message ${message.role}`}>
                {message.text}
              </div>
            {/each}
          </div>

          <div class="assistant-quick-actions">
            {#each quickActions as action}
              <button type="button" class="assistant-chip" on:click={() => handleAsk(action.prompt)}>
                {action.label}
              </button>
            {/each}
          </div>

          <form class="assistant-form" on:submit|preventDefault={() => handleAsk(chatInput)}>
            <input type="text" bind:value={chatInput} placeholder={labels.placeholder} maxlength="80" />
            <button type="submit">{labels.send}</button>
          </form>

          <div class="assistant-links">
            <button type="button" class="assistant-link" on:click={() => navigateTo("/about/")}>\u7d39\u4ecb</button>
            <button type="button" class="assistant-link" on:click={() => navigateTo("/archive/")}>\u8a18\u9332</button>
            {#if siteConfig.featurePages?.projects}
              <button type="button" class="assistant-link" on:click={() => navigateTo("/projects/")}>\u8a08\u753b</button>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="pio-action"></div>
    <canvas id="pio" bind:this={pioCanvas} width={pioConfig.width || 280} height={pioConfig.height || 250}></canvas>
  </div>
{/if}

<style>
  .assistant-shell {
    position: absolute;
    top: 0.45rem;
    right: 0.6rem;
    z-index: 4;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: auto;
  }

  :global(.pio-container.right) .assistant-shell {
    left: auto;
    right: 0.6rem;
  }

  .assistant-toggle {
    border: 0;
    border-radius: 999px;
    padding: 0.45rem 0.9rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #6c4b62;
    background: rgba(255, 248, 252, 0.96);
    box-shadow: 0 10px 28px rgba(86, 62, 80, 0.14);
    cursor: pointer;
  }

  .assistant-panel {
    width: 18rem;
    margin-top: 0.45rem;
    padding: 0.8rem;
    border-radius: 1rem;
    border: 1px solid rgba(120, 92, 117, 0.14);
    background: rgba(255, 252, 254, 0.97);
    backdrop-filter: blur(10px);
    box-shadow: 0 16px 40px rgba(67, 48, 66, 0.16);
  }

  .assistant-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.6rem;
    color: #6c4b62;
  }

  .assistant-close {
    border: 0;
    background: transparent;
    font-size: 1rem;
    cursor: pointer;
    color: #8b6b82;
  }

  .assistant-messages {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    max-height: 12rem;
    overflow: auto;
    padding-right: 0.1rem;
  }

  .assistant-message {
    padding: 0.55rem 0.7rem;
    border-radius: 0.85rem;
    font-size: 0.78rem;
    line-height: 1.45;
  }

  .assistant-message.assistant {
    background: #fff;
    color: #5f4a5a;
    border: 1px solid rgba(120, 92, 117, 0.08);
  }

  .assistant-message.user {
    background: #f6e4ef;
    color: #714d68;
    margin-left: 1.6rem;
  }

  .assistant-quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin-top: 0.7rem;
  }

  .assistant-chip,
  .assistant-link {
    border: 0;
    border-radius: 999px;
    padding: 0.4rem 0.7rem;
    font-size: 0.72rem;
    cursor: pointer;
    background: #f5eaf1;
    color: #6f5369;
  }

  .assistant-form {
    display: flex;
    gap: 0.45rem;
    margin-top: 0.75rem;
  }

  .assistant-form input {
    flex: 1;
    min-width: 0;
    border: 1px solid rgba(120, 92, 117, 0.14);
    border-radius: 0.75rem;
    padding: 0.55rem 0.7rem;
    font-size: 0.78rem;
    background: #fff;
  }

  .assistant-form button {
    border: 0;
    border-radius: 0.75rem;
    padding: 0.55rem 0.8rem;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    background: #efb7d2;
    color: #5b3a51;
  }

  .assistant-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin-top: 0.7rem;
  }
</style>
