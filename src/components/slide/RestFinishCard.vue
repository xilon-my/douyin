<template>
  <div class="rest-finish-wrapper">
    <div class="bg-overlay"></div>

    <div class="content">
      <div class="header">
        <img :src="catMascot" alt="训练哈肌咪" class="hero-cat" />
        <div class="header-copy">
          <h1 class="title">哈肌咪提醒你该回去训练啦</h1>
          <span class="ai-tag">休息已结束</span>
        </div>
      </div>

      <div class="cards-container">
        <div class="card main-card">
          <div class="card-header">
            <h2 class="card-title">哈肌咪教练发来训练召回</h2>
            <div class="stars">
              <Icon v-for="i in 3" :key="i" icon="twemoji:glowing-star" class="star-icon" />
            </div>
          </div>

          <div class="stats">
            <span>休息补给完成</span>
            <span class="divider">|</span>
            <span>可以继续下一组</span>
            <span class="divider">|</span>
            <span>哈肌咪已待命</span>
          </div>

          <div class="chart-area">
            <div class="y-axis">恢复进度</div>
            <svg class="line-chart" viewBox="0 0 300 60" preserveAspectRatio="none">
              <path
                d="M0,48 Q36,38 64,40 T118,24 T170,18 T220,10 T300,6"
                fill="none"
                stroke="rgba(136,92,47,0.8)"
                stroke-width="2"
              />
              <path
                d="M0,48 Q36,38 64,40 T118,24 T170,18 T220,10 T300,6 L300,60 L0,60 Z"
                fill="url(#gradRest)"
                stroke="none"
              />
              <defs>
                <linearGradient id="gradRest" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color: rgba(239, 155, 82, 0.45); stop-opacity: 1" />
                  <stop offset="100%" style="stop-color: rgba(239, 155, 82, 0); stop-opacity: 1" />
                </linearGradient>
              </defs>
            </svg>
            <div class="x-axis">
              <span>刚刚</span>
              <span>现在开练</span>
            </div>
          </div>

          <p class="desc">
            你的休息已经结束，哈肌咪教练建议你立刻回到训练面板，把节奏衔接上，效果会更稳定。
          </p>
          <div class="quote">
            <Icon icon="bi:quote" class="quote-icon" />
            “别让状态冷掉，我们趁热把下一组拿下！”
          </div>
        </div>

        <div class="card secondary-card">
          <div class="card-header">
            <h2 class="card-title">继续刷视频也没问题</h2>
            <div class="stars">
              <Icon v-for="i in 2" :key="i" icon="twemoji:sparkles" class="star-icon" />
            </div>
          </div>

          <div class="stats">
            <span>继续放松</span>
            <span class="divider">|</span>
            <span>稍后可再回来</span>
            <span class="divider">|</span>
            <span>哈肌咪会继续等你</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <div class="btn outline" @click="continueBrushing">继续看视频</div>
        <div class="btn primary" @click="resumeTraining">回去健身</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { _notice } from '@/utils'
import bus from '@/utils/bus'
import hajimiCats from '@/cats'

const catMascot = hajimiCats.flex

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

function resumeTraining() {
  bus.emit('RESTORE_TRAINING')
}

function continueBrushing() {
  bus.emit('SCROLL_TO_NEXT_VIDEO')
}
</script>

<style scoped lang="less">
.rest-finish-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  color: #7a4a24;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  .bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at top right, rgba(255, 208, 165, 0.46), transparent 24%),
      radial-gradient(circle at top left, rgba(190, 233, 213, 0.42), transparent 28%),
      linear-gradient(180deg, #f1faef 0%, #fff6ec 58%, #fffdf8 100%);
    z-index: 2;
  }

  .content {
    position: relative;
    z-index: 3;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 60rem 20rem 30rem 20rem;
    box-sizing: border-box;
    justify-content: center;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 16rem;
    margin-bottom: 25rem;

    .hero-cat {
      width: 74rem;
      height: 74rem;
      border-radius: 50%;
      object-fit: cover;
      background: rgba(255, 255, 255, 0.75);
      padding: 6rem;
      box-shadow: 0 12rem 28rem rgba(83, 57, 33, 0.2);
      flex-shrink: 0;
    }

    .header-copy {
      display: flex;
      flex-direction: column;
      gap: 8rem;
    }

    .title {
      font-size: 24rem;
      font-weight: 800;
      margin: 0;
      color: #6f4321;
    }

    .ai-tag {
      font-size: 12rem;
      border: 1px solid rgba(219, 152, 94, 0.28);
      padding: 4rem 10rem;
      border-radius: 999rem;
      color: #9b6a40;
      background: rgba(255, 255, 255, 0.65);
      width: fit-content;
    }
  }

  .cards-container {
    display: flex;
    flex-direction: column;
    gap: 15rem;
  }

  .card {
    background: rgba(255, 252, 247, 0.78);
    border-radius: 22rem;
    padding: 20rem;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(234, 184, 133, 0.2);
    box-shadow: 0 16rem 34rem rgba(151, 104, 58, 0.12);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15rem;

      .card-title {
        font-size: 18rem;
        font-weight: bold;
        margin: 0;
        color: #7a4a24;
      }

      .stars {
        display: flex;
        gap: 3rem;
        .star-icon {
          font-size: 16rem;
          color: #ef9b52;
        }
      }
    }

    .stats {
      display: flex;
      justify-content: space-between;
      font-size: 14rem;
      color: #9a7350;
      font-weight: 500;

      .divider {
        color: rgba(157, 117, 80, 0.35);
      }
    }

    &.main-card {
      .chart-area {
        position: relative;
        margin-top: 15rem;
        height: 100rem;
        border-bottom: 1px dashed rgba(203, 161, 120, 0.38);
        margin-bottom: 15rem;

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
          bottom: -20rem;
          width: 100%;
          display: flex;
          justify-content: space-between;
          font-size: 11rem;
          color: rgba(140, 95, 52, 0.72);
        }
      }

      .desc {
        font-size: 14rem;
        line-height: 1.6;
        color: #7d5734;
        margin: 10rem 0 15rem 0;
      }

      .quote {
        background: #fff2e2;
        padding: 15rem;
        border-radius: 14rem;
        font-size: 14rem;
        color: #8d6038;
        display: flex;
        align-items: flex-start;
        gap: 8rem;

        .quote-icon {
          font-size: 18rem;
          flex-shrink: 0;
          color: rgba(141, 96, 56, 0.7);
        }
      }
    }
  }

  .actions {
    display: flex;
    gap: 15rem;
    margin-top: 30rem;

    .btn {
      flex: 1;
      text-align: center;
      padding: 16rem 0;
      border-radius: 30rem;
      font-size: 16rem;
      font-weight: bold;
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
}
</style>
