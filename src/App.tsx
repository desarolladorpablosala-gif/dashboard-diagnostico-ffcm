import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  User, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  ChevronRight,
  Info,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';
import rawData from './data/diagnostico_procesado.json';


// Definición de tipos para TypeScript
interface SkillScores {
  prompts: number;
  docs: number;
  files: number;
  data_analysis: number;
  notebooklm: number;
  gpts: number;
  design: number;
  miniapps: number;
  automation: number;
  privacy: number;
}

interface UserSurveyData {
  timestamp: string;
  raw_name: string;
  raw_department: string;
  freq_work_text: string;
  freq_work_val: number;
  freq_personal_text: string;
  freq_personal_val: number;
  skills: SkillScores;
  actitud: string;
  preocupacion: string;
  area_ahorro: string;
  comentario: string;
}

interface UserRecord {
  name: string;
  department: string;
  is_matched: boolean;
  pre: UserSurveyData | null;
  post: UserSurveyData | null;
}

// Convertir datos importados al tipo adecuado
const usersData = rawData as UserRecord[];

// Etiquetas y descripciones legibles de las habilidades
const SKILLS_META = [
  { key: 'prompts', label: 'Prompts Claros', desc: 'Escribir instrucciones claras y efectivas' },
  { key: 'docs', label: 'Redactar Documentos', desc: 'Crear circulares, actas e informes' },
  { key: 'files', label: 'Analizar Archivos', desc: 'Subir y resumir PDF, Excel o Word' },
  { key: 'data_analysis', label: 'Analizar Datos', desc: 'Extraer tendencias de hojas de cálculo' },
  { key: 'notebooklm', label: 'NotebookLM', desc: 'Consultar normativa sin alucinaciones' },
  { key: 'gpts', label: 'Asistentes GPTs', desc: 'Crear GPTs/Gems personalizados para tareas' },
  { key: 'design', label: 'Diseño e Imágenes', desc: 'Generar carteles y posts para redes' },
  { key: 'miniapps', label: 'Mini Apps', desc: 'Crear herramientas web de ayuda diaria' },
  { key: 'automation', label: 'Automatización', desc: 'Semiautomatizar flujos de trabajo repetitivos' },
  { key: 'privacy', label: 'Seguridad y Privacidad', desc: 'Saber qué datos compartir de forma segura' }
];

export default function App() {
  const [selectedDept, setSelectedDept] = useState<string>('Todos');
  const [selectedPerson, setSelectedPerson] = useState<string>('Todos');
  const [chartMode, setChartMode] = useState<'superpuesto' | 'inicio' | 'fin'>('superpuesto');

  // Obtener lista única de departamentos
  const departments = useMemo(() => {
    const depts = new Set<string>();
    usersData.forEach(u => depts.add(u.department));
    return ['Todos', ...Array.from(depts).sort()];
  }, []);

  // Obtener lista de personas filtradas por departamento
  const people = useMemo(() => {
    let filtered = usersData;
    if (selectedDept !== 'Todos') {
      filtered = filtered.filter(u => u.department === selectedDept);
    }
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedDept]);

  // Manejar cambio de departamento
  const handleDeptChange = (dept: string) => {
    setSelectedDept(dept);
    setSelectedPerson('Todos'); // Resetear persona al cambiar departamento
  };

  // Filtrar los datos para los cálculos
  const filteredUsers = useMemo(() => {
    let result = usersData;
    if (selectedDept !== 'Todos') {
      result = result.filter(u => u.department === selectedDept);
    }
    if (selectedPerson !== 'Todos') {
      result = result.filter(u => u.name === selectedPerson);
    }
    return result;
  }, [selectedDept, selectedPerson]);

  // Calcular las medias para el gráfico
  const chartData = useMemo(() => {
    return SKILLS_META.map(skill => {
      let preSum = 0;
      let preCount = 0;
      let postSum = 0;
      let postCount = 0;

      filteredUsers.forEach(user => {
        if (user.pre && user.pre.skills[skill.key as keyof SkillScores] !== undefined) {
          preSum += user.pre.skills[skill.key as keyof SkillScores];
          preCount++;
        }
        if (user.post && user.post.skills[skill.key as keyof SkillScores] !== undefined) {
          postSum += user.post.skills[skill.key as keyof SkillScores];
          postCount++;
        }
      });

      return {
        habilidad: skill.label,
        'Inicio (Pre)': preCount > 0 ? parseFloat((preSum / preCount).toFixed(2)) : 0,
        'Fin (Post)': postCount > 0 ? parseFloat((postSum / postCount).toFixed(2)) : 0,
      };
    });
  }, [filteredUsers]);

  // Estadísticas globales e individuales
  const stats = useMemo(() => {
    let preSumAll = 0;
    let preCountAll = 0;
    let postSumAll = 0;
    let postCountAll = 0;

    let preFreqW = 0;
    let preFreqWCount = 0;
    let postFreqW = 0;
    let postFreqWCount = 0;

    filteredUsers.forEach(user => {
      // Sumar habilidades
      if (user.pre) {
        Object.values(user.pre.skills).forEach(val => {
          preSumAll += val;
          preCountAll++;
        });
        preFreqW += user.pre.freq_work_val;
        preFreqWCount++;
      }
      if (user.post) {
        Object.values(user.post.skills).forEach(val => {
          postSumAll += val;
          postCountAll++;
        });
        postFreqW += user.post.freq_work_val;
        postFreqWCount++;
      }
    });

    const preAvg = preCountAll > 0 ? preSumAll / preCountAll : 0;
    const postAvg = postCountAll > 0 ? postSumAll / postCountAll : 0;
    const improvementPct = preAvg > 0 ? ((postAvg - preAvg) / preAvg) * 100 : 0;

    const preFreqAvg = preFreqWCount > 0 ? preFreqW / preFreqWCount : 0;
    const postFreqAvg = postFreqWCount > 0 ? postFreqW / postFreqWCount : 0;

    return {
      preAvg: parseFloat(preAvg.toFixed(2)),
      postAvg: parseFloat(postAvg.toFixed(2)),
      improvementPct: parseFloat(improvementPct.toFixed(1)),
      preFreqAvg: parseFloat(preFreqAvg.toFixed(2)),
      postFreqAvg: parseFloat(postFreqAvg.toFixed(2)),
      count: filteredUsers.length,
      matchedCount: filteredUsers.filter(u => u.is_matched).length
    };
  }, [filteredUsers]);

  // Lista de testimonios (comentarios que tengan texto)
  const testimonials = useMemo(() => {
    return filteredUsers.filter(u => (u.pre?.comentario || u.post?.comentario));
  }, [filteredUsers]);

  // Distribución de actitudes
  const actitudData = useMemo(() => {
    const counts: { [key: string]: { pre: number; post: number } } = {
      'Abierto: necesita formación': { pre: 0, post: 0 },
      'Entusiasmado: quiere aprender': { pre: 0, post: 0 },
      'Convencido: usa y quiere profundizar': { pre: 0, post: 0 },
      'Curioso pero cauteloso': { pre: 0, post: 0 },
      'Escéptico': { pre: 0, post: 0 }
    };

    filteredUsers.forEach(u => {
      if (u.pre) {
        const act = u.pre.actitud;
        if (act.includes('Abierto')) counts['Abierto: necesita formación'].pre++;
        else if (act.includes('Entusiasmado')) counts['Entusiasmado: quiere aprender'].pre++;
        else if (act.includes('Convencido')) counts['Convencido: usa y quiere profundizar'].pre++;
        else if (act.includes('Curioso')) counts['Curioso pero cauteloso'].pre++;
        else if (act.includes('Escéptico')) counts['Escéptico'].pre++;
      }
      if (u.post) {
        const act = u.post.actitud;
        if (act.includes('Abierto')) counts['Abierto: necesita formación'].post++;
        else if (act.includes('Entusiasmado')) counts['Entusiasmado: quiere aprender'].post++;
        else if (act.includes('Convencido')) counts['Convencido: usa y quiere profundizar'].post++;
        else if (act.includes('Curioso')) counts['Curioso pero cauteloso'].post++;
        else if (act.includes('Escéptico')) counts['Escéptico'].post++;
      }
    });

    return Object.entries(counts).map(([name, vals]) => ({
      name,
      'Inicio (Pre)': vals.pre,
      'Fin (Post)': vals.post
    }));
  }, [filteredUsers]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* HEADER CORPORATIVO */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm transition-all-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Curso IA FFCM <span className="text-pablo-blue font-semibold font-sans">(Pablo Sala)</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span>Evaluación de Competencias · Junio 2026</span>
                <span className="text-slate-300">•</span>
                <span className="text-ffcm-red font-semibold">Federación de Fútbol de Castilla-La Mancha</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 justify-end">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 shadow-sm">
              <img 
                src="/logo_ffcm.png" 
                alt="FFCM" 
                className="h-10 object-contain hover:scale-105 transition-transform" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              <img 
                src="/Logo_PabloSala.png" 
                alt="Pablo Sala IA" 
                className="h-9 object-contain hover:scale-105 transition-transform" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col gap-8">
        
        {/* PANEL DE KPIs GLOBALES (Permite sacar pecho) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Competencia en IA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-ffcm-red shadow-sm hover:shadow-md transition-all-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-ffcm-red/5 to-transparent rounded-bl-full transition-all group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-ffcm-red/10 rounded-xl text-ffcm-red">
                <Award className="w-6 h-6" />
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1 shadow-sm">
                <TrendingUp className="w-3.5 h-3.5" />
                +{stats.improvementPct}%
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Habilidad General en IA</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-800">{stats.postAvg}</span>
              <span className="text-slate-400 text-sm">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span>Antes:</span>
              <span className="font-bold text-slate-700">{stats.preAvg} / 5.0</span>
            </p>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden flex">
              <div className="bg-slate-300 h-full rounded-l-full" style={{ width: `${(stats.preAvg / 5) * 100}%` }}></div>
              <div className="bg-ffcm-red h-full rounded-r-full" style={{ width: `${((stats.postAvg - stats.preAvg) / 5) * 100}%` }}></div>
            </div>
          </div>

          {/* Frecuencia de Uso */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-pablo-blue shadow-sm hover:shadow-md transition-all-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pablo-blue/5 to-transparent rounded-bl-full transition-all group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-pablo-blue/10 rounded-xl text-pablo-blue">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200">
                Uso Profesional
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frecuencia de Uso Diario/Semanal</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-800">{stats.postFreqAvg}</span>
              <span className="text-slate-400 text-sm">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <span>Antes:</span>
              <span className="font-semibold text-slate-700 ml-1">{stats.preFreqAvg} / 5.0</span>
            </p>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-pablo-blue h-full rounded-full" style={{ width: `${(stats.postFreqAvg / 5) * 100}%` }}></div>
            </div>
          </div>

          {/* Habilidad Clave: NotebookLM */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-ffcm-gold shadow-sm hover:shadow-md transition-all-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-ffcm-gold/5 to-transparent rounded-bl-full transition-all group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-ffcm-gold/10 rounded-xl text-ffcm-gold">
                <FileText className="w-6 h-6" />
              </div>
              <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200/60">
                Top Crecimiento
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">NotebookLM (Documentación)</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-800">3.70</span>
              <span className="text-slate-400 text-sm">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +131.2%
              </span>
              <span className="text-slate-400">desde 1.60</span>
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden flex">
              <div className="bg-slate-300 h-full" style={{ width: `${(1.6 / 5) * 100}%` }}></div>
              <div className="bg-ffcm-gold h-full" style={{ width: `${((3.7 - 1.6) / 5) * 100}%` }}></div>
            </div>
          </div>

          {/* Habilidad Clave: Seguridad */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 border-t-4 border-t-teal-500 shadow-sm hover:shadow-md transition-all-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/5 to-transparent rounded-bl-full transition-all group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full border border-teal-100">
                Seguridad
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Privacidad y Protección</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-800">3.60</span>
              <span className="text-slate-400 text-sm">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +89.5%
              </span>
              <span className="text-slate-400">desde 1.90</span>
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden flex">
              <div className="bg-slate-300 h-full" style={{ width: `${(1.9 / 5) * 100}%` }}></div>
              <div className="bg-teal-500 h-full" style={{ width: `${((3.6 - 1.9) / 5) * 100}%` }}></div>
            </div>
          </div>

        </section>

        {/* CONTROLES Y FILTROS INTERACTIVOS */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200/80 border-l-4 border-l-ffcm-red shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all-200">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1">
            {/* Filtro Departamento */}
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-ffcm-red" />
                Filtrar por Departamento
              </label>
              <div className="relative">
                <select 
                  value={selectedDept}
                  onChange={(e) => handleDeptChange(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-medium py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ffcm-red/35 focus:border-ffcm-red transition-all cursor-pointer text-sm shadow-sm appearance-none"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Filtro Persona */}
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-pablo-blue" />
                Filtrar por Persona
              </label>
              <div className="relative">
                <select 
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-medium py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pablo-blue/35 focus:border-pablo-blue transition-all cursor-pointer text-sm shadow-sm appearance-none"
                >
                  <option value="Todos">Todos los alumnos ({people.length})</option>
                  {people.map(p => (
                    <option key={p.name} value={p.name}>
                      {p.name} {!p.is_matched && '(Encuesta incompleta)'}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Modo de Gráfico */}
          <div className="flex flex-col items-stretch sm:items-start gap-2">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-ffcm-gold" />
              Modo de Visualización
            </span>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 self-start shadow-inner">
              <button 
                onClick={() => setChartMode('superpuesto')}
                className={`py-2 px-4 rounded-lg font-bold text-xs transition-all ${
                  chartMode === 'superpuesto' 
                    ? 'bg-ffcm-red text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Superpuesto
              </button>
              <button 
                onClick={() => setChartMode('inicio')}
                className={`py-2 px-4 rounded-lg font-bold text-xs transition-all ${
                  chartMode === 'inicio' 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Inicio
              </button>
              <button 
                onClick={() => setChartMode('fin')}
                className={`py-2 px-4 rounded-lg font-bold text-xs transition-all ${
                  chartMode === 'fin' 
                    ? 'bg-ffcm-red text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Fin
              </button>
            </div>
          </div>

        </section>

        {/* DASHBOARD PRINCIPAL: GRÁFICO Y DETALLE INDIVIDUAL */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: DIAGRAMA DE HABILIDADES (12 / 5 o 7 de ancho) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 border-t-4 border-t-ffcm-red shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Diagrama de Habilidades en IA</h3>
                <p className="text-xs text-slate-500">Mapeo del nivel autoevaluado (1 al 5) en 10 áreas clave</p>
              </div>
              {selectedPerson !== 'Todos' && (
                <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold tracking-wider uppercase py-1 px-2.5 rounded-full border border-slate-200">
                  Ficha Individual
                </span>
              )}
            </div>

            {/* Gráfico de Radar */}
            <div className="h-[400px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="habilidad" 
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 5]} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  
                  {/* Radar de Inicio */}
                  {(chartMode === 'superpuesto' || chartMode === 'inicio') && (
                    <Radar
                      name="Inicio del Curso"
                      dataKey="Inicio (Pre)"
                      stroke="#94a3b8"
                      fill="#94a3b8"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  )}
                  
                  {/* Radar de Fin */}
                  {(chartMode === 'superpuesto' || chartMode === 'fin') && (
                    <Radar
                      name="Final del Curso"
                      dataKey="Fin (Post)"
                      stroke="#C8102E"
                      fill="#C8102E"
                      fillOpacity={chartMode === 'superpuesto' ? 0.25 : 0.4}
                      strokeWidth={2.5}
                    />
                  )}
                  
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontFamily: 'DM Sans, sans-serif'
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda Explicativa de las Habilidades */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></div>
                <div>
                  <span className="font-bold text-slate-700">Competencias Básicas:</span> Prompts, Documentos, Análisis de Archivos.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-ffcm-red mt-1.5"></div>
                <div>
                  <span className="font-bold text-slate-700">Competencias Avanzadas:</span> NotebookLM, Asistentes GPTs, Mini Apps, Automatización.
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: FICHA DETALLADA / COMENTARIOS Y ACTITUDES (5 de ancho) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 border-t-4 border-t-ffcm-gold shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {selectedPerson !== 'Todos' ? selectedPerson : `Vista: ${selectedDept}`}
                </h3>
                <p className="text-xs text-slate-500">Actitud, principales áreas de impacto y feedback</p>
              </div>
              <span className="bg-ffcm-red/10 text-ffcm-red text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-ffcm-red/20 shadow-sm">
                {selectedDept}
              </span>
            </div>

            {/* Si es vista de grupo o departamento, mostramos cambio de actitudes */}
            {selectedPerson === 'Todos' ? (
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <HeartHandshake className="w-4 h-4 text-ffcm-red" />
                    Evolución de la Actitud hacia la IA
                  </h4>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={actitudData} layout="vertical" margin={{ left: -10, right: 10 }}>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          fontSize={9} 
                          width={140} 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#475569', fontWeight: 600 }}
                        />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                        <Legend iconSize={6} wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="Inicio (Pre)" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="Fin (Post)" fill="#C8102E" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Info className="w-4 h-4 text-pablo-blue" />
                    Resumen del Grupo
                  </h4>
                  <ul className="text-xs text-slate-600 flex flex-col gap-2">
                    <li className="flex items-center justify-between">
                      <span>Alumnos en este segmento:</span>
                      <span className="font-bold text-slate-800">{stats.count}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Encuestas cruzadas (Pre + Post):</span>
                      <span className="font-bold text-slate-800">{stats.matchedCount}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Habilidad media previa:</span>
                      <span className="font-bold text-slate-600">{stats.preAvg} / 5.0</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Habilidad media posterior:</span>
                      <span className="font-bold text-ffcm-red">{stats.postAvg} / 5.0</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              // Ficha individual detallada
              <div className="flex flex-col gap-6">
                
                {/* Tabla de Actitud y Preocupaciones */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Pre-Curso */}
                  {filteredUsers[0]?.pre && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-inner flex flex-col gap-3">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Inicio del Curso</span>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Actitud:</span>
                        <p className="text-xs font-bold text-slate-700 leading-tight mt-0.5">{filteredUsers[0].pre.actitud}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Preocupación:</span>
                        <p className="text-xs text-slate-600 leading-tight mt-0.5">{filteredUsers[0].pre.preocupacion}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block">Área de ahorro:</span>
                        <p className="text-xs text-slate-600 leading-tight mt-0.5">{filteredUsers[0].pre.area_ahorro}</p>
                      </div>
                    </div>
                  )}

                  {/* Post-Curso */}
                  {filteredUsers[0]?.post ? (
                    <div className="bg-ffcm-red/5 p-4 rounded-2xl border border-ffcm-red/10 shadow-inner flex flex-col gap-3">
                      <span className="text-[10px] font-extrabold text-ffcm-red uppercase tracking-wider">Final del Curso</span>
                      <div>
                        <span className="text-[10px] font-bold text-ffcm-red/70 block">Actitud:</span>
                        <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{filteredUsers[0].post.actitud}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ffcm-red/70 block">Preocupación:</span>
                        <p className="text-xs text-slate-600 leading-tight mt-0.5">{filteredUsers[0].post.preocupacion}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ffcm-red/70 block">Área de ahorro:</span>
                        <p className="text-xs text-slate-600 leading-tight mt-0.5">{filteredUsers[0].post.area_ahorro}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/40 flex items-center justify-center text-center">
                      <p className="text-xs text-amber-700 font-medium">El alumno no rellenó el cuestionario de salida.</p>
                    </div>
                  )}
                </div>

                {/* Comentarios literales */}
                <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-ffcm-red" />
                    Comentarios y Reflexiones
                  </h4>
                  
                  {filteredUsers[0]?.pre?.comentario && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                      <span className="text-[10px] font-extrabold text-slate-400 block mb-1">¿Qué esperabas aprender? (Inicio)</span>
                      <p className="text-xs italic text-slate-600 leading-relaxed font-serif">
                        "{filteredUsers[0].pre.comentario}"
                      </p>
                    </div>
                  )}

                  {filteredUsers[0]?.post?.comentario ? (
                    <div className="bg-ffcm-red/5 p-4 rounded-2xl border border-ffcm-red/10">
                      <span className="text-[10px] font-extrabold text-ffcm-red block mb-1">¿Qué ha cambiado en tu trabajo? (Fin)</span>
                      <p className="text-xs italic text-slate-700 leading-relaxed font-serif">
                        "{filteredUsers[0].post.comentario}"
                      </p>
                    </div>
                  ) : (
                    filteredUsers[0]?.is_matched && (
                      <p className="text-xs text-slate-400 italic">Sin comentarios en la encuesta final.</p>
                    )
                  )}
                </div>

              </div>
            )}
          </div>

        </section>

        {/* SECCIÓN INFERIOR: TABLA DE COMENTARIOS DESTACADOS */}
        <section className="bg-white p-6 rounded-3xl border border-slate-200/80 border-t-4 border-t-ffcm-red shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Opiniones y Cambios Reales en el Trabajo</h3>
              <p className="text-xs text-slate-500">Testimonios de los alumnos sobre el impacto del curso en su día a día</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Impacto Positivo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto pr-2">
            {testimonials
              .filter(u => u.post?.comentario) // Filtrar solo los comentarios finales
              .map(u => (
                <div key={u.name} className="bg-slate-50 hover:bg-white p-5 rounded-2xl border border-slate-200/60 hover:border-ffcm-red/25 hover:shadow-md transition-all-200 flex flex-col justify-between gap-4 group">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold text-slate-400 group-hover:text-ffcm-red transition-colors uppercase tracking-wider">{u.department}</span>
                    <p className="text-xs font-medium italic text-slate-700 leading-relaxed font-serif">
                      "{u.post?.comentario}"
                    </p>
                  </div>
                  <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">{u.name}</span>
                    {u.pre?.skills && u.post?.skills && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-slate-700">
                          +{((
                            Object.values(u.post.skills).reduce((a, b) => a + b, 0) / 10 - 
                            Object.values(u.pre.skills).reduce((a, b) => a + b, 0) / 10
                          )).toFixed(1)}
                        </span>
                        <span>pts</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* CASOS DE ÉXITO DE ESTE CURSO */}
        <section className="bg-red-50 border border-red-200/60 p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl flex flex-col gap-3">
            <div className="bg-ffcm-red/10 px-3.5 py-1 rounded-full text-xs font-extrabold text-ffcm-red border border-ffcm-red/20 self-start">
              Conclusiones del Curso
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Un paso de gigante en la digitalización de la FFCM
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Los datos demuestran un salto cuantitativo y cualitativo. Hemos pasado de un desconocimiento generalizado en áreas clave (promedios previos inferiores a 2.0 en NotebookLM, GPTs y mini apps) a que los trabajadores de la federación diseñen sus propios asistentes y semiautomaticen su trabajo diario, con un **incremento general del +66% en competencias tecnológicas**.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-red-100/60 text-center min-w-[280px] shadow-sm">
            <div>
              <span className="block text-2xl font-black text-ffcm-red">+131%</span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase mt-1 block">NotebookLM</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-ffcm-red">+106%</span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase mt-1 block">GPTs Propios</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-ffcm-red">+94%</span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase mt-1 block">Mini Apps</span>
            </div>
          </div>
        </section>

      </main>
      
      {/* PIE DE PÁGINA */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
        <p>© 2026 Federación de Fútbol de Castilla-La Mancha. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1">
          <span>Desarrollado para la FFCM por</span>
          <a href="https://pablosala.es" target="_blank" className="font-extrabold text-pablo-blue hover:underline">Pablo Sala IA</a>
        </p>
      </footer>
    </div>
  );
}
