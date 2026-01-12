import { useState, useEffect, useCallback } from 'react';
import type { RiskAssessmentResult } from '../components/RiskAssessment';

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserProfile {
  // Personal Info
  name: string;
  age: number | null;
  employmentStatus: 'employed' | 'self-employed' | 'retired' | 'student' | 'other' | '';

  // Financial Stats
  annualIncome: number | null;
  monthlyExpenses: number | null;
  totalSavings: number | null;
  totalInvestments: number | null;
  totalDebt: number | null;
  emergencyFundMonths: number | null;

  // Investment Profile
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | '';
  riskAssessment: RiskAssessmentResult | null; // Detailed assessment from quiz
  investmentHorizon: 'short' | 'medium' | 'long' | ''; // <3 years, 3-10 years, 10+ years
  investmentExperience: 'beginner' | 'intermediate' | 'advanced' | '';

  // Preferences
  preferredSectors: string[];
  excludedSectors: string[];
  investmentStyle: 'passive' | 'active' | 'mixed' | '';
  dividendPreference: 'growth' | 'income' | 'balanced' | '';

  // Goals
  financialGoals: FinancialGoal[];

  // Notes
  additionalNotes: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: null,
  employmentStatus: '',
  annualIncome: null,
  monthlyExpenses: null,
  totalSavings: null,
  totalInvestments: null,
  totalDebt: null,
  emergencyFundMonths: null,
  riskTolerance: '',
  riskAssessment: null,
  investmentHorizon: '',
  investmentExperience: '',
  preferredSectors: [],
  excludedSectors: [],
  investmentStyle: '',
  dividendPreference: '',
  financialGoals: [],
  additionalNotes: '',
};

const STORAGE_KEY = 'dexter-user-profile';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
      }
    } catch {
      // Ignore errors
    }
    setLoading(false);
  }, []);

  // Save profile
  const saveProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage full
      }
      return updated;
    });
  }, []);

  // Add financial goal
  const addGoal = useCallback((goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: Math.random().toString(36).substring(2, 9),
    };
    setProfile((prev) => {
      const updated = {
        ...prev,
        financialGoals: [...prev.financialGoals, newGoal],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove financial goal
  const removeGoal = useCallback((goalId: string) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        financialGoals: prev.financialGoals.filter((g) => g.id !== goalId),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Update financial goal
  const updateGoal = useCallback((goalId: string, updates: Partial<FinancialGoal>) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        financialGoals: prev.financialGoals.map((g) =>
          g.id === goalId ? { ...g, ...updates } : g
        ),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Generate context string for AI
  const getProfileContext = useCallback((): string => {
    const parts: string[] = [];

    if (profile.name) {
      parts.push(`User's name: ${profile.name}`);
    }
    if (profile.age) {
      parts.push(`Age: ${profile.age}`);
    }
    if (profile.employmentStatus) {
      parts.push(`Employment: ${profile.employmentStatus}`);
    }

    // Financial stats
    const stats: string[] = [];
    if (profile.annualIncome) stats.push(`Annual income: $${profile.annualIncome.toLocaleString()}`);
    if (profile.monthlyExpenses) stats.push(`Monthly expenses: $${profile.monthlyExpenses.toLocaleString()}`);
    if (profile.totalSavings) stats.push(`Total savings: $${profile.totalSavings.toLocaleString()}`);
    if (profile.totalInvestments) stats.push(`Total investments: $${profile.totalInvestments.toLocaleString()}`);
    if (profile.totalDebt) stats.push(`Total debt: $${profile.totalDebt.toLocaleString()}`);
    if (profile.emergencyFundMonths) stats.push(`Emergency fund: ${profile.emergencyFundMonths} months of expenses`);

    if (stats.length > 0) {
      parts.push(`Financial situation: ${stats.join(', ')}`);
    }

    // Investment profile - use detailed assessment if available
    if (profile.riskAssessment) {
      const alloc = profile.riskAssessment.assetAllocation;
      parts.push(`Risk tolerance: ${profile.riskAssessment.tolerance.toUpperCase()} (score: ${profile.riskAssessment.score}/5)`);
      parts.push(`Risk profile: ${profile.riskAssessment.description}`);
      parts.push(`Investment style guidance: ${profile.riskAssessment.investmentStyle}`);

      // Format expanded allocation - check for new format vs legacy
      if ('usStocks' in alloc) {
        const allocParts = [
          `US Stocks ${alloc.usStocks}%`,
          `Int'l Stocks ${alloc.intlStocks}%`,
          `Bonds ${alloc.bonds}%`,
          `Commodities ${alloc.commodities}%`,
          `Alternatives ${alloc.alternatives}%`,
        ];
        if (alloc.crypto > 0) {
          allocParts.push(`Crypto ${alloc.crypto}%`);
        }
        allocParts.push(`Cash ${alloc.cash}%`);
        parts.push(`Target allocation: ${allocParts.join(', ')}`);
      } else {
        // Legacy 3-category format
        const legacyAlloc = alloc as { stocks: number; bonds: number; cash: number };
        parts.push(`Target allocation: Stocks ${legacyAlloc.stocks}%, Bonds ${legacyAlloc.bonds}%, Cash ${legacyAlloc.cash}%`);
      }
    } else if (profile.riskTolerance) {
      parts.push(`Risk tolerance: ${profile.riskTolerance}`);
    }
    if (profile.investmentHorizon) {
      const horizonMap = { short: 'less than 3 years', medium: '3-10 years', long: '10+ years' };
      parts.push(`Investment horizon: ${horizonMap[profile.investmentHorizon]}`);
    }
    if (profile.investmentExperience) {
      parts.push(`Investment experience: ${profile.investmentExperience}`);
    }
    if (profile.investmentStyle) {
      parts.push(`Preferred approach: ${profile.investmentStyle} investing`);
    }
    if (profile.dividendPreference) {
      parts.push(`Dividend preference: ${profile.dividendPreference}`);
    }

    // Sectors - make these actionable with clear labels
    if (profile.preferredSectors.length > 0) {
      parts.push(`PREFERRED sectors (emphasize these): ${profile.preferredSectors.join(', ')}`);
    }
    if (profile.excludedSectors.length > 0) {
      parts.push(`EXCLUDED sectors (DO NOT recommend): ${profile.excludedSectors.join(', ')}`);
    }

    // Goals - format with actionable context
    if (profile.financialGoals.length > 0) {
      const goalsList = profile.financialGoals.map((g) => {
        const progress = Math.round((g.currentAmount / g.targetAmount) * 100);
        const remaining = g.targetAmount - g.currentAmount;
        return `${g.name}: $${remaining.toLocaleString()} needed by ${g.targetDate} (${progress}% complete, ${g.priority} priority)`;
      });
      parts.push(`Active financial goals:\n  - ${goalsList.join('\n  - ')}`);
    }

    // Notes
    if (profile.additionalNotes) {
      parts.push(`Additional context: ${profile.additionalNotes}`);
    }

    return parts.join('\n');
  }, [profile]);

  // Check if profile has any data
  const hasProfile = Boolean(
    profile.name ||
    profile.age ||
    profile.annualIncome ||
    profile.riskTolerance ||
    profile.riskAssessment ||
    profile.financialGoals.length > 0
  );

  return {
    profile,
    loading,
    hasProfile,
    saveProfile,
    addGoal,
    removeGoal,
    updateGoal,
    getProfileContext,
  };
}
