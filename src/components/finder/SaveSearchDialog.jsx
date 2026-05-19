import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
            <Input
              id="search-name"
              placeholder="e.g., Machine Learning Research"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border-2 focus:border-accent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <AlertDialogCancel onClick={onCancel} className="px-6 font-semibold">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleSave}
            disabled={!searchName.trim()}
            className="px-8 font-semibold text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ backgroundColor: '#2B4EF5' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a3ae0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2B4EF5'}
          >
            Save Search
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
