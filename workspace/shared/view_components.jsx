// Core-view assembly. Register new built-ins here without copying Settings or business state.
import {OfficeMapView} from './OfficeMapView.jsx';
import {findBuiltinWorkbenchView} from './view_registry.js';

const COMPONENTS = Object.freeze({'office-map': OfficeMapView});

export function builtinViewComponent(id) {
  return findBuiltinWorkbenchView(id) ? COMPONENTS[id] || null : null;
}
