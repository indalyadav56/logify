import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export interface Log {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  service: string;
  metadata: Record<string, string>;
  action?: string;
  file?: string;
  func_name?: string;
}

export interface LevelDetails {
  icon: JSX.Element;
  color: string;
  borderColor: string;
}

export function getLevelDetails(level: string): LevelDetails {
  switch (level.toLowerCase()) {
    case 'error':
      return {
        icon: <AlertCircle className="h-3 w-3" />,
        color: 'text-red-500',
        borderColor: 'rgb(239, 68, 68)',
      };
    case 'warning':
      return {
        icon: <AlertTriangle className="h-3 w-3" />,
        color: 'text-yellow-500',
        borderColor: 'rgb(234, 179, 8)',
      };
    default:
      return {
        icon: <Info className="h-3 w-3" />,
        color: 'text-gray-500',
        borderColor: 'rgb(107, 114, 128)',
      };
  }
}
