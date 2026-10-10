import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export function Screen({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>Gload Dramas</Text>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 24, paddingBottom: 40 },
  brand: { color: colors.accent, fontSize: 20, fontWeight: '700' },
  heading: { gap: 10 },
  title: { color: colors.text, fontSize: 32, fontWeight: '700' },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 24 },
});
