/**
 * Unified Apple HIG chart theme tokens for Chart.js visualizations.
 * Harmonizes data series colors and chrome with the cool-neutral Porcelain / Space Black palette
 * while maintaining crisp readability in both light and dark modes.
 */

export interface EditorialChartPalette {
  text: string
  mutedText: string
  grid: string
  tooltipBg: string
  tooltipTitle: string
  tooltipBody: string
  tooltipBorder: string
  series: readonly string[]
  semantic: {
    input: string
    output: string
    cacheCreation: string
    cacheRead: string
    cacheHitRate: string
  }
}

const LIGHT_SERIES = [
  '#0071E3', // Apple Blue
  '#248A3D', // Apple Accessible Green
  '#D97706', // Apple Amber Orange
  '#5856D6', // Apple Indigo
  '#008B9A', // Apple Teal
  '#AF52DE', // Apple Purple
  '#D70040', // Apple Crimson Pink
  '#6E6E73', // Apple Graphite
] as const

const DARK_SERIES = [
  '#2997FF', // Apple Dark Blue
  '#30D158', // Apple Dark Green
  '#FF9F0A', // Apple Dark Orange
  '#7D7AFF', // Apple Dark Indigo
  '#40C8E0', // Apple Dark Teal
  '#BF5AF2', // Apple Dark Purple
  '#FF375F', // Apple Dark Pink
  '#98989D', // Apple Dark Gray
] as const

export function getEditorialChartPalette(isDark: boolean): EditorialChartPalette {
  const series = isDark ? DARK_SERIES : LIGHT_SERIES
  return {
    text: isDark ? '#E5E5EA' : '#3A3A3C',
    mutedText: isDark ? '#98989D' : '#636368',
    grid: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.07)',
    tooltipBg: isDark ? '#2C2C2E' : '#1D1D1F',
    tooltipTitle: '#F5F5F7',
    tooltipBody: '#D1D1D6',
    tooltipBorder: isDark ? '#48484A' : '#3A3A3C',
    series,
    semantic: {
      input: series[0],
      output: series[1],
      cacheCreation: series[2],
      cacheRead: series[4],
      cacheHitRate: series[3],
    },
  }
}

export function getEditorialChartFontFamily(): string {
  return "-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans Variable', 'PingFang SC', 'Microsoft YaHei', sans-serif"
}
