
export async function extractClasses(html: string): Promise<string[]> {
  const candidates = new Set<string>();

  class ClassExtractor {
    element(element: Element) {
      const value = element.getAttribute("class");

      if (value) {
        for (const name of value.split(/\s+/)) {
          if (name) candidates.add(name);
        }
      }
    }
  }

  await new HTMLRewriter()
    .on("[class]", new ClassExtractor())
    .transform(new Response(html))
    .text();

  return Array.from(candidates)
}