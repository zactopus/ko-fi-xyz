import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";

import Alert from "../../components/Alert/Alert.js";
import useAlertQueue from "../../hooks/useAlertQueue.js";
import useAPI from "../../hooks/useAPI.js";

import { supabase } from "../../helpers/supabase-clientside.js";

import logger from "../../helpers/logger.js";

const TEMPORARY_OVERLAY_IDS_TO_BE_MOVED = [
  "308659011934224969",
  "308660195758703179",
  "308662615614161477",
  "308664839806386755",
  "309077638340674116",
  "309177181146186308",
  "309179489382826565",
];

export default function Overlay() {
  const [settings, setSettings] = useState({});
  const router = useRouter();
  const { id: overlayId = null } = router.query;
  const {
    isLoading,
    data: overlay,
    error,
  } = useAPI(overlayId ? "/api/overlays/" + overlayId : null);

  const { queue, isRemoving } = useAlertQueue({
    overlayId,
    messageDuration: overlay?.messageDuration,
  });
  const [currentAlert] = queue;

  const isOldOverlay =
    TEMPORARY_OVERLAY_IDS_TO_BE_MOVED.includes(overlayId);

  useEffect(() => {
    if (overlay?.settings) {
      setSettings(overlay.settings);
    }
  }, [overlay]);

  useEffect(() => {
    let overlaySubscription;

    if (overlayId) {
      overlaySubscription = supabase
        .from(`overlays:id=eq.${overlayId}`)
        .on("UPDATE", (payload) => {
          const overlay = payload?.new;

          if (overlay?.settings) {
            setSettings(overlay.settings);
          }
        })
        .subscribe();
    }

    return () => {
      if (overlaySubscription) {
        supabase.removeSubscription(overlaySubscription);
      }
    };
  }, [overlayId]);

  if (isOldOverlay) {
    return (
      <p className="ErrorMessage">
        Old overlay version. Go back to https://ko-fi.xyz and sign-up
        again. Sorry!
      </p>
    );
  }

  if (isLoading) {
    return null;
  }

  if (error) {
    logger.error(error);
    return (
      <p className="ErrorMessage">Error: Something went wrong</p>
    );
  }

  if (!overlay.id) {
    return <p className="ErrorMessage">Error: No overlay</p>;
  }

  if (!currentAlert?.kofi_data) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Ko-fi XYZ - Overlay</title>
      </Head>

      <Alert
        currentAlert={currentAlert}
        settings={settings}
        isRemoving={isRemoving}
      />
    </>
  );
}
