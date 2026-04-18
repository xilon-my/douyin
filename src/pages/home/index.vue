<template>
  <div class="test-slide-wrapper" id="home-index">
    <SlideHorizontal name="first" v-model:index="state.baseIndex">
      <SlideItem class="sidebar">
        <div class="header">
          <div class="left">下午好</div>
          <div class="right" @click="nav('/home/live')">
            <Icon icon="iconamoon:scanner" />
            <span>扫一扫</span>
          </div>
        </div>
        <div class="card">
          <div class="header">
            <div class="left">常用小程序</div>
            <div class="right">
              <span>全部</span>
              <Icon icon="icon-park-outline:right" />
            </div>
          </div>
          <div class="content">
            <div class="item" @click="_no">
              <img
                class="xcx"
                src="https://lf3-static.bytednsdoc.com/obj/eden-cn/pipieh7nupabozups/toutiao_web_pc/tt-icon.png"
                alt=""
              />
              <span>今日头条</span>
            </div>
            <div class="item" @click="_no">
              <img
                class="xcx"
                src="https://gd-hbimg.huaban.com/65130a3e6a139530bb03bd118e21a2603af7df4e1303b-OOzcBu_fw658webp"
                alt=""
              />
              <span>西瓜视频</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="header">
            <div class="left">最近常看</div>
            <div class="right">
              <span>全部</span>
              <Icon icon="icon-park-outline:right" />
            </div>
          </div>
          <div class="content">
            <div class="item avatar" @click="_no" :key="i" v-for="i in 6">
              <img
                src="https://img.tol.vip/avatar/WEIXIN/3aSuTGYTzjHvcHy0y0tH1eiShKRk9Sgd.jpg?_upt=de4a5c251709635127"
              />
              <span>随机名字</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="header">
            <div class="left">常用功能</div>
            <div class="right"></div>
          </div>
          <div class="content">
            <div class="item" @click="_no">
              <Icon icon="ion:wallet-outline" />
              <span>我的钱包</span>
            </div>
            <div class="item" @click="_no">
              <Icon icon="mingcute:coupon-line" />
              <span>券包</span>
            </div>
            <div class="item" @click="_no">
              <Icon icon="icon-park-outline:bytedance-applets" />
              <span>小程序</span>
            </div>
            <div class="item" @click="_no">
              <Icon icon="solar:history-linear" />
              <span>观看历史</span>
            </div>
            <div class="item" @click="_no">
              <Icon icon="fluent:content-settings-24-regular" />
              <span>内容偏好</span>
            </div>
            <div class="item" @click="_no">
              <Icon icon="iconoir:cloud-download" />
              <span>离线模式</span>
            </div>
            <div class="item" @click="_no">
              <Icon icon="ep:setting" />
              <span>设置</span>
            </div>
            <div class="item" @click="_no">
              <Icon icon="icon-park-outline:baggage-delay" />
              <span>稍后再看</span>
            </div>
          </div>
        </div>
      </SlideItem>
      <SlideItem>
        <IndicatorHome
          v-if="!state.fullScreen"
          :loading="baseStore.loading"
          name="second"
          @showSlidebar="state.baseIndex = 0"
          v-model:index="state.navIndex"
        />
        <SlideHorizontal
          class="first-horizontal-item"
          name="second"
          :change-active-index-use-anim="false"
          v-model:index="state.navIndex"
        >
          <!--          <SlideItem></SlideItem>-->
          <Slide0 :active="state.navIndex === 0 && state.baseIndex === 1" />
          <SlideItem>
            <LongVideo :active="state.navIndex === 1 && state.baseIndex === 1" />
          </SlideItem>
          <!--          <SlideItem></SlideItem>-->
          <Slide2 :active="state.navIndex === 2 && state.baseIndex === 1" />
          <SlideItem>
            <Community :active="state.navIndex === 3 && state.baseIndex === 1" />
          </SlideItem>
          <Slide4 :active="state.navIndex === 4 && state.baseIndex === 1" />
        </SlideHorizontal>

        <BaseFooter v-bind:init-tab="1" />
        <BaseMask
          v-if="state.baseIndex === 0"
          @click="state.baseIndex = 1"
          mode="white"
          style="position: absolute"
        />
      </SlideItem>
      <SlideItem>
        <UserPanel
          ref="uploader"
          v-model:currentItem="state.currentItem"
          :active="state.baseIndex === 2"
          @toggleCanMove="(e) => (state.canMove = e)"
          @back="state.baseIndex = 1"
          @showFollowSetting="state.showFollowSetting = true"
          @showFollowSetting2="state.showFollowSetting2 = true"
        />
      </SlideItem>
    </SlideHorizontal>

    <Comment
      page-id="home-index"
      :video-id="state.currentItem.aweme_id"
      v-model="state.commentVisible"
      @close="closeComments"
    />

    <Share
      v-model="state.isSharing"
      ref="share"
      page-id="home-index"
      @dislike="dislike"
      :item="state.currentItem"
      :videoId="state.recommendList[state.itemIndex]?.id"
      :canDownload="state.recommendList[state.itemIndex]?.canDownload"
      @play-feedback="state.showPlayFeedback = true"
      @aiExtractPlan="state.showAIWorkoutPlan = true"
      @shareToFriend="delayShowDialog(() => (state.shareToFriend = true))"
      @showDouyinCode="state.showDouyinCode = true"
      @download="state.shareType = 9"
    />

    <PlayFeedback v-model="state.showPlayFeedback" />

    <DouyinCode :item="state.currentItem" v-model="state.showDouyinCode" />

    <ShareTo
      v-model:type="state.shareType"
      :videoId="state.recommendList[state.itemIndex]?.id"
      :canDownload="state.recommendList[state.itemIndex]?.canDownload"
    />

    <FollowSetting
      v-model:currentItem="state.currentItem"
      @showChangeNote="delayShowDialog((e) => (state.showChangeNote = true))"
      @showBlockDialog="delayShowDialog((e) => (state.showBlockDialog = true))"
      @showShare="delayShowDialog((e) => (state.isSharing = true))"
      v-model="state.showFollowSetting"
    />

    <FollowSetting2
      v-model:currentItem="state.currentItem"
      @cancelFollow="uploader.cancelFollow()"
      v-model="state.showFollowSetting2"
    />

    <BlockDialog v-model="state.showBlockDialog" />

    <ConfirmDialog title="设置备注名" ok-text="确认" v-model:visible="state.showChangeNote">
      <Search mode="light" v-model="state.test" :isShowSearchIcon="false" />
    </ConfirmDialog>

    <AIWorkoutPlanDialog
      v-model="state.showAIWorkoutPlan"
      :video-item="state.currentItem"
      @start-training="
        (plan) => {
          state.currentTrainingPlan = plan
          state.showActiveTraining = true
        }
      "
    />

    <ActiveTrainingView
      v-show="state.showActiveTraining || state.isTrainingMinimized || state.hasIgnoredRestCard"
      v-model="state.showActiveTraining"
      :minimized="state.isTrainingMinimized || state.hasIgnoredRestCard"
      :training-plan="state.currentTrainingPlan"
      @clear-training-plan="
        () => {
          state.currentTrainingPlan = null
          state.isTrainingMinimized = false
          state.hasIgnoredRestCard = false
        }
      "
      @minimize="handleMinimizeTraining"
      @rest-tick="(val) => (state.restTimeLeft = val)"
      @rest-finished="handleRestFinished"
    />

    <!-- Floating Timer for when user goes back to brushing videos -->
    <div
      class="floating-rest-timer"
      v-if="state.isTrainingMinimized && !state.hasIgnoredRestCard"
      @click="restoreTraining"
    >
      <Icon icon="mdi:cat" />
      <span>哈肌咪提醒 {{ state.restTimeLeft }}s</span>
    </div>

    <ShareToFriend v-model="state.shareToFriend" />

    <BaseMask v-if="!isMobile" @click="isMobile = true" />
    <div v-if="!isMobile" class="guide">
      <Icon class="danger" icon="mynaui:danger-triangle" />
      <Icon class="close" icon="simple-line-icons:close" @click="isMobile = true" />
      <div class="txt">
        <h2>切换至手机模式获取最佳体验</h2>
        <h3>1. 按 F12 调出控制台</h3>
        <h3>2. 按 Ctrl+Shift+M，或点击下面图标</h3>
      </div>
      <img src="@/assets/img/guide.png" alt="" />
    </div>
  </div>
</template>

<script setup lang="tsx">
import SlideHorizontal from '@/components/slide/SlideHorizontal.vue'
import SlideItem from '@/components/slide/SlideItem.vue'
import Comment from '../../components/Comment.vue'
import Share from '../../components/Share.vue'
import IndicatorHome from './components/IndicatorHome.vue'
import { onActivated, onDeactivated, onMounted, onUnmounted, reactive, ref } from 'vue'
import bus, { EVENT_KEY } from '../../utils/bus'
import { useNav } from '@/utils/hooks/useNav'
import PlayFeedback from '@/pages/home/components/PlayFeedback.vue'
import ShareTo from '@/pages/home/components/ShareTo.vue'
import DouyinCode from '../../components/DouyinCode.vue'
import FollowSetting from '@/pages/home/components/FollowSetting.vue'
import BlockDialog from '../message/components/BlockDialog.vue'
import Search from '../../components/Search.vue'
import ConfirmDialog from '../../components/dialog/ConfirmDialog.vue'
import FollowSetting2 from '@/pages/home/components/FollowSetting2.vue'
import ShareToFriend from '@/pages/home/components/ShareToFriend.vue'
import AIWorkoutPlanDialog from '@/components/AIWorkoutPlanDialog.vue'
import ActiveTrainingView from '@/components/ActiveTrainingView.vue'
import UserPanel from '@/components/UserPanel.vue'
import Community from '@/pages/home/slide/Community.vue'
import Slide0 from '@/pages/home/slide/Slide0.vue'
import Slide2 from '@/pages/home/slide/Slide2.vue'
import Slide4 from '@/pages/home/slide/Slide4.vue'
import { DefaultUser } from '@/utils/const_var'
import { _no } from '@/utils'
import LongVideo from '@/pages/home/slide/LongVideo.vue'
import { useBaseStore } from '@/store/pinia'
import BaseMask from '@/components/BaseMask.vue'

const nav = useNav()
const baseStore = useBaseStore()
const uploader = ref()
const isMobile = ref(/Mobi|Android|iPhone/i.test(navigator.userAgent))
const reminderStrategy = reactive({
  seenVideoIds: new Set<string>(),
  viewedVideoCount: 0,
  lastReminderAtCount: 0,
  reminderShownCount: 0,
  maxReminderCount: 2,
  minVideosBeforeFirstReminder: 6,
  minGapBetweenReminders: 10
})

const state = reactive({
  active: true,
  baseIndex: 1,
  navIndex: 4,
  itemIndex: 0,
  test: '',
  recommendList: [],
  isSharing: false,
  canMove: true,
  shareType: -1,
  showPlayFeedback: false,
  showShareDuoshan: false,
  showShareDialog: false,
  showShare2WeChatZone: false,
  showDouyinCode: false,
  showFollowSetting: false,
  showFollowSetting2: false,
  showBlockDialog: false,
  showChangeNote: false,
  shareToFriend: false,
  showAIWorkoutPlan: false,
  showActiveTraining: false,
  currentTrainingPlan: null,
  isTrainingMinimized: false,
  restTimeLeft: 0,

  commentVisible: false,
  fullScreen: false,
  currentItem: {
    aweme_id: '',
    author: DefaultUser,
    isRequest: false,
    aweme_list: []
  },
  hasIgnoredRestCard: false // Track if user scrolled past the rest card
})

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

function getCompletedWeeklyCalories() {
  return (baseStore.trainingHistory || [])
    .filter((record: any) => isThisWeek(record.date))
    .reduce((sum: number, record: any) => sum + Number(record.calories || 0), 0)
}

function buildWeeklyReminderCard() {
  const targetCalories = Number(baseStore.fitnessProfile.targetCalories || 0)
  const completedCalories = getCompletedWeeklyCalories()
  const remainingCalories = Math.max(0, targetCalories - completedCalories)

  return {
    type: 'ai-card',
    id: 'ai_card_dynamic_' + Date.now(),
    author: {
      uid: 'ai_system',
      nickname: 'AI助手',
      unique_id: 'ai_assistant',
      avatar_168x168: { url_list: [] },
      avatar_300x300: { url_list: [] },
      cover_url: [{ url_list: [] }],
      white_cover_url: [{ url_list: [] }]
    },
    aiCard: {
      title: '哈肌咪周计划提醒',
      bgImg:
        'https://img.zcool.cn/community/01d9f45c92d50ba801214168c4a0df.jpg@1280w_1l_2o_100sh.jpg',
      routes: [
        { name: `周目标 ${targetCalories} 千卡` },
        { name: `还差 ${remainingCalories} 千卡` }
      ]
    }
  }
}

function shouldInjectWeeklyReminder(item: any) {
  if (!item || item.type !== 'recommend-video') return false
  if (state.showActiveTraining || state.isTrainingMinimized || state.hasIgnoredRestCard)
    return false

  const targetCalories = Number(baseStore.fitnessProfile.targetCalories || 0)
  if (!targetCalories) return false

  const completedCalories = getCompletedWeeklyCalories()
  if (completedCalories >= targetCalories) return false

  if (reminderStrategy.reminderShownCount >= reminderStrategy.maxReminderCount) return false
  if (reminderStrategy.viewedVideoCount < reminderStrategy.minVideosBeforeFirstReminder)
    return false

  if (
    reminderStrategy.reminderShownCount > 0 &&
    reminderStrategy.viewedVideoCount - reminderStrategy.lastReminderAtCount <
      reminderStrategy.minGapBetweenReminders
  ) {
    return false
  }

  return true
}

function maybeInjectWeeklyReminder(item: any) {
  if (!shouldInjectWeeklyReminder(item)) return

  reminderStrategy.lastReminderAtCount = reminderStrategy.viewedVideoCount
  reminderStrategy.reminderShownCount++
  bus.emit('INJECT_FEED_ITEM', buildWeeklyReminderCard())
}

function delayShowDialog(cb: Function) {
  setTimeout(cb, 400)
}

function setCurrentItem(item) {
  if (!state.active) return
  // console.log('sss',item,state.baseIndex)
  if (state.baseIndex !== 1) return
  if (state.currentItem.author?.uid !== item.author?.uid) {
    state.currentItem = {
      ...item,
      isRequest: false,
      aweme_list: []
    }
  }

  const currentKey = String(item.id || item.aweme_id || '')
  if (
    item.type === 'recommend-video' &&
    currentKey &&
    !reminderStrategy.seenVideoIds.has(currentKey)
  ) {
    reminderStrategy.seenVideoIds.add(currentKey)
    reminderStrategy.viewedVideoCount++
    maybeInjectWeeklyReminder(item)
  }

  // Detect if the user scrolled past the rest-finish-card
  if (item.type !== 'rest-finish-card' && state.hasIgnoredRestCard) {
    state.hasIgnoredRestCard = false
    // Restart the rest cycle silently by telling the training view to start a short timer
    if (state.showActiveTraining) {
      bus.emit('RESTART_REST_TIMER', 10) // 10 seconds again for demo
      state.isTrainingMinimized = true
    }
  } else if (item.type === 'rest-finish-card') {
    // User is currently looking at the rest card
    state.hasIgnoredRestCard = true

    // 我们必须保证组件处于激活状态，但又不能挡住底下的视频
    // 这已经在 <ActiveTrainingView> 的内部通过 props.minimized 处理了透明度 opacity: 0
    state.showActiveTraining = true
  }
  // console.log('item', item)
}

onMounted(() => {
  bus.on(EVENT_KEY.ENTER_FULLSCREEN, () => {
    if (!state.active) return
    state.fullScreen = true
  })
  bus.on(EVENT_KEY.EXIT_FULLSCREEN, () => {
    if (!state.active) return
    state.fullScreen = false
  })
  bus.on(EVENT_KEY.OPEN_COMMENTS, () => {
    if (!state.active) return
    bus.emit(EVENT_KEY.ENTER_FULLSCREEN)
    state.commentVisible = true
  })
  bus.on(EVENT_KEY.CLOSE_COMMENTS, () => {
    if (!state.active) return
    bus.emit(EVENT_KEY.EXIT_FULLSCREEN)
    state.commentVisible = false
  })
  bus.on(EVENT_KEY.SHOW_SHARE, () => {
    if (!state.active) return
    state.isSharing = true
  })
  bus.on(EVENT_KEY.NAV, ({ path, query }) => {
    if (!state.active) return
    nav(path, query)
  })
  bus.on(EVENT_KEY.GO_USERINFO, () => {
    if (!state.active) return
    state.baseIndex = 2
  })
  bus.on(EVENT_KEY.CURRENT_ITEM, setCurrentItem)
  bus.on('RESTORE_TRAINING', () => {
    restoreTraining()
  })
  bus.on('OPEN_TRAINING_FROM_REMINDER', () => {
    openTrainingFromReminder()
  })
  bus.on('START_TRAINING_FROM_HISTORY', (plan) => {
    state.currentTrainingPlan = plan
    state.showActiveTraining = true
    state.isTrainingMinimized = false
    state.hasIgnoredRestCard = false
  })
})

onUnmounted(() => {
  bus.offAll()
})

onActivated(() => {
  state.active = true
  bus.emit(EVENT_KEY.TOGGLE_CURRENT_VIDEO)

  if (baseStore.pendingTrainingPlan) {
    state.currentTrainingPlan = baseStore.pendingTrainingPlan
    state.showActiveTraining = true
    state.isTrainingMinimized = false
    baseStore.setPendingTrainingPlan(null)
  } else if (baseStore.forceShowTraining) {
    // Show empty training view if forced
    state.currentTrainingPlan = null
    state.showActiveTraining = true
    state.isTrainingMinimized = false
    baseStore.setForceShowTraining(false)
  }
})

onDeactivated(() => {
  state.active = false
  bus.emit(EVENT_KEY.TOGGLE_CURRENT_VIDEO)
})

function closeComments() {
  bus.emit(EVENT_KEY.CLOSE_COMMENTS)
}

function dislike() {
  // listRef.value.dislike(state.list[1])
  // state.list[state.index] = state.list[1]
  // _notice('操作成功，将减少此类视频的推荐')
}

function handleMinimizeTraining() {
  state.isTrainingMinimized = true
}

function handleRestFinished() {
  // 当用户处于最小化状态（在刷视频）时，才注入弹出的休息结束卡片并强制跳转
  if (state.isTrainingMinimized) {
    bus.emit('INJECT_FEED_ITEM', {
      type: 'rest-finish-card',
      id: 'rest_card_' + Date.now(),
      author: { uid: 'ai_system' }
    })

    // 隐藏悬浮球，因为我们要强制滑动去看卡片了
    state.isTrainingMinimized = false

    // 自动滑向弹出的休息结束卡片
    setTimeout(() => {
      bus.emit('SCROLL_TO_NEXT_VIDEO')
    }, 100)
  }
}

function restoreTraining() {
  state.isTrainingMinimized = false
  state.hasIgnoredRestCard = false
  state.showActiveTraining = true
  bus.emit('TRAINING_RESTORED')
}

function openTrainingFromReminder() {
  state.isTrainingMinimized = false
  state.hasIgnoredRestCard = false
  state.showActiveTraining = true
}
</script>

<style scoped lang="less">
.test-slide-wrapper {
  font-size: 14rem;
  width: 100%;
  height: 100%;
  background: black;
  overflow: hidden;

  .sidebar {
    touch-action: pan-y;
    width: 80%;
    height: calc(var(--vh, 1vh) * 100);
    overflow: auto;
    background: rgb(22, 22, 22);
    padding: 10rem;
    padding-bottom: 20rem;
    box-sizing: border-box;

    & > .header {
      font-size: 16rem;
      display: flex;
      color: white;
      justify-content: space-between;
      align-items: center;

      .right {
        border-radius: 20rem;
        padding: 8rem 15rem;
        background: rgb(36, 36, 36);
        display: flex;
        align-items: center;
        font-size: 14rem;
        gap: 10rem;

        svg {
          font-size: 18rem;
        }
      }
    }

    .card {
      margin-top: 10rem;
      border-radius: 12rem;
      padding: 15rem;
      background: rgb(29, 29, 29);

      .header {
        margin-bottom: 8rem;
        font-size: 14rem;
        display: flex;
        color: white;
        justify-content: space-between;
        align-items: center;

        .right {
          display: flex;
          align-items: center;
          font-size: 12rem;
          gap: 4rem;
          color: gray;

          svg {
            font-size: 16rem;
          }
        }
      }

      .content {
        color: white;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;

        .item {
          min-height: 20vw;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 14rem;
          gap: 8rem;

          svg {
            font-size: 28rem;
          }

          .xcx {
            border-radius: 12rem;
            width: 50rem;
            height: 50rem;
          }
        }

        .avatar {
          height: 25vw;

          img {
            border-radius: 50%;
            width: 50rem;
          }
        }
      }
    }
  }

  .slide-content {
    width: 100%;
    height: 100%;
  }
}

.first-horizontal-item {
  //width: 90vw;
  //height: 80vh;
  width: 100%;
  height: calc(var(--vh, 1vh) * 100 - var(--footer-height)) !important;
  overflow: hidden;
  border-radius: 10rem;
}

.guide {
  color: white;
  z-index: 999;
  background: var(--active-main-bg);
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 16rem;
  overflow: hidden;
  text-align: center;

  .danger {
    margin-top: 10rem;
    font-size: 40rem;
    color: red;
  }

  .close {
    cursor: pointer;
    font-size: 18rem;
    color: white;
    position: absolute;
    right: 15rem;
    top: 15rem;
  }

  .txt {
    text-align: left;
    padding: 0 24rem;
  }

  img {
    display: block;
    width: 350rem;
  }
}

.floating-rest-timer {
  position: fixed;
  bottom: 80rem;
  right: 20rem;
  background: linear-gradient(135deg, rgba(255, 244, 230, 0.96), rgba(235, 248, 238, 0.96));
  border: 1px solid rgba(239, 155, 82, 0.4);
  color: #8b5a2b;
  padding: 10rem 16rem;
  border-radius: 999rem;
  display: flex;
  align-items: center;
  gap: 7rem;
  font-size: 14rem;
  font-weight: bold;
  z-index: 1000;
  backdrop-filter: blur(8px);
  box-shadow: 0 12rem 22rem rgba(191, 130, 72, 0.18);
  cursor: pointer;
  animation: pulse 2s infinite;

  svg {
    font-size: 18rem;
    color: #ef9b52;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
