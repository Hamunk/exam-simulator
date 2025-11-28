import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Code, Eye, EyeOff } from "lucide-react";
import { ContentPreview } from "./ContentPreview";
import { InsertCodeDialog } from "./InsertCodeDialog";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

interface OptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function OptionEditor({ value, onChange, placeholder }: OptionEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);

  const insertAtCursor = (text: string) => {
    onChange(value + text);
  };

  const handleInsertMath = (type: "inline" | "display") => {
    const template = type === "inline" ? "$x^2$" : "$$\\sum_{i=1}^n i$$";
    insertAtCursor(template);
  };

  return (
    <div className="space-y-2">
      {/* Compact Toolbar */}
      <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleInsertMath("inline")}
          title="Insert inline math"
          className="h-7 px-2 text-xs"
        >
          <InlineMath math="x" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowCodeDialog(true)}
          title="Insert code"
          className="h-7 px-2"
        >
          <Code className="w-3 h-3" />
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          title={showPreview ? "Hide preview" : "Show preview"}
          className="h-7 px-2"
        >
          {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </Button>
      </div>

      {/* Editor or Preview */}
      {showPreview ? (
        <div className="min-h-[60px] rounded-md border bg-background p-3">
          <ContentPreview content={value || placeholder || ""} />
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[60px] resize-none"
          rows={2}
        />
      )}

      <InsertCodeDialog
        open={showCodeDialog}
        onOpenChange={setShowCodeDialog}
        onInsert={insertAtCursor}
      />
    </div>
  );
}
