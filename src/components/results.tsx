/**
 * Results Component
 * Displays historical test results in a tabular format with user metadata and statistics.
 * @module results
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, User, Eye, ChevronsUpDown, Bot, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Zap } from 'lucide-react';
import { getAiAnalysis, getAllAiAnalyses } from '@/lib/supabase/api';
import { useToast } from '@/hooks/use-toast';
import { convertToCSV } from '@/lib/csv';
import type { Result } from '@/types';

/**
 * Props for the Results component.
 */
interface Props {
  /** Array of test results to display */
  results: Result[];
  /** Current calibration median for reference */
  calibration: number;
  /** Called when a test is deleted (id passed) */
  onDelete?: (id: number) => Promise<void>;
}

/**
 * Component that displays test results in a comprehensive table.
 * Shows reaction time averages, faults, attempt counts, and user demographic data.
 * @param {Props} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
export function Results({ results, calibration, onDelete }: Props) {
  const [analysis, setAnalysis] = useState<Record<number, string | null>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [generalAnalysis, setGeneralAnalysis] = useState<string | null>(null);
  const [isGeneralLoading, setIsGeneralLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const filteredResults = results.filter((result) => {
    if (filterColumn === 'all') {
      return Object.values(result).some((value) =>
        String(value).toLowerCase().includes(filter.toLowerCase())
      );
    }
    return String(result[filterColumn as keyof Result])
      .toLowerCase()
      .includes(filter.toLowerCase());
  });

  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No results yet. Complete a test to see your data here.</p>
        </CardContent>
      </Card>
    );
  }

  const handleAnalyze = async (testId: number) => {
    setLoadingMap((s) => ({ ...s, [testId]: true }));
    try {
      const a = await getAiAnalysis(testId);
      setAnalysis((s) => ({ ...s, [testId]: a ? a.analysis_text : 'No analysis available' }));
    } catch (err) {
      console.error('AI analysis error', err);
      toast({ variant: 'destructive', title: 'AI analysis failed' });
    } finally {
      setLoadingMap((s) => ({ ...s, [testId]: false }));
    }
  };

  const handleGeneralAnalysis = async () => {
    setIsGeneralLoading(true);
    try {
      const testIds = results.map((r) => r.id);
      const analyses = await getAllAiAnalyses(testIds);
      const combinedAnalysis = analyses.map((a) => a.analysis_text).join('\n\n');
      setGeneralAnalysis(combinedAnalysis || 'No analysis available');
    } catch (err) {
      console.error('General AI analysis error', err);
      toast({ variant: 'destructive', title: 'General AI analysis failed' });
    } finally {
      setIsGeneralLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const csv = convertToCSV(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Test Results</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {results.length} test{results.length !== 1 ? 's' : ''}. Calibration median: {calibration}ms
            </p>
          </div>
          <Button onClick={handleDownloadCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Collapsible className="mb-4">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>
                <Bot className="w-4 h-4 mr-2 inline-block" />
                General AI Analysis
              </span>
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 border rounded-md mt-2">
            {generalAnalysis ? (
              <div className="prose dark:prose-invert">{generalAnalysis}</div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Click the button to get a general analysis of your results.
                </p>
                <Button onClick={handleGeneralAnalysis} disabled={isGeneralLoading}>
                  {isGeneralLoading ? 'Analyzing...' : 'Analyze All Results'}
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Reaction Time Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis dataKey="average" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Filter results..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterColumn} onValueChange={setFilterColumn}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All columns</SelectItem>
                <SelectItem value="timestamp">Date</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="average">Average</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={String(rowsPerPage)} onValueChange={(value) => setRowsPerPage(Number(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Average (ms)</TableHead>
              <TableHead>Faults</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Glasses</TableHead>
              <TableHead>Fatigue</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedResults.map((result) => (
              <React.Fragment key={result.id}>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(result.timestamp).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {result.average}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={result.faults > 0 ? 'destructive' : 'secondary'}>
                      {result.faults}
                    </Badge>
                  </TableCell>
                  <TableCell>{result.attempts.length}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {result.age}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{result.gender}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {result.wearsGlasses ? 'Yes' : 'No'}
                    </div>
                  </TableCell>
                  <TableCell>{result.visualFatigue}/10</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => handleAnalyze(result.id)} disabled={loadingMap[result.id]}>
                        <Zap className="w-4 h-4 mr-2" /> AI
                      </Button>
                      <Button variant="ghost" onClick={() => onDelete?.(result.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {analysis[result.id] ? (
                  <TableRow key={`${result.id}-analysis`}>
                    <TableCell colSpan={9}>
                      <div className="p-4 bg-muted rounded prose dark:prose-invert">{analysis[result.id]}</div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end items-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {Math.ceil(filteredResults.length / rowsPerPage)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(filteredResults.length / rowsPerPage))
              )
            }
            disabled={currentPage === Math.ceil(filteredResults.length / rowsPerPage)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
