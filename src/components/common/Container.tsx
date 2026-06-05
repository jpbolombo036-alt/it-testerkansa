import { PropsWithChildren } from 'react'

function Container({ children }: PropsWithChildren<{}>) {
  return <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
}

export default Container
