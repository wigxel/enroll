import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign In | CMK",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
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
