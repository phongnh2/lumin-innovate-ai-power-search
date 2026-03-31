import { Component } from 'react';

import { LoggerReason } from '@/constants/logger';
import { clientLogger } from '@/lib/logger';

import Crash from './Crash';

interface IProps {
  children: React.ReactNode;
}

interface IState {
  hasError: boolean;
}
class ErrorBoundary extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  componentDidCatch(error: Error, _: any) {
    // You can use your own error logging service here
    clientLogger.error({
      attributes: {
        stack: error.stack as unknown as Record<string, unknown>
      },
      reason: LoggerReason.CRASH_ERROR,
      message: error.message
    });
  }
  render() {
    if (this.state.hasError) {
      return <Crash />;
    }
    // Return children components in case of no error
    return this.props.children;
  }
}

export default ErrorBoundary;
