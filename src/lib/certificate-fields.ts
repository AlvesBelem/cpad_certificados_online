export function areFieldsFilled<T extends Record<string, unknown>>(
  fields: (keyof T)[],
  data: T,
) {
  return fields.every((field) => {
    const value = data[field];
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    return Boolean(value);
  });
}
