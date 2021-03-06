import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import classNames from "classnames";

import { useTheme } from "../ThemeProvider/ThemeProvider.js";
import { useUser } from "../UserProvider/UserProvider.js";
import Button from "../Button/Button.js";
import Logo from "../Logo/Logo.js";

import styles from "./Navigation.module.css";

export default function Navigation() {
  const router = useRouter();
  const { theme, setTheme, isDarkMode } = useTheme();
  const { isLoading } = useUser();

  const handleThemeChange = (event) => {
    event.preventDefault();

    const newTheme = event.target.value;
    if (newTheme) {
      setTheme(newTheme);
    }
  };

  return (
    <nav className={styles.Nav}>
      <h1 className={styles.NavTitle}>
        <Logo isSmall />
      </h1>

      <ul className={styles.NavList}>
        {[
          { url: "/getting-started", text: "Getting Started" },
          { url: "/dashboard", text: "Dashboard" },
          { url: "/settings", text: "Settings" },
        ].map(({ url, text }, index) => {
          return (
            <li
              className={classNames(styles.NavListItem, {
                [styles.NavListItemActive]: router.pathname === url,
              })}
              key={index}
            >
              <Link href={url}>{text}</Link>
            </li>
          );
        })}
      </ul>

      {!isLoading && (
        <div className={styles.NavUserInfo}>
          <Link href="/logout" passHref>
            <Button isSmall isSecondary>
              Logout
            </Button>
          </Link>
        </div>
      )}

      <div className={styles.NavBottom}>
        <div>
          <label htmlFor="can-play-sounds">Theme</label>
          <select
            id="can-play-sounds"
            name="can-play-sounds"
            onChange={handleThemeChange}
            value={theme}
          >
            <option value="system">
              System ({isDarkMode ? "Dark" : "Light"})
            </option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            );
          </select>
        </div>

        <a
          className={classNames(
            styles.NavSupport,
            styles["NavSupport--discord"]
          )}
          href="https://discord.gg/D4T25jyCRU"
        >
          <Image
            className={styles.NavSupportIcon}
            src="/discord-logo.png"
            alt=""
            width="30"
            height="30"
          />
          Need help? Feedback?
          <br /> Let Zac know on Discord
        </a>

        <a
          className={classNames(
            styles.NavSupport,
            styles["NavSupport--ko-fi"]
          )}
          href="https://ko-fi.com/zactopus"
        >
          <Image
            className={styles.NavSupportIcon}
            src="/ko-fi-logo-cup.png"
            alt=""
            width="30"
            height="30"
          />
          Support zactopus on Ko-fi
        </a>
      </div>
    </nav>
  );
}
