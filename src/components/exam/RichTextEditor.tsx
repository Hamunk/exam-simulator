import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, Code, Sigma, Eye, EyeOff } from "lucide-react";
import { InsertTableDialog } from "./InsertTableDialog";
import { InsertCodeDialog } from "./InsertCodeDialog";
import { ContentPreview } from "./ContentPreview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function RichTextEditor({ value, onChange, placeholder, label }: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);
    
    const newValue = before + text + after;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleInsertMath = (type: "inline" | "display") => {
    if (type === "inline") {
      insertAtCursor("$x^2 + y^2 = z^2$");
    } else {
      insertAtCursor("$$\n\\int_{a}^{b} f(x) \\, dx\n$$");
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <Card className="p-2">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowTableDialog(true)}
            title="Insert Table"
          >
            <Table className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" title="Insert Math">
                <Sigma className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleInsertMath("inline")}>
                Inline Math ($...$)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInsertMath("display")}>
                Display Math ($$...$$)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCodeDialog(true)}
            title="Insert Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? "Hide Preview" : "Show Preview"}
          >
            {showPreview ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showPreview ? (
          <div className="min-h-[200px] p-3 rounded-md border border-border bg-muted/30">
            {value ? (
              <ContentPreview content={value} />
            ) : (
              <p className="text-muted-foreground text-sm">Preview will appear here...</p>
            )}
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[200px] border-0 focus-visible:ring-0 resize-y"
          />
        )}
      </Card>

      <InsertTableDialog
        open={showTableDialog}
        onOpenChange={setShowTableDialog}
        onInsert={insertAtCursor}
      />

      <InsertCodeDialog
        open={showCodeDialog}
        onOpenChange={setShowCodeDialog}
        onInsert={insertAtCursor}
      />
    </div>
  );
}
