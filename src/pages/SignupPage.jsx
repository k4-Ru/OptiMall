import { SignUp } from '@clerk/clerk-react';

export default function SignupPage() {
  return (
    <section className="flex min-h-screen items-center justify-center p-4">
      <SignUp routing="path" path="/signup" signInUrl="/login" forceRedirectUrl="/home" />
    </section>
  );
}
