import React, { Suspense, lazy } from 'react';

export type LottieAnimationData = Record<string, unknown>;

const Lottie = lazy(() => import('lottie-react'));

interface LottiePlayerProps {
  animationData: LottieAnimationData;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({
  animationData,
  className = '',
  loop = true,
  autoplay = true
}) => {
  return (
    <Suspense fallback={<div className="lottie-player__fallback" aria-hidden="true" />}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        className={className}
      />
    </Suspense>
  );
};
