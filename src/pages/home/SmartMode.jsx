import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

const BUDGET_PREFERENCES = [
  { key: 'tight', label: 'Tight Budget', multiplier: 0.75 },
  { key: 'balanced', label: 'Balanced Spend', multiplier: 1 },
  { key: 'flex', label: 'Flexible Spend', multiplier: 1.25 },
];

export default function SmartMode({
  dynamicGoals,
  goal,
  setGoal,
  budget,
  setBudget,
  runSmartMode,
  running,
  loadingProducts,
  error,
  bundleScenarios,
  addToCart,
}) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [goalInput, setGoalInput] = useState(goal || '');
  const [budgetPreference, setBudgetPreference] = useState('');
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('');
  const [customizedBundle, setCustomizedBundle] = useState([]);

  const showResult = bundleScenarios.length > 0;

  const filteredGoals = useMemo(() => {
    const key = goalInput.trim().toLowerCase();
    if (!key) return dynamicGoals.slice(0, 8);
    return dynamicGoals.filter((g) => g.toLowerCase().includes(key)).slice(0, 8);
  }, [dynamicGoals, goalInput]);

  useEffect(() => {
    if (currentStep !== 1 || showResult) return;
    const normalized = goalInput.trim();
    if (normalized.length < 3) return;
    const timeoutId = setTimeout(() => {
      setGoal(normalized);
      setCurrentStep(2);
    }, 450);
    return () => clearTimeout(timeoutId);
  }, [goalInput, currentStep, showResult, setGoal, setCurrentStep]);

  useEffect(() => {
    if (currentStep !== 2 || !budgetPreference || running || loadingProducts) return;
    const baseBudget = 5000;
    const pref = BUDGET_PREFERENCES.find((item) => item.key === budgetPreference);
    const nextBudget = Math.max(500, Math.round((baseBudget * (pref?.multiplier || 1)) / 100) * 100);
    setBudget(nextBudget);
    const timeoutId = setTimeout(() => {
      runSmartMode();
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [budgetPreference, currentStep, running, loadingProducts, runSmartMode, setBudget]);

  useEffect(() => {
    if (!bundleScenarios.length) return;
    setSelectedScenarioKey((prev) => prev || bundleScenarios[0].key);
  }, [bundleScenarios]);

  const selectedScenario = useMemo(
    () => bundleScenarios.find((item) => item.key === selectedScenarioKey) || bundleScenarios[0] || null,
    [bundleScenarios, selectedScenarioKey]
  );

  useEffect(() => {
    if (!selectedScenario) {
      setCustomizedBundle([]);
      return;
    }
    setCustomizedBundle(selectedScenario.bundle.map((item) => ({ ...item, qty: Number(item.qty || 1) })));
  }, [selectedScenario]);

  const customizedTotals = useMemo(() => {
    const subtotal = customizedBundle.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
    const targetBudget = Math.max(1, Number(selectedScenario?.budget || budget || 0));
    const spendRatio = Math.min(1.25, subtotal / targetBudget);
    const itemCount = customizedBundle.length;

    const itemCountBonus = itemCount >= 6 ? 0.06 : itemCount >= 4 ? 0.04 : itemCount >= 2 ? 0.02 : 0;
    const budgetFitBonus = spendRatio >= 0.95 ? 0.04 : spendRatio >= 0.8 ? 0.03 : spendRatio >= 0.6 ? 0.02 : 0.01;
    const discountRate = itemCount >= 2 ? Math.min(0.12, itemCountBonus + budgetFitBonus) : 0;
    const discountValue = subtotal * discountRate;
    return {
      subtotal,
      discountRate,
      discountValue,
      total: subtotal - discountValue,
      remaining: Number(selectedScenario?.budget || budget || 0) - (subtotal - discountValue),
    };
  }, [customizedBundle, selectedScenario, budget]);

  const upgradeHint = useMemo(() => {
    if (!selectedScenario || bundleScenarios.length < 2) return '';
    const idx = bundleScenarios.findIndex((item) => item.key === selectedScenario.key);
    if (idx < 0 || idx >= bundleScenarios.length - 1) return '';

    const nextScenario = bundleScenarios[idx + 1];
    const currentIds = new Set(customizedBundle.map((item) => Number(item.id)));
    const extraItem = (nextScenario.bundle || []).find((item) => !currentIds.has(Number(item.id)));
    const addMore = Math.max(0, Number(nextScenario.budget || 0) - Number(selectedScenario.budget || 0));

    if (extraItem && addMore > 0) {
      return `Add ${formatPrice(addMore)} more and you can include ${extraItem.name}.`;
    }
    if (addMore > 0) {
      return `Add ${formatPrice(addMore)} more to unlock the ${nextScenario.label} bundle.`;
    }
    return '';
  }, [selectedScenario, bundleScenarios, customizedBundle]);

  function updateQty(id, delta) {
    setCustomizedBundle((prev) => prev.map((item) => (
      item.id === id ? { ...item, qty: Math.max(1, Number(item.qty || 1) + delta) } : item
    )));
  }

  function removeItem(id) {
    setCustomizedBundle((prev) => prev.filter((item) => item.id !== id));
  }

  function handleCheckout() {
    customizedBundle.forEach((item) => {
      addToCart(item, Number(item.qty || 1));
    });
    navigate('/cart');
  }

  return (
    <section className="opti-slide-up rounded-2xl border border-[#d5dded] bg-white p-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Smart mode: Step flow</h1>
      <p className="mt-1 text-sm text-slate-600">Type goal, choose budget preference, then compare generated bundles before checkout.</p>

      {!showResult && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
          <span className={`rounded-full px-2.5 py-1 ${currentStep >= 1 ? 'bg-[#1A2A54] text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
          <span>Goal</span>
          <span className="text-slate-300">/</span>
          <span className={`rounded-full px-2.5 py-1 ${currentStep >= 2 ? 'bg-[#1A2A54] text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
          <span>Budget Preference</span>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-[#d5dded] bg-[#f8fbff] p-4">
        {!showResult && currentStep === 1 && (
          <div className="opti-slide-up">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Step 1 • What is this for?</p>
            <p className="mt-1 text-sm text-slate-600">Type your goal and pick a suggestion if it matches.</p>
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Example: Study Setup"
              className="mt-3 w-full rounded-xl border border-[#d5dded] bg-white px-4 py-3 text-sm"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {filteredGoals.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGoalInput(g);
                    setGoal(g);
                    setCurrentStep(2);
                  }}
                  className="rounded-full bg-[#edf3fb] px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#dbe8fa]"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {!showResult && currentStep === 2 && (
          <div className="opti-slide-up">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Step 2 • Budget Preference</p>
            <p className="mt-1 text-sm text-slate-600">Choose spending preference. We’ll generate multiple budget bundles automatically.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {BUDGET_PREFERENCES.map((pref) => (
                <button
                  key={pref.key}
                  type="button"
                  onClick={() => setBudgetPreference(pref.key)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm font-bold ${budgetPreference === pref.key ? 'border-[#1A2A54] bg-[#1A2A54] text-white' : 'border-[#d5dded] bg-white text-slate-700'}`}
                >
                  {pref.label}
                </button>
              ))}
            </div>
            {running && <p className="mt-3 text-xs font-semibold text-slate-500">Generating bundle options...</p>}
          </div>
        )}

        {showResult && (
          <div className="opti-slide-up">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Bundles Generated</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Choose one bundle, customize it, then go to checkout.</p>
          </div>
        )}
      </div>

      {!showResult && currentStep > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              setBudgetPreference('');
            }}
            className="rounded-lg border border-[#d5dded] bg-white px-4 py-2 text-sm font-bold text-slate-700"
          >
            Back
          </button>
        </div>
      )}

      {!!error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      {showResult && (
        <div className="mt-5 rounded-xl border border-[#d5dded] bg-[#f8fbff] p-4 opti-slide-up">
          <div className="grid gap-2 sm:grid-cols-3">
            {bundleScenarios.map((scenario) => (
              <button
                key={scenario.key}
                type="button"
                onClick={() => setSelectedScenarioKey(scenario.key)}
                className={`rounded-xl border p-3 text-left ${selectedScenario?.key === scenario.key ? 'border-[#1A2A54] bg-white' : 'border-[#d5dded] bg-white/70'}`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{scenario.label}</p>
                <p className="mt-1 text-sm font-extrabold text-[#1A2A54]">Budget {formatPrice(scenario.budget)}</p>
                <p className="mt-1 text-xs text-slate-500">Bundle {formatPrice(scenario.total)} • Left {formatPrice(scenario.remaining)}</p>
              </button>
            ))}
          </div>

          {!!upgradeHint && (
            <p className="mt-3 rounded-lg border border-[#ffd7b8] bg-[#fff3ea] px-3 py-2 text-xs font-semibold text-[#b45309]">{upgradeHint}</p>
          )}

          <div className="mt-3 grid gap-2">
            {customizedBundle.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#d5dded] bg-white px-3 py-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  {item.image_path || item.image ? (
                    <img
                      src={item.image_path || item.image}
                      alt={item.name}
                      className="h-10 w-10 shrink-0 rounded-md border border-[#dbe4f3] bg-[#f8fbff] object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#dbe4f3] bg-[#f8fbff] text-[10px] font-bold text-slate-400">N/A</div>
                  )}
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-800 line-clamp-2">{item.name}</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <button type="button" onClick={() => updateQty(item.id, -1)} className="h-6 w-6 rounded border border-[#d5dded] text-xs font-bold text-slate-700">-</button>
                      <span className="min-w-7 text-center text-xs font-bold text-slate-700">{item.qty || 1}</span>
                      <button type="button" onClick={() => updateQty(item.id, 1)} className="h-6 w-6 rounded border border-[#d5dded] text-xs font-bold text-slate-700">+</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-[#FF6B00]">{formatPrice(Number(item.price || 0) * Number(item.qty || 1))}</span>
                  <button type="button" onClick={() => removeItem(item.id)} className="text-[11px] font-semibold text-slate-500 hover:text-slate-700">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-[#d5dded] bg-white px-3 py-2 text-sm text-slate-700">
            <p>Subtotal: <span className="font-bold text-slate-900">{formatPrice(customizedTotals.subtotal)}</span></p>
            <p>Bundle discount ({Math.round(customizedTotals.discountRate * 100)}%): <span className="font-bold text-emerald-700">- {formatPrice(customizedTotals.discountValue)}</span></p>
            <p>Total after bundle discount: <span className="font-extrabold text-[#1A2A54]">{formatPrice(customizedTotals.total)}</span></p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCheckout}
              className="inline-flex rounded-lg bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:bg-[#E65C00]"
            >
              Go to checkout
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                setBudgetPreference('');
                setSelectedScenarioKey('');
              }}
              className="inline-flex rounded-lg border border-[#d5dded] bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-[#eef3fb]"
            >
              Back to step 1
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
