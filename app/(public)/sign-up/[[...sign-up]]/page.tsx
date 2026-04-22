import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign Up | CMK",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-xl border border-gray-100 dark:border-zinc-800 rounded-2xl",
          },
        }}
      />
    </div>
  );
}
