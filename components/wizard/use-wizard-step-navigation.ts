'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useWizardStepNavigation(initialStep = 1) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const wizardTopRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = wizardTopRef.current;
      if (!target) return;

      const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: reducedMotion ? 'auto' : 'smooth' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  return { currentStep, goToStep, wizardTopRef };
}
