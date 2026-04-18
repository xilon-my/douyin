<template>
  <div class="mini-program-overlay" v-if="modelValue">
    <div class="mini-program-card" :class="{ 'slide-up': isAnimating }">
      <div class="ai-workout-plan">
        <!-- Header -->
        <div class="header">
          <div class="title-area">
            <img :src="catMascot" alt="训练哈肌咪" class="cat-icon" />
            <div class="title-copy">
              <span class="title">哈肌咪训练助手</span>
              <small>帮你把动作拆成可执行计划</small>
            </div>
          </div>
          <div class="controls">
            <Icon icon="ic:round-more-horiz" class="control-btn" />
            <div class="divider"></div>
            <Icon icon="ic:round-close" class="control-btn" @click.stop="closeDialog" />
          </div>
        </div>

        <!-- Loading State -->
        <div class="loading-state" v-if="isLoading">
          <img :src="loadingMascot" alt="训练哈肌咪" class="loading-cat" />
          <div class="spinner"></div>
          <p>哈肌咪教练正在分析视频里的动作、组数和训练节奏...</p>
        </div>

        <!-- Content State -->
        <div class="plan-content" v-else-if="aiPlan">
          <div class="plan-header">
            <div class="plan-mascot-pill">
              <img :src="planMascot" alt="训练哈肌咪" class="plan-mascot" />
              <span>哈肌咪教练推荐</span>
            </div>
            <h2 class="plan-title">{{ aiPlan.title }}</h2>
            <div class="plan-meta">
              <span>{{ aiPlan.duration }}</span>
              <span class="dot">·</span>
              <span>{{ aiPlan.difficulty }}</span>
              <span class="dot">·</span>
              <span>{{ aiPlan.exercises.length }} 个动作</span>
            </div>
          </div>

          <div class="workout-list">
            <div class="exercise-item" v-for="(exercise, index) in aiPlan.exercises" :key="index">
              <div class="exercise-header">
                <div class="name-area">
                  <span class="index">{{ String.fromCharCode(65 + index) }}</span>
                  <span class="name">{{ exercise.name }}</span>
                </div>
                <Icon icon="mdi:dots-horizontal" class="more-icon" />
              </div>

              <div class="set-table">
                <div class="table-header">
                  <div class="col-set">组数</div>
                  <div class="col-weight">重量 (kg)</div>
                  <div class="col-reps">次数</div>
                </div>

                <div class="set-row" v-for="set in exercise.sets" :key="set.num">
                  <div class="col-set">
                    <span class="set-num">
                      {{ set.num }}
                    </span>
                  </div>
                  <div class="col-weight">
                    <input class="val-box editable-input" type="number" v-model="set.weight" />
                  </div>
                  <div class="col-reps">
                    <input class="val-box editable-input" type="number" v-model="set.reps" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Button -->
        <div class="dialog-footer" v-if="aiPlan">
          <div class="btn-start" @click="startTraining">
            <Icon icon="mdi:play-circle" class="play-icon" />
            <span>开始训练</span>
          </div>
          <div class="btn-save" @click="saveToHistory">
            <Icon icon="mdi:bookmark-outline" class="save-icon" />
            <span>仅保存到计划库</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import bus from '@/utils/bus'
import { _notice } from '@/utils'
import { useBaseStore } from '@/store/pinia'
import hajimiCats from '@/cats'

const catMascot = hajimiCats.stretch
const loadingMascot = hajimiCats.jump
const planMascot = hajimiCats.flex

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  pageId: {
    type: String,
    default: 'home-index'
  },
  videoItem: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'start-training'])

const isLoading = ref(true)
const isAnimating = ref(false)
const aiPlan = ref(null)

async function fetchVideoAsBase64(url: string): Promise<string> {
  return ''
}

async function generateWorkoutPlan(videoItem: any) {
  try {
    // 模拟 AI 处理时间
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 直接使用固定的 Mock 数据
    aiPlan.value = {
      title: '二头肌终极轰炸',
      duration: '预计 30 分钟',
      difficulty: '高强度进阶',
      videoCover:
        props.videoItem?.video?.cover?.url_list?.[0] ||
        'https://img.zcool.cn/community/018b325c92d52ea8012141680145c2.png@1280w_1l_2o_100sh.png',
      authorName: props.videoItem?.author?.nickname || '维亚德',
      videoSrc: props.videoItem?.video?.play_addr?.url_list?.[0] || '/videos/video1.mp4',
      exercises: [
        {
          name: '递减组哑铃弯举',
          key: 'dumbbell_curl',
          segment: { start: 5, end: 19 },
          sets: [
            { num: 1, weight: 20, reps: 10 },
            { num: 2, weight: 10, reps: 10 },
            { num: 3, weight: 20, reps: 10 },
            { num: 4, weight: 10, reps: 10 },
            { num: 5, weight: 20, reps: 10 },
            { num: 6, weight: 10, reps: 10 }
          ]
        },
        {
          name: '坐姿哑铃弯举',
          key: 'seated_dumbbell_curl',
          segment: { start: 19, end: 28 },
          sets: [
            { num: 1, weight: 15, reps: 10 },
            { num: 2, weight: 15, reps: 10 },
            { num: 3, weight: 15, reps: 10 }
          ]
        },
        {
          name: '交叉弯举',
          key: 'cross_curl',
          segment: { start: 28, end: 41 },
          sets: [
            { num: 1, weight: 17.5, reps: 12 },
            { num: 2, weight: 17.5, reps: 12 },
            { num: 3, weight: 17.5, reps: 12 }
          ]
        },
        {
          name: '拖拽弯举(Drag Curl)',
          key: 'drag_curl',
          segment: { start: 41, end: 51 },
          sets: [
            { num: 1, weight: 12.5, reps: 12 },
            { num: 2, weight: 12.5, reps: 12 },
            { num: 3, weight: 12.5, reps: 12 }
          ]
        }
      ]
    }
  } catch (error) {
    console.error('Failed to parse AI response', error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      isLoading.value = true
      aiPlan.value = null
      nextTick(() => {
        isAnimating.value = true
      })
      // Call Gemini API
      generateWorkoutPlan(props.videoItem)
    } else {
      isAnimating.value = false
    }
  }
)

function closeDialog() {
  isAnimating.value = false
  setTimeout(() => {
    emit('update:modelValue', false)
  }, 300)
}

function saveToHistory() {
  if (aiPlan.value) {
    const store = useBaseStore()
    // Generate a fresh ID/Date for the plan
    const newPlan = {
      ...aiPlan.value,
      date: '刚刚',
      id: Date.now().toString(),
      category: '二头',
      cover:
        aiPlan.value.videoCover ||
        'https://img.zcool.cn/community/018b325c92d52ea8012141680145c2.png@1280w_1l_2o_100sh.png',
      author: aiPlan.value.authorName || '维亚德'
    }
    store.savePlan(newPlan)
    _notice('已保存到计划库')
  }
  closeDialog()
}

function startTraining() {
  saveToHistory()
  setTimeout(() => {
    emit('start-training', aiPlan.value)
  }, 300)
}
</script>

<style scoped lang="less">
.mini-program-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-end; /* or align-items: center for full screen floating */
}

.mini-program-card {
  width: 100%;
  height: 90vh; /* Looks more like a mini-program */
  background: #0b0b0b;
  border-radius: 16rem 16rem 0 0;
  overflow: hidden;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;

  &.slide-up {
    transform: translateY(0);
  }
}

.ai-workout-plan {
  width: 100%;
  height: 100%;
  background: #0b0b0b; /* Dark theme similar to Xunji */
  color: #fff;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15rem 20rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    .title-area {
      display: flex;
      align-items: center;
      gap: 6rem;

      .ai-icon {
        font-size: 20rem;
        color: #00e5ff; /* AI cyan color */
      }

      .title {
        font-size: 16rem;
        font-weight: 600;
      }
    }

    .controls {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20rem;
      padding: 4rem 10rem;
      border: 1px solid rgba(255, 255, 255, 0.1);

      .control-btn {
        font-size: 20rem;
        color: #fff;
        padding: 2rem;
        cursor: pointer;
      }

      .divider {
        width: 1px;
        height: 14rem;
        background: rgba(255, 255, 255, 0.2);
        margin: 0 8rem;
      }
    }
  }

  .loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14rem;

    .spinner {
      width: 40rem;
      height: 40rem;
      border: 3px solid rgba(0, 229, 255, 0.2);
      border-top-color: #00e5ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .plan-content {
    flex: 1;
    overflow-y: auto;
    padding: 20rem;
    padding-bottom: 100rem; /* Space for bottom action */

    &::-webkit-scrollbar {
      display: none;
    }

    .plan-header {
      margin-bottom: 25rem;

      .plan-title {
        font-size: 24rem;
        font-weight: 800;
        margin: 0 0 10rem 0;
      }

      .plan-meta {
        font-size: 13rem;
        color: #9ca3af;
        display: flex;
        align-items: center;
        gap: 8rem;

        .dot {
          font-weight: bold;
        }
      }
    }

    .workout-list {
      display: flex;
      flex-direction: column;
      gap: 25rem;

      .exercise-item {
        .exercise-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12rem;

          .name-area {
            display: flex;
            align-items: center;
            gap: 10rem;

            .index {
              color: #00e5ff;
              font-size: 18rem;
              font-weight: 900;
              font-family: Arial, Helvetica, sans-serif;
            }

            .name {
              color: #00e5ff;
              font-size: 16rem;
              font-weight: bold;
            }
          }

          .more-icon {
            color: #6b7280;
            font-size: 20rem;
          }
        }

        .set-table {
          background: #151515;
          border-radius: 12rem;
          padding: 15rem;

          .table-header,
          .set-row {
            display: flex;
            align-items: center;
            text-align: center;
          }

          .table-header {
            padding-bottom: 10rem;
            margin-bottom: 15rem;
            font-size: 12rem;
            color: #6b7280;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .set-row {
            margin-bottom: 12rem;

            &:last-child {
              margin-bottom: 0;
            }
          }

          .col-set {
            width: 25%;
            display: flex;
            justify-content: center;

            .set-num {
              display: inline-block;
              background: rgba(255, 255, 255, 0.1);
              padding: 4rem 12rem;
              border-radius: 6rem;
              font-size: 13rem;
              color: #fff;
              font-weight: bold;

              &.is-warmup {
                background: rgba(255, 255, 255, 0.15);
                color: #9ca3af;
                font-size: 12rem;
                padding: 4rem 8rem;
              }
            }
          }

          .col-weight,
          .col-reps {
            width: 35%;
            display: flex;
            justify-content: center;
          }

          .col-reps {
            width: 25%;
          }

          .val-box {
            background: #1f1f1f;
            color: #fff;
            width: 80%;
            padding: 8rem 0;
            text-align: center;
            border-radius: 6rem;
            font-size: 14rem;
            font-weight: bold;
          }

          .editable-input {
            border: 1px solid #333;
            outline: none;
            transition: all 0.2s;

            &:focus {
              border-color: #00e5ff;
              background: #2a2a2a;
            }
          }
        }
      }
    }
  }

  .dialog-footer {
    padding: 15rem 20rem 30rem 20rem;
    background: #0b0b0b;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    gap: 15rem;

    .btn-start {
      background: #00b0ff;
      color: #000;
      width: 100%;
      border-radius: 30rem;
      padding: 16rem 0;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8rem;
      font-size: 16rem;
      font-weight: bold;
      cursor: pointer;

      .play-icon {
        font-size: 20rem;
      }

      &:active {
        opacity: 0.8;
      }
    }

    .btn-save {
      background: rgba(255, 255, 255, 0.05);
      color: #9ca3af;
      width: 100%;
      padding: 14rem 0;
      border-radius: 30rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8rem;
      font-size: 15rem;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;

      .save-icon {
        font-size: 18rem;
      }

      &:active {
        opacity: 0.8;
      }
    }
  }
}

/* Cat Theme */
.mini-program-overlay {
  background: rgba(71, 49, 34, 0.35);
  backdrop-filter: blur(10px);
}

.mini-program-card {
  background: linear-gradient(180deg, #fffdf7 0%, #fff2df 100%);
  border-radius: 28rem 28rem 0 0;
  box-shadow: 0 -18rem 40rem rgba(116, 82, 47, 0.18);
}

.ai-workout-plan {
  background: radial-gradient(circle at top right, rgba(255, 208, 165, 0.5), transparent 22%),
    linear-gradient(180deg, #f2faef 0%, #fff7ec 100%);
  color: #6d4526;

  .header {
    border-bottom: 1px solid rgba(214, 159, 103, 0.16);
    background: rgba(255, 255, 255, 0.56);

    .title-area {
      gap: 10rem;
    }

    .cat-icon {
      width: 34rem;
      height: 34rem;
      border-radius: 50%;
      background: #d7eddc;
      padding: 4rem;
      object-fit: cover;
      flex-shrink: 0;
    }

    .title-copy {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .title {
      color: #7a4a24;
    }

    small {
      font-size: 10rem;
      color: #9d7550;
    }

    .controls {
      background: rgba(255, 240, 224, 0.72);
      border: 1px solid rgba(214, 159, 103, 0.16);

      .control-btn {
        color: #b27643;
      }

      .divider {
        background: rgba(178, 118, 67, 0.18);
      }
    }
  }

  .loading-state {
    color: #996945;

    .loading-cat {
      width: 92rem;
      height: 92rem;
      border-radius: 50%;
      object-fit: cover;
      background: #d7eddc;
      padding: 8rem;
      box-shadow: 0 14rem 28rem rgba(139, 185, 144, 0.22);
    }

    .spinner {
      border-color: rgba(169, 215, 181, 0.45);
      border-top-color: #ef9b52;
    }
  }

  .plan-header {
    margin-bottom: 22rem;
  }

  .plan-mascot-pill {
    display: inline-flex;
    align-items: center;
    gap: 8rem;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 999rem;
    padding: 6rem 12rem 6rem 6rem;
    border: 1px solid rgba(214, 159, 103, 0.16);
    margin-bottom: 12rem;
    color: #8d6038;
    font-size: 12rem;
    font-weight: 600;
  }

  .plan-mascot {
    width: 28rem;
    height: 28rem;
    border-radius: 50%;
    object-fit: cover;
    background: #d7eddc;
    padding: 3rem;
  }

  .plan-title {
    color: #7a4a24 !important;
  }

  .plan-meta {
    color: #b08a65 !important;
  }

  .exercise-header .name-area {
    .index,
    .name {
      color: #ef8f3f !important;
    }
  }

  .more-icon {
    color: #c29a71 !important;
  }

  .set-table {
    background: rgba(255, 255, 255, 0.74) !important;
    border: 1px solid rgba(214, 159, 103, 0.14);
    box-shadow: 0 10rem 24rem rgba(145, 101, 56, 0.08);
  }

  .table-header {
    color: #b08a65 !important;
    border-bottom-color: rgba(214, 159, 103, 0.12) !important;
  }

  .set-num {
    background: #fff1e0 !important;
    color: #8d6038 !important;
  }

  .val-box {
    background: #fffaf2 !important;
    color: #7a4a24 !important;
  }

  .editable-input {
    border-color: rgba(214, 159, 103, 0.18) !important;

    &:focus {
      border-color: #a9d7b5 !important;
      background: #eef8ef !important;
    }
  }

  .dialog-footer {
    background: rgba(255, 252, 248, 0.9);
    border-top-color: rgba(214, 159, 103, 0.12);

    .btn-start {
      background: linear-gradient(135deg, #ef9b52, #f4b770) !important;
      color: #55321b !important;
      box-shadow: 0 12rem 24rem rgba(227, 145, 66, 0.2);
    }

    .btn-save {
      background: rgba(169, 215, 181, 0.16) !important;
      color: #4d7a5e !important;
      border-color: rgba(169, 215, 181, 0.4) !important;
    }
  }
}
</style>
