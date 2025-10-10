'use server';

/**
 * @fileOverview This file defines a Genkit flow for processing reaction time data.
 *
 * The flow takes raw reaction data, processes it using GenAI to remove initial delay,
 * and allows the user to select specific fields for the output.
 *
 * @exports processReactionData - The main function to process reaction data.
 * @exports ProcessReactionDataInput - The input type for the processReactionData function.
 * @exports ProcessReactionDataOutput - The output type for the processReactionData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessReactionDataInputSchema = z.object({
  rawData: z.string().describe('The raw reaction time data in CSV format.'),
  initialDelay: z.number().describe('The initial delay to be removed from the data.'),
  selectedFields: z
    .array(z.string())
    .describe('The fields to be included in the output.'),
});
export type ProcessReactionDataInput = z.infer<typeof ProcessReactionDataInputSchema>;

const ProcessReactionDataOutputSchema = z.object({
  processedData: z.string().describe('The processed reaction time data in CSV format.'),
});
export type ProcessReactionDataOutput = z.infer<typeof ProcessReactionDataOutputSchema>;

export async function processReactionData(
  input: ProcessReactionDataInput
): Promise<ProcessReactionDataOutput> {
  return processReactionDataFlow(input);
}

const processReactionDataPrompt = ai.definePrompt({
  name: 'processReactionDataPrompt',
  input: {schema: ProcessReactionDataInputSchema},
  output: {schema: ProcessReactionDataOutputSchema},
  prompt: `You are an expert data processor. You will receive raw reaction time data in CSV format, an initial delay value, and a list of fields to include in the output.

  Your task is to:
  1. Remove the initial delay from each reaction time in the data.
  2. Select only the fields specified in the selectedFields array for the output.
  3. Return the processed data in CSV format.

  Here is the raw data:
  {{{rawData}}}

  Here is the initial delay: 
  {{{initialDelay}}}

  Here are the selected fields:
  {{{selectedFields}}}

  Ensure that the output is correctly formatted CSV.
`,
});

const processReactionDataFlow = ai.defineFlow(
  {
    name: 'processReactionDataFlow',
    inputSchema: ProcessReactionDataInputSchema,
    outputSchema: ProcessReactionDataOutputSchema,
  },
  async input => {
    const {output} = await processReactionDataPrompt(input);
    return output!;
  }
);
