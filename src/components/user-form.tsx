'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { saveUserProfile, getUserProfile, UserProfile } from '@/lib/user';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onSave?: (profile: UserProfile) => void;
}

export function UserForm({ onSave }: Props) {
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [wearsGlasses, setWearsGlasses] = useState(false);
  const [visualFatigue, setVisualFatigue] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const stored = getUserProfile();
    if (stored) {
      setAge(stored.age);
      setGender((stored.gender as unknown as 'male' | 'female' | 'other') || 'other');
      setWearsGlasses(Boolean((stored as { wearsGlasses?: boolean }).wearsGlasses));
      setVisualFatigue(stored.visualFatigue ?? 1);
    }
  }, []);

  const handleSave = () => {
    if (age === '' || Number(age) <= 0) {
      toast({ variant: 'destructive', title: 'Edad inválida' });
      return;
    }
    const profile: UserProfile = {
      age: Number(age),
      gender,
      wearsGlasses,
      visualFatigue,
    };
    const saved = saveUserProfile(profile);
    toast({ title: 'Datos guardados' });
    onSave?.(saved);
  };

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
      <div className="col-span-1 sm:col-span-1">
        <Label htmlFor="age">Age</Label>
        <Input id="age" type="number" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))} />
      </div>
      <div className="col-span-1 sm:col-span-1">
        <Label>Gender</Label>
        <RadioGroup value={gender} onValueChange={(v: string) => setGender(v as 'male' | 'female' | 'other')}>
          <div className="flex gap-2">
            <RadioGroupItem value="male" /> Male
            <RadioGroupItem value="female" /> Female
            <RadioGroupItem value="other" /> Other
          </div>
        </RadioGroup>
      </div>
      <div className="col-span-1 sm:col-span-1 flex items-center">
        <Switch id="glasses" checked={wearsGlasses} onCheckedChange={setWearsGlasses} />
        <Label className="ml-2">Wears glasses</Label>
      </div>
      <div className="col-span-1 sm:col-span-1">
        <Label>Visual fatigue</Label>
        <Slider defaultValue={[visualFatigue]} max={10} onValueChange={(v: number[]) => setVisualFatigue(v[0])} />
      </div>
      <div className="col-span-1 sm:col-span-4">
        <Button onClick={handleSave}>Save user data</Button>
      </div>
    </div>
  );
}
