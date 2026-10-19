# Atlas — primera revisión sobre el código entregado

Cambios: sincronización por horarios de cada tramo en la escena 3D; posición exacta al inicio y al final; congelación durante hueco GPS; separación del encuadre general y seguimiento; continuidad de la ruta en la posición del vehículo; bloom más selectivo; contexto industrial representativo; carga diferida del motor 3D; columnas adaptables y correcciones de desbordamiento; etiquetas inferiores separadas; eliminación de escala geográfica ficticia del esquema 2D.

No hay terreno real ni modelos fotorrealistas en esta entrega. Las instalaciones y el vehículo siguen siendo representativos. No se modificó el proyecto de Unreal.

## Uso en Mac
Descomprimir en una carpeta nueva. Dentro de esa carpeta ejecutar:

    npm ci
    npm run dev

No sobrescribir el original antes de revisar. La carpeta labs no se recibió; el build la incluye solo cuando existe. El paquete incluye src y configuraciones completas, sin node_modules ni dist.

## Verificación
TypeScript + Vite build y seis comprobaciones de progresión temporal. No se pudo realizar inspección visual: Chromium no estaba instalado y su descarga devolvió un archivo inválido. No hay medición de FPS ni afirmación de fidelidad visual validada.

## Próximos pendientes
Geometría vial real; vehículos diferenciados en escena 3D; resolver todas las colisiones de etiquetas; cámara manual; unificar el recorrido curvo 3D con la geometría del adaptador 2D; revisión visual en la Mac; evaluación de rendimiento.
