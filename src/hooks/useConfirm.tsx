import { useState, useCallback } from 'react'
import ConfirmDialog, { ConfirmOptions } from '../components/ConfirmDialog'

export function useConfirm() {
  const [state, setState] = useState<ConfirmOptions & { open: boolean; onConfirm: () => void }>({
    open: false,
    message: '',
    onConfirm: () => {},
  })

  const close = useCallback(() => {
    setState((current) => ({ ...current, open: false }))
  }, [])

  const confirm = useCallback((options: ConfirmOptions & { onConfirm: () => Promise<void> | void }) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        message: options.message,
        title: options.title ?? 'Confirmation',
        confirmText: options.confirmText ?? 'Confirmer',
        cancelText: options.cancelText ?? 'Annuler',
        variant: options.variant ?? 'info',
        onConfirm: async () => {
          await options.onConfirm()
          close()
          resolve(true)
        },
      })
    })
  }, [close])

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      variant={state.variant}
      onConfirm={state.onConfirm}
      onCancel={close}
    />
  )

  return { confirm, dialog, close }
}
