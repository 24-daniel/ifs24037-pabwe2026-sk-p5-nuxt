import { ref, type Ref } from "vue";

export type InputChange<T> = (eventOrValue: Event | T) => void;

/**
 * Composable input form bertipe.
 *   const [email, onEmailChange, resetEmail] = useInput("")
 * - `email` adalah ref yang bisa dipakai pada v-model
 * - `onChange` menerima Event (input) ataupun nilai langsung
 */
export function useInput<T = string>(defaultValue: T = "" as T): [Ref<T>, InputChange<T>, () => void] {
  const value = ref(defaultValue) as Ref<T>;
  const onChange: InputChange<T> = (eventOrValue) => {
    const target = (eventOrValue as Event | undefined)?.target as HTMLInputElement | undefined;
    value.value = target ? (target.value as T) : (eventOrValue as T);
  };
  const reset = () => {
    value.value = defaultValue;
  };
  return [value, onChange, reset];
}

export default useInput;
