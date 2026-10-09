import { ref, type Ref } from "vue";

export type UseInputReturn = [Ref<string>, (event: Event) => void, () => void];

/**
 * Hook sederhana untuk two-way binding input form.
 * Mengembalikan [value, onChange, reset].
 */
export function useInput(initialValue: string): UseInputReturn {
  const value = ref(initialValue);

  function onChange(event: Event) {
    value.value = (event.target as HTMLInputElement).value;
  }

  function reset() {
    value.value = initialValue;
  }

  return [value, onChange, reset];
}
