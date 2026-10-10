import { Link } from 'expo-router';
import { Screen } from '@/components/Screen';
import { colors } from '@/theme';

export default function NotFoundScreen() {
  return (
    <Screen title="页面不存在" subtitle="请返回首页继续浏览。">
      <Link href="/" style={{ color: colors.accent, fontSize: 18, paddingVertical: 16 }}>返回首页</Link>
    </Screen>
  );
}
