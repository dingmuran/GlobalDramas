import { Screen } from '@/components/Screen';
import { Placeholder } from '@/components/Placeholder';

export default function DiscoverScreen() {
  return (
    <Screen title="发现" subtitle="找到下一部想看的故事">
      <Placeholder icon="search-outline" title="搜索与分类" description="后续接入剧名搜索、题材筛选与公开剧集目录。" />
    </Screen>
  );
}
