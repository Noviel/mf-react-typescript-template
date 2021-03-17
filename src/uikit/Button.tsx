import React from 'react';

import styles from './button.module.css';

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {}

export function Button(props: ButtonProps): JSX.Element {
  return <button className={styles.button} {...props}></button>;
}
