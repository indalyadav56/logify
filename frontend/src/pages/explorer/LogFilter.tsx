import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface LogFilterProps {
  currentMetadataKey: string;
  currentMetadataValue: string;
  onMetadataKeyChange: (value: string) => void;
  onMetadataValueChange: (value: string) => void;
  onAddMetadata: () => void;
  metadata: Record<string, string>;
  onRemoveMetadata: (key: string) => void;
  commonMetadataFields: Array<{ label: string; value: string }>;
}

export default function LogFilter({
  currentMetadataKey,
  currentMetadataValue,
  onMetadataKeyChange,
  onMetadataValueChange,
  onAddMetadata,
  metadata,
  onRemoveMetadata,
  commonMetadataFields,
}: LogFilterProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Metadata</h3>
        <div className="space-y-2">
          <Select value={currentMetadataKey} onValueChange={onMetadataKeyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {commonMetadataFields.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              placeholder="Value"
              value={currentMetadataValue}
              onChange={(e) => onMetadataValueChange(e.target.value)}
            />
            <Button size="icon" variant="outline" onClick={onAddMetadata}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {Object.entries(metadata).map(([key, value]) => (
            <Badge
              key={key}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {key}: {value}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemoveMetadata(key)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}