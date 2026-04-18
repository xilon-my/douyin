import { defineStore } from 'pinia'
import { friends, panel } from '@/api/user'
import enums from '@/utils/enums'
import resource from '@/assets/data/resource'

export const useBaseStore = defineStore('base', {
  state: () => {
    return {
      bodyHeight: document.body.clientHeight,
      bodyWidth: document.body.clientWidth,
      maskDialog: false,
      maskDialogMode: 'dark',
      version: '17.1.0',
      excludeNames: [],
      judgeValue: 20,
      homeRefresh: 60,
      loading: false,
      routeData: null,
      users: [],
      userinfo: {
        nickname: '',
        desc: '',
        user_age: '',
        signature: '',
        unique_id: '',
        province: '',
        city: '',
        gender: '',
        school: {
          name: '',
          department: null,
          joinTime: null,
          education: null,
          displayType: enums.DISPLAY_TYPE.ALL
        },
        avatar_168x168: {
          url_list: []
        },
        avatar_300x300: {
          url_list: []
        },
        cover_url: [
          {
            url_list: []
          }
        ],
        white_cover_url: [
          {
            url_list: []
          }
        ]
      },
      friends: resource.users,
      message: '',
      pendingTrainingPlan: null,
      fitnessProfile: {
        height: null,
        weight: null,
        age: null,
        gender: 1, // 1: male, 2: female
        targetCalories: 2500 // Now represents weekly target in kcal
      },
      trainingHistory: [], // [{ date: '2023-10-27', title: '...', duration: 1800, calories: 120 }]
      savedPlans: [], // List of workout plans saved to history
      forceShowTraining: false
    }
  },
  getters: {
    selectFriends() {
      return this.friends.all.filter((v) => v.select)
    }
  },
  actions: {
    async init() {
      const r = await panel()
      if (r.success) {
        this.userinfo = Object.assign(this.userinfo, r.data)
      }
      const r2 = await friends()
      if (r2.success) {
        this.users = r2.data
      }
    },
    setUserinfo(val) {
      this.userinfo = val
    },
    setMaskDialog(val) {
      this.maskDialog = val.state
      if (val.mode) {
        this.maskDialogMode = val.mode
      }
    },
    setPendingTrainingPlan(val) {
      this.pendingTrainingPlan = val
    },
    setForceShowTraining(val) {
      this.forceShowTraining = val
    },
    setFitnessProfile(val) {
      this.fitnessProfile = Object.assign(this.fitnessProfile, val)
    },
    addTrainingRecord(record) {
      this.trainingHistory.push(record)
    },
    savePlan(plan) {
      // Prevent duplicates based on title
      if (!this.savedPlans.find((p) => p.title === plan.title)) {
        this.savedPlans.unshift(plan)
      }
    },
    updateExcludeNames(val) {
      if (val.type === 'add') {
        if (!this.excludeNames.find((v) => v === val.value)) {
          this.excludeNames.push(val.value)
        }
      } else {
        const resIndex = this.excludeNames.findIndex((v) => v === val.value)
        if (resIndex !== -1) {
          this.excludeNames.splice(resIndex, 1)
        }
      }
      // console.log('store.excludeNames', store.excludeNames,val)
    }
  }
})
