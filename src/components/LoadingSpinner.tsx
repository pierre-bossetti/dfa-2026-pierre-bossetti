interface LoadingSpinnerProps {
    message?: string; // Message optionnel à afficher sous le spinner
}

export default function LoadingSpinner({ message = "Chargement en cours..." }: LoadingSpinnerProps) {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Chargement...</span>
            </div>
            {message && <p className="text-muted mt-3 fw-semibold">{message}</p>}
        </div>
    );
}