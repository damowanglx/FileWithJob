import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      copied: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleCopyError = async () => {
    const { error, errorInfo } = this.state;
    const errorText = '错误信息: ' + (error?.message || '未知错误') + '\n' +
      '错误堆栈:\n' + (error?.stack || '无堆栈信息') + '\n' +
      '组件堆栈:\n' + (errorInfo?.componentStack || '无组件堆栈信息');

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = errorText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.setState({ copied: true });
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className='h-screen flex items-center justify-center'
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          <div className='text-center p-8 max-w-lg'>
            <div className='text-7xl mb-6'>💥</div>
            <h1 className='text-3xl font-bold mb-3'>应用出现错误</h1>
            <p className='text-base mb-6' style={{ color: 'var(--text-secondary)' }}>
              很抱歉，应用遇到了一个意外错误。您可以尝试重新加载页面或复制错误信息反馈给我们。
            </p>
            
            <div 
              className='mb-6 p-4 rounded-lg text-left text-sm'
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)' 
              }}
            >
              <div className='font-medium mb-2' style={{ color: 'var(--text-primary)' }}>
                错误信息:
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {this.state.error?.message || '发生了未知错误'}
              </div>
              
              {import.meta.env.DEV && this.state.errorInfo && (
                <details className='mt-3'>
                  <summary 
                    className='cursor-pointer text-sm font-medium'
                    style={{ color: 'var(--accent-color)' }}
                  >
                    查看详细堆栈
                  </summary>
                  <pre 
                    className='mt-2 text-xs p-3 rounded overflow-auto max-h-48 whitespace-pre-wrap'
                    style={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className='flex gap-3 justify-center'>
              <button
                onClick={this.handleReload}
                className='px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 hover:shadow-lg'
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                🔄 重新加载
              </button>
              <button
                onClick={this.handleCopyError}
                className='px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg'
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {this.state.copied ? '✅ 已复制' : '📋 复制错误信息'}
              </button>
              <button
                onClick={this.handleReset}
                className='px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90'
                style={{ 
                  color: 'var(--text-secondary)',
                }}
              >
                🔙 返回重试
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}