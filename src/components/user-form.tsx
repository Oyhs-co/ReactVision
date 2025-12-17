'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { saveUserProfile, getUserProfile, UserProfile } from '@/lib/user';
import { useToast } from '@/hooks/use-toast';
import { ChevronsUpDown } from 'lucide-react';

/**
 * Props for the UserForm component.
 * @interface Props
 */
interface Props {
  /**
   * Callback function that is called when the user saves their profile.
   * @param {UserProfile} profile - The user's profile data.
   * @returns {void}
   */
  onSave?: (profile: UserProfile) => void;
}

/**
 * A collapsible form for collecting user information.
 * @param {Props} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
export function UserForm({ onSave }: Props) {
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [wearsGlasses, setWearsGlasses] = useState(false);
  const [visualFatigue, setVisualFatigue] = useState(1);
  const [isOpen, setIsOpen] = useState(true);
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
      toast({ variant: 'destructive', title: 'Invalid age' });
      return;
    }
    const profile: UserProfile = {
      age: Number(age),
      gender,
      wearsGlasses,
      visualFatigue,
    };
    const saved = saveUserProfile(profile);
    toast({ title: 'Data saved' });
    onSave?.(saved);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          <span>User Information</span>
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 border rounded-md mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              value={gender}
              onValueChange={(v: string) => setGender(v as 'male' | 'female' | 'other')}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="glasses" checked={wearsGlasses} onCheckedChange={setWearsGlasses} />
            <Label htmlFor="glasses">Wears glasses</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="visual-fatigue">Visual Fatigue: {visualFatigue}</Label>
            <Slider
              id="visual-fatigue"
              defaultValue={[visualFatigue]}
              max={10}
              step={1}
              onValueChange={(v: number[]) => setVisualFatigue(v[0])}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>Save User Data</Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
