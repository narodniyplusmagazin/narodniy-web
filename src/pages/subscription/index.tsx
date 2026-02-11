import React from 'react';

import './style.scss';
import { useSubscriptionScreen } from './hooks/useSubscriptionScreen';
import { LoadingState } from './components/LoadingState/LoadingState';
import { ErrorState } from './components/ErrorState/ErrorState';
import { SubscriptionHeader } from './components/SubscriptionHeader/SubscriptionHeader';
import { ActiveSubscriptionCard } from './components/ActiveSubscriptionCard/ActiveSubscriptionCard';
import { SubscriptionPlanCard } from './components/SubscriptionPlanCard/SubscriptionPlanCard';
import { DisclaimerBox } from './components/DisclaimerBox/DisclaimerBox';
import { FeaturesList } from './components/FeaturesList/FeaturesList';
import { HowItWorksSection } from './components/HowItWorksSection/HowItWorksSection';
import { SubscriptionActions } from './components/SubscriptionActions/SubscriptionActions';
import { SubscriptionDetails } from './components/SubscriptionDetails/SubscriptionDetails';

export const SubscriptionScreen: React.FC = () => {
  const {
    loading,
    subscribing,
    plan,
    activeSubscription,
    userData,
    loadSubscriptionPlan,
    // handleSubscribe,
    handleTestSubscription,
  } = useSubscriptionScreen();

  if (loading) return <LoadingState />;

  if (!plan) return <ErrorState onRetry={loadSubscriptionPlan} />;

  return (
    <div className="subscription-screen">
      <main className="scroll-content">
        <SubscriptionHeader
          planName={plan.name}
          description={plan.description}
        />

        {activeSubscription && (
          <ActiveSubscriptionCard subscription={activeSubscription} />
        )}

        <SubscriptionPlanCard plan={plan}>
          <SubscriptionDetails plan={plan} />
          <FeaturesList features={plan.features} />
          <SubscriptionActions
            subscriptionPlanId={plan.id}
            isActive={!!plan && !activeSubscription}
            subscribing={subscribing}
            // onSubscribe={handleSubscribe}
            onTestSubscription={handleTestSubscription}
            hasActiveSubscription={!!activeSubscription}
            userId={userData?.id}
            userEmail={userData?.email}
            userPhone={userData?.phone}
            userData={userData}
            activeSubscription={activeSubscription}
          />
        </SubscriptionPlanCard>

        <HowItWorksSection durationDays={plan.durationDays} />
        <DisclaimerBox />
        {/* <CreationDate createdAt={activeSubscription.createdAt} /> */}
      </main>
    </div>
  );
};
