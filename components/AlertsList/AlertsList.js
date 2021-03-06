import { useRef, useEffect } from "react";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { formatDistance } from "date-fns";
import classNames from "classnames";

import useAPI from "../../hooks/useAPI.js";
import { getMoney } from "../../helpers/get-money.js";

import styles from "./AlertsList.module.css";

const MIN_ROW_HEIGHT = 50;
const ROW_SPACING = 5;

export default function AlertsList({
  overlayId,
  isPoppedOut,
  areTestAlertsHidden,
}) {
  const listRef = useRef({});
  const rowHeights = useRef({});

  const url = `/api/alerts?overlayId=${overlayId}`;
  const { data: allAlerts = [], isLoading } = useAPI(
    overlayId ? url : null,
    { refreshInterval: 15000 }
  );

  if (isLoading) {
    return (
      <div style={{ padding: "1em" }}>
        <p>Loading...</p>
      </div>
    );
  }

  const alerts = allAlerts.filter((alert) => {
    if (areTestAlertsHidden) {
      return !alert?.kofi_data?.isTest;
    }

    return true;
  });

  if (!alerts || alerts.length === 0) {
    return (
      <div style={{ padding: "1em" }}>
        <p>No alerts yet...</p>
      </div>
    );
  }

  function getRowHeight(index) {
    return rowHeights.current[index] + ROW_SPACING || MIN_ROW_HEIGHT;
  }

  function setRowHeight(index, size) {
    listRef.current.resetAfterIndex(0);
    rowHeights.current = { ...rowHeights.current, [index]: size };
  }

  function Row({ index, style }) {
    const alert = alerts[index];

    const rowRef = useRef({});

    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current.clientHeight);
      }
    }, [index, rowRef]);

    const { type, amount, currency, from_name, isTest, message } =
      alert.kofi_data;

    return (
      <div key={alert.id} style={style}>
        <div
          ref={rowRef}
          className={styles.AlertsListItem}
          style={{ minHeight: `${MIN_ROW_HEIGHT}px` }}
        >
          <div className={styles.AlertsListItemDetails}>
            <small
              className={classNames(
                styles.AlertsListItemDetailsType,
                {
                  [styles[
                    `AlertsListItemDetailsType--${type}`
                  ]]: true,
                }
              )}
            >
              {type}
            </small>
            {isTest && (
              <small
                className={classNames(
                  styles.AlertsListItemDetailsType,
                  {
                    [styles[`AlertsListItemDetailsType--test`]]: true,
                  }
                )}
              >
                Test
              </small>
            )}

            <span className={styles.AlertsListItemDetailsDate}>
              {formatDistance(
                new Date(alert.created_at),
                new Date(),
                {
                  addSuffix: true,
                }
              )}
            </span>
          </div>

          <div>
            <strong>
              {getMoney({ amount, currency }) || "Money"}
            </strong>{" "}
            from <strong>{from_name}</strong>
          </div>

          {message && (
            <div className={styles.AlertsListItemMessage}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          className={classNames(styles.AlertsList, {
            [styles["AlertsList--popped-out"]]: isPoppedOut,
          })}
          ref={listRef}
          height={height}
          itemCount={alerts.length}
          itemSize={getRowHeight}
          estimatedItemSize={MIN_ROW_HEIGHT}
          width={width}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}
