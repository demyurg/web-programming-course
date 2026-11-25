type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <p>{message}</p>
      <div className="error-banner-actions">
        {onRetry && (
          <button type="button" className="error-button" onClick={onRetry}>
            Повторить
          </button>
        )}
        {onDismiss && (
          <button type="button" className="error-button" onClick={onDismiss}>
            Скрыть
          </button>
        )}
      </div>
    </div>
  );
}
