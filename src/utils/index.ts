/**
 * 工具函数库
 */

/**
 * 格式化金额
 */
export function moneyFormat(
  num: number,
  dec: number = 2,
  thou: string = ",",
  trim: boolean = false
): string {
  num = parseFloat(String(num)) || 0
  const s = num.toFixed(dec).split(".")
  s[0] = s[0].replace(
    new RegExp(`(-?\\d+)(\\d{${3}})(?=\\d)`, "g"),
    `$1${thou}$2`
  )
  return trim ? s.join(".") : s.join(thou + "0".repeat(dec - s[1].length))
}

/**
 * 计算语音条宽度
 */
export function getVoiceLength(time: number): number {
  return Math.max(1, parseInt(String(time)) || 1) * 12
}

/**
 * 文件读取为 DataURL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>()
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result as string)
  reader.onerror = reject
  reader.readAsDataURL(file)
  return promise
}