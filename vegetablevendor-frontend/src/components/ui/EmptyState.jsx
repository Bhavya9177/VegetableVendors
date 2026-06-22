import { Link } from 'react-router-dom'

export default function EmptyState({ icon = '🛒', message = 'Nothing here yet', subMessage, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-heading font-semibold text-lg text-text mb-2">{message}</h3>
      {subMessage && <p className="text-sm text-slate-500 mb-6 max-w-xs">{subMessage}</p>}
      {action && (
        <Link
          to={action.to}
          className="btn-primary"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
