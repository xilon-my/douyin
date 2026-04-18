<template>
  <div class="active-training-overlay" v-if="modelValue" :class="{ 'is-minimized': minimized }">
    <div class="training-container" :class="{ 'slide-up': isAnimating }">
      <!-- Header Area -->
      <div class="header-area">
        <div class="top-row">
          <div class="timer-shell">
            <span class="main-timer">{{ formattedTime }}</span>
            <div class="mascot-chip">
              <img :src="coachMascot" alt="训练哈肌咪" class="mascot-avatar" />
              <div class="mascot-copy">
                <span>{{ motivationState.title }}</span>
                <small>{{ motivationState.message }}</small>
              </div>
            </div>
          </div>
        </div>

        <div class="title-row">
          <div class="title-input">
            <Icon icon="mdi:pencil-outline" />
            <input type="text" placeholder="点击输入训练标题" v-model="workoutTitle" />
          </div>
          <div class="progress-summary">
            <div class="summary-label">哈肌咪能量条</div>
            <div>🔥 已消耗 {{ burnedCalories }} 大卡</div>
          </div>
        </div>
      </div>

      <div class="scrollable-content">
        <!-- Empty State When No Plan Selected -->
        <div class="empty-plan-state" v-if="exercises.length === 0">
          <img :src="waitingMascot" alt="训练哈肌咪" class="empty-cat" />
          <h3>当前没有正在进行的训练</h3>
          <p>哈肌咪教练正在等你开练，请从历史计划中挑一份开始，或先生成新的训练计划。</p>
          <div class="empty-action-btn" @click="showHistory = true">
            <Icon icon="mdi:history" />
            <span>打开历史计划</span>
          </div>
        </div>

        <div class="exercise-list" v-else>
          <div
            class="exercise-item"
            v-for="(ex, index) in exercises"
            :key="index"
            :class="{ 'is-expanded': currentExerciseIndex === index }"
            @click="toggleExercise(index)"
          >
            <!-- Collapsed / Header View -->
            <div class="ex-header-row">
              <div class="thumb-container">
                <!-- Always show the GIF, but adjust its style based on expanded state via CSS -->
                <img class="thumb video" :src="getActionGifSrc(ex.key)" alt="action gif" />
              </div>

              <div class="ex-info">
                <div class="ex-title-row">
                  <span class="ex-name">{{ ex.name }}</span>
                  <div class="right-info">
                    <span class="ex-progress">0.0/1480.0</span>
                    <Icon
                      icon="mdi:play-circle"
                      class="play-segment-btn"
                      @click.stop="playVideoSegment(ex)"
                    />
                  </div>
                </div>
                <div class="ex-subtext" v-if="currentExerciseIndex !== index">
                  {{ ex.sets.length }}组
                </div>
                <div class="pager-dots" v-if="currentExerciseIndex !== index">
                  <span
                    class="dot"
                    v-for="n in ex.sets.length"
                    :key="n"
                    :class="{ active: n <= getCompletedSets(index) }"
                  ></span>
                </div>
              </div>
            </div>

            <!-- Expanded Details View -->
            <div class="ex-expanded-details" v-if="currentExerciseIndex === index" @click.stop>
              <div class="note-input">
                <input type="text" placeholder="点击输入备注" />
              </div>

              <div class="sets-list">
                <div
                  class="set-row"
                  v-for="(set, sIndex) in ex.sets"
                  :key="sIndex"
                  :class="{ 'is-completed': set.completed, 'is-active': sIndex === activeSetIndex }"
                >
                  <div
                    class="set-index"
                    :class="{ 'is-warmup': set.num === '1降' || set.num === '热' }"
                  >
                    {{ set.num === '1降' || set.num === '热' ? '热' : set.num }}
                  </div>

                  <div class="input-group">
                    <span class="label">kg</span>
                    <input
                      type="number"
                      v-model="set.weight"
                      class="val-input"
                      :disabled="set.completed"
                    />
                  </div>

                  <div class="input-group">
                    <span class="label">次</span>
                    <input
                      type="number"
                      v-model="set.reps"
                      class="val-input"
                      :disabled="set.completed"
                    />
                  </div>

                  <div class="check-btn" @click="completeSet(sIndex)">
                    <Icon icon="mdi:check" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="bottom-nav">
        <div class="nav-item" @click="showHistory = true">
          <Icon icon="mdi:history" class="nav-icon" />
          <span>历史计划</span>
        </div>
        <div class="nav-item center-action" @click="showCalendar = true">
          <div class="history-btn">
            <Icon icon="mdi:calendar-month-outline" />
          </div>
          <span>训练日历</span>
        </div>
        <div class="nav-item" @click="showProfile = true">
          <Icon icon="mdi:account" class="nav-icon" />
          <span>我</span>
        </div>
        <div class="nav-item" @click="requestCloseTraining">
          <Icon icon="mdi:view-grid" class="nav-icon" />
          <span>结束</span>
        </div>
      </div>

      <!-- Rest Timer Modal (Inner) -->
      <div class="rest-timer-modal" v-if="isResting">
        <div class="rest-content">
          <img :src="planMascot" alt="训练哈肌咪" class="rest-cat" />
          <div class="rest-title">组间休息</div>
          <div class="countdown">{{ restTimeLeft }}s</div>
          <div class="hint">哈肌咪教练帮你盯着时间，休息结束会提醒你继续发力。</div>

          <div class="rest-actions">
            <div class="btn-outline" @click="skipRest">跳过休息</div>
            <div class="btn-primary" @click="minimizeToFloat">去刷视频</div>
          </div>
        </div>
      </div>

      <!-- History Plans Drawer (Inner) -->
      <div class="history-drawer-overlay" v-if="showHistory" @click="showHistory = false">
        <div class="history-drawer" :class="{ 'slide-up': showHistory }" @click.stop>
          <div class="drawer-header">
            <span class="drawer-title">历史转换计划</span>
            <Icon icon="mdi:close" class="close-icon" @click="showHistory = false" />
          </div>

          <div class="drawer-categories">
            <div
              class="category-item"
              :class="{ active: activeCategory === cat }"
              v-for="cat in categories"
              :key="cat"
              @click="activeCategory = cat"
            >
              {{ cat }}
            </div>
          </div>

          <div class="drawer-list">
            <div class="history-card" v-for="(plan, index) in filteredHistoryPlans" :key="index">
              <div class="card-left">
                <img :src="plan.cover" alt="plan cover" class="plan-cover" />
                <div class="plan-info">
                  <div class="plan-title">{{ plan.title }}</div>
                  <div class="plan-meta">
                    {{ plan.date }} · {{ plan.author }} · {{ plan.exercises?.length || 0 }}个动作
                  </div>
                </div>
              </div>
              <div class="card-right">
                <div class="use-btn" @click="startHistoryPlan(plan)">开始训练</div>
              </div>
            </div>

            <div class="empty-state" v-if="filteredHistoryPlans.length === 0">
              <Icon icon="mdi:inbox-remove-outline" />
              <p>暂无该部位的历史转换计划</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Segment Player Modal (Move outside history drawer) -->
      <div class="video-modal-overlay" v-if="showVideoModal" @click="closeVideoModal">
        <div class="video-modal-content" @click.stop>
          <div class="modal-header">
            <span>{{ activeSegmentTitle }}演示</span>
            <Icon icon="mdi:close" class="close-btn" @click="closeVideoModal" />
          </div>
          <div class="video-wrapper">
            <video
              ref="segmentVideoEl"
              class="segment-video"
              :src="currentSegmentVideoSrc"
              controls
              playsinline
              @loadedmetadata="handleSegmentVideoLoaded"
              @timeupdate="handleVideoTimeUpdate"
              @seeking="handleSegmentVideoSeeking"
            ></video>
          </div>
          <div class="segment-hint">
            视频将在 {{ activeSegment.start }}s - {{ activeSegment.end }}s 之间循环播放
          </div>
        </div>
      </div>

      <!-- Calendar Drawer -->
      <div class="history-drawer-overlay" v-if="showCalendar" @click="showCalendar = false">
        <div
          class="history-drawer calendar-drawer"
          :class="{ 'slide-up': showCalendar }"
          @click.stop
        >
          <div class="drawer-header">
            <span class="drawer-title">训练日历</span>
            <Icon icon="mdi:close" class="close-icon" @click="showCalendar = false" />
          </div>
          <div class="calendar-content">
            <!-- Simple Mock Calendar Header -->
            <div class="cal-month-header">
              <Icon icon="mdi:chevron-left" class="nav-btn" />
              <span>2026年4月</span>
              <Icon icon="mdi:chevron-right" class="nav-btn" />
            </div>

            <div class="cal-weekdays">
              <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span
              ><span>五</span><span>六</span>
            </div>

            <div class="cal-days">
              <!-- Empty slots for days before 1st -->
              <div class="cal-day empty"></div>
              <div class="cal-day empty"></div>
              <div class="cal-day empty"></div>

              <!-- Mock Days -->
              <div
                v-for="day in 30"
                :key="day"
                class="cal-day"
                :class="{
                  'has-training': hasTrainingOnDay(day),
                  active: selectedDay === day
                }"
                @click="selectedDay = day"
              >
                {{ day }}
                <div class="indicator" v-if="hasTrainingOnDay(day)"></div>
              </div>
            </div>

            <!-- Training Records for Selected Day -->
            <div class="selected-day-records" v-if="selectedDayRecords.length > 0">
              <h3 class="record-title">4月{{ selectedDay }}日 训练记录</h3>
              <div class="record-item" v-for="(record, idx) in selectedDayRecords" :key="idx">
                <div class="r-icon"><Icon icon="mdi:dumbbell" /></div>
                <div class="r-info">
                  <div class="r-name">{{ record.title }}</div>
                  <div class="r-meta">
                    {{ Math.floor(record.duration / 60) }}分钟 · 完成
                    {{ record.completedExercises || 0 }}/{{ record.totalExercises || 0 }} 个动作 ·
                    消耗 {{ record.calories }} 大卡
                  </div>
                </div>
              </div>
            </div>
            <div class="empty-state" v-else-if="selectedDay">
              <Icon icon="mdi:sleep" />
              <p>这天你在休息，没有训练记录哦</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Drawer -->
      <div class="history-drawer-overlay" v-if="showProfile" @click="showProfile = false">
        <div class="history-drawer profile-drawer" :class="{ 'slide-up': showProfile }" @click.stop>
          <div class="drawer-header">
            <span class="drawer-title">个人身体数据</span>
            <Icon icon="mdi:close" class="close-icon" @click="showProfile = false" />
          </div>
          <div class="profile-content">
            <div class="form-group">
              <label>性别</label>
              <div class="radio-group">
                <div
                  class="radio-btn"
                  :class="{ active: localProfile.gender === 1 }"
                  @click="localProfile.gender = 1"
                >
                  男
                </div>
                <div
                  class="radio-btn"
                  :class="{ active: localProfile.gender === 2 }"
                  @click="localProfile.gender = 2"
                >
                  女
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>身高 (cm)</label>
              <input type="number" v-model="localProfile.height" placeholder="例如: 175" />
            </div>
            <div class="form-group">
              <label>体重 (kg)</label>
              <input type="number" v-model="localProfile.weight" placeholder="例如: 70" />
            </div>
            <div class="form-group">
              <label>年龄 (岁)</label>
              <input type="number" v-model="localProfile.age" placeholder="例如: 25" />
            </div>
            <div class="form-group">
              <label>周目标消耗 (千卡)</label>
              <div class="select-wrapper">
                <select v-model="localProfile.targetCalories" class="target-select">
                  <option :value="1000">1000 - 1500</option>
                  <option :value="1500">1500 - 2000</option>
                  <option :value="2000">2000 - 2500</option>
                  <option :value="2500">2500 - 3000</option>
                  <option :value="3000">3000 - 3500</option>
                  <option :value="3500">3500以上</option>
                </select>
                <Icon icon="mdi:chevron-down" class="select-icon" />
              </div>
            </div>

            <div class="metaphor-card">
              <div class="m-icon">🎯</div>
              <div class="m-text">
                <div class="m-title">相当于</div>
                <div class="m-desc">{{ targetCalorieMetaphor }}</div>
              </div>
            </div>

            <div class="save-profile-btn" @click="saveProfile">保存信息</div>
          </div>
        </div>
      </div>

      <!-- End Training Confirm -->
      <div
        class="history-drawer-overlay confirm-overlay"
        v-if="showEndConfirm"
        @click="showEndConfirm = false"
      >
        <div class="confirm-card" @click.stop>
          <div class="confirm-title">确认结束本次训练？</div>
          <div class="confirm-desc">
            已完成 {{ completedExercisesCount }}/{{ totalExercisesCount }} 个动作，训练
            {{ Math.floor(elapsedTime / 60) }} 分钟，消耗 {{ burnedCalories }} 大卡。
          </div>
          <div class="confirm-actions">
            <div class="confirm-btn secondary" @click="showEndConfirm = false">继续训练</div>
            <div class="confirm-btn primary" @click="confirmCloseTraining">确认结束</div>
          </div>
        </div>
      </div>

      <!-- Completion Share -->
      <div
        class="history-drawer-overlay poster-overlay"
        v-if="showCompletionPoster"
        @click="closeCompletionPoster"
      >
        <div class="poster-card" @click.stop>
          <div class="poster-header">
            <span>分享给好友</span>
            <Icon icon="mdi:close" class="close-icon" @click="closeCompletionPoster" />
          </div>
          <div class="share-content" v-if="pendingCompletionRecord">
            <div class="share-summary-card">
              <div class="share-summary-head">
                <div>
                  <div class="share-title">{{ pendingCompletionRecord.title }}</div>
                  <div class="share-meta">
                    <span>{{ formatDurationText(pendingCompletionRecord.duration) }}</span>
                    <span>消耗 {{ pendingCompletionRecord.calories }} 大卡</span>
                  </div>
                  <div class="share-encouragement" v-if="pendingCompletionRecord.encouragement">
                    <strong>{{ pendingCompletionRecord.encouragement.title }}</strong>
                    <span>{{ pendingCompletionRecord.encouragement.message }}</span>
                  </div>
                </div>
                <img :src="activeMascot" alt="训练哈肌咪" class="share-summary-mascot" />
              </div>
              <div class="share-progress-list">
                <div
                  class="share-progress-item"
                  v-for="item in pendingCompletionRecord.exerciseProgressList"
                  :key="item.name"
                >
                  <span class="progress-name">{{ item.name }}</span>
                  <span class="progress-value"
                    >{{ item.completedSets }}/{{ item.totalSets }} 组</span
                  >
                </div>
              </div>
            </div>
            <div class="friend-share-row">
              <div
                class="friend-share-item"
                v-for="friend in shareFriends"
                :key="friend.name"
                @click="shareToFriend(friend)"
              >
                <div
                  class="friend-avatar"
                  :class="{ selected: selectedShareFriends.includes(friend.name) }"
                  :style="{ background: friend.color }"
                >
                  {{ friend.short }}
                  <div class="selected-badge" v-if="selectedShareFriends.includes(friend.name)">
                    <Icon icon="mdi:check" />
                  </div>
                </div>
                <div class="friend-name">{{ friend.name }}</div>
              </div>
            </div>
          </div>
          <div class="poster-actions">
            <div class="poster-btn secondary" @click="closeCompletionPoster">完成</div>
            <div class="poster-btn primary" @click="handleShareAction('forward')">转发</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onUnmounted, onMounted, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { _notice } from '@/utils'
import bus from '@/utils/bus'
import { useBaseStore } from '@/store/pinia'
import hajimiCats from '@/cats'

const store = useBaseStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  minimized: {
    type: Boolean,
    default: false
  },
  trainingPlan: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits([
  'update:modelValue',
  'minimize',
  'rest-tick',
  'rest-finished',
  'clear-training-plan'
])

const isAnimating = ref(false)
const elapsedTime = ref(0)
let workoutTimer: any = null
const workoutTitle = ref('')

const isResting = ref(false)
const restTimeLeft = ref(60)
let restTimer: any = null

const showHistory = ref(false)
const showProfile = ref(false)
const showCalendar = ref(false)
const showEndConfirm = ref(false)
const showCompletionPoster = ref(false)
const selectedDay = ref(new Date().getDate())
const pendingCompletionRecord = ref<any | null>(null)
const selectedShareFriends = ref<string[]>([])
const motivationState = reactive({
  title: '哈肌咪督练中',
  message: '慢一点，也是在变强'
})
const coachMascot = hajimiCats.flex
const waitingMascot = hajimiCats.rest
const planMascot = hajimiCats.stretch
const activeMascot = hajimiCats.jump
const actionGifBase = `${import.meta.env.BASE_URL}action/`
const shareFriends = [
  { name: '何以为家', short: '何', color: 'linear-gradient(135deg, #93c5fd, #c4b5fd)' },
  { name: '浅唱', short: '浅', color: 'linear-gradient(135deg, #bbf7d0, #86efac)' },
  { name: '心之所向', short: '心', color: 'linear-gradient(135deg, #93c5fd, #60a5fa)' },
  { name: '一路向前', short: '前', color: 'linear-gradient(135deg, #fdba74, #fb7185)' },
  { name: '好久不见', short: '好', color: 'linear-gradient(135deg, #d8b4fe, #f0abfc)' }
]

function getActionGifSrc(actionKey?: string) {
  return `${actionGifBase}${actionKey || 'dumbbell_curl'}.gif`
}

// Check if there are records for a given day in this month (mock implementation uses current month)
function hasTrainingOnDay(day: number) {
  const dayStr = String(day).padStart(2, '0')
  // We'll mock that the record date matches the current month
  return store.trainingHistory.some((r) => r.date.endsWith(`-${dayStr}`))
}

const selectedDayRecords = computed(() => {
  const dayStr = String(selectedDay.value).padStart(2, '0')
  return store.trainingHistory.filter((r) => r.date.endsWith(`-${dayStr}`))
})

const categories = ['全部', '胸', '肩', '背', '腿', '二头', '三头', '腹肌']
const activeCategory = ref('全部')

// --- Profile & Calorie State ---
const localProfile = reactive({
  gender: store.fitnessProfile.gender,
  height: store.fitnessProfile.height,
  weight: store.fitnessProfile.weight,
  age: store.fitnessProfile.age,
  targetCalories: store.fitnessProfile.targetCalories
})

const targetCalorieMetaphor = computed(() => {
  const cal = localProfile.targetCalories || 0
  const dailyCal = cal / 7 // 平均每天的消耗量

  const metaphors = [
    `每天绕操场走 ${Math.max(1, Math.round(dailyCal / 40))} 圈`,
    `每天少吃 ${Math.max(1, Number((dailyCal / 116).toFixed(1)))} 碗米饭`,
    `每天少喝 ${Math.max(1, Math.round(dailyCal / 140))} 杯奶茶`,
    `每天慢跑 ${Math.max(1, Math.round(dailyCal / 10))} 分钟`
  ]
  // 用卡路里数做一点随机感
  const index = cal % metaphors.length
  return metaphors[index]
})

// Current burned calories based on time, weight, and a MET value (approx 6.0 for weight lifting)
const burnedCalories = computed(() => {
  const weight = store.fitnessProfile.weight || 65 // default 65kg
  const minutes = elapsedTime.value / 60
  // Calories = MET * weight (kg) * time (hours)
  // For minutes: (MET * weight * minutes) / 60
  const MET = 6.0
  return Math.floor((MET * weight * minutes) / 60)
})

function saveProfile() {
  store.setFitnessProfile({
    gender: localProfile.gender,
    height: localProfile.height,
    weight: localProfile.weight,
    age: localProfile.age,
    targetCalories: localProfile.targetCalories
  })
  _notice('个人信息已保存')
  showProfile.value = false
}
// --------------------------------

// Dynamic history data
const filteredHistoryPlans = computed(() => {
  if (activeCategory.value === '全部') return store.savedPlans
  return store.savedPlans.filter((plan) => plan.category === activeCategory.value)
})

const DEFAULT_ACTION_SEGMENTS = [
  { start: 5, end: 19 },
  { start: 19, end: 28 },
  { start: 28, end: 41 },
  { start: 41, end: 51 }
]

function normalizeTrainingPlan(plan: any) {
  if (!plan || !plan.title || !Array.isArray(plan.exercises)) return null

  return {
    ...plan,
    exercises: plan.exercises.map((exercise: any, exerciseIndex: number) => ({
      ...exercise,
      name: exercise.name || `动作 ${exerciseIndex + 1}`,
      key: exercise.key || 'dumbbell_curl',
      segment: DEFAULT_ACTION_SEGMENTS[exerciseIndex] || exercise.segment || null,
      sets: Array.isArray(exercise.sets)
        ? exercise.sets.map((set: any, setIndex: number) => ({
            num: set?.num ?? setIndex + 1,
            weight: Number(set?.weight ?? 0),
            reps: Number(set?.reps ?? 0)
          }))
        : []
    }))
  }
}

function startHistoryPlan(plan: any) {
  const normalizedPlan = normalizeTrainingPlan(plan)

  if (!normalizedPlan) {
    _notice('该计划数据不完整，暂时无法开始训练')
    return
  }

  showHistory.value = false
  _notice(`已切换至: ${normalizedPlan.title}`)

  emit('update:modelValue', true)

  initTraining(normalizedPlan)
  startWorkoutTimer()
  bus.emit('START_TRAINING_FROM_HISTORY', normalizedPlan)
}

// Video Segment Player State
const showVideoModal = ref(false)
const activeSegment = ref({ start: 0, end: 0 })
const activeSegmentTitle = ref('')
const segmentVideoEl = ref<HTMLVideoElement | null>(null)
const currentTrainingVideoSrc = ref('')
const currentSegmentVideoSrc = ref('')

function playVideoSegment(ex: any) {
  const videoSrc = currentTrainingVideoSrc.value || props.trainingPlan?.videoSrc

  if (!ex.segment) {
    _notice('该动作没有关联的视频片段')
    return
  }

  if (!videoSrc) {
    _notice('当前训练没有可播放的视频')
    return
  }

  activeSegment.value = { ...ex.segment }
  activeSegmentTitle.value = ex.name
  currentSegmentVideoSrc.value = videoSrc
  showVideoModal.value = true
}

function handleSegmentVideoLoaded() {
  const video = segmentVideoEl.value

  if (!video) return

  video.currentTime = activeSegment.value.start
  video.play().catch((e) => console.log('Auto-play prevented:', e))
}

function handleSegmentVideoSeeking() {
  const video = segmentVideoEl.value

  if (!video) return

  if (
    video.currentTime < activeSegment.value.start ||
    video.currentTime > activeSegment.value.end
  ) {
    video.currentTime = activeSegment.value.start
  }
}

function handleVideoTimeUpdate() {
  const video = segmentVideoEl.value

  if (!video) return

  if (video.currentTime < activeSegment.value.start) {
    video.currentTime = activeSegment.value.start
    return
  }

  if (video.currentTime >= activeSegment.value.end) {
    video.currentTime = activeSegment.value.start
    if (video.paused) {
      video.play().catch((e) => console.log('Auto-play prevented:', e))
    }
  }
}

function closeVideoModal() {
  if (segmentVideoEl.value) {
    segmentVideoEl.value.pause()
  }
  currentSegmentVideoSrc.value = ''
  showVideoModal.value = false
}

// Workout State Management
const currentExerciseIndex = ref<number | null>(0)
const activeSetIndex = ref(0)
const exercises = ref<any[]>([])

const currentExercise = computed(() => {
  if (exercises.value.length === 0 || currentExerciseIndex.value === null) return null
  return exercises.value[currentExerciseIndex.value]
})

const totalExercisesCount = computed(() => exercises.value.length)

const completedExercisesCount = computed(() => {
  return exercises.value.filter((exercise: any) => {
    return (
      Array.isArray(exercise.sets) &&
      exercise.sets.length > 0 &&
      exercise.sets.every((set: any) => set.completed)
    )
  }).length
})

function pickRandomMessage(messages: string[]) {
  return messages[Math.floor(Math.random() * messages.length)]
}

function setMotivation(
  scene: 'default' | 'setComplete' | 'restored' | 'finished',
  payload: any = {}
) {
  if (scene === 'default') {
    motivationState.title = '哈肌咪督练中'
    motivationState.message = '慢一点，也是在变强'
    return
  }

  if (scene === 'setComplete') {
    const messages = [
      `${payload.exerciseName} 已完成 ${payload.completedSets}/${payload.totalSets} 组，节奏很稳。`,
      `这一组拿下了，${payload.exerciseName} 继续推进就会更顺。`,
      `哈肌咪教练看到了，你在 ${payload.exerciseName} 上已经越练越稳了。`
    ]
    motivationState.title = '这组完成得漂亮'
    motivationState.message = pickRandomMessage(messages)
    return
  }

  if (scene === 'restored') {
    const messages = [
      '欢迎回来，状态还热着，现在接上训练最合适。',
      '刷完视频也没掉线，哈肌咪教练陪你把节奏接回来。',
      '回来得刚刚好，趁身体还热继续推进下一组。'
    ]
    motivationState.title = '欢迎回到训练'
    motivationState.message = pickRandomMessage(messages)
    return
  }

  if (scene === 'finished') {
    const messages = [
      `你今天一共完成了 ${payload.totalExercises} 个动作，整套训练都拿下了。`,
      `从第一组坚持到最后一组，今天这份训练答卷很漂亮。`,
      `哈肌咪教练认证：这次训练完整收官，辛苦但很值。`
    ]
    motivationState.title = '训练全部完成'
    motivationState.message = pickRandomMessage(messages)
  }
}

function toggleExercise(index: number) {
  if (currentExerciseIndex.value === index) {
    currentExerciseIndex.value = null // Collapse if already expanded
  } else {
    currentExerciseIndex.value = index // Expand the clicked one
  }
}

function getCompletedSets(exIndex: number) {
  if (exercises.value.length === 0) return 0
  return exercises.value[exIndex].sets.filter((s: any) => s.completed).length
}

const formattedTime = computed(() => {
  const m = Math.floor(elapsedTime.value / 60)
  const s = elapsedTime.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

function startWorkoutTimer() {
  if (workoutTimer || exercises.value.length === 0) return

  workoutTimer = setInterval(() => {
    elapsedTime.value++
  }, 1000)
}

function initTraining(plan) {
  const normalizedPlan = normalizeTrainingPlan(plan)

  if (!normalizedPlan) return

  workoutTitle.value = normalizedPlan.title
  currentTrainingVideoSrc.value = normalizedPlan.videoSrc || ''

  const planClone = JSON.parse(JSON.stringify(normalizedPlan))

  exercises.value = planClone.exercises.map((ex: any) => ({
    ...ex,
    sets: (ex.sets || []).map((set: any) => ({ ...set, completed: false }))
  }))
  currentExerciseIndex.value = exercises.value.length > 0 ? 0 : null
  activeSetIndex.value = 0
  elapsedTime.value = 0
  setMotivation('default')
}

function buildTrainingRecord() {
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return {
    date: dateStr,
    title: workoutTitle.value || '未知训练',
    duration: elapsedTime.value,
    calories: burnedCalories.value,
    completedExercises: completedExercisesCount.value,
    totalExercises: totalExercisesCount.value
  }
}

function resetTrainingState() {
  clearInterval(workoutTimer)
  workoutTimer = null
  clearInterval(restTimer)
  restTimer = null
  isResting.value = false
  restTimeLeft.value = 60
  showHistory.value = false
  showProfile.value = false
  showCalendar.value = false
  showEndConfirm.value = false
  showCompletionPoster.value = false
  showVideoModal.value = false
  currentTrainingVideoSrc.value = ''
  currentSegmentVideoSrc.value = ''
  activeSegment.value = { start: 0, end: 0 }
  activeSegmentTitle.value = ''
  pendingCompletionRecord.value = null
  selectedShareFriends.value = []
  workoutTitle.value = ''
  elapsedTime.value = 0
  currentExerciseIndex.value = null
  activeSetIndex.value = 0
  exercises.value = []
  setMotivation('default')
}

function finalizeTrainingClose(shouldRecord: boolean) {
  const recordToSave = pendingCompletionRecord.value || buildTrainingRecord()

  if (shouldRecord && (recordToSave.totalExercises > 0 || recordToSave.duration > 0)) {
    store.addTrainingRecord(recordToSave)
  }

  showEndConfirm.value = false
  showCompletionPoster.value = false
  closeVideoModal()
  emit('clear-training-plan')
  isAnimating.value = false

  setTimeout(() => {
    emit('update:modelValue', false)
    resetTrainingState()
  }, 300)
}

function formatDurationText(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  return `${minutes}分${remainSeconds.toString().padStart(2, '0')}秒`
}

function showCompletionPosterAndClose() {
  const record = buildTrainingRecord()
  record.exerciseProgressList = exercises.value.map((exercise: any) => ({
    name: exercise.name,
    completedSets: exercise.sets.filter((set: any) => set.completed).length,
    totalSets: exercise.sets.length
  }))
  record.encouragement = {
    title: '哈肌咪教练发来结训表扬',
    message: `今天你完成了 ${record.totalExercises} 个动作，累计消耗 ${record.calories} 大卡，真的很棒。`
  }
  pendingCompletionRecord.value = record
  selectedShareFriends.value = []
  showEndConfirm.value = false
  showCompletionPoster.value = true
  setMotivation('finished', { totalExercises: record.totalExercises })

  clearInterval(workoutTimer)
  workoutTimer = null
  clearInterval(restTimer)
  restTimer = null
  isResting.value = false
  showVideoModal.value = false
}

function closeCompletionPoster() {
  if (showCompletionPoster.value && pendingCompletionRecord.value) {
    finalizeTrainingClose(true)
  } else {
    showCompletionPoster.value = false
  }
}

function shareToFriend(friend: { name: string }) {
  if (selectedShareFriends.value.includes(friend.name)) {
    selectedShareFriends.value = selectedShareFriends.value.filter((name) => name !== friend.name)
    return
  }

  selectedShareFriends.value = [...selectedShareFriends.value, friend.name]
}

function handleShareAction(action: string) {
  if (action === 'forward') {
    if (selectedShareFriends.value.length === 0) {
      _notice('请先选择要分享的好友')
      return
    }

    _notice(`已转发给 ${selectedShareFriends.value.join('、')}`)
    finalizeTrainingClose(true)
    return
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      if (props.trainingPlan && exercises.value.length === 0) {
        initTraining(props.trainingPlan)
      }

      nextTick(() => {
        isAnimating.value = true
      })

      startWorkoutTimer()
    } else {
      isAnimating.value = false
      // Delay the clear state slightly so exit animation can play
      setTimeout(() => {
        // Don't clear timers if we're just minimizing
        if (!props.minimized) {
          resetTrainingState()
        }
      }, 300)
    }
  }
)

watch(
  () => props.trainingPlan,
  (newPlan) => {
    if (props.modelValue && newPlan) {
      if (exercises.value.length === 0 || workoutTitle.value !== newPlan.title) {
        initTraining(newPlan)
        startWorkoutTimer()
      }
    }
  }
)

onMounted(() => {
  bus.on('RESTART_REST_TIMER', restartRestTimer)
  bus.on('TRAINING_RESTORED', handleTrainingRestored)
})

onUnmounted(() => {
  clearInterval(workoutTimer)
  clearInterval(restTimer)
  bus.off('RESTART_REST_TIMER', restartRestTimer)
  bus.off('TRAINING_RESTORED', handleTrainingRestored)
})

function handleTrainingRestored() {
  setMotivation('restored')
}

function completeSet(setIndex: number) {
  if (!currentExercise.value || currentExercise.value.sets[setIndex].completed) return

  const exerciseName = currentExercise.value.name
  const totalSets = currentExercise.value.sets.length
  currentExercise.value.sets[setIndex].completed = true
  const completedSets = currentExercise.value.sets.filter((s: any) => s.completed).length
  setMotivation('setComplete', { exerciseName, completedSets, totalSets })

  // Find next active set
  const nextIncomplete = currentExercise.value.sets.findIndex((s: any) => !s.completed)

  if (nextIncomplete !== -1) {
    activeSetIndex.value = nextIncomplete
  } else {
    // All sets in current exercise completed
    if (
      currentExerciseIndex.value !== null &&
      currentExerciseIndex.value < exercises.value.length - 1
    ) {
      currentExerciseIndex.value++
      activeSetIndex.value = 0
    } else {
      // Workout completely finished!
      _notice('恭喜完成本次训练！')
      showCompletionPosterAndClose()
      return
    }
  }

  // Start resting
  isResting.value = true
  restTimeLeft.value = 10 // Mock 10s for demo
  emit('rest-tick', restTimeLeft.value)

  // Optional: Do NOT automatically minimize. Wait for the user to make a choice from the modal.
  // We removed emit('minimize') here so the modal stays visible.

  clearInterval(restTimer)
  restTimer = setInterval(() => {
    restTimeLeft.value--
    emit('rest-tick', restTimeLeft.value)
    if (restTimeLeft.value <= 0) {
      clearInterval(restTimer)
      restTimer = null
      isResting.value = false
      // 发送通知给外部，但外部在没最小化时什么都不做
      emit('rest-finished')
    }
  }, 1000)
}

function skipRest() {
  isResting.value = false
  clearInterval(restTimer)
}

function restartRestTimer(seconds: number) {
  clearInterval(restTimer)
  restTimeLeft.value = seconds
  emit('rest-tick', restTimeLeft.value)

  restTimer = setInterval(() => {
    restTimeLeft.value--
    emit('rest-tick', restTimeLeft.value)
    if (restTimeLeft.value <= 0) {
      clearInterval(restTimer)
      isResting.value = false
      emit('rest-finished')
    }
  }, 1000)
}

function minimizeToFloat() {
  // Instead of closing entirely, emit event to show floating ball and hide this modal
  emit('minimize')
}

function requestCloseTraining() {
  if (totalExercisesCount.value === 0 && elapsedTime.value === 0) {
    finalizeTrainingClose(false)
    return
  }

  showEndConfirm.value = true
}

function confirmCloseTraining() {
  showCompletionPosterAndClose()
}
</script>

<style scoped lang="less">
.mascot-chip,
.empty-cat,
.rest-cat,
.share-summary-head,
.share-summary-mascot,
.summary-label {
  box-sizing: border-box;
}

.active-training-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f4f5f7;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;

  &.is-minimized {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.9);
  }
}

.training-container {
  width: 100%;
  height: 100%;
  background: #f4f5f7;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  box-sizing: border-box;

  &.slide-up {
    transform: translateY(0);
  }
}

.header-area {
  padding: 40rem 20rem 20rem 20rem;
  background: linear-gradient(to bottom, #e2e4e9, #f4f5f7);

  .top-row {
    display: flex;
    align-items: center;
    margin-bottom: 25rem;

    .main-timer {
      font-size: 42rem;
      font-weight: 800;
      color: #000;
      letter-spacing: -1px;
    }
  }

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    .title-input {
      display: flex;
      align-items: center;
      gap: 8rem;
      color: #6b7280;

      svg {
        font-size: 16rem;
      }

      input {
        background: transparent;
        border: none;
        outline: none;
        font-size: 16rem;
        color: #374151;
        width: 180rem;
        font-weight: 500;

        &::placeholder {
          color: #9ca3af;
        }
      }
    }

    .progress-summary {
      text-align: right;
      font-size: 12rem;
      color: #6b7280;
      line-height: 1.5;
    }
  }
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 15rem 100rem 15rem;

  &::-webkit-scrollbar {
    display: none;
  }

  .empty-plan-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    color: #6b7280;
    text-align: center;
    padding: 0 40rem;

    .empty-icon {
      font-size: 80rem;
      color: #d1d5db;
      margin-bottom: 20rem;
    }

    h3 {
      font-size: 18rem;
      color: #374151;
      margin-bottom: 10rem;
      font-weight: 600;
    }

    p {
      font-size: 14rem;
      line-height: 1.5;
      margin-bottom: 30rem;
    }

    .empty-action-btn {
      background: #3b82f6;
      color: #fff;
      padding: 12rem 24rem;
      border-radius: 100rem;
      font-size: 16rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8rem;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: transform 0.2s;

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 15rem;

  .exercise-item {
    background: #fff;
    border-radius: 24rem;
    padding: 15rem 20rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;

    &.is-expanded {
      padding: 20rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .ex-header-row {
      display: flex;
      align-items: center;
      gap: 15rem;

      .thumb-container {
        width: 60rem;
        height: 60rem;
        flex-shrink: 0;

        .thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          background: #f3f4f6;

          &.video {
            border-radius: 12rem; /* Video uses rounded square */
          }
        }
      }

      .ex-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6rem;

        .ex-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .ex-name {
            font-size: 18rem;
            font-weight: bold;
            color: #111827;
          }

          .right-info {
            display: flex;
            align-items: center;
            gap: 10rem;

            .ex-progress {
              font-size: 13rem;
              color: #9ca3af;
            }

            .play-segment-btn {
              font-size: 24rem;
              color: #3b82f6;
              cursor: pointer;
              background: #eff6ff;
              border-radius: 50%;
              padding: 4rem;
            }
          }
        }

        .ex-subtext {
          font-size: 13rem;
          color: #9ca3af;
        }

        .pager-dots {
          display: flex;
          gap: 4rem;

          .dot {
            width: 5rem;
            height: 5rem;
            background: #e5e7eb;
            border-radius: 50%;

            &.active {
              background: #9ca3af;
            }
          }
        }
      }
    }

    .ex-expanded-details {
      margin-top: 20rem;

      .note-input {
        background: #f9fafb;
        padding: 12rem 15rem;
        border-radius: 12rem;
        margin-bottom: 20rem;

        input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          font-size: 14rem;
          color: #374151;

          &::placeholder {
            color: #9ca3af;
          }
        }
      }

      .timer-toggle {
        display: flex;
        align-items: center;
        gap: 8rem;
        margin-bottom: 15rem;

        .checkbox {
          width: 20rem;
          height: 20rem;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          justify-content: center;
          align-items: center;
          color: transparent;

          &.checked {
            background: #e5e7eb;
            color: #9ca3af;
          }
        }

        span {
          font-size: 14rem;
          color: #6b7280;
        }
      }

      .sets-list {
        display: flex;
        flex-direction: column;
        gap: 12rem;
        margin-bottom: 25rem;

        .set-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
          padding: 5rem 0;

          &.is-active {
            background: #eff6ff;
            border-radius: 12rem;
            padding: 5rem 10rem;
            margin: 0 -10rem;

            .set-index {
              background: #3b82f6;
              color: #fff;
            }
            .input-group {
              background: #fff;
              border: 1px solid #bfdbfe;
            }
            .check-btn {
              background: #fff;
              border: 1px solid #bfdbfe;
              color: #9ca3af;
            }
          }

          &.is-completed {
            opacity: 0.6;
            background: transparent !important;
            border-radius: 0 !important;
            padding: 5rem 0 !important;
            margin: 0 !important;
            .check-btn {
              color: #10b981;
            }
          }

          .set-index {
            width: 32rem;
            height: 32rem;
            background: #f3f4f6;
            border-radius: 8rem;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            font-size: 14rem;
            color: #111827;

            &.is-warmup {
              color: #f59e0b;
            }
          }

          .input-group {
            display: flex;
            background: #f3f4f6;
            border-radius: 8rem;
            padding: 6rem 12rem;
            align-items: baseline;
            gap: 6rem;
            width: 70rem; /* Give inputs a fixed wider width to prevent text overflow */

            .label {
              font-size: 12rem;
              color: #9ca3af;
              flex-shrink: 0;
            }

            .val-input {
              background: transparent;
              border: none;
              outline: none;
              width: 100%; /* Take remaining space */
              font-size: 18rem;
              font-weight: 500;
              color: #111827;
              text-align: left;
              padding: 0;
            }
          }

          .check-btn {
            width: 40rem;
            height: 40rem;
            background: #f3f4f6;
            border-radius: 8rem;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #9ca3af;
            font-size: 24rem;
            transition: all 0.2s;

            &:active {
              transform: scale(0.95);
            }
          }
        }
      }
    }
  }
}

.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #f9fafb;
  padding: 15rem 20rem 25rem 20rem;
  display: flex;
  justify-content: space-around; /* Distribute 3 items evenly */
  align-items: flex-end;
  border-top: 1px solid #e5e7eb;
  box-sizing: border-box;

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rem;
    color: #6b7280;
    font-size: 12rem;
    width: 80rem; /* Give them a bit more width to be centered nicely */

    .nav-icon {
      font-size: 24rem;
    }

    &.center-action {
      color: #3b82f6;

      .history-btn {
        width: 54rem;
        height: 54rem;
        background: #3b82f6;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 28rem;
        margin-bottom: -2rem;
        box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
      }
    }
  }
}

.history-drawer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  .history-drawer {
    background: #fff;
    width: 100%;
    height: 75%;
    border-top-left-radius: 24rem;
    border-top-right-radius: 24rem;
    display: flex;
    flex-direction: column;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &.slide-up {
      transform: translateY(0);
    }

    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rem;
      border-bottom: 1px solid #f3f4f6;

      .drawer-title {
        font-size: 18rem;
        font-weight: bold;
        color: #111827;
      }

      .close-icon {
        font-size: 24rem;
        color: #9ca3af;
        background: #f3f4f6;
        border-radius: 50%;
        padding: 4rem;
      }
    }

    .drawer-categories {
      display: flex;
      gap: 10rem;
      padding: 15rem 20rem;
      overflow-x: auto;
      border-bottom: 1px solid #f3f4f6;

      &::-webkit-scrollbar {
        display: none;
      }

      .category-item {
        white-space: nowrap;
        padding: 6rem 16rem;
        background: #f3f4f6;
        border-radius: 20rem;
        font-size: 14rem;
        color: #4b5563;

        &.active {
          background: #3b82f6;
          color: #fff;
        }
      }
    }

    .drawer-list {
      flex: 1;
      overflow-y: auto;
      padding: 20rem;
      display: flex;
      flex-direction: column;
      gap: 15rem;

      .history-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f9fafb;
        border-radius: 16rem;
        padding: 15rem;
        border: 1px solid #f3f4f6;

        .card-left {
          display: flex;
          align-items: center;
          gap: 15rem;

          .plan-cover {
            width: 48rem;
            height: 64rem;
            object-fit: cover;
            border-radius: 8rem;
            background: #eff6ff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .plan-info {
            display: flex;
            flex-direction: column;
            gap: 4rem;

            .plan-title {
              font-size: 16rem;
              font-weight: bold;
              color: #111827;
            }

            .plan-meta {
              font-size: 12rem;
              color: #6b7280;
            }
          }
        }

        .card-right {
          .use-btn {
            background: #3b82f6;
            color: #fff;
            font-size: 13rem;
            padding: 6rem 16rem;
            border-radius: 20rem;
            font-weight: 500;
          }
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 50rem;
        color: #9ca3af;

        svg {
          font-size: 64rem;
          margin-bottom: 10rem;
          color: #e5e7eb;
        }

        p {
          font-size: 14rem;
        }
      }
    }
  }
}

.rest-timer-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;

  .rest-content {
    background: #fff;
    padding: 40rem 20rem;
    border-radius: 24rem;
    text-align: center;
    width: 80%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

    .timer-icon {
      font-size: 40rem;
      color: #3b82f6;
      margin-bottom: 10rem;
    }

    .rest-title {
      font-size: 18rem;
      color: #111827;
      margin-bottom: 15rem;
      font-weight: bold;
    }

    .countdown {
      font-size: 60rem;
      font-weight: 800;
      font-family: monospace;
      color: #3b82f6;
      margin-bottom: 20rem;
    }

    .hint {
      font-size: 14rem;
      color: #6b7280;
      margin-bottom: 30rem;
      line-height: 1.5;
    }

    .rest-actions {
      display: flex;
      flex-direction: column;
      gap: 15rem;

      .btn-primary {
        background: #3b82f6;
        color: #fff;
        padding: 15rem;
        border-radius: 25rem;
        font-weight: bold;
        font-size: 16rem;
      }

      .btn-outline {
        border: 1px solid #e5e7eb;
        color: #4b5563;
        padding: 15rem;
        border-radius: 25rem;
        font-size: 16rem;
      }
    }
  }
}
.video-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 30;
  display: flex;
  justify-content: center;
  align-items: center;

  .video-modal-content {
    background: #000;
    width: 90%;
    border-radius: 16rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15rem;
      background: #111827;
      color: #fff;
      font-size: 16rem;
      font-weight: bold;

      .close-btn {
        font-size: 24rem;
        color: #9ca3af;
        cursor: pointer;
      }
    }

    .video-wrapper {
      width: 100%;
      aspect-ratio: 9/16;
      background: #000;

      .segment-video {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .segment-hint {
      padding: 12rem;
      text-align: center;
      background: #1f2937;
      color: #9ca3af;
      font-size: 13rem;
    }
  }
}

.confirm-overlay {
  z-index: 40;
  align-items: center;
  justify-content: center;

  .confirm-card {
    width: calc(100% - 48rem);
    background: #fff;
    border-radius: 24rem;
    padding: 24rem 20rem;
    box-sizing: border-box;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  }

  .confirm-title {
    font-size: 18rem;
    font-weight: bold;
    color: #111827;
    margin-bottom: 12rem;
    text-align: center;
  }

  .confirm-desc {
    font-size: 14rem;
    line-height: 1.6;
    color: #6b7280;
    text-align: center;
    margin-bottom: 20rem;
  }

  .confirm-actions {
    display: flex;
    gap: 12rem;
  }

  .confirm-btn {
    flex: 1;
    text-align: center;
    padding: 12rem 0;
    border-radius: 999rem;
    font-size: 15rem;
    font-weight: 600;

    &.secondary {
      background: #f3f4f6;
      color: #4b5563;
    }

    &.primary {
      background: #3b82f6;
      color: #fff;
    }
  }
}

.poster-overlay {
  z-index: 50;
  align-items: flex-end;
  justify-content: center;

  .poster-card {
    width: 100%;
    background: #1f1f22;
    border-top-left-radius: 24rem;
    border-top-right-radius: 24rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .poster-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18rem 20rem;
    font-size: 16rem;
    font-weight: 600;
    color: #fff;

    .close-icon {
      font-size: 24rem;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      padding: 8rem;
    }
  }

  .share-content {
    padding: 0 18rem 12rem;
    background: #1f1f22;
  }

  .share-summary-card {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 20rem;
    padding: 20rem;
    color: #fff;
    margin-bottom: 16rem;
  }

  .share-title {
    font-size: 18rem;
    font-weight: 700;
    margin-bottom: 10rem;
  }

  .share-meta {
    display: flex;
    flex-direction: column;
    gap: 6rem;
    font-size: 14rem;
    line-height: 1.5;
    opacity: 0.95;
    margin-bottom: 12rem;
  }

  .share-progress-list {
    display: flex;
    flex-direction: column;
    gap: 10rem;
  }

  .share-progress-item {
    display: flex;
    justify-content: space-between;
    gap: 12rem;
    font-size: 13rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.92);
  }

  .progress-name {
    flex: 1;
  }

  .progress-value {
    white-space: nowrap;
    font-weight: 600;
  }

  .friend-share-row {
    display: flex;
    gap: 18rem;
    overflow-x: auto;
    padding: 10rem 0 22rem;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .friend-share-item {
    min-width: 66rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rem;
    color: #fff;
    font-size: 12rem;
  }

  .friend-avatar {
    width: 66rem;
    height: 66rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rem;
    font-weight: 700;
    color: #fff;
    position: relative;

    &.selected {
      box-shadow: 0 0 0 3rem rgba(59, 130, 246, 0.85);
    }
  }

  .selected-badge {
    position: absolute;
    right: -2rem;
    top: -2rem;
    width: 20rem;
    height: 20rem;
    border-radius: 50%;
    background: #3b82f6;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14rem;
    box-shadow: 0 0 0 2rem #1f1f22;
  }

  .friend-name {
    max-width: 72rem;
    text-align: center;
    line-height: 1.3;
    color: rgba(255, 255, 255, 0.88);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .poster-actions {
    display: flex;
    gap: 12rem;
    padding: 16rem 18rem 22rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .poster-btn {
    flex: 1;
    text-align: center;
    padding: 12rem 0;
    border-radius: 999rem;
    font-size: 15rem;
    font-weight: 600;

    &.secondary {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.88);
    }

    &.primary {
      background: #3b82f6;
      color: #fff;
    }
  }
}
.calendar-drawer {
  height: 85% !important;

  .calendar-content {
    flex: 1;
    overflow-y: auto;
    padding: 20rem;

    .cal-month-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18rem;
      font-weight: bold;
      color: #111827;
      margin-bottom: 20rem;

      .nav-btn {
        font-size: 24rem;
        color: #6b7280;
        cursor: pointer;
      }
    }

    .cal-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 13rem;
      color: #9ca3af;
      margin-bottom: 10rem;
    }

    .cal-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5rem;
      margin-bottom: 30rem;

      .cal-day {
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 15rem;
        color: #374151;
        border-radius: 8rem;
        position: relative;
        cursor: pointer;

        &.empty {
          visibility: hidden;
        }

        .indicator {
          width: 4rem;
          height: 4rem;
          background: #10b981;
          border-radius: 50%;
          position: absolute;
          bottom: 4rem;
        }

        &.active {
          background: #3b82f6;
          color: #fff;

          .indicator {
            background: #fff;
          }
        }
      }
    }

    .record-title {
      font-size: 16rem;
      font-weight: bold;
      margin-bottom: 15rem;
      color: #111827;
    }

    .record-item {
      display: flex;
      align-items: center;
      gap: 15rem;
      background: #f9fafb;
      padding: 15rem;
      border-radius: 12rem;
      margin-bottom: 10rem;

      .r-icon {
        width: 40rem;
        height: 40rem;
        background: #e0e7ff;
        color: #3b82f6;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20rem;
      }

      .r-info {
        .r-name {
          font-size: 15rem;
          font-weight: 500;
          color: #111827;
          margin-bottom: 4rem;
        }
        .r-meta {
          font-size: 12rem;
          color: #6b7280;
        }
      }
    }
  }
}

.profile-drawer {
  height: 85% !important;

  .profile-content {
    flex: 1;
    overflow-y: auto;
    padding: 20rem;

    .form-group {
      margin-bottom: 20rem;

      label {
        display: block;
        font-size: 14rem;
        color: #374151;
        margin-bottom: 8rem;
        font-weight: 500;
      }

      input {
        width: 100%;
        box-sizing: border-box;
        padding: 12rem 15rem;
        background: #f3f4f6;
        border: 1px solid transparent;
        border-radius: 12rem;
        font-size: 16rem;
        outline: none;
        transition: all 0.2s;

        &:focus {
          background: #fff;
          border-color: #3b82f6;
        }
      }

      .radio-group {
        display: flex;
        gap: 15rem;

        .radio-btn {
          flex: 1;
          padding: 12rem 0;
          text-align: center;
          background: #f3f4f6;
          border-radius: 12rem;
          color: #6b7280;
          font-size: 16rem;
          transition: all 0.2s;

          &.active {
            background: #eff6ff;
            color: #3b82f6;
            font-weight: bold;
          }
        }
      }

      .select-wrapper {
        position: relative;
        width: 100%;

        .target-select {
          width: 100%;
          box-sizing: border-box;
          padding: 12rem 40rem 12rem 15rem;
          background: #f3f4f6;
          border: 1px solid transparent;
          border-radius: 12rem;
          font-size: 16rem;
          color: #111827;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          transition: all 0.2s;

          &:focus {
            background: #fff;
            border-color: #3b82f6;
          }
        }

        .select-icon {
          position: absolute;
          right: 15rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20rem;
          color: #6b7280;
          pointer-events: none;
        }
      }
    }

    .metaphor-card {
      display: flex;
      align-items: center;
      gap: 15rem;
      background: linear-gradient(135deg, #fdf4ff, #fae8ff);
      padding: 15rem;
      border-radius: 16rem;
      margin: 25rem 0;

      .m-icon {
        font-size: 32rem;
      }

      .m-text {
        .m-title {
          font-size: 12rem;
          color: #a21caf;
          margin-bottom: 4rem;
        }
        .m-desc {
          font-size: 16rem;
          color: #86198f;
          font-weight: bold;
        }
      }
    }

    .save-profile-btn {
      width: 100%;
      padding: 15rem 0;
      background: #3b82f6;
      color: #fff;
      text-align: center;
      border-radius: 100rem;
      font-size: 16rem;
      font-weight: bold;
      margin-top: 10rem;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

      &:active {
        transform: scale(0.98);
      }
    }
  }
}

/* Cat Theme */
.active-training-overlay {
  background: radial-gradient(circle at top right, rgba(255, 196, 138, 0.42), transparent 28%),
    radial-gradient(circle at top left, rgba(187, 233, 212, 0.55), transparent 32%),
    linear-gradient(180deg, #eef8ef 0%, #fff4eb 52%, #fffaf6 100%);
}

.training-container {
  background: transparent;
}

.header-area {
  background: radial-gradient(circle at 82% 24%, rgba(255, 210, 170, 0.72), transparent 20%),
    linear-gradient(180deg, #cfead8 0%, #eef8ef 38%, #fff7ee 100%);
  border-bottom-left-radius: 28rem;
  border-bottom-right-radius: 28rem;
  box-shadow: 0 10rem 30rem rgba(211, 134, 64, 0.08);

  .top-row {
    margin-bottom: 18rem;
  }

  .timer-shell {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14rem;
  }

  .main-timer {
    color: #7d4b24 !important;
    text-shadow: 0 2rem 0 rgba(255, 255, 255, 0.35);
  }

  .mascot-chip {
    display: flex;
    align-items: center;
    gap: 10rem;
    padding: 8rem 12rem 8rem 8rem;
    border-radius: 999rem;
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid rgba(219, 152, 94, 0.22);
    box-shadow: 0 8rem 18rem rgba(165, 117, 70, 0.1);
  }

  .mascot-avatar {
    width: 38rem;
    height: 38rem;
    border-radius: 50%;
    background: #d5ecd9;
    padding: 4rem;
    object-fit: cover;
    flex-shrink: 0;
  }

  .mascot-copy {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    color: #7d4b24;

    span {
      font-size: 13rem;
      font-weight: 700;
    }

    small {
      font-size: 10rem;
      color: #9b6a40;
    }
  }

  .title-row {
    align-items: stretch;
    gap: 12rem;
  }

  .title-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.78);
    padding: 12rem 14rem;
    border-radius: 18rem;
    border: 1px solid rgba(220, 158, 96, 0.18);
    color: #8b5a2b !important;

    svg {
      color: #d68b41;
    }

    input {
      width: 100% !important;
      color: #7a4a24 !important;
      font-weight: 700 !important;
    }
  }

  .progress-summary {
    min-width: 118rem;
    background: rgba(255, 255, 255, 0.78);
    border-radius: 18rem;
    padding: 10rem 12rem;
    border: 1px solid rgba(220, 158, 96, 0.18);
    color: #8b5a2b !important;
  }

  .summary-label {
    font-size: 10rem;
    color: #a17247;
    margin-bottom: 3rem;
    letter-spacing: 1rem;
  }
}

.scrollable-content {
  padding: 14rem 15rem 110rem 15rem;

  .empty-plan-state {
    background: rgba(255, 255, 255, 0.72);
    border-radius: 28rem;
    margin-top: 20rem;
    height: auto;
    min-height: 56vh;
    border: 1px solid rgba(220, 158, 96, 0.14);
    box-shadow: 0 18rem 34rem rgba(146, 101, 53, 0.08);
  }

  .empty-cat {
    width: 110rem;
    height: 110rem;
    border-radius: 50%;
    background: #d5ecd9;
    padding: 10rem;
    object-fit: cover;
    margin-bottom: 18rem;
    box-shadow: 0 12rem 28rem rgba(118, 162, 123, 0.18);
  }

  .empty-action-btn {
    background: linear-gradient(135deg, #ef9b52, #f4b770) !important;
    box-shadow: 0 10rem 20rem rgba(227, 145, 66, 0.28) !important;
  }
}

.exercise-list {
  gap: 16rem;

  .exercise-item {
    background: rgba(255, 252, 248, 0.92);
    border: 1px solid rgba(224, 177, 125, 0.16);
    box-shadow: 0 16rem 30rem rgba(169, 119, 72, 0.08);

    &.is-expanded {
      background: rgba(255, 250, 244, 0.98);
      box-shadow: 0 18rem 36rem rgba(169, 119, 72, 0.12);
    }

    .thumb-container .thumb {
      background: #d8ecde;

      &.video {
        border-radius: 18rem;
        border: 3rem solid rgba(212, 236, 220, 0.95);
      }
    }

    .ex-name {
      color: #7a4a24 !important;
    }

    .ex-progress,
    .ex-subtext {
      color: #b08a65 !important;
    }

    .play-segment-btn {
      color: #ef8f3f !important;
      background: #fff5eb !important;
      box-shadow: 0 6rem 16rem rgba(228, 144, 73, 0.18);
    }

    .pager-dots .dot {
      background: #ecd5bf !important;

      &.active {
        background: #ef9b52 !important;
      }
    }

    .note-input {
      background: #fff5eb !important;
      border: 1px solid rgba(235, 176, 120, 0.16);

      input {
        color: #7a4a24 !important;
      }
    }

    .set-row {
      &.is-active {
        background: #eef8ef !important;

        .set-index {
          background: #ef9b52 !important;
        }

        .input-group,
        .check-btn {
          border-color: #cfead8 !important;
        }
      }

      &.is-completed {
        opacity: 1 !important;
        background: linear-gradient(
          135deg,
          rgba(225, 245, 232, 0.95),
          rgba(241, 250, 244, 0.92)
        ) !important;
        border-radius: 18rem !important;
        padding: 10rem 12rem !important;
        margin: 0 !important;
        border: 1px solid rgba(132, 171, 140, 0.22);

        .set-index {
          background: linear-gradient(135deg, #7fcf9d, #5fb781) !important;
          color: #fff !important;
          box-shadow: 0 8rem 14rem rgba(95, 183, 129, 0.24);
        }

        .input-group {
          background: rgba(255, 255, 255, 0.82) !important;
          border: 1px solid rgba(159, 211, 173, 0.42);

          .label {
            color: #8bb195 !important;
          }

          .val-input {
            color: #5a7f67 !important;
          }
        }

        .check-btn {
          background: linear-gradient(135deg, #7fcf9d, #5fb781) !important;
          color: #fff !important;
          box-shadow: 0 10rem 18rem rgba(95, 183, 129, 0.24);
        }
      }
    }

    .set-index {
      background: #fff0e0 !important;
      color: #8b5a2b !important;
    }

    .input-group {
      background: #fff9f2 !important;
      border: 1px solid rgba(236, 214, 192, 0.78);

      .label {
        color: #c09a77 !important;
      }

      .val-input {
        color: #7a4a24 !important;
      }
    }

    .check-btn {
      background: #eef8ef !important;
      color: #84ab8c !important;
    }
  }
}

.bottom-nav {
  background: rgba(255, 250, 245, 0.94);
  border-top: 1px solid rgba(227, 181, 133, 0.18);
  box-shadow: 0 -10rem 28rem rgba(179, 129, 78, 0.08);

  .nav-item {
    color: #a07853;

    .nav-icon {
      color: #c98a55;
    }

    &.center-action {
      color: #ef8f3f;

      .history-btn {
        background: linear-gradient(135deg, #ef9b52, #f4b770);
        box-shadow: 0 10rem 18rem rgba(228, 142, 71, 0.26);
      }
    }
  }
}

.history-drawer-overlay {
  background: rgba(59, 39, 27, 0.26);

  .history-drawer {
    background: linear-gradient(180deg, #fffdf8 0%, #fef7ef 100%);
  }

  .drawer-header {
    border-bottom-color: rgba(233, 197, 158, 0.16) !important;

    .drawer-title {
      color: #7a4a24 !important;
    }

    .close-icon {
      background: #fff0e0 !important;
      color: #c78b56 !important;
    }
  }

  .drawer-categories {
    border-bottom-color: rgba(233, 197, 158, 0.16) !important;

    .category-item {
      background: #fff3e5 !important;
      color: #9c7048 !important;

      &.active {
        background: linear-gradient(135deg, #ef9b52, #f4b770) !important;
        color: #fff !important;
      }
    }
  }

  .history-card,
  .record-item,
  .form-group input,
  .radio-btn,
  .target-select {
    box-shadow: none;
  }

  .history-card {
    background: #fffaf4 !important;
    border-color: rgba(233, 197, 158, 0.2) !important;
  }

  .use-btn,
  .save-profile-btn {
    background: linear-gradient(135deg, #ef9b52, #f4b770) !important;
    box-shadow: 0 10rem 18rem rgba(228, 142, 71, 0.22);
  }

  .record-item {
    background: #fff7ef !important;
  }

  .r-icon {
    background: #eef8ef !important;
    color: #ef9b52 !important;
  }

  .radio-btn.active {
    background: #eef8ef !important;
    color: #2f8f64 !important;
  }

  .metaphor-card {
    background: linear-gradient(135deg, #eef8ef, #fff4e5) !important;

    .m-title {
      color: #7a8f55 !important;
    }

    .m-desc {
      color: #7a4a24 !important;
    }
  }
}

.rest-timer-modal {
  background: rgba(247, 236, 221, 0.86);
  backdrop-filter: blur(16px);

  .rest-content {
    background: linear-gradient(180deg, #fffaf5 0%, #fff1e0 100%);
    border: 1px solid rgba(237, 184, 127, 0.24);
    box-shadow: 0 22rem 48rem rgba(162, 109, 53, 0.14);
  }

  .rest-cat {
    width: 88rem;
    height: 88rem;
    object-fit: cover;
    border-radius: 50%;
    background: #d6ecd8;
    padding: 8rem;
    margin: 0 auto 14rem;
    box-shadow: 0 10rem 22rem rgba(126, 170, 132, 0.18);
  }

  .rest-title {
    color: #7a4a24 !important;
  }

  .countdown {
    color: #ef8f3f !important;
  }

  .hint {
    color: #9c7048 !important;
  }

  .btn-primary {
    background: linear-gradient(135deg, #ef9b52, #f4b770) !important;
  }

  .btn-outline {
    background: rgba(255, 255, 255, 0.72);
    border-color: rgba(230, 188, 147, 0.4) !important;
    color: #8c6645 !important;
  }
}

.video-modal-overlay {
  background: rgba(79, 49, 34, 0.82);

  .video-modal-content {
    background: #fff8f0;
    border-radius: 24rem;
  }

  .modal-header {
    background: #ffe9d1 !important;
    color: #7a4a24 !important;
  }

  .segment-hint {
    background: #eef8ef !important;
    color: #7f8b73 !important;
  }
}

.confirm-overlay {
  .confirm-card {
    background: linear-gradient(180deg, #fffdf8 0%, #fff5e8 100%);
    border: 1px solid rgba(237, 184, 127, 0.22);
  }

  .confirm-title {
    color: #7a4a24 !important;
  }

  .confirm-desc {
    color: #9b7250 !important;
  }

  .confirm-btn.secondary {
    background: #fff0e0 !important;
    color: #9b7250 !important;
  }

  .confirm-btn.primary {
    background: linear-gradient(135deg, #ef9b52, #f4b770) !important;
  }
}

.poster-overlay {
  .poster-card {
    background: #2c241e;
  }

  .poster-header {
    color: #fff6ee;

    .close-icon {
      background: rgba(255, 255, 255, 0.12);
    }
  }

  .share-content {
    background: #2c241e;
  }

  .share-summary-card {
    background: linear-gradient(135deg, #ef9b52 0%, #a9d7b5 100%);
    color: #432919;
  }

  .share-summary-head {
    display: flex;
    justify-content: space-between;
    gap: 12rem;
    align-items: flex-start;
  }

  .share-summary-mascot {
    width: 56rem;
    height: 56rem;
    border-radius: 16rem;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.4);
    padding: 4rem;
    flex-shrink: 0;
  }

  .share-meta,
  .share-progress-item {
    color: rgba(67, 41, 25, 0.92);
  }

  .share-encouragement {
    margin-top: 12rem;
    display: flex;
    flex-direction: column;
    gap: 4rem;
    color: rgba(67, 41, 25, 0.9);

    strong {
      font-size: 13rem;
      font-weight: 700;
    }

    span {
      font-size: 12rem;
      line-height: 1.5;
    }
  }

  .friend-avatar.selected {
    box-shadow: 0 0 0 3rem rgba(239, 155, 82, 0.95);
  }

  .selected-badge {
    background: #ef9b52;
    box-shadow: 0 0 0 2rem #2c241e;
  }

  .poster-btn.secondary {
    background: rgba(255, 255, 255, 0.08);
  }

  .poster-btn.primary {
    background: linear-gradient(135deg, #ef9b52, #f4b770);
    color: #53311b;
  }
}
</style>
