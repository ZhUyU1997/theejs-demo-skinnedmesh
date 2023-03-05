// export default function (x1, x2, r1, y1, y2, r2) {
//   const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
//   const base = 1/2 * (x1 + x2)
// }

// https://gist.github.com/jupdike/bfe5eb23d1c395d8a0a1a4ddd94882ac
export default intersectTwoCircles(x1,y1,r1, x2,y2,r2) {
  var centerdx = x1 - x2;
  var centerdy = y1 - y2;
  var R = Math.sqrt(centerdx * centerdx + centerdy * centerdy);
  if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2)) { // no intersection
    return []; // empty list of results
  }
  // intersection(s) should exist

  var R2 = R*R;
  var R4 = R2*R2;
  var a = (r1*r1 - r2*r2) / (2 * R2);
  var r2r2 = (r1*r1 - r2*r2);
  var c = Math.sqrt(2 * (r1*r1 + r2*r2) / R2 - (r2r2 * r2r2) / R4 - 1);

  var fx = (x1+x2) / 2 + a * (x2 - x1);
  var gx = c * (y2 - y1) / 2;
  var ix1 = fx + gx;
  var ix2 = fx - gx;

  var fy = (y1+y2) / 2 + a * (y2 - y1);
  var gy = c * (x1 - x2) / 2;
  var iy1 = fy + gy;
  var iy2 = fy - gy;

  // note if gy == 0 and gx == 0 then the circles are tangent and there is only one solution
  // but that one solution will just be duplicated as the code is currently written
  return [[ix1, iy1], [ix2, iy2]];
}
