import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/app-icon";
import { useEffect } from "react";

import { useAnimatedVisibility } from "@/hooks/useAnimatedVisibility";
import { cn } from "@/lib/utils";

import { ModalStep } from "../../constants";
import {
  useCurrentStepSelector,
  useModalVisibilitySelector,
  useSearchActionsSelector,
  useSetCurrentStepSelector,
} from "../../store";
import { ContextQuestions } from "../ContextQuestions";
import LoadingModal from "../LoadingModal";
import PromptForm from "../PromptForm";
import TemplateResultsModal from "../TemplateResultsModal/TemplateResultsModal";

export interface ISmartFindingModalProps {
  prompts: string[];
  placeholders: string[];
  onClose: () => void;
}

const OVERLAY_CLS =
  "fixed inset-0 w-screen h-screen bg-black/40 flex items-center justify-center z-[9999] p-4 min-[480px]:p-6 min-[640px]:p-8 overflow-hidden";

const MODAL_BASE_CLS = cn(
  "relative h-auto min-w-0",
  "rounded-[var(--kiwi-border-radius-lg)] bg-[var(--kiwi-colors-surface-surface-bright)]",
  "shadow-[var(--kiwi-shadow-modal)] z-[10000]",
  "overflow-x-hidden overflow-y-auto",
  "transition-[width,height] duration-300 ease-in-out",
  "w-[1040px] min-h-[580px]",
  "p-5",
);

const MODAL_NARROW_CLS = "w-[660px] min-h-0 overflow-visible";

export const SmartFindingModal = ({
  prompts,
  placeholders,
  onClose,
}: ISmartFindingModalProps) => {
  const isOpen = useModalVisibilitySelector();
  const currentStep = useCurrentStepSelector();
  const setCurrentStep = useSetCurrentStepSelector();
  const { submitSearch, submitFollowUp } = useSearchActionsSelector();

  const { shouldRender, animState } = useAnimatedVisibility(isOpen, 280);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleSubmit = async (finalText: string) => {
    await submitSearch(finalText);
  };

  const handleFollowUpClick = async (chipText: string) => {
    await submitFollowUp(chipText);
  };

  const handleEdit = () => setCurrentStep(ModalStep.FORM);

  const isNarrow =
    currentStep === ModalStep.FORM || currentStep === ModalStep.CONTEXT;

  const overlayAnimCls =
    animState === "closing"
      ? "animate-[modalOverlayOut_200ms_ease-in_forwards]"
      : "animate-[modalOverlayIn_200ms_ease-out_forwards]";

  const modalAnimCls =
    animState === "closing"
      ? "animate-[modalOut_200ms_ease-in_forwards]"
      : "animate-[modalIn_280ms_ease-out_forwards]";

  const renderContent = () => {
    switch (currentStep) {
      case ModalStep.FORM:
        return (
          <PromptForm
            prompts={prompts}
            placeholders={placeholders}
            onSubmit={handleSubmit}
          />
        );
      case ModalStep.CONTEXT:
        return <ContextQuestions />;
      case ModalStep.RESULTS:
        return (
          <TemplateResultsModal
            handleEdit={handleEdit}
            onFollowUpClick={handleFollowUpClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(OVERLAY_CLS, overlayAnimCls)} onClick={onClose}>
      <div
        className={cn(
          MODAL_BASE_CLS,
          isNarrow && MODAL_NARROW_CLS,
          modalAnimCls,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {currentStep === ModalStep.LOADING ? (
          <>
            <LoadingModal />
            <Button
              variant="ghost"
              size="icon"
              startIcon={
                <AppIcon
                  type="x-md"
                  size="sm"
                  color="var(--kiwi-colors-surface-on-surface-variant)"
                />
              }
              className="absolute top-5 right-5 z-20 rounded-full"
              onClick={onClose}
              aria-label="Close"
            />
          </>
        ) : (
          <div className="relative min-w-0 w-full">
            <Button
              variant="ghost"
              size="icon"
              startIcon={
                <AppIcon
                  type="x-md"
                  size="sm"
                  color="var(--kiwi-colors-surface-on-surface-variant)"
                />
              }
              className="absolute top-0 right-0 z-10 rounded-full"
              onClick={onClose}
              aria-label="Close"
            />
            <div
              key={currentStep}
              className="animate-[stepFadeIn_200ms_ease-out_forwards]"
            >
              {renderContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartFindingModal;
