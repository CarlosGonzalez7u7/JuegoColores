import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StatusBar,
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
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';

// --- CONFIGURACIÓN ---
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
const NIVELES_EDUCATIVOS = [
  'Primaria',
  'Secundaria',
  'Preparatoria',
  'Universidad',
  'Maestría',
];

// DATA MEMORAMA
const EMOJIS_BASE = [
  { img: '🐶', txt: 'DOG', id: 'dog' },
  { img: '🐱', txt: 'CAT', id: 'cat' },
  { img: '🍎', txt: 'APPLE', id: 'apple' },
  { img: '🚗', txt: 'CAR', id: 'car' },
  { img: '🌞', txt: 'SUN', id: 'sun' },
  { img: '🐟', txt: 'FISH', id: 'fish' },
  { img: '📚', txt: 'BOOK', id: 'book' },
  { img: '🏠', txt: 'HOUSE', id: 'house' },
  { img: '🍕', txt: 'PIZZA', id: 'pizza' },
  { img: '🌙', txt: 'MOON', id: 'moon' },
];

const TUTORIALES = {
  colores:
    '🧪 LABORATORIO DE COLOR\n\n• Toca un tubo para seleccionarlo.\n• Toca otro para vaciar el líquido.\n• Solo puedes vaciar si el color coincide o el tubo está vacío.\n• ¡Agrupa todos los colores iguales!\n• Al ganar, responde la pregunta en inglés para avanzar.',
  memorama:
    '🧠 MEMORAMA INGLÉS\n\n• Encuentra los pares de cartas.\n• Debes unir la IMAGEN con su PALABRA en inglés.\n• ¡Cuidado! Tienes un límite de movimientos.\n• Si se acaban los movimientos, pierdes.',
  mate: '➗ RETO MATEMÁTICO\n\n• Resuelve las operaciones antes de que acabe el tiempo.\n• Respuestas correctas te dan tiempo extra.\n• ¡Atento a los BONOS DORADOS! Dan muchos puntos pero desaparecen en 3 segundos.',
};

let musicaFondo: Sound | null = null;

// --- LÓGICA DE PREGUNTAS MEJORADA ---
const calcularEdad = (fechaISO: string) => {
  if (!fechaISO) return '?';
  const hoy = new Date();
  const cumple = new Date(fechaISO);
  let edad = hoy.getFullYear() - cumple.getFullYear();
  const m = hoy.getMonth() - cumple.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
    edad--;
  }
  return isNaN(edad) ? '?' : edad;
};

const generarPreguntaPersonalizada = (usuario: any) => {
  const edad = calcularEdad(usuario.cumple);
  const nombre = usuario.username;
  const rolEnIngles = usuario.rol === 'Estudiante' ? 'Student' : 'Teacher';

  // Banco de preguntas CORREGIDO Y LÓGICO
  const bancoPreguntas = [
    // Personalizadas
    {
      pregunta: 'What is your name?',
      respuestaCorrecta: `My name is ${nombre}.`,
      opciones: [`My name is ${nombre}.`, 'I am Batman.', 'My name is John.'],
    },
    {
      pregunta: 'How old are you?',
      respuestaCorrecta: `I am ${edad} years old.`,
      opciones: [
        `I am ${edad} years old.`,
        `I am ${edad + 5} years old.`,
        `I am 100 years old.`,
      ],
    },
    {
      pregunta: 'Are you a Student or a Teacher?',
      respuestaCorrecta: `I am a ${rolEnIngles}.`,
      opciones: [`I am a ${rolEnIngles}.`, 'I am a Doctor.', 'I am a Pilot.'],
    },

    // Traducción Directa (Corrección del problema de colores)
    {
      pregunta: "¿Cómo se dice 'Rojo' en Inglés? 🔴",
      respuestaCorrecta: 'Red',
      opciones: ['Red', 'Blue', 'Green'],
    },
    {
      pregunta: "¿Cómo se dice 'Azul' en Inglés? 🔵",
      respuestaCorrecta: 'Blue',
      opciones: ['Blue', 'Red', 'Yellow'],
    },
    {
      pregunta: "¿Qué significa 'Dog'? 🐶",
      respuestaCorrecta: 'Perro',
      opciones: ['Perro', 'Gato', 'Pájaro'],
    },

    // Lógica Simple
    {
      pregunta: 'What comes after Monday?',
      respuestaCorrecta: 'Tuesday',
      opciones: ['Tuesday', 'Sunday', 'Friday'],
    },
    {
      pregunta: "Which animal says 'Meow'?",
      respuestaCorrecta: 'Cat',
      opciones: ['Cat', 'Dog', 'Cow'],
    },
    {
      pregunta: 'What is 10 + 10?',
      respuestaCorrecta: 'Twenty',
      opciones: ['Twenty', 'Fifty', 'Ten'],
    },
    {
      pregunta: "Opposite of 'Hot' 🔥",
      respuestaCorrecta: 'Cold',
      opciones: ['Cold', 'Warm', 'Sunny'],
    },
  ];

  const seleccionada =
    bancoPreguntas[Math.floor(Math.random() * bancoPreguntas.length)];
  seleccionada.opciones.sort(() => Math.random() - 0.5);
  return seleccionada;
};

// --- COMPONENTES UI ---
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

const CustomAlert = ({
  visible,
  titulo,
  mensaje,
  onOk,
  tipo = 'info',
}: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={[styles.modalBox, tipo === 'error' && styles.modalError]}>
        <Text style={styles.emoji}>
          {tipo === 'error' ? '⚠️' : tipo === 'success' ? '✅' : 'ℹ️'}
        </Text>
        <Text style={styles.modalTitulo}>{titulo}</Text>
        <Text style={styles.preguntaTxt}>{mensaje}</Text>
        <TouchableOpacity style={styles.btnContinuar} onPress={onOk}>
          <Text style={styles.txtContinuar}>ENTENDIDO</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const TutorialModal = ({ visible, texto, onClose }: any) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalBoxConfig}>
        <Text style={styles.emoji}>📜</Text>
        <Text style={styles.modalTitulo}>CÓMO JUGAR</Text>
        <ScrollView style={{ maxHeight: 300, width: '100%' }}>
          <Text style={styles.tutorialTxt}>{texto}</Text>
        </ScrollView>
        <TouchableOpacity style={styles.btnContinuar} onPress={onClose}>
          <Text style={styles.txtContinuar}>¡LISTO!</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// --- APP PRINCIPAL ---
export default function App() {
  const [pantalla, setPantalla] = useState('splash');
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    titulo: '',
    mensaje: '',
    tipo: 'info',
  });
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

  const mostrarAlerta = (
    titulo: string,
    mensaje: string,
    tipo: 'info' | 'error' | 'success' = 'info',
  ) => {
    setAlertConfig({ visible: true, titulo, mensaje, tipo });
  };

  useEffect(() => {
    cargarDatosGenerales();
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
    ]).start(() => setTimeout(() => setPantalla('login'), 2500));
    return () => {
      if (musicaFondo) musicaFondo.stop();
    };
  }, []);

  useEffect(() => {
    if (musicaFondo) musicaFondo.setVolume(volumenes.fondo);
    else if (volumenes.fondo > 0) iniciarMusicaFondo();
    guardarPreferencias();
  }, [volumenes]);

  const cargarDatosGenerales = async () => {
    try {
      const vols = await AsyncStorage.getItem('@volumenes_v4');
      if (vols) setVolumenes(JSON.parse(vols));
      const volInicial = vols ? JSON.parse(vols).fondo : 0.5;
      setTimeout(() => iniciarMusicaFondo(volInicial), 500);
    } catch (e) {}
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

  const setVolumenCanal = (canal: keyof typeof volumenes, valor: number) => {
    setVolumenes(prev => ({ ...prev, [canal]: valor }));
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
          <Text style={styles.splashSub}>Suite Educativa</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#2d3436' }}>
      {pantalla === 'login' && (
        <PantallaLogin
          onLogin={(usr: any) => {
            setUsuarioActual(usr);
            setPantalla('menu');
          }}
          irARegistro={() => setPantalla('registro')}
          alerta={mostrarAlerta}
        />
      )}
      {pantalla === 'registro' && (
        <PantallaRegistro
          onRegistroExitoso={() => setPantalla('login')}
          irALogin={() => setPantalla('login')}
          alerta={mostrarAlerta}
        />
      )}

      {pantalla === 'menu' && (
        <MenuPrincipal
          usuario={usuarioActual}
          setPantalla={setPantalla}
          volumenes={volumenes}
          setVolumenCanal={setVolumenCanal}
          cerrarSesion={() => setPantalla('login')}
        />
      )}

      {pantalla === 'juego_colores' && (
        <JuegoColores
          usuario={usuarioActual}
          volumenes={volumenes}
          alSalir={() => setPantalla('menu')}
        />
      )}
      {pantalla === 'juego_memorama' && (
        <JuegoMemorama
          usuario={usuarioActual}
          volumenes={volumenes}
          alSalir={() => setPantalla('menu')}
        />
      )}
      {pantalla === 'juego_mate' && (
        <JuegoMatematicas
          usuario={usuarioActual}
          volumenes={volumenes}
          alSalir={() => setPantalla('menu')}
        />
      )}

      {pantalla === 'creditos' && (
        <Creditos onBack={() => setPantalla('menu')} />
      )}
      {pantalla === 'records' && (
        <RecordsDetallados
          usuario={usuarioActual}
          onBack={() => setPantalla('menu')}
        />
      )}

      <CustomAlert
        visible={alertConfig.visible}
        titulo={alertConfig.titulo}
        mensaje={alertConfig.mensaje}
        tipo={alertConfig.tipo}
        onOk={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

// --- LOGIN & REGISTRO ---
const PantallaLogin = ({ onLogin, irARegistro, alerta }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const intentarLogin = async () => {
    if (!email || !password) {
      alerta('Ups', 'Llena todos los campos', 'error');
      return;
    }
    try {
      const jsonUsers = await AsyncStorage.getItem('@usuarios_db');
      const usuarios = jsonUsers ? JSON.parse(jsonUsers) : [];
      const usuarioEncontrado = usuarios.find(
        (u: any) => u.email === email && u.password === password,
      );
      if (usuarioEncontrado) onLogin(usuarioEncontrado);
      else alerta('Error', 'Correo o contraseña incorrectos.', 'error');
    } catch (e) {
      alerta('Error', 'Base de datos inaccesible', 'error');
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>INICIAR SESIÓN</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        placeholderTextColor="#aaa"
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.inputPasswordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          onChangeText={setPassword}
          secureTextEntry={!showPass}
        />
        <TouchableOpacity
          onPress={() => setShowPass(!showPass)}
          style={styles.eyeIcon}
        >
          <Text style={{ fontSize: 20 }}>{showPass ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.btnAuth} onPress={intentarLogin}>
        <Text style={styles.txtAuth}>ENTRAR</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={irARegistro} style={{ marginTop: 20 }}>
        <Text style={styles.linkAuth}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
};

const PantallaRegistro = ({ onRegistroExitoso, irALogin, alerta }: any) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPass: '',
  });
  const [fecha, setFecha] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [sexo, setSexo] = useState('Hombre');
  const [rol, setRol] = useState('Estudiante');
  const [nivelEducativo, setNivelEducativo] = useState('Seleccionar...');
  const [showModalNivel, setShowModalNivel] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const registrar = async () => {
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      nivelEducativo === 'Seleccionar...'
    ) {
      alerta('Falta info', 'Todos los campos son obligatorios', 'error');
      return;
    }
    if (form.password !== form.confirmPass) {
      alerta('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    // GUARDAR FECHA COMO ISO PARA EVITAR ERROR DE CÁLCULO
    const nuevoUsuario = {
      ...form,
      cumple: fecha.toISOString(),
      sexo,
      rol,
      nivelEducativo,
      id: Date.now().toString(),
    };
    try {
      const jsonUsers = await AsyncStorage.getItem('@usuarios_db');
      const usuarios = jsonUsers ? JSON.parse(jsonUsers) : [];
      if (usuarios.some((u: any) => u.email === form.email)) {
        alerta('Error', 'Este correo ya existe', 'error');
        return;
      }
      usuarios.push(nuevoUsuario);
      await AsyncStorage.setItem('@usuarios_db', JSON.stringify(usuarios));
      alerta('¡Éxito!', 'Cuenta creada correctamente.', 'success');
      setTimeout(onRegistroExitoso, 1500);
    } catch (e) {
      alerta('Error', 'No se pudo guardar', 'error');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollAuth}>
      <Text style={styles.authTitle}>REGISTRO</Text>
      <Text style={styles.label}>Datos Personales</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre de Usuario"
        placeholderTextColor="#aaa"
        onChangeText={t => setForm({ ...form, username: t })}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        onChangeText={t => setForm({ ...form, email: t })}
        autoCapitalize="none"
      />
      <Text style={styles.label}>Fecha de Cumpleaños</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker(true)}
      >
        <Text style={{ color: 'white' }}>{fecha.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setFecha(selectedDate);
          }}
        />
      )}
      <Text style={styles.label}>Nivel Educativo</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowModalNivel(true)}
      >
        <Text style={{ color: 'white' }}>{nivelEducativo} ▼</Text>
      </TouchableOpacity>
      <Modal visible={showModalNivel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalList}>
            <Text style={styles.modalTitulo}>Selecciona Nivel</Text>
            {NIVELES_EDUCATIVOS.map(niv => (
              <TouchableOpacity
                key={niv}
                style={styles.itemLista}
                onPress={() => {
                  setNivelEducativo(niv);
                  setShowModalNivel(false);
                }}
              >
                <Text style={styles.txtItem}>{niv}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.btnContinuar, { backgroundColor: '#e74c3c' }]}
              onPress={() => setShowModalNivel(false)}
            >
              <Text style={styles.txtContinuar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Text style={styles.label}>Sexo</Text>
      <View style={styles.rowOpciones}>
        {['Hombre', 'Mujer'].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.btnOpcion, sexo === s && styles.btnOpcionActivo]}
            onPress={() => setSexo(s)}
          >
            <Text style={styles.txtOpcion}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Rol</Text>
      <View style={styles.rowOpciones}>
        {['Estudiante', 'Educador'].map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.btnOpcion, rol === r && styles.btnOpcionActivo]}
            onPress={() => setRol(r)}
          >
            <Text style={styles.txtOpcion}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Seguridad</Text>
      <View style={styles.inputPasswordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          secureTextEntry={!showPass}
          onChangeText={t => setForm({ ...form, password: t })}
        />
        <TouchableOpacity
          onPress={() => setShowPass(!showPass)}
          style={styles.eyeIcon}
        >
          <Text style={{ fontSize: 20 }}>{showPass ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        placeholderTextColor="#aaa"
        secureTextEntry={!showPass}
        onChangeText={t => setForm({ ...form, confirmPass: t })}
      />
      <TouchableOpacity style={styles.btnAuth} onPress={registrar}>
        <Text style={styles.txtAuth}>CREAR CUENTA</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={irALogin}
        style={{ marginTop: 20, marginBottom: 50 }}
      >
        <Text style={styles.linkAuth}>¿Ya tienes cuenta? Inicia Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- MENU ---
const MenuPrincipal = ({
  usuario,
  setPantalla,
  volumenes,
  setVolumenCanal,
  cerrarSesion,
}: any) => {
  const [showConfig, setShowConfig] = useState(false);
  const [showJuegos, setShowJuegos] = useState(false);

  return (
    <View style={styles.menuContainer}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.menuTitulo}>
        HOLA, {usuario?.username.toUpperCase()}
      </Text>
      {!showJuegos ? (
        <>
          <View style={styles.infoUsuarioBox}>
            <Text style={styles.infoUsuarioTxt}>Rol: {usuario?.rol}</Text>
            <Text style={styles.infoUsuarioTxt}>
              Nivel: {usuario?.nivelEducativo}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.btnMenu}
            onPress={() => setShowJuegos(true)}
          >
            <Text style={styles.txtBtnMenu}>🎮 JUGAR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnMenu}
            onPress={() => setPantalla('records')}
          >
            <Text style={styles.txtBtnMenu}>🏆 RÉCORDS</Text>
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
          <TouchableOpacity
            style={[styles.btnMenu, { backgroundColor: '#e17055' }]}
            onPress={cerrarSesion}
          >
            <Text style={styles.txtBtnMenu}>🔒 CERRAR SESIÓN</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text style={styles.label}>SELECCIONA UN JUEGO</Text>
          <TouchableOpacity
            style={[styles.btnGame, { backgroundColor: '#0984e3' }]}
            onPress={() => setPantalla('juego_colores')}
          >
            <Text style={styles.txtGame}>🧪 Laboratorio de Color</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnGame, { backgroundColor: '#e84393' }]}
            onPress={() => setPantalla('juego_memorama')}
          >
            <Text style={styles.txtGame}>🧠 Memorama Inglés</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnGame, { backgroundColor: '#00b894' }]}
            onPress={() => setPantalla('juego_mate')}
          >
            <Text style={styles.txtGame}>➗ Reto Matemático</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.btnMenu,
              { marginTop: 20, backgroundColor: '#636e72' },
            ]}
            onPress={() => setShowJuegos(false)}
          >
            <Text style={styles.txtBtnMenu}>⬅ VOLVER</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal visible={showConfig} transparent animationType="slide">
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
                titulo="SFX General"
                valor={volumenes.pop}
                setValor={(v: number) => {
                  setVolumenCanal('pop', v);
                  setVolumenCanal('pour', v);
                }}
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
    </View>
  );
};

// --- JUEGO 1: LABORATORIO (FIXED LEVEL CURVE & QUESTIONS) ---
const JuegoColores = ({ usuario, volumenes, alSalir }: any) => {
  const [modo, setModo] = useState('mapa');
  const [nivelMax, setNivelMax] = useState(1);
  const [nivelActual, setNivelActual] = useState(1);

  useEffect(() => {
    AsyncStorage.getItem(`@colors_lvl_${usuario.username}`).then(l => {
      if (l) setNivelMax(parseInt(l));
    });
  }, []);

  const desbloquear = (n: number) => {
    const sig = n + 1;
    if (sig > nivelMax) {
      setNivelMax(sig);
      AsyncStorage.setItem(`@colors_lvl_${usuario.username}`, sig.toString());
    }
    setModo('mapa');
  };

  if (modo === 'mapa')
    return (
      <MapaNivelesIsla
        nivelMaximo={nivelMax}
        onJugarNivel={(n: number) => {
          setNivelActual(n);
          setModo('jugando');
        }}
        onSalir={alSalir}
      />
    );
  return (
    <JuegoColoresEngine
      key={nivelActual}
      nivel={nivelActual}
      volumenes={volumenes}
      onWin={() => desbloquear(nivelActual)}
      onExit={() => setModo('mapa')}
      usuario={usuario}
    />
  );
};

const JuegoColoresEngine = ({
  nivel,
  volumenes,
  onWin,
  onExit,
  usuario,
}: any) => {
  const [tubos, setTubos] = useState<string[][]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [modalPregunta, setModalPregunta] = useState(false);
  const [preguntaData, setPreguntaData] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const animacionesRotacion = useRef(
    [...Array(12)].map(() => new Animated.Value(0)),
  ).current;
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    reiniciar();
  }, []);

  const reiniciar = () => {
    setModalPregunta(false);
    setFeedback(null);
    setSeleccionado(null);
    setPreguntaData(generarPreguntaPersonalizada(usuario));

    // CURVA DE DIFICULTAD MÁS SUAVE
    // Nivel 1-2: 3 colores
    // Nivel 3-5: 4 colores
    // Nivel 6+: 5 colores...
    let numCols = 3;
    if (nivel >= 3) numCols = 4;
    if (nivel >= 6) numCols = 5;
    if (nivel >= 9) numCols = 6;

    const colors = LISTA_COLORES_COMPLETA.slice(0, numCols);
    let blocks: string[] = [];
    colors.forEach(c => {
      for (let i = 0; i < 4; i++) blocks.push(c);
    });
    blocks.sort(() => Math.random() - 0.5);
    const t: string[][] = [];
    for (let i = 0; i < colors.length; i++)
      t.push(blocks.slice(i * 4, (i + 1) * 4));
    t.push([]);
    t.push([]);
    setTubos(t);
  };

  const playSnd = (name: string) => {
    if (volumenes.pop > 0) {
      const s = new Sound(name + '.mp3', Sound.MAIN_BUNDLE, e => {
        if (!e) s.play();
      });
    }
  };

  const tap = (i: number) => {
    if (bloqueado) return;
    if (seleccionado === null) {
      if (tubos[i].length > 0) {
        playSnd('pop');
        setSeleccionado(i);
      }
    } else if (seleccionado === i) setSeleccionado(null);
    else intentarMover(seleccionado, i);
  };

  const intentarMover = (origen: number, destino: number) => {
    const color = tubos[origen][tubos[origen].length - 1];
    const dest = tubos[destino];

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
        playSnd('pour');
        const cp = [...tubos.map(t => [...t])];
        cp[destino].push(color);
        cp[origen].pop();
        setTubos(cp);
        Animated.timing(animacionesRotacion[origen], {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setBloqueado(false);
          setSeleccionado(null);
          if (
            cp.every(
              t =>
                t.length === 0 || (t.length === 4 && t.every(c => c === t[0])),
            )
          )
            setTimeout(() => setModalPregunta(true), 500);
        });
      });
    } else {
      setSeleccionado(null);
    }
  };

  const procesarRespuesta = (opcion: string) => {
    if (opcion === preguntaData.respuestaCorrecta) {
      playSnd('win');
      onWin();
    } else {
      playSnd('wrong');
      setModalPregunta(false);
      setFeedback({
        msg: `¡Incorrecto! La respuesta correcta era: "${preguntaData.respuestaCorrecta}".\n\nDebes repetir el nivel.`,
      });
    }
  };

  return (
    <SafeAreaView style={styles.juegoContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onExit} style={styles.btnIcono}>
          <Text style={styles.txtIcono}>🚪</Text>
        </TouchableOpacity>
        <Text style={styles.txtLevel}>Nivel {nivel}</Text>
        <TouchableOpacity
          onPress={() => setShowTutorial(true)}
          style={[styles.btnIcono, { backgroundColor: '#0984e3' }]}
        >
          <Text style={styles.txtIcono}>❓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={reiniciar}
          style={[styles.btnIcono, { backgroundColor: '#e17055' }]}
        >
          <Text style={styles.txtIcono}>↺</Text>
        </TouchableOpacity>
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
                  onPress={() => tap(i)}
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

      <Modal visible={modalPregunta} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>¡Responde para ganar!</Text>
            <Text style={styles.preguntaTxt}>{preguntaData?.pregunta}</Text>
            {preguntaData?.opciones.map((op: string, k: number) => (
              <TouchableOpacity
                key={k}
                style={styles.btnOpcion}
                onPress={() => procesarRespuesta(op)}
              >
                <Text style={styles.txtOpcion}>{op}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={feedback !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, styles.modalError]}>
            <Text style={styles.emoji}>❌</Text>
            <Text style={styles.modalTitulo}>¡Fallaste!</Text>
            <Text style={styles.preguntaTxt}>{feedback?.msg}</Text>
            <TouchableOpacity
              style={[styles.btnContinuar, { backgroundColor: '#e17055' }]}
              onPress={reiniciar}
            >
              <Text style={styles.txtContinuar}>Reiniciar Nivel ↺</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TutorialModal
        visible={showTutorial}
        texto={TUTORIALES.colores}
        onClose={() => setShowTutorial(false)}
      />
    </SafeAreaView>
  );
};

// --- JUEGO 2: MEMORAMA ---
const JuegoMemorama = ({ usuario, volumenes, alSalir }: any) => {
  const [nivel, setNivel] = useState(1);
  const [cartas, setCartas] = useState<any[]>([]);
  const [volteadas, setVolteadas] = useState<number[]>([]);
  const [encontradas, setEncontradas] = useState<number[]>([]);
  const [movimientos, setMovimientos] = useState(0);
  const [maxMovimientos, setMaxMovimientos] = useState(0);
  const [estadoJuego, setEstadoJuego] = useState<
    'jugando' | 'ganado' | 'perdido'
  >('jugando');
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    iniciarNivel(nivel);
  }, [nivel]);

  const playSnd = (n: string) => {
    if (volumenes.pop > 0) {
      const s = new Sound(n + '.mp3', Sound.MAIN_BUNDLE, e => !e && s.play());
    }
  };

  const iniciarNivel = (lvl: number) => {
    const pares = Math.min(2 + lvl, EMOJIS_BASE.length);
    const items = EMOJIS_BASE.slice(0, pares);
    let deck = [];
    items.forEach(item => {
      deck.push({ id: item.id, content: item.img, type: 'img' });
      deck.push({ id: item.id, content: item.txt, type: 'txt' });
    });
    deck.sort(() => Math.random() - 0.5);
    const limite = Math.ceil(pares * 1.6) + 2;
    setCartas(deck);
    setMaxMovimientos(limite);
    setMovimientos(0);
    setVolteadas([]);
    setEncontradas([]);
    setEstadoJuego('jugando');
  };

  const tocarCarta = (index: number) => {
    if (
      estadoJuego !== 'jugando' ||
      volteadas.length >= 2 ||
      volteadas.includes(index) ||
      encontradas.includes(index)
    )
      return;
    playSnd('pop');
    const nuevas = [...volteadas, index];
    setVolteadas(nuevas);
    if (nuevas.length === 2) {
      const nuevosMovs = movimientos + 1;
      setMovimientos(nuevosMovs);
      const c1 = cartas[nuevas[0]];
      const c2 = cartas[nuevas[1]];
      if (c1.id === c2.id) {
        playSnd('correct');
        const nuevasEncontradas = [...encontradas, nuevas[0], nuevas[1]];
        setEncontradas(nuevasEncontradas);
        setVolteadas([]);
        if (nuevasEncontradas.length === cartas.length) {
          playSnd('win');
          setEstadoJuego('ganado');
          AsyncStorage.getItem(`@record_memo_${usuario.username}`).then(
            curr => {
              if (!curr || nivel > parseInt(curr))
                AsyncStorage.setItem(
                  `@record_memo_${usuario.username}`,
                  nivel.toString(),
                );
            },
          );
        }
      } else {
        if (nuevosMovs >= maxMovimientos) {
          playSnd('wrong');
          setEstadoJuego('perdido');
        }
        setTimeout(() => {
          setVolteadas([]);
        }, 1000);
      }
    }
  };

  return (
    <SafeAreaView style={styles.juegoContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={alSalir} style={styles.btnIcono}>
          <Text style={styles.txtIcono}>🚪</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.txtLevel}>Nivel {nivel}</Text>
          <Text
            style={{
              color: movimientos >= maxMovimientos ? '#e74c3c' : '#fff',
            }}
          >
            Movs: {movimientos} / {maxMovimientos}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowTutorial(true)}
          style={[styles.btnIcono, { backgroundColor: '#0984e3' }]}
        >
          <Text style={styles.txtIcono}>❓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => iniciarNivel(nivel)}
          style={[styles.btnIcono, { backgroundColor: '#00b894' }]}
        >
          <Text style={styles.txtIcono}>↺</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {cartas.map((carta, i) => {
            const visible = volteadas.includes(i) || encontradas.includes(i);
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.carta,
                  visible ? styles.cartaVolteada : styles.cartaOculta,
                ]}
                onPress={() => tocarCarta(i)}
              >
                <Text style={{ fontSize: 28 }}>
                  {visible ? carta.content : '❓'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <Modal
        visible={estadoJuego !== 'jugando'}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              estadoJuego === 'perdido' && styles.modalError,
            ]}
          >
            <Text style={styles.emoji}>
              {estadoJuego === 'ganado' ? '🎉' : '💔'}
            </Text>
            <Text style={styles.modalTitulo}>
              {estadoJuego === 'ganado'
                ? '¡Nivel Superado!'
                : 'Sin Movimientos'}
            </Text>
            {estadoJuego === 'ganado' ? (
              <TouchableOpacity
                style={styles.btnContinuar}
                onPress={() => setNivel(nivel + 1)}
              >
                <Text style={styles.txtContinuar}>Siguiente ➡</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btnContinuar, { backgroundColor: '#e74c3c' }]}
                onPress={() => iniciarNivel(nivel)}
              >
                <Text style={styles.txtContinuar}>Reintentar ↺</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
      <TutorialModal
        visible={showTutorial}
        texto={TUTORIALES.memorama}
        onClose={() => setShowTutorial(false)}
      />
    </SafeAreaView>
  );
};

// --- JUEGO 3: MATEMÁTICAS (BONUS FUGACES) ---
const JuegoMatematicas = ({ usuario, volumenes, alSalir }: any) => {
  const [puntos, setPuntos] = useState(0);
  const [tiempo, setTiempo] = useState(30);
  const [problema, setProblema] = useState<any>(null);
  const [juegoActivo, setJuegoActivo] = useState(true);
  const [esBono, setEsBono] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    let intervalo: any;
    if (juegoActivo && tiempo > 0) {
      intervalo = setInterval(() => {
        setTiempo(t => t - 1);
      }, 1000);
    } else if (tiempo <= 0) {
      setJuegoActivo(false);
      guardarRecord();
    }
    return () => clearInterval(intervalo);
  }, [juegoActivo, tiempo]);

  // TIMER BONO 3 SEGUNDOS
  useEffect(() => {
    let bonoTimer: any;
    if (juegoActivo && esBono) {
      bonoTimer = setTimeout(() => {
        setEsBono(false);
        generarProblema(false); // Quita bono, fuerza normal
      }, 3000);
    }
    return () => clearTimeout(bonoTimer);
  }, [esBono, problema]);

  useEffect(() => {
    generarProblema();
  }, []);

  const playSnd = (n: string) => {
    if (volumenes.pop > 0) {
      const s = new Sound(n + '.mp3', Sound.MAIN_BUNDLE, e => !e && s.play());
    }
  };

  const guardarRecord = async () => {
    const prev = await AsyncStorage.getItem(`@record_math_${usuario.username}`);
    if (!prev || puntos > parseInt(prev))
      await AsyncStorage.setItem(
        `@record_math_${usuario.username}`,
        puntos.toString(),
      );
  };

  const generarProblema = (forceNormal = false) => {
    let maxNum = 10;
    let opsPosibles = ['+'];
    if (puntos > 50) {
      maxNum = 20;
      opsPosibles = ['+', '-'];
    }
    if (puntos > 100) {
      maxNum = 10;
      opsPosibles = ['x'];
    }
    if (puntos > 150) {
      maxNum = 50;
      opsPosibles = ['+', '-', 'x'];
    }
    if (puntos > 250) {
      maxNum = 100;
      opsPosibles = ['÷', 'x', '+', '-'];
    }

    const isBonus = forceNormal ? false : Math.random() < 0.2;
    setEsBono(isBonus);

    const operador =
      opsPosibles[Math.floor(Math.random() * opsPosibles.length)];
    let a = 0,
      b = 0,
      res = 0;
    const r = (max: number) => Math.floor(Math.random() * max) + 1;
    if (operador === '+') {
      a = r(maxNum);
      b = r(maxNum);
      res = a + b;
    } else if (operador === '-') {
      a = r(maxNum);
      b = r(a);
      res = a - b;
    } else if (operador === 'x') {
      a = r(12);
      b = r(12);
      res = a * b;
    } else if (operador === '÷') {
      b = r(12);
      res = r(12);
      a = b * res;
    }
    let opciones = [res, res + r(5), res - r(5)].sort(
      () => Math.random() - 0.5,
    );
    opciones = [...new Set(opciones)];
    while (opciones.length < 3) opciones.push(res + r(10));
    setProblema({
      q: `${a} ${operador} ${b}`,
      a: res,
      ops: opciones.sort(() => Math.random() - 0.5),
    });
  };

  const responder = (resp: number) => {
    if (!juegoActivo) return;
    if (resp === problema.a) {
      playSnd('correct');
      const ptsGanados = esBono ? 30 : 10;
      const tiempoGanado = esBono ? 10 : 2;
      setPuntos(puntos + ptsGanados);
      setTiempo(tiempo + tiempoGanado);
    } else {
      playSnd('wrong');
      const ptsPerdidos = esBono ? 20 : 5;
      const tiempoPerdido = esBono ? 5 : 2;
      setPuntos(Math.max(0, puntos - ptsPerdidos));
      setTiempo(Math.max(0, tiempo - tiempoPerdido));
    }
    generarProblema();
  };

  return (
    <SafeAreaView
      style={[
        styles.juegoContainer,
        { backgroundColor: esBono ? '#2c2c54' : '#2c3e50' },
      ]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={alSalir} style={styles.btnIcono}>
          <Text style={styles.txtIcono}>🚪</Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.txtLevel,
            { color: tiempo < 10 ? '#e74c3c' : 'white' },
          ]}
        >
          ⏳ {tiempo}s
        </Text>
        <Text style={styles.txtLevel}>Pts: {puntos}</Text>
        <TouchableOpacity
          onPress={() => setShowTutorial(true)}
          style={[styles.btnIcono, { backgroundColor: '#0984e3' }]}
        >
          <Text style={styles.txtIcono}>❓</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {esBono && (
          <Text
            style={{
              color: '#f1c40f',
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 10,
            }}
          >
            🌟 ¡BONUS TIME! 🌟
          </Text>
        )}
        <View
          style={[
            styles.mathCard,
            esBono && { borderColor: '#f1c40f', borderWidth: 4 },
          ]}
        >
          <Text style={styles.mathText}>{problema?.q}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            gap: 15,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {problema?.ops.map((op: number, i: number) => (
            <TouchableOpacity
              key={i}
              style={[styles.btnMath, esBono && { backgroundColor: '#f1c40f' }]}
              onPress={() => responder(op)}
            >
              <Text style={[styles.txtMath, esBono && { color: 'black' }]}>
                {op}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Modal visible={!juegoActivo} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.emoji}>⏰</Text>
            <Text style={styles.modalTitulo}>¡Tiempo Agotado!</Text>
            <Text style={styles.puntajeGigante}>{puntos}</Text>
            <Text style={styles.preguntaTxt}>Puntos Totales</Text>
            <TouchableOpacity
              style={styles.btnContinuar}
              onPress={() => {
                setPuntos(0);
                setTiempo(30);
                setJuegoActivo(true);
                generarProblema();
              }}
            >
              <Text style={styles.txtContinuar}>Jugar de Nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnContinuar, { backgroundColor: '#e74c3c' }]}
              onPress={alSalir}
            >
              <Text style={styles.txtContinuar}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TutorialModal
        visible={showTutorial}
        texto={TUTORIALES.mate}
        onClose={() => setShowTutorial(false)}
      />
    </SafeAreaView>
  );
};

// --- PANTALLAS EXTRA ---
const RecordsDetallados = ({ usuario, onBack }: any) => {
  const [recs, setRecs] = useState({ colors: 1, memo: 1, math: 0 });
  useEffect(() => {
    const load = async () => {
      const c = await AsyncStorage.getItem(`@colors_lvl_${usuario.username}`);
      const m = await AsyncStorage.getItem(`@record_memo_${usuario.username}`);
      const ma = await AsyncStorage.getItem(`@record_math_${usuario.username}`);
      setRecs({
        colors: c ? parseInt(c) : 1,
        memo: m ? parseInt(m) : 1,
        math: ma ? parseInt(ma) : 0,
      });
    };
    load();
  }, []);

  return (
    <View style={styles.menuContainer}>
      <Text style={styles.creditosTitulo}>
        🏆 RÉCORDS DE {usuario?.username.toUpperCase()}
      </Text>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>🧪 Laboratorio:</Text>
        <Text style={styles.recordValue}>Nivel {recs.colors}</Text>
      </View>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>🧠 Memorama:</Text>
        <Text style={styles.recordValue}>Nivel {recs.memo}</Text>
      </View>
      <View style={styles.recordRow}>
        <Text style={styles.recordLabel}>➗ Matemáticas:</Text>
        <Text style={styles.recordValue}>{recs.math} Pts</Text>
      </View>
      <TouchableOpacity
        style={[styles.btnMenu, { marginTop: 40, backgroundColor: '#e74c3c' }]}
        onPress={onBack}
      >
        <Text style={styles.txtBtnMenu}>VOLVER</Text>
      </TouchableOpacity>
    </View>
  );
};

const Creditos = ({ onBack }: any) => (
  <View style={styles.menuContainer}>
    <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
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
        <Text style={styles.creditosMatricula}>23040206</Text>
      </View>
      <View style={styles.devBox}>
        <Text style={styles.creditosNombre}>Carlos Erik Fernández García</Text>
        <Text style={styles.creditosMatricula}>23040180</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.creditosInfo}>5to Semestre - Grupo A</Text>
      <Text style={styles.creditosInfo}>Ingeniería en Sistemas</Text>
      <TouchableOpacity
        style={[styles.btnMenu, { marginTop: 30, backgroundColor: '#e74c3c' }]}
        onPress={onBack}
      >
        <Text style={styles.txtBtnMenu}>VOLVER</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
);

const MapaNivelesIsla = ({ nivelMaximo, onJugarNivel, onSalir }: any) => {
  const niveles = Array.from({ length: 10 }, (_, i) => i + 1);
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
      </View>
      <ScrollView
        contentContainerStyle={styles.mapaScroll}
        showsVerticalScrollIndicator={false}
      >
        {niveles.reverse().map(n => {
          const desbloqueado = n <= nivelMaximo;
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
                    desbloqueado
                      ? n === nivelMaximo
                        ? styles.nodoActualBase
                        : styles.nodoPasadoBase
                      : styles.nodoBloqueadoBase,
                  ]}
                >
                  <Text style={styles.mapaNumero}>
                    {!desbloqueado ? '🔒' : n}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
      <TouchableOpacity style={styles.btnSalirMapaFlotante} onPress={onSalir}>
        <Text style={styles.txtBtnMenu}>🏠 SALIR</Text>
      </TouchableOpacity>
    </ImageBackground>
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

  authContainer: {
    flex: 1,
    backgroundColor: '#2d3436',
    justifyContent: 'center',
    padding: 20,
  },
  scrollAuth: {
    flexGrow: 1,
    backgroundColor: '#2d3436',
    justifyContent: 'center',
    padding: 20,
  },
  authTitle: {
    color: '#00cec9',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  inputPasswordContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  inputPassword: { flex: 1, color: 'white', padding: 15, fontSize: 16 },
  eyeIcon: { padding: 10 },
  label: {
    color: '#b2bec3',
    marginBottom: 10,
    marginTop: 5,
    fontWeight: 'bold',
  },
  btnAuth: {
    backgroundColor: '#0984e3',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  txtAuth: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  linkAuth: { color: '#00cec9', textAlign: 'center', fontSize: 16 },
  rowOpciones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  btnOpcion: {
    flex: 1,
    backgroundColor: '#636e72',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnOpcionActivo: {
    backgroundColor: '#00b894',
    borderWidth: 2,
    borderColor: 'white',
  },
  txtOpcion: { color: 'white', fontWeight: 'bold' },

  infoUsuarioBox: {
    backgroundColor: 'rgba(9, 132, 227, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0984e3',
  },
  infoUsuarioTxt: { color: '#dfe6e9', fontSize: 16, fontWeight: 'bold' },

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

  btnGame: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 5,
  },
  txtGame: { color: 'white', fontSize: 22, fontWeight: 'bold' },

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
  txtLevel: { color: 'white', fontWeight: 'bold', fontSize: 20 },

  // MEMORAMA
  carta: {
    width: 80,
    height: 80,
    margin: 5,
    backgroundColor: '#34495e',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartaVolteada: { backgroundColor: '#fff' },
  cartaOculta: { backgroundColor: '#0984e3' },

  // MATH
  mathCard: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 20,
    marginBottom: 40,
    width: '80%',
    alignItems: 'center',
    elevation: 10,
  },
  mathText: { fontSize: 50, fontWeight: 'bold', color: '#2d3436' },
  btnMath: {
    backgroundColor: '#e67e22',
    padding: 20,
    borderRadius: 15,
    minWidth: 90,
    alignItems: 'center',
    margin: 5,
  },
  txtMath: { color: 'white', fontSize: 24, fontWeight: 'bold' },

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
  btnSalirMapaFlotante: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    backgroundColor: '#d63031',
    padding: 12,
    borderRadius: 30,
    elevation: 10,
  },

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
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  recordLabel: { color: '#b2bec3', fontSize: 18 },
  recordValue: { color: '#00cec9', fontSize: 20, fontWeight: 'bold' },

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
  modalList: {
    width: '80%',
    backgroundColor: '#2d3436',
    borderRadius: 15,
    padding: 20,
    maxHeight: '60%',
  },
  itemLista: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#636e72',
  },
  txtItem: { color: 'white', fontSize: 18, textAlign: 'center' },
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
  tutorialTxt: { color: 'white', fontSize: 16, lineHeight: 24 },
});
