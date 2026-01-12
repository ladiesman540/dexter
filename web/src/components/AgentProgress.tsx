import { CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';
import type { AgentProgress as AgentProgressType, Phase } from '../types';

interface AgentProgressProps {
  progress: AgentProgressType;
}

const PHASE_LABELS: Record<Phase, string> = {
  understand: 'Understanding',
  plan: 'Planning',
  execute: 'Executing',
  reflect: 'Reflecting',
  answer: 'Answering',
};

function PhaseIndicator({
  phase,
  isActive,
  isComplete,
}: {
  phase: Phase;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
        isActive
          ? 'bg-dexter-600/20 text-dexter-400'
          : isComplete
          ? 'text-gray-400'
          : 'text-gray-600'
      }`}
    >
      {isActive ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isComplete ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <Circle className="w-4 h-4" />
      )}
      <span>{PHASE_LABELS[phase]}</span>
    </div>
  );
}

export function AgentProgress({ progress }: AgentProgressProps) {
  const phases: Phase[] = ['understand', 'plan', 'execute', 'reflect', 'answer'];

  // Safety check for undefined progress
  if (!progress) {
    return null;
  }

  const tasks = progress.tasks || [];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      {/* Phase indicators */}
      <div className="flex flex-wrap gap-2 mb-4">
        {phases.map((phase) => (
          <PhaseIndicator
            key={phase}
            phase={phase}
            isActive={progress.currentPhase === phase}
            isComplete={
              phase === 'understand'
                ? progress.understandComplete
                : phase === 'plan'
                ? progress.planComplete
                : phase === 'execute'
                ? progress.executeComplete
                : phase === 'reflect'
                ? progress.reflectComplete
                : false
            }
          />
        ))}
      </div>

      {/* Progress message */}
      {progress.progressMessage && (
        <p className="text-sm text-gray-400 mb-4">{progress.progressMessage}</p>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Tasks
          </p>
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 px-3 py-2 rounded-lg text-sm ${
                task.status === 'in_progress'
                  ? 'bg-gray-800'
                  : task.status === 'completed'
                  ? 'bg-gray-800/50'
                  : task.status === 'failed'
                  ? 'bg-red-900/20'
                  : 'bg-gray-800/30'
              }`}
            >
              <div className="mt-0.5">
                {task.status === 'in_progress' ? (
                  <Loader2 className="w-4 h-4 text-dexter-400 animate-spin" />
                ) : task.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-dexter-500" />
                ) : task.status === 'failed' ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`truncate ${
                    task.status === 'completed'
                      ? 'text-gray-500'
                      : task.status === 'failed'
                      ? 'text-red-400'
                      : 'text-gray-300'
                  }`}
                >
                  {task.description}
                </p>
                {/* Tool calls */}
                {task.toolCalls && task.toolCalls.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {task.toolCalls.map((tool, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-0.5 rounded ${
                          tool.status === 'running'
                            ? 'bg-dexter-600/20 text-dexter-400'
                            : tool.status === 'completed'
                            ? 'bg-gray-700 text-gray-400'
                            : tool.status === 'failed'
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-gray-800 text-gray-500'
                        }`}
                      >
                        {tool.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
