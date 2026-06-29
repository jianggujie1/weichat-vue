/**
 * 生成小时选项 [00-23]
 */
export const hours: string[] = Array.from(
  { length: 24 },
  (_, i) => String(i).padStart(2, "0")
)

/**
 * 生成分钟选项 [00-59]
 */
export const minutes: string[] = Array.from(
  { length: 60 },
  (_, i) => String(i).padStart(2, "0")
)

/**
 * 生成年份选项 [2030-2070]
 */
export const years: number[] = Array.from({ length: 41 }, (_, i) => 2030 + i)

/**
 * 生成日期选项 [1-31]
 */
export const days: number[] = Array.from({ length: 31 }, (_, i) => i + 1)

/**
 * 星期选项
 */
export const weekdays = [
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
  "星期日",
  "昨天",
] as const

/**
 * 时段选项
 */
export const timePeriods = ["上午", "下午", "凌晨"] as const

/**
 * 信号格数选项
 */
export const signalLevels = [1, 2, 3, 4] as const

/**
 * WiFi 信号选项
 */
export const wifiSingles = [1, 2, 3] as const

/**
 * 网络类型选项
 */
export const networkTypes = [
  { value: 1, label: "WiFi" },
  { value: 2, label: "3G" },
  { value: 3, label: "4G" },
  { value: 4, label: "5G" },
] as const