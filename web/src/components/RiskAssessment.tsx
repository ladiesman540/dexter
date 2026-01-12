import { useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: {
    text: string;
    score: number; // 1 = conservative, 5 = aggressive
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'market_drop',
    text: "If your portfolio dropped 20% in one month, what would you do?",
    options: [
      { text: "Sell everything immediately to prevent more losses", score: 1 },
      { text: "Sell some to reduce risk", score: 2 },
      { text: "Do nothing and wait it out", score: 3 },
      { text: "Buy a little more at the lower prices", score: 4 },
      { text: "Buy aggressively - this is a great opportunity", score: 5 },
    ],
  },
  {
    id: 'investment_goal',
    text: "What's your primary investment goal?",
    options: [
      { text: "Preserve my capital - I can't afford to lose money", score: 1 },
      { text: "Generate steady income with minimal risk", score: 2 },
      { text: "Balance between growth and stability", score: 3 },
      { text: "Grow my wealth, accepting some volatility", score: 4 },
      { text: "Maximize returns - I can handle big swings", score: 5 },
    ],
  },
  {
    id: 'timeline',
    text: "When do you need this money?",
    options: [
      { text: "Within 1-2 years", score: 1 },
      { text: "In 3-5 years", score: 2 },
      { text: "In 5-10 years", score: 3 },
      { text: "In 10-20 years", score: 4 },
      { text: "20+ years or never - it's for future generations", score: 5 },
    ],
  },
  {
    id: 'experience',
    text: "How would you describe your investment experience?",
    options: [
      { text: "Never invested before", score: 1 },
      { text: "Have a retirement account but don't manage it", score: 2 },
      { text: "Actively manage some investments", score: 3 },
      { text: "Experienced - comfortable with stocks and bonds", score: 4 },
      { text: "Very experienced - trade options, crypto, individual stocks", score: 5 },
    ],
  },
  {
    id: 'volatility_comfort',
    text: "Which portfolio would you prefer over a year?",
    options: [
      { text: "Guaranteed 2% return", score: 1 },
      { text: "Likely 4% return, possible 0% to 8%", score: 2 },
      { text: "Likely 7% return, possible -5% to 15%", score: 3 },
      { text: "Likely 10% return, possible -15% to 25%", score: 4 },
      { text: "Likely 15% return, possible -30% to 50%", score: 5 },
    ],
  },
  {
    id: 'loss_reaction',
    text: "You invest $10,000 and it drops to $8,000. How do you feel?",
    options: [
      { text: "Devastated - I'd lose sleep over this", score: 1 },
      { text: "Very uncomfortable - I'd consider selling", score: 2 },
      { text: "Concerned but I'd stick with my plan", score: 3 },
      { text: "Fine - this is normal market behavior", score: 4 },
      { text: "Excited - time to buy more at a discount", score: 5 },
    ],
  },
  {
    id: 'income_stability',
    text: "How stable is your income?",
    options: [
      { text: "Very unstable - freelance/gig work, variable income", score: 1 },
      { text: "Somewhat unstable - commission-based or seasonal", score: 2 },
      { text: "Moderately stable - employed but industry has ups/downs", score: 3 },
      { text: "Stable - steady job in a stable industry", score: 4 },
      { text: "Very stable - government job, tenured, or multiple income streams", score: 5 },
    ],
  },
  {
    id: 'financial_cushion',
    text: "If you lost your job, how long could you cover expenses?",
    options: [
      { text: "Less than 1 month", score: 1 },
      { text: "1-3 months", score: 2 },
      { text: "3-6 months", score: 3 },
      { text: "6-12 months", score: 4 },
      { text: "Over a year", score: 5 },
    ],
  },
  {
    id: 'spending_style',
    text: "How would you describe your spending habits?",
    options: [
      { text: "I spend most of what I earn", score: 1 },
      { text: "I save a little but often dip into savings", score: 2 },
      { text: "I save consistently but not aggressively", score: 3 },
      { text: "I'm a disciplined saver - 15-25% of income", score: 4 },
      { text: "I'm very frugal - I save 30%+ of my income", score: 5 },
    ],
  },
  {
    id: 'regret',
    text: "Which would bother you more?",
    options: [
      { text: "Losing $5,000 - much worse than missing gains", score: 1 },
      { text: "Losing money bothers me more, but I'd regret missing gains too", score: 2 },
      { text: "Both would bother me equally", score: 3 },
      { text: "Missing gains bothers me more, but I don't like losses either", score: 4 },
      { text: "Missing out on $5,000 gain - much worse than a loss", score: 5 },
    ],
  },
];

interface RiskAssessmentProps {
  onComplete: (result: RiskAssessmentResult) => void;
  onCancel: () => void;
}

export interface RiskAssessmentResult {
  score: number;
  tolerance: 'conservative' | 'moderate' | 'aggressive';
  description: string;
  investmentStyle: string;
  assetAllocation: {
    stocks: number;
    bonds: number;
    cash: number;
  };
}

function calculateResult(answers: Record<string, number>): RiskAssessmentResult {
  const scores = Object.values(answers);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  let tolerance: 'conservative' | 'moderate' | 'aggressive';
  let description: string;
  let investmentStyle: string;
  let assetAllocation: { stocks: number; bonds: number; cash: number };

  if (avgScore <= 2) {
    tolerance = 'conservative';
    description = "You prioritize capital preservation over growth. You're uncomfortable with volatility and prefer steady, predictable returns even if they're lower.";
    investmentStyle = "Focus on stable, dividend-paying stocks, high-quality bonds, and keeping a solid cash reserve. Avoid speculative investments.";
    assetAllocation = { stocks: 30, bonds: 50, cash: 20 };
  } else if (avgScore <= 3.5) {
    tolerance = 'moderate';
    description = "You seek a balance between growth and stability. You can handle some market fluctuations but prefer to avoid extreme volatility.";
    investmentStyle = "A balanced portfolio with a mix of growth and value stocks, bonds for stability, and some exposure to diverse asset classes.";
    assetAllocation = { stocks: 60, bonds: 30, cash: 10 };
  } else {
    tolerance = 'aggressive';
    description = "You prioritize growth and can stomach significant volatility. You're comfortable with market swings and see downturns as buying opportunities.";
    investmentStyle = "Growth-focused portfolio with heavy stock allocation, including small-caps and emerging markets. Minimal bonds, used strategically.";
    assetAllocation = { stocks: 85, bonds: 10, cash: 5 };
  }

  return {
    score: Math.round(avgScore * 10) / 10,
    tolerance,
    description,
    investmentStyle,
    assetAllocation,
  };
}

export function RiskAssessment({ onComplete, onCancel }: RiskAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<RiskAssessmentResult | null>(null);

  const handleAnswer = (score: number) => {
    const question = QUESTIONS[currentQuestion];
    const newAnswers = { ...answers, [question.id]: score };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const res = calculateResult(newAnswers);
      setResult(res);
      setShowResult(true);
    }
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  if (showResult && result) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            result.tolerance === 'conservative'
              ? 'bg-blue-500/20'
              : result.tolerance === 'moderate'
              ? 'bg-yellow-500/20'
              : 'bg-red-500/20'
          }`}>
            <span className="text-3xl">
              {result.tolerance === 'conservative' ? '🛡️' : result.tolerance === 'moderate' ? '⚖️' : '🚀'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white capitalize mb-2">
            {result.tolerance} Investor
          </h3>
          <p className="text-gray-400">Risk Score: {result.score}/5</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="font-medium text-white mb-2">Your Profile</h4>
          <p className="text-gray-400 text-sm">{result.description}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="font-medium text-white mb-2">Recommended Investment Style</h4>
          <p className="text-gray-400 text-sm">{result.investmentStyle}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="font-medium text-white mb-3">Suggested Asset Allocation</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-400">Stocks</div>
              <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-dexter-500 rounded-full"
                  style={{ width: `${result.assetAllocation.stocks}%` }}
                />
              </div>
              <div className="w-12 text-sm text-gray-300 text-right">{result.assetAllocation.stocks}%</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-400">Bonds</div>
              <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${result.assetAllocation.bonds}%` }}
                />
              </div>
              <div className="w-12 text-sm text-gray-300 text-right">{result.assetAllocation.bonds}%</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-400">Cash</div>
              <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-500 rounded-full"
                  style={{ width: `${result.assetAllocation.cash}%` }}
                />
              </div>
              <div className="w-12 text-sm text-gray-300 text-right">{result.assetAllocation.cash}%</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => onComplete(result)}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Save to Profile
          </button>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-dexter-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <h3 className="text-xl font-medium text-white mb-6">{question.text}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.score)}
              className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-dexter-500 rounded-xl text-gray-300 transition-all flex items-center justify-between group"
            >
              <span>{option.text}</span>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-dexter-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        Cancel assessment
      </button>
    </div>
  );
}
