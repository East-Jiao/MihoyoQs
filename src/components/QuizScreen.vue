<script setup>
import { computed, ref } from 'vue'
import { useApp } from '../i18n/index.js'

const props = defineProps({
  pool: { type: Array, required: true },
  categories: { type: Array, required: true }
})
const emit = defineEmits(['finish', 'quit'])

const { tr, lang, catText, displayQuestion } = useApp()

const index = ref(0)
const chosen = ref(null) // 已选项：选项下标 或 true/false
const answered = ref(false)
const results = ref([])
const streak = ref(0)

const q = computed(() => displayQuestion(props.pool[index.value], lang.value))
const cat = computed(() => props.categories.find((c) => c.id === q.value.category) || {})
const isJudge = computed(() => q.value.type === 'judge')
const isLast = computed(() => index.value === props.pool.length - 1)
const correctCount = computed(() => results.value.filter((r) => r.correct).length)

function choose(value) {
  if (answered.value) return
  chosen.value = value
  answered.value = true
  const correct = value === q.value.answer
  if (!correct) streak.value = 0
  else streak.value += 1
  results.value.push({
    id: q.value.id,
    category: q.value.category,
    type: q.value.type,
    q: q.value.q,
    options: q.value.options ? [...q.value.options] : null,
    answer: q.value.answer,
    explain: q.value.explain,
    chosen: value,
    correct
  })
}

function next() {
  if (!answered.value) return
  if (isLast.value) {
    emit('finish', results.value)
    return
  }
  index.value += 1
  chosen.value = null
  answered.value = false
}

function optionState(i) {
  if (!answered.value) return ''
  if (i === q.value.answer) return 'correct'
  if (i === chosen.value) return 'wrong'
  return 'dim'
}

function judgeState(v) {
  if (!answered.value) return ''
  if (v === q.value.answer) return 'correct'
  if (v === chosen.value) return 'wrong'
  return 'dim'
}

const feedback = computed(() => {
  if (!answered.value) return null
  return results.value[results.value.length - 1]
})

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
    <!-- 顶部进度 -->
    <div class="quiz-top card">
      <button class="quit" @click="emit('quit')">{{ tr('quit') }}</button>
      <div class="progress-wrap">
        <div class="progress-info">
          <span>{{ tr('progress', { i: index + 1, n: pool.length }) }}</span>
          <span class="score-chip">
            {{ tr('scoreChip', { n: correctCount }) }}<template v-if="streak >= 3"> · {{ tr('streak', { n: streak }) }}</template>
          </span>
        </div>
        <div class="progress">
          <div class="progress-bar" :style="{ width: `${((index + 1) / pool.length) * 100}%` }"></div>
        </div>
      </div>
    </div>

    <!-- 题目卡片 -->
    <div class="q-card card">
      <div class="q-head">
        <span class="tag-cat" :style="{ background: `${cat.color}1a`, color: cat.color }">{{ catText(cat, 'name') }}</span>
        <span class="tag-type" :class="isJudge ? 'judge' : 'choice'">{{ isJudge ? tr('judge') : tr('choice') }}</span>
      </div>

      <h2 class="q-text">{{ q.q }}</h2>

      <!-- 选择题选项 -->
      <div v-if="!isJudge" class="options">
        <button
          v-for="(opt, i) in q.options"
          :key="i"
          class="option"
          :class="optionState(i)"
          @click="choose(i)"
        >
          <span class="letter">{{ 'ABCD'[i] }}</span>
          <span class="opt-text">{{ opt }}</span>
          <span v-if="optionState(i) === 'correct'" class="mark">✓</span>
          <span v-else-if="optionState(i) === 'wrong'" class="mark">✗</span>
        </button>
      </div>

      <!-- 判断题选项 -->
      <div v-else class="judge-row">
        <button class="judge-btn" :class="judgeState(true)" @click="choose(true)">
          <span class="judge-icon">✓</span>{{ tr('judgeTrue') }}
        </button>
        <button class="judge-btn" :class="judgeState(false)" @click="choose(false)">
          <span class="judge-icon wrong-icon">✗</span>{{ tr('judgeFalse') }}
        </button>
      </div>

      <!-- 答题反馈 -->
      <Transition name="fade-slide">
        <div v-if="feedback" class="feedback" :class="feedback.correct ? 'ok' : 'no'">
          <div class="fb-title">
            <span>{{ feedback.correct ? tr('fbOk') : tr('fbNo') }}</span>
            <span v-if="!feedback.correct" class="fb-answer">{{ tr('fbCorrect') }}{{ answerText(feedback) }}　{{ tr('fbYours') }}{{ chosenText(feedback) }}</span>
          </div>
          <p class="fb-explain">{{ tr('explainPrefix') }}{{ feedback.explain }}</p>
          <button class="next-btn" @click="next">
            {{ isLast ? tr('finish') : tr('next') }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- 分类看板娘 -->
    <div class="mascot" v-if="cat.img">
      <img :src="cat.img" :alt="catText(cat, 'name')" :style="{ borderColor: cat.color }" />
      <span>{{ cat.short }}</span>
    </div>
  </div>
</template>

<style scoped>
.quiz-top {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
}

.quit {
  background: var(--soft);
  border: 1px solid var(--ys-line);
  color: var(--ys-text-2);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  transition: all 0.15s;
}

.quit:hover { color: var(--ys-red); border-color: var(--ys-red); }

.progress-wrap { flex: 1; }

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--ys-text-2);
  margin-bottom: 8px;
}

.progress-info b { color: var(--ys-blue); font-size: 15px; }

.score-chip { color: var(--ys-orange); font-weight: 600; }

.progress {
  height: 10px;
  background: var(--track);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 999px;
  background: var(--ys-blue-grad);
  transition: width 0.3s ease;
}

.q-card {
  margin-top: 16px;
  padding: 24px 26px;
  position: relative;
}

.q-head { display: flex; gap: 8px; }

.tag-cat,
.tag-type {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 600;
}

.tag-type.choice { background: rgba(255, 157, 66, 0.15); color: var(--ys-orange); }
.tag-type.judge { background: rgba(143, 111, 232, 0.15); color: #a68ae8; }

.q-text {
  margin: 16px 0 20px;
  font-size: 19px;
  line-height: 1.65;
}

.options { display: grid; gap: 12px; }

.option {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  background: var(--soft);
  border: 2px solid var(--ys-line);
  border-radius: 14px;
  padding: 13px 16px;
  font-size: 15px;
  color: var(--ys-text);
  transition: all 0.15s;
}

.option:hover:not(.correct):not(.wrong) {
  border-color: var(--ys-blue);
  background: var(--soft-2);
}

.letter {
  min-width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--soft-2);
  color: var(--ys-blue-deep);
  font-weight: 700;
  display: grid;
  place-items: center;
  font-size: 13px;
}

.option .mark { margin-left: auto; font-weight: 800; font-size: 16px; }

.option.correct {
  background: var(--ok-bg);
  border-color: var(--ok-line);
  color: var(--ok-text);
}

.option.correct .letter { background: var(--ys-green); color: #fff; }
.option.correct .mark { color: var(--ys-green); }

.option.wrong {
  background: var(--no-bg);
  border-color: var(--no-line);
  color: var(--no-text);
}

.option.wrong .letter { background: var(--ys-red); color: #fff; }
.option.wrong .mark { color: var(--ys-red); }

.option.dim { opacity: 0.55; }

.judge-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.judge-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  font-size: 19px;
  font-weight: 700;
  border-radius: 14px;
  border: 2px solid var(--ys-line);
  background: var(--soft);
  color: var(--ys-text);
  transition: all 0.15s;
}

.judge-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--ys-green);
  color: #fff;
  font-size: 16px;
  display: grid;
  place-items: center;
}

.judge-icon.wrong-icon { background: var(--ys-red); }

.judge-btn.correct { background: var(--ok-bg); border-color: var(--ok-line); color: var(--ok-text); }
.judge-btn.wrong { background: var(--no-bg); border-color: var(--no-line); color: var(--no-text); }
.judge-btn.dim { opacity: 0.55; }

.feedback {
  margin-top: 18px;
  border-radius: 14px;
  padding: 16px 18px;
}

.feedback.ok { background: var(--ok-bg); border: 1px solid var(--ok-line); }
.feedback.no { background: var(--no-bg); border: 1px solid var(--no-line); }

.fb-title {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  align-items: baseline;
  font-weight: 700;
  font-size: 15px;
}

.feedback.ok .fb-title { color: var(--ok-text); }
.feedback.no .fb-title { color: var(--no-text); }

.fb-answer { font-size: 12.5px; font-weight: 600; opacity: 0.85; }

.fb-explain {
  margin: 10px 0 14px;
  font-size: 13.5px;
  line-height: 1.85;
  color: var(--ys-text);
  opacity: 0.85;
}

.next-btn {
  display: block;
  margin-left: auto;
  border: none;
  border-radius: 999px;
  background: var(--ys-blue-grad);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  padding: 11px 26px;
  box-shadow: 0 4px 12px rgba(43, 163, 232, 0.35);
  transition: transform 0.15s;
}

.next-btn:hover { transform: translateY(-2px); }

.mascot {
  position: fixed;
  right: 18px;
  bottom: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 5;
  pointer-events: none;
}

.mascot img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid var(--ys-card);
  background: var(--ys-card);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.mascot span {
  font-size: 11px;
  color: var(--ys-text-2);
  background: var(--ys-card);
  border-radius: 999px;
  padding: 2px 8px;
  box-shadow: var(--shadow);
}

@media (max-width: 560px) {
  .mascot { display: none; }
  .q-card { padding: 18px; }
  .q-text { font-size: 17px; }
}
</style>
