/**
 * EcoRuta — Frontend: renderizado de la escena en <canvas>.
 * Sólo dibuja: no contiene reglas de sensor/semáforo (eso vive en el backend).
 */
(function (global) {
  'use strict';

  const VIEW_W = 1200;
  const VIEW_H = 700;

  function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return {
      x:
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y:
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    };
  }

  function buildSmoothPath(waypoints, samplesPerSegment = 20) {
    const pts = [waypoints[0], ...waypoints, waypoints[waypoints.length - 1]];
    const out = [];
    for (let i = 0; i < pts.length - 3; i++) {
      for (let s = 0; s < samplesPerSegment; s++) {
        const t = s / samplesPerSegment;
        out.push(catmullRom(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], t));
      }
    }
    out.push(waypoints[waypoints.length - 1]);
    return out;
  }

  class PathTrack {
    constructor(waypoints) {
      this.points = buildSmoothPath(waypoints);
      this.cumLengths = [0];
      for (let i = 1; i < this.points.length; i++) {
        const a = this.points[i - 1];
        const b = this.points[i];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        this.cumLengths.push(this.cumLengths[i - 1] + d);
      }
      this.totalLength = this.cumLengths[this.cumLengths.length - 1];
    }

    /** fraction en [0,1] -> {x,y,angle} sobre la curva */
    pointAtFraction(fraction) {
      const target = Math.max(0, Math.min(1, fraction)) * this.totalLength;
      let lo = 0;
      let hi = this.cumLengths.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (this.cumLengths[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      const i = Math.max(1, lo);
      const d0 = this.cumLengths[i - 1];
      const d1 = this.cumLengths[i];
      const segT = d1 > d0 ? (target - d0) / (d1 - d0) : 0;
      const a = this.points[i - 1];
      const b = this.points[i];
      const x = a.x + (b.x - a.x) * segT;
      const y = a.y + (b.y - a.y) * segT;
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      return { x, y, angle };
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // --- geometría auxiliar para la animación de esquive (curva de Bézier) ---

  function quadBezierPoint(p0, c, p1, t) {
    const mt = 1 - t;
    return {
      x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p1.x,
      y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p1.y,
    };
  }

  function quadBezierAngle(p0, c, p1, t) {
    const mt = 1 - t;
    const dx = 2 * mt * (c.x - p0.x) + 2 * t * (p1.x - c.x);
    const dy = 2 * mt * (c.y - p0.y) + 2 * t * (p1.y - c.y);
    return Math.atan2(dy, dx);
  }

  // --- helpers de dibujo de obstáculos ---

  function drawStump(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#8a5a34';
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6b4223';
    ctx.lineWidth = 2.5;
    for (let ring = 1; ring <= 2; ring++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, (r * ring) / 3, (r * 0.62 * ring) / 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawStumpCluster(ctx, x, y) {
    const offsets = [
      [-34, -8, 20],
      [-3, -26, 16],
      [29, -5, 21],
      [-18, 18, 14],
      [16, 23, 17],
      [44, 16, 13],
    ];
    offsets.forEach(([dx, dy, r]) => drawStump(ctx, x + dx, y + dy, r));
  }

  function drawMud(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#5b4326';
    ctx.beginPath();
    ctx.ellipse(0, 0, 55, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.ellipse(-13, -7, 18, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMining(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // pozo oscuro
    ctx.fillStyle = '#3a2a1c';
    ctx.beginPath();
    ctx.ellipse(0, 8, 44, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    // carretilla
    ctx.fillStyle = '#6b3e1f';
    ctx.beginPath();
    ctx.moveTo(-29, -8);
    ctx.lineTo(13, -8);
    ctx.lineTo(3, 13);
    ctx.lineTo(-18, 13);
    ctx.closePath();
    ctx.fill();
    // oro
    ctx.fillStyle = '#f2b90c';
    const nuggets = [
      [-18, -16, 9],
      [-3, -21, 10],
      [10, -13, 8],
      [-8, -8, 8],
    ];
    nuggets.forEach(([nx, ny, nr]) => {
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    nuggets.forEach(([nx, ny, nr]) => {
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawSign(ctx, x, y, lines) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#8a5a34';
    ctx.fillRect(-4, 0, 8, 58);
    ctx.fillStyle = '#fdfaf3';
    const w = Math.max(...lines.map((l) => l.length)) * 8.6 + 26;
    const h = lines.length * 19 + 18;
    ctx.strokeStyle = '#c9bfa3';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h - 8, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2f2a20';
    ctx.font = '700 16px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, -h - 8 + 17 + i * 19 + 7);
    });
    ctx.restore();
  }

  class SceneRenderer {
    constructor(canvas, mission) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.mission = mission;
      this.track = new PathTrack(mission.waypoints);
      this.images = {};
      this._bobT = 0;
      this._fitToDevicePixelRatio();
    }

    /**
     * Renderiza el canvas a su resolución física real (width/height en
     * píxeles de dispositivo) para que se vea nítido en pantallas retina /
     * de alta densidad (la mayoría de teléfonos), en vez de dibujar a 1200x700
     * y dejar que el navegador lo estire, lo cual se ve borroso. El CSS sigue
     * controlando el tamaño visible (width:100%; height:auto); aquí sólo se
     * ajusta la resolución interna y se escala el contexto para que el resto
     * del código de dibujo siga usando las mismas coordenadas lógicas 1200x700.
     */
    _fitToDevicePixelRatio() {
      const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
      this.canvas.width = VIEW_W * dpr;
      this.canvas.height = VIEW_H * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    async loadAssets({ sendel, tronco }) {
      const [sendelImg, troncoImg] = await Promise.all([loadImage(sendel), loadImage(tronco)]);
      this.images.sendel = sendelImg;
      this.images.tronco = troncoImg;
    }

    fractionFor(posCm) {
      return posCm / this.mission.distanciaTotalCm;
    }

    pointAtCm(posCm) {
      return this.track.pointAtFraction(this.fractionFor(posCm));
    }

    /** Pixeles de pista por cada centímetro simulado (útil para escalar animaciones). */
    get pxPerCm() {
      return this.track.totalLength / this.mission.distanciaTotalCm;
    }

    /**
     * Calcula un arco (curva de Bézier cuadrática) que va de `fromCm` a `toCm`
     * desviándose hacia un lado (side = 1 | -1) para "rodear" un obstáculo en
     * vez de pasar por encima de él.
     */
    computeDodgeArc(fromCm, toCm, side = 1, amplitude = 70) {
      const pFrom = this.pointAtCm(fromCm);
      const pTo = this.pointAtCm(toCm);
      const mid = { x: (pFrom.x + pTo.x) / 2, y: (pFrom.y + pTo.y) / 2 };
      const dx = pTo.x - pFrom.x;
      const dy = pTo.y - pFrom.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const control = { x: mid.x + nx * amplitude * side, y: mid.y + ny * amplitude * side };
      return { pFrom, control, pTo };
    }

    /** Punto {x,y,angle} sobre un arco calculado con computeDodgeArc, en t=[0,1]. */
    sampleDodgeArc(arc, t) {
      const p = quadBezierPoint(arc.pFrom, arc.control, arc.pTo, t);
      const angle = quadBezierAngle(arc.pFrom, arc.control, arc.pTo, t);
      return { x: p.x, y: p.y, angle };
    }

    draw(state, opts = {}) {
      const { ctx } = this;
      this._bobT += 0.12;
      ctx.clearRect(0, 0, VIEW_W, VIEW_H);
      this._drawBackground();
      this._drawMountains();
      this._drawPath();
      this._drawSigns();
      this._drawObstacles();
      if (!opts.hideCone) this._drawSensorCone(state, opts);
      this._drawSendel(state, opts);
    }

    _drawBackground() {
      const { ctx } = this;
      const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      sky.addColorStop(0, '#bfe6c8');
      sky.addColorStop(1, '#8fcf9d');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      ctx.fillStyle = 'rgba(60, 110, 70, 0.35)';
      const clumps = [
        [75, 50, 88],
        [225, 25, 69],
        [1075, 38, 81],
        [38, 375, 63],
        [1138, 375, 75],
        [50, 625, 75],
      ];
      clumps.forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    /** Telón de fondo de tepuyes (mesetas) cerca de la meta, estilo Canaima. */
    _drawMountains() {
      const end = this.track.pointAtFraction(1);
      const baseY = Math.min(VIEW_H - 40, end.y + 70);
      const cx = Math.max(200, Math.min(VIEW_W - 200, end.x - 20));
      this._drawTepuy(cx - 160, baseY, 210, 185, '#bcd2d5', '#9ab5b1', false);
      this._drawTepuy(cx + 140, baseY + 15, 180, 150, '#a9c6bd', '#87ab9c', false);
      this._drawTepuy(cx - 10, baseY, 240, 235, '#8fae93', '#5f7f68', true);
    }

    _drawTepuy(cx, baseY, width, height, colorTop, colorBase, withWaterfall) {
      const { ctx } = this;
      const topW = width * 0.5;
      const peakY = baseY - height;
      ctx.save();
      const grad = ctx.createLinearGradient(0, peakY, 0, baseY);
      grad.addColorStop(0, colorTop);
      grad.addColorStop(1, colorBase);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx - width / 2, baseY);
      ctx.lineTo(cx - topW / 2, peakY);
      ctx.lineTo(cx + topW / 2, peakY);
      ctx.lineTo(cx + width / 2, baseY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * width * 0.12, peakY + height * 0.15);
        ctx.lineTo(cx + i * width * 0.16, baseY);
        ctx.stroke();
      }

      if (withWaterfall) {
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + width * 0.1, peakY + height * 0.12);
        ctx.lineTo(cx + width * 0.06, baseY - height * 0.12);
        ctx.stroke();
      }
      ctx.restore();
    }

    _drawPath() {
      const { ctx, track } = this;
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(70,50,25,0.18)';
      ctx.lineWidth = 70;
      this._strokePath(ctx, track.points);

      ctx.strokeStyle = '#d9c08f';
      ctx.lineWidth = 60;
      this._strokePath(ctx, track.points);

      ctx.setLineDash([18, 18]);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 3;
      this._strokePath(ctx, track.points);
      ctx.setLineDash([]);
      ctx.restore();
    }

    _strokePath(ctx, points) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }

    _drawSigns() {
      const start = this.track.pointAtFraction(0);
      const end = this.track.pointAtFraction(1);
      drawSign(this.ctx, start.x - 13, start.y + 38, [this.mission.inicioLabel]);
      const metaLines = this.mission.metaLabel.split(' ').reduce((lines, word) => {
        const last = lines[lines.length - 1];
        if (last && (last + ' ' + word).length <= 14) lines[lines.length - 1] = last + ' ' + word;
        else lines.push(word);
        return lines;
      }, []);
      drawSign(this.ctx, end.x - 88, end.y - 13, metaLines);
    }

    _drawObstacles() {
      this.mission.obstaculos.forEach((o) => {
        const p = this.track.pointAtFraction(this.fractionFor(o.posicionCm));
        this.ctx.save();
        if (o.esquivado) this.ctx.globalAlpha = 0.35;
        switch (o.tipo) {
          case 'tocones':
            drawStumpCluster(this.ctx, p.x, p.y - 8);
            break;
          case 'lodo':
            drawMud(this.ctx, p.x, p.y + 5);
            break;
          case 'mineria':
            drawMining(this.ctx, p.x, p.y);
            break;
          case 'tronco':
            if (this.images.tronco) {
              const img = this.images.tronco;
              const w = 170;
              const h = (img.height / img.width) * w;
              this.ctx.translate(p.x, p.y);
              this.ctx.rotate(p.angle * 0.15);
              this.ctx.drawImage(img, -w / 2, -h / 2, w, h);
            }
            break;
          default:
            break;
        }
        this.ctx.restore();
      });
    }

    _drawSensorCone(state, opts) {
      if (!state || !state.objetivo) return;
      const { ctx, track } = this;
      const from = track.pointAtFraction(this.fractionFor(opts.posicionCm ?? state.posicionCm));
      const to = track.pointAtFraction(this.fractionFor(state.objetivo.posicionCm));
      const colors = {
        VERDE: 'rgba(46, 196, 106, 0.28)',
        AMARILLO: 'rgba(240, 180, 20, 0.32)',
        ROJO: 'rgba(226, 60, 60, 0.38)',
      };
      ctx.save();
      ctx.strokeStyle = colors[state.estado] || colors.VERDE;
      ctx.lineWidth = 13;
      ctx.setLineDash([5, 13]);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y - 23);
      ctx.lineTo(to.x, to.y - 13);
      ctx.stroke();
      ctx.restore();
    }

    _drawSendel(state, opts) {
      const img = this.images.sendel;
      if (!img) return;
      let p;
      if (opts.customPoint) {
        p = opts.customPoint;
      } else {
        const posCm = opts.posicionCm ?? state.posicionCm;
        p = this.track.pointAtFraction(this.fractionFor(posCm));
      }
      const bob = opts.moving ? Math.sin(this._bobT) * 6 : Math.sin(this._bobT * 0.4) * 1.6;
      const w = 165;
      const h = (img.height / img.width) * w;
      const { ctx } = this;
      ctx.save();
      ctx.fillStyle = 'rgba(30,30,20,0.25)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 8, w * 0.32, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(p.x, p.y - h * 0.62 + bob);
      if (opts.facing === 'left') ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }

  global.EcoRuta = global.EcoRuta || {};
  global.EcoRuta.Frontend = global.EcoRuta.Frontend || {};
  global.EcoRuta.Frontend.SceneRenderer = SceneRenderer;
  global.EcoRuta.Frontend.VIEW_W = VIEW_W;
  global.EcoRuta.Frontend.VIEW_H = VIEW_H;
})(window);
