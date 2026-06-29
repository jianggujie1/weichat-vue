// 对话类型
export type DialogType = 'text' | 'image' | 'voice' | 'notice' | 'redpacket' | 'transfer'

// 对话项接口
export interface Dialog {
  id: number
  type: DialogType
  user_id?: number
  is_me: boolean
  is_get: boolean
  isread: string
  time: number
  image: string
  content: string
  money: number
  remark: string
  is_system: boolean
  is_emoji?: boolean
}

// 用户接口
export interface User {
  id?: string
  name: string
  image: string
  is_me: boolean
  selected: boolean
}

// 状态栏配置
export interface PhoneConfig {
  single: number
  wifi: number
  wifi_single: number
  time_hour: string
  time_mini: string
  battery_charge: number
  battery_amount: number
  ear: number
}

// 设置配置
export interface SettingConfig {
  message: number
  title: string
  voice: number
  background: string
  date_year: string
  date_month: string
  date_day: string
  date_xinqi: string
  date_shiduan: string
  date_hour: string
  date_min: string
  dialog_content: string
  dialog_money: number
  dialog_voice: number
  dialog_voice_isread: string
  dialog_repacket_remark: string
  dialog_trans_remark: string
  customEmojis: string[]
}

// 表情项
export interface EmojiItem {
  id: number
  url: string
  emoji: string
}