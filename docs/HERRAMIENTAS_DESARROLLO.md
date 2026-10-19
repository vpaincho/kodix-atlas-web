# Herramientas de desarrollo y skills

La aplicación ya utiliza Motion (framer-motion 11), Three.js, React Three Fiber, Drei y postprocesado. `npm ci` instala sus versiones compatibles. Las skills orientan al agente; no se necesitan para que el usuario final ejecute la aplicación.

## REA
Fuente oficial: https://github.com/morluto/rea

REA 6.7.0 se probó como CLI aislada durante la primera investigación. La comprobación de propiedad de procesos de este entorno bloquea el análisis semántico. No se cambiaron configuraciones del usuario ni se instalaron motores nativos.

Si se decide ejecutar las investigaciones desde un agente compatible en la Mac, la preparación oficial es:

```bash
npx rea-agents@6.7.0 setup
```

Elegir el cliente que realmente se usará, revisar los cambios propuestos y reiniciar ese cliente. Instalarlo en un cliente local no agrega sus herramientas a una sesión alojada de ChatGPT. El análisis JavaScript no requiere Hopper ni Ghidra.

## Motion AI Kit
Fuente oficial: https://github.com/motiondivision/ai-kit
Guía: https://motion.dev/docs/ai-kit-install

La skill y el instalador oficiales son abiertos. Algunas capacidades de ejemplos premium pertenecen a Motion+. Su instalación es opcional; esta entrega usa la librería ya presente y documentación pública, sin servicios premium ni nuevas credenciales.

## Pruebas
Playwright es dependencia de desarrollo. La instalación del navegador solo es necesaria para quien quiera ejecutar `npm run test:ui`, no para usar Atlas. Ver README. Los modelos y miniaturas entregados son originales y no necesitan descargas ni licencias externas.
