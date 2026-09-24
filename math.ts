/**
 * Convert the LaTeX delimiters commonly emitted by chat models to the
 * dollar-sign delimiters understood by Obsidian's Markdown renderer.
 *
 * Delimiters inside inline or fenced code are intentionally left alone, and
 * unmatched delimiters are preserved so partially streamed Markdown remains
 * readable until the closing delimiter arrives.
 */
export function normalizeMathDelimiters(markdown: string): string {
  const replacements = new Map<number, string>();
  let displayStart: number | null = null;
  let inlineStart: number | null = null;
  let inlineCodeTicks = 0;
  let fence: { char: "`" | "~"; length: number } | null = null;

  const isEscaped = (index: number): boolean => {
    let precedingBackslashes = 0;
    for (let i = index - 1; i >= 0 && markdown[i] === "\\"; i--) {
      precedingBackslashes++;
    }
    return precedingBackslashes % 2 === 1;
  };

  for (let i = 0; i < markdown.length;) {
    const atLineStart = i === 0 || markdown[i - 1] === "\n";

    if (atLineStart) {
      const fenceMatch = markdown.slice(i).match(/^ {0,3}(`{3,}|~{3,})/);
      if (fenceMatch) {
        const marker = fenceMatch[1];
        const markerChar = marker[0] as "`" | "~";
        if (!fence) {
          fence = { char: markerChar, length: marker.length };
          displayStart = null;
          inlineStart = null;
        } else if (markerChar === fence.char && marker.length >= fence.length) {
          fence = null;
        }
        i += fenceMatch[0].length;
        continue;
      }
    }

    if (fence) {
      i++;
      continue;
    }

    if (markdown[i] === "`") {
      let runLength = 1;
      while (markdown[i + runLength] === "`") runLength++;
      if (inlineCodeTicks === 0) inlineCodeTicks = runLength;
      else if (runLength === inlineCodeTicks) inlineCodeTicks = 0;
      i += runLength;
      continue;
    }

    if (markdown[i] === "\n") {
      inlineStart = null;
    }

    if (inlineCodeTicks === 0 && markdown[i] === "\\" && !isEscaped(i)) {
      const delimiter = markdown.slice(i, i + 2);
      if (delimiter === "\\[") {
        displayStart = i;
        i += 2;
        continue;
      }
      if (delimiter === "\\]" && displayStart !== null) {
        replacements.set(displayStart, "$$");
        replacements.set(i, "$$");
        displayStart = null;
        i += 2;
        continue;
      }
      if (delimiter === "\\(") {
        inlineStart = i;
        i += 2;
        continue;
      }
      if (delimiter === "\\)" && inlineStart !== null) {
        replacements.set(inlineStart, "$");
        replacements.set(i, "$");
        inlineStart = null;
        i += 2;
        continue;
      }
    }

    i++;
  }

  if (replacements.size === 0) return markdown;

  let normalized = "";
  for (let i = 0; i < markdown.length;) {
    const replacement = replacements.get(i);
    if (replacement !== undefined) {
      normalized += replacement;
      i += 2;
    } else {
      normalized += markdown[i];
      i++;
    }
  }
  return normalized;
}
