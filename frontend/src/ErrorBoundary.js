import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // You could also log to an external service here
    // console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:20}}>
          <h2>Something went wrong</h2>
          <pre style={{whiteSpace:'pre-wrap',background:'#fee',padding:12,borderRadius:6}}>
            {String(this.state.error && this.state.error.toString())}
            {this.state.info ? '\n' + (this.state.info.componentStack || '') : ''}
          </pre>
          <p>
            Open your browser console for more details. If this happened after a change, try restarting the dev server.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
