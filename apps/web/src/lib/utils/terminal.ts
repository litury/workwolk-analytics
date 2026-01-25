/**
 * Terminal-specific utility components and functions
 */

interface ProgressBarProps {
  value: number
  max: number
  width?: number
  showPercentage?: boolean
}

/**
 * Generate ASCII progress bar
 * @param value Current value
 * @param max Maximum value
 * @param width Width in characters (default: 20)
 * @param showPercentage Whether to show percentage (default: true)
 * @returns ASCII progress bar string
 */
export function ProgressBar({ value, max, width = 20, showPercentage = true }: ProgressBarProps): string {
  const percentage = max === 0 ? 0 : (value / max) * 100
  const filled = Math.round((value / max) * width)
  const empty = width - filled

  const filledBar = '█'.repeat(Math.max(0, filled))
  const emptyBar = '░'.repeat(Math.max(0, empty))

  const bar = `[${filledBar}${emptyBar}]`

  if (showPercentage) {
    return `${bar} ${percentage.toFixed(1)}%`
  }

  return bar
}

interface StatusTreeItem {
  label: string
  value: string
}

/**
 * Generate ASCII tree structure for status display
 * @param items Array of label-value pairs
 * @returns Array of formatted tree lines
 */
export function createStatusTree(items: StatusTreeItem[]): string[] {
  if (items.length === 0) return []

  return items.map((item, index) => {
    const isLast = index === items.length - 1
    const prefix = isLast ? '└─' : '├─'
    return `${prefix} ${item.label}: ${item.value}`
  })
}

// Note: For a React component version of ProgressBar,
// create a separate component file that renders the string returned by ProgressBar()
