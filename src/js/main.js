import lines from './Lines';

// eslint-disable-next-line
import style from '../scss/main.scss';

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    lines.init();
  }
};
