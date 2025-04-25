// src/components/ProjectGallery/ProjectGalleryErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface ProjectGalleryErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ProjectGalleryErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary specifically for the ProjectGallery component
 * Catches and handles errors that occur during rendering of gallery images
 */
class ProjectGalleryErrorBoundary extends Component<
  ProjectGalleryErrorBoundaryProps,
  ProjectGalleryErrorBoundaryState
> {
  constructor(props: ProjectGalleryErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  /**
   * Update state when an error occurs during rendering
   */
  static getDerivedStateFromError(
    error: Error,
  ): ProjectGalleryErrorBoundaryState {
    return { hasError: true, error }
  }

  /**
   * Log error details when caught
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ProjectGallery error:', error)
    console.error('Component stack:', errorInfo.componentStack)

    // You could send this to an error reporting service
    // reportError(error, errorInfo);
  }

  /**
   * Reset error state to try again
   */
  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): ReactNode {
    // If there's an error, show the fallback UI
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="gallery-error-container p-4 text-center border border-red-200 rounded-lg my-6 bg-red-50">
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Gallery Error
            </h3>
            <p className="text-gray-700 mb-4">
              There was an error loading the project gallery.
              {this.state.error && (
                <span className="block text-sm text-red-500 mt-1">
                  {this.state.error.message}
                </span>
              )}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )
      )
    }

    // Otherwise, render the children normally
    return this.props.children
  }
}

export default ProjectGalleryErrorBoundary
