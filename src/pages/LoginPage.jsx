import { SignIn } from '@clerk/clerk-react';

export default function LoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center p-4">
      <SignIn routing="path" path="/login" signUpUrl="/signup" forceRedirectUrl="/home" />
    </section>
  );
}
