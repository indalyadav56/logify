import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useExportStore } from "@/store/useExportStore";
import { toast } from "sonner";

const exportFormSchema = z.object({
  tenant_id: z.string().min(1, "Tenant ID is required"),
  project_id: z.string().min(1, "Project ID is required"),
  service: z.string().optional(),
  level: z.array(z.string()).min(1, "Select at least one log level"),
  timestamp_range: z.object({
    from: z.string(),
    to: z.string(),
  }),
  format: z.enum(["json", "csv", "parquet", "ndjson"]),
  include_metadata: z.boolean(),
  include_trace: z.boolean(),
  compression: z.boolean(),
  fields: z.array(z.string()).optional(),
  batch_size: z.number().min(100).max(10000).optional(),
});

const logLevels = ["ERROR", "WARN", "INFO", "DEBUG", "TRACE"];
const exportFormats = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
  { value: "parquet", label: "Parquet" },
  { value: "ndjson", label: "NDJSON" },
];

export function ExportFilters() {
  const { currentFilters, setFilters } = useExportStore();

  const form = useForm<z.infer<typeof exportFormSchema>>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      tenant_id: "",
      project_id: "",
      service: "",
      level: ["ERROR", "WARN", "INFO"],
      timestamp_range: {
        from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
      format: "json",
      include_metadata: true,
      include_trace: true,
      compression: false,
    },
  });

  async function onSubmit(data: z.infer<typeof exportFormSchema>) {
    try {
      // Here you would typically call your API
      console.log("Export data:", data);
      setFilters(data);
      toast.success("Export started successfully!");
    } catch (error) {
      toast.error("Failed to start export");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tenant_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tenant ID</FormLabel>
              <FormControl>
                <Input placeholder="tenant-xyz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="project_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project ID</FormLabel>
              <FormControl>
                <Input placeholder="proj-123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <FormControl>
                <Input placeholder="auth-service" {...field} />
              </FormControl>
              <FormDescription>Optional service filter</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={() => (
            <FormItem>
              <FormLabel>Log Levels</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {logLevels.map((level) => (
                  <FormField
                    key={level}
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(level)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, level]
                                : field.value?.filter((l) => l !== level);
                              field.onChange(newValue);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {level}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Export Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 grid-cols-2">
          <FormField
            control={form.control}
            name="include_metadata"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Include Metadata
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="include_trace"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Include Trace
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="compression"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Enable Compression
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="batch_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batch Size</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1000"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Number of logs per batch (100-10,000)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button type="submit">Start Export</Button>
        </div>
      </form>
    </Form>
  );
}
