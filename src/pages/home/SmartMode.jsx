import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { postBundleRating, postSaveBundle } from '../../lib/api';

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString()}`;
}

function buildBundleSignature(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      product_id: Number(item?.product_id || item?.id || 0),
      quantity: Math.max(1, Number(item?.quantity || item?.qty || 1)),
    }))
    .filter((item) => item.product_id > 0)
    .sort((a, b) => (a.product_id - b.product_id) || (a.quantity - b.quantity))
    .map((item) => `${item.product_id}:${item.quantity}`)
    .join('|');
}

const BUDGET_PREFERENCES = [
  { key: 'tight', label: 'Tight Budget', multiplier: 0.75 },
  { key: 'balanced', label: 'Balanced Spend', multiplier: 1 },
  { key: 'flex', label: 'Flexible Spend', multiplier: 1.25 },
];
const SHOPPING_PRIORITIES = [
  'Cheapest option',
  'Best overall value',
  'Highest quality',
  'Balanced recommendation',
  'Most discounted items',
];
const BUNDLE_RATING_REASONS = [
  'great value',
  'relevant items',
  'too expensive',
  'not relevant',
  'duplicate items',
  'missing essentials',
];

export default function SmartMode({
  userKey,
  smartCacheStorageKey,
  goal,
  setGoal,
  budget,
  setBudget,
  runSmartMode,
  resetSmartFlow,
  restoreSmartScenarios,
  running,
  loadingProducts,
  error,
  bundleScenarios,
  generatedBundleIdsByScenario,
  modelMeta,
  debugReco,
  addBundleToCart,
}) {
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [goalInput, setGoalInput] = useState(goal || '');
  const [goalInputTouched, setGoalInputTouched] = useState(false);
  const [budgetPreference, setBudgetPreference] = useState('');
  const [shoppingPriority, setShoppingPriority] = useState('Balanced recommendation');
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('');
  const [customizedBundle, setCustomizedBundle] = useState([]);
  const [bundleSourceKey, setBundleSourceKey] = useState('');
  const [removedItemsByScenario, setRemovedItemsByScenario] = useState({});
  const [ratingsByScenario, setRatingsByScenario] = useState({});
  const [ratingReasonsByScenario, setRatingReasonsByScenario] = useState({});
  const [submittedSignatureByScenario, setSubmittedSignatureByScenario] = useState({});
  const [savingRating, setSavingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  const showResult = bundleScenarios.length > 0;

  useEffect(() => {
    if (!smartCacheStorageKey) return;
    try {
      const raw = localStorage.getItem(smartCacheStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.goalInput === 'string') setGoalInput(parsed.goalInput);
      if (typeof parsed?.goalInputTouched === 'boolean') setGoalInputTouched(parsed.goalInputTouched);
      if (Number.isFinite(Number(parsed?.currentStep))) setCurrentStep(Math.max(1, Math.min(3, Number(parsed.currentStep))));
      if (typeof parsed?.budgetPreference === 'string') setBudgetPreference(parsed.budgetPreference);
      if (typeof parsed?.shoppingPriority === 'string' && parsed.shoppingPriority.trim()) setShoppingPriority(parsed.shoppingPriority);
      if (typeof parsed?.selectedScenarioKey === 'string') setSelectedScenarioKey(parsed.selectedScenarioKey);
      if (Array.isArray(parsed?.customizedBundle)) setCustomizedBundle(parsed.customizedBundle);
      if (typeof parsed?.bundleSourceKey === 'string') setBundleSourceKey(parsed.bundleSourceKey);
      if (parsed?.removedItemsByScenario && typeof parsed.removedItemsByScenario === 'object') setRemovedItemsByScenario(parsed.removedItemsByScenario);
      if (parsed?.ratingsByScenario && typeof parsed.ratingsByScenario === 'object') setRatingsByScenario(parsed.ratingsByScenario);
      if (parsed?.ratingReasonsByScenario && typeof parsed.ratingReasonsByScenario === 'object') setRatingReasonsByScenario(parsed.ratingReasonsByScenario);
      if (parsed?.submittedSignatureByScenario && typeof parsed.submittedSignatureByScenario === 'object') setSubmittedSignatureByScenario(parsed.submittedSignatureByScenario);
      if (Array.isArray(parsed?.bundleScenarios)) restoreSmartScenarios?.(parsed.bundleScenarios);
      if (typeof parsed?.goal === 'string' && parsed.goal.trim()) setGoal(parsed.goal);
      if (Number.isFinite(Number(parsed?.budget)) && Number(parsed.budget) > 0) setBudget(Number(parsed.budget));
    } catch {
      // ignore invalid local cache
    }
  }, [smartCacheStorageKey, restoreSmartScenarios, setGoal, setBudget, userKey]);

  useEffect(() => {
    if (!smartCacheStorageKey) return;
    try {
      localStorage.setItem(
        smartCacheStorageKey,
        JSON.stringify({
          goal,
          budget,
          goalInput,
          goalInputTouched,
          currentStep,
          budgetPreference,
          shoppingPriority,
          selectedScenarioKey,
          customizedBundle,
          bundleSourceKey,
          removedItemsByScenario,
          ratingsByScenario,
          ratingReasonsByScenario,
          submittedSignatureByScenario,
          bundleScenarios,
          savedAt: Date.now(),
        })
      );
    } catch {
      // ignore storage write issues
    }
  }, [
    smartCacheStorageKey,
    goal,
    budget,
    goalInput,
    goalInputTouched,
    currentStep,
    budgetPreference,
    shoppingPriority,
    selectedScenarioKey,
    customizedBundle,
    bundleSourceKey,
    removedItemsByScenario,
    ratingsByScenario,
    ratingReasonsByScenario,
    submittedSignatureByScenario,
    bundleScenarios,
  ]);

  useEffect(() => {
    if (currentStep !== 3 || !budgetPreference || running || loadingProducts) return;
    const baseBudget = 5000;
    const pref = BUDGET_PREFERENCES.find((item) => item.key === budgetPreference);
    const nextBudget = Math.max(500, Math.round((baseBudget * (pref?.multiplier || 1)) / 100) * 100);
    setBudget(nextBudget);
    const timeoutId = setTimeout(() => {
      runSmartMode({
        goal,
        budget: nextBudget,
        shoppingPriority,
      });
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [budgetPreference, currentStep, running, loadingProducts, runSmartMode, setBudget, goal, shoppingPriority]);

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
      setBundleSourceKey('');
      return;
    }
    if (bundleSourceKey === selectedScenario.key) return;
    setCustomizedBundle(selectedScenario.bundle.map((item) => ({ ...item, qty: Number(item.qty || 1) })));
    setBundleSourceKey(selectedScenario.key);
  }, [selectedScenario, bundleSourceKey]);

  const customizedTotals = useMemo(() => {
    const subtotal = customizedBundle.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
    const targetBudget = Math.max(1, Number(selectedScenario?.budget || budget || 0));
    const spendRatio = Math.min(1.25, subtotal / targetBudget);
    const itemCount = customizedBundle.length;
    const metrics = selectedScenario?.metrics || {};
    const quality = Math.max(0, Math.min(100, Number(metrics.product_quality || 0)));
    const diversity = Math.max(0, Math.min(100, Number(metrics.bundle_diversity || 0)));
    const budgetFit = Math.max(0, Math.min(100, Number(metrics.budget_fit || 0)));
    const finalScore = Math.max(0, Math.min(100, Number(metrics.final_score || 0)));

    const itemCountFactor = itemCount >= 6 ? 0.018 : itemCount >= 4 ? 0.013 : itemCount >= 2 ? 0.008 : 0;
    const spendFitFactor = spendRatio >= 0.95 ? 0.018 : spendRatio >= 0.85 ? 0.014 : spendRatio >= 0.7 ? 0.009 : 0.004;
    const qualityFactor = (quality / 100) * 0.012;
    const diversityFactor = (diversity / 100) * 0.008;
    const budgetFitFactor = (budgetFit / 100) * 0.01;
    const scoreFactor = (finalScore / 100) * 0.012;

    const dynamicRate =
      0.08 +
      itemCountFactor +
      spendFitFactor +
      qualityFactor +
      diversityFactor +
      budgetFitFactor +
      scoreFactor;

    const discountRate = itemCount >= 2 ? Math.max(0.08, Math.min(0.35, dynamicRate)) : 0;
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

  const currentBundleSignature = useMemo(
    () => buildBundleSignature(customizedBundle.map((item) => ({ product_id: item.id, quantity: item.qty }))),
    [customizedBundle]
  );
  const selectedRating = Number(ratingsByScenario[selectedScenario?.key] || 0);
  const reviewSubmittedForCurrentBundle = !!(
    selectedScenario?.key &&
    currentBundleSignature &&
    submittedSignatureByScenario[selectedScenario.key] === currentBundleSignature
  );

  function updateQty(id, delta) {
    setCustomizedBundle((prev) => prev.map((item) => (
      item.id === id ? { ...item, qty: Math.max(1, Number(item.qty || 1) + delta) } : item
    )));
  }

  function removeItem(id) {
    const target = customizedBundle.find((item) => Number(item.id) === Number(id));
    if (!target || !selectedScenario?.key) return;
    setCustomizedBundle((prev) => prev.filter((item) => Number(item.id) !== Number(id)));
    setRemovedItemsByScenario((prev) => ({
      ...prev,
      [selectedScenario.key]: [...(Array.isArray(prev[selectedScenario.key]) ? prev[selectedScenario.key] : []), target],
    }));
  }

  function undoRemove() {
    if (!selectedScenario?.key) return;
    const stack = Array.isArray(removedItemsByScenario[selectedScenario.key]) ? removedItemsByScenario[selectedScenario.key] : [];
    if (!stack.length) return;
    const item = stack[stack.length - 1];
    setRemovedItemsByScenario((prev) => ({
      ...prev,
      [selectedScenario.key]: stack.slice(0, -1),
    }));
    setCustomizedBundle((prev) => {
      if (prev.some((p) => Number(p.id) === Number(item.id))) return prev;
      return [...prev, item];
    });
  }

  function restoreCurrentTier() {
    if (!selectedScenario?.key) return;
    setCustomizedBundle((selectedScenario.bundle || []).map((item) => ({ ...item, qty: Number(item.qty || 1) })));
    setRemovedItemsByScenario((prev) => ({
      ...prev,
      [selectedScenario.key]: [],
    }));
  }

  function continueFromStepOne() {
    const normalized = goalInput.trim();
    if (!normalized) return;
    setGoalInputTouched(true);
    setGoal(normalized);
    setCurrentStep(2);
  }

  function resetToStepOne() {
    const cleanState = {
      goal: '',
      budget: 5000,
      goalInput: '',
      goalInputTouched: false,
      currentStep: 1,
      budgetPreference: '',
      shoppingPriority: 'Balanced recommendation',
      selectedScenarioKey: '',
      customizedBundle: [],
      bundleSourceKey: '',
      removedItemsByScenario: {},
      ratingsByScenario: {},
      ratingReasonsByScenario: {},
      submittedSignatureByScenario: {},
      bundleScenarios: [],
      savedAt: Date.now(),
    };
    setGoal('');
    setBudget(5000);
    setGoalInput('');
    setGoalInputTouched(false);
    setCurrentStep(1);
    setBudgetPreference('');
    setShoppingPriority('Balanced recommendation');
    setSelectedScenarioKey('');
    setCustomizedBundle([]);
    setBundleSourceKey('');
    setRemovedItemsByScenario({});
    setRatingsByScenario({});
    setRatingReasonsByScenario({});
    setSubmittedSignatureByScenario({});
    setSavingRating(false);
    setRatingMessage('');
    if (smartCacheStorageKey) {
      try {
        localStorage.setItem(smartCacheStorageKey, JSON.stringify(cleanState));
      } catch {
        // ignore storage issues
      }
    }
  }

  async function handleCheckout() {
    if (!reviewSubmittedForCurrentBundle) {
      setRatingMessage('Submit your bundle review first before checkout.');
      return;
    }
    const bundleName = `${goal || 'Smart'} - ${selectedScenario?.label || 'Bundle'}`;
    addBundleToCart(customizedBundle, {
      name: bundleName,
      total: customizedTotals.total,
      scenarioKey: selectedScenario?.key || null,
    });
    if (isSignedIn && selectedScenario && customizedBundle.length) {
      try {
        const token = await getToken();
        if (token) {
          const preferredType = String(goal || '').toLowerCase();
          const bundleType = preferredType.includes('gaming')
            ? 'gaming'
            : preferredType.includes('travel')
              ? 'travel'
              : preferredType.includes('fitness')
                ? 'fitness'
                : preferredType.includes('creator')
                  ? 'creator'
                  : preferredType.includes('smart')
                    ? 'smart_home'
                    : preferredType.includes('kitchen')
                      ? 'kitchen'
                      : 'study';

          await postSaveBundle(
            {
              name: `${goal || 'Smart'} - ${selectedScenario.label} Bundle`,
              description: `Saved from Smart mode checkout (${selectedScenario.key}).`,
              bundle_type: bundleType,
              estimated_total_price: customizedTotals.total,
              items: customizedBundle.map((item) => ({
                product_id: item.id,
                quantity: Number(item.qty || 1),
              })),
            },
            token
          );
        }
      } catch {
        // non-blocking save
      }
    }
    navigate('/cart');
  }

  async function handleRateBundle() {
    const safeScore = Number(selectedRating);
    if (!selectedScenario?.key || !Array.isArray(customizedBundle) || !customizedBundle.length) return;
    if (!Number.isInteger(safeScore) || safeScore < 1 || safeScore > 4) return;
    if (!isSignedIn) {
      setRatingMessage('Sign in required to save bundle rating.');
      return;
    }
    try {
      setSavingRating(true);
      setRatingMessage('');
      const token = await getToken();
      if (!token) {
        setRatingMessage('Sign in required to save bundle rating.');
        return;
      }
      await postBundleRating(
        {
          bundle_id: Number(generatedBundleIdsByScenario?.[selectedScenario.key] || 0) || null,
          scenario_key: selectedScenario.key,
          goal,
          rating_score: safeScore,
          post_purchase_rating: null,
          reason_tags: ratingReasonsByScenario[selectedScenario.key] || [],
          rating_stage: 'generated',
          generation_context: {
            budget: Number(selectedScenario?.budget || 0),
            total: Number(customizedTotals.total || 0),
            scenario_label: selectedScenario?.label || null,
            scenario_metrics: selectedScenario?.metrics || null,
          },
          source: 'smart_mode',
          items: customizedBundle.map((item) => ({
            product_id: item.id,
            quantity: Number(item.qty || 1),
          })),
        },
        token
      );
      setSubmittedSignatureByScenario((prev) => ({ ...prev, [selectedScenario.key]: currentBundleSignature }));
      setRatingMessage('Thanks for improving optimall!');
    } catch {
      setRatingMessage('Failed to save bundle rating.');
    } finally {
      setSavingRating(false);
    }
  }

  function toggleRatingReason(reason) {
    if (!selectedScenario?.key) return;
    setRatingReasonsByScenario((prev) => {
      const curr = Array.isArray(prev[selectedScenario.key]) ? prev[selectedScenario.key] : [];
      const exists = curr.includes(reason);
      const next = exists ? curr.filter((r) => r !== reason) : [...curr, reason].slice(0, 4);
      return { ...prev, [selectedScenario.key]: next };
    });
  }

  return (
    <section className="opti-slide-up rounded-2xl border border-[#d5dded] bg-white p-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Smart mode</h1>
      <p className="mt-1 text-sm text-slate-600">Set goal, priority, and budget preference, then compare generated bundles.</p>

      {!showResult && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
          <span className={`rounded-full px-2.5 py-1 ${currentStep >= 1 ? 'bg-[#1A2A54] text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
          <span>Goal</span>
          <span className="text-slate-300">/</span>
          <span className={`rounded-full px-2.5 py-1 ${currentStep >= 2 ? 'bg-[#1A2A54] text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
          <span>Priority</span>
          <span className="text-slate-300">/</span>
          <span className={`rounded-full px-2.5 py-1 ${currentStep >= 3 ? 'bg-[#1A2A54] text-white' : 'bg-slate-100 text-slate-500'}`}>3</span>
          <span>Budget Preference</span>
        </div>
      )}

      <div className="opti-enter-soft mt-5 rounded-xl border border-[#d5dded] bg-[#f8fbff] p-4">
        {!showResult && currentStep === 1 && (
          <div className="opti-slide-up">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Step 1 • What are you looking for?</p>
            <p className="mt-1 text-sm text-slate-600">Type product keywords (for example: bluetooth, keyboard, lamp) to build bundles from matching products.</p>
            <input
              type="text"
              value={goalInput}
              onChange={(e) => {
                setGoalInputTouched(true);
                setGoalInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  continueFromStepOne();
                }
              }}
              placeholder="Search products, e.g., bluetooth speaker, wireless mouse"
              className="opti-focus-ring mt-3 w-full rounded-xl border border-[#d5dded] bg-white px-4 py-3 text-sm transition-all duration-200 focus:border-[#aebdd9]"
            />
          </div>
        )}

        {!showResult && currentStep === 2 && (
          <div className="opti-slide-up">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Step 2 • Shopping Priority</p>
            <p className="mt-1 text-sm text-slate-600">Pick what matters most for this run.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SHOPPING_PRIORITIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setShoppingPriority(item);
                    setCurrentStep(3);
                  }}
                  className={`opti-press rounded-xl border px-3 py-3 text-left text-sm font-bold ${
                    shoppingPriority === item ? 'border-[#1A2A54] bg-[#1A2A54] text-white' : 'border-[#d5dded] bg-white text-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {!showResult && currentStep === 3 && (
          <div className="opti-slide-up">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Step 3 • Budget Preference</p>
            <p className="mt-1 text-sm text-slate-600">Choose spending preference. We’ll generate multiple budget bundles automatically.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {BUDGET_PREFERENCES.map((pref) => (
                <button
                  key={pref.key}
                  type="button"
                  onClick={() => setBudgetPreference(pref.key)}
                  className={`opti-press rounded-xl border px-3 py-3 text-left text-sm font-bold ${budgetPreference === pref.key ? 'border-[#1A2A54] bg-[#1A2A54] text-white' : 'border-[#d5dded] bg-white text-slate-700'}`}
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
              setCurrentStep((prev) => Math.max(1, prev - 1));
            }}
            className="opti-press rounded-lg border border-[#d5dded] bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-[#f8fbff]"
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
                className={`opti-press rounded-xl border p-3 text-left transition-all duration-200 ${selectedScenario?.key === scenario.key ? 'border-[#1A2A54] bg-white shadow-[0_10px_20px_-16px_rgba(26,42,84,0.65)]' : 'border-[#d5dded] bg-white/70 hover:bg-white'}`}
              >
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{scenario.label}</p>
                <p className="mt-1 text-sm font-extrabold text-[#1A2A54]">Budget {formatPrice(scenario.budget)}</p>
                <p className="mt-1 text-xs text-slate-500">Bundle {formatPrice(scenario.total)} • Left {formatPrice(scenario.remaining)}</p>
                {!!scenario?.metrics?.final_score && (
                  <p className="mt-1 text-[11px] font-bold text-emerald-700">Score {scenario.metrics.final_score}%</p>
                )}
              </button>
            ))}
          </div>

          {!!upgradeHint && (
            <p className="opti-enter-soft opti-stagger-1 mt-3 rounded-lg border border-[#ffd7b8] bg-[#fff3ea] px-3 py-2 text-xs font-semibold text-[#b45309]">{upgradeHint}</p>
          )}

          <div className="mt-3 grid gap-2">
            {customizedBundle.map((item) => (
              <div key={item.id} className="opti-enter-soft flex items-center justify-between gap-3 rounded-lg border border-[#d5dded] bg-white px-3 py-2">
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
                      <button type="button" onClick={() => updateQty(item.id, -1)} className="opti-press h-6 w-6 rounded border border-[#d5dded] text-xs font-bold text-slate-700 hover:bg-[#f8fbff]">-</button>
                      <span className="min-w-7 text-center text-xs font-bold text-slate-700">{item.qty || 1}</span>
                      <button type="button" onClick={() => updateQty(item.id, 1)} className="opti-press h-6 w-6 rounded border border-[#d5dded] text-xs font-bold text-slate-700 hover:bg-[#f8fbff]">+</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-[#FF6B00]">{formatPrice(Number(item.price || 0) * Number(item.qty || 1))}</span>
                  <button type="button" onClick={() => removeItem(item.id)} className="opti-press text-[11px] font-semibold text-slate-500 hover:text-slate-700">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-[#d5dded] bg-white px-3 py-2 text-left text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Why this bundle</p>
            {(selectedScenario?.explanation || []).length > 0 ? (
              <ul className="mt-1 list-disc space-y-1 pl-4">
                {(selectedScenario?.explanation || []).map((line, index) => (
                  <li key={`${selectedScenario?.key}-why-${index}`}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">Prioritizes best value-per-price items within your budget and current goal preference.</p>
            )}
          </div>

          <div className="opti-enter-soft opti-stagger-2 mt-4 rounded-lg border border-[#d5dded] bg-white px-3 py-2 text-sm text-slate-700">
            <p>Subtotal: <span className="font-bold text-slate-900">{formatPrice(customizedTotals.subtotal)}</span></p>
            <p>Bundle discount ({Math.round(customizedTotals.discountRate * 100)}%): <span className="font-bold text-emerald-700">- {formatPrice(customizedTotals.discountValue)}</span></p>
            <p>Total after bundle discount: <span className="font-extrabold text-[#1A2A54]">{formatPrice(customizedTotals.total)}</span></p>
          </div>
          {debugReco && (
            <div className="mt-2 rounded-lg border border-dashed border-[#c8d5ec] bg-[#f8fbff] px-3 py-2 text-[11px] text-slate-600">
              <p>Debug: variant={modelMeta?.experiment?.variant || '-'} strategy={modelMeta?.strategy || '-'} model={modelMeta?.active_model?.model_version || '-'} applied={String(!!modelMeta?.model_applied)}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="mr-2 inline-flex items-center gap-2 rounded-lg border border-[#d5dded] bg-white px-3 py-2">
              <span className="text-xs font-bold text-slate-600">Rate bundle</span>
              {[1, 2, 3, 4].map((score) => {
                const active = selectedRating === score;
                return (
                  <button
                    key={`bundle-rate-${score}`}
                    type="button"
                    disabled={savingRating || !selectedScenario}
                    onClick={() => {
                      if (!selectedScenario?.key) return;
                      setRatingsByScenario((prev) => ({ ...prev, [selectedScenario?.key]: score }));
                      setRatingMessage('');
                    }}
                    className={`opti-press h-7 w-7 rounded-md border text-xs font-extrabold ${
                      active
                        ? 'border-[#1A2A54] bg-[#1A2A54] text-white'
                        : 'border-[#d5dded] bg-white text-slate-700 hover:bg-[#eef3fb]'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={`Rate bundle ${score} out of 4`}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
            <div className="inline-flex flex-wrap items-center gap-1.5 rounded-lg border border-[#d5dded] bg-white px-2 py-2">
              {BUNDLE_RATING_REASONS.map((reason) => {
                const selected = (ratingReasonsByScenario[selectedScenario?.key] || []).includes(reason);
                return (
                  <button
                    key={`bundle-reason-${reason}`}
                    type="button"
                    onClick={() => toggleRatingReason(reason)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${
                      selected ? 'border-[#1A2A54] bg-[#1A2A54] text-white' : 'border-[#d5dded] bg-white text-slate-600'
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleRateBundle}
              disabled={savingRating || !selectedScenario || !selectedRating || !currentBundleSignature}
              className="opti-press inline-flex rounded-lg border border-[#1A2A54] bg-[#1A2A54] px-4 py-2 text-sm font-bold text-white hover:bg-[#152347] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit review
            </button>
            <button
              type="button"
              onClick={undoRemove}
              disabled={!selectedScenario?.key || !(removedItemsByScenario[selectedScenario?.key] || []).length}
              className="opti-press inline-flex rounded-lg border border-[#d5dded] bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-[#eef3fb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Undo remove
            </button>
            <button
              type="button"
              onClick={restoreCurrentTier}
              disabled={!selectedScenario}
              className="opti-press inline-flex rounded-lg border border-[#d5dded] bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-[#eef3fb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Regenerate Bundle
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!reviewSubmittedForCurrentBundle}
              className="opti-press inline-flex rounded-lg bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white hover:bg-[#E65C00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Go to checkout
            </button>
            <button
              type="button"
              onClick={() => {
                resetSmartFlow?.();
                resetToStepOne();
              }}
              className="opti-press inline-flex rounded-lg border border-[#d5dded] bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-[#eef3fb]"
            >
              Back to step 1
            </button>
          </div>
          {!!ratingMessage && (
            <p className="mt-2 text-xs font-semibold text-slate-600">{ratingMessage}</p>
          )}
          {!reviewSubmittedForCurrentBundle && (
            <p className="mt-1 text-xs font-semibold text-amber-700">Submit review first to enable checkout.</p>
          )}
        </div>
      )}
    </section>
  );
}
