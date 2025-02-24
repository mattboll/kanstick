"use client";
import { signIn } from "../_lib/signin-action";

export default function SignIn() {
  return (
    <form
      action={async () => {
        await signIn();
      }}
    >
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        type="submit"
      >
        Sign in
      </button>
    </form>
  );
}
