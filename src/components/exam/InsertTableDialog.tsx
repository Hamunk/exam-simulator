import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InsertTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (table: string) => void;
}

export function InsertTableDialog({ open, onOpenChange, onInsert }: InsertTableDialogProps) {
  const [rows, setRows] = useState("3");
  const [cols, setCols] = useState("3");

  const generateTable = () => {
    const numRows = parseInt(rows) || 3;
    const numCols = parseInt(cols) || 3;

    const headerRow = "| " + Array(numCols).fill("Header").join(" | ") + " |";
    const separatorRow = "|" + Array(numCols).fill("---").join("|") + "|";
    const dataRows = Array(numRows - 1)
      .fill(null)
      .map(() => "| " + Array(numCols).fill("Cell").join(" | ") + " |")
      .join("\n");

    return `${headerRow}\n${separatorRow}\n${dataRows}`;
  };

  const handleInsert = () => {
    const table = generateTable();
    onInsert(table);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rows">Number of Rows</Label>
            <Input
              id="rows"
              type="number"
              min="2"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cols">Number of Columns</Label>
            <Input
              id="cols"
              type="number"
              min="1"
              value={cols}
              onChange={(e) => setCols(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>Insert Table</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
