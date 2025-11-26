import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InsertCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (code: string) => void;
}

export function InsertCodeDialog({ open, onOpenChange, onInsert }: InsertCodeDialogProps) {
  const [language, setLanguage] = useState("python");

  const languages = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "sql", label: "SQL" },
    { value: "bash", label: "Bash" },
  ];

  const handleInsert = () => {
    const codeBlock = `\`\`\`${language}\n# Your code here\n\`\`\``;
    onInsert(codeBlock);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Code Block</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="language">Programming Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>Insert Code Block</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
