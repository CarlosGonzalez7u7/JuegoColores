import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Easing,
  ScrollView,
  ImageBackground,
  Dimensions,
  Image,
  LogBox,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NIVELES_PREGUNTAS } from './src/datos';

LogBox.ignoreLogs(['setLayoutAnimationEnabledExperimental']);

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const COLORES_MAPA: { [key: string]: string } = {
  rojo: '#e74c3c',
  azul: '#3498db',
  verde: '#2ecc71',
  amarillo: '#f1c40f',
  morado: '#9b59b6',
  naranja: '#e67e22',
  rosa: '#fd79a8',
  cian: '#00cec9',
  lima: '#badc58',
  cafe: '#834c32',
  gris: '#636e72',
  azul_oscuro: '#130f40',
};
const LISTA_COLORES_COMPLETA = Object.keys(COLORES_MAPA);

let musicaFondo: Sound | null = null;

// Para interfaz son los componentes
const BloqueLiquido = ({ color }: { color: string }) => (
  <View style={[styles.liquido, { backgroundColor: COLORES_MAPA[color] }]} />
);

const ControlVolumenFila = ({ titulo, valor, setValor }: any) => (
  <View style={styles.volFila}>
    <Text style={styles.volLabel}>{titulo}</Text>
    <View style={styles.volBtnGroup}>
      <TouchableOpacity
        onPress={() => setValor(0)}
        style={[styles.volBtn, valor === 0 && styles.volBtnOff]}
      >
        <Text style={styles.volTxt}>🔇</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setValor(0.5)}
        style={[styles.volBtn, valor === 0.5 && styles.volBtnMid]}
      >
        <Text style={styles.volTxt}>🔉</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setValor(1)}
        style={[styles.volBtn, valor === 1 && styles.volBtnHigh]}
      >
        <Text style={styles.volTxt}>🔊</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function App() {
  const [pantalla, setPantalla] = useState('splash');
  const [puntajeGlobal, setPuntajeGlobal] = useState(0);
  const [mejorPuntaje, setMejorPuntaje] = useState(0);

  const [nivelMaximo, setNivelMaximo] = useState(1);
  const [nivelSeleccionado, setNivelSeleccionado] = useState(1);

  const [volumenes, setVolumenes] = useState({
    fondo: 0.5,
    pop: 1.0,
    pour: 1.0,
    win: 1.0,
    correct: 1.0,
    wrong: 1.0,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  // Es un arreglo, se establece el record en tiempo real
  useEffect(() => {
    if (puntajeGlobal > mejorPuntaje) {
      setMejorPuntaje(puntajeGlobal);
      AsyncStorage.setItem('@high_score', puntajeGlobal.toString());
    }
  }, [puntajeGlobal]); // Se ejecuta cada vez que ganas puntos

  useEffect(() => {
    cargarDatos();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => setTimeout(() => setPantalla('menu'), 2500));

    return () => {
      if (musicaFondo) musicaFondo.stop();
    };
  }, []);

  useEffect(() => {
    if (musicaFondo) musicaFondo.setVolume(volumenes.fondo);
    else if (volumenes.fondo > 0) iniciarMusicaFondo();
  }, [volumenes.fondo]);

  useEffect(() => {
    guardarPreferencias();
  }, [volumenes]);

  const cargarDatos = async () => {
    try {
      const score = await AsyncStorage.getItem('@high_score');
      const vols = await AsyncStorage.getItem('@volumenes_v4');
      const maxLvl = await AsyncStorage.getItem('@nivel_maximo_v1');

      if (score) setMejorPuntaje(parseInt(score));
      if (vols) setVolumenes(JSON.parse(vols));
      if (maxLvl) setNivelMaximo(parseInt(maxLvl));

      const volInicial = vols ? JSON.parse(vols).fondo : 0.5;
      setTimeout(() => iniciarMusicaFondo(volInicial), 500);
    } catch (e) {
      console.error(e);
    }
  };

  const guardarPreferencias = async () => {
    try {
      await AsyncStorage.setItem('@volumenes_v4', JSON.stringify(volumenes));
    } catch (e) {}
  };

  const iniciarMusicaFondo = (vol = volumenes.fondo) => {
    if (musicaFondo) return;
    musicaFondo = new Sound('background.mp3', Sound.MAIN_BUNDLE, error => {
      if (!error) {
        musicaFondo?.setNumberOfLoops(-1);
        musicaFondo?.setVolume(vol);
        musicaFondo?.play();
      }
    });
  };

  const desbloquearSiguienteNivel = async (nivelTerminado: number) => {
    const siguiente = nivelTerminado + 1;
    if (siguiente > nivelMaximo) {
      setNivelMaximo(siguiente);
      await AsyncStorage.setItem('@nivel_maximo_v1', siguiente.toString());
    }
    setNivelSeleccionado(siguiente);
    setPantalla('mapa');
  };

  const setVolumenCanal = (canal: keyof typeof volumenes, valor: number) => {
    setVolumenes(prev => ({ ...prev, [canal]: valor }));
  };

  const irAlMapa = () => {
    setPantalla('mapa');
  };
  const jugarNivelEspecifico = (lvl: number) => {
    setNivelSeleccionado(lvl);
    setPantalla('juego');
  };

  if (pantalla === 'splash') {
    return (
      <View style={styles.splashContainer}>
        <StatusBar hidden />
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <Text style={styles.splashLogo}>🧪</Text>
          <Text style={styles.splashText}>COLOR LAB</Text>
          <Text style={styles.splashSub}>ITS Uruapan</Text>
        </Animated.View>
      </View>
    );
  }

  if (pantalla === 'mapa') {
    return (
      <MapaNivelesIsla
        nivelMaximo={nivelMaximo}
        onJugarNivel={jugarNivelEspecifico}
        onSalir={() => setPantalla('menu')}
      />
    );
  }

  if (pantalla === 'menu') {
    return (
      <ConfigScreenWrapper
        titulo="MENÚ PRINCIPAL"
        volumenes={volumenes}
        setVolumenCanal={setVolumenCanal}
        contenido={(setShowConfig: any) => (
          <>
            <TouchableOpacity style={styles.btnMenu} onPress={irAlMapa}>
              <Text style={styles.txtBtnMenu}>▶ CONTINUAR / JUGAR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnMenu}
              onPress={() => setPantalla('records')}
            >
              <Text style={styles.txtBtnMenu}>🏆 RÉCORD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnMenu}
              onPress={() => setShowConfig(true)}
            >
              <Text style={styles.txtBtnMenu}>⚙️ SONIDO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnMenu}
              onPress={() => setPantalla('creditos')}
            >
              <Text style={styles.txtBtnMenu}>ℹ CRÉDITOS</Text>
            </TouchableOpacity>
          </>
        )}
      />
    );
  }

  if (pantalla === 'creditos') {
    return (
      <View style={styles.menuContainer}>
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
        >
          <Text style={styles.creditosTitulo}>CRÉDITOS</Text>
          <View style={styles.fotoContainer}>
            <Image
              source={{ uri: 'creadores_img' }}
              style={styles.fotoCreadores}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.creditosRol}>Desarrolladores:</Text>
          <View style={styles.devBox}>
            <Text style={styles.creditosNombre}>
              Willian Antonio Álvarez Morales
            </Text>
            <Text style={styles.creditosMatricula}>Matrícula: 23040206</Text>
          </View>
          <View style={styles.devBox}>
            <Text style={styles.creditosNombre}>
              Carlos Erik Fernández García
            </Text>
            <Text style={styles.creditosMatricula}>Matrícula: 23040180</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.creditosRol}>Grado y Grupo:</Text>
          <Text style={styles.creditosInfo}>5to Semestre - Grupo A</Text>
          <Text style={styles.creditosInfo}>Ingeniería en Sistemas</Text>
          <TouchableOpacity
            style={[
              styles.btnMenu,
              { marginTop: 30, backgroundColor: '#e74c3c' },
            ]}
            onPress={() => setPantalla('menu')}
          >
            <Text style={styles.txtBtnMenu}>VOLVER</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (pantalla === 'records') {
    return (
      <View style={styles.menuContainer}>
        <Text style={styles.creditosTitulo}>🏆 RÉCORD</Text>
        <Text style={styles.puntajeGigante}>{mejorPuntaje}</Text>
        <TouchableOpacity
          style={[
            styles.btnMenu,
            { marginTop: 40, backgroundColor: '#e74c3c' },
          ]}
          onPress={() => setPantalla('menu')}
        >
          <Text style={styles.txtBtnMenu}>VOLVER</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Juego
      key={nivelSeleccionado}
      puntaje={puntajeGlobal}
      setPuntaje={setPuntajeGlobal}
      nivelInicial={nivelSeleccionado}
      volumenes={volumenes}
      setVolumenCanal={setVolumenCanal}
      alPasarNivel={(nivelTerminado: number) =>
        desbloquearSiguienteNivel(nivelTerminado)
      }
      alSalir={() => setPantalla('menu')}
    />
  );
}

// --- COMPONENTES AUXILIARES ---

const MapaNivelesIsla = ({ nivelMaximo, onJugarNivel, onSalir }: any) => {
  const niveles = Array.from({ length: 10 }, (_, i) => i + 1);
  const animacionPulsar = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animacionPulsar, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animacionPulsar, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const fondoMapa = { uri: 'mapa_bg' };

  return (
    <ImageBackground
      source={fondoMapa}
      style={styles.mapaBg}
      resizeMode="cover"
      imageStyle={{ backgroundColor: '#48dbfb' }}
    >
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.mapaHeader}>
        <Text style={styles.mapaTitulo}>🏝️ ISLA COLOR</Text>
        <Text style={styles.mapaSubTitulo}>Progreso: Nivel {nivelMaximo}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.mapaScroll}
        showsVerticalScrollIndicator={false}
      >
        {niveles.reverse().map(n => {
          const desbloqueado = n <= nivelMaximo;
          const esUltimoDesbloqueado = n === nivelMaximo;
          const esMeta = n === 10;
          const offset = n % 2 === 0 ? -60 : 60;

          return (
            <View
              key={n}
              style={[styles.mapaNodoContainer, { marginLeft: offset }]}
            >
              <TouchableOpacity
                disabled={!desbloqueado}
                onPress={() => onJugarNivel(n)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.nodoBase,
                    desbloqueado &&
                      !esUltimoDesbloqueado &&
                      styles.nodoPasadoBase,
                    esUltimoDesbloqueado && styles.nodoActualBase,
                    !desbloqueado && styles.nodoBloqueadoBase,
                    esMeta && desbloqueado && styles.nodoMetaBase,
                  ]}
                >
                  <Text style={styles.mapaNumero}>
                    {!desbloqueado ? '🔒' : esMeta ? '👑' : n}
                  </Text>
                </View>
              </TouchableOpacity>
              {esUltimoDesbloqueado && (
                <Animated.View
                  style={{
                    transform: [{ scale: animacionPulsar }],
                    position: 'absolute',
                    top: 10,
                    left: 60,
                    zIndex: 10,
                  }}
                >
                  <TouchableOpacity
                    style={styles.btnJugarIsla}
                    onPress={() => onJugarNivel(n)}
                  >
                    <Text style={styles.txtJugarIsla}>¡JUGAR!</Text>
                    <Text style={styles.flechaIsla}>▶</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
      <TouchableOpacity style={styles.btnSalirMapaFlotante} onPress={onSalir}>
        <Text style={styles.txtBtnMenu}>🏠 MENU</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const ConfigScreenWrapper = ({
  titulo,
  volumenes,
  setVolumenCanal,
  contenido,
}: any) => {
  const [showConfig, setShowConfig] = useState(false);
  const ModalConfig = () => (
    <Modal visible={showConfig} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBoxConfig}>
          <Text style={styles.modalTitulo}>🎚️ SONIDO</Text>
          <ScrollView style={{ maxHeight: 400, width: '100%' }}>
            <ControlVolumenFila
              titulo="🎵 Música"
              valor={volumenes.fondo}
              setValor={(v: number) => setVolumenCanal('fondo', v)}
            />
            <View style={styles.divider} />
            <ControlVolumenFila
              titulo="👆 Pop"
              valor={volumenes.pop}
              setValor={(v: number) => setVolumenCanal('pop', v)}
            />
            <ControlVolumenFila
              titulo="💧 Agua"
              valor={volumenes.pour}
              setValor={(v: number) => setVolumenCanal('pour', v)}
            />
            <ControlVolumenFila
              titulo="🎉 Ganar"
              valor={volumenes.win}
              setValor={(v: number) => setVolumenCanal('win', v)}
            />
            <ControlVolumenFila
              titulo="✅ Correcto"
              valor={volumenes.correct}
              setValor={(v: number) => setVolumenCanal('correct', v)}
            />
            <ControlVolumenFila
              titulo="❌ Error"
              valor={volumenes.wrong}
              setValor={(v: number) => setVolumenCanal('wrong', v)}
            />
          </ScrollView>
          <TouchableOpacity
            style={styles.btnContinuar}
            onPress={() => setShowConfig(false)}
          >
            <Text style={styles.txtContinuar}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  return (
    <SafeAreaView style={styles.menuContainer}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.menuTitulo}>{titulo}</Text>
      {contenido(setShowConfig)}
      <ModalConfig />
    </SafeAreaView>
  );
};

const Juego = ({
  puntaje,
  setPuntaje,
  nivelInicial,
  volumenes,
  setVolumenCanal,
  alPasarNivel,
  alSalir,
}: any) => {
  const [nivel, setNivel] = useState(nivelInicial);
  const [tubos, setTubos] = useState<string[][]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [pausaVisible, setPausaVisible] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);

  const animacionesRotacion = useRef(
    [...Array(20)].map(() => new Animated.Value(0)),
  ).current;
  const [modalTipo, setModalTipo] = useState<
    'pregunta' | 'correcto' | 'incorrecto' | null
  >(null);

  useEffect(() => {
    generarNivel(nivel);
  }, []);

  const sonarFX = (canal: keyof typeof volumenes) => {
    const vol = volumenes[canal];
    if (vol <= 0) return;
    const nombre = canal === 'fondo' ? 'background' : canal;
    const sound = new Sound(`${nombre}.mp3`, Sound.MAIN_BUNDLE, error => {
      if (!error) {
        sound.setVolume(vol);
        sound.play(() => sound.release());
      }
    });
  };

  const generarNivel = (lvl: number) => {
    let numColores = 2 + lvl;
    if (numColores > LISTA_COLORES_COMPLETA.length)
      numColores = LISTA_COLORES_COMPLETA.length;

    const coloresDisponibles = LISTA_COLORES_COMPLETA.slice(0, numColores);
    let bloques: string[] = [];
    coloresDisponibles.forEach(c => {
      for (let i = 0; i < 4; i++) bloques.push(c);
    });

    for (let i = bloques.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bloques[i], bloques[j]] = [bloques[j], bloques[i]];
    }

    const nuevosTubos = [];
    for (let i = 0; i < numColores; i++)
      nuevosTubos.push(bloques.slice(i * 4, (i + 1) * 4));
    nuevosTubos.push([]);
    nuevosTubos.push([]);

    setTubos(nuevosTubos);
  };

  const reiniciarNivelActual = () => {
    setSeleccionado(null);
    generarNivel(nivel);
  };

  // Reinicia el boton
  const reiniciarDesdeMenuPausa = () => {
    reiniciarNivelActual();
    setPausaVisible(false);
  };

  const manejarToque = (idx: number) => {
    if (bloqueado) return;
    if (seleccionado === null) {
      if (tubos[idx].length > 0) {
        sonarFX('pop');
        setSeleccionado(idx);
      }
    } else {
      if (seleccionado === idx) setSeleccionado(null);
      else intentarMover(seleccionado, idx);
    }
  };

  const intentarMover = (origen: number, destino: number) => {
    const copia = [...tubos.map(t => [...t])];
    const color = copia[origen][copia[origen].length - 1];
    const dest = copia[destino];

    if (
      dest.length < 4 &&
      (dest.length === 0 || dest[dest.length - 1] === color)
    ) {
      setBloqueado(true);
      const radianes = destino > origen ? 0.6 : -0.6;

      Animated.sequence([
        Animated.timing(animacionesRotacion[origen], {
          toValue: radianes,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.delay(100),
      ]).start(() => {
        sonarFX('pour');
        dest.push(color);
        copia[origen].pop();
        setTubos(copia);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        Animated.timing(animacionesRotacion[origen], {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setBloqueado(false);
          setSeleccionado(null);
          verificarVictoria(copia);
        });
      });
    } else {
      setSeleccionado(null);
    }
  };

  const verificarVictoria = (tubosActuales: string[][]) => {
    if (
      tubosActuales.every(
        t => t.length === 0 || (t.length === 4 && t.every(c => c === t[0])),
      )
    ) {
      setTimeout(() => {
        sonarFX('win');
        setModalTipo('pregunta');
      }, 500);
    }
  };

  const responder = (respuesta: string) => {
    const data =
      NIVELES_PREGUNTAS.find((d: any) => d.nivel === nivel) ||
      NIVELES_PREGUNTAS[0];
    if (respuesta === data.respuestaCorrecta) {
      sonarFX('correct');
      setPuntaje(puntaje + 100);
      setModalTipo('correcto');
    } else {
      sonarFX('wrong');
      setModalTipo('incorrecto');
    }
  };

  const irSiguienteNivel = () => {
    setModalTipo(null);
    alPasarNivel(nivel);
  };
  const repetirNivel = () => {
    setModalTipo(null);
    generarNivel(nivel);
  };
  const datosPregunta =
    NIVELES_PREGUNTAS.find((d: any) => d.nivel === nivel) ||
    NIVELES_PREGUNTAS[0];

  return (
    <SafeAreaView style={styles.juegoContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => setPausaVisible(true)}
          style={styles.btnIcono}
        >
          <Text style={styles.txtIcono}>⏸</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={reiniciarNivelActual}
          style={[styles.btnIcono, { backgroundColor: '#e17055' }]}
        >
          <Text style={styles.txtIcono}>↺</Text>
        </TouchableOpacity>
        <View style={styles.scoreBoard}>
          <Text style={styles.txtScoreLabel}>PUNTOS</Text>
          <Text style={styles.txtScore}>{puntaje}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.txtLevel}>Nivel {nivel}</Text>
        </View>
      </View>

      <View style={styles.tableroCentrado}>
        <View style={styles.areaTubos}>
          {tubos.map((colores, i) => {
            const rotate = animacionesRotacion[i].interpolate({
              inputRange: [-1, 1],
              outputRange: ['-57deg', '57deg'],
            });
            return (
              <Animated.View
                key={i}
                style={{
                  transform: [
                    { rotate: rotate },
                    { translateY: seleccionado === i ? -20 : 0 },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[styles.tubo, seleccionado === i && styles.tuboSel]}
                  onPress={() => manejarToque(i)}
                  activeOpacity={1}
                >
                  <View style={styles.tuboInterior}>
                    {colores.map((c, j) => (
                      <BloqueLiquido key={j} color={c} />
                    ))}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <Modal visible={pausaVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBoxConfig}>
            <Text style={styles.modalTitulo}>⏸ PAUSA</Text>
            <TouchableOpacity
              style={styles.btnMenu}
              onPress={() => setPausaVisible(false)}
            >
              <Text style={styles.txtBtnMenu}>▶ CONTINUAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnMenu}
              onPress={reiniciarDesdeMenuPausa}
            >
              <Text style={styles.txtBtnMenu}>↺ REINICIAR NIVEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnMenu}
              onPress={() => setConfigVisible(true)}
            >
              <Text style={styles.txtBtnMenu}>⚙️ SONIDO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnMenu, { backgroundColor: '#ff7675' }]}
              onPress={alSalir}
            >
              <Text style={styles.txtBtnMenu}>🏠 SALIR AL MENÚ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={configVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBoxConfig}>
            <Text style={styles.modalTitulo}>🎚️ MEZCLADORA</Text>
            <ScrollView style={{ maxHeight: 400, width: '100%' }}>
              <ControlVolumenFila
                titulo="🎵 Música"
                valor={volumenes.fondo}
                setValor={(v: number) => setVolumenCanal('fondo', v)}
              />
              <View style={styles.divider} />
              <ControlVolumenFila
                titulo="👆 Pop"
                valor={volumenes.pop}
                setValor={(v: number) => setVolumenCanal('pop', v)}
              />
              <ControlVolumenFila
                titulo="💧 Agua"
                valor={volumenes.pour}
                setValor={(v: number) => setVolumenCanal('pour', v)}
              />
              <ControlVolumenFila
                titulo="🎉 Ganar"
                valor={volumenes.win}
                setValor={(v: number) => setVolumenCanal('win', v)}
              />
              <ControlVolumenFila
                titulo="✅ Correcto"
                valor={volumenes.correct}
                setValor={(v: number) => setVolumenCanal('correct', v)}
              />
              <ControlVolumenFila
                titulo="❌ Error"
                valor={volumenes.wrong}
                setValor={(v: number) => setVolumenCanal('wrong', v)}
              />
            </ScrollView>
            <TouchableOpacity
              style={styles.btnContinuar}
              onPress={() => setConfigVisible(false)}
            >
              <Text style={styles.txtContinuar}>Regresar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalTipo !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              modalTipo === 'incorrecto' && styles.modalError,
            ]}
          >
            {modalTipo === 'pregunta' && (
              <>
                <Text style={styles.emoji}>🧠</Text>
                <Text style={styles.modalTitulo}>Level Complete!</Text>
                <Text style={styles.preguntaTxt}>
                  {datosPregunta?.pregunta}
                </Text>
                {datosPregunta?.opciones.map((op: string, k: number) => (
                  <TouchableOpacity
                    key={k}
                    style={styles.btnOpcion}
                    onPress={() => responder(op)}
                  >
                    <Text style={styles.txtOpcion}>{op}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            {modalTipo === 'correcto' && (
              <>
                <Text style={styles.emoji}>🌟</Text>
                <Text style={styles.modalTitulo}>¡Correcto!</Text>
                <TouchableOpacity
                  style={styles.btnContinuar}
                  onPress={irSiguienteNivel}
                >
                  <Text style={styles.txtContinuar}>Continuar ➡</Text>
                </TouchableOpacity>
              </>
            )}
            {modalTipo === 'incorrecto' && (
              <>
                <Text style={styles.emoji}>💀</Text>
                <Text style={styles.modalTitulo}>¡Incorrecto!</Text>
                <TouchableOpacity
                  style={[styles.btnContinuar, { backgroundColor: '#e74c3c' }]}
                  onPress={repetirNivel}
                >
                  <Text style={styles.txtContinuar}>↻ Repetir Nivel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Generales
  splashContainer: {
    flex: 1,
    backgroundColor: '#2d3436',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: { fontSize: 80, marginBottom: 20 },
  splashText: {
    color: '#00cec9',
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 5,
  },
  splashSub: { color: '#b2bec3', fontSize: 16, marginTop: 10 },

  menuContainer: {
    flex: 1,
    backgroundColor: '#2d3436',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuTitulo: {
    color: '#0984e3',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  btnMenu: {
    backgroundColor: '#6c5ce7',
    width: '100%',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 5,
  },
  txtBtnMenu: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Mapa
  mapaBg: { flex: 1, width: '100%', alignItems: 'center' },
  mapaHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  mapaTitulo: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowRadius: 5,
  },
  mapaSubTitulo: {
    color: '#fab1a0',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  mapaScroll: { paddingVertical: 50, alignItems: 'center', width: width },

  mapaNodoContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },

  nodoBase: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    elevation: 8,
  },
  nodoPasadoBase: { backgroundColor: '#55efc4', borderColor: '#00b894' },
  nodoActualBase: {
    backgroundColor: '#74b9ff',
    borderColor: '#0984e3',
    transform: [{ scale: 1.2 }],
  },
  nodoBloqueadoBase: { backgroundColor: '#636e72', borderColor: '#2d3436' },
  nodoMetaBase: { backgroundColor: '#ffeaa7', borderColor: '#fdcb6e' },

  mapaNumero: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'black',
    textShadowRadius: 2,
  },

  btnJugarIsla: {
    flexDirection: 'row',
    backgroundColor: '#e17055',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 10,
    alignItems: 'center',
  },
  txtJugarIsla: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  flechaIsla: { color: 'white', fontSize: 20, marginLeft: 10 },

  btnSalirMapaFlotante: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    backgroundColor: '#d63031',
    padding: 12,
    borderRadius: 30,
    elevation: 10,
  },

  // Juego
  juegoContainer: { flex: 1, backgroundColor: '#222' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: 40,
    backgroundColor: '#1e272e',
  },
  btnIcono: {
    width: 40,
    height: 40,
    backgroundColor: '#636e72',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  txtIcono: { color: '#fff', fontSize: 20 },

  scoreBoard: { alignItems: 'center' },
  txtScoreLabel: { color: '#b2bec3', fontSize: 10 },
  txtScore: { color: '#fab1a0', fontSize: 24, fontWeight: 'bold' },
  levelBadge: {
    backgroundColor: '#0984e3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  txtLevel: { color: 'white', fontWeight: 'bold' },

  tableroCentrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  areaTubos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },

  tubo: {
    width: 45,
    height: 160,
    borderWidth: 3,
    borderColor: '#636e72',
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 4,
  },
  tuboSel: { borderColor: '#ffeaa7' },
  tuboInterior: { flex: 1, flexDirection: 'column-reverse', gap: 1 },
  liquido: { width: '100%', height: 38, borderRadius: 6 },

  // Config y Modales
  volFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '100%',
  },
  volLabel: { color: '#dfe6e9', fontWeight: 'bold', flex: 1 },
  volBtnGroup: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'space-around',
    gap: 5,
  },
  volBtn: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#636e72',
    width: 40,
    alignItems: 'center',
  },
  volBtnOff: { backgroundColor: '#ff7675' },
  volBtnMid: { backgroundColor: '#ffeaa7' },
  volBtnHigh: { backgroundColor: '#55efc4' },
  volTxt: { fontSize: 16 },

  creditosTitulo: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  fotoContainer: {
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#00cec9',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 10,
  },
  fotoCreadores: { width: 250, height: 180 },
  devBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    marginBottom: 10,
  },
  creditosRol: {
    color: '#00cec9',
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  creditosNombre: {
    color: '#dfe6e9',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  creditosMatricula: {
    color: '#fab1a0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  creditosInfo: { color: '#b2bec3', fontSize: 18 },
  divider: {
    height: 1,
    backgroundColor: '#636e72',
    width: '100%',
    marginVertical: 15,
  },

  puntajeGigante: {
    color: '#fdcb6e',
    fontSize: 80,
    fontWeight: 'bold',
    marginVertical: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#2d3436',
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0984e3',
  },
  modalBoxConfig: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#2d3436',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6c5ce7',
    alignItems: 'center',
  },
  modalError: { borderColor: '#d63031' },
  emoji: { fontSize: 50, textAlign: 'center', marginBottom: 10 },
  modalTitulo: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  preguntaTxt: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  btnOpcion: {
    backgroundColor: '#6c5ce7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  txtOpcion: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnContinuar: {
    backgroundColor: '#00b894',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
  },
  txtContinuar: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
