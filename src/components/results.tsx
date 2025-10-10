"use client"

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Bot, Loader2, Trash2 } from "lucide-react";
import { processReactionData } from '@/ai/flows/process-reaction-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { Result, AttemptDetail } from '@/app/page';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ResultsProps = {
  results: Result[];
  calibration: number;
  onClearResults: () => void;
};

const ALL_FIELDS = ['Test ID', 'Timestamp', 'Age', 'Gender', 'Wears Glasses', 'Visual Fatigue', 'Average Time (ms)', 'Calibrated Average (ms)', 'Faults', 'Attempt Number', 'Attempt Time (ms)', 'Was Fault', 'Delay Used (ms)'];

export function Results({ results, calibration, onClearResults }: ResultsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCsv, setProcessedCsv] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>(ALL_FIELDS);
  const [initialDelay, setInitialDelay] = useState<number>(calibration);
  const { toast } = useToast();

  useEffect(() => {
    setInitialDelay(calibration);
  }, [calibration]);

  const dataWithCalibration = results.map(r => ({
    ...r,
    calibratedAverage: calibration > 0 ? Math.abs(250 - calibration) : 0,
  }));

  const flattenDataForCsv = (data: typeof dataWithCalibration) => {
    const flatData: any[] = [];
    data.forEach(row => {
      if (row.attempts.length === 0) {
        flatData.push({
          'Test ID': row.id,
          'Timestamp': row.timestamp,
          'Age': row.age,
          'Gender': row.gender,
          'Wears Glasses': row.wearsGlasses ? 'Yes' : 'No',
          'Visual Fatigue': row.visualFatigue,
          'Average Time (ms)': Math.round(row.average),
          'Calibrated Average (ms)': calibration > 0 ? Math.round(row.calibratedAverage) : 0,
          'Faults': row.faults,
          'Attempt Number': 'N/A',
          'Attempt Time (ms)': 'N/A',
          'Was Fault': 'N/A',
          'Delay Used (ms)': 'N/A',
        });
      } else {
        row.attempts.forEach((attempt, index) => {
          flatData.push({
            'Test ID': row.id,
            'Timestamp': row.timestamp,
            'Age': row.age,
            'Gender': row.gender,
            'Wears Glasses': row.wearsGlasses ? 'Yes' : 'No',
            'Visual Fatigue': row.visualFatigue,
            'Average Time (ms)': Math.round(row.average),
            'Calibrated Average (ms)': calibration > 0 ? Math.round(row.calibratedAverage) : 0,
            'Faults': row.faults,
            'Attempt Number': index + 1,
            'Attempt Time (ms)': Math.round(attempt.time),
            'Was Fault': attempt.wasFault ? 'Yes' : 'No',
            'Delay Used (ms)': Math.round(attempt.delayUsed),
          });
        });
      }
    });
    return flatData;
  };

  const arrayToCsv = (data: any[], columns: string[]) => {
    const header = columns.join(',');
    const rows = data.map(row => {
      return columns.map(col => {
        // For CSV, we need to handle values that might contain commas
        const value = row[col];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',');
    });
    return [header, ...rows].join('\n');
  };

  const handleExport = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleProcessWithAi = async () => {
    setIsProcessing(true);
    setProcessedCsv(null);

    const flatData = flattenDataForCsv(dataWithCalibration);
    const rawDataCsv = arrayToCsv(flatData, ALL_FIELDS);

    try {
      const result = await processReactionData({
        rawData: rawDataCsv,
        initialDelay: initialDelay,
        selectedFields: selectedFields,
      });
      setProcessedCsv(result.processedData);
    } catch (error) {
      console.error('AI processing failed:', error);
      toast({
        variant: 'destructive',
        title: "AI Processing Failed",
        description: "There was an error while processing your data.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFieldSelection = (field: string, checked: boolean) => {
    setSelectedFields(prev => 
      checked ? [...prev, field] : prev.filter(f => f !== field)
    );
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Test Data</CardTitle>
              <CardDescription>
                {calibration > 0 ? `Using a calibration value of ${calibration}ms.` : 'No calibration value set. Calibrate for more accurate results.'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleExport(arrayToCsv(flattenDataForCsv(dataWithCalibration), ALL_FIELDS), 'reactivision_results.csv')}
                disabled={results.length === 0}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={results.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your test results.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onClearResults}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>{results.length === 0 ? "No results yet. Complete some tests in the 'Test' tab." : "A list of your reaction tests."}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Test ID</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Glasses</TableHead>
                <TableHead>Fatigue</TableHead>
                <TableHead>Avg. Time (ms)</TableHead>
                <TableHead>Calibrated Avg.</TableHead>
                <TableHead>Faults</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataWithCalibration.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.id}</TableCell>
                  <TableCell>{result.age}</TableCell>
                  <TableCell className="capitalize">{result.gender}</TableCell>
                  <TableCell>{result.wearsGlasses ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{result.visualFatigue}</TableCell>
                  <TableCell>{Math.round(result.average)}</TableCell>
                  <TableCell>{calibration > 0 ? Math.round(result.calibratedAverage) : '0'}</TableCell>
                  <TableCell>{result.faults}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot /> AI Data Processor</CardTitle>
          <CardDescription>Use AI to process your data, remove delays, and select specific fields for your export.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="initialDelay">Initial Delay (ms)</Label>
              <Input
                id="initialDelay"
                type="number"
                value={initialDelay}
                onChange={(e) => setInitialDelay(Number(e.target.value))}
                placeholder="e.g., your calibration value"
              />
            </div>
            <div className="space-y-2">
              <Label>Fields to Include for Export</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 max-h-48 overflow-y-auto">
                {ALL_FIELDS.map(field => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field}`}
                      checked={selectedFields.includes(field)}
                      onCheckedChange={(checked) => handleFieldSelection(field, checked as boolean)}
                    />
                    <Label htmlFor={`field-${field}`} className="font-normal cursor-pointer text-sm">{field}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleProcessWithAi} disabled={isProcessing || results.length === 0}>
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
            Process with AI
          </Button>

          {processedCsv && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold">AI Processed Data</h4>
              <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">{processedCsv}</pre>
              <Button onClick={() => handleExport(processedCsv, 'reactivision_processed_results.csv')} variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Export Processed CSV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
