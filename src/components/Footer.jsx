import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>
        &copy; Made in {new Date().getFullYear()} by Youssef Hikal 💚
      </p>
    </footer>
  );
}

export default Footer;
