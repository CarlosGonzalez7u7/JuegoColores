<div align="center">
  
# 🚀 React Native App

### Una aplicación móvil moderna construida con React Native

[![React Native](https://img.shields.io/badge/React%20Native-0.76-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[Características](#-características) • [Instalación](#-instalación) • [Uso](#-uso) • [Documentación](#-documentación)

</div>

---

## ✨ Características

- 📱 **Multiplataforma** - Funciona en iOS y Android
- ⚡ **Fast Refresh** - Actualización instantánea durante el desarrollo
- 🎨 **Diseño Moderno** - Interfaz intuitiva y atractiva
- 🔒 **TypeScript** - Código seguro y mantenible
- 🚀 **Alto Rendimiento** - Optimizado para la mejor experiencia de usuario

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v18 o superior)
- [npm](https://www.npmjs.com/) o [Yarn](https://yarnpkg.com/)
- [Watchman](https://facebook.github.io/watchman/) (recomendado para macOS)
- [Xcode](https://developer.apple.com/xcode/) (para iOS)
- [Android Studio](https://developer.android.com/studio) (para Android)

> 💡 **Nota**: Sigue la [guía oficial de configuración del entorno](https://reactnative.dev/docs/set-up-your-environment) para más detalles.

## 🚀 Instalación

### 1️⃣ Clona el repositorio

\`\`\`bash
git clone https://github.com/tu-usuario/tu-proyecto.git
cd tu-proyecto
\`\`\`

### 2️⃣ Instala las dependencias

\`\`\`bash
# Con npm
npm install

# Con Yarn
yarn install
\`\`\`

### 3️⃣ Configuración de iOS (solo macOS)

\`\`\`bash
# Instala Ruby bundler (solo la primera vez)
bundle install

# Instala las dependencias de CocoaPods
cd ios && bundle exec pod install && cd ..
\`\`\`

## 🎯 Uso

### Iniciar el servidor Metro

\`\`\`bash
npm start
# o
yarn start
\`\`\`

### Ejecutar en Android

\`\`\`bash
npm run android
# o
yarn android
\`\`\`

### Ejecutar en iOS

\`\`\`bash
npm run ios
# o
yarn ios
\`\`\`

## 🛠️ Tech Stack

| Tecnología | Descripción |
|-----------|-------------|
| [React Native](https://reactnative.dev/) | Framework para aplicaciones móviles |
| [TypeScript](https://www.typescriptlang.org/) | JavaScript con tipos estáticos |
| [Metro](https://metrobundler.dev/) | Bundler de JavaScript |
| [Fast Refresh](https://reactnative.dev/docs/fast-refresh) | Hot reloading mejorado |

## 📱 Capturas de Pantalla

<div align="center">

| Inicio | Perfil | Configuración |
|--------|--------|---------------|
| ![Image](https://github.com/user-attachments/assets/06e9e29a-9448-4cf6-9e70-35c7d7020d41) | ![Image](https://github.com/user-attachments/assets/fcac0c57-0f4a-4e0b-ac37-2a2e81c23c61) | ![Screenshot 3](https://via.placeholder.com/200x400) |

</div>

## 🔧 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor Metro |
| `npm run android` | Ejecuta la app en Android |
| `npm run ios` | Ejecuta la app en iOS |
| `npm test` | Ejecuta los tests |
| `npm run lint` | Ejecuta el linter |

## 📝 Desarrollo

### Recarga en Desarrollo

- **Android**: Presiona <kbd>R</kbd> dos veces o <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>M</kbd> para abrir el menú
- **iOS**: Presiona <kbd>R</kbd> en el simulador

### Estructura del Proyecto

\`\`\`
├── android/          # Código nativo de Android
├── ios/              # Código nativo de iOS
├── src/              # Código fuente
│   ├── components/   # Componentes reutilizables
│   ├── screens/      # Pantallas de la app
│   ├── navigation/   # Configuración de navegación
│   └── utils/        # Utilidades y helpers
├── App.tsx           # Componente principal
└── package.json      # Dependencias del proyecto
\`\`\`

## 🐛 Solución de Problemas

### Error al ejecutar en iOS

\`\`\`bash
cd ios && bundle exec pod install && cd ..
npm run ios
\`\`\`

### Error al ejecutar en Android

\`\`\`bash
cd android && ./gradlew clean && cd ..
npm run android
\`\`\`

Para más problemas, consulta la [guía de troubleshooting oficial](https://reactnative.dev/docs/troubleshooting).

## 📚 Recursos de Aprendizaje

- 📖 [Documentación de React Native](https://reactnative.dev/docs/getting-started)
- 🎓 [Tutorial de React Native](https://reactnative.dev/docs/tutorial)
- 📰 [Blog oficial](https://reactnative.dev/blog)
- 💬 [Comunidad en Discord](https://discord.com/invite/reactnative)
- 🐙 [Repositorio en GitHub](https://github.com/facebook/react-native)

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Juan Carlos Gonzalez O.**

- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tu-perfil)
- Twitter: [@tu_usuario](https://twitter.com/tu_usuario)

---

<div align="center">

### ⭐ ¡Dale una estrella si te gustó este proyecto!

Usando React Native

</div>
