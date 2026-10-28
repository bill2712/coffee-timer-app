/**
 * Optional browser notifications. Permission is requested only when the user
 * turns the setting on. Uses the service worker when available (required on
 * Android Chrome), otherwise the Notification constructor.
 */

export type NotifyState = 'unsupported' | 'default' | 'granted' | 'denied';

export function notifyState(): NotifyState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as NotifyState;
}

export async function requestNotify(): Promise<NotifyState> {
  if (notifyState() === 'unsupported') return 'unsupported';
  try {
    return (await Notification.requestPermission()) as NotifyState;
  } catch {
    return notifyState();
  }
}

export async function showNotification(title: string, body: string, icon = '/favicon.svg'): Promise<void> {
  if (notifyState() !== 'granted') return;
  const options: NotificationOptions = { body, icon, tag: 'brew-focus', silent: true };
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) {
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    /* fall through */
  }
  try {
    new Notification(title, options);
  } catch {
    /* constructor not allowed on this platform */
  }
}
