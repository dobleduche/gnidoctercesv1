
import React from "react";
import { ZapIcon } from "./icons/ZapIcon";
import { SparklesIcon } from "./icons/SparklesIcon";
import { CrownIcon } from "./icons/CrownIcon";
import { RocketIcon } from "./icons/RocketIcon";
import { CheckIcon } from "./icons/CheckIcon";
import { XIcon } from "./icons/XIcon";
import { InfoIcon } from "./icons/InfoIcon";
import { TrendingUpIcon } from "./icons/TrendingUpIcon";
import { FeatureFlags, TierId } from "../types";
// FIX: Removed unused stripe-js import as the checkout flow is handled by redirecting to the URL provided by the backend.
import { safeFetch } from "../lib/network";
import { RefinerAgentIcon } from "./icons/agents/RefinerAgentIcon";

// FIX: Removed unused stripePromise as it's no longer needed for the simplified redirect flow.


interface OrchestrationScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tierId: TierId) => void;
  currentTierId: TierId;
  flags: FeatureFlags;
}

interface Tier {
  id: TierId;
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  bgColor: string;
  price: string;
  priceId?: string; // Stripe Price ID
  models: number;
  description: string;
  descriptionTooltip: string;
  features: { text: string; tooltip: string }[];
  limitations: string[];
}

const mediaLevelText: Record<number, string> = {
    0: 'No Media Generation',
    1: 'Basic Media Generation',
    2: 'Advanced Media Generation',
    3: 'Professional Media Generation'
};

const mediaLevelTooltip: Record<number, string> = {
    0: 'Media assets like images must be provided manually.',
    1: 'AI-powered generation of logos, icons, and simple placeholders.',
    2: 'Generate complex illustrations and UI mockups directly from prompts.',
    3: 'Generate photorealistic images and marketing assets.',
};

const complianceText: Record<string, string> = {
    prep: 'Compliance Prep',
    full: 'Full Compliance Support',
};

const complianceTooltip: Record<string, string> = {
    prep: 'Tools and boilerplate generation for GDPR/HIPAA compliance.',
    full: 'Full compliance audit and generation of required legal/technical documents.',
};

const buildFeatures = (tierData: { models: number, media: number, lifetime: boolean, compliance: boolean | string, runway: boolean }): { features: { text: string, tooltip: string }[], limitations: string[] } => {
    const features: { text: string, tooltip: string }[] = [];
    const limitations: string[] = [];

    if (tierData.lifetime) {
        features.push({ text: "Lifetime Access", tooltip: "Pay once and get access to all features of this tier forever." });
    }

    features.push({ text: `${tierData.models}+ AI Models`, tooltip: `Leverages ${tierData.models} AI models competing to produce higher quality, more robust code.` });

    const mediaText = mediaLevelText[tierData.media];
    if (mediaText) {
        features.push({ text: mediaText, tooltip: mediaLevelTooltip[tierData.media] });
    }

    if (tierData.compliance) {
        const complianceKey = String(tierData.compliance);
        features.push({ text: complianceText[complianceKey], tooltip: complianceTooltip[complianceKey] });
    } else {
        limitations.push("No Advanced Compliance Features");
    }
    
    if (tierData.runway) {
        features.push({ text: "Runway Program Access", tooltip: "Access to our startup program, including credits and mentorship." });
    } else {
         limitations.push("No Runway Program Access");
    }

    return { features, limitations };
};

const TIER_DATA = {
  "spark":     { "price": 29,  "models": 1, "media": 0, "lifetime": false, "compliance": false, "runway": false },
  "forge":     { "price": 79,  "models": 3, "media": 1, "lifetime": false, "compliance": false, "runway": false },
  "foundry":   { "price": 249, "models": 6, "media": 2, "lifetime": false, "compliance": "prep", "runway": true },
  "obsidian":  { "price": 1000,"models": 6, "media": 3, "lifetime": true,  "compliance": false, "runway": true },
  "apex":      { "price": 995, "models": 8, "media": 3, "lifetime": false, "compliance": "full", "runway": true }
};

export const TIERS: Tier[] = [
  {
    id: "spark",
    name: "Spark",
    Icon: ZapIcon,
    color: "text-muted",
    borderColor: "border-muted",
    bgColor: "bg-gray-500",
    price: `$${TIER_DATA.spark.price}/mo`,
    priceId: `price_spark_${TIER_DATA.spark.price}_monthly`,
    models: TIER_DATA.spark.models,
    description: "Single model for standard projects.",
    descriptionTooltip: "Uses one powerful AI model for code generation, ideal for startups and individual developers.",
    ...buildFeatures(TIER_DATA.spark),
  },
  {
    id: "forge",
    name: "Forge",
    Icon: SparklesIcon,
    color: "text-cyan",
    borderColor: "border-cyan",
    bgColor: "bg-cyan",
    price: `$${TIER_DATA.forge.price}/mo`,
    priceId: `price_forge_${TIER_DATA.forge.price}_monthly`,
    models: TIER_DATA.forge.models,
    description: "Multi-model orchestration for professional quality.",
    descriptionTooltip: "Leverages multiple AI models competing to produce higher quality, more robust code for professional applications.",
    ...buildFeatures(TIER_DATA.forge),
  },
  {
    id: "foundry",
    name: "Foundry",
    Icon: CrownIcon,
    color: "text-warning",
    borderColor: "border-warning",
    bgColor: "bg-yellow-500",
    price: `$${TIER_DATA.foundry.price}/mo`,
    priceId: `price_foundry_${TIER_DATA.foundry.price}_monthly`,
    models: TIER_DATA.foundry.models,
    description: "Advanced orchestration for scaling businesses.",
    descriptionTooltip: "A team of specialized AI agents build complex, scalable applications.",
    ...buildFeatures(TIER_DATA.foundry),
  },
    {
    id: "obsidian",
    name: "Obsidian",
    Icon: RefinerAgentIcon,
    color: "text-magenta",
    borderColor: "border-magenta",
    bgColor: "bg-magenta",
    price: `$${TIER_DATA.obsidian.price} one-time`,
    priceId: `price_obsidian_${TIER_DATA.obsidian.price}_lifetime`,
    models: TIER_DATA.obsidian.models,
    description: "Lifetime access for dedicated builders.",
    descriptionTooltip: "A one-time purchase for lifetime access to Foundry tier features. Perfect for serial entrepreneurs and agencies.",
    ...buildFeatures(TIER_DATA.obsidian),
  },
  {
    id: "apex",
    name: "Apex",
    Icon: RocketIcon,
    color: "text-error",
    borderColor: "border-error",
    bgColor: "bg-red-500",
    price: `$${TIER_DATA.apex.price}/mo`,
    priceId: `price_apex_${TIER_DATA.apex.price}_monthly`,
    models: TIER_DATA.apex.models,
    description: "Peak performance for enterprise needs.",
    descriptionTooltip: "The ultimate tier for enterprise-grade applications, featuring our most advanced models and full compliance support.",
    ...buildFeatures(TIER_DATA.apex),
  },
];

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div 
    role="tooltip"
    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[240px] p-2 text-xs bg-dark-secondary text-gray-200 rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg border border-glass-border text-center"
  >
    {text}
  </div>
);


const TierCard: React.FC<{
  tier: Tier;
  isCurrent: boolean;
  onUpgrade: (tierId: TierId) => void;
  flags: FeatureFlags;
}> = ({ tier, isCurrent, onUpgrade, flags }) => {
  const isUpgradeAction = !isCurrent && !tier.price.includes("Free");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSelect = async () => {
    if (isUpgradeAction) {
        setIsLoading(true);
        try {
            // FIX: Updated to call the correct backend endpoint and handle the redirect URL.
            // The backend provides a full checkout URL, which simplifies the frontend logic
            // and resolves the original 'redirectToCheckout' type error by avoiding it.
            const { url } = await safeFetch<{ url: string }>('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId: tier.priceId, tierId: tier.id })
            });
            
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("Checkout URL was not returned from the server.");
            }
        } catch (error) {
            console.error("Stripe checkout error:", error);
            alert("Could not initiate checkout. Please try again.");
            setIsLoading(false); // Only reset loading state on error, as success navigates away.
        }
    }
  };

  const isButtonDisabled = isCurrent || isLoading || (isUpgradeAction && !flags.ff_payments);

  return (
    <div
      className={`bg-glass-bg rounded-2xl border-2 flex flex-col transition-all duration-300 ${
        isCurrent ? `${tier.borderColor} shadow-lg shadow-cyan/20` : "border-glass-border"
      }`}
      aria-current={isCurrent ? "true" : "false"}
    >
      <div className={`p-4 ${tier.bgColor}/20`}>
        <div className="flex items-center gap-4 bg-dark-secondary/50 p-3 rounded-lg">
          <div className={`h-14 w-14 rounded-lg flex items-center justify-center ${tier.bgColor}`}>
            <tier.Icon className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-orbitron">{tier.name}</h3>
            <p className="text-lg font-semibold">{tier.price}</p>
          </div>
          {isCurrent && (
            <div className="ml-auto h-8 w-8 rounded-full bg-success flex items-center justify-center" aria-label="Current Plan">
              <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 flex-grow">
        <div className="relative group" tabIndex={0}>
          <p className="text-gray-400 text-sm min-h-[40px]">{tier.description}</p>
          <Tooltip text={tier.descriptionTooltip} />
        </div>
        <ul className="space-y-2">
          {tier.features.map((feature, i) => (
            <li key={i} className="relative group flex items-start gap-2 text-sm" tabIndex={0}>
              <CheckIcon className="h-4 w-4 text-success flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-gray-300">{feature.text}</span>
              <Tooltip text={feature.tooltip} />
            </li>
          ))}
           {tier.limitations.map((limitation, i) => (
            <li key={i} className="relative group flex items-start gap-2 text-sm" tabIndex={0}>
              <XIcon className="h-4 w-4 text-error flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-gray-400">{limitation}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 mt-auto">
        <button
          onClick={handleSelect}
          disabled={isButtonDisabled}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isCurrent ? "bg-white/20" : isUpgradeAction ? `${tier.bgColor}/80 hover:${tier.bgColor} text-white` : "bg-white/20"
          }`}
        >
          {isCurrent ? "Current Plan" : isLoading ? "Redirecting..." : "Upgrade Plan"}
        </button>
      </div>
    </div>
  );
};

const OrchestrationScreen: React.FC<OrchestrationScreenProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  currentTierId,
  flags
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="orchestration-title"
    >
      <div className="bg-dark-bg border border-glass-border rounded-2xl w-full max-w-7xl flex flex-col relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><XIcon className="h-8 w-8" /></button>
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
          <header className="text-center mb-8">
            <h1 id="orchestration-title" className="text-3xl md:text-4xl font-bold font-orbitron">Choose How You Build</h1>
            <p className="text-text-muted mt-2 max-w-3xl mx-auto">All paid plans generate real deploy-ready code. Higher tiers unlock more AI-models, media generation, compliance, and lifetime access.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {TIERS.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                isCurrent={currentTierId === tier.id}
                onUpgrade={onUpgrade}
                flags={flags}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrchestrationScreen;
