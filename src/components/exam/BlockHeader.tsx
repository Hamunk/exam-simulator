import { Card } from "@/components/ui/card";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface BlockHeaderProps {
  title: string;
  backgroundInfo: string;
}

export function BlockHeader({ title, backgroundInfo }: BlockHeaderProps) {
  const renderText = (text: string) => {
    // Check for code blocks (```language\ncode\n```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(renderMathInText(text.slice(lastIndex, match.index)));
      }
      
      // Add code block
      const language = match[1] || "python";
      const code = match[2].trim();
      parts.push(
        <SyntaxHighlighter
          key={match.index}
          language={language}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: "0.5rem",
            padding: "1rem",
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      );
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(renderMathInText(text.slice(lastIndex)));
    }

    return parts.length > 0 ? <>{parts}</> : renderMathInText(text);
  };

  const renderMathInText = (text: string) => {
    // Check for display math ($$...$$)
    const displayMathRegex = /\$\$([\s\S]+?)\$\$/g;
    // Check for inline math ($...$)
    const inlineMathRegex = /\$([^\$]+?)\$/g;
    
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    // First handle display math
    let match;
    const displayMatches: { index: number; length: number; math: string }[] = [];
    
    while ((match = displayMathRegex.exec(text)) !== null) {
      displayMatches.push({
        index: match.index,
        length: match[0].length,
        math: match[1],
      });
    }

    // Process text with display math
    let processedText = text;
    displayMatches.reverse().forEach((dm, idx) => {
      const before = processedText.slice(0, dm.index);
      const after = processedText.slice(dm.index + dm.length);
      processedText = before + `__DISPLAY_MATH_${displayMatches.length - 1 - idx}__` + after;
    });

    // Now handle inline math
    let currentIndex = 0;
    while ((match = inlineMathRegex.exec(processedText)) !== null) {
      // Skip if this is part of a display math placeholder
      if (match[0].includes("__DISPLAY_MATH_")) {
        continue;
      }

      if (match.index > currentIndex) {
        const textPart = processedText.slice(currentIndex, match.index);
        parts.push(textPart);
      }

      parts.push(<InlineMath key={`inline-${match.index}`} math={match[1]} />);
      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < processedText.length) {
      parts.push(processedText.slice(currentIndex));
    }

    // Replace display math placeholders
    const finalParts: (string | JSX.Element)[] = [];
    parts.forEach((part, idx) => {
      if (typeof part === "string") {
        displayMatches.forEach((dm, dmIdx) => {
          const placeholder = `__DISPLAY_MATH_${dmIdx}__`;
          if (part.includes(placeholder)) {
            const splitParts = part.split(placeholder);
            splitParts.forEach((sp, spIdx) => {
              if (sp) finalParts.push(sp);
              if (spIdx < splitParts.length - 1) {
                finalParts.push(
                  <div key={`display-${idx}-${dmIdx}`} className="my-2">
                    <BlockMath math={dm.math} />
                  </div>
                );
              }
            });
            return;
          }
        });
        if (!displayMatches.some((dm) => part.includes(`__DISPLAY_MATH_${displayMatches.indexOf(dm)}__`))) {
          finalParts.push(part);
        }
      } else {
        finalParts.push(part);
      }
    });

    return finalParts.length > 0 ? <>{finalParts}</> : text;
  };

  return (
    <Card className="p-6 bg-primary/5 border-primary/20 shadow-card">
      <h2 className="text-2xl font-bold text-primary mb-3">{title}</h2>
      <div className="text-foreground leading-relaxed">{renderText(backgroundInfo)}</div>
    </Card>
  );
}
