import React from "react";
import { ZapIcon } from "./icons/ZapIcon";
import { SparklesIcon } from "./icons/SparklesIcon";
import { CrownIcon } from "./icons/CrownIcon";
import { RocketIcon } from "./icons/RocketIcon";
import { CheckIcon } from "./icons/CheckIcon";
import { XIcon } from "./icons/XIcon";
import { InfoIcon } from "./icons/InfoIcon";
import { TrendingUpIcon } from "./icons/TrendingUpIcon";

interface OrchestrationScreenProps {
  isOpen: boolean;
  onClose: () => void;
  /** called with the chosen tierId (e.g., 'pro', 'premium', 'ultimate') */
  onUpgrade: (tierId: string) => void;
  isUpgraded: boolean;
}

interface Tier {
  id: "basic" | "pro" | "premium" | "ultimate";
  name: string;
  /** use a component type, not a ReactNode, to avoid #31 */
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  bgColor: string;
  price: string;
  models: number;
  description: string;
  descriptionTooltip: string;
  features: { text: string; tooltip: string }[];
  limitations: string[];
  requestsPerDay: string;
  responseTime: string;
  quality: string;
}

const TIERS: Tier[] = [
  {
    id: "basic",
    name: "Basic",
    Icon: ZapIcon,
    color: "text-muted",
    borderColor: "border-muted",
    bgColor: "bg-gray-500",
    price: "Free",
    models: 1,
    description: "Single AI model for basic code generation",
    descriptionTooltip: "Uses a single, general-purpose AI model to generate the application code. Good for simple projects and prototypes.",
    features: [
      { text: "Single AI model", tooltip: "Your prompt is processed by one AI, typically a fast, balanced model like Gemini Flash." },
      { text: "100 requests/day", tooltip: "You can generate up to 100 full application builds per day." },
      { text: "Basic code generation", tooltip: "Generates functional code but may require more manual refinement for complex logic." },
      { text: "Standard response time", tooltip: "Generation speed is subject to standard queue times." },
      { text: "Community support", tooltip: "Get help from the community through forums and Discord." },
    ],
    limitations: ["No model orchestration", "Limited quality checks", "Basic error handling"],
    requestsPerDay: "100",
    responseTime: "~5s",
    quality: "70%",
  },
  {
    id: "pro",
    name: "Pro",
    Icon: SparklesIcon,
    color: "text-cyan",
    borderColor: "border-cyan",
    bgColor: "bg-cyan",
    price: "$29/mo",
    models: 2,
    description: "Dual-model orchestration for improved quality",
    descriptionTooltip: "Two AI models generate code simultaneously. Our system compares their outputs and selects the higher-quality result for each component.",
    features: [
      { text: "2 AI models working together", tooltip: "We use a 'worker' model for code generation and a 'supervisor' model for review to ensure higher quality." },
      { text: "500 requests/day", tooltip: "Increased daily limit for more frequent iterations and builds." },
      { text: "Quality comparison & selection", tooltip: "An automated system scores code from both models based on clarity, efficiency, and correctness, then merges the best parts." },
      { text: "Fast response time", tooltip: "Your build requests are prioritized in the generation queue." },
      { text: "Priority support", tooltip: "Direct email support from our technical team." },
      { text: "Advanced error handling", tooltip: "The system can automatically retry failed components with a different model or strategy." },
    ],
    limitations: ["Limited to 2 models", "Standard quality scoring"],
    requestsPerDay: "500",
    responseTime: "~3s",
    quality: "85%",
  },
  {
    id: "premium",
    name: "Premium",
    Icon: CrownIcon,
    color: "text-warning",
    borderColor: "border-warning",
    bgColor: "bg-yellow-500",
    price: "$79/mo",
    models: 3,
    description: "Tri-model orchestration for exceptional results",
    descriptionTooltip: "Three different AI models compete to generate the best possible code. This diversity often leads to more creative and robust solutions.",
    features: [
      { text: "3 AI models competing", tooltip: "Leverages models from different providers (e.g., Google, OpenAI, Anthropic) to find the optimal solution for each task." },
      { text: "2000 requests/day", tooltip: "A high-volume limit suitable for agencies and power users." },
      { text: "Advanced quality scoring", tooltip: "Uses a more sophisticated scoring algorithm that includes performance and security checks." },
      { text: "Fastest response time", tooltip: "Your requests are placed at the top of the queue for near-instantaneous start." },
      { text: "Dedicated support", tooltip: "A dedicated account manager and direct support channel." },
      { text: "Custom model selection", tooltip: "Choose which specific models you want to include in the orchestration." },
      { text: "Detailed analytics", tooltip: "Get insights into which models performed best for different parts of your app." },
    ],
    limitations: ["Limited to 3 models"],
    requestsPerDay: "2000",
    responseTime: "~2s",
    quality: "92%",
  },
  {
    id: "ultimate",
    name: "Ultimate",
    Icon: RocketIcon,
    color: "text-error",
    borderColor: "border-error",
    bgColor: "bg-red-500",
    price: "$199/mo",
    models: 4,
    description: "Quad-model orchestration for unmatched quality",
    descriptionTooltip: "The pinnacle of AI-driven development. Four models compete, including specialized and fine-tuned models, for state-of-the-art code quality.",
    features: [
      { text: "4 AI models competing", tooltip: "Includes our most advanced, proprietary models in the mix for unparalleled performance." },
      { text: "Unlimited requests", tooltip: "No daily limits on your application builds." },
      { text: "Instant response time", tooltip: "Dedicated infrastructure ensures your builds start immediately." },
      { text: "24/7 premium support", tooltip: "Round-the-clock support with guaranteed response times." },
      { text: "API access", tooltip: "Integrate our generation engine into your own workflows and applications." },
      { text: "White-label options", tooltip: "Offer our powerful app generation capabilities under your own brand." },
    ],
    limitations: [],
    requestsPerDay: "Unlimited",
    responseTime: "~1s",
    quality: "98%",
  },
];

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[240px] p-2 text-xs bg-dark-secondary text-gray-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg border border-glass-border text-center">
    {text}
  </div>
);


const TierCard: React.FC<{
  tier: Tier;
  isCurrent: boolean;
  onUpgrade: (tierId: Tier["id"]) => void;
  isUpgraded: boolean;
}> = ({ tier, isCurrent, onUpgrade, isUpgraded }) => {
  const canUpgrade = !isCurrent && tier.price !== "Free";

  const handleSelect = () => {
    if (canUpgrade) onUpgrade(tier.id);
  };

  return (
    <div
      className={`bg-glass-bg rounded-2xl border-2 flex flex-col transition-all duration-300 ${
        isCurrent ? `${tier.borderColor} shadow-lg shadow-cyan/20` : "border-glass-border"
      }`}
    >
      <div className={`p-4 ${tier.bgColor}/20`}>
        <div className="flex items-center gap-4 bg-dark-secondary/50 p-3 rounded-lg">
          <div className={`h-14 w-14 rounded-lg flex items-center justify-center ${tier.bgColor}`}>
            <tier.Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-orbitron">{tier.name}</h3>
            <p className="text-lg font-semibold">{tier.price}</p>
          </div>
          {isCurrent && (
            <div className="ml-auto h-8 w-8 rounded-full bg-success flex items-center justify-center">
              <CheckIcon className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 flex-grow">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-secondary/70 ${tier.color}`}>
          <TrendingUpIcon className="h-4 w-4" />
          <span className="text-sm font-semibold">
            {tier.models} Model{tier.models > 1 && "s"}
          </span>
        </div>

        <div className="relative group">
          <p className="text-text-muted text-sm min-h-[40px]">{tier.description}</p>
          <Tooltip text={tier.descriptionTooltip} />
        </div>

        <div className="flex justify-between text-center py-2 border-y border-glass-border">
          <div>
            <p className="text-xs text-text-muted">Requests/Day</p>
            <p className="font-semibold">{tier.requestsPerDay}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Response Time</p>
            <p className="font-semibold">{tier.responseTime}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Quality</p>
            <p className="font-semibold">{tier.quality}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Features</h4>
          {tier.features.map((feature, i) => (
            <div key={i} className="relative group flex items-start gap-2 text-sm">
              <CheckIcon className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">{feature.text}</span>
              <Tooltip text={feature.tooltip} />
            </div>
          ))}
        </div>

        {tier.limitations.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold">Limitations</h4>
            {tier.limitations.map((limitation, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <XIcon className="h-4 w-4 text-error" />
                <span className="text-text-muted">{limitation}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 mt-auto">
        <button
          onClick={handleSelect}
          disabled={isCurrent || (isUpgraded && tier.id === "basic")}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-colors disabled:opacity-70 disabled:cursor-default ${
            isCurrent ? "bg-white/20" : `${tier.bgColor}/80 hover:${tier.bgColor} text-white`
          }`}
          aria-current={isCurrent ? "true" : undefined}
        >
          {isCurrent ? "Current Plan" : "Upgrade Plan"}
        </button>
      </div>
    </div>
  );
};

const OrchestrationScreen: React.FC<OrchestrationScreenProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  isUpgraded,
}) => {
  if (!isOpen) return null;

  const currentTierId: Tier["id"] = isUpgraded ? "pro" : "basic";

  const handleTierUpgrade = (tierId: Tier["id"]) => {
    onUpgrade(tierId);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="orchestration-title"
    >
      <div className="bg-dark-bg border border-glass-border rounded-2xl w-full max-w-7xl flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <XIcon className="h-8 w-8" />
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
          <header className="text-center mb-8">
            <SparklesIcon className="h-10 w-10 text-cyan mx-auto mb-4" />
            <h1 id="orchestration-title" className="text-3xl md:text-4xl font-bold font-orbitron">
              Multi-Model AI Orchestration
            </h1>
            <p className="text-text-muted mt-2 max-w-2xl mx-auto">
              Harness the power of multiple AI models working together to produce outstanding quality and consistency.
            </p>
          </header>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-glass-bg border border-glass-border mb-8 max-w-3xl mx-auto">
            <InfoIcon className="h-5 w-5 text-cyan flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Our orchestration system runs your request through multiple AI models simultaneously, scores each result,
              and delivers the best output. Higher tiers use more models for better results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {TIERS.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                isCurrent={currentTierId === tier.id}
                onUpgrade={handleTierUpgrade}
                isUpgraded={isUpgraded}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrchestrationScreen;
