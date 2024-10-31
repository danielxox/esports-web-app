import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      <SignIn
        forceRedirectUrl="/home"
        fallbackRedirectUrl="/home"
        signUpUrl="/sign-up"
        appearance={{
          elements: {
            card: "shadow-xl",
          },
        }}
      />
    </div>
  );
}
