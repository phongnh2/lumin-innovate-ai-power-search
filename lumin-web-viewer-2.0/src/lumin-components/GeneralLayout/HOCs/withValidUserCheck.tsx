import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { HIGHLIGHT_TOOL_VALUES } from '@new-ui/components/LuminToolbar/tools-components/HighlightTool/constants';
import Modal from '@new-ui/general-components/Modal';

import ToolButtonPopper from 'luminComponents/ToolButtonPopper';

import { useDebounceNavigationPopover } from 'hooks/useDebounceNavigationPopover';

import useToolChecker from '../hooks/useToolChecker';

export type ToolPopperRenderParams = {
  toggleCheckPopper: () => void;
  shouldShowPremiumIcon: boolean;
  isToolAvailable: boolean;
  isOpen: boolean;
};

const withValidUserCheck =
  (
    Component: React.ComponentType<{
      isToolAvailable: boolean;
      shouldShowPremiumIcon: boolean;
      toggleCheckPopper: (options?: { toolName?: string }) => void;
      toolName: string;
      activeToolName?: string;
      icon?: string;
    }>,
    toolName: string,
    eventName?: string
  ) =>
  (props: Record<string, unknown>) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHighlightTool, setSelectedHighlightTool] = useState<string>(null);
    const [customOffsetPopper, setCustomOffsetPopper] = useState<{ x: number; y: number }>(null);
    const { isToolAvailable, shouldShowPremiumIcon, validateType } = useToolChecker(toolName);

    const closePopper = () => {
      setIsOpen(false);
    };

    const { popperPosition } = useDebounceNavigationPopover({
      defaultPopperPosition: 'bottom',
      closePopperCallback: closePopper,
    });

    const toggleCheckHighlightTools = (tool: string) => {
      setSelectedHighlightTool(tool);
      setCustomOffsetPopper(tool === HIGHLIGHT_TOOL_VALUES.FREEHAND_HIGHLIGHT.value ? { x: 40, y: 8 } : null);
    };

    const toggleCheckPopper = (options?: { toolName?: string }) => {
      if (!options?.toolName) {
        setCustomOffsetPopper(null);
        setIsOpen((prev) => !prev);
        return;
      }
      toggleCheckHighlightTools(options.toolName);
      setIsOpen(options.toolName !== selectedHighlightTool || !isOpen);
    };

    return (
      <ToolButtonPopper
        validateType={validateType}
        openPopper={isOpen}
        closePopper={closePopper}
        toolName={toolName}
        eventName={eventName}
        placement={popperPosition}
        customOffset={customOffsetPopper}
      >
        <Component
          {...props}
          isToolAvailable={isToolAvailable}
          shouldShowPremiumIcon={shouldShowPremiumIcon}
          toggleCheckPopper={toggleCheckPopper}
          toolName={toolName}
        />
      </ToolButtonPopper>
    );
  };

interface AvailabilityToolCheckProviderProps {
  render: (props: {
    isToolAvailable?: boolean;
    shouldShowPremiumIcon?: boolean;
    toggleCheckPopper: () => void;
    isOpen?: boolean;
  }) => React.ReactNode;
  toolName?: string;
  featureName?: string;
  useModal?: boolean;
  eventName?: string;
  popperPlacement?: string;
  popperContainerWidth?: number;
  onClose?: () => void;
}

const AvailabilityToolCheckProvider = ({
  render,
  toolName,
  featureName,
  useModal,
  eventName,
  popperPlacement,
  popperContainerWidth,
  onClose,
}: AvailabilityToolCheckProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isToolAvailable, shouldShowPremiumIcon, validateType } = useToolChecker(toolName, featureName);

  const toggleCheckPopper = () => {
    setIsOpen((prev) => !prev);
  };

  const closePopper = () => {
    setIsOpen(false);
    onClose();
  };

  if (useModal) {
    return (
      <>
        {render({
          isToolAvailable,
          shouldShowPremiumIcon,
          toggleCheckPopper,
          isOpen,
        })}
        <Modal open={isOpen} onClose={closePopper}>
          <ToolButtonPopper
            validateType={validateType}
            renderContentOnly
            openPopper
            toolName={toolName}
            eventName={eventName}
          />
        </Modal>
      </>
    );
  }

  return (
    <ToolButtonPopper
      validateType={validateType}
      openPopper={isOpen}
      closePopper={closePopper}
      toolName={toolName}
      eventName={eventName}
      placement={popperPlacement}
      popperContainerWidth={popperContainerWidth}
    >
      {render({ isToolAvailable, shouldShowPremiumIcon, toggleCheckPopper, isOpen })}
    </ToolButtonPopper>
  );
};

AvailabilityToolCheckProvider.defaultProps = {
  toolName: '',
  useModal: false,
  eventName: '',
  popperPlacement: 'bottom',
  popperContainerWidth: undefined,
  onClose: () => {},
};

AvailabilityToolCheckProvider.propTypes = {
  render: PropTypes.func.isRequired,
  toolName: PropTypes.string,
  useModal: PropTypes.bool,
  eventName: PropTypes.string,
  popperPlacement: PropTypes.string,
  popperContainerWidth: PropTypes.number,
  onClose: PropTypes.func,
};

export { AvailabilityToolCheckProvider };

export default withValidUserCheck;
