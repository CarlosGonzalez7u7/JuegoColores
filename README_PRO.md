# JuegoColoresQuiz

JuegoColoresQuiz es una aplicación móvil desarrollada con React Native que implementa un quiz/juego de reconocimiento de colores. Este documento describe las tecnologías usadas, las librerías instaladas, y proporciona instrucciones completas para clonar, configurar y ejecutar el proyecto en un entorno de desarrollo.

## Contenido del repositorio

- `app/`: código nativo Android.
- `ios/`: proyecto iOS y recursos (requiere macOS para compilar en iOS).
- `src/`: código fuente de la app.

## Tecnologías principales

- React Native 0.82.1
- React 19.1.1
- JavaScript / TypeScript (herramientas de desarrollo)
- Android SDK / Android Studio

## Librerías instaladas (según `package.json`)

- `@react-native-async-storage/async-storage` ^2.2.0 — almacenamiento local.
- `@react-native/new-app-screen` 0.82.1 — pantalla de plantilla.
- `react` 19.1.1
- `react-native` 0.82.1
- `react-native-safe-area-context` ^5.6.2 — manejo de áreas seguras.
- `react-native-sound` ^0.13.0 — reproducción de audio.

DevDependencies destacadas:

- `@babel/*`, `@react-native/*` (CLI y presets), `eslint`, `jest`, `prettier`, `typescript`.

## Requisitos del sistema

- Node.js >= 20
- npm o Yarn
- Java JDK 11 o 17 (recomendado)
- Android Studio con SDK y emuladores configurados
- (iOS) macOS con Xcode y CocoaPods

## Configuración (Windows - PowerShell)

1. Verificar Node.js y npm:

```powershell
node -v
npm -v
```

2. Configurar `JAVA_HOME` (ejemplo):

```powershell
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

3. Configurar Android SDK (ejemplo):

```powershell
setx ANDROID_HOME "C:\Users\<tu-usuario>\AppData\Local\Android\Sdk"
setx PATH "$env:PATH;C:\Users\<tu-usuario>\AppData\Local\Android\Sdk\platform-tools"
```

4. (Opcional) Instalar Yarn:

```powershell
npm install -g yarn
```

## Clonar y ejecutar el proyecto

1. Clonar el repo:

```bash
git clone https://github.com/CarlosGonzalez7u7/JuegoColores.git
cd JuegoColores
```

2. Instalar dependencias:

```bash
npm install
# o
# yarn install
```

3. Iniciar Metro:

```bash
npm start
# o
# yarn start
```

4. Ejecutar en Android:

```bash
npm run android
# o
# yarn android
```

5. Ejecutar en iOS (macOS):

```bash
cd ios
bundle install
pod install
cd ..
npm run ios
```

## Comandos útiles

- `npm start` — iniciar Metro.
- `npm run android` — compilar y ejecutar en Android.
- `npm run ios` — compilar y ejecutar en iOS (macOS).
- `npm test` — ejecutar tests.
- `npm run lint` — revisar lint.

## Subir el proyecto a GitHub (pasos recomendados)

Antes de subir, revisa si hay cambios locales sin commitear. Puedes elegir entre:

A) Subir solo commits ya existentes (no tocar cambios sin commitear).
B) Hacer commit de todos los cambios locales y empujar.

Comandos (PowerShell):

```powershell
# Añadir remote (si no existe)
git remote add origin https://github.com/CarlosGonzalez7u7/JuegoColores.git

# O si el remote existe y quieres actualizar la URL:
git remote set-url origin https://github.com/CarlosGonzalez7u7/JuegoColores.git

# Para commitear todo y empujar (opcional):
git add -A
git commit -m "Initial commit: subir proyecto JuegoColoresQuiz"

git push -u origin main
```

> Nota: Asegúrate de que la rama local sea `main`. Si estás en otra rama, reemplaza `main` por la rama correcta.

## Siguientes pasos que puedo realizar ahora

- Añadir el remoto y empujar solo los commits ya realizados.
- Hacer commit de todos los cambios locales y empujar al remoto (si me das permiso).
- Añadir un archivo `LICENSE` (ej. MIT) y minor fixes en `package.json` si lo deseas.

Dime qué opción prefieres y procedo a ejecutarla.
