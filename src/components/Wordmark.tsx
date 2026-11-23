import { Text, View } from 'react-native'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

// No i18n yet (Decision 001).
const LABEL = 'Feelo'
const TEXT = 'feel'
const GRADIENT_ID = 'wordmark-orb-gradient'

const HIDDEN = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const

const percent = (fraction: number) => `${fraction * 100}%`

// Brand wordmark: the text `feel` followed by a glowing orb. One accessible header named
// `Feelo`; its children are hidden so a screen reader doesn't read `feel`.
export function Wordmark() {
  const { theme } = useUnistyles()
  const { fontSize, orbSize, orbCenter, orbStops } = theme.wordmark
  const size = fontSize * orbSize
  const [cx, cy] = orbCenter
  // CSS `radial-gradient(circle at …)` reaches the farthest corner by default.
  const radius = Math.hypot(Math.max(cx, 1 - cx), Math.max(cy, 1 - cy))

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={LABEL}
      style={styles.row}
    >
      <Text {...HIDDEN} style={styles.text}>
        {TEXT}
      </Text>
      <View {...HIDDEN} testID="wordmark-orb" style={styles.orb}>
        <Svg width={size} height={size} viewBox="0 0 1 1">
          <Defs>
            <RadialGradient id={GRADIENT_ID} cx={percent(cx)} cy={percent(cy)} r={percent(radius)}>
              {orbStops.map(([offset, color]) => (
                <Stop key={offset} offset={offset} stopColor={color} />
              ))}
            </RadialGradient>
          </Defs>
          <Circle cx={0.5} cy={0.5} r={0.5} fill={`url(#${GRADIENT_ID})`} />
        </Svg>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: {
    fontFamily: theme.fonts.extrabold,
    fontSize: theme.wordmark.fontSize,
    letterSpacing: theme.wordmark.letterSpacing,
    lineHeight: theme.wordmark.fontSize,
    color: theme.colors.texto1,
  },
  orb: {
    marginLeft: theme.wordmark.fontSize * theme.wordmark.orbGap,
    transform: [{ translateY: theme.wordmark.fontSize * theme.wordmark.orbDrop }],
    shadowColor: theme.wordmark.glow.color,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: theme.wordmark.fontSize * theme.wordmark.glow.radius,
  },
}))
