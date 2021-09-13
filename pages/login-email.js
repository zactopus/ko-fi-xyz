import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import Button from "../components/Button/Button";
import { signIn } from "../helpers/supabase-clientside";
import logger from "../helpers/logger";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasEmailBeenSent, setHasEmailBeenSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    const { elements } = event.target;

    const { error } = await signIn(
      {
        email: elements.email.value,
      },
      {
        redirectTo: router.query.redirectTo || null,
      }
    );

    if (error) {
      logger.error({ error });
    } else {
      setHasEmailBeenSent(true);
    }
  };

  return (
    <main>
      <Head>
        <title>Ko-fi Custom Alerts - Login/Signup with Email</title>
      </Head>

      <h1>Ko-fi Custom Alerts</h1>

      <h2>Login/Signup with Email</h2>

      {hasEmailBeenSent ? (
        <p>Check your email!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            disabled={isLoading}
          />
          <Button disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      )}
    </main>
  );
}