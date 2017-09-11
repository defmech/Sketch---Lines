  const easeIn = p => t => Math.pow(t, p);
  const easeOut = p => t => (1 - Math.abs(Math.pow(t - 1, p)));
  const easeInOut = p => t => t < 0.5 ? easeIn(p)(t * 2) / 2 : (easeOut(p)((t * 2) - 1) / 2) + 0.5;


  export default class Easing {
    static get easeIn() {
      return easeIn;
    }

    static get easeOut() {
      return easeOut;
    }

    static get easeInOut() {
      return easeInOut;
    }


    // no easing, no acceleration
    static linear(t) {
        return t;
      }
      // accelerating from zero velocity
    static easeInQuad(t) {
        return t * t;
      }
      // decelerating to zero velocity
    static easeOutQuad(t) {
        return t * (2 - t);
      }
      // acceleration until halfway, then deceleration
    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }
      // accelerating from zero velocity
    static easeInCubic(t) {
        return t * t * t;
      }
      // decelerating to zero velocity
    static easeOutCubic(t) {
        return (--t) * t * t + 1;
      }
      // acceleration until halfway, then deceleration
    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      }
      // accelerating from zero velocity
    static easeInQuart(t) {
        return t * t * t * t;
      }
      // decelerating to zero velocity
    static easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
      }
      // acceleration until halfway, then deceleration
    static easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
      }
      // accelerating from zero velocity
    static easeInQuint(t) {
        return t * t * t * t * t;
      }
      // decelerating to zero velocity
    static easeOutQuint(t) {
        return 1 + (--t) * t * t * t * t;
      }
      // acceleration until halfway, then deceleration
    static easeInOutQuint(t) {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
    }

  }
