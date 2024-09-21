// components/NavBar.tsx

'use client';

import Link from 'next/link';
import styles from './NavBar.module.css';

const NavBar = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navLinks}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/map">Map</Link>
        </li>
        <li>
          <Link href="/statistics">Statistics</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
