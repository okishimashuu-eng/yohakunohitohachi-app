/* =========================
   余白の一鉢｜診断ロジック
   4タイプ：
   - 消耗タイプ
   - 思考オーバーヒートタイプ
   - 刺激疲れタイプ
   - 自己後回しタイプ
   ========================= */

const TYPES = [
  { key: "depletion", name: "消耗タイプ", emoji: "🌿" },
  { key: "overheat", name: "思考オーバーヒートタイプ", emoji: "🌿" },
  { key: "stim", name: "刺激疲れタイプ", emoji: "🌿" },
  { key: "selfless", name: "自己後回しタイプ", emoji: "🌿" },
];

const QUESTIONS = [
  // 1-3: 消耗
  "朝起きたとき、すでに疲れを感じている。",
  "休みの日でも、どこか気が抜けない。",
  "（少し刺す）「まだ頑張れる」と自分に言い聞かせてしまう。",

  // 4-6: 思考オーバーヒート
  "考えごとが止まらず、眠りにくい。",
  "物事を決めるとき、最適解を探しすぎてしまう。",
  "（少し刺す）失敗しないために、先回りして考えすぎてしまう。",

  // 7-9: 刺激疲れ
  "気づくとスマホを何度も開いている。",
  "何もしていない時間に、落ち着かない。",
  "（少し刺す）静かな時間より、刺激のある時間を選びがちだ。",

  // 10-12: 自己後回し
  "自分よりも人の予定を優先することが多い。",
  "頼まれると断るのが苦手だ。",
  "（少し刺す）自分のために時間やお金を使うことに罪悪感がある。",
];

const SCALE = [
  { label: "まったく当てはまらない", value: 0, badge: "A" },
  { label: "あまり当てはまらない", value: 1, badge: "B" },
  { label: "どちらともいえない", value: 2, badge: "C" },
  { label: "やや当てはまる", value: 3, badge: "D" },
  { label: "とても当てはまる", value: 4, badge: "E" },
];

// タイプごとの「王道・育てやすい」植物ベース（ここが核）
const TYPE_PLANTS = {
  depletion: [
    plant("サンスベリア", "控えめな世話でOK。疲れてても枯らしにくい。", "自己管理が苦手な時の救世主。", "永久", "明るい室内〜半日陰", "春夏2〜3週 / 冬は月1", "水のやりすぎ・低温"),
    plant("ポトス", "とにかく強い。気持ちが落ちてても育つ。", "『回復のスイッチ』になりやすい。", "永遠の富", "明るい室内（直射×）", "土が乾いたら / 冬は控えめ", "冷え・水切れ放置"),
    plant("ドラセナ（幸福の木）", "見た目が元気をくれる。管理も簡単。", "部屋の雰囲気を整える。", "幸福", "明るい室内", "土が乾いたら", "寒さ・根腐れ"),
  ],
  overheat: [
    plant("パキラ", "シンプルな世話で“思考の熱”を下げる。", "ルールがある方が安心するタイプ向け。", "快活", "明るい室内", "土が乾いたら", "水やり過多"),
    plant("ガジュマル", "幹の存在感で“今ここ”に戻す。", "考えすぎを止める物体アンカー。", "健康", "明るい室内", "春夏は乾いたら / 冬は控えめ", "冷え・乾燥しすぎ"),
    plant("フィカス・ウンベラータ", "葉が大きく、呼吸がゆっくりになる。", "視界に『余白』を作る。", "すこやか", "明るい室内（直射×）", "表面が乾いたら", "乾燥・葉焼け"),
  ],
  stim: [
    plant("モンステラ", "刺激が多い日でも、強く育つ。", "『大きい葉』が気持ちを落ち着かせる。", "壮大な計画", "明るい室内", "表面が乾いたら", "冷え・過湿"),
    plant("スパティフィラム", "しおれ→水で復活が分かりやすい。", "『整った反応』が安心になる。", "清らかな心", "明るい日陰", "土が乾く前に軽く", "乾燥・強光"),
    plant("アイビー（ヘデラ）", "成長が見える。気が散っても続けやすい。", "“ちょい世話”で満足感。", "友情", "明るい室内", "乾いたら", "水切れ放置"),
  ],
  selfless: [
    plant("ZZプランツ（ザミオクルカス）", "放置OK。自分のために時間を取りやすい。", "頑張りすぎのブレーキ役。", "輝く未来", "明るい室内〜半日陰", "月1〜2回", "水やり過多"),
    plant("シェフレラ（カポック）", "丈夫で育てやすい。『ほどほど』が叶う。", "他人優先の癖をゆるめる。", "実直", "明るい室内", "乾いたら", "寒さ"),
    plant("アグラオネマ", "落ち着いた葉。気疲れを緩和する見た目。", "“静かな安心”を部屋に置く。", "青春", "明るい日陰", "乾いたら", "低温"),
  ],
};

// 主×副 で「3つ」を作るルール：
// - 主タイプの上位2つ + 副タイプの上位1つ（重複は飛ばして補充）
function pickPlants(primaryKey, secondaryKey) {
  const p = TYPE_PLANTS[primaryKey] || [];
  const s = TYPE_PLANTS[secondaryKey] || [];
  const pool = [...p, ...s, ...p, ...s]; // 重複補充用
  const picked = [];

  const want = [
    p[0], p[1], s[0],
    p[2], s[1], s[2],
  ].filter(Boolean);

  for (const item of want) {
    if (!picked.find(x => x.name === item.name)) picked.push(item);
    if (picked.length >= 3) break;
  }
  // 足りない場合はpoolから埋める
  for (const item of pool) {
    if (picked.length >= 3) break;
    if (!picked.find(x => x.name === item.name)) picked.push(item);
  }
  return picked.slice(0, 3);
}

function plant(name, reason, why, hanakotoba, place, water, ng) {
  return { name, reason, why, hanakotoba, place, water, ng, img: "" };
}

// 画面要素
const quizEl = document.getElementById("quiz");
const btnResult = document.getElementById("btnResult");
const btnReset = document.getElementById("btnReset");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const hint = document.getElementById("hint");

const primaryTypeEl = document.getElementById("primaryType");
const secondaryTypeEl = document.getElementById("secondaryType");
const plantsEl = document.getElementById("plants");
const whyBox = document.getElementById("whyBox");
const careAll = document.getElementById("careAll");

const btnStart = document.getElementById("btnStart");
const btnStart2 = document.getElementById("btnStart2");
const btnAbout = document.getElementById("btnAbout");
const btnTop = document.getElementById("btnTop");
const btnBackTop = document.getElementById("btnBackTop");
const btnToPaid = document.getElementById("btnToPaid");

btnStart?.addEventListener("click", () => scrollToId("diagnosis"));
btnStart2?.addEventListener("click", () => scrollToId("diagnosis"));
btnAbout?.addEventListener("click", () => scrollToId("about"));
btnTop?.addEventListener("click", () => scrollToId("top"));
btnBackTop?.addEventListener("click", () => scrollToId("top"));
btnToPaid?.addEventListener("click", () => alert("有料版は準備中（後で追加OK）"));

// 初期化
renderQuestions();
restoreAnswers();
updateProgress();

btnReset.addEventListener("click", () => {
  localStorage.removeItem("yohaku_answers");
  localStorage.removeItem("yohaku_result");
  // 全ラジオ解除
  document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
  plantsEl.innerHTML = "";
  primaryTypeEl.textContent = "主タイプ：-";
  secondaryTypeEl.textContent = "副タイプ：-";
  whyBox.style.display = "none";
  careAll.style.display = "none";
  hint.textContent = "※未回答があると結果が出ません。全12問、どれかを選択してね。";
  updateProgress();
  scrollToId("diagnosis");
});

btnResult.addEventListener("click", () => {
  const answers = collectAnswers();
  const answeredCount = Object.keys(answers).length;

  if (answeredCount < QUESTIONS.length) {
    hint.textContent = `⚠️ 未回答が ${QUESTIONS.length - answeredCount} 個ある。全部答えてから結果が出るよ。`;
    hint.style.color = "#8a2b2b";
    scrollToFirstUnanswered(answers);
    return;
  }

  hint.style.color = "";
  hint.textContent = "OK。結果を作成中…";

  const result = diagnose(answers);
  localStorage.setItem("yohaku_answers", JSON.stringify(answers));
  localStorage.setItem("yohaku_result", JSON.stringify(result));

  renderResult(result);
  scrollToId("result");
});

function renderQuestions() {
  quizEl.innerHTML = "";
  QUESTIONS.forEach((q, i) => {
    const wrap = document.createElement("div");
    wrap.className = "q";
    wrap.dataset.q = String(i);

    const title = document.createElement("div");
    title.className = "q-title";
    title.textContent = `${i + 1}) ${q}`;
    wrap.appendChild(title);

    const opts = document.createElement("div");
    opts.className = "options";

    SCALE.forEach(s => {
      const label = document.createElement("label");
      label.className = "opt";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${i}`;
      radio.value = String(s.value);
      radio.addEventListener("change", () => {
        saveAnswers();
        updateProgress();
      });

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = s.badge;

      const txt = document.createElement("span");
      txt.textContent = s.label;

      label.appendChild(radio);
      label.appendChild(badge);
      label.appendChild(txt);
      opts.appendChild(label);
    });

    wrap.appendChild(opts);
    quizEl.appendChild(wrap);
  });
}

function collectAnswers() {
  const answers = {};
  for (let i = 0; i < QUESTIONS.length; i++) {
    const chosen = document.querySelector(`input[name="q${i}"]:checked`);
    if (chosen) answers[i] = Number(chosen.value);
  }
  return answers;
}

function saveAnswers() {
  const answers = collectAnswers();
  localStorage.setItem("yohaku_answers", JSON.stringify(answers));
}

function restoreAnswers() {
  const raw = localStorage.getItem("yohaku_answers");
  if (!raw) return;
  try {
    const answers = JSON.parse(raw);
    Object.keys(answers).forEach(k => {
      const i = Number(k);
      const v = String(answers[k]);
      const r = document.querySelector(`input[name="q${i}"][value="${v}"]`);
      if (r) r.checked = true;
    });
  } catch {}
  const resRaw = localStorage.getItem("yohaku_result");
  if (resRaw) {
    try {
      const result = JSON.parse(resRaw);
      renderResult(result);
    } catch {}
  }
}

function updateProgress() {
  const answers = collectAnswers();
  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / QUESTIONS.length) * 100);
  progressBar.style.width = `${pct}%`;
  progressText.textContent = `${answered} / ${QUESTIONS.length} answered`;
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToFirstUnanswered(answers) {
  for (let i = 0; i < QUESTIONS.length; i++) {
    if (answers[i] == null) {
      const block = document.querySelector(`.q[data-q="${i}"]`);
      if (block) block.scrollIntoView({ behavior: "smooth", block: "center" });
      break;
    }
  }
}

function diagnose(answers) {
  // 4タイプのスコア計算（各3問）
  const scores = {
    depletion: sum(answers, [0,1,2]),
    overheat: sum(answers, [3,4,5]),
    stim: sum(answers, [6,7,8]),
    selfless: sum(answers, [9,10,11]),
  };

  // 順位付け
  const ranked = Object.entries(scores)
    .map(([k, v]) => ({ key: k, score: v }))
    .sort((a,b) => b.score - a.score);

  const primary = ranked[0];
  const secondary = ranked[1];

  const primaryName = TYPES.find(t => t.key === primary.key)?.name || primary.key;
  const secondaryName = TYPES.find(t => t.key === secondary.key)?.name || secondary.key;

  const plants = pickPlants(primary.key, secondary.key);

  const why = buildWhy(primary.key, secondary.key, scores);

  return {
    scores,
    primary: { key: primary.key, name: primaryName, score: primary.score },
    secondary: { key: secondary.key, name: secondaryName, score: secondary.score },
    plants,
    why,
  };
}

function sum(ans, idxs) {
  return idxs.reduce((acc, i) => acc + (ans[i] ?? 0), 0);
}

function buildWhy(pKey, sKey, scores) {
  const name = (k) => TYPES.find(t => t.key === k)?.name ?? k;
  const p = name(pKey);
  const s = name(sKey);

  // “共感が取れる”説明（本格っぽい言い回し）
  const map = {
    depletion: "エネルギー残量が少なく、回復より先に『維持』に力が割かれがち。",
    overheat: "頭の中の処理が止まらず、休む時間も“思考”が動いてしまいがち。",
    stim: "刺激の多さで神経が疲れやすく、静けさが逆に落ち着かない時がある。",
    selfless: "他人優先が染みついていて、自分のケアが後回しになりがち。",
  };

  const line1 = `主タイプは「${p}」。${map[pKey] || ""}`;
  const line2 = `副タイプは「${s}」。${map[sKey] || ""}`;
  const line3 = `提案する植物は「育てやすさ」と「生活に馴染む安心感」を最優先に選んでいます。`;

  // スコア見せ（本格感）
  const scoreLine = `（スコア：消耗${scores.depletion} / 思考${scores.overheat} / 刺激${scores.stim} / 自己後回し${scores.selfless}）`;

  return [line1, line2, line3, scoreLine];
}

function renderResult(result) {
  primaryTypeEl.textContent = `主タイプ：${result.primary.name}`;
  secondaryTypeEl.textContent = `副タイプ：${result.secondary.name}`;

  whyBox.style.display = "block";
  whyBox.innerHTML = `
    <h3>なぜこの結果？</h3>
    <p class="muted" style="margin:8px 0 0;">
      ${escapeHtml(result.why[0])}<br/>
      ${escapeHtml(result.why[1])}<br/>
      ${escapeHtml(result.why[2])}<br/>
      <span class="tiny">${escapeHtml(result.why[3])}</span>
    </p>
  `;

  plantsEl.innerHTML = "";
  result.plants.forEach((p, i) => {
    const el = document.createElement("div");
    el.className = "card plant";
    el.innerHTML = `
      <div class="plant-head">
        <div>
          <div class="plant-name">植物${i+1}：${escapeHtml(p.name)}</div>
          <div class="muted small">${escapeHtml(p.reason)}</div>
        </div>
        <div class="tag">花言葉：${escapeHtml(p.hanakotoba)}</div>
      </div>

      <div class="plant-grid">
        <div class="kv">
          <b>置き場所</b>
          <div class="muted">${escapeHtml(p.place)}</div>
        </div>
        <div class="kv">
          <b>水やり</b>
          <div class="muted">${escapeHtml(p.water)}</div>
        </div>
        <div class="kv">
          <b>NG（注意）</b>
          <div class="muted">${escapeHtml(p.ng)}</div>
        </div>
        <div class="kv">
          <b>なぜ合うか</b>
          <div class="muted">${escapeHtml(p.why)}</div>
        </div>
      </div>
    `;
    plantsEl.appendChild(el);
  });

  careAll.style.display = "block";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
