<script setup>
import { ref } from 'vue'
import StartScreen from './components/StartScreen.vue'
import QuizScreen from './components/QuizScreen.vue'
import ResultScreen from './components/ResultScreen.vue'
import YsIcon from './components/YsIcon.vue'
import { useApp } from './i18n/index.js'
import { QUESTIONS, CATEGORIES } from './data/questions.js'

const { lang, theme, tr, setLang, toggleTheme, LANGS } = useApp()

const screen = ref('start') // start | quiz | result
const pool = ref([])
const results = ref([])

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function handleStart({ categories, count }) {
  const selected = categories.length ? categories : CATEGORIES.map((c) => c.id)
  const filtered = QUESTIONS.filter((q) => selected.includes(q.category))
  pool.value = shuffle(filtered).slice(0, Math.min(count, filtered.length))
  results.value = []
  screen.value = 'quiz'
}

function handleFinish(list) {
  results.value = list
  screen.value = 'result'
}

function handleHome() {
  screen.value = 'start'
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <div class="topbar-inner">
        <YsIcon :size="42" />
        <div class="brand">
          <h1>{{ tr('brand') }}</h1>
          <p>{{ tr('subtitle') }}</p>
        </div>
        <div class="topbar-controls">
          <button class="icon-btn" :title="tr('themeToggle')" :aria-label="tr('themeToggle')" @click="toggleTheme">
            {{ theme === 'dark' ? '☀️' : '🌙' }}
          </button>
          <select class="lang-select" :value="lang" :aria-label="tr('langLabel')" @change="setLang($event.target.value)">
            <option v-for="l in LANGS" :key="l.id" :value="l.id">{{ l.label }}</option>
          </select>
          <div class="topbar-chip">{{ tr('chip') }}</div>
        </div>
      </div>
    </header>

    <main class="main">
      <StartScreen v-if="screen === 'start'" :categories="CATEGORIES" :total="QUESTIONS.length" @start="handleStart" />
      <QuizScreen v-else-if="screen === 'quiz'" :pool="pool" :categories="CATEGORIES" @finish="handleFinish" @quit="handleHome" />
      <ResultScreen v-else :results="results" :categories="CATEGORIES" @restart="handleStart({ categories: pool.map(q => q.category).filter((v, i, a) => a.indexOf(v) === i), count: pool.length })" @home="handleHome" />
    </main>

    <footer class="footer">
      {{ tr('footer1') }}<br />
      {{ tr('footer2') }}
    </footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  background: var(--ys-blue-grad);
  box-shadow: 0 2px 12px rgba(30, 127, 214, 0.25);
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand h1 {
  margin: 0;
  color: #fff;
  font-size: 19px;
  letter-spacing: 1px;
}

.brand p {
  margin: 2px 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  letter-spacing: 0.5px;
}

.topbar-controls {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.16);
  font-size: 16px;
  display: grid;
  place-items: center;
  transition: transform 0.15s;
}

.icon-btn:hover { transform: scale(1.1); }

.lang-select {
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
}

.lang-select option { color: var(--ys-text); }

.topbar-chip {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: #fff;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 999px;
}

.main {
  flex: 1;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 22px 16px 30px;
}

.footer {
  text-align: center;
  color: var(--ys-text-2);
  font-size: 12px;
  line-height: 1.8;
  padding: 18px 16px 26px;
}

@media (max-width: 560px) {
  .topbar-chip { display: none; }
  .brand p { display: none; }
}
</style>
