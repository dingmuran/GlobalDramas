# 前台参考图标替换

- 日期：2026-10-09。
- 用户提供搜索、地球、灰色头像、太阳、月亮五张参考，要求替换对应图标。
- ViewerIcons.tsx实现干净SVG造型，避免截图黑底与噪点，使用currentColor适配明暗；头像使用主题灰阶。
- HeaderPanels、AccountPage、App共享同一套替换图标，覆盖PC/H5搜索、语言、主题、用户入口和访客弹窗。
- 浏览器确认PC和390px H5新头像与搜索可见，未改变按钮交互。Docker TypeScript与生产构建通过。
- 未提交或推送Git。
