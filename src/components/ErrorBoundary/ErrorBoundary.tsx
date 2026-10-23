import React from "react"
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
	children: React.ReactNode
}

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
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
				<div className={styles.errorBoundaryContainer}>
					<h2>Что-то пошло не так &#128546;</h2>
					<p>{this.state.error?.message}</p>
					<button
						className={styles.errorBoundaryBtn}
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
