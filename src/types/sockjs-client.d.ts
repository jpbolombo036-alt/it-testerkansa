declare module 'sockjs-client' {
  interface SockJSOptions {
    transports?: string[]
    sessionId?: (() => string) | number
    server?: string
    reconnectDelay?: number
  }

  export default class SockJS {
    constructor(url: string, _reserved?: unknown, options?: SockJSOptions)
    close(code?: number, reason?: string): void
    send(data?: string): void
    onopen: ((event: Event) => void) | null
    onclose: ((event: CloseEvent) => void) | null
    onmessage: ((event: MessageEvent) => void) | null
    onerror: ((event: Event) => void) | null
    readonly readyState: number
    readonly CONNECTING: number
    readonly OPEN: number
    readonly CLOSING: number
    readonly CLOSED: number
  }
}
