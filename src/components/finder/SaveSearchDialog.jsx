import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

export function SaveSearchDialog({
  isOpen,
  onSave,
  onCancel,
  suggestedName = ""
}) {
  const [searchName, setSearchName] = useState(suggestedName);

  const handleSave = () => {
    if (searchName.trim()) {
      onSave(searchName.trim());
      setSearchName("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Save This Search</AlertDialogTitle>
          <AlertDialogDescription>
            Give your search a name so you can find it easily later
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search-name" className="text-sm font-medium">
              Search Name
            </Label>
            <InputText
              id="search-name"
              placeholder="e.g., Machine Learning Research"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            label="Cancel"
            outlined
            onClick={onCancel}
          />
          <Button
            type="button"
            label="Save Search"
            onClick={handleSave}
            disabled={!searchName.trim()}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
