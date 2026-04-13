import type { Toast as ToastType } from '../../hooks/useToast'

const bgColors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
}

export function Toast({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void }) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white shadow-lg ${bgColors[toast.type]} animate-slide-in`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <span>{toast.message}</span>
        <button onClick={onDismiss} className="ml-2 font-bold hover:opacity-70">
          &times;
        </button>
      </div>
    </div>
  )
}
