// 跨 Workbench 视图卸载的轻量瞬时状态；仅保留呈现偏好，不写磁盘或存储租户事实。
export function createTransientViewState(defaults) {
  if (!defaults || typeof defaults !== 'object' || Array.isArray(defaults)) throw new TypeError('view defaults must be a record');
  const initial = {...defaults};
  let value = {...initial};
  return Object.freeze({
    read: () => ({...value}),
    patch: update => {
      if (!update || typeof update !== 'object' || Array.isArray(update)) return {...value};
      for (const field of Object.keys(initial)) {
        if (Object.hasOwn(update, field) && ['string','number','boolean'].includes(typeof update[field])) {
          value[field] = update[field];
        }
      }
      return {...value};
    },
    reset: () => {value = {...initial}; return {...value};},
  });
}
