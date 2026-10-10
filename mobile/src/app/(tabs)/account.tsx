import { Screen } from '@/components/Screen';
import { Placeholder } from '@/components/Placeholder';

export default function AccountScreen() {
  return (
    <Screen title="我的" subtitle="收藏故事，继续追剧">
      <Placeholder icon="person-circle-outline" title="个人中心" description="后续接入观众登录、收藏、喜欢与观看记录。" />
    </Screen>
  );
}
