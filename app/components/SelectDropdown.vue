<!--* app/components/SelectDropdown.vue -->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown } from '@lucide/vue';

export interface SelectOption {
  value: string;
  label: string;
}

let instanceCounter = 0;

const props = withDefaults(defineProps<{
  modelValue: string;
  options: SelectOption[];
  ariaLabel?: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  block?: boolean;
  buttonClass?: string;
}>(), {
  ariaLabel: '',
  id: '',
  size: 'md',
  align: 'left',
  block: false,
  buttonClass: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const instanceId = `select-dropdown-${++instanceCounter}`;
const listId = computed(() => `${props.id || instanceId}-listbox`);

const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const selectedLabel = computed(() => {
  return props.options.find((o) => o.value === props.modelValue)?.label ?? '';
});

const sizeClasses: Record<string, string> = {
  sm: 'px-2.5 py-1 text-[11px]',
  md: 'px-2.5 py-1.5 text-xs',
  lg: 'px-3.5 py-2.5 text-xs',
};

function toggle() {
  isOpen.value = !isOpen.value;
}

function close() {
  isOpen.value = false;
}

function select(value: string) {
  emit('update:modelValue', value);
  close();
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return;
  e.stopPropagation();
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const idx = props.options.findIndex((o) => o.value === props.modelValue);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    const next = Math.min(props.options.length - 1, Math.max(0, idx + step));
    if (props.options[next]) {
      emit('update:modelValue', props.options[next].value);
    }
  }
}

function onClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    close();
  }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));
</script>

<template>
  <div
    ref="rootRef"
    class="relative inline-block text-left"
    :class="block ? 'w-full' : ''"
  >
    <button
      :id="id || instanceId"
      type="button"
      :aria-label="ariaLabel || undefined"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="listId"
      @click="toggle"
      @keydown="onKeydown"
      class="flex items-center gap-1.5 font-medium bg-bg-secondary text-text-secondary border border-border rounded-lg cursor-pointer transition-colors focus:outline-none focus:border-primary hover:border-primary"
      :class="[sizeClasses[size] || '', block ? 'w-full justify-between' : '', buttonClass]"
    >
      <slot name="leading-icon" />
      <span class="truncate">{{ selectedLabel }}</span>
      <ChevronDown
        class="w-3.5 h-3.5 shrink-0 text-text-tertiary transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <ul
        v-if="isOpen"
        :id="listId"
        role="listbox"
        :aria-label="ariaLabel || undefined"
        class="absolute z-50 mt-1.5 min-w-full max-h-56 overflow-y-auto rounded-xl bg-surface border border-border shadow-lg py-1 scrollbar-thin"
        :class="[align === 'right' ? 'right-0' : 'left-0', block ? 'w-full' : '']"
      >
        <li
          v-for="o in options"
          :key="o.value"
          role="option"
          :aria-selected="o.value === modelValue"
          @click="select(o.value)"
          @keydown.enter.prevent="select(o.value)"
          @keydown.space.prevent="select(o.value)"
          class="px-3 py-1.5 text-xs whitespace-nowrap cursor-pointer transition-colors"
          :class="o.value === modelValue ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'"
        >
          {{ o.label }}
        </li>
      </ul>
    </Transition>
  </div>
</template>
