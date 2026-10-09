import { describe, expect, it } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("menyimpan nilai awal, mengubah nilai dari event, dan reset", () => {
    const [value, onChange, reset] = useInput("awal");
    expect(value.value).toBe("awal");

    onChange({ target: { value: "baru" } } as unknown as Event);
    expect(value.value).toBe("baru");

    reset();
    expect(value.value).toBe("awal");
  });
});
