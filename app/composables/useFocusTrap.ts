import { ref, onMounted, onUnmounted, nextTick } from 'vue';

export function useFocusTrap(containerRef: ReturnType<typeof ref<HTMLElement | null>>) {
  const isActive = ref(false);
  let previousActiveElement: HTMLElement | null = null;

  const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  function getFocusableElements(): HTMLElement[] {
    if (!containerRef.value) return [];
    return Array.from(containerRef.value.querySelectorAll(FOCUSABLE_SELECTORS));
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isActive.value || e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  async function activate() {
    previousActiveElement = document.activeElement as HTMLElement;
    isActive.value = true;
    await nextTick();
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  function deactivate() {
    isActive.value = false;
    if (previousActiveElement) {
      previousActiveElement.focus();
      previousActiveElement = null;
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  return {
    isActive,
    activate,
    deactivate,
  };
}
