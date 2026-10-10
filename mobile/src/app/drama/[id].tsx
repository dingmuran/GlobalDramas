import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export default function DramaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
      <View style={styles.stage}>
        <Ionicons name="play-circle-outline" size={72} color={colors.accent} />
        <Text accessibilityRole="header" style={styles.title}>竖屏播放器</Text>
        <Text style={styles.description}>后续接入视频播放、上下滑动切集与选集面板</Text>
      </View>
      <Text style={styles.caption}>{id === 'preview' ? '播放页开发预览' : `剧集 ID：${id}`}</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 24, gap: 16 },
  stage: { flex: 1, backgroundColor: colors.surface, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 24, textAlign: 'center' },
  caption: { color: colors.muted, textAlign: 'center', fontSize: 13 },
});
