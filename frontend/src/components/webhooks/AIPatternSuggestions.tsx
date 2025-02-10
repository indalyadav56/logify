import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Pattern {
  pattern: string;
  description: string;
  confidence: number;
  category: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  examples: string[];
}

interface AIPatternSuggestionsProps {
  logSample: string;
  onSelectPattern: (pattern: Pattern) => void;
}

const AIPatternSuggestions: React.FC<AIPatternSuggestionsProps> = ({
  logSample,
  onSelectPattern,
}) => {
  // Simulated AI-generated patterns
  const suggestedPatterns: Pattern[] = [
    {
      pattern: 'memory usage > 90% AND duration > 5s',
      description: 'Detects high memory usage with slow response times',
      confidence: 0.95,
      category: 'Performance',
      impact: 'critical',
      examples: [
        'Memory usage at 92%, request duration: 6.5s',
        'Memory peaked at 95%, response time: 8s'
      ]
    },
    {
      pattern: 'status=500 AND retry_count>=3',
      description: 'Identifies repeated system failures',
      confidence: 0.88,
      category: 'Reliability',
      impact: 'high',
      examples: [
        'Request failed with 500, retry attempt: 3',
        'Internal error 500, retries exhausted: 4'
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          AI-Suggested Patterns
        </CardTitle>
        <CardDescription>
          Intelligent pattern suggestions based on your log data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedPatterns.map((pattern, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm bg-muted p-1 rounded">
                  {pattern.pattern}
                </code>
                <Badge variant="outline">
                  {Math.round(pattern.confidence * 100)}% confidence
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {pattern.description}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant={
                  pattern.impact === 'critical' ? 'destructive' :
                  pattern.impact === 'high' ? 'default' :
                  'secondary'
                }>
                  {pattern.impact}
                </Badge>
                <Badge variant="outline">{pattern.category}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Examples:</strong>
                <ul className="list-disc list-inside mt-1">
                  {pattern.examples.map((example, i) => (
                    <li key={i}>{example}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Not Helpful
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSelectPattern(pattern)}
                >
                  Use Pattern
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default AIPatternSuggestions;
