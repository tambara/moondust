type SlotContents = Record<string, string>;

export function renderLayout(
  template: string,
  slots: SlotContents,
) {
  return template.replace(
    /<slot\s+name=["']([^"']+)["']\s*\/>/g,
    (_, name: string) => slots[name] ?? "",
  );
}