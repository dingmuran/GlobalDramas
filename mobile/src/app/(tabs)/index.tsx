import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { Placeholder } from '@/components/Placeholder';
import { colors } from '@/theme';

export default function HomeScreen() {
  return (
    <Screen title="好故事，随时开始" subtitle="App 开发预览 · 首页基础布局">
      <Placeholder icon="film-outline" title="精选短剧" description="后续接入精选轮播、最新发布与热播榜单。" />
      <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/drama/[id]', params: { id: 'preview' } })} style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}>
        <Text style={styles.label}>查看播放页骨架</Text>
      </Pressable>
    </Screen>
  );
}
const styles = StyleSheet.create({
  button: { minHeight: 52, backgroundColor: colors.accent, borderRadius: 16, justifyContent: 'center', alignItems: 'center', padding: 16 },
  pressed: { opacity: 0.75 },
  label: { color: colors.background, fontSize: 16, fontWeight: '700' },
});
