import React from "react"

interface Props {
	children: React.ReactNode
}

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error('Ошибка:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className='error-boundary-container'>
					<h2>Что-то пошло не так &#128546;</h2>
					<p>{this.state.error?.message}</p>
					<button
						className='error-boundary-btn'
						onClick={() => this.setState({ hasError: false, error: null })}
					>
						Попробовать снова
					</button>
				</div>
			)
		}

		return this.props.children
	}
}
