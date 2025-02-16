import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ImportConfigProps {
  config: any;
  onChange: (config: any) => void;
}

export function ImportConfig({ config, onChange }: ImportConfigProps) {
  const handleFormatChange = (value: string) => {
    onChange({ format: value });
  };

  const handleParseOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      parseOptions: {
        ...config.parseOptions,
        [name]: value,
      },
    });
  };

  const handleTransformationToggle = (enabled: boolean) => {
    onChange({
      transformations: {
        ...config.transformations,
        enabled,
      },
    });
  };

  const handleValidationToggle = (enabled: boolean) => {
    onChange({
      validation: {
        ...config.validation,
        enabled,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Configuration</CardTitle>
        <CardDescription>
          Configure how your logs should be parsed and processed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="format">
            <AccordionTrigger>Format Settings</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>File Format</Label>
                  <Select
                    value={config.format}
                    onValueChange={handleFormatChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="txt">Plain Text</SelectItem>
                      <SelectItem value="log">Log File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="delimiter">Delimiter</Label>
                  <Input
                    id="delimiter"
                    name="delimiter"
                    value={config.parseOptions.delimiter}
                    onChange={handleParseOptionChange}
                    placeholder=","
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fields">
            <AccordionTrigger>Field Mapping</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="timeField">Time Field</Label>
                  <Input
                    id="timeField"
                    name="timeField"
                    value={config.parseOptions.timeField}
                    onChange={handleParseOptionChange}
                    placeholder="timestamp"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Input
                    id="timeFormat"
                    name="timeFormat"
                    value={config.parseOptions.timeFormat}
                    onChange={handleParseOptionChange}
                    placeholder="ISO8601"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="levelField">Level Field</Label>
                  <Input
                    id="levelField"
                    name="levelField"
                    value={config.parseOptions.levelField}
                    onChange={handleParseOptionChange}
                    placeholder="level"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="messageField">Message Field</Label>
                  <Input
                    id="messageField"
                    name="messageField"
                    value={config.parseOptions.messageField}
                    onChange={handleParseOptionChange}
                    placeholder="message"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="transformations">
            <AccordionTrigger>Transformations</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.transformations.enabled}
                    onCheckedChange={handleTransformationToggle}
                  />
                  <Label>Enable Transformations</Label>
                </div>
                {config.transformations.enabled && (
                  <div className="grid gap-4">
                    {/* Add transformation rules UI here */}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="validation">
            <AccordionTrigger>Validation</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.validation.enabled}
                    onCheckedChange={handleValidationToggle}
                  />
                  <Label>Enable Validation</Label>
                </div>
                {config.validation.enabled && (
                  <div className="grid gap-4">
                    {/* Add validation rules UI here */}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
