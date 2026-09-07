<script setup>
import { computed } from 'vue'
import { useApp } from '../i18n/index.js'

const props = defineProps({
  results: { type: Array, required: true },
  categories: { type: Array, required: true }
})
const emit = defineEmits(['restart', 'home'])

const { tr, catText } = useApp()

const total = computed(() => props.results.length)
const correctCount = computed(() => props.results.filter((r) => r.correct).length)
const wrongList = computed(() => props.results.filter((r) => !r.correct))
const accuracy = computed(() => (total.value ? Math.round((correctCount.value / total.value) * 100) : 0))

const RANK_IMGS = ['/img/march7th.png', '/img/paimon.jpg', '/img/anby.png', '/img/kiana_bh2.jpg', '/img/kiana_bh3.png']
const rank = computed(() => {
  const ranks = tr('ranks')
  const idx = Math.max(0, ranks.findIndex((r) => accuracy.value >= r.min))
  return { ...ranks[idx], img: RANK_IMGS[idx] }
})

const catStats = computed(() =>
  props.categories
    .map((c) => {
      const list = props.results.filter((r) => r.category === c.id)
      const ok = list.filter((r) => r.correct).length
      return { ...c, total: list.length, ok }
    })
    .filter((c) => c.total > 0)
)

function answerText(r) {
  if (r.type === 'judge') return r.answer ? tr('judgeTrue') : tr('judgeFalse')
  return `${'ABCD'[r.answer]}. ${r.options[r.answer]}`
}

function chosenText(r) {
  if (r.type === 'judge') return r.chosen ? tr('judgeTrue') : tr('judgeFalse')
  if (r.chosen === null || r.chosen === undefined) return tr('unanswered')
  return `${'ABCD'[r.chosen]}. ${r.options[r.chosen]}`
}
</script>

<template>
  <div>
    <!-- 成绩卡片 -->
    <section class="score-card card">
      <div class="score-left">
        <div class="ring" :style="{ background: `conic-gradient(var(--ys-blue) ${accuracy * 3.6}deg, var(--track) 0deg)` }">
          <div class="ring-inner">
            <b>{{ accuracy }}<small>%</small></b>
            <span>{{ tr('resultAccuracy') }}</span>
          </div>
        </div>
        <p class="count-line">{{ tr('resultCount', { c: correctCount, t: total }) }}</p>
      </div>
      <div class="score-right">
        <span class="rank-tag">{{ tr('rankTag') }}</span>
        <h2>{{ rank.title }}</h2>
        <p>{{ rank.desc }}</p>
        <img :src="rank.img" :alt="rank.title" />
      </div>
    </section>

    <!-- 分类统计 -->
    <section class="section" v-if="catStats.length > 1">
      <h3>{{ tr('catStats') }}</h3>
      <div class="cat-stats card">
        <div v-for="c in catStats" :key="c.id" class="cat-stat">
          <span class="cs-name">{{ catText(c, 'name') }}</span>
          <div class="cs-bar">
            <div class="cs-fill" :style="{ width: `${(c.ok / c.total) * 100}%`, background: c.color }"></div>
          </div>
          <span class="cs-num">{{ c.ok }}/{{ c.total }}</span>
        </div>
      </div>
    </section>

    <!-- 错题回顾 -->
    <section class="section">
      <h3>{{ tr('wrongReview') }} <span v-if="!wrongList.length" class="all-right">{{ tr('allRight') }}</span></h3>
      <div v-if="wrongList.length" class="wrong-list">
        <div v-for="(r, i) in wrongList" :key="r.id" class="wrong card">
          <div class="w-head">
            <span class="w-idx">{{ i + 1 }}</span>
            <span class="w-cat">{{ catText(categories.find((c) => c.id === r.category) || {}, 'name') }}</span>
            <span class="w-type">{{ r.type === 'judge' ? tr('judge') : tr('choice') }}</span>
          </div>
          <p class="w-q">{{ r.q }}</p>
          <div class="w-answers">
            <span class="w-chip bad">{{ tr('fbYours') }}{{ chosenText(r) }}</span>
            <span class="w-chip good">{{ tr('fbCorrect') }}{{ answerText(r) }}</span>
          </div>
          <p class="w-explain">{{ tr('explainPrefix') }}{{ r.explain }}</p>
        </div>
      </div>
    </section>

    <div class="actions">
      <button class="btn primary" @click="emit('restart')">{{ tr('again') }}</button>
      <button class="btn ghost" @click="emit('home')">{{ tr('home') }}</button>
    </div>
  </div>
</template>

<style scoped>
.score-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 26px;
  background: var(--hero-grad);
}

.ring {
  width: 132px;
  height: 132px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.ring-inner {
  width: 106px;
  height: 106px;
  border-radius: 50%;
  background: var(--ys-card);
  display: grid;
  place-items: center;
  align-content: center;
}

.ring-inner b {
  font-size: 32px;
  color: var(--ys-blue-deep);
}

.ring-inner small { font-size: 16px; }
.ring-inner span { font-size: 12px; color: var(--ys-text-2); }

.count-line { text-align: center; font-size: 14px; color: var(--ys-text-2); }
.count-line .green { color: var(--ys-green); font-size: 18px; }

.score-right {
  position: relative;
  flex: 1;
  padding-right: 120px;
}

.rank-tag {
  background: var(--ys-orange);
  color: #fff;
  font-size: 12px;
  padding: 3px 12px;
  border-radius: 999px;
}

.score-right h2 { margin: 10px 0 6px; font-size: 24px; }
.score-right p { margin: 0; color: var(--ys-text-2); font-size: 13px; line-height: 1.7; }

.score-right img {
  position: absolute;
  right: 0;
  bottom: -12px;
  height: 150px;
  object-fit: contain;
  filter: drop-shadow(0 8px 14px rgba(43, 118, 187, 0.25));
}

.section { margin-top: 24px; }
.section h3 { margin: 0 0 12px; font-size: 17px; }
.all-right { color: var(--ys-orange); font-size: 14px; }

.cat-stats { padding: 18px 20px; display: grid; gap: 12px; }

.cat-stat {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cs-name { width: 110px; font-size: 13px; font-weight: 600; }

.cs-bar {
  flex: 1;
  height: 10px;
  background: var(--track);
  border-radius: 999px;
  overflow: hidden;
}

.cs-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
.cs-num { width: 42px; text-align: right; font-size: 12px; color: var(--ys-text-2); }

.wrong-list { display: grid; gap: 12px; }

.wrong { padding: 16px 18px; }

.w-head { display: flex; align-items: center; gap: 8px; }

.w-idx {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: var(--ys-red);
  color: #fff;
  font-size: 12px;
  display: grid;
  place-items: center;
}

.w-cat {
  font-size: 12px;
  background: var(--soft-2);
  color: var(--ys-blue-deep);
  padding: 2px 10px;
  border-radius: 999px;
}

.w-type { font-size: 12px; color: var(--ys-text-2); }

.w-q { margin: 10px 0; font-size: 14.5px; font-weight: 600; line-height: 1.6; }

.w-answers { display: flex; flex-wrap: wrap; gap: 8px; }

.w-chip {
  font-size: 12.5px;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 600;
}

.w-chip.bad { background: var(--no-bg); color: var(--no-text); }
.w-chip.good { background: var(--ok-bg); color: var(--ok-text); }

.w-explain {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.8;
  color: var(--ys-text-2);
}

.actions {
  display: flex;
  gap: 14px;
  margin-top: 26px;
}

.btn {
  flex: 1;
  padding: 14px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  transition: transform 0.15s;
}

.btn:hover { transform: translateY(-2px); }

.btn.primary {
  background: var(--ys-blue-grad);
  color: #fff;
  box-shadow: 0 6px 18px rgba(43, 163, 232, 0.4);
}

.btn.ghost {
  background: var(--ys-card);
  border: 2px solid var(--ys-line);
  color: var(--ys-text-2);
}

@media (max-width: 620px) {
  .score-card { flex-direction: column; }
  .score-right { padding-right: 0; padding-bottom: 130px; text-align: center; }
  .score-right img { right: 50%; transform: translateX(50%); }
  .cs-name { width: 84px; font-size: 12px; }
}
</style>
