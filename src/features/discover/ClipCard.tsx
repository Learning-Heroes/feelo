import { Text, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import type { ClipCardData } from '@/features/discover/discoverMock'

// Fixed UI label; moves to i18n once the app has it.
const CLIP_BADGE = 'CLIP'

interface ClipCardProps {
  clip: ClipCardData
}

export function ClipCard({ clip }: ClipCardProps) {
  return (
    <View testID="clip-card" style={styles.card} accessible accessibilityLabel={clip.title}>
      <View testID="clip-area" style={styles.clipArea}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{CLIP_BADGE}</Text>
        </View>
        <View style={styles.duration}>
          <Text style={styles.durationText}>{clip.durationLabel}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${clip.progress * 100}%` }]} />
        </View>
      </View>

      <Text testID="clip-title" style={styles.title} numberOfLines={2} ellipsizeMode="tail">
        {clip.title}
      </Text>

      <View testID="clip-tags" style={styles.chipRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{clip.type}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{clip.genre}</Text>
        </View>
      </View>

      {clip.platforms.length > 0 && (
        <View testID="clip-platforms" style={styles.chipRow}>
          {clip.platforms.map((platform) => (
            <View key={platform.name} style={styles.chip}>
              <View style={[styles.platformDot, { backgroundColor: platform.color }]} />
              <Text style={styles.chipText}>{platform.name}</Text>
            </View>
          ))}
        </View>
      )}

      <Text testID="clip-description" style={styles.description}>
        {clip.description}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    width: '100%',
    maxWidth: theme.layout.cardMaxWidth,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderRadius: theme.radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surface,
  },
  clipArea: {
    aspectRatio: theme.layout.clipAspectRatio,
    overflow: 'hidden',
    borderRadius: theme.radius.card - theme.spacing.md,
    backgroundColor: theme.colors.clipPlaceholder,
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.violeta,
  },
  badgeText: {
    ...theme.typography.label,
    color: theme.colors.noche,
  },
  duration: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.md + theme.layout.progressHeight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.scrim,
  },
  durationText: {
    ...theme.typography.label,
    color: theme.colors.texto1,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: theme.layout.progressHeight,
    backgroundColor: theme.colors.track,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.violeta,
  },
  title: {
    ...theme.typography.title,
    paddingHorizontal: theme.spacing.sm,
    color: theme.colors.texto1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.chip,
  },
  chipText: {
    ...theme.typography.label,
    color: theme.colors.texto1,
  },
  platformDot: {
    width: theme.layout.platformDot,
    height: theme.layout.platformDot,
    borderRadius: theme.radius.pill,
  },
  description: {
    ...theme.typography.body,
    paddingHorizontal: theme.spacing.sm,
    color: theme.colors.texto2,
  },
}))
