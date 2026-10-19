/* =============================================================================
   Contrato de integración con el MUNDO geográfico (Unreal + Cesium).
   Espeja CONTRATO_MUNDO.md v0.1 del track de mundo: mismos comandos y eventos.
   El transporte real a Unreal se resuelve después; acá va un ADAPTADOR DEMO
   claramente identificado. La UI nunca habla con Unreal directo, solo con esta
   interfaz, así se puede reemplazar sin tocar las pantallas.
   ========================================================================== */

export interface CameraContext {
  frenteId?: string;
  lon?: number;
  lat?: number;
  zoom?: number;
}

/** Comandos UI -> Mundo */
export interface WorldCommands {
  selectAsset(assetId: string): void;
  focusAsset(assetId: string): void;
  followResource(resourceId: string | null): void;
  setLayerVisible(layerId: string, visible: boolean): void;
  setTime(utcMin: number): void;              // minutos desde 08:00 (demo)
  applySnapshot(version: string): void;
}

/** Eventos Mundo -> UI */
export type WorldEvent =
  | { type: "WorldReady"; version: string }
  | { type: "AssetSelected"; assetId: string }
  | { type: "CameraContextChanged"; context: CameraContext }
  | { type: "DataUnavailable"; source: string };

export type WorldListener = (e: WorldEvent) => void;

export interface WorldBridge extends WorldCommands {
  readonly kind: "demo" | "unreal";
  on(listener: WorldListener): () => void;
  ready(): boolean;
}

/* --- Adaptador DEMO ---------------------------------------------------------
   No conecta con Unreal ni con streaming. Simula respuestas: confirma selección
   y emite CameraContextChanged. Marcado kind="demo" para que la UI lo rotule. */
export class DemoWorldBridge implements WorldBridge {
  readonly kind = "demo" as const;
  private listeners = new Set<WorldListener>();
  private _ready = false;

  constructor() {
    // "WorldReady" diferido para simular carga del mundo
    setTimeout(() => {
      this._ready = true;
      this.emit({ type: "WorldReady", version: "demo-0.1" });
    }, 300);
  }

  private emit(e: WorldEvent) { this.listeners.forEach((l) => l(e)); }

  on(listener: WorldListener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  ready() { return this._ready; }

  selectAsset(assetId: string) { this.emit({ type: "AssetSelected", assetId }); }
  focusAsset(assetId: string) {
    this.emit({ type: "CameraContextChanged", context: { frenteId: assetId } });
  }
  /** Operación de seguimiento: el mundo (demo) re-encuadra sobre el recurso. */
  followResource(resourceId: string | null) {
    this._following = resourceId;
    if (resourceId) this.emit({ type: "CameraContextChanged", context: { frenteId: resourceId } });
  }
  following() { return this._following; }
  private _following: string | null = null;
  setLayerVisible(_layerId: string, _visible: boolean) { /* demo: capas trayectorias/detenciones/geocercas */ }
  setTime(_utcMin: number) { /* demo: el mundo seguiría el mismo reloj */ }
  applySnapshot(_version: string) { /* demo: no-op */ }
}

/* Singleton de demo (se cambia por el transporte real a Unreal más adelante) */
export const world: WorldBridge = new DemoWorldBridge();
