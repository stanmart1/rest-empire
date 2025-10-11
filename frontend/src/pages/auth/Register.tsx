import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterFormData } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Mail, Eye, EyeOff, Lock, Phone, Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  residence: z.string().min(1, 'Place of residence is required'),
  terms1: z.boolean().refine(val => val === true, 'You must accept the General Terms and Conditions'),
  terms2: z.boolean().refine(val => val === true, 'You must accept the Data and Privacy Policy'),
  terms3: z.boolean().refine(val => val === true, 'You must confirm the information is correct'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const referralCode = searchParams.get('ref');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms1: false,
      terms2: false,
      terms3: false,
    },
  });

  const terms1Value = watch('terms1');
  const terms2Value = watch('terms2');
  const terms3Value = watch('terms3');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        phone_number: data.phone,
        referral_code: referralCode || undefined,
      });
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-5xl relative py-8">
        {/* Back to Home Button */}
        <div className="relative mb-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Registration Form */}
        <Card className={`w-full lg:w-1/2 transition-all duration-500 ease-in-out ${step === 1 ? 'lg:translate-x-0' : 'lg:translate-x-[calc(100%+2rem)]'}`}>
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">RE</span>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
                <CardDescription>Step {step} of 2</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 min-h-[400px] relative overflow-hidden">
            <AnimatePresence mode="wait">
            {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="space-y-4"
            >
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                {...register('fullName')}
                disabled={isLoading}
                className="placeholder:text-foreground/70"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10 placeholder:text-foreground/70"
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  className="pl-10 placeholder:text-foreground/70"
                  {...register('phone')}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  className="pl-10 pr-10 placeholder:text-foreground/70"
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 placeholder:text-foreground/70"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            </motion.div>
            )}

            {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="space-y-4"
            >
            <div className="space-y-2">
              <Label htmlFor="residence">Place of residence <span className="text-destructive">*</span></Label>
              <Select onValueChange={(value) => setValue('residence', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Place of residence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                </SelectContent>
              </Select>
              {errors.residence && (
                <p className="text-sm text-destructive">{errors.residence.message}</p>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms1" 
                  checked={terms1Value}
                  onCheckedChange={(checked) => setValue('terms1', checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="terms1"
                  className="text-sm text-foreground leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read, understood, and agreed to the General Terms and Conditions.
                </label>
              </div>
              {errors.terms1 && (
                <p className="text-sm text-destructive">{errors.terms1.message}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms2" 
                  checked={terms2Value}
                  onCheckedChange={(checked) => setValue('terms2', checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="terms2"
                  className="text-sm text-foreground leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read, understood, and agreed to the Data and Privacy Policy.
                </label>
              </div>
              {errors.terms2 && (
                <p className="text-sm text-destructive">{errors.terms2.message}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms3" 
                  checked={terms3Value}
                  onCheckedChange={(checked) => setValue('terms3', checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="terms3"
                  className="text-sm text-foreground leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm that all information I provided is correct and will notify Rest Empire of any changes.
                </label>
              </div>
              {errors.terms3 && (
                <p className="text-sm text-destructive">{errors.terms3.message}</p>
              )}
            </div>
            </motion.div>
            )}
            </AnimatePresence>

            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              {step === 1 ? (
                <Button 
                  type="button" 
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              ) : (
                <>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing up...
                      </>
                    ) : (
                      'Sign up'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                </>
              )}
              <p className="text-sm text-center text-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Log In
                </Link>
              </p>
            </CardFooter>
          </form>

        </Card>

        {/* Info Section */}
        <div className={`space-y-6 w-full lg:w-1/2 transition-all duration-500 ease-in-out ${step === 1 ? 'lg:translate-x-0' : 'lg:-translate-x-[calc(100%+2rem)]'}`}>
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">Build Your Empire</h2>
              <p className="text-lg text-foreground">
                Join Rest Empire and access powerful tools to grow your network marketing business.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                  <p className="text-sm text-foreground">Track your team performance and earnings in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Team Management</h3>
                  <p className="text-sm text-foreground">Easily manage and support your growing team</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Multiple Bonus Types</h3>
                  <p className="text-sm text-foreground">Earn through various bonus structures and ranks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
