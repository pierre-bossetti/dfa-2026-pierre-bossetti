interface ErrorMessageProps {
    title?: string;
    message: string;
}

export default function ErrorMessage({ title = "Problème de connexion", message }: ErrorMessageProps) {
    return (
        <div className="alert alert-danger text-center shadow-sm py-4 my-4 animate-fade-in">
            <div className="fs-3 mb-2">🔌</div>
            <h5 className="fw-bold mb-1">{title}</h5>
            <p className="mb-0 text-secondary">{message}</p>
        </div>
    );
}