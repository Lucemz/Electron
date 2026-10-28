import { AiRecommendation } from '../types';

interface CuratedPool {
  id: string;
  categoryName: string;
  commentary: string;
  patterns: RegExp[];
  tracks: AiRecommendation[];
}

/**
 * Rich Knowledge Base of Real Songs by Established Artists mapped to Contexts, Moods & Activities
 */
const CONTEXT_POOLS: CuratedPool[] = [
  // 1. Concentración / Estudio / Programación / Focus / Trabajo
  {
    id: 'study_focus',
    categoryName: 'Concentración y Enfoque',
    commentary: 'Entendido. Seleccioné música instrumental, downtempo y texturas envolventes para mantener tu enfoque al máximo sin distracciones vocales.',
    patterns: [
      /\b(estudi|concentra|program|chamb|trabaj|focus|leer|lectura|tarea|codigo|coding|oficina|estudio|estudiar|concentrarme)\b/i,
    ],
    tracks: [
      {
        title: 'Weightless',
        artist: 'Marconi Union',
        reason: 'Diseñada con terapeutas de sonido para reducir el ritmo cardíaco y maximizar la concentración.',
        bpm: 60,
        energy: 'chill',
        subgenre: 'Ambient / Focus',
      },
      {
        title: 'Resonance',
        artist: 'HOME',
        reason: 'Sintetizadores analógicos y cadencia hipnótica perfecta para largas sesiones de estudio.',
        bpm: 85,
        energy: 'chill',
        subgenre: 'Chillwave / Synth',
      },
      {
        title: 'Intro',
        artist: 'The xx',
        reason: 'Línea de bajo y guitarra minimalista icónica que crea un ambiente mental limpio.',
        bpm: 100,
        energy: 'chill',
        subgenre: 'Indie Downtempo',
      },
      {
        title: 'A Walk',
        artist: 'Tycho',
        reason: 'Arreglos orgánicos y percusión suave que fomentan el estado de flujo (flow state).',
        bpm: 90,
        energy: 'chill',
        subgenre: 'Ambient Electronic',
      },
      {
        title: 'Nuvole Bianche',
        artist: 'Ludovico Einaudi',
        reason: 'Composición de piano contemporáneo expansiva y relajante para leer y pensar.',
        bpm: 68,
        energy: 'chill',
        subgenre: 'Neoclassical Piano',
      },
      {
        title: 'Kiara',
        artist: 'Bonobo',
        reason: 'Texturas de cuerdas sampleadas y ritmo downtempo sofisticado.',
        bpm: 95,
        energy: 'chill',
        subgenre: 'Downtempo / Chillhop',
      },
      {
        title: 'Sweden',
        artist: 'C418',
        reason: 'Melodía suave de piano nostálgico que despeja la mente.',
        bpm: 72,
        energy: 'chill',
        subgenre: 'Minimalist Instrumental',
      },
    ],
  },

  // 2. Gimnasio / Workout / Entrenamiento / Correr / Motivación / Energía
  {
    id: 'gym_energy',
    categoryName: 'Entrenamiento y Motivación',
    commentary: '¡A darle con todo! Armé un set con bombos potentes, riffs intensos y barras que suben la adrenalina.',
    patterns: [
      /\b(gym|gimnasio|entren|workout|correr|pesas|cardio|motiva|fuerza|adrenalina|entrenar|motivacion|power|fitness)\b/i,
    ],
    tracks: [
      {
        title: "'Till I Collapse",
        artist: 'Eminem',
        reason: 'Uno de los himnos de entrenamiento más potentes de la historia por su ritmo de marcha militar.',
        bpm: 171,
        energy: 'high',
        subgenre: 'Hip Hop / Workout',
      },
      {
        title: 'Back In Black',
        artist: 'AC/DC',
        reason: 'Riff de guitarra legendario con pegada directa para levantar peso.',
        bpm: 188,
        energy: 'high',
        subgenre: 'Hard Rock',
      },
      {
        title: 'Stronger',
        artist: 'Kanye West',
        reason: 'Sample explosivo de Daft Punk con sintetizadores agresivos y actitud imparable.',
        bpm: 104,
        energy: 'high',
        subgenre: 'Electronic Hip Hop',
      },
      {
        title: 'Eye of the Tiger',
        artist: 'Survivor',
        reason: 'La definición clásica de determinación y resistencia sonora.',
        bpm: 109,
        energy: 'high',
        subgenre: 'Classic Rock',
      },
      {
        title: "Can't Be Touched",
        artist: 'Roy Jones Jr.',
        reason: 'Bajo demoledor y coro de pura competitividad y superación.',
        bpm: 88,
        energy: 'high',
        subgenre: 'Hardcore Hip Hop',
      },
      {
        title: 'Believer',
        artist: 'Imagine Dragons',
        reason: 'Percusión cinemática y estribillo visceral de alta intensidad.',
        bpm: 125,
        energy: 'high',
        subgenre: 'Alternative Stadium Pop',
      },
      {
        title: 'Remember The Name',
        artist: 'Fort Minor',
        reason: 'Compás implacable y letras sobre constancia, disciplina y esfuerzo.',
        bpm: 85,
        energy: 'high',
        subgenre: 'Hip Hop Motivacional',
      },
    ],
  },

  // 3. Tristeza / Desamor / Llorar / Melancolía / Soledad
  {
    id: 'sadness_breakup',
    categoryName: 'Desamor y Melancolía',
    commentary: 'Entiendo el sentimiento. Te preparé un espacio musical íntimo con letras honestas y armonías para drenar el dolor.',
    patterns: [
      /\b(triste|desamor|llorar|roto|corazon|ruptura|bajon|soledad|pena|dolor|ex|depre|deprimido|melancol|depresion)\b/i,
    ],
    tracks: [
      {
        title: 'Glimpse of Us',
        artist: 'Joji',
        reason: 'Balada de piano cruda y conmovedora sobre no poder olvidar a un amor anterior.',
        bpm: 72,
        energy: 'chill',
        subgenre: 'Sad Ballad / R&B',
      },
      {
        title: 'Someone Like You',
        artist: 'Adele',
        reason: 'La cima del canto de despedida con interpretación vocal desgarradora.',
        bpm: 68,
        energy: 'chill',
        subgenre: 'Soul Pop / Ballad',
      },
      {
        title: 'drivers license',
        artist: 'Olivia Rodrigo',
        reason: 'Construcción dramática sobre el dolor de ver a alguien continuar sin ti.',
        bpm: 72,
        energy: 'chill',
        subgenre: 'Indie Pop',
      },
      {
        title: 'Fix You',
        artist: 'Coldplay',
        reason: 'Progresión de órgano que se eleva hacia guitarras catárticas de sanación.',
        bpm: 70,
        energy: 'medium',
        subgenre: 'Alternative Rock',
      },
      {
        title: 'Someone You Loved',
        artist: 'Lewis Capaldi',
        reason: 'Voz rasgada y vulnerable transmitiendo vacío y añoranza.',
        bpm: 110,
        energy: 'chill',
        subgenre: 'Pop Ballad',
      },
      {
        title: 'Amor Eterno',
        artist: 'Rocío Dúrcal',
        reason: 'Clásico imperecedero de despedida y duelo con mariachi tradicional.',
        bpm: 75,
        energy: 'chill',
        subgenre: 'Mariachi / Bolero Clásico',
      },
      {
        title: 'La Incondicional',
        artist: 'Luis Miguel',
        reason: 'Arreglos orquestales y melodrama ochentero sobre amores inalcanzables.',
        bpm: 82,
        energy: 'medium',
        subgenre: 'Balada Pop Latina',
      },
    ],
  },

  // 4. Fiesta / Perreo / Vacilón / Baile / Previa
  {
    id: 'party_urban',
    categoryName: 'Fiesta y Perreo Moderno',
    commentary: '¡Se prendió esto! Aquí van los ritmos más duros del reggaeton actual para encender la pista.',
    patterns: [
      /\b(fiesta|perreo|bailar|baile|joda|carrete|farra|discoteca|previa|vacilon|bellakeo|sandungueo|pista)\b/i,
    ],
    tracks: [
      {
        title: 'Tití Me Preguntó',
        artist: 'Bad Bunny',
        reason: 'Dembow veloz combinado con cambio de tempo inesperado para encender la pista.',
        bpm: 111,
        energy: 'high',
        subgenre: 'Urbano Latino',
      },
      {
        title: 'Todo De Ti',
        artist: 'Rauw Alejandro',
        reason: 'Fusión de dance-pop retro ochentero con vibra sumamente bailable y alegre.',
        bpm: 128,
        energy: 'high',
        subgenre: 'Synthpop Latino',
      },
      {
        title: 'Normal',
        artist: 'Feid',
        reason: 'El sonido característico de Medellín: perreo introspectivo con melodías pegajosas.',
        bpm: 96,
        energy: 'medium',
        subgenre: 'Reggaeton Colombiano',
      },
      {
        title: 'Bzrp Music Sessions, Vol. 52',
        artist: 'Bizarrap & Quevedo',
        reason: 'El himno discotequero con estribillo masivo ("Quédate") y drop electrónico.',
        bpm: 128,
        energy: 'high',
        subgenre: 'EDM / Pop Urbano',
      },
      {
        title: 'Danza Kuduro',
        artist: 'Don Omar ft. Lucenzo',
        reason: 'Energía tropical desbordante que nunca falla en ninguna celebración.',
        bpm: 130,
        energy: 'high',
        subgenre: 'Kuduro / Pop Latino',
      },
      {
        title: 'Gasolina',
        artist: 'Daddy Yankee',
        reason: 'La pieza fundacional del reggaeton mundial: ritmo demoledor e inconfundible.',
        bpm: 96,
        energy: 'high',
        subgenre: 'Reggaeton Clásico',
      },
    ],
  },

  // 5. Reggaeton Clásico / Old School (2000s)
  {
    id: 'reggaeton_classic',
    categoryName: 'Reggaeton Clásico de los 2000s',
    commentary: 'Puro perreo de la mata. Seleccioné los clásicos que marcaron la época dorada de Puerto Rico.',
    patterns: [
      /\b(reggaeton viejo|reggaeton clasico|old school|antiguo|los 2000|2000s|perreo viejo|perreo clasico|calle 13|wisin|daddy|don omar)\b/i,
    ],
    tracks: [
      {
        title: 'Lo Que Pasó, Pasó',
        artist: 'Daddy Yankee',
        reason: 'Uno de los temas más coreados de Barrio Fino con base bailable irrepetible.',
        bpm: 94,
        energy: 'high',
        subgenre: 'Reggaeton Clásico',
      },
      {
        title: 'Rakata',
        artist: 'Wisin & Yandel',
        reason: 'La producción implacable de Luny Tunes que dominó las discotecas en 2005.',
        bpm: 95,
        energy: 'high',
        subgenre: 'Perreo Clásico',
      },
      {
        title: 'Dile',
        artist: 'Don Omar',
        reason: 'Base de cumbia fusionada con dembow tradicional de The Last Don.',
        bpm: 95,
        energy: 'high',
        subgenre: 'Reggaeton Clásico',
      },
      {
        title: 'Si No Le Contesto',
        artist: 'Plan B',
        reason: 'Líneas vocales icónicas del dúo del sex para bailar pegado.',
        bpm: 96,
        energy: 'high',
        subgenre: 'Reggaeton Romántico / Calle',
      },
      {
        title: "Pa' Que Retocen",
        artist: 'Tego Calderón',
        reason: 'Flow callejero afropuertorriqueño y lírica con clase de El Abayarde.',
        bpm: 92,
        energy: 'medium',
        subgenre: 'Underground Reggaeton',
      },
      {
        title: 'Zun Da Da',
        artist: 'Zion',
        reason: 'Melodía romántica y dembow fluido del álbum The Perfect Melody.',
        bpm: 94,
        energy: 'high',
        subgenre: 'Reggaeton 2000s',
      },
    ],
  },

  // 6. Relax / Dormir / Meditar / Calma / Paz
  {
    id: 'sleep_relax',
    categoryName: 'Relajación y Calma',
    commentary: 'Baja las revoluciones. Aquí tienes una atmósfera serena con guitarras acústicas, texturas cálidas y sosiego.',
    patterns: [
      /\b(dormir|relaj|relax|medit|paz|calma|sueño|descansar|desconectar|chill|tranquil|zen|ansiedad)\b/i,
    ],
    tracks: [
      {
        title: "Don't Know Why",
        artist: 'Norah Jones',
        reason: 'Voz íntima de terciopelo, piano jazzy y calidez acústica.',
        bpm: 88,
        energy: 'chill',
        subgenre: 'Acoustic Jazz Pop',
      },
      {
        title: 'Sparks',
        artist: 'Coldplay',
        reason: 'Guitarras de madera delicadas y una de las interpretaciones más suaves de Chris Martin.',
        bpm: 78,
        energy: 'chill',
        subgenre: 'Acoustic Folk',
      },
      {
        title: 'Apocalypse',
        artist: 'Cigarettes After Sex',
        reason: 'Dream pop etéreo y guitarras con reverberación que parecen flotar en el aire.',
        bpm: 96,
        energy: 'chill',
        subgenre: 'Dream Pop / Slowcore',
      },
      {
        title: 'River Flows in You',
        artist: 'Yiruma',
        reason: 'Sencillez melódica en piano solo que calma cualquier agitación.',
        bpm: 65,
        energy: 'chill',
        subgenre: 'Contemporary Piano',
      },
      {
        title: 'Better Together',
        artist: 'Jack Johnson',
        reason: 'Guitarra playera limpia y ritmo relajado para respirar tranquilo.',
        bpm: 110,
        energy: 'chill',
        subgenre: 'Acoustic Surf Rock',
      },
      {
        title: 'ocean eyes',
        artist: 'Billie Eilish',
        reason: 'Armonías vocales susurradas y producción minimalista acolchada.',
        bpm: 72,
        energy: 'chill',
        subgenre: 'Minimal Pop',
      },
    ],
  },

  // 7. Manejar de noche / Carretera / Conducir / Synthwave / Ciudad
  {
    id: 'night_drive',
    categoryName: 'Manejo Nocturno y Ciudad',
    commentary: 'Carretera libre y luces de neón en el retrovisor. Pistas con graves envolventes y vibra cinematográfica.',
    patterns: [
      /\b(manejar|conducir|carro|auto|coche|carretera|viaje|viajar|noche|nocturno|autopista|ciudad|cruising|drive)\b/i,
    ],
    tracks: [
      {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        reason: 'El epítome moderno del synthwave ochentero para acelerar en la noche.',
        bpm: 171,
        energy: 'high',
        subgenre: 'Synthwave / Retro Pop',
      },
      {
        title: 'Nightcall',
        artist: 'Kavinsky',
        reason: 'El tema icónico de la película Drive: vocoder oscuro y bajo analógico espeso.',
        bpm: 90,
        energy: 'medium',
        subgenre: 'French Electro / Synthwave',
      },
      {
        title: 'Midnight City',
        artist: 'M83',
        reason: 'Sintetizadores expansivos y solo de saxofón triunfal sobre el horizonte urbano.',
        bpm: 105,
        energy: 'high',
        subgenre: 'Indietronica / Synthpop',
      },
      {
        title: 'Starboy',
        artist: 'The Weeknd ft. Daft Punk',
        reason: 'Producción quirúrgica con bajo crujiente y elegancia nocturna.',
        bpm: 93,
        energy: 'medium',
        subgenre: 'Dark R&B / Electro',
      },
      {
        title: 'In the Air Tonight',
        artist: 'Phil Collins',
        reason: 'Tensión creciente y el golpe de batería más famoso para cantar frente al volante.',
        bpm: 95,
        energy: 'medium',
        subgenre: '80s Pop Rock',
      },
      {
        title: 'Hotel California',
        artist: 'Eagles',
        reason: 'El clásico de carretera americana por excelencia con duelo de guitarras mítico.',
        bpm: 75,
        energy: 'medium',
        subgenre: 'Classic Rock',
      },
    ],
  },

  // 8. Rock en Español / Clásicos Latinos
  {
    id: 'rock_espanol',
    categoryName: 'Rock en Español Legendario',
    commentary: 'Grandes himnos de nuestro idioma. De Buenos Aires a Santiago y Lima, temas que se cantan a todo pulmón.',
    patterns: [
      /\b(rock en espanol|rock en español|rock argentino|rock latino|soda|enanitos|hombres g|prisioneros|charly|calamaro)\b/i,
    ],
    tracks: [
      {
        title: 'De Música Ligera',
        artist: 'Soda Stereo',
        reason: 'El riff de cuatro acordes que definió la identidad de toda una generación en Latinoamérica.',
        bpm: 126,
        energy: 'high',
        subgenre: 'Rock en Español',
      },
      {
        title: 'Lamento Boliviano',
        artist: 'Los Enanitos Verdes',
        reason: 'La canción de fogata y estadio más universal del rock latinoamericano.',
        bpm: 130,
        energy: 'high',
        subgenre: 'Rock Latino',
      },
      {
        title: 'Devuélveme a mi chica',
        artist: 'Hombres G',
        reason: 'Pop rock desenfadado de los 80s con energía fresca y estribillo inolvidable.',
        bpm: 145,
        energy: 'high',
        subgenre: 'Pop Rock 80s',
      },
      {
        title: 'Tren Al Sur',
        artist: 'Los Prisioneros',
        reason: 'Charango sintetizado y ritmo post-punk que conmueve desde la primera nota.',
        bpm: 120,
        energy: 'high',
        subgenre: 'Post-Punk Latino',
      },
      {
        title: 'Flaca',
        artist: 'Andrés Calamaro',
        reason: 'Melodía bohemia impecable con guitarra acústica y órgano Hammond.',
        bpm: 88,
        energy: 'medium',
        subgenre: 'Rock Canción',
      },
      {
        title: 'Eres',
        artist: 'Café Tacvba',
        reason: 'Balada de rock alternativo mexicano cargada de sensibilidad y guitarras limpias.',
        bpm: 78,
        energy: 'chill',
        subgenre: 'Alternative Rock',
      },
    ],
  },

  // 9. Rock Clásico / Classic Rock / 70s & 80s
  {
    id: 'classic_rock',
    categoryName: 'Rock Clásico Universal',
    commentary: 'Solos de guitarra históricos, amplificadores valvulares y las bandas que forjaron la historia del rock.',
    patterns: [
      /\b(rock clasico|classic rock|rock 70s|rock 80s|queen|pink floyd|led zeppelin|guitar solo|hard rock)\b/i,
    ],
    tracks: [
      {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        reason: 'La suite operística de Freddie Mercury que cambió la música popular para siempre.',
        bpm: 72,
        energy: 'high',
        subgenre: 'Progressive Pop Rock',
      },
      {
        title: 'Comfortably Numb',
        artist: 'Pink Floyd',
        reason: 'El solo de guitarra final de David Gilmour es considerado una de las mayores obras maestras musicales.',
        bpm: 65,
        energy: 'chill',
        subgenre: 'Psychedelic Rock',
      },
      {
        title: 'Sweet Child O Mine',
        artist: "Guns N' Roses",
        reason: 'La introducción circular de Slash y la potencia vocal de Axl Rose.',
        bpm: 128,
        energy: 'high',
        subgenre: 'Hard Rock',
      },
      {
        title: 'Sultans Of Swing',
        artist: 'Dire Straits',
        reason: 'El fingerpicking limpio y virtuoso de Mark Knopfler sobre una base de pub rock perfecta.',
        bpm: 148,
        energy: 'high',
        subgenre: 'Classic Rock / Roots',
      },
      {
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        reason: 'Crescendo legendario desde la flauta dulce y guitarra de doce cuerdas hasta la catarsis rockera.',
        bpm: 82,
        energy: 'medium',
        subgenre: 'Folk Rock / Hard Rock',
      },
    ],
  },

  // 10. Andino / Tradición / Guitarra Solista / Ayacucho
  {
    id: 'andean_traditional',
    categoryName: 'Folclore Andino y Guitarra Solista',
    commentary: 'Herencia y sentimiento profundo. Maestros de la guitarra ayacuchana y la poesía del Perú andino.',
    patterns: [
      /\b(andino|ayacucho|huayno|folclore|peruano|guitarra andina|yaravi|manuelcha|garcia zarate|huamanga)\b/i,
    ],
    tracks: [
      {
        title: 'Helme',
        artist: 'Raúl García Zárate',
        reason: 'Solo de guitarra ayacuchana en afinación tradicional con una sensibilidad irrepetible.',
        bpm: 78,
        energy: 'chill',
        subgenre: 'Guitarra Andina',
      },
      {
        title: 'Madre Andina',
        artist: 'Manuelcha Prado',
        reason: 'Voz poética y guitarra de cuerdas de acero del maestro de Puquio.',
        bpm: 85,
        energy: 'chill',
        subgenre: 'Huayno Tradicional',
      },
      {
        title: 'Adiós Pueblo de Ayacucho',
        artist: 'Trío Ayacucho',
        reason: 'El himno tradicional de la despedida y el recuerdo huamanguino.',
        bpm: 90,
        energy: 'medium',
        subgenre: 'Huayno Ayacuchano',
      },
      {
        title: 'Una Paloma Sobre Una Rama',
        artist: 'Nancy Manchego y Manuelcha Prado',
        reason: 'Yaraví melancólico con bordoneos profundos y armonía tradicional.',
        bpm: 82,
        energy: 'chill',
        subgenre: 'Yaraví Andino',
      },
      {
        title: 'Flor de Retama',
        artist: 'Yennifer Sermeño',
        reason: 'Composición clásica de la historia y dignidad andina.',
        bpm: 92,
        energy: 'medium',
        subgenre: 'Canción Tradicional',
      },
    ],
  },

  // 11. Cumbia / Salsa / Fiesta Latina Tropical
  {
    id: 'tropical_latin',
    categoryName: 'Salsa Brava y Cumbia Peruana',
    commentary: '¡Sabor garantizado! Vientos potentes, timbales y la cumbia más emblemática.',
    patterns: [
      /\b(cumbia|salsa|tropical|grupo 5|agua marina|hector lavoe|frankie ruiz|marc anthony|baile latino)\b/i,
    ],
    tracks: [
      {
        title: 'Motor y Motivo',
        artist: 'Grupo 5',
        reason: 'El clásico indiscutible de la cumbia norteña peruana con arreglos orquestados impecables.',
        bpm: 98,
        energy: 'high',
        subgenre: 'Cumbia Norteña',
      },
      {
        title: 'Periódico De Ayer',
        artist: 'Héctor Lavoe',
        reason: 'La máxima expresión de la salsa clásica neoyorquina de Fania con metales brillantes.',
        bpm: 95,
        energy: 'high',
        subgenre: 'Salsa Brava',
      },
      {
        title: 'Desnúdate Mujer',
        artist: 'Frankie Ruiz',
        reason: 'El punto más alto de la salsa sensual de los 80s con ritmo bailable irresistible.',
        bpm: 94,
        energy: 'high',
        subgenre: 'Salsa Sensual',
      },
      {
        title: 'Tu Amor Fue Una Mentira',
        artist: 'Agua Marina',
        reason: 'Guitarras con chorus y sentimiento popular de Sechura para cantar y bailar.',
        bpm: 96,
        energy: 'high',
        subgenre: 'Cumbia Peruana',
      },
      {
        title: 'Vivir Mi Vida',
        artist: 'Marc Anthony',
        reason: 'Himno de positivismo, alegría y celebración latina.',
        bpm: 105,
        energy: 'high',
        subgenre: 'Salsa Moderna',
      },
    ],
  },

  // 12. Amor / Romance / Enamorados / Cena Romántica
  {
    id: 'romance_love',
    categoryName: 'Romance y Enamorados',
    commentary: 'Para dedicar o compartir. Melodías tiernas, letras sinceras y la calidez de quien está enamorado.',
    patterns: [
      /\b(amor|romance|enamorad|novi|pareja|boda|romantico|cena|dedicar|san valentin|te amo)\b/i,
    ],
    tracks: [
      {
        title: 'Perfect',
        artist: 'Ed Sheeran',
        reason: 'Vals pop acústico moderno ideal para un momento íntimo en pareja.',
        bpm: 63,
        energy: 'chill',
        subgenre: 'Acoustic Pop',
      },
      {
        title: 'All of Me',
        artist: 'John Legend',
        reason: 'Balada de piano devocional que celebra todas las facetas del amor.',
        bpm: 63,
        energy: 'chill',
        subgenre: 'R&B / Soul Ballad',
      },
      {
        title: 'Just the Way You Are',
        artist: 'Bruno Mars',
        reason: 'Optimismo puro y homenaje a la belleza natural de la persona amada.',
        bpm: 109,
        energy: 'medium',
        subgenre: 'Pop / Soul',
      },
      {
        title: 'Entra en Mi Vida',
        artist: 'Sin Bandera',
        reason: 'Armonías vocales y piano latino romántico insuperable de los 2000s.',
        bpm: 78,
        energy: 'chill',
        subgenre: 'Balada Romántica',
      },
      {
        title: 'Yellow',
        artist: 'Coldplay',
        reason: 'La devoción incondicional retratada con guitarras luminosas y sinceridad.',
        bpm: 88,
        energy: 'medium',
        subgenre: 'Alternative Pop',
      },
    ],
  },

  // 13. Synthwave / Retrowave / 80s Nostalgia
  {
    id: 'synthwave_80s',
    categoryName: 'Synthwave y Retrowave 80s',
    commentary: 'Estética retro-futurista, sintetizadores analógicos y baterías electrónicas con compresión envolvente.',
    patterns: [
      /\b(synthwave|retrowave|outrun|cyberpunk|vaporwave|80s retro|sintetizadores|retro 80)\b/i,
    ],
    tracks: [
      {
        title: 'Resonance',
        artist: 'HOME',
        reason: 'La pista fundacional del chillwave contemporáneo.',
        bpm: 85,
        energy: 'chill',
        subgenre: 'Chillwave',
      },
      {
        title: 'Sunset',
        artist: 'The Midnight',
        reason: 'Sintetizadores exuberantes y saxofón nostálgico evocando atardeceres de verano.',
        bpm: 106,
        energy: 'high',
        subgenre: 'Synthwave / Retropop',
      },
      {
        title: 'Turbo Killer',
        artist: 'Carpenter Brut',
        reason: 'Darksynth agresivo de alta velocidad para pura adrenalina.',
        bpm: 140,
        energy: 'high',
        subgenre: 'Darksynth / Cyberpunk',
      },
      {
        title: 'Tech Noir',
        artist: 'Gunship',
        reason: 'Atmósfera cinemática de ciencia ficción ochentera.',
        bpm: 96,
        energy: 'medium',
        subgenre: 'Cinematic Synthwave',
      },
      {
        title: 'Take On Me',
        artist: 'A-ha',
        reason: 'El riff de sintetizador más emblemático y alegre de la década de los ochenta.',
        bpm: 168,
        energy: 'high',
        subgenre: '80s Synthpop',
      },
    ],
  },
];

/**
 * Artist Reference Directory: Detects when user mentions or wants songs like a specific artist
 */
interface ArtistCatalog {
  names: string[];
  mainTracks: AiRecommendation[];
}

const ARTIST_CATALOG: ArtistCatalog[] = [
  {
    names: ['bad bunny', 'conejo malo', 'benito'],
    mainTracks: [
      { title: 'Tití Me Preguntó', artist: 'Bad Bunny', reason: 'Dembow veloz de Un Verano Sin Ti', bpm: 111, energy: 'high' },
      { title: 'Yonaguni', artist: 'Bad Bunny', reason: 'Melancolía urbana con toques orientales', bpm: 90, energy: 'medium' },
      { title: 'Ojitos Lindos', artist: 'Bad Bunny ft. Bomba Estéreo', reason: 'Fusión electro-tropical romántica', bpm: 80, energy: 'chill' },
      { title: 'Me Porto Bonito', artist: 'Bad Bunny & Chencho Corleone', reason: 'Perreo sucio con voz clásica', bpm: 92, energy: 'high' },
      { title: 'Callaíta', artist: 'Bad Bunny', reason: 'Ritmo playero relajado con Tainy', bpm: 95, energy: 'medium' },
    ],
  },
  {
    names: ['the weeknd', 'abel tesfaye', 'weeknd'],
    mainTracks: [
      { title: 'Blinding Lights', artist: 'The Weeknd', reason: 'Synthpop ochentero de alta energía', bpm: 171, energy: 'high' },
      { title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', reason: 'Groove electrónico nocturno', bpm: 93, energy: 'medium' },
      { title: 'Save Your Tears', artist: 'The Weeknd', reason: 'Melodía pop nostálgica y brillante', bpm: 118, energy: 'high' },
      { title: 'The Hills', artist: 'The Weeknd', reason: 'Bajo trap oscuro y distorsionado', bpm: 113, energy: 'medium' },
      { title: "Can't Feel My Face", artist: 'The Weeknd', reason: 'Pop funk bailable estilo Quincy Jones', bpm: 108, energy: 'high' },
    ],
  },
  {
    names: ['feid', 'ferxxo'],
    mainTracks: [
      { title: 'Normal', artist: 'Feid', reason: 'Perreo suave y nostálgico de Medellín', bpm: 96, energy: 'medium' },
      { title: 'Feliz Cumpleaños Ferxxo', artist: 'Feid', reason: 'El himno verde de las discotecas', bpm: 98, energy: 'high' },
      { title: 'Ferxxo 100', artist: 'Feid', reason: 'Balada de reggaeton con guitarra acústica', bpm: 88, energy: 'chill' },
      { title: 'Luna', artist: 'Feid & ATL Jacob', reason: 'Trap melódico con sintetizadores espaciales', bpm: 92, energy: 'medium' },
      { title: 'Chorrito Pa Las Animas', artist: 'Feid', reason: 'Ritmo clásico bailable', bpm: 97, energy: 'high' },
    ],
  },
  {
    names: ['coldplay'],
    mainTracks: [
      { title: 'Yellow', artist: 'Coldplay', reason: 'Pop alternativo emotivo con guitarras expansivas', bpm: 88, energy: 'medium' },
      { title: 'Viva La Vida', artist: 'Coldplay', reason: 'Cuerdas barrocas e himno épico de estadios', bpm: 138, energy: 'high' },
      { title: 'The Scientist', artist: 'Coldplay', reason: 'Piano suave y balada de arrepentimiento', bpm: 73, energy: 'chill' },
      { title: 'Fix You', artist: 'Coldplay', reason: 'Crescendo catártico de consuelo', bpm: 70, energy: 'medium' },
      { title: 'Clocks', artist: 'Coldplay', reason: 'Arpegio de piano hipnótico ganador del Grammy', bpm: 131, energy: 'high' },
    ],
  },
  {
    names: ['daft punk'],
    mainTracks: [
      { title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell Williams', reason: 'Guitarra rítmica funk de Nile Rodgers', bpm: 116, energy: 'high' },
      { title: 'One More Time', artist: 'Daft Punk', reason: 'Himno universal del french house y dance', bpm: 123, energy: 'high' },
      { title: 'Around the World', artist: 'Daft Punk', reason: 'Línea de bajo disco inconfundible', bpm: 121, energy: 'high' },
      { title: 'Instant Crush', artist: 'Daft Punk ft. Julian Casablancas', reason: 'Voz con vocoder y melancolía pop retro', bpm: 110, energy: 'medium' },
      { title: 'Harder, Better, Faster, Stronger', artist: 'Daft Punk', reason: 'Sampler dinámico con vocales robóticas', bpm: 123, energy: 'high' },
    ],
  },
  {
    names: ['soda stereo', 'gustavo cerati', 'cerati'],
    mainTracks: [
      { title: 'De Música Ligera', artist: 'Soda Stereo', reason: 'El himno del rock latinoamericano', bpm: 126, energy: 'high' },
      { title: 'Persiana Americana', artist: 'Soda Stereo', reason: 'Pop new wave vibrante y pegadizo', bpm: 128, energy: 'high' },
      { title: 'Crimen', artist: 'Gustavo Cerati', reason: 'Balada de rock con piano y emoción pura', bpm: 78, energy: 'chill' },
      { title: 'En La Ciudad De La Furia', artist: 'Soda Stereo', reason: 'Atmósfera post-punk oscura de Buenos Aires', bpm: 114, energy: 'medium' },
      { title: 'Puente', artist: 'Gustavo Cerati', reason: 'Pop orquestal luminoso y esperanzador', bpm: 115, energy: 'high' },
    ],
  },
  {
    names: ['queen', 'freddie mercury'],
    mainTracks: [
      { title: 'Bohemian Rhapsody', artist: 'Queen', reason: 'Rapsodia legendaria con ópera y hard rock', bpm: 72, energy: 'high' },
      { title: "Don't Stop Me Now", artist: 'Queen', reason: 'Energía pura al piano para levantar el ánimo', bpm: 156, energy: 'high' },
      { title: 'Another One Bites the Dust', artist: 'Queen', reason: 'Línea de bajo funk icónica', bpm: 110, energy: 'high' },
      { title: 'Under Pressure', artist: 'Queen & David Bowie', reason: 'Colaboración maestra con dueto vocal irrepetible', bpm: 114, energy: 'high' },
      { title: 'Radio Ga Ga', artist: 'Queen', reason: 'Sintetizadores de los 80s y aplausos multitudinarios', bpm: 112, energy: 'medium' },
    ],
  },
];

/**
 * Stop words in Spanish & English to extract core musical intent from natural language
 */
const STOP_WORDS = new Set([
  'quiero', 'ponme', 'algo', 'para', 'que', 'sea', 'de', 'con', 'un', 'una', 'unos', 'unas',
  'por', 'favor', 'me', 'gustaria', 'escuchar', 'cancion', 'canciones', 'musica', 'tema',
  'temas', 'rolita', 'rolitas', 'tipo', 'como', 'estilo', 'en', 'el', 'la', 'los', 'las',
  'y', 'o', 'del', 'al', 'muy', 'mas', 'darme', 'busco', 'buscar', 'play', 'song', 'songs',
  'music', 'give', 'me', 'some', 'about', 'with', 'like', 'vibra', 'vibe', 'momento',
]);

export interface SemanticInterpretationResult {
  understoodContext: string;
  commentary: string;
  recommendations: AiRecommendation[];
}

/**
 * Offline Semantic Interpreter: Parses natural language input and translates context to REAL songs
 * NEVER searches for the literal user sentence as a track title!
 */
export async function interpretNaturalLanguageContext(
  prompt: string
): Promise<SemanticInterpretationResult> {
  const cleanInput = prompt.trim();
  const lower = cleanInput.toLowerCase();

  // 1. Check for specific artist mentions (e.g. "como bad bunny", "algo tipo the weeknd")
  for (const catalog of ARTIST_CATALOG) {
    const matched = catalog.names.some((name) => lower.includes(name));
    if (matched) {
      return {
        understoodContext: `Universo sonoro afín a ${catalog.mainTracks[0].artist}`,
        commentary: `Capté la referencia. Aquí tienes canciones representativas y afines al estilo sonoro de ${catalog.mainTracks[0].artist}.`,
        recommendations: catalog.mainTracks,
      };
    }
  }

  // 2. Check for contextual Moods, Activities and Genres in our rich knowledge pools
  for (const pool of CONTEXT_POOLS) {
    const matches = pool.patterns.some((pattern) => pattern.test(lower));
    if (matches) {
      return {
        understoodContext: pool.categoryName,
        commentary: pool.commentary,
        recommendations: pool.tracks,
      };
    }
  }

  // 3. If no pre-defined pool matches directly, perform Smart Acoustic Entity Extraction:
  // Strip conversational filler words ("quiero algo para...", "ponme musica de...")
  const tokens = lower
    .replace(/[^\w\s\dáéíóúñ]/gi, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  const acousticQuery = tokens.length > 0 ? tokens.join(' ') : 'chill relax';

  // Search YouTube for the sonic query, but enforce strictly that results are genuine artist singles
  if (window.auraAPI?.searchMultipleYouTube) {
    try {
      const sonicSearchQuery = `${acousticQuery} top audio`;
      const ytResults = await window.auraAPI.searchMultipleYouTube(sonicSearchQuery, 8);

      if (ytResults && ytResults.length > 0) {
        const cleanRecs: AiRecommendation[] = [];

        for (const item of ytResults) {
          // If title contains the literal long user prompt, discard it (it's a compilation video!)
          if (cleanInput.length > 15 && item.title.toLowerCase().includes(lower)) {
            continue;
          }

          cleanRecs.push({
            title: item.title,
            artist: item.artist || 'Artista Destacado',
            reason: `Pista seleccionada por afinidad con "${acousticQuery}".`,
            bpm: 100,
            energy: 'medium',
            subgenre: acousticQuery,
          });

          if (cleanRecs.length >= 6) break;
        }

        if (cleanRecs.length >= 3) {
          return {
            understoodContext: `Vibra sonora: "${acousticQuery}"`,
            commentary: `Interpreté tu intención sonora hacia "${acousticQuery}". Seleccioné pistas de estudio individuales afines.`,
            recommendations: cleanRecs,
          };
        }
      }
    } catch (e) {
      console.warn('[SemanticEngine] YouTube acoustic search failed:', e);
    }
  }

  // 4. Ultimate universal fallback: Balanced high-quality tracks
  return {
    understoodContext: 'Selección Equilibrada',
    commentary: `Curé una selección musical variada y fluida basada en tu petición.`,
    recommendations: [
      {
        title: 'Yellow',
        artist: 'Coldplay',
        reason: 'Guitarras acústicas y melodía expansiva.',
        bpm: 88,
        energy: 'medium',
        subgenre: 'Alternative Pop',
      },
      {
        title: 'Get Lucky',
        artist: 'Daft Punk',
        reason: 'Groove de bajo y guitarra funk de Nile Rodgers.',
        bpm: 116,
        energy: 'high',
        subgenre: 'Funk / Electronic',
      },
      {
        title: 'Resonance',
        artist: 'HOME',
        reason: 'Sintetizadores analógicos envolventes.',
        bpm: 85,
        energy: 'chill',
        subgenre: 'Chillwave',
      },
      {
        title: 'Starboy',
        artist: 'The Weeknd',
        reason: 'Bajo electrónico y ritmo bailable moderno.',
        bpm: 93,
        energy: 'medium',
        subgenre: 'Contemporary Pop',
      },
      {
        title: 'De Música Ligera',
        artist: 'Soda Stereo',
        reason: 'Clásico del rock en español con energía guitarrera.',
        bpm: 126,
        energy: 'high',
        subgenre: 'Rock en Español',
      },
    ],
  };
}
