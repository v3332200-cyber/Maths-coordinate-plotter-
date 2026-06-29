import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Award,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trophy,
  ArrowRight,
  Calculator,
  HelpCircle,
  Eye
} from 'lucide-react';

interface SetProblem {
  id: number;
  titleEn: string;
  titleOr: string;
  descEn: string;
  descOr: string;
  params: {
    total?: number;
    a: number; // e.g. tea, English, passed Math
    b: number; // e.g. coffee, Odia, passed English
    both: number;
    totalLabelEn: string;
    totalLabelOr: string;
    aLabelEn: string;
    aLabelOr: string;
    bLabelEn: string;
    bLabelOr: string;
  };
  questionEn: string;
  questionOr: string;
  answerType: 'neither' | 'both' | 'only_a' | 'only_b' | 'total';
  correctAnswer: number;
  solutionEn: string;
  solutionOr: string;
}

const PROBLEMS_PRESETS: SetProblem[] = [
  {
    id: 1,
    titleEn: "Tea and Coffee Survey",
    titleOr: "ଚା’ ଏବଂ କଫି ସର୍ଭେ",
    descEn: "Out of a survey of 50 people, 30 people like tea, 25 people like coffee, and 15 like both. How many people do not like tea or coffee?",
    descOr: "୫୦ ଜଣ ଲୋକଙ୍କ ସର୍ଭେକ୍ଷଣରୁ ଜଣାଗଲା ଯେ ୩୦ ଜଣ ଚା’, ୨୫ ଜଣ କଫି ଏବଂ ୧୫ ଜଣ ଉଭୟ ପସନ୍ଦ କରନ୍ତି। କେତେଜଣ ଲୋକ ଚା’ କିମ୍ବା କଫି କୌଣସିଟି ପସନ୍ଦ କରନ୍ତି ନାହିଁ?",
    params: {
      total: 50,
      a: 30,
      b: 25,
      both: 15,
      totalLabelEn: "Total Surveyed",
      totalLabelOr: "ମୋଟ ସଭ୍ୟ",
      aLabelEn: "Tea",
      aLabelOr: "ଚା’",
      bLabelEn: "Coffee",
      bLabelOr: "କଫି",
    },
    questionEn: "How many people like neither tea nor coffee?",
    questionOr: "କେତେଜଣ ଲୋକ ଚା’ କିମ୍ବା କଫି କୌଣସିଟି ପସନ୍ଦ କରନ୍ତି ନାହିଁ?",
    answerType: 'neither',
    correctAnswer: 10,
    solutionEn: "Let T = set of tea-lovers and C = set of coffee-lovers. Given:\n• n(U) = 50\n• n(T) = 30\n• n(C) = 25\n• n(T ∩ C) = 15\n\nUsing set formula:\nn(T ∪ C) = n(T) + n(C) - n(T ∩ C)\nn(T ∪ C) = 30 + 25 - 15 = 40\n\nPeople who like neither tea nor coffee:\n= n(U) - n(T ∪ C)\n= 50 - 40 = 10.",
    solutionOr: "ମନେକର T = ଚା’ ପସନ୍ଦ କରୁଥିବା ଲୋକଙ୍କ ସେଟ୍ ଏବଂ C = କଫି ପସନ୍ଦ କରୁଥିବା ଲୋକଙ୍କ ସେଟ୍। ପ୍ରଦତ୍ତ ଅଛି:\n• n(U) = ୫୦\n• n(T) = ୩୦\n• n(C) = ୨୫\n• n(T ∩ C) = ୧୫\n\nସେଟ୍ ସୂତ୍ର ଅନୁସାରେ:\nn(T ∪ C) = n(T) + n(C) - n(T ∩ C)\nn(T ∪ C) = ୩୦ + ୨୫ - ୧୫ = ୪୦\n\nଚା’ କିମ୍ବା କଫି କୌଣସିଟି ପସନ୍ଦ କରୁନଥିବା ଲୋକଙ୍କ ସଂଖ୍ୟା:\n= n(U) - n(T ∪ C)\n= ୫୦ - ୪୦ = ୧୦।"
  },
  {
    id: 2,
    titleEn: "Language Classes",
    titleOr: "ଭାଷା ଶିକ୍ଷା",
    descEn: "In a class of 60 students, 40 students study Odia, 25 study Sanskrit, and every student studies at least one language. How many students study both Odia and Sanskrit?",
    descOr: "୬୦ ଜଣ ଛାତ୍ରବିଶିଷ୍ଟ ଏକ ଶ୍ରେଣୀରେ, ୪୦ ଜଣ ଓଡ଼ିଆ, ୨୫ ଜଣ ସଂସ୍କୃତ ଏବଂ ପ୍ରତ୍ୟେକ ଛାତ୍ର ଅନ୍ତତଃ ଗୋଟିଏ ଭାଷା ପଢନ୍ତି। କେତେଜଣ ଉଭୟ ଓଡ଼ିଆ ଓ ସଂସ୍କୃତ ପଢନ୍ତି?",
    params: {
      total: 60,
      a: 40,
      b: 25,
      both: 5,
      totalLabelEn: "Total Class",
      totalLabelOr: "ମୋଟ ଶ୍ରେଣୀ",
      aLabelEn: "Odia",
      aLabelOr: "ଓଡ଼ିଆ",
      bLabelEn: "Sanskrit",
      bLabelOr: "ସଂସ୍କୃତ",
    },
    questionEn: "How many students study both languages?",
    questionOr: "କେତେଜଣ ଛାତ୍ର ଉଭୟ ଓଡ଼ିଆ ଓ ସଂସ୍କୃତ ପଢନ୍ତି?",
    answerType: 'both',
    correctAnswer: 5,
    solutionEn: "Let O = set of Odia students and S = set of Sanskrit students. Since every student studies at least one, the union is equal to the total class:\n• n(O ∪ S) = 60\n• n(O) = 40\n• n(S) = 25\n\nUsing set formula:\nn(O ∪ S) = n(O) + n(S) - n(O ∩ S)\n60 = 40 + 25 - n(O ∩ S)\n60 = 65 - n(O ∩ S)\nn(O ∩ S) = 65 - 60 = 5.",
    solutionOr: "ମନେକର O = ଓଡ଼ିଆ ପଢୁଥିବା ଛାତ୍ରଙ୍କ ସେଟ୍ ଏବଂ S = ସଂସ୍କୃତ ପଢୁଥିବା ଛାତ୍ରଙ୍କ ସେଟ୍। ଯେହେତୁ ପ୍ରତ୍ୟେକ ଛାତ୍ର ଅନ୍ତତଃ ଗୋଟିଏ ବିଷୟ ପଢନ୍ତି, ତେଣୁ ସଂଯୋଗ (Union) ମୋଟ ସଂଖ୍ୟା ସହ ସମାନ:\n• n(O ∪ S) = ୬୦\n• n(O) = ୪୦\n• n(S) = ୨୫\n\nସେଟ୍ ସୂତ୍ର ଅନୁସାରେ:\nn(O ∪ S) = n(O) + n(S) - n(O ∩ S)\n୬୦ = ୪୦ + ୨୫ - n(O ∩ S)\n୬୦ = ୬୫ - n(O ∩ S)\nn(O ∩ S) = ୬୫ - ୬୦ = ୫।"
  },
  {
    id: 3,
    titleEn: "Cricket and Football",
    titleOr: "କ୍ରିକେଟ୍ ଏବଂ ଫୁଟବଲ୍",
    descEn: "Out of 45 students in a sports club, 30 play Cricket and 20 play Football. If 12 play both games, how many students play ONLY Cricket?",
    descOr: "ଗୋଟିଏ କ୍ରୀଡ଼ା କ୍ଲବ୍‌ର ୪୫ ଜଣ ସଭ୍ୟଙ୍କ ମଧ୍ୟରୁ ୩୦ ଜଣ କ୍ରିକେଟ୍ ଏବଂ ୨୦ ଜଣ ଫୁଟବଲ୍ ଖେଳନ୍ତି। ଯଦି ୧୨ ଜଣ ଉଭୟ ଖେଳନ୍ତି, ତେବେ କେତେଜଣ ସଭ୍ୟ କେବଳ କ୍ରିକେଟ୍ ଖେଳନ୍ତି?",
    params: {
      total: 45,
      a: 30,
      b: 20,
      both: 12,
      totalLabelEn: "Sports Club",
      totalLabelOr: "କ୍ରୀଡ଼ା କ୍ଲବ୍",
      aLabelEn: "Cricket",
      aLabelOr: "କ୍ରିକେଟ୍",
      bLabelEn: "Football",
      bLabelOr: "ଫୁଟବଲ୍",
    },
    questionEn: "How many students play ONLY Cricket?",
    questionOr: "କେତେଜଣ ସଭ୍ୟ କେବଳ କ୍ରିକେଟ୍ ଖେଳନ୍ତି?",
    answerType: 'only_a',
    correctAnswer: 18,
    solutionEn: "Let C = set of Cricket players and F = set of Football players. Given:\n• n(C) = 30\n• n(F) = 20\n• n(C ∩ F) = 12\n\nTo find students who play ONLY Cricket (C \\ F):\nn(C \\ F) = n(C) - n(C ∩ F)\nn(C \\ F) = 30 - 12 = 18.",
    solutionOr: "ମନେକର C = କ୍ରିକେଟ୍ ଖେଳାଳିଙ୍କ ସେଟ୍ ଏବଂ F = ଫୁଟବଲ୍ ଖେଳାଳିଙ୍କ ସେଟ୍। ପ୍ରଦତ୍ତ ଅଛି:\n• n(C) = ୩୦\n• n(F) = ୨୦\n• n(C ∩ F) = ୧୨\n\nକେବଳ କ୍ରିକେଟ୍ ଖେଳୁଥିବା ସଭ୍ୟଙ୍କ ସଂଖ୍ୟା (C \\ F):\nn(C \\ F) = n(C) - n(C ∩ F)\nn(C \\ F) = ୩୦ - ୧୨ = ୧୮।"
  },
  {
    id: 4,
    titleEn: "Newspaper Readership",
    titleOr: "ଖବରକାଗଜ ପାଠକ",
    descEn: "In a town, 70% of families read 'Samaj' newspaper, 40% read 'Dharitri', and 25% read both Samaj and Dharitri. What percentage of families read neither newspaper?",
    descOr: "ଗୋଟିଏ ସହରରେ, ୭୦% ପରିବାର 'ସମାଜ' ସମ୍ବାଦପତ୍ର, ୪୦% 'ଧରିତ୍ରୀ' ସମ୍ବାଦପତ୍ର ଏବଂ ୨୫% ଉଭୟ ପଢନ୍ତି। ଶତକଡ଼ା କେତେ ଭାଗ ପରିବାର କୌଣସିଟି ସମ୍ବାଦପତ୍ର ପଢନ୍ତି ନାହିଁ?",
    params: {
      total: 100,
      a: 70,
      b: 40,
      both: 25,
      totalLabelEn: "Total Families",
      totalLabelOr: "ମୋଟ ପରିବାର",
      aLabelEn: "Samaj",
      aLabelOr: "ସମାଜ",
      bLabelEn: "Dharitri",
      bLabelOr: "ଧରିତ୍ରୀ",
    },
    questionEn: "What is the percentage of families who read neither newspaper?",
    questionOr: "ଶତକଡ଼ା କେତେ ଭାଗ ପରିବାର କୌଣସିଟି ସମ୍ବାଦପତ୍ର ପଢନ୍ତି ନାହିଁ?",
    answerType: 'neither',
    correctAnswer: 15,
    solutionEn: "Let S = set of Samaj readers and D = set of Dharitri readers. Working in percentages:\n• n(U) = 100%\n• n(S) = 70%\n• n(D) = 40%\n• n(S ∩ D) = 25%\n\nPercentage of families reading at least one newspaper:\nn(S ∪ D) = n(S) + n(D) - n(S ∩ D)\nn(S ∪ D) = 70% + 40% - 25% = 85%\n\nNeither newspaper readers:\n= n(U) - n(S ∪ D)\n= 100% - 85% = 15%.",
    solutionOr: "ମନେକର S = 'ସମାଜ' ପାଠକଙ୍କ ସେଟ୍ ଏବଂ D = 'ଧରିତ୍ରୀ' ପାଠକଙ୍କ ସେଟ୍। ଶତକଡ଼ା ହିସାବରେ:\n• n(U) = ୧୦୦%\n• n(S) = ୭୦%\n• n(D) = ୪୦%\n• n(S ∩ D) = ୨୫%\n\nଅନ୍ତତଃ ଗୋଟିଏ ଖବରକାଗଜ ପଢୁଥିବା ପରିବାରର ଶତକଡ଼ା ହାର:\nn(S ∪ D) = n(S) + n(D) - n(S ∩ D)\nn(S ∪ D) = ୭୦% + ୪୦% - ୨୫% = ୮୫%\n\nକୌଣସି ସମ୍ବାଦପତ୍ର ପଢୁନଥିବା ପରିବାରର ଶତକଡ଼ା ହାର:\n= n(U) - n(S ∪ D)\n= ୧୦୦% - ୮୫% = ୧୫%।"
  },
  {
    id: 5,
    titleEn: "Failed Students in Exam",
    titleOr: "ପରୀକ୍ଷା ଫଳାଫଳ",
    descEn: "In an examination, 80% of students passed in Mathematics, 75% passed in English, and 70% passed in both. If 45 students failed in both, find the total number of students who appeared for the exam.",
    descOr: "ଏକ ପରୀକ୍ଷାରେ, ୮୦% ଛାତ୍ର ଗଣିତରେ, ୭୫% ଇଂରାଜୀରେ ଏବଂ ୭୦% ଉଭୟ ବିଷୟରେ ପାସ୍ କଲେ। ଯଦି ୪୫ ଜଣ ଛାତ୍ର ଉଭୟ ବିଷୟରେ ଫେଲ୍ ହେଲେ, ତେବେ ପରୀକ୍ଷା ଦେଇଥିବା ମୋଟ ଛାତ୍ର ସଂଖ୍ୟା କେତେ?",
    params: {
      total: 300,
      a: 240, // 80% of 300
      b: 225, // 75% of 300
      both: 210, // 70% of 300
      totalLabelEn: "Total Examined",
      totalLabelOr: "ମୋଟ ଛାତ୍ର",
      aLabelEn: "Math Pass",
      aLabelOr: "ଗଣିତ ପାସ୍",
      bLabelEn: "English Pass",
      bLabelOr: "ଇଂରାଜୀ ପାସ୍",
    },
    questionEn: "What is the total number of students who appeared for the exam?",
    questionOr: "ପରୀକ୍ଷା ଦେଇଥିବା ମୋଟ ଛାତ୍ର ସଂଖ୍ୟା କେତେ?",
    answerType: 'total',
    correctAnswer: 300,
    solutionEn: "Let M = passed Mathematics, E = passed English.\nPassed at least one subject percentage:\nn(M ∪ E) = n(M) + n(E) - n(M ∩ E) = 80% + 75% - 70% = 85%\nFailed both subjects percentage:\nFailed% = 100% - 85% = 15%\n\nGiven that 15% of total students is equal to 45:\n0.15 × Total = 45\nTotal = 45 / 0.15 = 300.",
    solutionOr: "ମନେକର M = ଗଣିତରେ ପାସ୍ ଏବଂ E = ଇଂରାଜୀରେ ପାସ୍ ଛାତ୍ର।\nଅନ୍ତତଃ ଗୋଟିଏ ବିଷୟରେ ପାସ୍ କରିଥିବା ଛାତ୍ରଙ୍କ ଶତକଡ଼ା ହାର:\nn(M ∪ E) = n(M) + n(E) - n(M ∩ E) = ୮୦% + ୭୫% - ୭୦% = ୮୫%\nଉଭୟ ବିଷୟରେ ଫେଲ୍ ହୋଇଥିବା ଛାତ୍ରଙ୍କ ଶତକଡ଼ା ହାର:\nଫେଲ୍% = ୧୦୦% - ୮୫% = ୧୫%\n\nପ୍ରଶ୍ନ ଅନୁସାରେ ଏହି ୧୫% ଛାତ୍ର ସଂଖ୍ୟା ହେଉଛି ୪୫:\nTotal × ୧୫% = ୪୫\nମୋଟ ଛାତ୍ର = ୪୫ / ୦.୧୫ = ୩୦୦।"
  }
];

export default function GanitaManjariTab() {
  const [lang, setLang] = useState<'or' | 'en'>('en');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ status: 'idle' | 'success' | 'failure'; msg: string }>({ status: 'idle', msg: '' });
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Custom sandbox state
  const [sandboxTotal, setSandboxTotal] = useState<number>(100);
  const [sandboxA, setSandboxA] = useState<number>(60);
  const [sandboxB, setSandboxB] = useState<number>(50);
  const [sandboxBoth, setSandboxBoth] = useState<number>(30);

  const activeProblem = PROBLEMS_PRESETS[currentIdx];

  const handleLangToggle = () => {
    setLang(lang === 'or' ? 'en' : 'or');
  };

  const handleNextProblem = () => {
    setCurrentIdx((currentIdx + 1) % PROBLEMS_PRESETS.length);
    setUserAnswer('');
    setFeedback({ status: 'idle', msg: '' });
    setShowSolution(false);
  };

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const ansNum = parseFloat(userAnswer);
    if (isNaN(ansNum)) {
      setFeedback({
        status: 'failure',
        msg: lang === 'or' ? 'দୟାକରି ଏକ ବୈଧ ସଂଖ୍ୟା ପ୍ରବେଶ କରନ୍ତୁ।' : 'Please enter a valid numeric answer.'
      });
      return;
    }

    if (ansNum === activeProblem.correctAnswer) {
      setScore(prev => prev + 20);
      setFeedback({
        status: 'success',
        msg: lang === 'or' 
          ? '🎉 ଅତି ସୁନ୍ଦର! ଆପଣଙ୍କ ଉତ୍ତର ସଠିକ୍ ଅଟେ। (+୨୦ ପଏଣ୍ଟ)' 
          : '🎉 Brilliant! Your answer is correct. (+20 Points)'
      });
      setShowSolution(true);
    } else {
      setFeedback({
        status: 'failure',
        msg: lang === 'or'
          ? `❌ ଭୁଲ୍ ଉତ୍ତର। ଚେଷ୍ଟା କରନ୍ତୁ କିମ୍ବା ସମାଧାନ ଦେଖନ୍ତୁ।`
          : `❌ Incorrect answer. Try again or check the step-by-step solution below!`
      });
    }
  };

  // Calculates Venn regions for active challenge problem or sandbox
  const getVennData = (total: number, a: number, b: number, both: number) => {
    const onlyA = Math.max(0, a - both);
    const onlyB = Math.max(0, b - both);
    const union = onlyA + onlyB + both;
    const neither = Math.max(0, total - union);
    return { onlyA, onlyB, both, neither, total };
  };

  const activeVenn = getVennData(
    activeProblem.params.total || 100,
    activeProblem.params.a,
    activeProblem.params.b,
    activeProblem.params.both
  );

  const sandboxVenn = getVennData(sandboxTotal, sandboxA, sandboxB, sandboxBoth);

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Intro Banner */}
      <div className="bg-gradient-to-tr from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 border border-indigo-850 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <BookOpen className="w-6 h-6 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                  BSE Odisha Board
                </span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                  Class 9th
                </span>
              </div>
              <h2 className="text-lg font-black mt-1 text-white flex items-center gap-2">
                ଗଣିତ ମଞ୍ଜରୀ : ପ୍ରଥମ ଅଧ୍ୟାୟ 
                <span className="text-xs font-normal text-indigo-200">(Ganita Manjari: Ch 1)</span>
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5 font-sans">
                Set Operations and Applications of Sets (ସେଟ୍ ପ୍ରକ୍ରିୟା ଓ ସେଟ୍‌ର ପ୍ରୟୋଗ)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Score Badge */}
            <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-center font-mono">
              <span className="block text-[9px] uppercase tracking-widest text-slate-400">Quiz Points</span>
              <span className="text-sm font-extrabold text-amber-400">{score} XP</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={handleLangToggle}
              className="px-3.5 py-2 text-xs font-bold bg-white/15 hover:bg-white/20 active:bg-white/25 border border-white/10 rounded-2xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>{lang === 'or' ? 'English Translate' : 'ଓଡ଼ିଆ ଅନୁବାଦ'}</span>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Word Problems Card */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
                  {lang === 'or' ? `ପ୍ରଶ୍ନ ସଂଖ୍ୟା ${currentIdx + 1} / ${PROBLEMS_PRESETS.length}` : `Question ${currentIdx + 1} of ${PROBLEMS_PRESETS.length}`}
                </h3>
              </div>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono font-bold px-2 py-0.5 rounded-full">
                {lang === 'or' ? 'କାର୍ଡିନାଲିଟି ସୂତ୍ର' : 'Cardinality Problems'}
              </span>
            </div>

            {/* Title */}
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {lang === 'or' ? activeProblem.titleOr : activeProblem.titleEn}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                {lang === 'or' ? 'ସମାଧାନ ସୂତ୍ର: n(A ∪ B) = n(A) + n(B) - n(A ∩ B)' : 'Formula: n(A ∪ B) = n(A) + n(B) - n(A ∩ B)'}
              </p>
            </div>

            {/* Problem Statement Card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-4.5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium whitespace-pre-line">
                {lang === 'or' ? activeProblem.descOr : activeProblem.descEn}
              </p>
              
              <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-bold">{lang === 'or' ? 'ମୋଟ (Total):' : 'Total (U):'} </span>
                  <span className="text-slate-700 dark:text-slate-300 font-extrabold">{activeProblem.params.total}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">n({lang === 'or' ? activeProblem.params.aLabelOr : activeProblem.params.aLabelEn}): </span>
                  <span className="text-slate-700 dark:text-slate-300 font-extrabold">{activeProblem.params.a}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">n({lang === 'or' ? activeProblem.params.bLabelOr : activeProblem.params.bLabelEn}): </span>
                  <span className="text-slate-700 dark:text-slate-300 font-extrabold">{activeProblem.params.b}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">{lang === 'or' ? 'ଉଭୟ' : 'Both'} (∩): </span>
                  <span className="text-slate-700 dark:text-slate-300 font-extrabold">{activeProblem.params.both}</span>
                </div>
              </div>
            </div>

            {/* Interactive Question and Submission Form */}
            <form onSubmit={handleCheckAnswer} className="flex flex-col gap-3 mt-1">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 font-sans uppercase tracking-wider">
                {lang === 'or' ? activeProblem.questionOr : activeProblem.questionEn}
              </label>
              
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <input
                    id="ganita-answer-input"
                    type="number"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    placeholder={lang === 'or' ? 'ଉତ୍ତର ଏଠାରେ ଲେଖନ୍ତୁ...' : 'Enter your numeric answer...'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl pl-4 pr-10 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                  />
                  <Calculator className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                </div>
                <button
                  id="btn-ganita-submit"
                  type="submit"
                  className="px-6 py-3 bg-slate-950 dark:bg-slate-800 text-white hover:bg-slate-900 dark:hover:bg-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
                >
                  {lang === 'or' ? 'ଯାଞ୍ଚ କରନ୍ତୁ' : 'Submit Check'}
                </button>
              </div>
            </form>

            {/* Feedback Alert banner */}
            {feedback.status !== 'idle' && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
                feedback.status === 'success' 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-400'
              }`}>
                {feedback.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="text-xs font-bold leading-relaxed">{feedback.msg}</div>
              </div>
            )}

            {/* Steps & Solution reveal */}
            {showSolution && (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4.5 animate-fade-in flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200 font-sans uppercase tracking-wider border-b border-slate-200/50 dark:border-slate-800 pb-2">
                  <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                  <span>{lang === 'or' ? 'ବିସ୍ତୃତ ସମାଧାନ ସୂତ୍ର (Step-by-step Solution)' : 'Step-by-Step Solution Explanation'}</span>
                </div>
                <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-semibold">
                  {lang === 'or' ? activeProblem.solutionOr : activeProblem.solutionEn}
                </pre>
              </div>
            )}

            {/* Tab Actions */}
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                id="btn-toggle-solution"
                type="button"
                onClick={() => setShowSolution(!showSolution)}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>{showSolution ? (lang === 'or' ? 'ସମାଧାନ ଲୁଚାନ୍ତୁ' : 'Hide Solution') : (lang === 'or' ? 'ସମାଧାନ ଦେଖନ୍ତୁ' : 'Reveal Solution')}</span>
              </button>

              <button
                id="btn-next-ganita"
                type="button"
                onClick={handleNextProblem}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 shadow-sm border border-indigo-100/10"
              >
                <span>{lang === 'or' ? 'ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ' : 'Next Word Problem'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Venn Diagrams Visualization */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Active Question Venn Diagram */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
                {lang === 'or' ? 'ଭେନ୍ ଚିତ୍ର ପ୍ରତିଛବି' : 'Active Venn Diagram'}
              </h3>
            </div>

            {/* SVG Venn Diagram */}
            <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center">
              <svg width="260" height="200" viewBox="0 0 260 200" className="select-none pointer-events-none">
                {/* Universal Set Rectangle */}
                <rect x="10" y="10" width="240" height="180" rx="8" className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700" strokeWidth="2" />
                <text x="25" y="30" className="text-[11px] font-mono font-bold fill-slate-400">U</text>
                
                {/* Neither value (Universal Bound) */}
                <text x="220" y="35" className="text-[12px] font-mono font-black fill-slate-500 dark:fill-slate-400" textAnchor="end">
                  {activeVenn.neither} {lang === 'or' ? 'କେହି ନୁହେଁ' : 'neither'}
                </text>

                {/* Circles Groups */}
                <g opacity="0.85">
                  {/* Left Circle A */}
                  <circle cx="100" cy="105" r="55" className="fill-indigo-500/10 dark:fill-indigo-500/15 stroke-indigo-500" strokeWidth="2" />
                  {/* Right Circle B */}
                  <circle cx="160" cy="105" r="55" className="fill-pink-500/10 dark:fill-pink-500/15 stroke-pink-500" strokeWidth="2" />
                </g>

                {/* Circle Labels */}
                <text x="75" y="42" className="text-[11px] font-sans font-extrabold fill-indigo-600 dark:fill-indigo-400" textAnchor="middle">
                  A: {lang === 'or' ? activeProblem.params.aLabelOr : activeProblem.params.aLabelEn} ({activeProblem.params.a})
                </text>
                <text x="185" y="42" className="text-[11px] font-sans font-extrabold fill-pink-600 dark:fill-pink-400" textAnchor="middle">
                  B: {lang === 'or' ? activeProblem.params.bLabelOr : activeProblem.params.bLabelEn} ({activeProblem.params.b})
                </text>

                {/* Venn Region Numbers */}
                {/* A only (left region) */}
                <text x="75" y="110" className="text-[12px] font-mono font-extrabold fill-indigo-700 dark:fill-indigo-400" textAnchor="middle">
                  {activeVenn.onlyA}
                </text>
                
                {/* Intersection (middle region) */}
                <text x="130" y="110" className="text-[12px] font-mono font-black fill-slate-800 dark:fill-slate-100" textAnchor="middle">
                  {activeVenn.both}
                </text>

                {/* B only (right region) */}
                <text x="185" y="110" className="text-[12px] font-mono font-extrabold fill-pink-700 dark:fill-pink-400" textAnchor="middle">
                  {activeVenn.onlyB}
                </text>

                <text x="130" y="180" className="text-[9px] font-mono font-medium fill-slate-400" textAnchor="middle">
                  {lang === 'or' ? `ମୋଟ ସର୍ଭେକ୍ଷଣ ସଂଖ୍ୟା = ${activeProblem.params.total}` : `Total Cardinality n(U) = ${activeProblem.params.total}`}
                </text>
              </svg>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block">Venn Region Legend</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-indigo-500/10 border border-indigo-500/40" />
                  <span>Only A: {activeVenn.onlyA}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-md bg-pink-500/10 border border-pink-500/40" />
                  <span>Only B: {activeVenn.onlyB}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-indigo-500/10 dark:bg-pink-500/10 border-2 border-slate-400 border-dashed" />
                  <span>Intersection A ∩ B: {activeVenn.both}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Custom Venn Diagram Sandbox */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Calculator className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
                  {lang === 'or' ? 'ଭେନ୍ ଚିତ୍ର ସ୍ୟାଣ୍ଡବକ୍ସ' : 'Venn Sandbox Calculator'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === 'or' ? 'ନିଜର ତଥ୍ୟ ଦେଇ ସଂଯୋଗ ଓ ଛେଦ ହିସାବ କରନ୍ତୁ' : 'Input custom numbers to compute Venn regions'}
                </p>
              </div>
            </div>

            {/* Sandbox input controls */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Total n(U)</label>
                <input
                  type="number"
                  value={sandboxTotal}
                  onChange={e => setSandboxTotal(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Set A n(A)</label>
                <input
                  type="number"
                  value={sandboxA}
                  onChange={e => setSandboxA(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Set B n(B)</label>
                <input
                  type="number"
                  value={sandboxB}
                  onChange={e => setSandboxB(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Both n(A ∩ B)</label>
                <input
                  type="number"
                  value={sandboxBoth}
                  onChange={e => setSandboxBoth(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Interactive Sandbox Diagram */}
            <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
              <svg width="220" height="160" viewBox="0 0 220 160" className="select-none pointer-events-none">
                {/* Rect */}
                <rect x="5" y="5" width="210" height="150" rx="8" className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800" strokeWidth="2.5" />
                
                {/* Circles */}
                <circle cx="85" cy="85" r="45" className="fill-indigo-500/10 dark:fill-indigo-500/15 stroke-indigo-500" strokeWidth="1.5" />
                <circle cx="135" cy="85" r="45" className="fill-pink-500/10 dark:fill-pink-500/15 stroke-pink-500" strokeWidth="1.5" />

                {/* Values */}
                <text x="65" y="88" className="text-[11px] font-mono font-extrabold fill-indigo-600 dark:fill-indigo-400" textAnchor="middle">{sandboxVenn.onlyA}</text>
                <text x="110" y="88" className="text-[11px] font-mono font-black fill-slate-800 dark:fill-slate-100" textAnchor="middle">{sandboxVenn.both}</text>
                <text x="155" y="88" className="text-[11px] font-mono font-extrabold fill-pink-600 dark:fill-pink-400" textAnchor="middle">{sandboxVenn.onlyB}</text>

                {/* Labels */}
                <text x="60" y="30" className="text-[9px] font-sans font-extrabold fill-indigo-500" textAnchor="middle">Set A</text>
                <text x="160" y="30" className="text-[9px] font-sans font-extrabold fill-pink-500" textAnchor="middle">Set B</text>

                {/* Outside */}
                <text x="195" y="25" className="text-[10px] font-mono font-bold fill-slate-400" textAnchor="end">neither: {sandboxVenn.neither}</text>
              </svg>

              {/* Set formulas result */}
              <div className="w-full text-center text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                <div>n(A ∪ B) = {sandboxVenn.onlyA} + {sandboxVenn.both} + {sandboxVenn.onlyB} = {sandboxVenn.onlyA + sandboxVenn.both + sandboxVenn.onlyB}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
