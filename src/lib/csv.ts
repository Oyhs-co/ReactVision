import type { Result } from '@/types';

export function convertToCSV(data: Result[]) {
    const headers = [
        'ID',
        'Timestamp',
        'Average',
        'Faults',
        'Age',
        'Gender',
        'Wears Glasses',
        'Visual Fatigue',
    ];
    const rows = data.map((result) =>
        [
            result.id,
            result.timestamp,
            result.average,
            result.faults,
            result.age,
            result.gender,
            result.wearsGlasses,
            result.visualFatigue,
        ].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
}
