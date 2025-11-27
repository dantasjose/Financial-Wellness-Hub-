import React, { useState, useEffect } from 'react';
import { 
  Wallet, PieChart, Shield, Zap, Target, Coffee, ShoppingBag, Car, Home, 
  CreditCard, Activity, User, Bell, Database, AlertTriangle, Lock, Unlock, 
  TrendingUp, FileText, ChefHat, Map, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, query, writeBatch } from 'firebase/firestore';

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAMYMfs-x_BPp7mG2uayAbKGzQk5LUbB0Y",
  authDomain: "financial-wellness-hub-a1da4.firebaseapp.com",
  projectId: "financial-wellness-hub-a1da4",
  storageBucket: "financial-wellness-hub-a1da4.firebasestorage.app",
  messagingSenderId: "1076440428624",
  appId: "1:1076440428624:web:49dd123d374e6862166155",
  measurementId: "G-8RNSJT3MD3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = "fluxo-hackathon"; 

// --- CATEGORIZADOR INTELIGENTE ---
const smartCategorize = (transaction) => {
  const raw = transaction.raw ? transaction.raw.toUpperCase() : '';
  const dateObj = new Date(transaction.date);
  const formattedDate = dateObj.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  
  if (raw.includes('UBER') || raw.includes('TAXI')) return { name: 'Uber Viagens', category: 'Transporte', icon: <Car size={18} className="text-blue-500" />, color: 'bg-blue-100', date: formattedDate, id: 'transporte' };
  if (raw.includes('PADARIA') || raw.includes('IFOOD')) return { name: 'iFood / Restaurante', category: 'Alimentação', icon: <Coffee size={18} className="text-orange-500" />, color: 'bg-orange-100', date: formattedDate, id: 'alimentacao' };
  if (raw.includes('AMAZON')) return { name: 'Amazon', category: 'Compras', icon: <ShoppingBag size={18} className="text-purple-500" />, color: 'bg-purple-100', date: formattedDate, id: 'compras' };
  if (raw.includes('ALUGUEL')) return { name: 'Aluguel', category: 'Casa', icon: <Home size={18} className="text-red-500" />, color: 'bg-red-100', date: formattedDate, id: 'casa' };
  if (transaction.type === 'in') return { name: 'Transferência', category: 'Entrada', icon: <TrendingUp size={18} className="text-green-500" />, color: 'bg-green-100', date: formattedDate, id: 'entrada' };
  
  return { name: 'Outros', category: 'Geral', icon: <CreditCard size={18} className="text-gray-500" />, color: 'bg-gray-100', date: formattedDate, id: 'outros' };
};

const ServiceCard = ({ title, icon, color, description, onClick, active }) => (
  <button onClick={onClick} className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 w-full ${active ? `border-${color}-500 bg-${color}-50 ring-2 ring-${color}-200` : 'border-gray-100 bg-white hover:shadow-md'}`}>
    <div className={`p-3 rounded-full mb-3 ${active ? 'bg-white' : 'bg-gray-50'}`}>{icon}</div>
    <span className="font-semibold text-gray-800 text-sm">{title}</span>
    <span className="text-xs text-gray-500 mt-1 text-center">{description}</span>
  </button>
);

// --- MODAL DE RELATÓRIO MENSAL (A NOVIDADE) ---
const ReportModal = ({ onClose, transactions }) => {
  // Lógica simples para encontrar o maior gasto
  const categories = {};
  transactions.filter(t => t.type === 'out').forEach(t => {
    const cat = smartCategorize(t).id;
    categories[cat] = (categories[cat] || 0) + Math.abs(t.amount);
  });

  // Encontrar categoria vilã
  let topCategory = 'outros';
  let maxSpent = 0;
  Object.entries(categories).forEach(([cat, amount]) => {
    if (amount > maxSpent) {
      maxSpent = amount;
      topCategory = cat;
    }
  });

  // Dicas Personalizadas (A "Inteligência")
  const getActionPlan = (category) => {
    switch(category) {
      case 'alimentacao':
        return {
          problem: "O iFood levou 30% do seu salário.",
          solution: "Cozinhar em casa 2x na semana economizaria R$ 400.",
          tip: "Receita Express: Macarrão Carbonara (R$ 15,00) vs iFood (R$ 60,00).",
          icon: <ChefHat size={32} className="text-orange-600" />,
          color: "bg-orange-100 text-orange-800"
        };
      case 'transporte':
        return {
          problem: "O Uber virou custo fixo.",
          solution: "Se planejar sair 15min antes, pode usar transporte público ou carona.",
          tip: "Desafio: 1 semana sem Uber para distâncias menores que 2km.",
          icon: <Map size={32} className="text-blue-600" />,
          color: "bg-blue-100 text-blue-800"
        };
      default:
        return {
          problem: "Muitos gastos picados.",
          solution: "Pequenos gastos somados criam um rombo.",
          tip: "Regra dos 24h: Espere um dia antes de qualquer compra não essencial.",
          icon: <Wallet size={32} className="text-purple-600" />,
          color: "bg-purple-100 text-purple-800"
        };
    }
  };

  const plan = getActionPlan(topCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl h-[85vh] sm:h-auto overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-blue-600" /> Relatório Mensal
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">✕</button>
        </div>

        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm">Total gasto no período</p>
          <h3 className="text-4xl font-black text-slate-900 mt-1">R$ {maxSpent.toFixed(2)}</h3>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${plan.color}`}>
            Vilão: {topCategory.toUpperCase()}
          </span>
        </div>

        {/* O PLANO DE AÇÃO */}
        <div className="space-y-4">
          <div className="p-5 border border-gray-100 rounded-2xl shadow-sm bg-white">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              🚨 O Diagnóstico
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">{plan.problem}</p>
          </div>

          <div className="p-5 border-l-4 border-green-500 bg-green-50 rounded-r-2xl">
            <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              🚀 Plano de Ação
            </h4>
            <p className="text-green-800 text-sm leading-relaxed">{plan.solution}</p>
          </div>

          <div className="p-5 bg-slate-900 text-white rounded-2xl relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">{plan.icon}</div>
            <h4 className="font-bold text-yellow-400 mb-2 text-sm uppercase tracking-wider">Dica de Ouro</h4>
            <p className="text-slate-300 text-sm">{plan.tip}</p>
            {topCategory === 'alimentacao' && (
              <button className="mt-4 w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                Ver Receita Econômica <ArrowRight size={14}/>
              </button>
            )}
          </div>
        </div>

        <button onClick={onClose} className="mt-8 w-full py-4 bg-gray-100 font-bold text-gray-600 rounded-xl hover:bg-gray-200">
          Fechar Relatório
        </button>
      </div>
    </div>
  );
};

// --- MODAL DE SERMÃO (NÍVEL 3) ---
const SermaoModal = ({ onUnlock }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/95 backdrop-blur-sm p-6 animate-fade-in">
    <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center border-4 border-red-500">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <Lock className="text-red-600" size={32} />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">PARE AGORA! ✋</h2>
      <p className="text-gray-600 mb-4">
        Você atingiu <strong>95%</strong> do seu limite. Seu saldo está em risco crítico.
      </p>
      <div className="bg-red-50 p-4 rounded-xl mb-6 text-left">
        <p className="text-sm text-red-800 font-medium mb-1">💡 Conselho da IA:</p>
        <p className="text-xs text-red-600">"Comprar isso agora vai te impedir de pagar o aluguel. Respire. Você realmente precisa disso hoje?"</p>
      </div>
      <button onClick={onUnlock} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
        <Unlock size={18} /> Entendi, desbloquear
      </button>
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); 
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  
  // ESTADOS DA IA
  const [salary, setSalary] = useState(3000); 
  const [totalSpent, setTotalSpent] = useState(0);
  const [aiLevel, setAiLevel] = useState(0);
  const [showSermon, setShowSermon] = useState(false);
  const [showReport, setShowReport] = useState(false); // Novo estado para o relatório

  // 1. Autenticação e Load
  useEffect(() => {
    signInAnonymously(auth).catch((e) => console.error(e));
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Monitoramento
  useEffect(() => {
    if (!user) return;
    const txQuery = query(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'transactions'));
    const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      txs.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(txs);
      
      const currentBalance = txs.reduce((acc, curr) => acc + curr.amount, 3000);
      setBalance(currentBalance);

      const spent = txs.filter(t => t.type === 'out').reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
      setTotalSpent(spent);
    });
    return () => unsubscribeTx();
  }, [user]);

  // 3. IA Lógica
  useEffect(() => {
    const percentage = (totalSpent / salary) * 100;
    if (percentage > 90) {
      setAiLevel(3);
      if (!showSermon) setShowSermon(true);
    } else if (percentage > 60) {
      setAiLevel(2);
    } else if (percentage > 30) {
      setAiLevel(1);
    } else {
      setAiLevel(0);
    }
  }, [totalSpent, salary]);

  const simulateSpending = (amount, type = 'outros') => {
    // Adiciona uma transação mockada localmente para teste rápido sem DB
    // Num caso real, isso iria para o Firestore via addDoc
    const simulatedTx = {
      id: Math.random().toString(),
      raw: type === 'food' ? 'COMPRA IFOOD BR' : 'COMPRA UBER TRIP',
      amount: -amount,
      date: new Date().toISOString(),
      type: 'out'
    };
    setTransactions(prev => [simulatedTx, ...prev]);
    setTotalSpent(prev => prev + amount);
    setBalance(prev => prev - amount);
  };

  const getAIMessage = () => {
    switch (aiLevel) {
      case 3: return { title: "Crítico", text: "Gastos bloqueados.", color: "text-red-700", bg: "bg-red-100", icon: <Lock /> };
      case 2: return { title: "Cuidado", text: "60% da renda comprometida.", color: "text-orange-700", bg: "bg-orange-100", icon: <AlertTriangle /> };
      case 1: return { title: "Atenção", text: "Monitorando seus gastos.", color: "text-yellow-700", bg: "bg-yellow-100", icon: <Activity /> };
      default: return { title: "Tudo Azul", text: "Investimentos em alta.", color: "text-green-700", bg: "bg-green-100", icon: <TrendingUp /> };
    }
  };

  const aiStatus = getAIMessage();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24 md:pb-0 md:flex md:justify-center">
      {/* MODAIS */}
      {showSermon && aiLevel === 3 && <SermaoModal onUnlock={() => setShowSermon(false)} />}
      {showReport && <ReportModal onClose={() => setShowReport(false)} transactions={transactions} />}

      <div className="w-full max-w-md bg-gray-50 md:min-h-screen md:shadow-2xl md:border-x md:border-gray-200 relative">
        
        <header className="p-6 pt-12 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold">JS</div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Assistente IA</p>
                <h1 className="text-xl font-bold text-gray-900">João Silva</h1>
              </div>
            </div>
            {/* BOTÃO NOVO: RELATÓRIO */}
            <button onClick={() => setShowReport(true)} className="relative p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-blue-600">
              <FileText size={24} />
              <div className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </button>
          </div>

          {/* CARD DA IA */}
          <div className={`p-4 rounded-2xl ${aiStatus.bg} mb-6 transition-all border-l-4 ${aiLevel === 3 ? 'border-red-600' : 'border-transparent'}`}>
            <div className="flex gap-3 items-start">
              <div className={`mt-1 ${aiStatus.color}`}>{aiStatus.icon}</div>
              <div>
                <p className={`text-sm font-bold ${aiStatus.color}`}>{aiStatus.title}</p>
                <p className="text-xs text-gray-800 mt-1">{aiStatus.text}</p>
              </div>
            </div>
            <div className="mt-3 bg-white/50 h-2 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${aiLevel === 3 ? 'bg-red-600' : aiLevel === 2 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min((totalSpent/salary)*100, 100)}%` }}></div>
            </div>
          </div>

          {/* CONTROLES DE DEMO */}
          <div className="mb-6 p-2 bg-slate-100 rounded-lg border border-slate-200 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Simular Comportamento</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => simulateSpending(500, 'food')} className="bg-white px-3 py-1 rounded text-xs shadow-sm hover:bg-gray-50">+500 iFood</button>
              <button onClick={() => simulateSpending(500, 'transport')} className="bg-white px-3 py-1 rounded text-xs shadow-sm hover:bg-gray-50">+500 Uber</button>
              <button onClick={() => {setTotalSpent(0); setTransactions([])}} className="bg-white px-3 py-1 rounded text-xs shadow-sm text-red-500">Reset</button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Saldo Disponível</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">R$ {balance.toFixed(2).replace('.', ',')}</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-2">
            <ServiceCard title="Pix" icon={<Zap size={20} className="text-yellow-600" />} color="yellow" description="Pagar" active={activeTab === 'pix'} onClick={() => setActiveTab('pix')} />
            <ServiceCard title="Cashback" icon={<Target size={20} className="text-purple-600" />} color="purple" description="Metas" active={activeTab === 'cashback'} onClick={() => setActiveTab('cashback')} />
             <ServiceCard title="Seguros" icon={<Shield size={20} className="text-blue-600" />} color="blue" description="Proteger" active={activeTab === 'insurance'} onClick={() => setActiveTab('insurance')} />
          </div>
        </header>

        <main className="px-6 pb-24">
          <div className="bg-white rounded-t-3xl shadow-lg border-t border-gray-100 -mx-6 px-6 pt-6 pb-20 min-h-[300px]">
            <h3 className="font-bold text-lg text-gray-800 mb-4 pt-6">Extrato Inteligente</h3>
            <div className="space-y-4">
              {transactions.length === 0 ? <p className="text-center text-gray-400 py-10">Nenhuma transação recente.</p> : 
                transactions.map((t) => {
                  const smart = smartCategorize(t);
                  return (
                    <div key={t.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${smart.color}`}>{smart.icon}</div>
                        <div>
                          <p className="font-bold text-gray-800">{smart.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{smart.category} • {smart.date}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${t.type === 'in' ? 'text-green-600' : 'text-gray-800'}`}>
                        {t.type === 'in' ? '+' : '-'} R$ {Math.abs(t.amount).toFixed(2)}
                      </span>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-6 flex justify-around items-center md:absolute md:max-w-md md:left-auto">
          <button className="p-2 text-slate-900 bg-gray-100 rounded-xl"><Home size={24} /></button>
          <button className="p-2 text-gray-400"><Wallet size={24} /></button>
          <button className="h-14 w-14 bg-slate-900 rounded-full flex items-center justify-center text-white -translate-y-6 shadow-xl"><Zap size={24} /></button>
          <button className="p-2 text-gray-400"><PieChart size={24} /></button>
          <button className="p-2 text-gray-400"><User size={24} /></button>
        </nav>
      </div>
    </div>
  );
}