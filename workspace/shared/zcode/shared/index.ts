// 只重导出已迁入的共享协议；不引入宿主的 Node.js 依赖。
export * from './pluginStoreOrdering';
export * from './plugin-display-name';
export * from './plugin-marketplaces';
export * from './remoteResourcePackages';
export * from './remoteAssetInstallMode';
export * from './test-ids';
export * from './wslUserValidation';

// TinyClaw 将 Claude 官方目录纳入公共页；保持迁入的 ZCode 源文件原样。
import {isPublicStoreMarketplaceId as isZCodePublicStore} from './plugin-marketplaces';
import {CLAUDE_MARKETPLACE_ID} from '../../claude_marketplace';
export const isPublicStoreMarketplaceId=(id:string)=>id===CLAUDE_MARKETPLACE_ID||isZCodePublicStore(id);
