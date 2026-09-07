<script setup>
import { computed, ref } from 'vue'
import YsIcon from './YsIcon.vue'
import { QUESTIONS } from '../data/questions.js'
import { useApp } from '../i18n/index.js'

const props = defineProps({
  categories: { type: Array, required: true },
  total: { type: Number, required: true }
})
const emit = defineEmits(['start'])

const { tr, catText } = useApp()

const selected = ref(props.categories.map((c) => c.id))
const count = ref(10)

const availableCount = computed(() => {
  const ids = selected.value.length ? selected.value : props.categories.map((c) => c.id)
  return QUESTIONS.filter((q) => ids.includes(q.category)).length
})

const countOptions = computed(() => [10, 15, 20, 30, availableCount.value])

function toggle(id) {
  const i = selected.value.indexOf(id)
  if (i >= 0) selected.value.splice(i, 1)
  else selected.value.push(id)
  if (count.value > availableCount.value) count.value = Math.min(10, availableCount.value)
}

function start() {
  if (!availableCount.value) return
  emit('start', { categories: selected.value, count: count.value })
}

function countOf(id) {
  return QUESTIONS.filter((q) => q.category === id).length
}

function countLabel(n) {
  return n === availableCount.value ? `${tr('all')} ${n}` : tr('qCount', { n })
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="hero card">
      <div class="hero-text">
        <span class="hero-tag">{{ tr('heroTag') }}</span>
        <h2 class="pre-line">{{ tr('heroTitle') }}</h2>
        <p class="pre-line">{{ tr('heroDesc', { n: total }) }}</p>
      </div>
      <div class="hero-chars">
        <img class="ch ch1" src="/img/paimon.jpg" alt="Paimon" />
        <img class="ch ch2" src="/img/march7th.png" alt="March 7th" />
        <img class="ch ch3" src="/img/anby.png" alt="Anby" />
      </div>
    </section>

    <!-- 分类选择 -->
    <section class="section">
      <div class="section-head">
        <h3>{{ tr('sectionRange') }}</h3>
        <span>{{ tr('selected', { n: selected.length || props.categories.length }) }}</span>
      </div>
      <div class="cat-grid">
        <button
          v-for="c in categories"
          :key="c.id"
          class="cat card"
          :class="{ active: selected.includes(c.id) }"
          :style="selected.includes(c.id) ? { borderColor: c.color, boxShadow: `0 6px 20px ${c.color}33` } : {}"
          @click="toggle(c.id)"
        >
          <div class="cat-img" :style="c.img ? {} : { background: 'transparent', overflow: 'visible' }">
            <YsIcon v-if="c.icon" :size="70" />
            <img v-else-if="c.img" :src="c.img" :alt="catText(c, 'name')" />
          </div>
          <div class="cat-name">{{ catText(c, 'name') }}</div>
          <div class="cat-desc">{{ catText(c, 'desc') }}</div>
          <div class="cat-count" :style="{ color: c.color }">{{ tr('qCount', { n: countOf(c.id) }) }}</div>
          <div class="cat-check" :class="{ on: selected.includes(c.id) }">✓</div>
        </button>
      </div>
    </section>

    <!-- 题量 -->
    <section class="section">
      <div class="section-head">
        <h3>{{ tr('sectionCount') }}</h3>
        <span>{{ tr('rangeTotal', { n: availableCount }) }}</span>
      </div>
      <div class="count-row">
        <button
          v-for="n in countOptions"
          :key="n"
          class="count-btn"
          :class="{ active: count === n }"
          @click="count = n"
        >
          {{ countLabel(n) }}
        </button>
      </div>
    </section>

    <button class="start-btn" :disabled="!availableCount" @click="start">
      {{ availableCount ? tr('start') : tr('startDisabled') }}
    </button>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 26px 26px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--hero-grad);
}

.hero-tag {
  display: inline-block;
  background: var(--ys-blue-grad);
  color: #fff;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.hero-text h2 {
  margin: 0 0 10px;
  font-size: 26px;
  line-height: 1.35;
}

.hero-text p {
  margin: 0;
  color: var(--ys-text-2);
  font-size: 13px;
  line-height: 1.9;
}

.pre-line { white-space: pre-line; }

.hero-chars {
  position: relative;
  width: 240px;
  min-width: 200px;
  height: 190px;
}

.ch {
  position: absolute;
  bottom: -12px;
  height: 170px;
  object-fit: contain;
  filter: drop-shadow(0 8px 14px rgba(43, 118, 187, 0.25));
}

.ch1 { left: -6px; height: 150px; transform: rotate(-6deg); border-radius: 14px; background: var(--ys-card); }
.ch2 { left: 74px; height: 175px; z-index: 2; }
.ch3 { left: 156px; height: 160px; transform: rotate(7deg); }

.section { margin-top: 24px; }

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h3 {
  margin: 0;
  font-size: 17px;
}

.section-head span {
  color: var(--ys-text-2);
  font-size: 12px;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.cat {
  position: relative;
  border: 2px solid transparent;
  padding: 14px 12px 12px;
  text-align: center;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.cat:hover { transform: translateY(-3px); }

.cat-img {
  width: 84px;
  height: 84px;
  margin: 0 auto 10px;
  border-radius: 18px;
  background: var(--soft);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.cat-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cat-name { font-weight: 700; font-size: 14px; }
.cat-desc { color: var(--ys-text-2); font-size: 11px; margin-top: 4px; }
.cat-count { font-size: 12px; font-weight: 700; margin-top: 6px; }

.cat-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--ys-line);
  color: transparent;
  font-size: 13px;
  line-height: 18px;
  transition: all 0.15s;
}

.cat-check.on {
  background: var(--ys-blue);
  border-color: var(--ys-blue);
  color: #fff;
}

.count-row { display: flex; gap: 10px; flex-wrap: wrap; }

.count-btn {
  background: var(--ys-card);
  border: 2px solid var(--ys-line);
  color: var(--ys-text);
  border-radius: 999px;
  padding: 9px 22px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s;
}

.count-btn.active {
  background: var(--ys-blue-grad);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 14px rgba(43, 163, 232, 0.4);
}

.start-btn {
  display: block;
  width: 100%;
  margin-top: 28px;
  padding: 15px;
  border: none;
  border-radius: 999px;
  background: var(--ys-blue-grad);
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 6px;
  box-shadow: 0 8px 22px rgba(43, 163, 232, 0.4);
  transition: transform 0.15s, opacity 0.15s;
}

.start-btn:hover:not(:disabled) { transform: translateY(-2px); }
.start-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 680px) {
  .hero-chars { display: none; }
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
