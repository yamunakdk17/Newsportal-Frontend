import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Check, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import heroImage from '@/assets/login-hero.svg';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { login } from '@/components/auth/auth';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required.')
    .email('Enter a valid email address.'),

  password: z.string().min(1, 'Password is required.'),
});

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.15,
    },
  },
};

const rise = {
  hidden: {
    opacity: 0,
    y: 16,
  },

  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/*
 * One shared style for the email and password boxes,
 * so both always look exactly the same.
 */
const inputClass = (hasError, extra) =>
  cn(
    'block h-10 w-full min-w-0 rounded-lg border border-[#E1E5EA]',
    'bg-[#F8FAFC] px-3 text-sm text-[#16181A] shadow-none',
    'placeholder:text-[#B8BEC6]',
    'outline-none transition-colors',
    'focus:border-[#2168CD] focus:ring-2 focus:ring-[#2168CD]/20',
    hasError && 'border-[#981733] focus:border-[#981733] focus:ring-[#981733]/20',
    extra,
  );

function Field({ id, label, error, children }) {
  return (
    <motion.div variants={rise} className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-[1.3] text-[#16181A] sm:text-base">
        {label}
      </label>

      {children}

      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="overflow-hidden text-xs font-bold leading-[1.5] tracking-[0.002em] text-[#981733] sm:text-sm">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: '',
      password: '',
    },
  });

  /*
   * Redirect after successful login.
   */
  useEffect(() => {
    if (!signedIn) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      navigate('/admin/categories', {
        replace: true,
      });
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [signedIn, navigate]);

  /*
   * If the admin is already logged in, do not show the login page.
   */
  const alreadyLoggedIn = Boolean(window.localStorage.getItem('adminUser'));

  if (alreadyLoggedIn && !signedIn) {
    return <Navigate to="/admin/categories" replace />;
  }

  /*
   * Login handler.
   */
  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);

      if (!user) {
        setError('root', {
          message: 'Invalid login response from server.',
        });

        return;
      }

      /*
       * Keep existing authentication/session behavior.
       * No access token or refresh token is stored here.
       */
      window.localStorage.setItem('adminUser', JSON.stringify(user));
      window.localStorage.setItem('adminRole', user.role || '');

      setSignedIn(true);
    } catch (error) {
      console.error('Login error:', error);

      const status = error?.response?.status;

      if (status === 401) {
        setError('root', {
          message: 'Invalid email or password.',
        });

        return;
      }

      if (status === 429) {
        setError('root', {
          message: 'Too many login attempts. Please wait and try again.',
        });

        return;
      }

      setError('root', {
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Unable to sign in. Please try again.',
      });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="overflow-hidden bg-[#F8FAFC] font-['Geist','Noto_Sans_Devanagari',system-ui,sans-serif] lg:grid lg:min-h-screen lg:grid-cols-[9fr_7fr]">
        {/*
            HERO IMAGE
            Mobile/tablet: fixed-ratio banner, no extra space below
            Desktop: full-height column
 */}
        <motion.aside
          initial={{
            opacity: 0,
            scale: 1.04,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.9,
            ease: 'easeOut',
          }}
          className="relative order-first aspect-[16/9] w-full overflow-hidden bg-[#EAF2FC] sm:aspect-[16/7] lg:order-none lg:aspect-auto lg:h-screen">
          <img
            src={heroImage}
            alt="Illustration of the Manara Shiksha municipality office building"
            className="absolute inset-0 block h-full w-full object-cover object-center"
          />
        </motion.aside>
        {/*
            LOGIN COLUMN
         */}
        <section className="flex items-center justify-center px-4 py-6 sm:px-6 sm:py-6 lg:h-screen lg:px-8 lg:py-0 xl:px-10 2xl:px-12">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
            className="w-full max-w-[440px] rounded-3xl bg-white p-5 sm:p-7 xl:p-8">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center gap-6 sm:gap-7 xl:gap-8">
              {/* HEADER */}
              <motion.header
                variants={rise}
                className="flex w-full flex-col items-center gap-1.5 text-center sm:gap-2">
                <h1
                  lang="ne"
                  className="text-2xl font-bold leading-[1.2] text-[#2168CD] sm:text-3xl xl:text-4xl min-[1800px]:text-[42px]">
                  मनरा शिस्वा खबर
                </h1>

                <p className="text-sm leading-[1.3] text-[#4A4E54] sm:text-base xl:text-lg min-[1800px]:text-xl">
                  Sign in to manage editorial content
                </p>
              </motion.header>

              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
                <div className="mx-auto flex w-full max-w-[360px] flex-col gap-4">
                  {/* EMAIL */}
                  <Field id="email" label="Email Address" error={errors.email?.message}>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@newsportal.com"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className={inputClass(Boolean(errors.email))}
                      {...register('email')}
                    />
                  </Field>

                  {/* PASSWORD */}
                  <Field id="password" label="Password" error={errors.password?.message}>
                    <div className="relative w-full">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="********"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        className={inputClass(Boolean(errors.password), 'pr-10')}
                        {...register('password')}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[#B8BEC6] transition-colors hover:text-[#4A4E54]">
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>

                  {/* SERVER ERROR */}
                  <AnimatePresence initial={false}>
                    {errors.root?.message && (
                      <motion.p
                        role="alert"
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: 'auto',
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                        }}
                        className="overflow-hidden text-xs font-bold tracking-[0.002em] text-[#981733] sm:text-sm">
                        {errors.root.message}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* SIGN IN */}
                  <motion.div whileTap={{ scale: 0.99 }} className="w-full">
                    <Button
                      type="submit"
                      disabled={isSubmitting || signedIn}
                      className="h-10 w-full gap-2 rounded-lg bg-[#2168CD] px-4 text-sm font-medium text-white shadow-none transition-colors hover:bg-[#1B57AD] focus-visible:ring-2 focus-visible:ring-[#2168CD]/30 disabled:cursor-not-allowed disabled:opacity-80">
                      {isSubmitting && (
                        <LoaderCircle
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      )}

                      {signedIn && <Check className="h-4 w-4" aria-hidden="true" />}

                      {isSubmitting
                        ? 'Signing in...'
                        : signedIn
                          ? 'Signed in'
                          : 'Sign in'}
                    </Button>
                  </motion.div>
                </div>
              </form>

              {/* FOOTER */}
              <motion.p
                variants={rise}
                className="w-full text-center text-xs leading-[1.5] text-[#C7CBD1] sm:text-sm">
                © {new Date().getFullYear()} Manara Shiksha Khabar. All rights reserved.
              </motion.p>
            </motion.div>
          </motion.div>
        </section>{' '}
      </main>
    </MotionConfig>
  );
}

export default Login;
