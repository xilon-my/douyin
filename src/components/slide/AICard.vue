<template>
  <div class="ai-card-wrapper">
    <div
      class="bg-img"
      :style="{
        backgroundImage: `url(${item.aiCard?.bgImg || 'https://img.zcool.cn/community/01d9f45c92d50ba801214168c4a0df.jpg@1280w_1l_2o_100sh.jpg'})`
      }"
    ></div>
    <div class="bg-overlay"></div>

    <div class="content">
      <div class="header">
        <img :src="catMascot" alt="哈肌咪训练助手" class="header-cat" />
        <div class="header-copy">
          <h1 class="title">哈肌咪周计划提醒</h1>
          <span class="ai-tag">{{ encouragementTag }}</span>
        </div>
      </div>

      <div class="cards-container">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">本周消耗目标</h2>
            <div class="stars">
              <Icon v-for="i in 3" :key="i" icon="twemoji:glowing-star" class="star-icon" />
            </div>
          </div>

          <div class="stats">
            <span>目标 {{ weeklyTargetCalories }} 千卡</span>
            <span class="divider">|</span>
            <span>已完成 {{ completedWeeklyCalories }} 千卡</span>
            <span class="divider">|</span>
            <span>还差 {{ remainingWeeklyCalories }} 千卡</span>
          </div>

          <div class="chart-area">
            <div class="y-axis">坚持进度</div>
            <svg class="line-chart" viewBox="0 0 300 60" preserveAspectRatio="none">
              <path :d="progressPath" fill="none" stroke="rgba(112,74,42,0.82)" stroke-width="2" />
              <path :d="`${progressPath} L300,60 L0,60 Z`" fill="url(#grad1)" stroke="none" />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color: rgba(239, 155, 82, 0.45); stop-opacity: 1" />
                  <stop offset="100%" style="stop-color: rgba(239, 155, 82, 0); stop-opacity: 1" />
                </linearGradient>
              </defs>
            </svg>
            <div class="x-axis">
              <span>本周开始</span>
              <span>{{ progressPercent }}%</span>
            </div>
          </div>

          <p class="desc">
            {{ weeklyReminderText }}
          </p>
          <div class="quote">
            <Icon icon="bi:quote" class="quote-icon" />
            {{ encouragementQuote }}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">今天继续练会更赚</h2>
            <div class="stars">
              <Icon v-for="i in 2" :key="i" icon="twemoji:sparkles" class="star-icon" />
            </div>
          </div>

          <div class="stats">
            <span>目标拆解</span>
            <span class="divider">|</span>
            <span>坚持感</span>
            <span class="divider">|</span>
            <span>连贯训练</span>
          </div>

          <div class="mini-goals">
            <div class="goal-chip">
              <strong>{{ dailyAverageTarget }}</strong>
              <span>日均目标</span>
            </div>
            <div class="goal-chip">
              <strong>{{ weeklyRecordCount }}</strong>
              <span>本周训练天数</span>
            </div>
            <div class="goal-chip">
              <strong>{{ nextMilestone }}</strong>
              <span>下一步</span>
            </div>
          </div>

          <div class="quote">
            <Icon icon="bi:quote" class="quote-icon" />
            {{ streakStyleCopy }}
          </div>
        </div>
      </div>

      <div class="actions">
        <div class="btn outline" @click="remindLater">稍后提醒</div>
        <div class="btn primary" @click="goTraining">去练一组</div>
      </div>

      <div class="bottom-hint">
        <Icon icon="akar-icons:chevron-up" />
        <span>划走会错过今天的进度加成</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import hajimiCats from '@/cats'
import { useBaseStore } from '@/store/pinia'
import bus from '@/utils/bus'

const store = useBaseStore()
const catMascot = hajimiCats.jump

const props = defineProps({
  item: {
    type: Object,
    default: () => ({})
  },
  isPlay: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({})
  },
  index: {
    type: Number,
    default: 0
  }
})

const weeklyTargetCalories = computed(() => Number(store.fitnessProfile.targetCalories || 0))

function isThisWeek(dateString: string) {
  if (!dateString) return false
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()
  const day = now.getDay() || 7
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(now.getDate() - day + 1)

  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  return date >= start && date < end
}

const weeklyHistory = computed(() => {
  return (store.trainingHistory || []).filter((record: any) => isThisWeek(record.date))
})

const completedWeeklyCalories = computed(() => {
  return weeklyHistory.value.reduce(
    (sum: number, record: any) => sum + Number(record.calories || 0),
    0
  )
})

const remainingWeeklyCalories = computed(() => {
  return Math.max(0, weeklyTargetCalories.value - completedWeeklyCalories.value)
})

const progressPercent = computed(() => {
  if (!weeklyTargetCalories.value) return 0
  return Math.min(
    100,
    Math.round((completedWeeklyCalories.value / weeklyTargetCalories.value) * 100)
  )
})

const progressPath = computed(() => {
  const level = Math.max(8, 48 - (progressPercent.value / 100) * 38)
  const mid1 = Math.max(12, level + 8)
  const mid2 = Math.max(10, level + 4)
  return `M0,48 Q38,${mid1} 72,${mid1 + 2} T132,${mid2} T192,${Math.max(8, level)} T246,${Math.max(6, level - 4)} T300,${Math.max(5, level - 6)}`
})

const weeklyRecordCount = computed(() => weeklyHistory.value.length)

const dailyAverageTarget = computed(() => {
  if (!weeklyTargetCalories.value) return '0 千卡'
  return `${Math.round(weeklyTargetCalories.value / 7)} 千卡`
})

const nextMilestone = computed(() => {
  if (remainingWeeklyCalories.value <= 0) return '已达标'
  if (remainingWeeklyCalories.value <= 200) return '再练一组'
  if (remainingWeeklyCalories.value <= 500) return '今天加练'
  return '继续坚持'
})

const encouragementTag = computed(() => {
  if (progressPercent.value >= 100) return '本周已达标'
  if (progressPercent.value >= 70) return '快完成啦'
  if (progressPercent.value >= 30) return '进度稳定'
  return '今天别断签'
})

const weeklyReminderText = computed(() => {
  if (remainingWeeklyCalories.value <= 0) {
    return '你这周的消耗目标已经完成了，继续保持节奏，哈肌咪教练已经在给你记一枚满分徽章。'
  }

  return `你给自己定下的周计划是 ${weeklyTargetCalories.value} 千卡，目前已经完成 ${completedWeeklyCalories.value} 千卡，还差 ${remainingWeeklyCalories.value} 千卡，今天再练一点就会轻松很多。`
})

const encouragementQuote = computed(() => {
  if (remainingWeeklyCalories.value <= 0) return '今天这份坚持已经兑换成结果，接下来只要稳稳保持。'
  if (progressPercent.value >= 70) return '已经接近终点了，现在偷懒最可惜，再推一把就能达标。'
  if (progressPercent.value >= 30) return '你已经不是从零开始了，每一组都在帮这周的目标减压。'
  return '多邻国靠连击养习惯，训练也一样，今天别让进度断掉。'
})

const streakStyleCopy = computed(() => {
  if (weeklyRecordCount.value >= 4) return '你这周已经练了好几天，别让好不容易攒起来的节奏断掉。'
  if (weeklyRecordCount.value >= 2) return '这周已经开了个好头，再完成一组，习惯就会更稳。'
  return '先把今天点亮，哈肌咪教练会替你盯着周目标慢慢追上来。'
})

function remindLater() {
  bus.emit('SCROLL_TO_NEXT_VIDEO')
}

function goTraining() {
  bus.emit('OPEN_TRAINING_FROM_REMINDER')
}
</script>

<style scoped lang="less">
.ai-card-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  color: #7a4a24;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  .bg-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    z-index: 1;
  }

  .bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at top right, rgba(255, 204, 156, 0.6), transparent 24%),
      linear-gradient(180deg, rgba(232, 248, 236, 0.92), rgba(255, 245, 232, 0.94));
    backdrop-filter: blur(10px);
    z-index: 2;
  }

  .content {
    position: relative;
    z-index: 3;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 80rem 20rem 30rem 20rem; /* Give space for top nav */
    box-sizing: border-box;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12rem;
    margin-bottom: 20rem;

    .header-cat {
      width: 52rem;
      height: 52rem;
      border-radius: 50%;
      object-fit: cover;
      background: rgba(255, 255, 255, 0.78);
      padding: 5rem;
      box-shadow: 0 12rem 24rem rgba(141, 96, 56, 0.14);
    }

    .header-copy {
      display: flex;
      flex-direction: column;
      gap: 6rem;
    }

    .title {
      font-size: 26rem;
      font-weight: bold;
      margin: 0;
      letter-spacing: 1px;
      color: #7a4a24;
    }

    .ai-tag {
      font-size: 12rem;
      border: 1px solid rgba(214, 159, 103, 0.26);
      padding: 4rem 10rem;
      border-radius: 999rem;
      color: #9d7550;
      background: rgba(255, 255, 255, 0.72);
      width: fit-content;
    }
  }

  .cards-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15rem;
    overflow-y: auto;

    /* Hide scrollbar */
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .card {
    background: rgba(255, 252, 247, 0.82);
    border-radius: 20rem;
    padding: 16rem;
    display: flex;
    flex-direction: column;
    gap: 12rem;
    border: 1px solid rgba(224, 177, 125, 0.18);
    box-shadow: 0 16rem 28rem rgba(169, 119, 72, 0.08);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 18rem;
        font-weight: 600;
        margin: 0;
      }

      .stars {
        display: flex;
        gap: 2rem;
        .star-icon {
          font-size: 14rem;
          color: #ef9b52;
        }
      }
    }

    .stats {
      display: flex;
      justify-content: space-between;
      font-size: 13rem;
      color: #9d7550;

      .divider {
        color: rgba(157, 117, 80, 0.35);
      }
    }

    .chart-area {
      position: relative;
      margin-top: 10rem;
      height: 80rem;
      border-bottom: 1px dashed rgba(203, 161, 120, 0.35);

      .y-axis {
        position: absolute;
        top: -10rem;
        left: 0;
        font-size: 11rem;
        color: rgba(140, 95, 52, 0.72);
      }

      .line-chart {
        width: 100%;
        height: 100%;
        position: absolute;
        bottom: 0;
      }

      .x-axis {
        position: absolute;
        bottom: -18rem;
        width: 100%;
        display: flex;
        justify-content: space-between;
        font-size: 11rem;
        color: rgba(140, 95, 52, 0.72);
      }
    }

    .desc {
      font-size: 13rem;
      line-height: 1.5;
      color: #7d5734;
      margin: 5rem 0 0 0;
    }

    .quote {
      background: #fff1e0;
      padding: 10rem 12rem;
      border-radius: 8rem;
      font-size: 12rem;
      color: #8d6038;
      display: flex;
      align-items: flex-start;
      gap: 6rem;

      .quote-icon {
        font-size: 16rem;
        flex-shrink: 0;
        color: rgba(141, 96, 56, 0.66);
      }
    }

    .mini-goals {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10rem;
    }

    .goal-chip {
      background: rgba(255, 245, 232, 0.9);
      border-radius: 14rem;
      padding: 12rem 8rem;
      text-align: center;
      border: 1px solid rgba(224, 177, 125, 0.16);

      strong {
        display: block;
        font-size: 15rem;
        color: #7a4a24;
        margin-bottom: 4rem;
      }

      span {
        font-size: 11rem;
        color: #9d7550;
      }
    }
  }

  .actions {
    display: flex;
    gap: 15rem;
    margin-top: 20rem;

    .btn {
      flex: 1;
      text-align: center;
      padding: 14rem 0;
      border-radius: 25rem;
      font-size: 15rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:active {
        opacity: 0.8;
      }

      &.outline {
        background: rgba(255, 255, 255, 0.72);
        color: #8d6038;
      }

      &.primary {
        background: linear-gradient(135deg, #ef9b52, #f4b770);
        color: #55321b;
        box-shadow: 0 12rem 24rem rgba(227, 145, 66, 0.22);
      }
    }
  }

  .bottom-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 20rem;
    gap: 5rem;
    font-size: 12rem;
    color: rgba(122, 74, 36, 0.68);
    animation: bounce 2s infinite;

    svg {
      font-size: 18rem;
    }
  }

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8rem);
    }
    60% {
      transform: translateY(-4rem);
    }
  }
}
</style>
