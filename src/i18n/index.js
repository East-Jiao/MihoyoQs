// ===== i18n 核心：语言/主题状态、文案翻译、题目翻译与乱序 =====
import { ref } from 'vue'
import { UI, CAT_I18N } from './ui.js'
import { Q_EN } from './q.en.js'
import { Q_JA } from './q.ja.js'

export const LANGS = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' }
]

const BANKS = { en: Q_EN, ja: Q_JA }
const LANG_IDS = LANGS.map((l) => l.id)

function initialLang() {
  const saved = localStorage.getItem('mq-lang')
  return LANG_IDS.includes(saved) ? saved : 'zh'
}

function initialTheme() {
  const saved = localStorage.getItem('mq-theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const lang = ref(initialLang())
const theme = ref(initialTheme())

function applyTheme() {
  document.documentElement.dataset.theme = theme.value
  localStorage.setItem('mq-theme', theme.value)
}
applyTheme()
document.documentElement.lang = lang.value === 'zh' ? 'zh-CN' : lang.value

// 文案翻译：tr('progress', { i: 1, n: 10 })，支持 {x} 占位符
function tr(key, vars) {
  let s = (UI[lang.value] && UI[lang.value][key]) ?? UI.zh[key] ?? key
  if (typeof s !== 'string') return s
  if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k])
  return s
}

// 分类名称/描述翻译
function catText(cat, field) {
  const c = CAT_I18N[lang.value] && CAT_I18N[lang.value][cat.id]
  return (c && c[field]) || cat[field]
}

// 题目翻译：按 id 查银行；选择题的翻译以"正确答案文本 c"反查下标，避免语序错位
function translateQ(q, langId) {
  if (langId === 'zh') return q
  const bank = BANKS[langId]
  const o = bank && bank[q.id]
  if (!o) return q
  if (q.type === 'judge') {
    return { ...q, q: o.q, explain: o.e, answer: typeof o.a === 'boolean' ? o.a : q.answer }
  }
  const options = Array.isArray(o.o) && o.o.length === 4 ? [...o.o] : [...q.options]
  let answer = q.answer
  if (o.c !== undefined) {
    const at = options.indexOf(o.c)
    if (at >= 0) answer = at
  }
  return { ...q, q: o.q, options, answer, explain: o.e }
}

// 展示题：翻译后对选择题做一次选项乱序（按 id+语言缓存，保证同一语言下选项顺序稳定）
const orderCache = new Map()
function displayQuestion(q, langId) {
  const key = `${q.id}|${langId}`
  const cached = orderCache.get(key)
  if (cached) return cached
  const t = translateQ(q, langId)
  let d = t
  if (t.type === 'choice') {
    const idx = t.options.map((_, i) => i)
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    d = { ...t, options: idx.map((i) => t.options[i]), answer: idx.indexOf(t.answer) }
  }
  orderCache.set(key, d)
  return d
}

function setLang(id) {
  if (!LANG_IDS.includes(id)) return
  lang.value = id
  localStorage.setItem('mq-lang', id)
  document.documentElement.lang = id === 'zh' ? 'zh-CN' : id
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme()
}

export function useApp() {
  return { lang, theme, tr, catText, displayQuestion, setLang, toggleTheme, LANGS }
}
