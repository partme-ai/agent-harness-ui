// TinyClaw 接口适配：复用 ZCode 原始译文及 ICU 格式化，不改变组件文案逻辑。
import { createIntl, createIntlCache } from 'react-intl';
import messages from '../ui/i18n/locales/zh-CN';
const intl = createIntl({locale:'zh-CN',messages:{...messages,
 'ssh.assetInstallModeDescription':'运行端接入后可选择资源准备方式；当前预览不会下载或上传资源。',
 'remote.settingsStepDescription':'填写 {method} 配置以预览交互，当前不会建立真实连接。',
 'settings.plugins.store.segment.public':'公共插件',
 'settings.plugins.store.segment.personal':'个人插件',
}},createIntlCache());
export function useZCodeIntl(){return {intl,locale:'zh-CN'};}
