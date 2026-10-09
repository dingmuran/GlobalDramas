import { history, useAccess } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Statistic,
  Table,
} from 'antd';
import { date, labels, money, percent } from '@/domain/format';
import { businessPages } from '@/domain/pages';
import type { Overview, Resource } from '@/types/platform';
export function Summary({
  data,
  role,
  schema,
}: {
  data: Overview;
  role: number;
  schema: Resource[];
}) {
  const access = useAccess();
  const keys =
    role === 300
      ? ['dramas', 'episodes', 'bills', 'settlements']
      : ['dramas', 'orders', 'subscriptions', 'approvals'];
  const shortcuts =
    role === 300
      ? ['GDDramas', 'GDAnalytics', 'GDEarnings', 'GDLicenses']
      : ['GDReviews', 'GDUsers', 'GDFinance', 'GDGovernance'];
  return (
    <>
      <Row gutter={[16, 16]} className="metric-row">
        {keys.map((key, index) => (
          <Col xs={12} lg={6} key={key}>
            <Card
              className={
                index === 0 ? 'metric-card primary-metric' : 'metric-card'
              }
            >
              <Statistic
                title={schema.find((s) => s.key === key)?.title || key}
                value={data.counts[key] || 0}
              />
              <span className="metric-caption">当前权限范围内的实际记录</span>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[20, 20]}>
        <Col xs={24} xl={14}>
          <Card title="常用工作入口">
            <div className="shortcut-grid">
              {shortcuts
                .filter((key) => access[key])
                .map((key) => {
                  const page = businessPages.find((p) => p.key === key);
                  return page ? (
                    <Button
                      key={key}
                      className="shortcut-button"
                      onClick={() => history.push(`/${key}`)}
                    >
                      <strong>{page.title}</strong>
                      <span>{page.description}</span>
                    </Button>
                  ) : null;
                })}
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card
            title="30天内授权到期"
            extra={<span className="section-note">优先检查续期与下架</span>}
          >
            {data.expiring?.length ? (
              <div>
                {data.expiring.map((item) => (
                  <div className="deadline-row" key={item.id}>
                    <strong>{String(item.title)}</strong>
                    <span>{date(item.licenseEnd)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无即将到期的授权"
              />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}
export function Revenue({ data }: { data: Overview }) {
  return (
    <Card title="净收入 · 按币种" className="section-card">
      {data.revenue.length ? (
        <Row gutter={[24, 16]}>
          {data.revenue.map((item) => (
            <Col key={item.currency} xs={24} sm={12} lg={8}>
              <Statistic
                title={item.currency}
                value={money(item.netMinor, item.currency)}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="账单产生后显示实际净收入"
        />
      )}
    </Card>
  );
}
export function Analytics({ data }: { data: Overview }) {
  const max = Math.max(1, ...data.funnel.map((x) => x.count));
  return (
    <>
      <Row gutter={[16, 16]} className="metric-row">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="观看用户" value={data.quality.viewers} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="平均首帧"
              value={data.quality.startup_ms}
              precision={0}
              suffix="ms"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="累计卡顿"
              value={data.quality.buffer_ms}
              suffix="ms"
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card title="播放事件">
            {data.funnel.length ? (
              data.funnel.map((item) => (
                <div className="funnel-row" key={item.key}>
                  <span>{labels[item.key] || item.key}</span>
                  <Progress
                    percent={(item.count / max) * 100}
                    showInfo={false}
                  />
                  <strong>{item.count}</strong>
                </div>
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无播放事件"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="流量来源">
            <Table
              rowKey="key"
              size="small"
              pagination={false}
              dataSource={data.sources}
              columns={[
                { title: '来源', dataIndex: 'key' },
                { title: '事件数', dataIndex: 'count' },
              ]}
            />
          </Card>
        </Col>
      </Row>
      <Card title="短剧表现" className="section-card">
        <Table
          rowKey="drama_id"
          size="small"
          scroll={{ x: 650 }}
          pagination={false}
          dataSource={data.dramaStats}
          columns={[
            { title: '剧集ID', dataIndex: 'drama_id' },
            { title: '剧名', dataIndex: 'title' },
            { title: '播放开始', dataIndex: 'plays' },
            { title: '播放完成', dataIndex: 'completions' },
            { title: '观看用户', dataIndex: 'viewers' },
          ]}
        />
      </Card>
      <Card title="观看留存" className="section-card">
        <Table
          rowKey="cohort"
          size="small"
          pagination={false}
          dataSource={data.retention}
          columns={[
            {
              title: '首次观看日期',
              dataIndex: 'cohort',
              render: (value) => String(value).slice(0, 10),
            },
            { title: '用户数', dataIndex: 'users' },
            {
              title: '次日留存',
              render: (_value, row) => percent(row.day1, row.users),
            },
            {
              title: '7日留存',
              render: (_value, row) => percent(row.day7, row.users),
            },
          ]}
        />
      </Card>
    </>
  );
}
