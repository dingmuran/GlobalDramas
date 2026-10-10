import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

type Props = { title: string; description: string; icon: React.ComponentProps<typeof Ionicons>['name'] };
export function Placeholder({ title, description, icon }: Props) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={28} color={colors.accent} />
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 24, gap: 12 },
  title: { color: colors.text, fontSize: 18, fontWeight: '600' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 23 },
});
