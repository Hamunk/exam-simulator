import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface ContentPreviewProps {
  content: string;
}

export function ContentPreview({ content }: ContentPreviewProps) {
  const renderMarkdownTable = (tableStr: string) => {
    const lines = tableStr.trim().split("\n").filter((line) => line.trim());
    if (lines.length < 2) return tableStr;

    const parseRow = (row: string) =>
      row
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell);

    const headerRow = parseRow(lines[0]);
    const dataRows = lines.slice(2).map(parseRow);

    return (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border">
          <thead className="bg-muted">
            <tr>
              {headerRow.map((header, idx) => (
                <th
                  key={idx}
                  className="border border-border px-4 py-2 text-left font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={rowIdx % 2 === 0 ? "bg-background" : "bg-muted/30"}
              >
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="border border-border px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCodeAndMath = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const beforeCode = text.slice(lastIndex, match.index);
        parts.push(...renderMathInText(beforeCode));
      }

      const language = match[1] || "python";
      const code = match[2];
      parts.push(
        <SyntaxHighlighter
          key={match.index}
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: "1rem 0",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex);
      parts.push(...renderMathInText(remaining));
    }

    return parts;
  };

  const renderMathInText = (text: string) => {
    const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
    const inlineMathRegex = /\$(.*?)\$/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    const allMatches: Array<{ index: number; length: number; latex: string; isDisplay: boolean }> = [];

    let match: RegExpExecArray | null;
    while ((match = displayMathRegex.exec(text)) !== null) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        latex: match[1],
        isDisplay: true,
      });
    }

    displayMathRegex.lastIndex = 0;

    while ((match = inlineMathRegex.exec(text)) !== null) {
      const isPartOfDisplay = allMatches.some(
        (m) => match!.index >= m.index && match!.index < m.index + m.length
      );
      if (!isPartOfDisplay) {
        allMatches.push({
          index: match.index,
          length: match[0].length,
          latex: match[1],
          isDisplay: false,
        });
      }
    }

    allMatches.sort((a, b) => a.index - b.index);

    allMatches.forEach((m) => {
      if (m.index > lastIndex) {
        const textBefore = text.slice(lastIndex, m.index);
        if (textBefore) parts.push(textBefore);
      }

      if (m.isDisplay) {
        parts.push(
          <div key={m.index} className="my-4">
            <BlockMath math={m.latex} />
          </div>
        );
      } else {
        parts.push(<InlineMath key={m.index} math={m.latex} />);
      }

      lastIndex = m.index + m.length;
    });

    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex);
      if (remaining) parts.push(remaining);
    }

    return parts;
  };

  const renderText = (text: string) => {
    const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tableRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const beforeTable = text.slice(lastIndex, match.index);
        parts.push(...renderCodeAndMath(beforeTable));
      }

      parts.push(
        <div key={match.index}>{renderMarkdownTable(match[0])}</div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex);
      parts.push(...renderCodeAndMath(remaining));
    }

    return parts;
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {renderText(content)}
    </div>
  );
}
