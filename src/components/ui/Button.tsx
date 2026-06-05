import { ButtonHTMLAttributes } from 'react'

function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: '0.75rem 1.25rem',
        borderRadius: 6,
        border: 'none',
        background: '#2563eb',
        color: '#fff',
        cursor: 'pointer',
      }}
    />
  )
}

export default Button
