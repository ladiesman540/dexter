import { useState } from 'react';
import { Save, Plus, Trash2, Target, TrendingUp, Shield, Loader2, ClipboardCheck, RotateCcw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useProfile, FinancialGoal } from '../hooks/useProfile';
import { RiskAssessment, RiskAssessmentResult } from '../components/RiskAssessment';

const SECTORS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Energy',
  'Consumer Goods',
  'Real Estate',
  'Utilities',
  'Materials',
  'Industrials',
  'Telecommunications',
  'Crypto/Blockchain',
  'ESG/Sustainable',
];

export default function Profile() {
  const {
    profile,
    loading,
    saveProfile,
    addGoal,
    removeGoal,
  } = useProfile();

  const [saved, setSaved] = useState(false);
  const [showRiskQuiz, setShowRiskQuiz] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    priority: 'medium' as const,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRiskAssessmentComplete = (result: RiskAssessmentResult) => {
    saveProfile({
      riskTolerance: result.tolerance,
      riskAssessment: result,
    });
    setShowRiskQuiz(false);
    handleSave();
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;

    addGoal({
      name: newGoal.name,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: Number(newGoal.currentAmount) || 0,
      targetDate: newGoal.targetDate,
      priority: newGoal.priority,
    });

    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      priority: 'medium',
    });
  };

  const toggleSector = (sector: string, type: 'preferred' | 'excluded') => {
    const key = type === 'preferred' ? 'preferredSectors' : 'excludedSectors';
    const otherKey = type === 'preferred' ? 'excludedSectors' : 'preferredSectors';
    const current = profile[key];

    if (current.includes(sector)) {
      saveProfile({ [key]: current.filter((s) => s !== sector) });
    } else {
      // Remove from other list if present
      saveProfile({
        [key]: [...current, sector],
        [otherKey]: profile[otherKey].filter((s) => s !== sector),
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-dexter-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-dexter-500 to-dexter-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Your Profile</h1>
              <p className="text-gray-400 text-sm">
                Help Dexter give you personalized financial advice
              </p>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-8">
            All data is stored locally in your browser and never sent to any server.
          </p>

          <div className="space-y-8">
            {/* Personal Info */}
            <section className="card">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>Personal Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => saveProfile({ name: e.target.value })}
                    placeholder="Your name"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Age</label>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => saveProfile({ age: e.target.value ? Number(e.target.value) : null })}
                    placeholder="30"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Employment Status</label>
                  <select
                    value={profile.employmentStatus}
                    onChange={(e) => saveProfile({ employmentStatus: e.target.value as UserProfile['employmentStatus'] })}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-employed</option>
                    <option value="retired">Retired</option>
                    <option value="student">Student</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Financial Stats */}
            <section className="card">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-dexter-500" />
                <span>Financial Situation</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Annual Income ($)</label>
                  <input
                    type="number"
                    value={profile.annualIncome || ''}
                    onChange={(e) => saveProfile({ annualIncome: e.target.value ? Number(e.target.value) : null })}
                    placeholder="75000"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Monthly Expenses ($)</label>
                  <input
                    type="number"
                    value={profile.monthlyExpenses || ''}
                    onChange={(e) => saveProfile({ monthlyExpenses: e.target.value ? Number(e.target.value) : null })}
                    placeholder="4000"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Total Savings ($)</label>
                  <input
                    type="number"
                    value={profile.totalSavings || ''}
                    onChange={(e) => saveProfile({ totalSavings: e.target.value ? Number(e.target.value) : null })}
                    placeholder="25000"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Total Investments ($)</label>
                  <input
                    type="number"
                    value={profile.totalInvestments || ''}
                    onChange={(e) => saveProfile({ totalInvestments: e.target.value ? Number(e.target.value) : null })}
                    placeholder="50000"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Total Debt ($)</label>
                  <input
                    type="number"
                    value={profile.totalDebt || ''}
                    onChange={(e) => saveProfile({ totalDebt: e.target.value ? Number(e.target.value) : null })}
                    placeholder="15000"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Emergency Fund (months)</label>
                  <input
                    type="number"
                    value={profile.emergencyFundMonths || ''}
                    onChange={(e) => saveProfile({ emergencyFundMonths: e.target.value ? Number(e.target.value) : null })}
                    placeholder="6"
                    className="input-field"
                  />
                </div>
              </div>
            </section>

            {/* Investment Profile */}
            <section className="card">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-dexter-500" />
                <span>Investment Profile</span>
              </h2>

              {/* Risk Assessment Quiz or Results */}
              {showRiskQuiz ? (
                <div className="mb-6">
                  <RiskAssessment
                    onComplete={handleRiskAssessmentComplete}
                    onCancel={() => setShowRiskQuiz(false)}
                  />
                </div>
              ) : profile.riskAssessment ? (
                <div className="mb-6">
                  <div className="bg-gray-800 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          profile.riskAssessment.tolerance === 'conservative'
                            ? 'bg-blue-500/20'
                            : profile.riskAssessment.tolerance === 'moderate'
                            ? 'bg-yellow-500/20'
                            : 'bg-red-500/20'
                        }`}>
                          <span className="text-xl">
                            {profile.riskAssessment.tolerance === 'conservative' ? '🛡️' : profile.riskAssessment.tolerance === 'moderate' ? '⚖️' : '🚀'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white capitalize">
                            {profile.riskAssessment.tolerance} Investor
                          </h3>
                          <p className="text-sm text-gray-400">Risk Score: {profile.riskAssessment.score}/5</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowRiskQuiz(true)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retake
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{profile.riskAssessment.description}</p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-gray-700 rounded-lg p-2">
                        <div className="text-lg font-bold text-dexter-400">
                          {'usStocks' in profile.riskAssessment.assetAllocation
                            ? profile.riskAssessment.assetAllocation.usStocks
                            : (profile.riskAssessment.assetAllocation as { stocks: number }).stocks}%
                        </div>
                        <div className="text-xs text-gray-400">US Stocks</div>
                      </div>
                      {'usStocks' in profile.riskAssessment.assetAllocation && (
                        <div className="bg-gray-700 rounded-lg p-2">
                          <div className="text-lg font-bold text-dexter-300">{profile.riskAssessment.assetAllocation.intlStocks}%</div>
                          <div className="text-xs text-gray-400">Int'l</div>
                        </div>
                      )}
                      <div className="bg-gray-700 rounded-lg p-2">
                        <div className="text-lg font-bold text-blue-400">{profile.riskAssessment.assetAllocation.bonds}%</div>
                        <div className="text-xs text-gray-400">Bonds</div>
                      </div>
                      {'usStocks' in profile.riskAssessment.assetAllocation && (
                        <>
                          <div className="bg-gray-700 rounded-lg p-2">
                            <div className="text-lg font-bold text-yellow-400">{profile.riskAssessment.assetAllocation.commodities}%</div>
                            <div className="text-xs text-gray-400">Cmdty</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-2">
                            <div className="text-lg font-bold text-purple-400">{profile.riskAssessment.assetAllocation.alternatives}%</div>
                            <div className="text-xs text-gray-400">Alts</div>
                          </div>
                          {profile.riskAssessment.assetAllocation.crypto > 0 && (
                            <div className="bg-gray-700 rounded-lg p-2">
                              <div className="text-lg font-bold text-orange-400">{profile.riskAssessment.assetAllocation.crypto}%</div>
                              <div className="text-xs text-gray-400">Crypto</div>
                            </div>
                          )}
                        </>
                      )}
                      <div className="bg-gray-700 rounded-lg p-2">
                        <div className="text-lg font-bold text-gray-300">{profile.riskAssessment.assetAllocation.cash}%</div>
                        <div className="text-xs text-gray-400">Cash</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                    <ClipboardCheck className="w-10 h-10 text-dexter-500 mx-auto mb-3" />
                    <h3 className="font-medium text-white mb-2">Discover Your Risk Tolerance</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Take a quick 10-question quiz to understand your true risk tolerance based on your
                      behavior and preferences, not just what you think you want.
                    </p>
                    <button
                      onClick={() => setShowRiskQuiz(true)}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Take Risk Assessment Quiz
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Investment Horizon</label>
                  <select
                    value={profile.investmentHorizon}
                    onChange={(e) => saveProfile({ investmentHorizon: e.target.value as UserProfile['investmentHorizon'] })}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    <option value="short">Short-term (less than 3 years)</option>
                    <option value="medium">Medium-term (3-10 years)</option>
                    <option value="long">Long-term (10+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Investment Experience</label>
                  <select
                    value={profile.investmentExperience}
                    onChange={(e) => saveProfile({ investmentExperience: e.target.value as UserProfile['investmentExperience'] })}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    <option value="beginner">Beginner - Just starting out</option>
                    <option value="intermediate">Intermediate - Some experience</option>
                    <option value="advanced">Advanced - Experienced investor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Investment Style</label>
                  <select
                    value={profile.investmentStyle}
                    onChange={(e) => saveProfile({ investmentStyle: e.target.value as UserProfile['investmentStyle'] })}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    <option value="passive">Passive - Index funds, ETFs</option>
                    <option value="active">Active - Individual stocks</option>
                    <option value="mixed">Mixed - Both approaches</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Dividend Preference</label>
                  <select
                    value={profile.dividendPreference}
                    onChange={(e) => saveProfile({ dividendPreference: e.target.value as UserProfile['dividendPreference'] })}
                    className="input-field"
                  >
                    <option value="">Select...</option>
                    <option value="growth">Growth - Reinvest dividends, focus on appreciation</option>
                    <option value="income">Income - Regular dividend payments</option>
                    <option value="balanced">Balanced - Mix of both</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Sector Preferences */}
            <section className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Sector Preferences</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Preferred Sectors (click to select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map((sector) => (
                      <button
                        key={sector}
                        onClick={() => toggleSector(sector, 'preferred')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          profile.preferredSectors.includes(sector)
                            ? 'bg-dexter-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Sectors to Avoid (click to select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map((sector) => (
                      <button
                        key={sector}
                        onClick={() => toggleSector(sector, 'excluded')}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          profile.excludedSectors.includes(sector)
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Financial Goals */}
            <section className="card">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-dexter-500" />
                <span>Financial Goals</span>
              </h2>

              {/* Existing goals */}
              {profile.financialGoals.length > 0 && (
                <div className="space-y-3 mb-6">
                  {profile.financialGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center gap-4 bg-gray-800 rounded-lg p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{goal.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              goal.priority === 'high'
                                ? 'bg-red-500/20 text-red-400'
                                : goal.priority === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {goal.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                          {goal.targetDate && ` · Target: ${goal.targetDate}`}
                        </div>
                        <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-dexter-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeGoal(goal.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new goal */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-3">Add a new goal</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Goal name (e.g., Retirement, House)"
                    className="input-field"
                  />
                  <input
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal((p) => ({ ...p, targetAmount: e.target.value }))}
                    placeholder="Target amount ($)"
                    className="input-field"
                  />
                  <input
                    type="number"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal((p) => ({ ...p, currentAmount: e.target.value }))}
                    placeholder="Current amount ($)"
                    className="input-field"
                  />
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal((p) => ({ ...p, targetDate: e.target.value }))}
                    className="input-field"
                  />
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal((p) => ({ ...p, priority: e.target.value as FinancialGoal['priority'] }))}
                    className="input-field"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                  <button
                    onClick={handleAddGoal}
                    disabled={!newGoal.name || !newGoal.targetAmount}
                    className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add Goal
                  </button>
                </div>
              </div>
            </section>

            {/* Additional Notes */}
            <section className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Additional Notes</h2>
              <textarea
                value={profile.additionalNotes}
                onChange={(e) => saveProfile({ additionalNotes: e.target.value })}
                placeholder="Any other information you'd like Dexter to consider when giving advice (e.g., upcoming major expenses, specific concerns, investment restrictions)..."
                rows={4}
                className="input-field resize-none"
              />
            </section>

            {/* Save indicator */}
            {saved && (
              <div className="fixed bottom-6 right-6 bg-dexter-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <Save className="w-4 h-4" />
                Profile saved automatically
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Type import for the component
import type { UserProfile } from '../hooks/useProfile';
