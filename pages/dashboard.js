import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import Button from "../components/Button/Button.js";
import Navigation from "../components/Navigation/Navigation.js";
import AlertsList from "../components/AlertsList/AlertsList.js";

import { useUser } from "../components/UserProvider/UserProvider.js";

import {
  getRedirectURL,
  redirectAuthedPages,
} from "../helpers/redirect-auth-pages.js";
import { useEffect, useState } from "react";

import styles from "./dashboard.module.css";

export default function Dashboard() {
  const router = useRouter();
  const [areTestAlertsHidden, setAreTestAlertsHidden] =
    useState(false);
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const { query } = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (query?.popOut) {
      setIsPoppedOut(true);
    } else {
      setIsPoppedOut(false);
    }
  }, [query]);

  const handleHideTestAlertsClick = (event) => {
    event.preventDefault();

    setAreTestAlertsHidden((previous) => !previous);
  };

  if (isPoppedOut) {
    return (
      <>
        <Head>
          <title>Ko-fi XYZ - Dashboard (Popped Out)</title>
        </Head>

        {isLoading && (
          <div style={{ padding: "1em" }}>
            <p>Loading...</p>
          </div>
        )}

        {!isLoading && !user && (
          <div style={{ padding: "1em" }}>
            <p>Logged out...</p>
            <Link href={getRedirectURL(router.asPath)} passHref>
              <Button>Log in</Button>
            </Link>
          </div>
        )}

        {!isLoading && user && (
          <div style={{ width: "100%", height: "100%" }}>
            <AlertsList overlayId={user?.overlay_id} isPoppedOut />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="wrapper">
      <Head>
        <title>Ko-fi XYZ - Dashboard</title>
      </Head>

      <Navigation user={user} isLoading={isLoading} />

      <main>
        <h2>Dashboard</h2>

        {isLoading ? (
          <div style={{ padding: "1em" }}>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <h2>Alerts</h2>

            <p>
              This is only a list of alerts while using the webhook
              integration.{" "}
              <Link href="https://ko-fi.com/manage/supportreceived">
                Go to Ko-fi to see everything.
              </Link>
            </p>

            <p>
              You can use the{" "}
              <Link href="/dashboard?popOut=true">
                &lsquo;popout &rsquo; version
              </Link>{" "}
              of this dashboard in OBS. Check out Andilippi &apos;s
              video on{" "}
              <Link href="https://www.youtube.com/watch?v=J4YJCXBshuw">
                how to add custom browser docks
              </Link>
              .
            </p>

            <Link href="/dashboard?popOut=true" passHref>
              <Button isSmall isSecondary>
                Popout for OBS
              </Button>
            </Link>

            <Button
              isSmall
              isSecondary
              style={{ marginLeft: "1em", marginBottom: "2em" }}
              onClick={handleHideTestAlertsClick}
            >
              {areTestAlertsHidden ? "Show" : "Hide"} test alerts
            </Button>
          </>
        )}
      </main>
      <aside>
        <div className={styles.AlertsListWrapper}>
          <AlertsList
            overlayId={user?.overlay_id}
            areTestAlertsHidden={areTestAlertsHidden}
          />
        </div>
      </aside>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  return redirectAuthedPages(req);
}
