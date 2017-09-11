export default class MathUtil {

  // Calculates the greatest common divisor of two integers.
  static gcd(a, b) {
    return (b === 0) ? a : MathUtil.gcd(b, a % b);
  }

  // Calculates a random number that is biased towards a certain value.
  // influence should value between 0.0 and 1.0
  static getRndBias(min, max, bias, influence) {
    const rnd = (Math.random() * (max - min)) + min; // random in range
    const mix = Math.random() * influence; // random mixer
    return rnd * (1 - mix) + bias * mix; // mix full range and bias
  }

  static norm(value, min, max) {
    return (value - min) / (max - min);
  };

  static lerp(norm, min, max) {
    return (max - min) * norm + min;
  };

  static map(value, sourceMin, sourceMax, destMin, destMax) {
    return this.lerp(this.norm(value, sourceMin, sourceMax), destMin, destMax);
  };

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  static distance(p0, p1) {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;

    return Math.sqrt(dx * dx + dy * dy);
  };

  static angleBetweenPointsInRad(p0, p1) {
    return Math.atan2(p1.y - p0.y, p1.x - p0.x);
  };

  static radToDeg(rad) {
    return rad * 180 / Math.PI;
  };

  static degToRad(deg) {
    return deg * Math.PI / 180;
  };

  static randomRange(min, max) {
    return min + Math.random() * (max - min);
  };

  static randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  };

  static vec3FromLatLong(latLon, radius) {
    const phi = (90 - latLon.latitude) * (Math.PI / 180);
    const theta = (latLon.longitude + 180) * (Math.PI / 180);

    const x = -((radius) * Math.sin(phi) * Math.cos(theta));
    const z = ((radius) * Math.sin(phi) * Math.sin(theta));
    const y = ((radius) * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
  }

  static getRandomPositionOnSphere(radius) {
    let pos = new THREE.Vector3();
    pos.x = THREE.Math.randFloat(-100, 100);
    pos.y = THREE.Math.randFloat(-100, 100);
    pos.z = THREE.Math.randFloat(-100, 100);

    pos.setLength(radius);

    return pos;
  }

  static getPointInBetweenByPerc(pointA, pointB, percentage) {

    let dir = pointB.clone().sub(pointA);
    const len = dir.length();
    dir = dir.normalize().multiplyScalar(len * percentage);
    return pointA.clone().add(dir);

  }

  static getArcLength(v1, v2, radius) {
    // Need to make sure vectors are mapped to a consistent radius
    // this makes for inconsistent times when zoom/dolly has been used
    // but good enough for timing an animation
    const v1Clone = v1.clone().setLength(radius);
    const v2Clone = v2.clone().setLength(radius);

    return radius * Math.acos(v1Clone.dot(v2Clone) / (radius * radius))
  }

  static getPointsAlongArc(v1, v2, howMany = 20) {

    const to = new THREE.Spherical();
    to.setFromVector3(v2);

    const from = new THREE.Spherical();
    from.setFromVector3(v1);

    const deltaRadius = to.radius - from.radius;
    const deltaPhi = to.phi - from.phi;
    const deltaTheta = to.theta - from.theta;

    let spherical = new THREE.Spherical();
    let point = new THREE.Vector3();

    const points = [];

    const loopLength = howMany - 1;

    for (var i = 0; i < loopLength; i++) {
      spherical.radius = from.radius + ((deltaRadius / loopLength) * i);
      spherical.phi = from.phi + ((deltaPhi / loopLength) * i);
      spherical.theta = from.theta + ((deltaTheta / loopLength) * i);

      point.setFromSpherical(spherical);

      points.push(point.clone());
    }

    points.push(v2.clone()); // Add in endpoint

    console.log('MathUtils.js', 'points.length', points.length);

    return points;
  }

  static round(value, step) {
    step || (step = 1.0);
    var inv = 1.0 / step;
    return Math.round(value * inv) / inv;
  }
}
